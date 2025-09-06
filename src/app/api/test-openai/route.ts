import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY || "dd1c7187d68d479985be534c775535b1"
    const baseURL = process.env.OPENAI_BASE_URL || "https://api.aimlapi.com/v1"
    
    console.log('Testing OpenAI API connection...')
    console.log('API Key (first 8 chars):', apiKey.substring(0, 8) + "...")
    console.log('Base URL:', baseURL)
    console.log('Using environment variable:', !!process.env.OPENAI_API_KEY)
    
    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: baseURL,
    })
    
    // Test with a simple completion
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: "Say 'Hello World'"
        }
      ],
      max_tokens: 10,
    })

    const response = completion.choices[0]?.message?.content
    
    return NextResponse.json({
      success: true,
      message: 'OpenAI API test successful',
      response: response,
      apiInfo: {
        baseURL: baseURL,
        usingEnvVar: !!process.env.OPENAI_API_KEY,
        model: "gpt-4o",
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('OpenAI API test failed:', error)
    
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      status: (error as any)?.status,
      statusText: (error as any)?.statusText,
      response: (error as any)?.response?.data,
      apiKey: process.env.OPENAI_API_KEY ? 'Using env var' : 'Using fallback key',
      baseURL: process.env.OPENAI_BASE_URL || "https://api.aimlapi.com/v1"
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'OpenAI API test failed',
        details: errorDetails,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
