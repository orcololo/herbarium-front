'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { api, type CollectionSession } from '@/lib/api'
import clsx from 'clsx'

type FilterStatus = 'all' | 'active' | 'archived'

const EARTH_PALETTES = [
  'bg-[#E8F5E9] text-[#2D5F3F]',
  'bg-[#FFF8E1] text-[#F57C00]',
  'bg-[#EFEBE9] text-[#6D4C41]',
  'bg-[#E0F2F1] text-[#00796B]',
]

function getPalette(id: string) {
  const index = id.charCodeAt(0) % EARTH_PALETTES.length
  return EARTH_PALETTES[index]
}

function SkeletonRow() {
  return (
    <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-5 flex items-center gap-5 border border-transparent">
      <div className="w-12 h-12 rounded-full shimmer shrink-0" />
      <div className="flex-1 space-y-2.5">
        <div className="h-4 w-48 shimmer rounded-full" />
        <div className="h-3 w-32 shimmer rounded-full" />
      </div>
      <div className="w-8 h-8 shimmer rounded-full" />
    </div>
  )
}

export default function SessionsPage() {
  const [items, setItems] = useState<CollectionSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filter, setFilter] = useState<FilterStatus>('all')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const LIMIT = 20

  const handleSearchChange = (value: string) => {
    setSearch(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value)
      setPage(1)
    }, 400)
  }

  const handleFilterChange = (status: FilterStatus) => {
    setFilter(status)
    setPage(1)
  }

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params: { page: number; limit: number; search?: string; isArchived?: boolean } = { page, limit: LIMIT }
      if (debouncedSearch) params.search = debouncedSearch
      if (filter === 'active') params.isArchived = false
      if (filter === 'archived') params.isArchived = true
      const res = await api.sessions.list(params)
      setItems(res.data)
      setTotal(res.total)
    } catch {
      setError('Falha ao carregar sessões.')
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, filter])

  useEffect(() => { load() }, [load])

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <header className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-full bg-[#E8F5E9] flex items-center justify-center text-[#3D7A52] shadow-sm">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
            <path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-[#1C1B1F] tracking-tight">Sessões de Coleta</h1>
          <p className="text-sm text-[#6D4C41] mt-0.5">{total} expedições registradas</p>
        </div>
        <Link
          href="/sessions/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#3D7A52] text-white text-sm font-medium shadow-[0_2px_8px_rgba(61,122,82,0.3)] hover:bg-[#2D5F3F] hover:-translate-y-0.5 transition-all duration-200 ml-auto"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
          Nova Sessão
        </Link>
      </header>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9E9E9E] pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar sessões por nome…"
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-[#DDDDDD] text-sm text-[#1C1B1F] placeholder:text-[#9E9E9E] focus:outline-none focus:ring-2 focus:ring-[#3D7A52] focus:border-transparent transition-shadow"
          />
        </div>
        <div className="flex items-center gap-2">
          {(['all', 'active', 'archived'] as const).map((status) => (
            <button
              key={status}
              onClick={() => handleFilterChange(status)}
              className={clsx(
                'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                filter === status
                  ? 'bg-[#E8F5E9] text-[#2D5F3F]'
                  : 'bg-white text-[#49454F] border border-[#DDDDDD] hover:bg-[#F5F5F5]'
              )}
            >
              {status.charAt(0).toUpperCase() + status.slice(1) === 'All' ? 'Todas' : status.charAt(0).toUpperCase() + status.slice(1) === 'Active' ? 'Ativas' : 'Arquivadas'}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-[#FFEBEE] text-[#C62828] px-4 py-3 rounded-xl mb-6 text-sm border border-[#FFCDD2]">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 5V8M8 11H8.01M2 8C2 4.686 4.686 2 8 2s6 2.686 6 6-2.686 6-6 6-6-2.686-6-6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          {error}
          <button onClick={load} className="ml-auto text-xs font-medium underline hover:no-underline">Tentar novamente</button>
        </div>
      )}

      <div className="space-y-4">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
          : items.map(session => (
            <Link key={session.id} href={`/sessions/${session.id}`} className="block group">
              <div className={clsx(
                'bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-5 flex items-center gap-5 border border-transparent transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] group-hover:border-[#EEEEEE]',
                session.isArchived && 'opacity-60 grayscale-[0.5]',
              )}>
                <div className={clsx('w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm', getPalette(session.id))}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                    <path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="text-base font-semibold text-[#1C1B1F] truncate">{session.tripName}</p>
                    {session.isArchived && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#F5F5F5] text-[#9E9E9E]">Arquivada</span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    {session.location && (
                      <div className="flex items-center gap-1.5 text-xs text-[#6D4C41]">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <path d="M12 21C12 21 5 14.5 5 9C5 5.13401 8.13401 2 12 2C15.866 2 19 5.13401 19 9C19 14.5 12 21 12 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="12" cy="9" r="3" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        <span className="truncate max-w-[200px]">{session.location}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1.5 text-xs text-[#9E9E9E]">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                        <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>
                        {new Date(session.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {session.endDate && ` → ${new Date(session.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 shrink-0">
                  {session.teamMembers.length > 0 && (
                    <div className="hidden sm:flex items-center gap-1.5 bg-[#F5F5F5] px-2.5 py-1 rounded-full">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-[#9E9E9E]">
                        <path d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M23 21V19C23 17.1432 21.733 15.5824 20 15.13M16 3.13C17.733 3.5824 19 5.14318 19 7C19 8.85682 17.733 10.4176 16 10.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-[11px] font-medium text-[#49454F]">{session.teamMembers.length}</span>
                    </div>
                  )}
                  <div className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#9E9E9E] group-hover:bg-[#E8F5E9] group-hover:text-[#3D7A52] transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))
        }
      </div>

      {!loading && items.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl border border-[#EEEEEE] shadow-sm mt-6">
          <div className="relative mb-6">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="text-[#E8F5E9]">
              <circle cx="40" cy="40" r="40" fill="currentColor"/>
            </svg>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="text-[#3D7A52] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <rect x="6" y="8" width="28" height="26" rx="4" stroke="currentColor" strokeWidth="2"/>
              <path d="M14 4V10M26 4V10M6 16H34" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M24 24C24 24 20 28 20 32C20 34.2091 21.7909 36 24 36C26.2091 36 28 34.2091 28 32C28 28 24 24 24 24Z" fill="white" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <p className="text-xl font-semibold text-[#1C1B1F]">Nenhuma expedição ainda</p>
          <p className="text-sm text-[#6D4C41] mt-2 max-w-sm">Crie uma sessão de coleta no aplicativo móvel para organizar seus espécimes.</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-5 py-2.5 rounded-full text-sm font-medium bg-white border border-[#EEEEEE] text-[#49454F] hover:bg-[#F5F5F5] hover:text-[#1C1B1F] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm">Anterior</button>
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
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-5 py-2.5 rounded-full text-sm font-medium bg-white border border-[#EEEEEE] text-[#49454F] hover:bg-[#F5F5F5] hover:text-[#1C1B1F] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm">Próximo</button>
        </div>
      )}
    </div>
  )
}
