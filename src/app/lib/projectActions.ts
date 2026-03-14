"use server"

import { prisma } from '@/app/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createProject(data: {
  name: string
  startDate: string
  endDate: string
  budget: number | string
  productions: {
    menuId: string
    quantity: number | string
    assignedDate: string
    deadlineDate: string
  }[]
}) {
  try {
    // 1. Generate Project Code (PRxxxx)
    const projectCount = await prisma.project.count();
    const nextProjectNumber = projectCount + 1;
    const projectCode = `PR${String(nextProjectNumber).padStart(4, '0')}`;

    // 2. Fetch templates for productions to get shortCodes
    const templateIds = data.productions.map(p => p.menuId);
    const templates = await prisma.productionTemplate.findMany({
      where: { id: { in: templateIds } }
    });

    const parsedBudget = typeof data.budget === 'string' ? parseFloat(data.budget) : data.budget;
    
    const project = await prisma.project.create({
      data: {
        name: data.name,
        projectCode,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        budget: isNaN(parsedBudget) ? 0 : parsedBudget,
        status: "RUNNING", // Always set to RUNNING upon creation as per request
        productions: {
          create: data.productions.map(p => {
const template = templates.find((t: any) => t.id === p.menuId);
            const shortCode = template?.shortCode || "UNKN";
            const productionCode = `${shortCode}${projectCode}`;
            const parsedQuantity = typeof p.quantity === 'string' ? parseInt(p.quantity, 10) : p.quantity;
            
            return {
              menuId: p.menuId,
              productionCode,
              quantity: isNaN(parsedQuantity) ? 0 : parsedQuantity,
              assignedDate: new Date(p.assignedDate),
              deadlineDate: new Date(p.deadlineDate)
            }
          })
        }
      }
    })
    revalidatePath('/')
    return { success: true, project }
  } catch (error: any) {
    console.error("Failed to create project. Prisma Error:", error?.message || error)
    return { success: false, error: "Failed to create project" }
  }
}

export async function getNextProjectCode() {
  try {
    const projectCount = await prisma.project.count();
    const nextProjectNumber = projectCount + 1;
    return `PR${String(nextProjectNumber).padStart(4, '0')}`;
  } catch (error) {
    return "PR0001";
  }
}

export async function getProjects() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        productions: {
          include: {
            ProductionTemplate: true
          }
        },
        _count: {
          select: { productions: true }
        }
      }
    })
    return { success: true, projects }
  } catch (error) {
    console.error("Failed to fetch projects:", error)
    return { success: false, projects: [] }
  }
}

export async function getProjectById(id: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: { 
        productions: {
          include: {
            ProductionTemplate: true
          }
        } 
      }
    })
    return { success: true, project }
  } catch (error) {
    console.error("Failed to fetch project:", error)
    return { success: false, project: null }
  }
}

export async function updateProjectStatus(id: string, status: "COMPLETED" | "CANCELLED") {
  try {
    if (status === "CANCELLED") {
      const [project] = await prisma.$transaction([
        prisma.project.update({
          where: { id },
          data: { status }
        }),
        prisma.production.updateMany({
          where: { projectId: id },
          data: { status: "CANCELLED" }
        })
      ]);
      revalidatePath('/')
      return { success: true, project }
    } else {
      const project = await prisma.project.update({
        where: { id },
        data: { status }
      })
      revalidatePath('/')
      return { success: true, project }
    }
  } catch (error) {
    console.error("Failed to update project status:", error)
    return { success: false, error: "Failed to update project" }
  }
}

export async function updateProjectDetails(id: string, data: {
  name: string
  startDate: string
  endDate: string
  budget: number
}) {
  try {
    const project = await prisma.project.update({
      where: { id },
      data: {
        name: data.name,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        budget: data.budget,
      }
    })
    revalidatePath('/')
    return { success: true, project }
  } catch (error) {
    console.error("Failed to update project:", error)
    return { success: false, error: "Failed to update project" }
  }
}

export async function getProductionById(id: string) {
  try {
    const production = await prisma.production.findUnique({
      where: { id },
      include: {
        project: true,
        ProductionTemplate: {
          include: {
            flows: { include: { recipe: true } },
            ingredients: true
          }
        }
      }
    });
    return { success: true, production };
  } catch (error) {
    console.error("Failed to find production:", error);
    return { success: false, error: "Failed to find production" };
  }
}

