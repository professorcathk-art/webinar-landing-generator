import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Check environment variables
    const envCheck = {
      DATABASE_URL: process.env.DATABASE_URL ? 'Configured' : 'Missing',
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'Configured' : 'Missing',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Configured' : 'Missing',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ? 'Configured' : 'Missing'
    }

    // Test database connection
    let dbStatus = 'Not tested'
    let tableCount = 0
    
    try {
      await prisma.$connect()
      const result = await prisma.$queryRaw`
        SELECT COUNT(*)::int as count 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('users', 'landing_pages', 'leads', 'page_versions')
      `
      tableCount = Array.isArray(result) && result.length > 0 ? Number(result[0].count) : 0
      dbStatus = 'Connected'
    } catch (dbError) {
      dbStatus = `Error: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`
    } finally {
      await prisma.$disconnect()
    }

    // Test OpenAI API key format
    let openaiStatus = 'Not tested'
    if (process.env.OPENAI_API_KEY) {
      const key = process.env.OPENAI_API_KEY
      openaiStatus = key.startsWith('sk-') ? 'Valid format' : 'Invalid format'
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: envCheck,
      database: {
        status: dbStatus,
        tablesFound: tableCount
      },
      openai: {
        status: openaiStatus
      },
      deployment: {
        url: process.env.VERCEL_URL || 'Not available',
        environment: process.env.NODE_ENV || 'Not set'
      }
    })

  } catch (error) {
    console.error('Debug route error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Debug route failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
