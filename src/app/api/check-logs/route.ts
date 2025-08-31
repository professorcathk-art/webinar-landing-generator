import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Check if we can access environment variables
    const envStatus = {
      DATABASE_URL: process.env.DATABASE_URL ? 'Configured' : 'Missing',
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'Configured' : 'Missing',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Configured' : 'Missing',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ? 'Configured' : 'Missing'
    }

    // Check deployment info
    const deploymentInfo = {
      vercelUrl: process.env.VERCEL_URL || 'Not available',
      nodeEnv: process.env.NODE_ENV || 'Not set',
      timestamp: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      message: 'Application is running',
      environment: envStatus,
      deployment: deploymentInfo,
      note: 'If you cannot access Vercel Functions, check project ownership'
    })

  } catch (error) {
    console.error('Check logs error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check logs',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
