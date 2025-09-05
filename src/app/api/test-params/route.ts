import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dd1c7187d68d479985be534c775535b1",
  baseURL: "https://api.aimlapi.com/v1",
})

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const results = []
  
  // Test 1: Simple call (we know this works)
  try {
    const test1 = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "user", content: "Hello" }
      ],
      max_tokens: 5,
    })
    results.push({ test: "Simple call", status: "success", response: test1.choices[0]?.message?.content })
  } catch (error) {
    results.push({ test: "Simple call", status: "failed", error: (error as any)?.status })
  }
  
  // Test 2: With system message
  try {
    const test2 = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Hello" }
      ],
      max_tokens: 5,
    })
    results.push({ test: "With system message", status: "success", response: test2.choices[0]?.message?.content })
  } catch (error) {
    results.push({ test: "With system message", status: "failed", error: (error as any)?.status })
  }
  
  // Test 3: With Chinese system message
  try {
    const test3 = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "你是一個專業的網頁設計師" },
        { role: "user", content: "Hello" }
      ],
      max_tokens: 5,
    })
    results.push({ test: "With Chinese system message", status: "success", response: test3.choices[0]?.message?.content })
  } catch (error) {
    results.push({ test: "With Chinese system message", status: "failed", error: (error as any)?.status })
  }
  
  // Test 4: With temperature
  try {
    const test4 = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "user", content: "Hello" }
      ],
      temperature: 0.7,
      max_tokens: 5,
    })
    results.push({ test: "With temperature 0.7", status: "success", response: test4.choices[0]?.message?.content })
  } catch (error) {
    results.push({ test: "With temperature 0.7", status: "failed", error: (error as any)?.status })
  }
  
  // Test 5: With large max_tokens
  try {
    const test5 = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "user", content: "Hello" }
      ],
      max_tokens: 8000,
    })
    results.push({ test: "With max_tokens 8000", status: "success", response: test5.choices[0]?.message?.content })
  } catch (error) {
    results.push({ test: "With max_tokens 8000", status: "failed", error: (error as any)?.status })
  }
  
  // Test 6: All parameters combined
  try {
    const test6 = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "你是一個專業的網頁設計師" },
        { role: "user", content: "Hello" }
      ],
      temperature: 0.7,
      max_tokens: 8000,
    })
    results.push({ test: "All parameters combined", status: "success", response: test6.choices[0]?.message?.content })
  } catch (error) {
    results.push({ test: "All parameters combined", status: "failed", error: (error as any)?.status })
  }
  
  return NextResponse.json({
    success: true,
    message: 'Parameter testing completed',
    results: results,
    timestamp: new Date().toISOString()
  })
}
