"use server";

import { prisma } from "./prisma";

export async function getProductionTemplateById(id: string) {
  try {
    const template = await prisma.productionTemplate.findUnique({
      where: { id },
      include: {
        ingredients: true,
        flows: {
          include: { recipe: true }
        }
      }
    });
    return { success: true, template };
  } catch (error) {
    console.error("Failed to fetch template by id:", error);
    return { success: false, error: "Failed to fetch production template" };
  }
}

export async function deleteProductionTemplate(id: string) {
  try {
    await prisma.productionTemplate.delete({
      where: { id }
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to delete template:", error);
    return { success: false, error: "Failed to delete production template" };
  }
}
