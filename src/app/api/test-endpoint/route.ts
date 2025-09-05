import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const baseURL = "https://api.aimlapi.com/v1"
    
    // Test if the endpoint is reachable
    const response = await fetch(`${baseURL}/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY || "dd1c7187d68d479985be534c775535b1"}`,
        'Content-Type': 'application/json'
      }
    })
    
    const responseText = await response.text()
    
    return NextResponse.json({
      success: response.ok,
      message: response.ok ? 'Endpoint is reachable' : 'Endpoint returned error',
      status: response.status,
      statusText: response.statusText,
      response: responseText.substring(0, 500), // First 500 chars
      endpoint: `${baseURL}/models`,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to reach endpoint',
        details: error instanceof Error ? error.message : 'Unknown error',
        endpoint: "https://api.aimlapi.com/v1/models",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
