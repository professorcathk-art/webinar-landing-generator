import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dd1c7187d68d479985be534c775535b1",
  baseURL: "https://api.aimlapi.com/v1",
})

export async function POST(request: NextRequest) {
  let blockType: string = ''
  let currentContent: string = ''
  let userInstructions: string = ''
  let pageContext: any = null

  try {
    const requestData = await request.json()
    blockType = requestData.blockType
    currentContent = requestData.currentContent
    userInstructions = requestData.userInstructions
    pageContext = requestData.pageContext

    if (!blockType || !currentContent || !userInstructions) {
      return NextResponse.json(
        { error: 'Missing required fields: blockType, currentContent, userInstructions' },
        { status: 400 }
      )
    }

    // Create AI prompt for block refinement
    const prompt = `# Landing Page Content Refinement

## Current Page Content:
${currentContent}

## User Request:
${userInstructions}

## Page Context:
- Business: ${pageContext?.businessInfo || 'Not specified'}
- Target Audience: ${pageContext?.targetAudience || 'Not specified'}
- Webinar Content: ${pageContext?.webinarContent || 'Not specified'}

## Instructions:
Please refine the landing page content based on the user's request. You can modify any part of the page to improve it according to their feedback.

## Requirements:
- Maintain the same HTML structure and styling
- Keep all existing CSS classes and responsive design
- Improve the content based on the user's request
- Ensure the refined content is professional and conversion-focused
- Preserve all interactive elements and functionality

## Output Format:
Return the complete refined HTML content that can be directly used to replace the current page content.

Please provide only the refined HTML content without any additional explanations or markdown formatting.`

    // Generate refined content with AI
    console.log('Attempting to call AIML API for content refinement with model: gpt-4o')
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: `You are a professional web developer and copywriter specializing in high-converting landing pages. You excel at refining content while maintaining design consistency and improving conversion rates.

${prompt}`
        }
      ]
    })

    const refinedContent = completion.choices[0]?.message?.content

    if (!refinedContent) {
      return NextResponse.json(
        { error: 'Failed to generate refined content' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      refinedContent,
      blockType,
      originalContent: currentContent
    })

  } catch (error) {
    console.error('Error in refine-block API:', error)
    
    // Enhanced error logging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : 'No stack trace'
    
    console.error('Error details:', {
      message: errorMessage,
      stack: errorStack,
      openaiKey: process.env.OPENAI_API_KEY ? 'Configured' : 'Missing',
      requestData: { blockType, currentContent: currentContent?.substring(0, 100) + '...', userInstructions }
    })
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Refine block API endpoint' },
    { status: 200 }
  )
}
