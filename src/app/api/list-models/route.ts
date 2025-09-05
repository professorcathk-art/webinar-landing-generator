import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const baseURL = "https://api.aimlapi.com/v1"
    const apiKey = process.env.OPENAI_API_KEY || "dd1c7187d68d479985be534c775535b1"
    
    // Get available models
    const response = await fetch(`${baseURL}/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch models',
        status: response.status,
        statusText: response.statusText
      })
    }
    
    const data = await response.json()
    
    // Extract model IDs and filter for OpenAI models
    const openaiModels = data.data
      .filter((model: any) => model.id.startsWith('openai/'))
      .map((model: any) => ({
        id: model.id,
        name: model.info?.name || 'Unknown',
        description: model.info?.description || 'No description',
        contextLength: model.info?.contextLength || 'Unknown',
        maxTokens: model.info?.maxTokens || 'Unknown'
      }))
    
    return NextResponse.json({
      success: true,
      message: 'Available OpenAI models on AIML API',
      totalModels: data.data.length,
      openaiModels: openaiModels,
      allModels: data.data.map((model: any) => model.id),
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to list models',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
