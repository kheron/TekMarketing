import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params
  try {
    const business = await prisma.brandContext.findUnique({ where: { id } })
    if (!business) return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    await prisma.brandContext.updateMany({ data: { isActive: false } })
    const updated = await prisma.brandContext.update({ where: { id }, data: { isActive: true } })
    await prisma.activityLog.create({ data: { type: 'BRAND_UPDATED', summary: `Active business switched to ${updated.companyName}`, details: { companyName: updated.companyName, action: 'activated' } } })
    return NextResponse.json({ success: true, business: updated })
  } catch (error) {
    console.error('Failed to activate business:', error)
    return NextResponse.json({ error: 'Failed to activate business' }, { status: 500 })
  }
}