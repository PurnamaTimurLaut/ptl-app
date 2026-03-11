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
    // Due to cascading deletes based on Prisma configuration, deleting the template should clean up flows and ingredients.
    // If cascade is not configured, we'd delete them manually first.
    await prisma.productionTemplate.delete({
      where: { id }
    });
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete template:", error);
    return { success: false, error: 'Failed to delete template: ' + (error.message || 'Unknown error') };
  }
}

export async function getCookingRecipes() {
  try {
    const recipes = await prisma.cookingRecipe.findMany();
    return { success: true, recipes };
  } catch (error: any) {
    return { success: false, error: "Failed to fetch recipes" };
  }
}

export async function deleteCookingRecipe(id: string) {
  try {
    await prisma.cookingRecipe.delete({
      where: { id }
    });
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete recipe:", error);
    return { success: false, error: 'Failed to delete recipe: ' + (error.message || 'Unknown error') };
  }
}
