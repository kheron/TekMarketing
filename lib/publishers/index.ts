import type { ContentItem } from '@prisma/client'
import { prisma } from '@/lib/db/prisma'

export interface PublishResult {
  success: boolean
  platformPostId?: string
  error?: string
  url?: string
}

export async function publishContent(itemId: string): Promise<PublishResult> {
  const item = await prisma.contentItem.findUnique({ where: { id: itemId } })
  if (!item) return { success: false, error: 'Content item not found' }
  if (!['APPROVED', 'SCHEDULED'].includes(item.status)) {
    return { success: false, error: `Item is not in a publishable state (current: ${item.status})` }
  }
  console.log(`[Publisher] Attempting to publish item ${itemId} to ${item.platform}...`)
  try {
    let result: PublishResult
    switch (item.platform) {
      case 'X': result = await publishToX(item); break
      case 'LINKEDIN': result = await publishToLinkedIn(item); break
      default: result = { success: false, error: `Publishing to ${item.platform} is not yet supported` }
    }
    if (result.success) {
      await prisma.contentItem.update({ where: { id: itemId }, data: { status: 'PUBLISHED', publishedAt: new Date() } })
      await prisma.activityLog.create({ data: { type: 'CONTENT_PUBLISHED', summary: `Published to ${item.platform}`, details: { contentItemId: itemId, platformPostId: result.platformPostId, url: result.url }, contentItemId: itemId } })
    }
    return result
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown publishing error'
    return { success: false, error: message }
  }
}

async function publishToX(_item: ContentItem): Promise<PublishResult> {
  await new Promise((res) => setTimeout(res, 800))
  return { success: true, platformPostId: 'simulated_' + Date.now(), url: `https://x.com/user/status/simulated_${Date.now()}` }
}

async function publishToLinkedIn(_item: ContentItem): Promise<PublishResult> {
  await new Promise((res) => setTimeout(res, 800))
  return { success: true, platformPostId: 'li_sim_' + Date.now(), url: `https://linkedin.com/feed/update/simulated_${Date.now()}` }
}