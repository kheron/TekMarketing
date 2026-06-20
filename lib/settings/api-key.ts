import { prisma } from '@/lib/db/prisma'
import type { AIProvider } from '@/lib/agent/types'
import { decryptSecret, encryptSecret } from './secrets'

export const XAI_API_KEY_SETTING = 'xai_api_key'

const PROVIDER_ENV: Record<AIProvider, string> = {
  openai: 'OPENAI_API_KEY',
  anthropic: 'ANTHROPIC_API_KEY',
  xai: 'XAI_API_KEY',
  google: 'GOOGLE_AI_API_KEY',
}

function settingKeyForProvider(provider: AIProvider): string {
  return `api_key_${provider}`
}

export async function getApiKey(provider: AIProvider): Promise<string | null> {
  const envVar = PROVIDER_ENV[provider]
  if (process.env[envVar]) return process.env[envVar]!
  const keysToTry = provider === 'xai' ? [XAI_API_KEY_SETTING, settingKeyForProvider('xai')] : [settingKeyForProvider(provider)]
  try {
    for (const key of keysToTry) {
      const setting = await prisma.appSetting.findUnique({ where: { key } })
      if (setting) return decryptSecret(setting.value)
    }
    return null
  } catch { return null }
}

export async function saveApiKey(provider: AIProvider, apiKey: string): Promise<void> {
  const key = provider === 'xai' ? XAI_API_KEY_SETTING : settingKeyForProvider(provider)
  const encrypted = encryptSecret(apiKey.trim())
  await prisma.appSetting.upsert({ where: { key }, create: { key, value: encrypted }, update: { value: encrypted } })
}

export async function removeApiKey(provider: AIProvider): Promise<void> {
  const keys = provider === 'xai' ? [XAI_API_KEY_SETTING, settingKeyForProvider('xai')] : [settingKeyForProvider(provider)]
  await prisma.appSetting.deleteMany({ where: { key: { in: keys } } })
}

export async function getApiKeyStatus(provider: AIProvider) {
  const envVar = PROVIDER_ENV[provider]
  if (process.env[envVar]) {
    const key = process.env[envVar]!
    return { configured: true, source: 'env' as const, masked: `${key.slice(0, 4)}••••••••${key.slice(-4)}` }
  }
  const keysToTry = provider === 'xai' ? [XAI_API_KEY_SETTING, settingKeyForProvider('xai')] : [settingKeyForProvider(provider)]
  for (const key of keysToTry) {
    const setting = await prisma.appSetting.findUnique({ where: { key } })
    if (!setting) continue
    try {
      const decrypted = decryptSecret(setting.value)
      return { configured: true, source: 'database' as const, masked: `${decrypted.slice(0, 4)}••••••••${decrypted.slice(-4)}` }
    } catch { continue }
  }
  return { configured: false, source: null, masked: null }
}

export async function getXaiApiKey() { return getApiKey('xai') }
export async function saveXaiApiKey(apiKey: string) { return saveApiKey('xai', apiKey) }
export async function removeXaiApiKey() { return removeApiKey('xai') }
export async function getXaiApiKeyStatus() { return getApiKeyStatus('xai') }

export const ACTIVE_PROVIDER_SETTING = 'active_ai_provider'
export const MONTHLY_BUDGET_SETTING = 'monthly_budget_usd'

export async function getActiveProvider(): Promise<AIProvider> {
  try {
    const setting = await prisma.appSetting.findUnique({ where: { key: ACTIVE_PROVIDER_SETTING } })
    const value = setting?.value as AIProvider | undefined
    if (value && ['openai', 'anthropic', 'xai', 'google'].includes(value)) return value
  } catch {}
  return 'xai'
}

export async function saveActiveProvider(provider: AIProvider) {
  await prisma.appSetting.upsert({ where: { key: ACTIVE_PROVIDER_SETTING }, create: { key: ACTIVE_PROVIDER_SETTING, value: provider }, update: { value: provider } })
}

export async function getMonthlyBudget(): Promise<number | null> {
  const setting = await prisma.appSetting.findUnique({ where: { key: MONTHLY_BUDGET_SETTING } })
  if (!setting) return null
  const n = parseFloat(setting.value)
  return Number.isFinite(n) ? n : null
}

export async function saveMonthlyBudget(usd: number | null) {
  if (usd == null) { await prisma.appSetting.deleteMany({ where: { key: MONTHLY_BUDGET_SETTING } }); return }
  await prisma.appSetting.upsert({ where: { key: MONTHLY_BUDGET_SETTING }, create: { key: MONTHLY_BUDGET_SETTING, value: String(usd) }, update: { value: String(usd) } })
}