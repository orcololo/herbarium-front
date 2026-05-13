'use client'

import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { clsx } from 'clsx'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  function getPages(): (number | '...')[] {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    const pages: (number | '...')[] = [1]
    if (page > 3) pages.push('...')
    const start = Math.max(2, page - 1)
    const end = Math.min(totalPages - 1, page + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (page < totalPages - 2) pages.push('...')
    pages.push(totalPages)
    return pages
  }

  const baseBtn =
    'flex h-8 min-w-8 items-center justify-center rounded-[8px] text-sm font-medium transition-colors duration-200'

  return (
    <nav aria-label="Pagination" className={clsx('flex items-center gap-1', className)}>
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className={clsx(baseBtn, 'px-2 text-[#49454F] hover:bg-[#F5F5F5] disabled:opacity-40 disabled:hover:bg-transparent')}
      >
        <ChevronLeft size={16} />
      </button>
      {getPages().map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="px-1 text-sm text-[#9E9E9E]">
            ...
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            aria-current={p === page ? 'page' : undefined}
            aria-label={`Page ${p}`}
            className={clsx(
              baseBtn,
              p === page
                ? 'bg-[#3D7A52] text-white'
                : 'text-[#49454F] hover:bg-[#F5F5F5]'
            )}
          >
            {p}
          </button>
        )
      )}
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
        className={clsx(baseBtn, 'px-2 text-[#49454F] hover:bg-[#F5F5F5] disabled:opacity-40 disabled:hover:bg-transparent')}
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  )
}
