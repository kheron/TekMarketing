import { z } from 'zod'

// ============================================
// AI Provider
// ============================================
export const AIProviderSchema = z.enum(['openai', 'anthropic', 'xai', 'google'])
export type AIProvider = z.infer<typeof AIProviderSchema>

// ============================================
// Brand Context (TekMarketing DB model)
// ============================================
export const BrandContextSchema = z.object({
  companyName: z.string().min(2),
  voiceDescription: z.string().min(50),
  targetAudience: z.string().min(30),
  productsServices: z.string().min(10),
  keyDifferentiators: z.string().optional(),
  primaryGoals: z.string().min(10),
  contentPillars: z.string().optional(),
  preferredPlatforms: z.string().min(1),
  toneKeywords: z.string().optional(),
  doNotSay: z.string().optional(),
  industry: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  visualStyle: z.string().optional(),
  logoDataUrl: z.string().optional(),
  additionalContext: z.string().optional(),
})

export type BrandContextInput = z.infer<typeof BrandContextSchema>

// ============================================
// Business profile (TekSocial-compatible shape for AI prompts)
// ============================================
export const BusinessProfileInputSchema = z.object({
  name: z.string().min(2),
  brandVoice: z.string().min(50),
  industry: z.string().min(2),
  website: z.string().url().optional().or(z.literal('')),
  targetAudience: z.string().min(30),
  keyServices: z.string().min(10),
  keyDifferentiators: z.string().optional(),
  primaryGoals: z.string().min(10),
  contentPillars: z.string().optional(),
  preferredPlatforms: z.string().optional(),
  toneKeywords: z.string().optional(),
  doNotSay: z.string().optional(),
  visualStyle: z.string().optional(),
  logoDataUrl: z.string().optional(),
  additionalContext: z.string().optional(),
})

export type BusinessProfileInput = z.infer<typeof BusinessProfileInputSchema>

export interface BusinessProfile extends BusinessProfileInput {
  id: string
  createdAt: string
  updatedAt: string
}

// ============================================
// Social Platforms (Content Studio)
// ============================================
export const SocialPlatformSchema = z.enum([
  'youtube_short',
  'youtube_long',
  'tiktok',
  'instagram',
  'x',
  'linkedin',
  'facebook',
])
export type SocialPlatform = z.infer<typeof SocialPlatformSchema>

export const ScenePromptSchema = z.object({
  sceneNumber: z.number(),
  description: z.string(),
  prompt: z.string(),
})

export const ThumbnailSchema = z.object({
  concept: z.string(),
  prompt: z.string(),
})

export const YouTubeMetadataSchema = z.object({
  titleOptions: z.array(z.string()).min(3).max(5),
  description: z.string(),
  tags: z.array(z.string()).min(5),
})

export const VideoScriptSchema = z.object({
  hook: z.string().min(1),
  body: z.string().min(1),
  cta: z.string().min(1),
  estimatedDurationSec: z.number().min(30).max(600).default(75),
})

export const SocialPostFormatSchema = z.enum(['POST', 'THREAD', 'CAROUSEL'])
export const InstagramFormatSchema = z.enum(['REEL', 'POST', 'CAROUSEL', 'STORY'])

export const YouTubeShortContentSchema = z.object({
  script: VideoScriptSchema,
  imagePrompts: z.array(ScenePromptSchema).min(4).max(6),
  thumbnail: ThumbnailSchema,
  youtube: YouTubeMetadataSchema,
})

export const YouTubeLongContentSchema = z.object({
  outline: z.array(
    z.object({
      section: z.string(),
      durationSec: z.number(),
      talkingPoints: z.array(z.string()),
    })
  ),
  script: z.string().min(100),
  brollPrompts: z.array(ScenePromptSchema).min(6).max(12),
  thumbnail: ThumbnailSchema,
  youtube: YouTubeMetadataSchema,
})

export const TikTokContentSchema = z.object({
  script: VideoScriptSchema,
  onScreenText: z.array(z.string()).min(3).max(8),
  hashtags: z.array(z.string()).min(5).max(15),
  scenePrompts: z.array(ScenePromptSchema).min(4).max(6),
  musicMood: z.string().optional(),
  caption: z.string(),
})

export const SocialPostContentSchema = z.object({
  format: SocialPostFormatSchema.default('POST'),
  hook: z.string().min(1),
  body: z.string().min(1),
  hashtags: z.array(z.string()).min(3).max(10),
  suggestedMedia: z.string().optional(),
  imagePrompt: z.string().optional(),
  cta: z.string().optional(),
})

export const InstagramContentSchema = z.object({
  format: InstagramFormatSchema.default('REEL'),
  caption: z.string().min(1),
  hook: z.string().min(1),
  hashtags: z.array(z.string()).min(5).max(30),
  reelScript: VideoScriptSchema.optional(),
  carouselSlides: z
    .array(
      z.object({
        slideNumber: z.number(),
        headline: z.string(),
        body: z.string(),
        imagePrompt: z.string(),
      })
    )
    .optional(),
  imagePrompt: z.string().optional(),
})

export const PlatformContentSchema = z.object({
  youtube_short: YouTubeShortContentSchema.optional(),
  youtube_long: YouTubeLongContentSchema.optional(),
  tiktok: TikTokContentSchema.optional(),
  instagram: InstagramContentSchema.optional(),
  x: SocialPostContentSchema.optional(),
  linkedin: SocialPostContentSchema.optional(),
  facebook: SocialPostContentSchema.optional(),
})

export type PlatformContent = z.infer<typeof PlatformContentSchema>
export type SocialPostContent = z.infer<typeof SocialPostContentSchema>

export const ContentEpisodePayloadSchema = z
  .object({
    platforms: z.array(SocialPlatformSchema).min(1),
    strategyNote: z.string().min(20),
    agentReasoning: z.string().min(20),
    content: PlatformContentSchema,
  })
  .refine(
    (data) => data.platforms.every((platform) => data.content[platform] !== undefined),
    { message: 'Each selected platform must have corresponding content' }
  )

export type ContentEpisodePayload = z.infer<typeof ContentEpisodePayloadSchema>

export interface ContentEpisode extends ContentEpisodePayload {
  id: string
  businessId: string
  topic: string
  provider: AIProvider
  createdAt: string
}

// ============================================
// Planning cycle (autonomous agent)
// ============================================
export const ContentProposalSchema = z.object({
  platform: z.enum(['X', 'LINKEDIN']).default('X'),
  format: z.enum(['POST', 'THREAD', 'CAROUSEL', 'IMAGE', 'VIDEO']).default('POST'),
  title: z.string().optional(),
  body: z.string().min(1).default(''),
  suggestedMedia: z.string().optional(),
  agentReasoning: z.string().min(1).default('Generated by agent'),
  confidence: z.number().min(0).max(1).default(0.65),
})

export type ContentProposal = z.infer<typeof ContentProposalSchema>

export const PlanningCycleResultSchema = z.object({
  strategyNote: z.string().min(20),
  proposals: z.array(ContentProposalSchema).min(1).max(8),
})

export type PlanningCycleResult = z.infer<typeof PlanningCycleResultSchema>

export interface AgentContext {
  brand: unknown
  recentActivity: unknown[]
  recentContent: unknown[]
}
