import type { BusinessProfile, SocialPlatform } from "@/lib/agent/types";
import { getPlatformLabel } from "@/lib/constants/platforms";

export interface BrandedImagePromptInput {
  business: BusinessProfile;
  scenePrompt: string;
  topic: string;
  postContext?: string;
  sceneDescription?: string;
  platform?: SocialPlatform;
  purpose?: string;
  /** When true, prompt leaves space for client-side logo overlay */
  hasUploadedLogo?: boolean;
}

export function stripLogoFromBusiness(
  business: BusinessProfile
): BusinessProfile {
  return { ...business, logoDataUrl: undefined };
}

function truncate(text: string, maxLength: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 3)}...`;
}

/**
 * Wraps a scene/image prompt with business brand identity and post context
 * so image models produce on-brand, post-relevant visuals.
 */
export function buildBrandedImagePrompt(input: BrandedImagePromptInput): string {
  const {
    business,
    scenePrompt,
    topic,
    postContext,
    sceneDescription,
    platform,
    purpose,
    hasUploadedLogo = Boolean(business.logoDataUrl),
  } = input;

  const visualStyle =
    business.visualStyle?.trim() ||
    "Professional, clean design with cohesive brand colors";
  const tone = business.toneKeywords?.trim() || business.brandVoice;
  const platformLabel = platform ? getPlatformLabel(platform) : undefined;

  const sections = [
    `Create a branded social media image for "${business.name}".`,
    "",
    "BRAND IDENTITY (required — follow strictly):",
    `- Company / brand name: ${business.name}`,
    `- Industry: ${business.industry}`,
    `- Brand colors & visual style: ${visualStyle}`,
    `- Brand mood & tone: ${truncate(tone, 300)}`,
    business.website
      ? `- Brand website for identity reference: ${business.website}`
      : null,
    business.keyServices
      ? `- What they offer: ${truncate(business.keyServices, 200)}`
      : null,
    hasUploadedLogo
      ? `- The official brand logo will be added separately — do NOT draw, invent, or duplicate a logo/wordmark in the scene`
      : `- Display the company name "${business.name}" as a clear, readable logo or wordmark in the image`,
    hasUploadedLogo
      ? `- Leave clean, uncluttered space in the bottom-right corner for the logo overlay`
      : null,
    `- Color palette MUST prominently use the brand colors described above — avoid generic or unrelated color schemes`,
    `- Visual design must feel native to ${business.name}, not a stock generic template`,
    "",
    "CONTENT THIS IMAGE SUPPORTS:",
    `- Campaign topic: ${topic}`,
    platformLabel ? `- Platform: ${platformLabel}` : null,
    purpose ? `- Image role: ${purpose}` : null,
    postContext
      ? `- Post copy (image must visually support this message):\n${truncate(postContext, 600)}`
      : null,
    sceneDescription ? `- Scene: ${sceneDescription}` : null,
    "",
    "VISUAL BRIEF:",
    scenePrompt.trim(),
    "",
    `The image must clearly relate to BOTH the post content AND ${business.name}'s brand. A viewer should immediately associate it with this company and this specific post topic.`,
  ];

  return sections.filter((line) => line !== null).join("\n");
}
