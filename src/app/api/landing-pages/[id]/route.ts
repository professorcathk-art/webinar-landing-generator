import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const landingPage = await prisma.landingPage.findUnique({
      where: { id: params.id },
      include: { user: true }
    })

    if (!landingPage) {
      return NextResponse.json(
        { success: false, error: 'Landing page not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: landingPage
    })

  } catch (error) {
    console.error('Error fetching landing page:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch landing page' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const updateData: any = {
      htmlContent: body.htmlContent || '',
      cssContent: body.cssContent || '',
      jsContent: body.jsContent || '',
      title: body.title || '',
      updatedAt: new Date()
    }

    // Handle publishing
    if (body.published !== undefined) {
      updateData.isPublished = body.published
      if (body.published) {
        updateData.publishedAt = new Date()
      }
    }

    const updatedPage = await prisma.landingPage.update({
      where: { id: params.id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      data: updatedPage
    })

  } catch (error) {
    console.error('Error updating landing page:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update landing page' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
