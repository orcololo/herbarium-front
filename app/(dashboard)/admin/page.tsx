'use client'

import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { AlertTriangle, Database, FlaskConical, Leaf, RefreshCw, ShieldCheck, Users } from 'lucide-react'
import { api, type Registry, type User, type UserRole } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administradores',
  researcher: 'Pesquisadores',
  collector: 'Coletores',
}

const STATUS_LABELS: Record<string, string> = {
  synced: 'Sincronizados',
  pending: 'Pendentes',
  conflict: 'Conflitos',
  error: 'Erros',
}

type AdminStats = {
  users: number
  registries: number
  species: number
  sessions: number
}

type SyncCounts = Record<'synced' | 'pending' | 'conflict' | 'error', number>

function MetricCard({ label, value, icon, tone = 'green' }: { label: string; value: number; icon: ReactNode; tone?: 'green' | 'blue' | 'brown' | 'red' }) {
  const tones = {
    green: 'bg-[#E8F5E9] text-[#3D7A52]',
    blue: 'bg-[#E1F5FE] text-[#0288D1]',
    brown: 'bg-[#EFEBE9] text-[#6D4C41]',
    red: 'bg-[#FFEBEE] text-[#C62828]',
  }
  return (
    <div className="bg-white rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-[#9E9E9E] uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-bold text-[#1C1B1F] mt-1">{value}</p>
        </div>
        <div className={`w-11 h-11 rounded-[12px] flex items-center justify-center ${tones[tone]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [recentRegistries, setRecentRegistries] = useState<Registry[]>([])
  const [syncCounts, setSyncCounts] = useState<SyncCounts>({ synced: 0, pending: 0, conflict: 0, error: 0 })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role !== 'admin') {
      setLoading(false)
      return
    }

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [usersRes, registriesRes, speciesRes, sessionsRes, recentRes, syncRes] = await Promise.all([
          api.users.list({ limit: 100 }),
          api.registry.list({ limit: 1 }),
          api.species.list({ limit: 1 }),
          api.sessions.list({ limit: 1 }),
          api.registry.list({ limit: 6, sortBy: 'createdAt', sortOrder: 'desc' }),
          api.registry.list({ limit: 200 }),
        ])

        setStats({
          users: usersRes.total,
          registries: registriesRes.total,
          species: speciesRes.total,
          sessions: sessionsRes.total,
        })
        setUsers(usersRes.data)
        setRecentRegistries(recentRes.data)

        const counts: SyncCounts = { synced: 0, pending: 0, conflict: 0, error: 0 }
        for (const registry of syncRes.data) {
          const status = registry.syncMetadata?.syncStatus ?? 'pending'
          if (status in counts) counts[status as keyof SyncCounts] += 1
        }
        setSyncCounts(counts)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha ao carregar painel admin.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [user?.role])

  const roleCounts = useMemo(() => {
    const counts: Record<UserRole, number> = { admin: 0, researcher: 0, collector: 0 }
    for (const item of users) counts[item.role ?? 'collector'] += 1
    return counts
  }, [users])

  if (user?.role !== 'admin') {
    return (
      <div className="bg-white rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8 text-center max-w-xl mx-auto">
        <ShieldCheck className="w-10 h-10 text-[#9E9E9E] mx-auto mb-3" />
        <h1 className="text-xl font-bold text-[#1C1B1F]">Acesso restrito</h1>
        <p className="text-sm text-[#49454F] mt-2">Painel disponível apenas para administradores.</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-[#FFEBEE] text-[#C62828] px-5 py-4 rounded-[12px] border border-[#FFCDD2] flex items-center gap-3">
        <AlertTriangle className="w-5 h-5" />
        <span className="text-sm font-medium">{error}</span>
      </div>
    )
  }

  return (
    <div className="space-y-7 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1B1F]">Painel admin</h1>
          <p className="text-sm text-[#49454F] mt-1">Operação, usuários e sincronização</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/users/new" className="px-4 py-2 rounded-full bg-[#3D7A52] text-white text-sm font-medium hover:bg-[#2D5F3F] transition-colors">Novo usuário</Link>
          <Link href="/sync" className="px-4 py-2 rounded-full bg-white border border-[#DDDDDD] text-[#49454F] text-sm font-medium hover:bg-[#F5F5F5] transition-colors">Sync</Link>
          <Link href="/taxa" className="px-4 py-2 rounded-full bg-white border border-[#DDDDDD] text-[#49454F] text-sm font-medium hover:bg-[#F5F5F5] transition-colors">Taxa</Link>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Usuários" value={stats?.users ?? 0} icon={<Users className="w-5 h-5" />} />
        <MetricCard label="Registros" value={stats?.registries ?? 0} icon={<Leaf className="w-5 h-5" />} tone="blue" />
        <MetricCard label="Espécies" value={stats?.species ?? 0} icon={<FlaskConical className="w-5 h-5" />} tone="brown" />
        <MetricCard label="Conflitos recentes" value={syncCounts.conflict + syncCounts.error} icon={<AlertTriangle className="w-5 h-5" />} tone="red" />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="h-72 rounded-[16px] shimmer" />
          <div className="h-72 rounded-[16px] shimmer" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <section className="bg-white rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-[#1C1B1F]">Distribuição de funções</h2>
              <Users className="w-4 h-4 text-[#3D7A52]" />
            </div>
            <p className="text-xs text-[#9E9E9E] mb-4">Amostra dos 100 usuários mais recentes.</p>
            <div className="space-y-4">
              {(Object.keys(roleCounts) as UserRole[]).map(role => (
                <div key={role}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-[#49454F]">{ROLE_LABELS[role]}</span>
                    <span className="text-xs font-bold text-[#9E9E9E]">{roleCounts[role]}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-[#F5F5F5] overflow-hidden">
                    <div className="h-full bg-[#3D7A52] rounded-full" style={{ width: `${users.length ? (roleCounts[role] / users.length) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-[#1C1B1F]">Saúde de sync</h2>
              <RefreshCw className="w-4 h-4 text-[#3D7A52]" />
            </div>
            <p className="text-xs text-[#9E9E9E] mb-4">Amostra dos 200 registros mais recentes.</p>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(syncCounts) as Array<keyof SyncCounts>).map(status => (
                <Link key={status} href="/sync" className="rounded-[12px] border border-[#EEEEEE] p-4 hover:bg-[#F5F5F5] transition-colors">
                  <p className="text-xs font-bold text-[#9E9E9E] uppercase tracking-wider">{STATUS_LABELS[status]}</p>
                  <p className="text-2xl font-bold text-[#1C1B1F] mt-1">{syncCounts[status]}</p>
                </Link>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-[#1C1B1F]">Registros recentes</h2>
              <Link href="/registry" className="text-xs font-medium text-[#3D7A52] hover:underline">Ver todos</Link>
            </div>
            <div className="divide-y divide-[#F0F0F0]">
              {recentRegistries.length === 0 ? (
                <p className="text-sm text-[#9E9E9E] py-8 text-center">Nenhum registro.</p>
              ) : recentRegistries.map(registry => {
                const species = typeof registry.species === 'object' ? registry.species.scientificName : 'Espécie desconhecida'
                return (
                  <Link key={registry.id} href={`/registry/${registry.id}`} className="flex items-center justify-between gap-4 py-3 hover:bg-[#FAFAFA] transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#1C1B1F] italic truncate">{species}</p>
                      <p className="text-xs text-[#9E9E9E] font-mono mt-0.5">{registry.registryIdentifier}</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-[#F5F5F5] text-[#49454F]">
                      {registry.syncMetadata?.syncStatus ?? 'pending'}
                    </span>
                  </Link>
                )
              })}
            </div>
          </section>

          <section className="bg-white rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6 lg:col-span-2">
            <div className="flex items-center gap-2 mb-5">
              <Database className="w-4 h-4 text-[#3D7A52]" />
              <h2 className="text-base font-semibold text-[#1C1B1F]">Ações rápidas</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Link href="/users" className="rounded-[12px] border border-[#EEEEEE] p-4 hover:bg-[#F5F5F5] transition-colors text-sm font-medium text-[#49454F]">Gerenciar usuários</Link>
              <Link href="/species/new" className="rounded-[12px] border border-[#EEEEEE] p-4 hover:bg-[#F5F5F5] transition-colors text-sm font-medium text-[#49454F]">Nova espécie</Link>
              <Link href="/sync" className="rounded-[12px] border border-[#EEEEEE] p-4 hover:bg-[#F5F5F5] transition-colors text-sm font-medium text-[#49454F]">Revisar sync</Link>
              <Link href="/taxa" className="rounded-[12px] border border-[#EEEEEE] p-4 hover:bg-[#F5F5F5] transition-colors text-sm font-medium text-[#49454F]">Buscar taxa</Link>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
