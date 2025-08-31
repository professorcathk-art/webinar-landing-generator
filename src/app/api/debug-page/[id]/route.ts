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
      return NextResponse.json({
        success: false,
        error: 'Landing page not found',
        pageId: params.id
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        id: landingPage.id,
        title: landingPage.title,
        slug: landingPage.slug,
        htmlContent: landingPage.htmlContent,
        cssContent: landingPage.cssContent,
        jsContent: landingPage.jsContent,
        content: landingPage.content,
        createdAt: landingPage.createdAt,
        updatedAt: landingPage.updatedAt,
        userId: landingPage.userId,
        user: landingPage.user
      }
    })

  } catch (error) {
    console.error('Error fetching landing page:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch landing page',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
