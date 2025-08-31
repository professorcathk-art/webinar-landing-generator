import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // For now, we'll get all pages (in a real app, you'd filter by user ID)
    // This is a simplified version for demo purposes
    const landingPages = await prisma.landingPage.findMany({
      orderBy: {
        updatedAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        slug: true,
        isPublished: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        htmlContent: true,
        cssContent: true,
        jsContent: true
      }
    })

    return NextResponse.json({
      success: true,
      data: landingPages
    })

  } catch (error) {
    console.error('Error fetching landing pages:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch landing pages' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
