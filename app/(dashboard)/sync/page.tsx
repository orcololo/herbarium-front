'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, CheckCircle2, Clock, RefreshCw, XCircle } from 'lucide-react'
import { api, ApiError, type Registry, type SyncPullResponse } from '@/lib/api'

const STATUS_META = {
  synced: { label: 'Sincronizados', icon: CheckCircle2, className: 'bg-[#E8F5E9] text-[#2D5F3F]' },
  pending: { label: 'Pendentes', icon: Clock, className: 'bg-[#FFF8E1] text-[#F57C00]' },
  conflict: { label: 'Conflitos', icon: AlertTriangle, className: 'bg-[#FFEBEE] text-[#C62828]' },
  error: { label: 'Erros', icon: XCircle, className: 'bg-[#FFEBEE] text-[#C62828]' },
} as const

type SyncStatus = keyof typeof STATUS_META

type Counts = Record<SyncStatus, number>

export default function SyncPage() {
  const [items, setItems] = useState<Registry[]>([])
  const [loading, setLoading] = useState(true)
  const [pulling, setPulling] = useState(false)
  const [pullResult, setPullResult] = useState<SyncPullResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await api.registry.list({ limit: 200, sortBy: 'updatedAt', sortOrder: 'desc' })
      setItems(res.data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Falha ao carregar sync.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handlePull() {
    setPulling(true)
    setError(null)
    try {
      const result = await api.sync.pull({ limit: 25 })
      setPullResult(result)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Falha ao consultar alterações do servidor.')
    } finally {
      setPulling(false)
    }
  }

  const counts = useMemo(() => {
    const result: Counts = { synced: 0, pending: 0, conflict: 0, error: 0 }
    for (const item of items) {
      const status = item.syncMetadata?.syncStatus ?? 'pending'
      if (status in result) result[status as SyncStatus] += 1
    }
    return result
  }, [items])

  const attentionItems = items.filter(item => {
    const status = item.syncMetadata?.syncStatus ?? 'pending'
    return status !== 'synced'
  }).slice(0, 12)

  return (
    <div className="space-y-7 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1B1F]">Sync</h1>
          <p className="text-sm text-[#49454F] mt-1">Status dos 200 registros mais recentes sincronizados pelo app de campo</p>
        </div>
        <button
          type="button"
          onClick={handlePull}
          disabled={pulling}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#3D7A52] text-white text-sm font-medium hover:bg-[#2D5F3F] disabled:opacity-60 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${pulling ? 'animate-spin' : ''}`} />
          {pulling ? 'Consultando...' : 'Consultar servidor'}
        </button>
      </header>

      {error && (
        <div className="flex items-center gap-3 bg-[#FFEBEE] text-[#C62828] px-4 py-3 rounded-[12px] text-sm border border-[#FFCDD2]">
          <AlertTriangle className="w-4 h-4" />
          {error}
          <button onClick={load} className="ml-auto text-xs font-medium underline hover:no-underline">Tentar novamente</button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(Object.keys(STATUS_META) as SyncStatus[]).map(status => {
          const meta = STATUS_META[status]
          const Icon = meta.icon
          return (
            <div key={status} className="bg-white rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#9E9E9E] uppercase tracking-wider">{meta.label}</p>
                  <p className="text-3xl font-bold text-[#1C1B1F] mt-1">{counts[status]}</p>
                </div>
                <div className={`w-11 h-11 rounded-[12px] flex items-center justify-center ${meta.className}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {pullResult && (
        <div className="bg-white rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-[#9E9E9E] uppercase tracking-wider">Último pull</p>
            <p className="text-sm text-[#1C1B1F] mt-1">{new Date(pullResult.syncedAt).toLocaleString('pt-BR')}</p>
          </div>
          <div className="flex gap-2 text-xs font-medium text-[#49454F]">
            <span className="px-2.5 py-1 rounded-full bg-[#F5F5F5]">{pullResult.registries.length} registros</span>
            <span className="px-2.5 py-1 rounded-full bg-[#F5F5F5]">{pullResult.sessions.length} sessões</span>
            {pullResult.hasMore && <span className="px-2.5 py-1 rounded-full bg-[#FFF8E1] text-[#F57C00]">há mais</span>}
          </div>
        </div>
      )}

      <section className="bg-white rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#F0F0F0] flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#1C1B1F]">Registros recentes que precisam de atenção</h2>
          <span className="text-xs font-medium text-[#9E9E9E]">{attentionItems.length}</span>
        </div>
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-12 shimmer rounded-[12px]" />)}
          </div>
        ) : attentionItems.length === 0 ? (
          <p className="text-sm text-[#9E9E9E] py-12 text-center">Nenhum registro pendente.</p>
        ) : (
          <div className="divide-y divide-[#F0F0F0]">
            {attentionItems.map(item => {
              const status = (item.syncMetadata?.syncStatus ?? 'pending') as SyncStatus
              const species = typeof item.species === 'object' ? item.species.scientificName : 'Espécie desconhecida'
              return (
                <Link key={item.id} href={`/registry/${item.id}`} className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-[#F5F5F5] transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1C1B1F] italic truncate">{species}</p>
                    <p className="text-xs text-[#9E9E9E] font-mono mt-0.5">{item.registryIdentifier}</p>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${STATUS_META[status].className}`}>
                    {STATUS_META[status].label}
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
