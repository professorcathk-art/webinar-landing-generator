import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing database connection...')
    
    // Test basic database connection
    const userCount = await prisma.user.count()
    console.log('Database connection successful, user count:', userCount)
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      userCount,
      timestamp: new Date().toISOString(),
      environment: {
        databaseUrl: process.env.DATABASE_URL ? 'Configured' : 'Missing',
        nodeEnv: process.env.NODE_ENV || 'Not set'
      }
    })

  } catch (error) {
    console.error('Database test error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      databaseUrl: process.env.DATABASE_URL ? 'Configured' : 'Missing'
    })
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}