import { prisma } from "@/app/lib/prisma";
import { ContainerType, LogActionType } from "@prisma/client";
import { revalidatePath } from "next/cache";

// --- HELPERS ---

// Helper to generate the 11-digit code: prefix (3) + itemSequence (3) + actionFreq (5)
async function generateUniqueCode(itemId: string, actionType: LogActionType, prefix: string) {
  const item = await prisma.inventoryItem.findUnique({ where: { id: itemId } });
  if (!item) throw new Error("Item not found");

  const itemSeq = String(item.itemSequenceCode).padStart(3, '0');
  
  const actionCount = await prisma.inventoryLog.count({
    where: { itemId, actionType }
  });
  
  const freqSeq = String(actionCount + 1).padStart(5, '0');
  
  return `${prefix}${itemSeq}${freqSeq}`;
}

// --- QUERIES ---

export async function getInventory() {
  const items = await prisma.inventoryItem.findMany({
    include: {
      containers: true,
    },
    orderBy: { name: 'asc' }
  });

  return items.map((item: any) => {
    let activeStock = 0;
    let reserveStock = 0;
    
    item.containers.forEach((c: any) => {
      if (c.type === 'ACTIVE') activeStock += c.amount;
      else if (c.type === 'RESERVE') reserveStock += c.amount;
    });

    return {
      id: item.id,
      name: item.name,
      stock: activeStock + reserveStock,
      unit: item.unit,
      status: item.status,
      lastAudit: item.lastAudit.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    };
  });
}

export async function getInventoryItem(id: string) {
  const item = await prisma.inventoryItem.findUnique({
    where: { id },
    include: {
      containers: { orderBy: { name: 'asc' } },
      logs: { orderBy: { createdAt: 'desc' } }
    }
  });

  if (!item) throw new Error("Item not found");

  const active = item.containers.filter((c: any) => c.type === 'ACTIVE');
  const reserve = item.containers.filter((c: any) => c.type === 'RESERVE');
  const unassigned = item.containers.filter((c: any) => c.type === 'UNASSIGNED');

  const activeTotal = active.reduce((sum: number, c: any) => sum + c.amount, 0);
  const reserveTotal = reserve.reduce((sum: number, c: any) => sum + c.amount, 0);

  return {
    ...item,
    activeStock: { total: activeTotal, containers: active },
    reserveStock: { total: reserveTotal, cabinets: reserve },
    unassignedContainers: unassigned, // For the assign screen
    totalStock: activeTotal + reserveTotal
  };
}

// --- MUTATIONS ---

export async function addInventoryItem(name: string, unit: string = "gr") {
  const item = await prisma.inventoryItem.create({
    data: {
      name,
      unit,
      status: "ok"
    }
  });
  revalidatePath("/");
  return item;
}

export async function updateItemSettings(itemId: string, name: string, unit: string) {
  const res = await prisma.inventoryItem.update({
    where: { id: itemId },
    data: { name, unit }
  });
  revalidatePath("/");
  return res;
}

export async function addContainer(itemId: string, name: string, type: ContainerType) {
  const res = await prisma.inventoryContainer.create({
    data: { itemId, name, type, amount: 0 }
  });
  revalidatePath("/");
  return res;
}

export async function deleteContainer(containerId: string) {
  const res = await prisma.inventoryContainer.delete({
    where: { id: containerId }
  });
  revalidatePath("/");
  return res;
}

// Action: Stock Adjustment (SAI)
export async function adjustStock(
  itemId: string, 
  containerId: string, 
  type: "add" | "subtract", 
  amount: number, 
  reason: string, 
  notes?: string
) {
  const container = await prisma.inventoryContainer.findUnique({ where: { id: containerId } });
  if (!container) throw new Error("Container not found");

  const uniqueCode = await generateUniqueCode(itemId, LogActionType.STOCK_ADJUSTMENT, "SAI");
  const newAmount = type === "add" ? container.amount + amount : Math.max(0, container.amount - amount);

  // Parse reason to human readable
  const reasonText = reason === 'miscount_correction' ? "miscount corrected" : reason;
  const actionText = type === "add" ? "Added" : "Subtracted";
  const item = await prisma.inventoryItem.findUnique({ where: { id: itemId }});
  const unit = item?.unit || "";

  await prisma.$transaction([
    prisma.inventoryContainer.update({
      where: { id: containerId },
      data: { amount: newAmount }
    }),
    prisma.inventoryLog.create({
      data: {
        itemId,
        uniqueCode,
        actionType: LogActionType.STOCK_ADJUSTMENT,
        title: `${actionText} ${amount}${unit} — ${reasonText}:`,
        locationInfo: `From '${container.name} (${container.type === "ACTIVE" ? "Active" : "Reserve"})'`,
        referenceInfo: `From Stock Adjustment: ${uniqueCode}`
      }
    }),
    // Update last audit
    prisma.inventoryItem.update({
      where: { id: itemId },
      data: { lastAudit: new Date() }
    })
  ]);

  revalidatePath("/");
  return uniqueCode;
}

// Action: Move Stock (MSI)
export async function moveStock(
  itemId: string,
  fromContainerName: string,
  toContainerName: string,
  amount: number
) {
  // We use name here because the UI select passes the name, though passing IDs is better.
  // For safety, assuming names are unique per item.
  const containers = await prisma.inventoryContainer.findMany({ where: { itemId } });
  const fromC = containers.find((c: any) => c.name === fromContainerName);
  const toC = containers.find((c: any) => c.name === toContainerName);

  if (!fromC || !toC) throw new Error("Containers not found");

  const uniqueCode = await generateUniqueCode(itemId, LogActionType.MOVE_STOCK, "MSI");
  const item = await prisma.inventoryItem.findUnique({ where: { id: itemId }});

  await prisma.$transaction([
    prisma.inventoryContainer.update({
      where: { id: fromC.id },
      data: { amount: Math.max(0, fromC.amount - amount) }
    }),
    prisma.inventoryContainer.update({
      where: { id: toC.id },
      data: { amount: toC.amount + amount }
    }),
    prisma.inventoryLog.create({
      data: {
        itemId,
        uniqueCode,
        actionType: LogActionType.MOVE_STOCK,
        title: `Moved ${amount}${item?.unit || ''}`,
        locationInfo: `From '${fromC.name} (${fromC.type})' to '${toC.name} (${toC.type})'`,
        referenceInfo: `From Move Stock: ${uniqueCode}`
      }
    })
  ]);

  revalidatePath("/");
  return uniqueCode;
}

// Action: Buy Stock (BSI)
export async function buyStock(
  itemId: string,
  amount: number,
  price: number,
  toContainerName: string // 'unassigned' or a name
) {
  const uniqueCode = await generateUniqueCode(itemId, LogActionType.BUY_STOCK, "BSI");
  const item = await prisma.inventoryItem.findUnique({ where: { id: itemId }});
  const unit = item?.unit || '';

  // Handle unassigned routing vs existing container
  let targetContainerId: string;
  let locationInfo: string;

  if (toContainerName === "unassigned") {
    // Create a temporary unassigned container to track this batch
    const newContainer = await prisma.inventoryContainer.create({
      data: {
        itemId,
        name: `Purchased ${amount}${unit}:`, // Useful for UI listing
        type: "UNASSIGNED",
        amount: amount
      }
    });
    targetContainerId = newContainer.id;
    locationInfo = "Assigned to 'Unassigned'";
    await prisma.inventoryItem.update({ where: { id: itemId }, data: { status: "needs_assignment" }});
  } else {
    const c = await prisma.inventoryContainer.findFirst({
      where: { itemId, name: toContainerName }
    });
    if (!c) throw new Error("Target container not found");
    targetContainerId = c.id;
    locationInfo = `Assigned to '${c.name}'`;
    await prisma.inventoryContainer.update({
      where: { id: targetContainerId },
      data: { amount: c.amount + amount }
    });
  }

  await prisma.inventoryLog.create({
    data: {
      itemId,
      uniqueCode,
      actionType: LogActionType.BUY_STOCK,
      title: `Purchased ${amount}${unit}:`,
      locationInfo: locationInfo,
      referenceInfo: `From Buy Stock: ${uniqueCode}`
    }
  });

  revalidatePath("/");
  return uniqueCode;
}

// Action: Assign Stock (ASI)
export async function assignStock(
  itemId: string,
  unassignedContainerId: string, // The temporary unassigned box
  targetContainerName: string
) {
  const unassigned = await prisma.inventoryContainer.findUnique({ where: { id: unassignedContainerId } });
  const target = await prisma.inventoryContainer.findFirst({ where: { itemId, name: targetContainerName }});
  const item = await prisma.inventoryItem.findUnique({ where: { id: itemId } });

  if (!unassigned || !target) throw new Error("Containers not found");

  const uniqueCode = await generateUniqueCode(itemId, LogActionType.ASSIGN_STOCK, "ASI");

  await prisma.$transaction([
    // Add to target
    prisma.inventoryContainer.update({
      where: { id: target.id },
      data: { amount: target.amount + unassigned.amount }
    }),
    // Delete the unassigned container since it's now cleared
    prisma.inventoryContainer.delete({
      where: { id: unassignedContainerId }
    }),
    prisma.inventoryLog.create({
      data: {
        itemId,
        uniqueCode,
        actionType: LogActionType.ASSIGN_STOCK,
        title: `Assigned ${unassigned.amount}${item?.unit || ''}`,
        locationInfo: `From 'Unassigned' to '${target.name}'`,
        referenceInfo: `From Assign Stock: ${uniqueCode}`
      }
    })
  ]);

  // Check if any unassigned remain to toggle status back to ok
  const remaining = await prisma.inventoryContainer.count({
    where: { itemId, type: "UNASSIGNED" }
  });
  if (remaining === 0) {
    await prisma.inventoryItem.update({ where: { id: itemId }, data: { status: "ok" }});
  }

  revalidatePath("/");
  return uniqueCode;
}

export async function deleteInventoryItem(itemId: string) {
  const res = await prisma.inventoryItem.delete({
    where: { id: itemId }
  });
  revalidatePath("/");
  return res;
}
