export function buildBrandAnalyzePrompt(
  url: string,
  title: string,
  textContent: string
): string {
  return `You are an expert brand strategist. Analyze the following website content and extract structured brand information.

Website URL: ${url}
Page Title: ${title}

Content:
${textContent}

Return a JSON object with exactly these fields:
{
  "name": "short company or brand name",
  "industry": "industry or niche (e.g. SaaS, Dental, E-commerce)",
  "brandVoice": "detailed 2-4 sentence brand voice and personality (how they speak)",
  "targetAudience": "clear description of their ideal customer",
  "keyServices": "main products or services they offer",
  "keyDifferentiators": "what makes them unique (if obvious)",
  "primaryGoals": "likely marketing goals based on the site",
  "toneKeywords": "3-6 tone words, comma-separated",
  "contentPillars": "suggested content themes",
  "visualStyle": "specific brand colors (name hex codes if visible), logo style, mood, and aesthetic for image generation — be concrete e.g. navy #1a2b4c, gold accents, minimal wordmark",
  "preferredPlatforms": "suggested platforms comma-separated e.g. YouTube Shorts, Instagram, LinkedIn, X, TikTok"
}

Only return valid JSON. Be concise but high quality.`;
}

export const BRAND_ANALYZE_SYSTEM_PROMPT =
  "You are a world-class brand strategist. Always return clean JSON only.";
