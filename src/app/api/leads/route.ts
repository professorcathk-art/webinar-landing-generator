import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pageId = searchParams.get('pageId')
    const status = searchParams.get('status')

    const where: any = {}
    if (pageId) where.landingPageId = pageId
    if (status && status !== 'all') where.status = status

    const leads = await prisma.lead.findMany({
      where,
      include: {
        landingPage: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ leads })
  } catch (error) {
    console.error('Error fetching leads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, instagram, additionalData, landingPageId } = body

    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        phone,
        instagram,
        additionalData: additionalData || {},
        landingPageId,
        userId: 'temp-user-id', // TODO: Replace with actual user ID
      },
    })

    return NextResponse.json({ lead })
  } catch (error) {
    console.error('Error creating lead:', error)
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    )
  }
}
