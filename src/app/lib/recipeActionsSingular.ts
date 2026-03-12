"use server";

import { revalidatePath } from "next/cache";
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
    await prisma.productionTemplate.delete({ where: { id } });
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete template:", error);
    return { success: false, error: 'Failed to delete template: ' + (error.message || 'Unknown error') };
  }
}

export async function updateProductionTemplateName(id: string, name: string) {
  try {
    await prisma.productionTemplate.update({ where: { id }, data: { name } });
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
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
    await prisma.cookingRecipe.delete({ where: { id } });
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete recipe:", error);
    return { success: false, error: 'Failed to delete recipe: ' + (error.message || 'Unknown error') };
  }
}

export async function updateCookingRecipe(id: string, instructions: string) {
  try {
    await prisma.cookingRecipe.update({ where: { id }, data: { instructions } });
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateTemplateIngredient(id: string, data: { name: string; quantity: number; unit: string }) {
  try {
    await prisma.templateIngredient.update({ where: { id }, data });
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateTemplateFlow(id: string, name: string) {
  try {
    await prisma.templateExecutionFlow.update({ where: { id }, data: { name } });
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
