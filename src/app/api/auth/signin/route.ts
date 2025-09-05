import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { sign } from 'jsonwebtoken'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    console.log('Signin request received')
    const { email, password } = await request.json()
    console.log('Email provided:', email ? 'Yes' : 'No')

    if (!email || !password) {
      console.log('Missing email or password')
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user by email
    console.log('Looking up user by email:', email)
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        createdAt: true,
        updatedAt: true
        // Exclude customDomain to avoid the missing column error
      }
    })
    console.log('User found:', user ? 'Yes' : 'No')

    if (!user) {
      console.log('User not found for email:', email)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check password
    console.log('Checking password...')
    const isValidPassword = await bcrypt.compare(password, user.password)
    console.log('Password valid:', isValidPassword)

    if (!isValidPassword) {
      console.log('Invalid password for user:', email)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Create JWT token
    console.log('Creating JWT token...')
    const token = sign(
      { userId: user.id, email: user.email },
      process.env.NEXTAUTH_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    )
    console.log('JWT token created successfully')

    // Set cookie
    console.log('Creating response...')
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    })

    console.log('Setting auth cookie...')
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })
    console.log('Signin completed successfully')

    return response

  } catch (error) {
    console.error('Signin error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      databaseUrl: process.env.DATABASE_URL ? 'Configured' : 'Missing',
      nextauthSecret: process.env.NEXTAUTH_SECRET ? 'Configured' : 'Missing'
    })
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
