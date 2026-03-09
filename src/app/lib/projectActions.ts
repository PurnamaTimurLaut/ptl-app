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
    const parsedBudget = typeof data.budget === 'string' ? parseFloat(data.budget) : data.budget;
    const project = await prisma.project.create({
      data: {
        name: data.name,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        budget: isNaN(parsedBudget) ? 0 : parsedBudget,
        productions: {
          create: data.productions.map(p => {
            const parsedQuantity = typeof p.quantity === 'string' ? parseInt(p.quantity, 10) : p.quantity;
            return {
              menuId: p.menuId,
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

export async function getProjects() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
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
      include: { productions: true }
    })
    return { success: true, project }
  } catch (error) {
    console.error("Failed to fetch project:", error)
    return { success: false, project: null }
  }
}

export async function updateProjectStatus(id: string, status: "COMPLETED" | "CANCELLED") {
  try {
    const project = await prisma.project.update({
      where: { id },
      data: { status }
    })
    revalidatePath('/')
    return { success: true, project }
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
