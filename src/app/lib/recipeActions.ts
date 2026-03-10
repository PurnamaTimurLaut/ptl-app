"use server";

import { prisma } from "./prisma";

export async function getRecipes() {
  try {
    const recipes = await prisma.menuRecipe.findMany({
      include: {
        ingredients: true,
        steps: {
          orderBy: { order: 'asc' }
        }
      }
    });
    return { success: true, recipes };
  } catch (error) {
    console.error("Failed to fetch recipes:", error);
    return { success: false, error: "Failed to fetch recipes" };
  }
}

export async function getRecipeById(id: string) {
  try {
    const recipe = await prisma.menuRecipe.findUnique({
      where: { id },
      include: {
        ingredients: true,
        steps: {
          orderBy: { order: 'asc' }
        }
      }
    });
    return { success: true, recipe };
  } catch (error) {
    console.error("Failed to fetch recipe:", error);
    return { success: false, error: "Failed to fetch recipe" };
  }
}

export async function createRecipe(data: { name: string; description?: string }) {
  try {
    const recipe = await prisma.menuRecipe.create({
      data
    });
    return { success: true, recipe };
  } catch (error) {
    console.error("Failed to create recipe:", error);
    return { success: false, error: "Failed to create recipe (might be duplicate name)" };
  }
}

export async function updateRecipe(id: string, data: { name: string; description?: string }) {
  try {
    const recipe = await prisma.menuRecipe.update({
      where: { id },
      data
    });
    return { success: true, recipe };
  } catch (error) {
    console.error("Failed to update recipe:", error);
    return { success: false, error: "Failed to update recipe" };
  }
}

export async function addIngredient(recipeId: string, data: { name: string; quantity: number; unit: string }) {
  try {
    const ingredient = await prisma.ingredient.create({
      data: {
        recipeId,
        ...data
      }
    });
    return { success: true, ingredient };
  } catch (error) {
    console.error("Failed to add ingredient:", error);
    return { success: false, error: "Failed to add ingredient" };
  }
}

export async function removeIngredient(ingredientId: string) {
  try {
    await prisma.ingredient.delete({
      where: { id: ingredientId }
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to remove ingredient:", error);
    return { success: false, error: "Failed to remove ingredient" };
  }
}

export async function addStep(recipeId: string, data: { order: number; instruction: string }) {
  try {
    const step = await prisma.executionStep.create({
      data: {
        recipeId,
        ...data
      }
    });
    return { success: true, step };
  } catch (error) {
    console.error("Failed to add step:", error);
    return { success: false, error: "Failed to add step" };
  }
}

export async function removeStep(stepId: string) {
  try {
    await prisma.executionStep.delete({
      where: { id: stepId }
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to remove step:", error);
    return { success: false, error: "Failed to remove step" };
  }
}
