'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { toast } from 'sonner'

interface CopyButtonProps {
  text: string
  label?: string
  variant?: 'primary' | 'secondary' | 'ghost'
  iconOnly?: boolean
  className?: string
}

export function CopyButton({
  text,
  label = 'Copy',
  variant = 'secondary',
  iconOnly = false,
  className = '',
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success('Copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }

  const variantClass =
    variant === 'primary'
      ? 'btn-primary'
      : variant === 'ghost'
        ? 'btn-ghost'
        : 'btn-secondary'

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`btn h-8 px-3 text-xs ${variantClass} ${className}`}
      title={label}
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {!iconOnly && (copied ? 'Copied' : label)}
    </button>
  )
}
