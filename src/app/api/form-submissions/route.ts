import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from token
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

    // Get form submissions for the user
    const submissions = await prisma.formSubmission.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      submissions: submissions
    })

  } catch (error) {
    console.error('Error fetching form submissions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch form submissions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Get authenticated user from token
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

    // Create form submission
    const submission = await prisma.formSubmission.create({
      data: {
        businessInfo: body.businessInfo,
        webinarContent: body.webinarContent,
        targetAudience: body.targetAudience,
        webinarInfo: body.webinarInfo,
        instructorCreds: body.instructorCreds,
        contactFields: body.contactFields,
        style: body.style,
        brandColors: body.brandColors,
        uniqueSellingPoints: body.uniqueSellingPoints,
        upsellProducts: body.upsellProducts,
        specialRequirements: body.specialRequirements,
        userId: decoded.userId
      }
    })

    return NextResponse.json({
      success: true,
      submission: submission
    })

  } catch (error) {
    console.error('Error creating form submission:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create form submission' },
      { status: 500 }
    )
  }
}
