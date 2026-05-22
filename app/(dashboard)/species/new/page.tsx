'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { api, type CreateSpeciesPayload, type PlantCategory } from '@/lib/api'

const CATEGORIES: { value: PlantCategory; label: string }[] = [
  { value: 'trees', label: 'Árvores' },
  { value: 'shrubs', label: 'Arbustos' },
  { value: 'herbs', label: 'Ervas' },
  { value: 'ferns', label: 'Samambaias' },
  { value: 'grasses', label: 'Gramíneas' },
  { value: 'vines', label: 'Trepadeiras' },
  { value: 'cacti', label: 'Cactos' },
  { value: 'aquatic', label: 'Aquáticas' },
]

export default function NewSpeciesPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    scientificName: '',
    commonName: '',
    family: '',
    genus: '',
    species: '',
    category: '',
    description: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  function handleChange(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!form.scientificName.trim()) errs.scientificName = 'Nome científico é obrigatório'
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setSubmitting(true)
    setSubmitError(null)
    try {
      const payload: CreateSpeciesPayload = {
        scientificName: form.scientificName.trim(),
        ...(form.commonName.trim() && { commonName: form.commonName.trim() }),
        ...(form.family.trim() && { family: form.family.trim() }),
        ...(form.genus.trim() && { genus: form.genus.trim() }),
        ...(form.species.trim() && { species: form.species.trim() }),
        ...(form.category && { category: form.category as PlantCategory }),
        ...(form.description.trim() && { description: form.description.trim() }),
      }
      await api.species.create(payload)
      router.push('/species')
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Falha ao criar espécie.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <Link
        href="/species"
        className="inline-flex items-center gap-2 text-sm text-[#49454F] hover:text-[#3D7A52] transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Voltar para Taxonomia
      </Link>

      <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6">
        <h1 className="text-xl font-semibold text-[#1C1B1F] mb-6">Nova Espécie</h1>

        {submitError && (
          <div className="flex items-center gap-3 bg-[#FFEBEE] text-[#C62828] px-4 py-3 rounded-xl mb-6 text-sm border border-[#FFCDD2]">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="scientificName" className="block text-sm font-medium text-[#49454F] mb-1.5">
              Nome Científico <span className="text-[#E53935]">*</span>
            </label>
            <input
              id="scientificName"
              type="text"
              value={form.scientificName}
              onChange={e => handleChange('scientificName', e.target.value)}
              placeholder="e.g. Quercus robur"
              className={`w-full px-4 py-3 border rounded-lg text-sm text-[#1C1B1F] placeholder:text-[#AAAAAA] outline-none transition-all ${
                errors.scientificName
                  ? 'border-[#E53935] focus:ring-[#E53935] focus:border-[#E53935]'
                  : 'border-[#DDDDDD] focus:ring-[#3D7A52] focus:border-[#3D7A52]'
              } focus:ring-1`}
            />
            {errors.scientificName && (
              <p className="text-sm text-[#E53935] mt-1">{errors.scientificName}</p>
            )}
          </div>

          <div>
            <label htmlFor="commonName" className="block text-sm font-medium text-[#49454F] mb-1.5">
              Nome Popular
            </label>
            <input
              id="commonName"
              type="text"
              value={form.commonName}
              onChange={e => handleChange('commonName', e.target.value)}
              placeholder="e.g. English Oak"
              className="w-full px-4 py-3 border border-[#DDDDDD] rounded-lg text-sm text-[#1C1B1F] placeholder:text-[#AAAAAA] outline-none focus:ring-1 focus:ring-[#3D7A52] focus:border-[#3D7A52] transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="family" className="block text-sm font-medium text-[#49454F] mb-1.5">
                Família
              </label>
              <input
                id="family"
                type="text"
                value={form.family}
                onChange={e => handleChange('family', e.target.value)}
                placeholder="e.g. Fagaceae"
                className="w-full px-4 py-3 border border-[#DDDDDD] rounded-lg text-sm text-[#1C1B1F] placeholder:text-[#AAAAAA] outline-none focus:ring-1 focus:ring-[#3D7A52] focus:border-[#3D7A52] transition-all"
              />
            </div>
            <div>
              <label htmlFor="genus" className="block text-sm font-medium text-[#49454F] mb-1.5">
                Gênero
              </label>
              <input
                id="genus"
                type="text"
                value={form.genus}
                onChange={e => handleChange('genus', e.target.value)}
                placeholder="e.g. Quercus"
                className="w-full px-4 py-3 border border-[#DDDDDD] rounded-lg text-sm text-[#1C1B1F] placeholder:text-[#AAAAAA] outline-none focus:ring-1 focus:ring-[#3D7A52] focus:border-[#3D7A52] transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="species" className="block text-sm font-medium text-[#49454F] mb-1.5">
                Espécie (epíteto)
              </label>
              <input
                id="species"
                type="text"
                value={form.species}
                onChange={e => handleChange('species', e.target.value)}
                placeholder="e.g. robur"
                className="w-full px-4 py-3 border border-[#DDDDDD] rounded-lg text-sm text-[#1C1B1F] placeholder:text-[#AAAAAA] outline-none focus:ring-1 focus:ring-[#3D7A52] focus:border-[#3D7A52] transition-all"
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-[#49454F] mb-1.5">
                Categoria
              </label>
              <select
                id="category"
                value={form.category}
                onChange={e => handleChange('category', e.target.value)}
                className="w-full px-4 py-3 border border-[#DDDDDD] rounded-lg text-sm text-[#1C1B1F] outline-none focus:ring-1 focus:ring-[#3D7A52] focus:border-[#3D7A52] transition-all appearance-none bg-white"
              >
                <option value="">Selecione uma categoria...</option>
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-[#49454F] mb-1.5">
              Descrição
            </label>
            <textarea
              id="description"
              value={form.description}
              onChange={e => handleChange('description', e.target.value)}
              placeholder="Notas adicionais sobre esta espécie..."
              rows={4}
              className="w-full px-4 py-3 border border-[#DDDDDD] rounded-lg text-sm text-[#1C1B1F] placeholder:text-[#AAAAAA] outline-none focus:ring-1 focus:ring-[#3D7A52] focus:border-[#3D7A52] transition-all resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/species"
              className="px-6 py-2.5 rounded-full border border-[#DDDDDD] text-sm font-medium text-[#49454F] hover:bg-[#F5F5F5] transition-all"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-full bg-[#3D7A52] text-white text-sm font-medium shadow-[0_2px_8px_rgba(61,122,82,0.3)] hover:bg-[#2D5F3F] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {submitting ? 'Criando...' : 'Criar Espécie'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
