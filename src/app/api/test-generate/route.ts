import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dd1c7187d68d479985be534c775535b1",
  baseURL: "https://api.aimlapi.com/v1",
})

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing generate-landing-page style API call...')
    
    // Mimic the exact same call as generate-landing-page
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "你是一個專業的網頁設計師和轉換優化專家，專門創建高轉換率的webinar登陸頁面。你擅長創建視覺吸引力強、轉換率高的專業landing page，包含完整的HTML結構、現代CSS樣式、互動JavaScript功能，以及符合轉換心理學的內容設計。請確保生成的頁面具有專業的外觀、響應式設計、完整的表單功能，並且完全符合客戶的業務需求。"
        },
        {
          role: "user",
          content: "Create a simple test landing page for a webinar about 'Test Business'"
        }
      ],
      temperature: 0.7,
      max_tokens: 8000,
    })

    const response = completion.choices[0]?.message?.content

    return NextResponse.json({
      success: true,
      message: 'Generate-style test successful',
      response: response?.substring(0, 200) + '...', // First 200 chars
      model: "gpt-4o",
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Generate-style test error:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Generate-style test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        status: (error as any)?.status,
        model: "gpt-4o",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}