'use client'

import React from 'react'
import { clsx } from 'clsx'

const shimmer = 'animate-pulse bg-[#F5F5F5]'

export function SkeletonLine({ className }: { className?: string }) {
  return <div className={clsx(shimmer, 'h-4 w-full rounded-lg', className)} aria-hidden="true" />
}

export function SkeletonCircle({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <div
      className={clsx(shimmer, 'rounded-full', className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  )
}

export function SkeletonCard() {
  return (
    <div
      className="flex flex-col gap-3 rounded-2xl bg-[#FFFFFF] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
      aria-hidden="true"
    >
      <div className="flex items-center gap-3">
        <SkeletonCircle size={40} />
        <div className="flex flex-1 flex-col gap-2">
          <SkeletonLine className="h-5 w-1/3" />
          <SkeletonLine className="h-3 w-1/2" />
        </div>
      </div>
      <SkeletonLine className="h-3 w-full" />
      <SkeletonLine className="h-3 w-4/5" />
    </div>
  )
}
