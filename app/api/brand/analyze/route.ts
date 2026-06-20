import { NextRequest, NextResponse } from 'next/server'
import { getXaiApiKey } from '@/lib/settings/api-key'

export async function POST(request: NextRequest) {
  let { url } = await request.json()
  if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  const apiKey = await getXaiApiKey()
  if (!apiKey) return NextResponse.json({ error: 'XAI_API_KEY is not configured. Add it in Settings or your .env.local file.' }, { status: 500 })
  url = url.trim()
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'TekMarketingBot/1.0' } })
    if (!res.ok) throw new Error(`Failed to fetch website (status ${res.status})`)
    const html = await res.text()
    const titleMatch = html.match(/<title>(.*?)<\/title>/i)
    const title = titleMatch ? titleMatch[1] : ''
    const textContent = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 8000)
    const prompt = `You are an expert brand strategist. Analyze the following website content and extract structured brand information.\n\nWebsite URL: ${url}\nPage Title: ${title}\n\nContent:\n${textContent}\n\nReturn a JSON object with exactly these fields:\n{\n  "companyName": "short company name",\n  "voiceDescription": "detailed 2-4 sentence brand voice and personality (how they speak)",\n  "targetAudience": "clear description of their ideal customer",\n  "productsServices": "main products or services they offer",\n  "keyDifferentiators": "what makes them unique (if obvious)",\n  "primaryGoals": "likely marketing goals based on the site",\n  "toneKeywords": "3-6 tone words",\n  "contentPillars": "suggested content themes"\n}\n\nOnly return valid JSON. Be concise but high quality.`
    const xaiRes = await fetch('https://api.x.ai/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` }, body: JSON.stringify({ model: 'grok-3', messages: [{ role: 'system', content: 'You are a world-class brand strategist. Always return clean JSON only.' }, { role: 'user', content: prompt }], temperature: 0.4 }) })
    if (!xaiRes.ok) { const errorBody = await xaiRes.text(); console.error('xAI API error:', xaiRes.status, errorBody); throw new Error(`xAI API error (${xaiRes.status}): ${errorBody}`) }
    const xaiData = await xaiRes.json()
    const raw = xaiData.choices?.[0]?.message?.content || '{}'
    let parsed
    try { parsed = JSON.parse(raw.replace(/```json|```/g, '').trim()) } catch { parsed = {} }
    return NextResponse.json({ success: true, data: { companyName: parsed.companyName || title.split('|')[0].trim() || '', voiceDescription: parsed.voiceDescription || '', targetAudience: parsed.targetAudience || '', productsServices: parsed.productsServices || '', keyDifferentiators: parsed.keyDifferentiators || '', primaryGoals: parsed.primaryGoals || '', toneKeywords: parsed.toneKeywords || '', contentPillars: parsed.contentPillars || '', preferredPlatforms: 'X,LinkedIn,Instagram,Email' } })
  } catch (error: any) {
    console.error('Brand analysis error:', error)
    let message = 'Could not analyze the website. Please fill the form manually.'
    if (error.message?.includes('Invalid URL') || error.code === 'ERR_INVALID_URL') message = 'Invalid website URL. Please include https:// or use a valid domain (e.g. example.com)'
    else if (error.message?.includes('Failed to fetch')) message = 'Could not reach that website. Please check the URL or try again later.'
    else if (error.message?.includes('xAI API error')) message = error.message
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
