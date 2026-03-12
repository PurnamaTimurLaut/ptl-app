"use server";

import { revalidatePath } from "next/cache";
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
    console.error("DEBUG: Failed to fetch templates:", error);
    return { success: false, error: "Failed to fetch production templates" };
  }
}

export async function createProductionTemplate(data: { name: string }) {
  try {
    const template = await prisma.productionTemplate.create({ data });
    revalidatePath("/");
    return { success: true, template };
  } catch (error: any) {
    console.error("Failed to create template:", error);
    return { success: false, error: error?.message || "Failed to create template" };
  }
}

export async function createCookingRecipeLinked(templateId: string, instructions: string) {
  try {
    const template = await prisma.productionTemplate.findUnique({ where: { id: templateId } });
    if (!template) return { success: false, error: "Template not found" };

    const recipe = await prisma.cookingRecipe.create({
      data: {
        name: `Recipe for ${template.name}`,
        instructions
      }
    });

    // Auto-link by creating a flow
    await prisma.templateExecutionFlow.create({
      data: {
        name: `Prepare ${template.name}`,
        templateId,
        recipeId: recipe.id
      }
    });

    revalidatePath("/");
    return { success: true, recipe };
  } catch (error: any) {
    console.error("Failed to create and link recipe:", error);
    return { success: false, error: error.message || "Failed to create recipe" };
  }
}

export async function addTemplateIngredient(templateId: string, data: { name: string; quantity: number; unit: string }) {
  try {
    const ingredient = await prisma.templateIngredient.create({
      data: { templateId, ...data }
    });
    revalidatePath("/");
    return { success: true, ingredient };
  } catch (error) {
    console.error("Failed to add ingredient:", error);
    return { success: false, error: "Failed to add ingredient" };
  }
}

export async function removeTemplateIngredient(id: string) {
  try {
    await prisma.templateIngredient.delete({ where: { id } });
    revalidatePath("/");
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
    revalidatePath("/");
    return { success: true, flow };
  } catch (error) {
    console.error("Failed to add flow:", error);
    return { success: false, error: "Failed to add execution flow" };
  }
}

export async function removeTemplateFlow(id: string) {
  try {
    await prisma.templateExecutionFlow.delete({ where: { id } });
    revalidatePath("/");
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
    console.error("DEBUG: Failed to fetch cooking recipes:", error);
    return { success: false, error: "Failed to fetch cooking recipes" };
  }
}

export async function createCookingRecipe(data: { name: string; instructions: string }) {
  try {
    const recipe = await prisma.cookingRecipe.create({ data });
    revalidatePath("/");
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
