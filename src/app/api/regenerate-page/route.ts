import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { pageId } = await request.json()
    
    if (!pageId) {
      return NextResponse.json(
        { success: false, error: 'Page ID is required' },
        { status: 400 }
      )
    }

    // Get authenticated user from token
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify JWT token and get user ID
    const { verify } = await import('jsonwebtoken')
    const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication' },
        { status: 401 }
      )
    }

    // Get the landing page and verify ownership
    const landingPage = await prisma.landingPage.findFirst({
      where: {
        id: pageId,
        userId: decoded.userId
      }
    })

    if (!landingPage) {
      return NextResponse.json(
        { success: false, error: 'Page not found or access denied' },
        { status: 404 }
      )
    }

    // Extract the original form data from the page content
    const content = landingPage.content as any
    
    // Prepare the form data for regeneration
    const formData = new FormData()
    
    // Add all the original form fields
    if (content.businessInfo) formData.append('businessInfo', JSON.stringify(content.businessInfo))
    if (content.webinarContent) formData.append('webinarContent', JSON.stringify(content.webinarContent))
    if (content.targetAudience) formData.append('targetAudience', JSON.stringify(content.targetAudience))
    if (content.webinarInfo) formData.append('webinarInfo', JSON.stringify(content.webinarInfo))
    if (content.instructorCreds) formData.append('instructorCreds', JSON.stringify(content.instructorCreds))
    if (content.contactFields) formData.append('contactFields', JSON.stringify(content.contactFields))
    if (content.visualStyle) formData.append('visualStyle', JSON.stringify(content.visualStyle))
    if (content.brandColors) formData.append('brandColors', JSON.stringify(content.brandColors))
    if (content.uniqueSellingPoints) formData.append('uniqueSellingPoints', JSON.stringify(content.uniqueSellingPoints))
    if (content.upsellProducts) formData.append('upsellProducts', JSON.stringify(content.upsellProducts))
    if (content.specialRequirements) formData.append('specialRequirements', JSON.stringify(content.specialRequirements))
    if (content.photos) formData.append('photos', JSON.stringify(content.photos))

    // Call the generate-landing-page API with the original data
    const generateResponse = await fetch(`${request.nextUrl.origin}/api/generate-landing-page`, {
      method: 'POST',
      body: formData,
      headers: {
        'Cookie': request.headers.get('cookie') || ''
      }
    })

    if (!generateResponse.ok) {
      throw new Error('Failed to regenerate landing page')
    }

    const generateResult = await generateResponse.json()
    
    if (!generateResult.success) {
      throw new Error(generateResult.error || 'Failed to regenerate landing page')
    }

    // Update the existing page with new content
    const updatedPage = await prisma.landingPage.update({
      where: { id: pageId },
      data: {
        title: generateResult.title || landingPage.title,
        htmlContent: generateResult.htmlContent || landingPage.htmlContent,
        cssContent: generateResult.cssContent || landingPage.cssContent,
        jsContent: generateResult.jsContent || landingPage.jsContent,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      pageId: updatedPage.id,
      message: 'Landing page regenerated successfully'
    })

  } catch (error) {
    console.error('Error regenerating landing page:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to regenerate landing page',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}