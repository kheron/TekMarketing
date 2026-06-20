'use client'

import { Download } from 'lucide-react'
import { toast } from 'sonner'

interface DownloadTextButtonProps {
  text: string
  filename: string
  label?: string
  variant?: 'primary' | 'secondary' | 'ghost'
}

export function DownloadTextButton({
  text,
  filename,
  label = 'Download',
  variant = 'secondary',
}: DownloadTextButtonProps) {
  function handleDownload() {
    try {
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = filename.endsWith('.txt') ? filename : `${filename}.txt`
      anchor.click()
      URL.revokeObjectURL(url)
      toast.success('Download started')
    } catch {
      toast.error('Failed to download')
    }
  }

  const variantClass =
    variant === 'primary' ? 'btn-primary' : variant === 'ghost' ? 'btn-ghost' : 'btn-secondary'

  return (
    <button type="button" onClick={handleDownload} className={`btn h-8 px-3 text-xs ${variantClass}`}>
      <Download className="w-3.5 h-3.5" />
      {label}
    </button>
  )
}
