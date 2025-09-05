import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dd1c7187d68d479985be534c775535b1",
  baseURL: "https://api.aimlapi.com/v1",
})

export async function POST(request: NextRequest) {
  try {
    // Test with minimal data
    const testData = {
      businessInfo: 'Test business',
      webinarContent: 'Test webinar content',
      targetAudience: 'Test audience',
      webinarInfo: 'Test info',
      instructorCreds: 'Test credentials',
      contactFields: ['姓名', 'Email']
    }

    // Test OpenAI connection
    let openaiTest = 'Not tested'
    try {
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
      openaiTest = 'Working'
    } catch (openaiError) {
      openaiTest = `Error: ${openaiError instanceof Error ? openaiError.message : 'Unknown error'}`
    }

    // Test database connection
    let dbTest = 'Not tested'
    try {
      await prisma.$connect()
      await prisma.$queryRaw`SELECT 1`
      dbTest = 'Working'
    } catch (dbError) {
      dbTest = `Error: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`
    } finally {
      await prisma.$disconnect()
    }

    return NextResponse.json({
      success: true,
      message: 'Form test completed',
      tests: {
        openai: openaiTest,
        database: dbTest
      },
      environment: {
        openaiKey: process.env.OPENAI_API_KEY ? 'Configured' : 'Missing',
        databaseUrl: process.env.DATABASE_URL ? 'Configured' : 'Missing'
      }
    })

  } catch (error) {
    console.error('Form test error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Form test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
