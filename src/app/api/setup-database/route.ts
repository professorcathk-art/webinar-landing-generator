import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    // This will create all tables based on the Prisma schema
    await prisma.$executeRaw`
      -- Create tables if they don't exist
      
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        password TEXT NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Landing pages table
      CREATE TABLE IF NOT EXISTS landing_pages (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        content JSONB NOT NULL,
        "htmlContent" TEXT NOT NULL,
        "cssContent" TEXT NOT NULL,
        "jsContent" TEXT NOT NULL,
        "businessInfo" TEXT,
        "webinarContent" TEXT,
        "targetAudience" TEXT,
        "webinarInfo" TEXT,
        "instructorCreds" TEXT,
        "contactFields" JSONB DEFAULT '[]',
        "visualStyle" TEXT,
        "brandColors" TEXT,
        "uniqueSellingPoints" TEXT,
        "upsellProducts" TEXT,
        "specialRequirements" TEXT,
        photos JSONB DEFAULT '[]',
        "isPublished" BOOLEAN DEFAULT FALSE,
        "isListed" BOOLEAN DEFAULT FALSE,
        "customDomain" TEXT,
        "publishedAt" TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE
      );

      -- Leads table
      CREATE TABLE IF NOT EXISTS leads (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT,
        phone TEXT,
        instagram TEXT,
        "additionalData" JSONB DEFAULT '{}',
        "landingPageId" TEXT NOT NULL REFERENCES landing_pages(id) ON DELETE CASCADE,
        "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Page versions table
      CREATE TABLE IF NOT EXISTS page_versions (
        id TEXT PRIMARY KEY,
        "landingPageId" TEXT NOT NULL REFERENCES landing_pages(id) ON DELETE CASCADE,
        version INTEGER NOT NULL,
        content JSONB NOT NULL,
        "htmlContent" TEXT NOT NULL,
        "cssContent" TEXT NOT NULL,
        "jsContent" TEXT NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_landing_pages_user_id ON landing_pages("userId");
      CREATE INDEX IF NOT EXISTS idx_landing_pages_slug ON landing_pages(slug);
      CREATE INDEX IF NOT EXISTS idx_leads_landing_page_id ON leads("landingPageId");
      CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads("userId");
      CREATE INDEX IF NOT EXISTS idx_page_versions_landing_page_id ON page_versions("landingPageId");
    `

    return NextResponse.json({
      success: true,
      message: 'Database schema created successfully'
    })

  } catch (error) {
    console.error('Error setting up database:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to setup database' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
