'use client'

import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { clsx } from 'clsx'

interface StatCardProps {
  icon: React.ReactNode
  value: string | number
  label: string
  trend?: { value: number; positive: boolean }
  className?: string
}

export function StatCard({ icon, value, label, trend, className }: StatCardProps) {
  return (
    <div
      className={clsx(
        'flex items-start gap-4 rounded-2xl bg-[#FFFFFF] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition-shadow duration-200 hover:shadow-[0_2px_6px_rgba(0,0,0,0.12)]',
        className
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E8F5E9] text-[#3D7A52]">
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-2xl font-semibold text-[#1C1B1F]">{value}</span>
        <span className="text-sm text-[#49454F]">{label}</span>
        {trend && (
          <span
            className={clsx(
              'mt-1 flex items-center gap-1 text-xs font-medium',
              trend.positive ? 'text-[#3D7A52]' : 'text-red-600'
            )}
            aria-label={`Trend: ${trend.positive ? 'up' : 'down'} ${trend.value}%`}
          >
            {trend.positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {trend.value}%
          </span>
        )}
      </div>
    </div>
  )
}
