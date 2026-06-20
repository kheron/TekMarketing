import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { BrandContextSchema } from '@/lib/agent/types'

export async function GET() {
  try {
    const businesses = await prisma.brandContext.findMany({
      orderBy: [{ isActive: 'desc' }, { updatedAt: 'desc' }],
    })
    return NextResponse.json({ businesses })
  } catch (error) {
    console.error('Failed to list businesses:', error)
    return NextResponse.json({ error: 'Failed to load businesses' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = BrandContextSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid business data', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data = parsed.data
    const count = await prisma.brandContext.count()
    const makeActive = body.setActive === true || count === 0

    if (makeActive) {
      await prisma.brandContext.updateMany({ data: { isActive: false } })
    }

    const business = await prisma.brandContext.create({
      data: {
        companyName: data.companyName,
        voiceDescription: data.voiceDescription,
        targetAudience: data.targetAudience,
        productsServices: data.productsServices,
        keyDifferentiators: data.keyDifferentiators ?? null,
        primaryGoals: data.primaryGoals,
        contentPillars: data.contentPillars ?? null,
        preferredPlatforms: data.preferredPlatforms,
        toneKeywords: data.toneKeywords ?? null,
        doNotSay: data.doNotSay ?? null,
        industry: data.industry ?? null,
        website: data.website || null,
        visualStyle: data.visualStyle ?? null,
        logoDataUrl: data.logoDataUrl ?? null,
        additionalContext: data.additionalContext ?? null,
        isActive: makeActive,
      },
    })

    await prisma.activityLog.create({
      data: {
        type: 'BRAND_UPDATED',
        summary: `Business profile created: ${data.companyName}`,
        details: { companyName: data.companyName, action: 'created' },
      },
    })

    return NextResponse.json({ success: true, business })
  } catch (error) {
    console.error('Failed to create business:', error)
    return NextResponse.json({ error: 'Failed to create business' }, { status: 500 })
  }
}