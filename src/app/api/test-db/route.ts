import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    await prisma.$connect()
    
    // Test query to check if tables exist
    const tableCount = await prisma.$queryRaw`
      SELECT COUNT(*)::int as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'landing_pages', 'leads', 'page_versions')
    `
    
    // Convert BigInt to regular number for JSON serialization
    const tableCountNumber = Array.isArray(tableCount) && tableCount.length > 0 
      ? Number(tableCount[0].count) 
      : 0
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      tablesFound: tableCountNumber,
      databaseUrl: process.env.DATABASE_URL ? 'Configured' : 'Not configured',
      environment: {
        openaiKey: process.env.OPENAI_API_KEY ? 'Configured' : 'Missing',
        nextauthSecret: process.env.NEXTAUTH_SECRET ? 'Configured' : 'Missing',
        nextauthUrl: process.env.NEXTAUTH_URL ? 'Configured' : 'Missing'
      }
    })

  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
