import type { BrandContext } from '@prisma/client'
import type { BrandContextInput, BusinessProfile } from '@/lib/agent/types'

/** Convert Prisma BrandContext → TekSocial-compatible BusinessProfile for AI prompts */
export function brandContextToBusinessProfile(brand: BrandContext): BusinessProfile {
  return {
    id: brand.id,
    name: brand.companyName,
    brandVoice: brand.voiceDescription,
    industry: brand.industry || 'General',
    website: brand.website || '',
    targetAudience: brand.targetAudience,
    keyServices: brand.productsServices,
    keyDifferentiators: brand.keyDifferentiators ?? undefined,
    primaryGoals: brand.primaryGoals,
    contentPillars: brand.contentPillars ?? undefined,
    preferredPlatforms: brand.preferredPlatforms,
    toneKeywords: brand.toneKeywords ?? undefined,
    doNotSay: brand.doNotSay ?? undefined,
    visualStyle: brand.visualStyle ?? undefined,
    logoDataUrl: brand.logoDataUrl ?? undefined,
    additionalContext: brand.additionalContext ?? undefined,
    createdAt: brand.createdAt.toISOString(),
    updatedAt: brand.updatedAt.toISOString(),
  }
}

/** Map website analyze response → BrandContextInput fields */
export function mapAnalyzeToBrandInput(
  parsed: Record<string, unknown>,
  url: string,
  pageTitle = ''
): Partial<BrandContextInput> {
  return {
    companyName:
      String(parsed.name || parsed.companyName || pageTitle.split('|')[0]?.trim() || ''),
    industry: String(parsed.industry || ''),
    voiceDescription: String(parsed.brandVoice || parsed.voiceDescription || ''),
    targetAudience: String(parsed.targetAudience || ''),
    productsServices: String(parsed.keyServices || parsed.productsServices || ''),
    keyDifferentiators: parsed.keyDifferentiators
      ? String(parsed.keyDifferentiators)
      : undefined,
    primaryGoals: String(parsed.primaryGoals || ''),
    toneKeywords: parsed.toneKeywords ? String(parsed.toneKeywords) : undefined,
    contentPillars: parsed.contentPillars ? String(parsed.contentPillars) : undefined,
    visualStyle: parsed.visualStyle ? String(parsed.visualStyle) : undefined,
    preferredPlatforms:
      String(parsed.preferredPlatforms || '') ||
      'YouTube Shorts, Instagram, LinkedIn, X, TikTok',
    website: url,
  }
}
