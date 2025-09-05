import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY || "dd1c7187d68d479985be534c775535b1"
    
    // Test the API key by making a direct request to AIML API
    const response = await fetch('https://api.aimlapi.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'webinar-landing-generator/1.0'
      }
    })
    
    const responseText = await response.text()
    let responseData = null
    
    try {
      responseData = JSON.parse(responseText)
    } catch (e) {
      // Response is not JSON
    }
    
    return NextResponse.json({
      success: response.ok,
      message: response.ok ? 'API key is valid' : 'API key validation failed',
      status: response.status,
      statusText: response.statusText,
      responseHeaders: Object.fromEntries(response.headers.entries()),
      responseBody: responseData || responseText.substring(0, 1000),
      apiKey: {
        length: apiKey.length,
        first8: apiKey.substring(0, 8),
        last8: apiKey.substring(apiKey.length - 8),
        usingEnvVar: !!process.env.OPENAI_API_KEY
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to verify API key',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
