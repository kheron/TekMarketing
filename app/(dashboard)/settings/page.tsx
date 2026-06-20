'use client'

import { useEffect, useState } from 'react'
import { Eye, EyeOff, Key, Loader2, Shield, Trash2, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { TekheroFooter } from '@/components/shared/TekheroFooter'
import { AI_PROVIDERS } from '@/lib/constants/ai-providers'
import type { AIProvider } from '@/lib/agent/types'
import {
  TEKHERO_COMMERCIAL_DOCS_URL,
  TEKHERO_CONTACT_EMAIL,
  TEKHERO_URL,
} from '@/lib/config/tekhero'

interface ProviderStatus {
  id: AIProvider
  label: string
  configured: boolean
  source: 'env' | 'database' | null
  masked: string | null
}

interface SettingsData {
  activeProvider: AIProvider
  monthlyBudgetUsd: number | null
  providers: ProviderStatus[]
}

interface ProductConfig {
  edition: 'open-core' | 'commercial'
  commercialMode: boolean
  licenseKeyConfigured: boolean
  telemetryOptIn: boolean
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData | null>(null)
  const [productConfig, setProductConfig] = useState<ProductConfig | null>(null)
  const [keys, setKeys] = useState<Partial<Record<AIProvider, string>>>({})
  const [showKey, setShowKey] = useState<Partial<Record<AIProvider, boolean>>>({})
  const [savingProvider, setSavingProvider] = useState<AIProvider | null>(null)
  const [testingProvider, setTestingProvider] = useState<AIProvider | null>(null)

  async function load() {
    const [settingsRes, configRes] = await Promise.all([
      fetch('/api/settings'),
      fetch('/api/config'),
    ])
    if (settingsRes.ok) setSettings(await settingsRes.json())
    if (configRes.ok) setProductConfig(await configRes.json())
  }

  useEffect(() => {
    load()
  }, [])

  async function saveKey(provider: AIProvider) {
    const apiKey = keys[provider]?.trim()
    if (!apiKey) {
      toast.error('Enter an API key')
      return
    }
    setSavingProvider(provider)
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, apiKey }),
      })
      if (!res.ok) throw new Error('Save failed')
      setKeys((k) => ({ ...k, [provider]: '' }))
      setSettings(await res.json())
      toast.success(`${provider} API key saved`)
    } catch {
      toast.error('Failed to save API key')
    } finally {
      setSavingProvider(null)
    }
  }

  async function removeKey(provider: AIProvider) {
    if (!confirm(`Remove stored ${provider} API key?`)) return
    try {
      const res = await fetch(`/api/settings?provider=${provider}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Remove failed')
      setSettings(await res.json())
      toast.success('API key removed')
    } catch {
      toast.error('Failed to remove key')
    }
  }

  async function setActive(provider: AIProvider) {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activeProvider: provider }),
    })
    if (res.ok) {
      setSettings(await res.json())
      toast.success(`Active provider set to ${provider}`)
    }
  }

  async function testConnection(provider: AIProvider) {
    setTestingProvider(provider)
    try {
      const res = await fetch('/api/ai/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(`Connected to ${provider} (${data.model})`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Connection failed')
    } finally {
      setTestingProvider(null)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-8 py-8">
      <PageHeader
        eyebrow="CONFIGURATION"
        title="Settings"
        description="Multi-provider AI configuration. Keys are encrypted at rest and never returned in full."
      />

      {settings && (
        <div className="mb-6 card p-4 flex items-center gap-3">
          <Zap className="w-5 h-5 text-blue-400" />
          <div className="text-sm">
            Active provider:{' '}
            <span className="font-medium text-[#f4f4f5]">{settings.activeProvider}</span>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {AI_PROVIDERS.map((config) => {
          const status = settings?.providers.find((p) => p.id === config.id)
          const isActive = settings?.activeProvider === config.id
          return (
            <div key={config.id} className="card p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                    <Key className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="font-medium">{config.label}</div>
                    <p className="text-sm text-[#71717a]">{config.description}</p>
                    {status?.configured && (
                      <div className="flex items-center gap-2 text-xs text-[#a1a1aa] mt-2">
                        <Shield className="w-3.5 h-3.5 text-emerald-400" />
                        via {status.source}
                        {status.masked && (
                          <span className="font-mono text-[#52525b]">{status.masked}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setActive(config.id)}
                  className={`btn h-8 px-3 text-xs ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {isActive ? 'Active' : 'Set active'}
                </button>
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showKey[config.id] ? 'text' : 'password'}
                    value={keys[config.id] || ''}
                    onChange={(e) =>
                      setKeys((k) => ({ ...k, [config.id]: e.target.value }))
                    }
                    placeholder={config.keyPlaceholder}
                    className="input w-full pr-10 font-mono text-sm"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowKey((s) => ({ ...s, [config.id]: !s[config.id] }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717a]"
                  >
                    {showKey[config.id] ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <button
                  onClick={() => saveKey(config.id)}
                  disabled={savingProvider === config.id || !keys[config.id]?.trim()}
                  className="btn btn-primary h-[42px] px-5 disabled:opacity-60"
                >
                  {savingProvider === config.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Save'
                  )}
                </button>
                <button
                  onClick={() => testConnection(config.id)}
                  disabled={testingProvider === config.id}
                  className="btn btn-secondary h-[42px] px-4"
                >
                  {testingProvider === config.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Test'
                  )}
                </button>
              </div>

              {status?.configured && status.source === 'database' && (
                <button
                  onClick={() => removeKey(config.id)}
                  className="btn btn-ghost text-red-400 text-sm flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove stored key
                </button>
              )}

              <p className="text-[11px] text-[#52525b]">
                Get a key at{' '}
                <a
                  href={config.keyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  {config.keyUrl.replace('https://', '')}
                </a>
              </p>
            </div>
          )
        })}
      </div>

      <div className="card p-6 mt-8 space-y-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-3 flex-1">
            <div>
              <div className="font-medium text-sm">TEKHERO Open Core</div>
              <p className="text-sm text-[#71717a] mt-1 leading-relaxed">
                TekMarketing is free for personal, educational, and non-commercial use.
                Business production, client delivery, SaaS hosting, and white-label
                deployments require a{' '}
                <a
                  href={TEKHERO_COMMERCIAL_DOCS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  commercial TEKHERO license
                </a>
                .
              </p>
            </div>

            {productConfig && (
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg bg-[#111113] border border-[#27272a] px-3 py-2">
                  <div className="text-[#52525b]">Edition</div>
                  <div className="text-[#f4f4f5] font-medium mt-0.5 capitalize">
                    {productConfig.edition.replace('-', ' ')}
                  </div>
                </div>
                <div className="rounded-lg bg-[#111113] border border-[#27272a] px-3 py-2">
                  <div className="text-[#52525b]">License key</div>
                  <div className="text-[#f4f4f5] font-medium mt-0.5">
                    {productConfig.licenseKeyConfigured ? 'Configured' : 'Not set'}
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3 text-sm">
              <a
                href={`mailto:${TEKHERO_CONTACT_EMAIL}`}
                className="text-blue-400 hover:underline"
              >
                {TEKHERO_CONTACT_EMAIL}
              </a>
              <a
                href={TEKHERO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#a1a1aa] hover:text-white transition-colors"
              >
                tekhero.us →
              </a>
            </div>

            <TekheroFooter variant="compact" />
          </div>
        </div>
      </div>
    </div>
  )
}