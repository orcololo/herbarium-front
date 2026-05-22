'use client'

import React from 'react'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      {icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F5F5F5] text-[#9E9E9E]">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-[#1C1B1F]">{title}</h3>
      {description && <p className="max-w-sm text-sm text-[#49454F]">{description}</p>}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-2 rounded-lg bg-[#3D7A52] px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#2E5E3E] focus:outline-none focus:ring-2 focus:ring-[#3D7A52] focus:ring-offset-2"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
