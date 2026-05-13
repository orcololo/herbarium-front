'use client'

import React from 'react'
import { AlertCircle, RotateCcw } from 'lucide-react'

interface ErrorBannerProps {
  message: string
  onRetry?: () => void
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className="flex items-center gap-3 rounded-[8px] border border-red-200 bg-red-50 px-4 py-3"
    >
      <AlertCircle size={18} className="shrink-0 text-red-600" aria-hidden="true" />
      <span className="flex-1 text-sm text-red-800">{message}</span>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="flex items-center gap-1 rounded-[8px] px-3 py-1.5 text-xs font-medium text-red-700 transition-colors duration-200 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1"
          aria-label="Tentar novamente"
        >
          <RotateCcw size={14} />
          Tentar novamente
        </button>
      )}
    </div>
  )
}
