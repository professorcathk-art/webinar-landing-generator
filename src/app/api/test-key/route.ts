import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY || "dd1c7187d68d479985be534c775535b1"
    
    return NextResponse.json({
      success: true,
      message: 'API Key information',
      apiKeyInfo: {
        length: apiKey.length,
        first8Chars: apiKey.substring(0, 8),
        last8Chars: apiKey.substring(apiKey.length - 8),
        usingEnvVar: !!process.env.OPENAI_API_KEY,
        format: apiKey.startsWith('sk-') ? 'OpenAI format' : 'Custom format',
        expectedFormat: 'Should be 32 characters (like: dd1c7187d68d479985be534c775535b1)'
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to check API key',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
