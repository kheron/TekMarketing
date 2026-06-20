import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { BrandContextSchema } from '@/lib/agent/types'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params
  try {
    const business = await prisma.brandContext.findUnique({ where: { id } })
    if (!business) return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    return NextResponse.json({ business })
  } catch (error) {
    console.error('Failed to load business:', error)
    return NextResponse.json({ error: 'Failed to load business' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { id } = await context.params
  try {
    const body = await request.json()
    const parsed = BrandContextSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid business data', details: parsed.error.flatten() }, { status: 400 })
    const data = parsed.data
    const business = await prisma.brandContext.update({ where: { id }, data: { companyName: data.companyName, voiceDescription: data.voiceDescription, targetAudience: data.targetAudience, productsServices: data.productsServices, keyDifferentiators: data.keyDifferentiators ?? null, primaryGoals: data.primaryGoals, contentPillars: data.contentPillars ?? null, preferredPlatforms: data.preferredPlatforms, toneKeywords: data.toneKeywords ?? null, doNotSay: data.doNotSay ?? null, industry: data.industry ?? null, website: data.website || null, visualStyle: data.visualStyle ?? null, logoDataUrl: data.logoDataUrl ?? null, additionalContext: data.additionalContext ?? null } })
    await prisma.activityLog.create({ data: { type: 'BRAND_UPDATED', summary: `Business profile updated: ${data.companyName}`, details: { companyName: data.companyName, action: 'updated' } } })
    return NextResponse.json({ success: true, business })
  } catch (error) {
    console.error('Failed to update business:', error)
    return NextResponse.json({ error: 'Failed to update business' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params
  try {
    const existing = await prisma.brandContext.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    await prisma.brandContext.delete({ where: { id } })
    if (existing.isActive) {
      const next = await prisma.brandContext.findFirst({ orderBy: { updatedAt: 'desc' } })
      if (next) await prisma.brandContext.update({ where: { id: next.id }, data: { isActive: true } })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete business:', error)
    return NextResponse.json({ error: 'Failed to delete business' }, { status: 500 })
  }
}