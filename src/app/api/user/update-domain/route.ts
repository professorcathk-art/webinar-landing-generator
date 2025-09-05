import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customDomain } = body
    
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

    // Update user's custom domain
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: { customDomain }
    })

    return NextResponse.json({
      success: true,
      user: updatedUser
    })

  } catch (error) {
    console.error('Error updating custom domain:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update custom domain' },
      { status: 500 }
    )
  }
}
