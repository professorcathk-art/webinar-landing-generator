import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST - Collect a new lead
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pageId, name, email, phone, instagram, additionalInfo } = body

    if (!pageId || !email) {
      return NextResponse.json(
        { error: 'Page ID and email are required' },
        { status: 400 }
      )
    }

    // Get the landing page to find the owner
    const landingPage = await prisma.landingPage.findUnique({
      where: { id: pageId },
      select: { userId: true, isPublished: true }
    })

    if (!landingPage) {
      return NextResponse.json(
        { error: 'Landing page not found' },
        { status: 404 }
      )
    }

    // For published pages, allow public submissions
    // For draft pages, require authentication
    let userId = landingPage.userId

    if (!landingPage.isPublished) {
      // Get authenticated user from token for draft pages
      const token = request.cookies.get('auth-token')?.value
      
      if (!token) {
        return NextResponse.json(
          { error: 'Authentication required for draft pages' },
          { status: 401 }
        )
      }

      // Verify JWT token and get user ID
      const { verify } = await import('jsonwebtoken')
      const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any
      
      if (!decoded || !decoded.userId) {
        return NextResponse.json(
          { error: 'Invalid authentication' },
          { status: 401 }
        )
      }

      // Verify the user owns this page
      if (decoded.userId !== landingPage.userId) {
        return NextResponse.json(
          { error: 'Unauthorized access to this page' },
          { status: 403 }
        )
      }
    }

    // Create the lead
    const lead = await prisma.lead.create({
      data: {
        landingPageId: pageId,
        name: name || '',
        email,
        phone: phone || '',
        instagram: instagram || '',
        additionalData: additionalInfo || {},
        userId: userId
      }
    })

    return NextResponse.json({
      success: true,
      data: lead
    })

  } catch (error) {
    console.error('Error creating lead:', error)
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// GET - Retrieve leads for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pageId = searchParams.get('pageId')
    const userId = searchParams.get('userId')

    // Get authenticated user from token
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify JWT token and get user ID
    const { verify } = await import('jsonwebtoken')
    const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 400 }
      )
    }

    // Check if the authenticated user is admin
    const isAdmin = decoded.email === 'professor.cat.hk@gmail.com'

    let whereClause: any = {}

    if (isAdmin) {
      // Admin can see all leads
      if (pageId) {
        whereClause.landingPageId = pageId
      }
      if (userId) {
        whereClause.landingPage = {
          userId: userId
        }
      }
    } else {
      // Regular users can only see leads from their own pages
      whereClause.landingPage = {
        userId: decoded.userId
      }
      
      if (pageId) {
        whereClause.landingPageId = pageId
      }
    }

    const leads = await prisma.lead.findMany({
      where: whereClause,
      include: {
        landingPage: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: leads
    })

  } catch (error) {
    console.error('Error fetching leads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
