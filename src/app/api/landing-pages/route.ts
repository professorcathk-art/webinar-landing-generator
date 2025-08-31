import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Get user from auth token
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify JWT token and get user ID
    const { verify } = await import('jsonwebtoken')
    const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication' },
        { status: 401 }
      )
    }

    // Get pages for the authenticated user only
    const landingPages = await prisma.landingPage.findMany({
      where: {
        userId: decoded.userId
      },
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
