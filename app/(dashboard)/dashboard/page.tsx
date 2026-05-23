'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Leaf, FlaskConical, Calendar, FileEdit } from 'lucide-react'
import { api, Registry, PlantCategory } from '@/lib/api'
import { plantCategoryLabel } from '@/lib/plant-categories'

interface DashboardStats {
  totalSpecimens: number
  totalSpecies: number
  activeSessions: number
  draftRecords: number
}

interface CategoryCount {
  category: PlantCategory | 'uncategorized'
  count: number
  label: string
  color: string
}

const CATEGORY_COLORS: Record<string, { bg: string; bar: string }> = {
  samambaia: { bg: '#E0F2F1', bar: '#00796B' },
  erva: { bg: '#E1F5FE', bar: '#0288D1' },
  semi_arbusto: { bg: '#FFF3E0', bar: '#EF6C00' },
  arbusto: { bg: '#E8F5E9', bar: '#388E3C' },
  arvore: { bg: '#E8F5E9', bar: '#2D5F3F' },
  erva_trepadeira: { bg: '#EFEBE9', bar: '#6D4C41' },
  erva_epifita: { bg: '#E0F7FA', bar: '#00838F' },
  hemiepifita: { bg: '#EDE7F6', bar: '#5E35B1' },
  prostrada: { bg: '#F1F8E9', bar: '#558B2F' },
  rastejante: { bg: '#F9FBE7', bar: '#827717' },
  planta_rupicola: { bg: '#ECEFF1', bar: '#546E7A' },
  ciofila: { bg: '#E8EAF6', bar: '#3949AB' },
  epilitica: { bg: '#FBE9E7', bar: '#BF360C' },
  trees: { bg: '#E8F5E9', bar: '#2D5F3F' },
  shrubs: { bg: '#E8F5E9', bar: '#388E3C' },
  herbs: { bg: '#E1F5FE', bar: '#0288D1' },
  ferns: { bg: '#E0F2F1', bar: '#00796B' },
  grasses: { bg: '#F1F8E9', bar: '#558B2F' },
  vines: { bg: '#EFEBE9', bar: '#6D4C41' },
  cacti: { bg: '#FBE9E7', bar: '#BF360C' },
  aquatic: { bg: '#E0F7FA', bar: '#00838F' },
  uncategorized: { bg: '#F5F5F5', bar: '#9E9E9E' },
}

function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <div className="h-3 w-20 bg-[#EEEEEE] rounded" />
          <div className="h-8 w-16 bg-[#EEEEEE] rounded" />
        </div>
        <div className="w-12 h-12 bg-[#EEEEEE] rounded-full" />
      </div>
    </div>
  )
}

function RecentActivitySkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6 animate-pulse">
      <div className="h-5 w-32 bg-[#EEEEEE] rounded mb-6" />
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#EEEEEE] rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-3/4 bg-[#EEEEEE] rounded" />
              <div className="h-3 w-1/2 bg-[#EEEEEE] rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CategoriesSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6 animate-pulse">
      <div className="h-5 w-48 bg-[#EEEEEE] rounded mb-6" />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-20 bg-[#EEEEEE] rounded" />
            <div className="h-4 w-full bg-[#EEEEEE] rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentEntries, setRecentEntries] = useState<Registry[] | null>(null)
  const [categories, setCategories] = useState<CategoryCount[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [registryRes, draftsRes, speciesRes, sessionsRes, recentRes] = await Promise.all([
          api.registry.list({ limit: 1 }),
          api.registry.list({ isDraft: true, limit: 1 }),
          api.species.list({ limit: 1 }),
          api.sessions.list({ limit: 1 }),
          api.registry.list({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
        ])

        setStats({
          totalSpecimens: registryRes.total,
          totalSpecies: speciesRes.total,
          activeSessions: sessionsRes.total,
          draftRecords: draftsRes.total,
        })

        setRecentEntries(recentRes.data)

        // Fetch all registries to compute category breakdown
        const allRes = await api.registry.list({ limit: 200 })
        const counts: Record<string, number> = {}
        for (const entry of allRes.data) {
          const species = typeof entry.species === 'object' ? entry.species : null
          const cat = species?.category ?? 'uncategorized'
          counts[cat] = (counts[cat] ?? 0) + 1
        }

        const categoryData: CategoryCount[] = Object.entries(counts)
          .map(([key, count]) => ({
            category: key as PlantCategory | 'uncategorized',
            count,
            label: key === 'uncategorized' ? 'Sem categoria' : plantCategoryLabel(key),
            color: CATEGORY_COLORS[key]?.bar ?? '#9E9E9E',
          }))
          .sort((a, b) => b.count - a.count)

        setCategories(categoryData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha ao carregar dados do painel')
      }
    }

    fetchDashboardData()
  }, [])

  function getSpeciesName(entry: Registry): string {
    if (typeof entry.species === 'object' && entry.species) {
      return entry.species.scientificName
    }
    return 'Espécie desconhecida'
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-[#E53935] text-sm mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[#3D7A52] text-white rounded-full text-sm font-medium hover:bg-[#2D5F3F] transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  const maxCategoryCount = categories ? Math.max(...categories.map(c => c.count)) : 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1C1B1F]">Painel</h1>
        <p className="text-sm text-[#49454F] mt-1">Visão geral das suas coleções botânicas</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {!stats ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-[#9E9E9E] uppercase tracking-wide">Espécimes</p>
                  <p className="text-3xl font-bold text-[#1C1B1F] mt-1">{stats.totalSpecimens}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#E8F5E9] flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-[#3D7A52]" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-[#9E9E9E] uppercase tracking-wide">Espécies</p>
                  <p className="text-3xl font-bold text-[#1C1B1F] mt-1">{stats.totalSpecies}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#E1F5FE] flex items-center justify-center">
                  <FlaskConical className="w-5 h-5 text-[#0288D1]" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-[#9E9E9E] uppercase tracking-wide">Sessões</p>
                  <p className="text-3xl font-bold text-[#1C1B1F] mt-1">{stats.activeSessions}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#EFEBE9] flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[#6D4C41]" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-[#9E9E9E] uppercase tracking-wide">Rascunhos</p>
                  <p className="text-3xl font-bold text-[#1C1B1F] mt-1">{stats.draftRecords}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#FFF3E0] flex items-center justify-center">
                  <FileEdit className="w-5 h-5 text-[#E65100]" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        {!recentEntries ? (
          <RecentActivitySkeleton />
        ) : (
          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-semibold text-[#1C1B1F]">Atividade Recente</h2>
              <Link
                href="/registry"
                className="text-xs font-medium text-[#3D7A52] hover:underline"
              >
                View all
              </Link>
            </div>
            {recentEntries.length === 0 ? (
              <p className="text-sm text-[#9E9E9E] text-center py-8">No entries yet</p>
            ) : (
              <div className="space-y-3">
                {recentEntries.map(entry => (
                  <Link
                    key={entry.id}
                    href={`/registry/${entry.id}`}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-[#F5F5F5] transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#E8F5E9] flex items-center justify-center shrink-0">
                      <Leaf className="w-4 h-4 text-[#3D7A52]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1C1B1F] truncate italic">
                        {getSpeciesName(entry)}
                      </p>
                      <p className="text-xs text-[#9E9E9E]">
                        {entry.registryIdentifier} &middot; {formatDate(entry.createdAt)}
                      </p>
                    </div>
                    {entry.isDraft && (
                      <span className="text-[10px] font-medium uppercase px-2 py-0.5 rounded-full bg-[#FFF3E0] text-[#E65100]">
                        Draft
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Collections by Category */}
        {!categories ? (
          <CategoriesSkeleton />
        ) : (
          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6">
            <h2 className="text-base font-semibold text-[#1C1B1F] mb-6">Collections by Category</h2>
            {categories.length === 0 ? (
              <p className="text-sm text-[#9E9E9E] text-center py-8">No data available</p>
            ) : (
              <div className="space-y-4">
                {categories.map(cat => (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-[#49454F]">{cat.label}</span>
                      <span className="text-xs font-medium text-[#9E9E9E]">{cat.count}</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-[#F5F5F5] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${maxCategoryCount > 0 ? (cat.count / maxCategoryCount) * 100 : 0}%`,
                          backgroundColor: cat.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
