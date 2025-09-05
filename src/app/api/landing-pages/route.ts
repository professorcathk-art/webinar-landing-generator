import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

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
        { status: 500 }
      )
    }

    // Check if user is admin
    const isAdmin = decoded.email === 'professor.cat.hk@gmail.com'

    // Build where clause based on user role
    let whereClause: any = {}
    
    if (!isAdmin) {
      // Regular users only see their own pages
      whereClause.userId = decoded.userId
    }
    // Admin users can see all pages (no where clause restriction)

    // Get pages based on user role
    const landingPages = await prisma.landingPage.findMany({
      where: whereClause,
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
        jsContent: true,
        userId: isAdmin // Include userId for admin to see who owns each page
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
