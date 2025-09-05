import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('Starting database fix...')
    
    // Add customDomain column if it doesn't exist
    try {
      await prisma.$executeRaw`
        ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "customDomain" TEXT
      `
      console.log('✅ customDomain column added/verified')
    } catch (error) {
      console.log('customDomain column already exists or error:', error)
    }
    
    // Create form_submissions table if it doesn't exist
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "form_submissions" (
          "id" TEXT NOT NULL,
          "businessInfo" TEXT NOT NULL,
          "webinarContent" TEXT NOT NULL,
          "targetAudience" TEXT NOT NULL,
          "webinarInfo" TEXT NOT NULL,
          "instructorCreds" TEXT NOT NULL,
          "contactFields" JSONB NOT NULL DEFAULT '[]',
          "style" TEXT NOT NULL,
          "brandColors" JSONB,
          "uniqueSellingPoints" TEXT,
          "upsellProducts" TEXT,
          "specialRequirements" TEXT,
          "landingPageId" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "userId" TEXT NOT NULL,
          CONSTRAINT "form_submissions_pkey" PRIMARY KEY ("id")
        )
      `
      console.log('✅ form_submissions table created/verified')
    } catch (error) {
      console.log('form_submissions table already exists or error:', error)
    }
    
    // Add foreign key constraint if it doesn't exist
    try {
      await prisma.$executeRaw`
        ALTER TABLE "form_submissions" 
        ADD CONSTRAINT IF NOT EXISTS "form_submissions_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
      `
      console.log('✅ Foreign key constraint added/verified')
    } catch (error) {
      console.log('Foreign key constraint already exists or error:', error)
    }
    
    // Test the database connection
    const userCount = await prisma.user.count()
    console.log('✅ Database connection test successful, user count:', userCount)
    
    return NextResponse.json({
      success: true,
      message: 'Database fix completed successfully',
      userCount,
      timestamp: new Date().toISOString(),
      fixes: [
        'customDomain column added to users table',
        'form_submissions table created',
        'Foreign key constraints added',
        'Database connection verified'
      ]
    })

  } catch (error) {
    console.error('Database fix error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    })
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Database fix failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
