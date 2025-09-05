import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dd1c7187d68d479985be534c775535b1",
  baseURL: "https://api.aimlapi.com/v1",
})

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY || "dd1c7187d68d479985be534c775535b1"
  const baseURL = "https://api.aimlapi.com/v1"
  
  console.log('Testing AIML API connection...')
  console.log('API Key (first 8 chars):', apiKey.substring(0, 8) + "...")
  console.log('Base URL:', baseURL)
  console.log('Using environment variable:', !!process.env.OPENAI_API_KEY)
  
  // Test different models to see which ones work
  const modelsToTest = [
    "gpt-4o",
    "gpt-4",
    "gpt-3.5-turbo",
    "gpt-4-turbo",
    "gpt-4o-mini"
  ]
  
  const results = []
  
  for (const model of modelsToTest) {
    try {
      console.log(`Testing model: ${model}`)
      
      const openai = new OpenAI({
        apiKey: apiKey,
        baseURL: baseURL,
      })
      
      const completion = await openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: "user",
            content: "Say 'Hello'"
          }
        ],
        max_tokens: 5,
        temperature: 0.1,
      })

      const response = completion.choices[0]?.message?.content
      
      results.push({
        model: model,
        status: 'success',
        response: response
      })
      
      console.log(`✅ Model ${model} works!`)
      
    } catch (error) {
      console.log(`❌ Model ${model} failed:`, error instanceof Error ? error.message : 'Unknown error')
      
      results.push({
        model: model,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        statusCode: (error as any)?.status
      })
    }
  }
  
  const workingModels = results.filter(r => r.status === 'success')
  const failedModels = results.filter(r => r.status === 'failed')
  
  return NextResponse.json({
    success: workingModels.length > 0,
    message: workingModels.length > 0 ? 
      `Found ${workingModels.length} working model(s)` : 
      'No working models found',
    workingModels: workingModels,
    failedModels: failedModels,
    timestamp: new Date().toISOString(),
    apiInfo: {
      baseURL: baseURL,
      usingEnvVar: !!process.env.OPENAI_API_KEY,
      totalModelsTested: modelsToTest.length
    }
  })
}
