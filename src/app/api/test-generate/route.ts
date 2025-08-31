import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Generate API route is accessible',
    timestamp: new Date().toISOString()
  })
}

export async function POST(request: NextRequest) {
  try {
    // Test if we can read form data
    const formData = await request.formData()
    
    return NextResponse.json({
      success: true,
      message: 'Form data received successfully',
      formDataKeys: Array.from(formData.keys()),
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to process form data',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
