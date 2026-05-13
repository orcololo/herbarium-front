'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { api, type Species } from '@/lib/api'
import clsx from 'clsx'

function SkeletonRow() {
  return (
    <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-6 py-5 flex items-center gap-5 border border-transparent">
      <div className="w-10 h-10 rounded-full shimmer flex-shrink-0" />
      <div className="flex-1 space-y-2.5">
        <div className="h-4 w-40 shimmer rounded-full" />
        <div className="h-3 w-24 shimmer rounded-full" />
      </div>
      <div className="h-6 w-20 shimmer rounded-full" />
    </div>
  )
}

export default function SpeciesPage() {
  const [items, setItems] = useState<Species[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const LIMIT = 25

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.species.list({ page, limit: LIMIT, search: debouncedSearch || undefined })
      setItems(res.data)
      setTotal(res.total)
    } catch {
      setError('Failed to load species.')
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch])

  useEffect(() => { load() }, [load])

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#E8F5E9] flex items-center justify-center text-[#3D7A52] shadow-sm">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 5C12 5 9 8 9 11M12 5C12 5 15 8 15 11M12 19C12 19 9 16 9 13M12 19C12 19 15 16 15 13M5 12C5 12 8 9 11 9M19 12C19 12 16 9 13 9M5 12C5 12 8 15 11 15M19 12C19 12 16 15 13 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-[#1C1B1F] tracking-tight">Taxonomy</h1>
            <p className="text-sm text-[#6D4C41] mt-0.5">{total} species recorded</p>
          </div>
        </div>
        <Link
          href="/species/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#3D7A52] text-white text-sm font-medium shadow-[0_2px_8px_rgba(61,122,82,0.3)] hover:bg-[#2D5F3F] hover:-translate-y-0.5 transition-all duration-200"
        >
          <Plus size={16} strokeWidth={2.5} />
          New Species
        </Link>
      </header>

      <div className="mb-6">
        <div className="relative max-w-md">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9E9E9E]" width="18" height="18" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M11 11L13.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            type="search"
            placeholder="Search species by name, family…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-11 pr-4 py-3 rounded-full bg-white border border-[#EEEEEE] text-sm text-[#1C1B1F] placeholder:text-[#AAAAAA] outline-none focus:border-[#3D7A52] shadow-sm transition-all duration-200"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-[#FFEBEE] text-[#C62828] px-4 py-3 rounded-[12px] mb-6 text-sm border border-[#FFCDD2]">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 5V8M8 11H8.01M2 8C2 4.686 4.686 2 8 2s6 2.686 6 6-2.686 6-6 6-6-2.686-6-6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          {error}
          <button onClick={load} className="ml-auto text-xs font-medium underline hover:no-underline">Retry</button>
        </div>
      )}

      <div className="space-y-3">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
          : items.map(sp => (
            <Link key={sp.id} href={`/species/${sp.id}`} className="block">
              <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-6 py-5 flex items-center gap-5 border border-transparent hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-[#EEEEEE] transition-all duration-200">
                <div className="w-10 h-10 rounded-full bg-[#3D7A52] flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="text-white font-mono font-bold text-lg">{sp.scientificName.charAt(0).toUpperCase()}</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-[#1C1B1F] italic truncate">{sp.scientificName}</p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {sp.commonName && (
                      <span className="text-sm text-[#6D4C41]">{sp.commonName}</span>
                    )}
                    {sp.family && (
                      <span className="text-xs font-medium text-[#9E9E9E] bg-[#F5F5F5] px-2 py-0.5 rounded-md">{sp.family}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  {sp.category && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#E8F5E9] text-[#2D5F3F] border border-[#C8E6C9]">
                      {sp.category}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))
        }
      </div>

      {!loading && items.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-[24px] border border-[#EEEEEE] shadow-sm mt-6">
          <div className="relative mb-6">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="text-[#E8F5E9]">
              <circle cx="40" cy="40" r="40" fill="currentColor"/>
            </svg>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="text-[#3D7A52] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <circle cx="20" cy="20" r="6" stroke="currentColor" strokeWidth="2"/>
              <path d="M20 6C20 6 14 9 14 14M20 6C20 6 26 9 26 14M20 34C20 34 14 31 14 26M20 34C20 34 26 31 26 26M6 20C6 20 9 14 14 14M34 20C34 20 31 14 26 14M6 20C6 20 9 26 14 26M34 20C34 20 31 26 26 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="text-xl font-semibold text-[#1C1B1F]">No species found</p>
          <p className="text-sm text-[#6D4C41] mt-2 max-w-sm">Species will appear here automatically as specimens are synced from the field app.</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-5 py-2.5 rounded-full text-sm font-medium bg-white border border-[#EEEEEE] text-[#49454F] hover:bg-[#F5F5F5] hover:text-[#1C1B1F] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm">Previous</button>
          <div className="flex items-center gap-1 px-2">
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              let pageNum = i + 1;
              if (totalPages > 5 && page > 3) {
                pageNum = page - 2 + i;
                if (pageNum > totalPages) pageNum = totalPages - (4 - i);
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={clsx(
                    'w-8 h-8 rounded-full text-sm font-medium transition-colors flex items-center justify-center',
                    page === pageNum
                      ? 'bg-[#3D7A52] text-white shadow-md'
                      : 'text-[#49454F] hover:bg-[#F5F5F5]'
                  )}
                >
                  {pageNum}
                </button>
              )
            })}
          </div>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-5 py-2.5 rounded-full text-sm font-medium bg-white border border-[#EEEEEE] text-[#49454F] hover:bg-[#F5F5F5] hover:text-[#1C1B1F] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm">Next</button>
        </div>
      )}
    </div>
  )
}
