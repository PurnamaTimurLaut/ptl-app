import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET() {
  try {
    const userCount = await prisma.user.count()
    return NextResponse.json({ 
      status: 'connected', 
      userCount,
      message: `Database reachable. Found ${userCount} users.`
    })
  } catch (error: any) {
    return NextResponse.json({ 
      status: 'error', 
      message: error?.message || 'Unknown error',
      code: error?.code || null
    }, { status: 500 })
  }
}
