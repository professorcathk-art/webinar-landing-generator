import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { blockType, currentContent, userInstructions, pageContext } = await request.json()

    if (!blockType || !currentContent || !userInstructions) {
      return NextResponse.json(
        { error: 'Missing required fields: blockType, currentContent, userInstructions' },
        { status: 400 }
      )
    }

    // Create AI prompt for block refinement
    const prompt = `# Landing Page Block Refinement

## Block Type: ${blockType}
## Current Content:
${currentContent}

## Refinement Request:
${userInstructions}

## Page Context:
${pageContext || 'No additional context provided'}

## Instructions:
Please refine the specified block based on the user's request. Maintain the same structure and style while improving the content according to the refinement request.

## Output Format:
Return the refined content in the same format as the original, but with improvements based on the refinement request.

## Requirements:
- Keep the same HTML structure
- Maintain responsive design
- Preserve existing styling classes
- Improve content based on the refinement request
- Ensure the refined content fits well with the overall page context

Please provide only the refined content without any additional explanations.`

    // Generate refined content with AI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional web developer and copywriter specializing in high-converting landing pages. You excel at refining content while maintaining design consistency and improving conversion rates."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
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
    return NextResponse.json(
      { error: 'Internal server error' },
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
