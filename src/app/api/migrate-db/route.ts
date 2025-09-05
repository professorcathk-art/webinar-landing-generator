import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('Starting database migration...')
    
    // Check if customDomain column exists
    const result = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'customDomain'
    `
    
    if (Array.isArray(result) && result.length === 0) {
      console.log('Adding customDomain column to users table...')
      
      // Add the customDomain column
      await prisma.$executeRaw`
        ALTER TABLE "users" ADD COLUMN "customDomain" TEXT
      `
      
      console.log('customDomain column added successfully')
    } else {
      console.log('customDomain column already exists')
    }
    
    // Check if form_submissions table exists
    const tableExists = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'form_submissions'
    `
    
    if (Array.isArray(tableExists) && tableExists.length === 0) {
      console.log('Creating form_submissions table...')
      
      // Create the form_submissions table
      await prisma.$executeRaw`
        CREATE TABLE "form_submissions" (
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
      
      // Add foreign key constraint
      await prisma.$executeRaw`
        ALTER TABLE "form_submissions" 
        ADD CONSTRAINT "form_submissions_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
      `
      
      console.log('form_submissions table created successfully')
    } else {
      console.log('form_submissions table already exists')
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database migration completed successfully',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Migration error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    })
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Migration failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Migration endpoint is accessible',
    timestamp: new Date().toISOString()
  })
}
