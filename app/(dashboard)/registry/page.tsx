'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { api, type Registry } from '@/lib/api'
import clsx from 'clsx'

const STATUS_COLORS: Record<string, string> = {
  synced: 'bg-[#E8F5E9] text-[#2D5F3F]',
  pending: 'bg-[#FFF8E1] text-[#F57C00]',
  conflict: 'bg-[#FFEBEE] text-[#C62828]',
  error: 'bg-[#FFEBEE] text-[#C62828]',
}

const GRADIENT_PALETTES = [
  'from-[#E8F5E9] to-[#A5D6A7]',
  'from-[#F3E5F5] to-[#CE93D8]',
  'from-[#E3F2FD] to-[#90CAF9]',
  'from-[#FFF8E1] to-[#FFE082]',
  'from-[#EFEBE9] to-[#BCAAA4]',
  'from-[#E0F2F1] to-[#80CBC4]',
]

function getGradient(id: string) {
  const index = id.charCodeAt(0) % GRADIENT_PALETTES.length
  return GRADIENT_PALETTES[index]
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] overflow-hidden">
      <div className="h-40 shimmer" />
      <div className="p-4 space-y-2">
        <div className="h-4 w-3/4 shimmer rounded-full" />
        <div className="h-3 w-1/2 shimmer rounded-full" />
        <div className="h-3 w-1/3 shimmer rounded-full mt-2" />
      </div>
    </div>
  )
}

function SpeciesName(registry: Registry): string {
  if (typeof registry.species === 'object' && registry.species !== null) {
    return registry.species.scientificName
  }
  return 'Espécie desconhecida'
}

function CommonName(registry: Registry): string | null {
  if (typeof registry.species === 'object' && registry.species !== null) {
    return registry.species.commonName ?? null
  }
  return null
}

export default function RegistryPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get('sessionId') ?? undefined

  const [items, setItems] = useState<Registry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const LIMIT = 20

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.registry.list({ page, limit: LIMIT, search: debouncedSearch || undefined, sessionId })
      setItems(res.data)
      setTotal(res.total)
    } catch {
      setError('Falha ao carregar registros.')
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, sessionId])

  useEffect(() => { load() }, [load])

  const totalPages = Math.ceil(total / LIMIT)
  
  const syncedCount = items.filter(i => i.syncMetadata?.syncStatus === 'synced').length
  const pendingCount = items.filter(i => i.syncMetadata?.syncStatus === 'pending').length

  return (
    <div className="animate-fade-in">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[#1C1B1F] tracking-tight">Registros</h1>
          <p className="text-sm text-[#6D4C41] mt-1">{total} espécimes coletados</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-[#EEEEEE] shadow-sm">
            <div className="w-2 h-2 rounded-full bg-[#4CAF50]"></div>
            <span className="text-xs font-medium text-[#49454F]">{syncedCount} Sincronizados</span>
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-[#EEEEEE] shadow-sm">
            <div className="w-2 h-2 rounded-full bg-[#FF9800]"></div>
            <span className="text-xs font-medium text-[#49454F]">{pendingCount} Pendentes</span>
          </div>
          <Link
            href="/registry/new"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#3D7A52] text-white text-sm font-medium shadow-[0_2px_8px_rgba(61,122,82,0.3)] hover:bg-[#2D5F3F] hover:-translate-y-0.5 transition-all duration-200"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
            Novo Espécime
          </Link>
        </div>
      </header>

      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9E9E9E]" width="18" height="18" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M11 11L13.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            type="search"
            placeholder="Buscar por espécie, identificador…"
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
          <button onClick={load} className="ml-auto text-xs font-medium underline hover:no-underline">Tentar novamente</button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : items.map(item => (
            <Link key={item.id} href={`/registry/${item.id}`} className="block group">
              <div className="bg-white rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] overflow-hidden transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] border border-transparent group-hover:border-[#EEEEEE]">
                <div className={clsx('h-40 bg-gradient-to-br flex items-center justify-center relative', getGradient(item.id))}>
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="opacity-20 mix-blend-overlay">
                    <path d="M24 6C24 6 10 14 10 28C10 35.732 16.268 42 24 42C31.732 42 38 35.732 38 28C38 14 24 6 24 6Z" fill="currentColor"/>
                    <path d="M24 6C24 6 24 22 16 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <div className="absolute top-3 right-3">
                    <span className={clsx('text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm backdrop-blur-sm', STATUS_COLORS[item.syncMetadata?.syncStatus ?? 'pending'])}>
                      {item.syncMetadata?.syncStatus ?? 'pending'}
                    </span>
                  </div>
                  {item.dateCollected && (
                    <div className="absolute bottom-3 left-3">
                      <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-black/25 text-white backdrop-blur-sm">
                        {new Date(item.dateCollected).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  )}
                  {item.habitat && (
                    <div className="absolute bottom-3 right-3 max-w-[50%]">
                      <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-white/80 text-[#49454F] backdrop-blur-sm flex items-center gap-1 truncate">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="shrink-0">
                          <path d="M12 21C12 21 5 14.5 5 9C5 5.13401 8.13401 2 12 2C15.866 2 19 5.13401 19 9C19 14.5 12 21 12 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="12" cy="9" r="3" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        <span className="truncate">{item.habitat}</span>
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <p className="text-sm font-semibold text-[#1C1B1F] italic truncate">{SpeciesName(item)}</p>
                  {CommonName(item) && (
                    <p className="text-xs text-[#6D4C41] truncate mt-0.5">{CommonName(item)}</p>
                  )}
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-[11px] text-[#9E9E9E] font-mono bg-[#F5F5F5] px-2 py-0.5 rounded-md">{item.registryIdentifier}</span>
                  </div>
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
              <path d="M20 5C20 5 8 11 8 22C8 28.627 13.373 34 20 34C26.627 34 32 28.627 32 22C32 11 20 5 20 5Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M20 5C20 5 20 18 14 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="28" cy="28" r="8" fill="white" stroke="currentColor" strokeWidth="2"/>
              <path d="M34 34L38 38" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="text-xl font-semibold text-[#1C1B1F]">Nenhum espécime encontrado</p>
          <p className="text-sm text-[#6D4C41] mt-2 max-w-sm">Abra o aplicativo Folium para coletar espécimes e sincronizá-los com o painel.</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            className="px-5 py-2.5 rounded-full text-sm font-medium bg-white border border-[#EEEEEE] text-[#49454F] hover:bg-[#F5F5F5] hover:text-[#1C1B1F] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            Anterior
          </button>
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
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-5 py-2.5 rounded-full text-sm font-medium bg-white border border-[#EEEEEE] text-[#49454F] hover:bg-[#F5F5F5] hover:text-[#1C1B1F] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            Próximo
          </button>
        </div>
      )}
    </div>
  )
}
