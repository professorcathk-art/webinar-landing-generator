import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY || "dd1c7187d68d479985be534c775535b1"
    const baseURL = "https://api.aimlapi.com/v1"
    
    console.log('Debugging AIML API authentication...')
    
    // Test 1: Check if we can reach the models endpoint
    const modelsResponse = await fetch(`${baseURL}/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('Models endpoint response:', {
      status: modelsResponse.status,
      statusText: modelsResponse.statusText,
      headers: Object.fromEntries(modelsResponse.headers.entries())
    })
    
    // Test 2: Try a simple chat completion with detailed error info
    let chatTestResult = null
    try {
      const chatResponse = await fetch(`${baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: "Hello" }],
          max_tokens: 5
        })
      })
      
      const responseText = await chatResponse.text()
      
      chatTestResult = {
        status: chatResponse.status,
        statusText: chatResponse.statusText,
        headers: Object.fromEntries(chatResponse.headers.entries()),
        body: responseText.substring(0, 500) // First 500 chars
      }
      
      console.log('Chat completion test result:', chatTestResult)
      
    } catch (error) {
      chatTestResult = {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
    
    // Test 3: Try different authentication methods
    const authTests = []
    
    // Test with different header formats
    const authFormats = [
      `Bearer ${apiKey}`,
      `sk-${apiKey}`,
      apiKey,
      `OpenAI-Key: ${apiKey}`
    ]
    
    for (const authFormat of authFormats) {
      try {
        const testResponse = await fetch(`${baseURL}/models`, {
          method: 'GET',
          headers: {
            'Authorization': authFormat,
            'Content-Type': 'application/json'
          }
        })
        
        authTests.push({
          authFormat: authFormat.substring(0, 20) + '...',
          status: testResponse.status,
          statusText: testResponse.statusText
        })
      } catch (error) {
        authTests.push({
          authFormat: authFormat.substring(0, 20) + '...',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Authentication debug completed',
      apiKey: {
        length: apiKey.length,
        first8: apiKey.substring(0, 8),
        last8: apiKey.substring(apiKey.length - 8),
        usingEnvVar: !!process.env.OPENAI_API_KEY
      },
      baseURL: baseURL,
      modelsEndpoint: {
        status: modelsResponse.status,
        statusText: modelsResponse.statusText,
        headers: Object.fromEntries(modelsResponse.headers.entries())
      },
      chatCompletionTest: chatTestResult,
      authFormatTests: authTests,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Debug auth error:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Debug authentication failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
