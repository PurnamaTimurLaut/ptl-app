"use server";

import { prisma } from "./prisma";

// =====================================
// PRODUCTION TEMPLATES
// =====================================

export async function getProductionTemplates() {
  try {
    const templates = await prisma.productionTemplate.findMany({
      include: {
        ingredients: true,
        flows: {
          include: { recipe: true }
        }
      }
    });
    return { success: true, templates };
  } catch (error) {
    console.error("Failed to fetch templates:", error);
    return { success: false, error: "Failed to fetch production templates" };
  }
}

export async function createProductionTemplate(data: { name: string }) {
  try {
    const template = await prisma.productionTemplate.create({ data });
    return { success: true, template };
  } catch (error) {
    console.error("Failed to create template:", error);
    return { success: false, error: "Failed to create template (duplicate name?)" };
  }
}

export async function addTemplateIngredient(templateId: string, data: { name: string; quantity: number; unit: string }) {
  try {
    const ingredient = await prisma.templateIngredient.create({
      data: { templateId, ...data }
    });
    return { success: true, ingredient };
  } catch (error) {
    console.error("Failed to add ingredient:", error);
    return { success: false, error: "Failed to add ingredient" };
  }
}

export async function removeTemplateIngredient(id: string) {
  try {
    await prisma.templateIngredient.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to remove ingredient" };
  }
}

export async function addTemplateFlow(templateId: string, data: { name: string; recipeId?: string }) {
  try {
    const flow = await prisma.templateExecutionFlow.create({
      data: { templateId, name: data.name, recipeId: data.recipeId || null }
    });
    return { success: true, flow };
  } catch (error) {
    console.error("Failed to add flow:", error);
    return { success: false, error: "Failed to add execution flow" };
  }
}

export async function removeTemplateFlow(id: string) {
  try {
    await prisma.templateExecutionFlow.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to remove execution flow" };
  }
}

// =====================================
// COOKING RECIPES (The How-To List)
// =====================================

export async function getCookingRecipes() {
  try {
    const recipes = await prisma.cookingRecipe.findMany();
    return { success: true, recipes };
  } catch (error) {
    console.error("Failed to fetch cooking recipes:", error);
    return { success: false, error: "Failed to fetch cooking recipes" };
  }
}

export async function createCookingRecipe(data: { name: string; instructions: string }) {
  try {
    const recipe = await prisma.cookingRecipe.create({ data });
    return { success: true, recipe };
  } catch (error) {
    console.error("Failed to create cooking recipe:", error);
    return { success: false, error: "Failed to create cooking recipe (duplicate name?)" };
  }
}

export async function getCookingRecipeById(id: string) {
  try {
    const recipe = await prisma.cookingRecipe.findUnique({ where: { id } });
    return { success: true, recipe };
  } catch (error) {
    return { success: false, error: "Failed to find cooking recipe" };
  }
}
