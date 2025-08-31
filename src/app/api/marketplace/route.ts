import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'newest'

    const where: any = {
      OR: [
        { isListed: true },
        { isPublished: true }
      ]
    }

    if (search) {
      where.AND = [
        {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { businessInfo: { contains: search, mode: 'insensitive' } },
            { webinarContent: { contains: search, mode: 'insensitive' } },
          ]
        }
      ]
    }

    let orderBy: any = {}
    switch (sortBy) {
      case 'newest':
        orderBy.createdAt = 'desc'
        break
      case 'oldest':
        orderBy.createdAt = 'asc'
        break
      default:
        orderBy.createdAt = 'desc'
        break
    }

    const pages = await prisma.landingPage.findMany({
      where,
      orderBy,
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    })

    return NextResponse.json({ pages })
  } catch (error) {
    console.error('Error fetching marketplace pages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch marketplace pages' },
      { status: 500 }
    )
  }
}
