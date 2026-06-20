import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { BrandContextSchema } from '@/lib/agent/types'

export async function GET() {
  try {
    const brand = await prisma.brandContext.findFirst({ where: { isActive: true }, orderBy: { updatedAt: 'desc' } }) ?? await prisma.brandContext.findFirst({ orderBy: { updatedAt: 'desc' } })
    return NextResponse.json({ brand })
  } catch (error) {
    console.error('Failed to load brand:', error)
    return NextResponse.json({ error: 'Failed to load brand context' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = BrandContextSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid brand data', details: parsed.error.flatten() }, { status: 400 })
    const data = parsed.data
    const existing = await prisma.brandContext.findFirst()
    let brand
    if (existing) {
      brand = await prisma.brandContext.update({ where: { id: existing.id }, data: { companyName: data.companyName, voiceDescription: data.voiceDescription, targetAudience: data.targetAudience, productsServices: data.productsServices, keyDifferentiators: data.keyDifferentiators ?? null, primaryGoals: data.primaryGoals, contentPillars: data.contentPillars ?? null, preferredPlatforms: data.preferredPlatforms, toneKeywords: data.toneKeywords ?? null, doNotSay: data.doNotSay ?? null } })
    } else {
      brand = await prisma.brandContext.create({ data: { companyName: data.companyName, voiceDescription: data.voiceDescription, targetAudience: data.targetAudience, productsServices: data.productsServices, keyDifferentiators: data.keyDifferentiators ?? null, primaryGoals: data.primaryGoals, contentPillars: data.contentPillars ?? null, preferredPlatforms: data.preferredPlatforms, toneKeywords: data.toneKeywords ?? null, doNotSay: data.doNotSay ?? null } })
    }
    await prisma.activityLog.create({ data: { type: 'BRAND_UPDATED', summary: `Brand context updated for ${data.companyName}`, details: { companyName: data.companyName } } })
    return NextResponse.json({ success: true, brand })
  } catch (error) {
    console.error('Failed to save brand:', error)
    return NextResponse.json({ error: 'Failed to save brand context' }, { status: 500 })
  }
}
