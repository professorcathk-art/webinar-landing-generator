import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST - Collect a new lead
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pageId, name, email, phone, instagram, additionalInfo } = body

    if (!pageId || !email) {
      return NextResponse.json(
        { error: 'Page ID and email are required' },
        { status: 400 }
      )
    }

    // Create the lead
    const lead = await prisma.lead.create({
      data: {
        pageId,
        name: name || '',
        email,
        phone: phone || '',
        instagram: instagram || '',
        additionalInfo: additionalInfo || '',
        collectedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: lead
    })

  } catch (error) {
    console.error('Error creating lead:', error)
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// GET - Retrieve leads for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pageId = searchParams.get('pageId')
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    let whereClause: any = {
      page: {
        userId: userId
      }
    }

    if (pageId) {
      whereClause.pageId = pageId
    }

    const leads = await prisma.lead.findMany({
      where: whereClause,
      include: {
        page: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        collectedAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: leads
    })

  } catch (error) {
    console.error('Error fetching leads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
