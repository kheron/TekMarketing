'use server'

import { prisma } from '@/lib/db/prisma'
import { BrandContextSchema, type BrandContextInput } from '@/lib/agent/types'
import { revalidatePath } from 'next/cache'

export async function saveBrandContext(input: BrandContextInput) {
  const parsed = BrandContextSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten() }
  }

  const data = parsed.data
  const existing = await prisma.brandContext.findFirst()

  if (existing) {
    await prisma.brandContext.update({
      where: { id: existing.id },
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
      },
    })
  } else {
    await prisma.brandContext.create({
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
      },
    })
  }

  await prisma.activityLog.create({
    data: {
      type: 'BRAND_UPDATED',
      summary: `Brand context updated for ${data.companyName}`,
      details: { companyName: data.companyName },
    },
  })

  revalidatePath('/brand')
  revalidatePath('/')
  return { success: true }
}

export async function getBrandContext() {
  return prisma.brandContext.findFirst()
}
