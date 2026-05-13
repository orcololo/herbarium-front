'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { clsx } from 'clsx'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  debounceMs?: number
  className?: string
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  debounceMs = 300,
  className,
}: SearchInputProps) {
  const [internal, setInternal] = useState(value)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setInternal(value)
  }, [value])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value
    setInternal(next)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => onChange(next), debounceMs)
  }

  function handleClear() {
    setInternal('')
    onChange('')
  }

  return (
    <div className={clsx('relative', className)}>
      <Search
        size={18}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9E9E9E]"
        aria-hidden="true"
      />
      <input
        type="search"
        value={internal}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full rounded-[8px] border border-[#DDDDDD] bg-[#FFFFFF] py-2 pl-10 pr-9 text-sm text-[#1C1B1F] placeholder-[#9E9E9E] shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition-colors duration-200 focus:border-[#3D7A52] focus:outline-none focus:ring-1 focus:ring-[#3D7A52]"
      />
      {internal && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9E9E9E] transition-colors duration-200 hover:text-[#1C1B1F]"
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
}
