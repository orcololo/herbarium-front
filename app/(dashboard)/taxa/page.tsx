'use client'

import { FormEvent, useState } from 'react'
import { AlertTriangle, FlaskConical, Search } from 'lucide-react'
import { api, ApiError, type TaxonSuggestion } from '@/lib/api'

const STATUS_STYLES: Record<TaxonSuggestion['status'], string> = {
  accepted: 'bg-[#E8F5E9] text-[#2D5F3F]',
  synonym: 'bg-[#FFF8E1] text-[#F57C00]',
}

export default function TaxaPage() {
  const [query, setQuery] = useState('')
  const [limit, setLimit] = useState(10)
  const [results, setResults] = useState<TaxonSuggestion[]>([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setError('Informe pelo menos 2 caracteres.')
      return
    }
    setLoading(true)
    setError(null)
    setSearched(true)
    try {
      const data = await api.taxa.search({ q: trimmed, limit })
      setResults(data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Falha ao buscar taxa.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-7 animate-fade-in">
      <header className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[#E8F5E9] flex items-center justify-center text-[#3D7A52] shadow-sm">
          <FlaskConical className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1C1B1F]">Taxa</h1>
          <p className="text-sm text-[#6D4C41] mt-1">Sugestões taxonômicas via POWO</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-5 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9E9E9E]" />
          <input
            type="search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Mimosa, Coffea, Euterpe…"
            className="w-full pl-10 pr-4 py-3 rounded-full bg-[#F5F5F5] border border-transparent text-sm text-[#1C1B1F] placeholder:text-[#9E9E9E] focus:outline-none focus:ring-2 focus:ring-[#3D7A52] transition-shadow"
          />
        </div>
        <select
          value={limit}
          onChange={event => setLimit(Number(event.target.value))}
          className="px-4 py-3 rounded-full bg-[#F5F5F5] border border-transparent text-sm text-[#1C1B1F] focus:outline-none focus:ring-2 focus:ring-[#3D7A52]"
        >
          {[5, 10, 15, 20].map(value => <option key={value} value={value}>{value} resultados</option>)}
        </select>
        <button type="submit" disabled={loading} className="px-5 py-3 rounded-full bg-[#3D7A52] text-white text-sm font-medium hover:bg-[#2D5F3F] disabled:opacity-60 transition-colors">
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {error && (
        <div className="flex items-center gap-3 bg-[#FFEBEE] text-[#C62828] px-4 py-3 rounded-xl text-sm border border-[#FFCDD2]">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}

      <section className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#F0F0F0] flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#1C1B1F]">Resultados</h2>
          <span className="text-xs font-medium text-[#9E9E9E]">{results.length}</span>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-16 shimmer rounded-xl" />)}
          </div>
        ) : results.length === 0 ? (
          <p className="text-sm text-[#9E9E9E] py-14 text-center">{searched ? 'Nenhum taxon encontrado.' : 'Digite um nome científico para buscar.'}</p>
        ) : (
          <div className="divide-y divide-[#F0F0F0]">
            {results.map(result => (
              <div key={result.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-[#1C1B1F] italic">{result.name}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[#6D4C41]">
                    {result.author && <span>{result.author}</span>}
                    {result.family && <span className="px-2 py-0.5 rounded-md bg-[#F5F5F5] text-[#49454F]">{result.family}</span>}
                    {result.rank && <span>{result.rank}</span>}
                  </div>
                </div>
                <span className={`w-fit text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${STATUS_STYLES[result.status]}`}>
                  {result.status === 'accepted' ? 'Aceito' : 'Sinônimo'}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
