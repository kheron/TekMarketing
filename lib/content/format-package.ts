import type { ContentEpisodePayload, PlatformContent, SocialPlatform, SocialPostContent } from '@/lib/agent/types'
import { getPlatformLabel } from '@/lib/constants/platforms'

function socialPostText(data: SocialPostContent): string {
  if (data.format === 'THREAD') return data.body
  const parts = [data.hook, data.body]
  if (data.cta) parts.push(data.cta)
  const hashtags = data.hashtags?.length ? '\n\n' + data.hashtags.map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' ') : ''
  return parts.filter(Boolean).join('\n\n') + hashtags
}

export function formatPlatformForCopy(platform: SocialPlatform, content: PlatformContent): string {
  switch (platform) {
    case 'x': case 'linkedin': case 'facebook': { const data = content[platform]; if (!data) return ''; return socialPostText(data) }
    case 'instagram': { const data = content.instagram; if (!data) return ''; const hashtags = data.hashtags.map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' '); return `${data.hook}\n\n${data.caption}\n\n${hashtags}` }
    case 'tiktok': { const data = content.tiktok; if (!data) return ''; const script = `${data.script.hook}\n\n${data.script.body}\n\n${data.script.cta}`; const tags = data.hashtags.map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' '); return `CAPTION:\n${data.caption}\n\n---\nSCRIPT (voiceover):\n${script}\n\n---\nHASHTAGS:\n${tags}` }
    case 'youtube_short': {
      const data = content.youtube_short
      if (!data) return ''
      const scriptObj =
        typeof data.script === 'string'
          ? { hook: '', body: data.script, cta: '' }
          : data.script
      if (!scriptObj) return ''
      const script = `${scriptObj.hook}\n\n${scriptObj.body}\n\n${scriptObj.cta}`
      if (!data.youtube?.titleOptions?.length) {
        return ['SCRIPT:', script].join('\n')
      }
      const titles = data.youtube.titleOptions.map((t, i) => `${i + 1}. ${t}`).join('\n')
      return ['TITLE OPTIONS:', titles, '', 'DESCRIPTION:', data.youtube.description, '', 'TAGS:', data.youtube.tags.join(', '), '', 'SCRIPT:', script].join('\n')
    }
    case 'youtube_long': { const data = content.youtube_long; if (!data) return ''; const titles = data.youtube.titleOptions.map((t, i) => `${i + 1}. ${t}`).join('\n'); return ['TITLE OPTIONS:', titles, '', 'DESCRIPTION:', data.youtube.description, '', 'TAGS:', data.youtube.tags.join(', '), '', 'SCRIPT:', data.script].join('\n') }
    default: return ''
  }
}

export function formatFullPackage(topic: string, payload: ContentEpisodePayload): string {
  const sections = [`# Content Package`, `Topic: ${topic}`, '', `## Strategy`, payload.strategyNote, '', `---`, '']
  for (const platform of payload.platforms) {
    const text = formatPlatformForCopy(platform, payload.content)
    if (!text) continue
    sections.push(`## ${getPlatformLabel(platform)}`, text, '', '---', '')
  }
  return sections.join('\n').trim()
}

export function getPlatformCopyLabel(platform: SocialPlatform): string {
  const labels: Record<SocialPlatform, string> = { x: 'Copy X post', linkedin: 'Copy LinkedIn post', facebook: 'Copy Facebook post', instagram: 'Copy Instagram caption', tiktok: 'Copy TikTok package', youtube_short: 'Copy YouTube Shorts package', youtube_long: 'Copy YouTube video package' }
  return labels[platform]
}