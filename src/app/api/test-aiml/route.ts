import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dd1c7187d68d479985be534c775535b1",
  baseURL: "https://api.aimlapi.com/v1",
})

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing AIML API connection...')
    console.log('API Key (first 8 chars):', (process.env.OPENAI_API_KEY || "dd1c7187d68d479985be534c775535b1").substring(0, 8) + "...")
    console.log('Base URL:', "https://api.aimlapi.com/v1")
    console.log('Using environment variable:', !!process.env.OPENAI_API_KEY)
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: "Say 'Hello World' in one word"
        }
      ],
      max_tokens: 10,
      temperature: 0.1,
    })

    const response = completion.choices[0]?.message?.content

    return NextResponse.json({
      success: true,
      message: 'AIML API test successful',
      response,
      timestamp: new Date().toISOString(),
      apiInfo: {
        model: "gpt-4o",
        baseURL: "https://api.aimlapi.com/v1",
        usingEnvVar: !!process.env.OPENAI_API_KEY
      }
    })

  } catch (error) {
    console.error('AIML API test error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      status: (error as any)?.status,
      statusText: (error as any)?.statusText,
      response: (error as any)?.response?.data
    })
    
    return NextResponse.json(
      { 
        success: false,
        error: 'AIML API test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        status: (error as any)?.status,
        timestamp: new Date().toISOString(),
        apiInfo: {
          model: "gpt-4o",
          baseURL: "https://api.aimlapi.com/v1",
          usingEnvVar: !!process.env.OPENAI_API_KEY
        }
      },
      { status: 500 }
    )
  }
}
