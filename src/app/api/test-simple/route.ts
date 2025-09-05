import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dd1c7187d68d479985be534c775535b1",
  baseURL: "https://api.aimlapi.com/v1",
})

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing simple AIML API call...')
    
    // Try the most basic model first
    const completion = await openai.chat.completions.create({
      model: "openai/gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: "Hello"
        }
      ],
      max_tokens: 5,
    })

    const response = completion.choices[0]?.message?.content

    return NextResponse.json({
      success: true,
      message: 'Simple test successful',
      response: response,
      model: "openai/gpt-3.5-turbo",
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Simple test error:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Simple test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        status: (error as any)?.status,
        model: "openai/gpt-3.5-turbo",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
