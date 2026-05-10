'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { api, type Species } from '@/lib/api'
import clsx from 'clsx'

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div>
      <div className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1">{label}</div>
      <div className="text-sm text-[#1C1B1F] font-medium">{value}</div>
    </div>
  )
}

type FormData = {
  scientificName: string
  commonName: string
  family: string
  genus: string
  kingdom: string
  phylum: string
  plantClass: string
  order: string
  author: string
  description: string
}

export default function SpeciesDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [item, setItem] = useState<Species | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [formData, setFormData] = useState<FormData>({
    scientificName: '',
    commonName: '',
    family: '',
    genus: '',
    kingdom: '',
    phylum: '',
    plantClass: '',
    order: '',
    author: '',
    description: ''
  })

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const res = await api.species.get(id)
        if (mounted) {
          setItem(res)
          setError(null)
        }
      } catch {
        if (mounted) setError('Failed to load species details.')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [id])

  useEffect(() => {
    if (item && !editing) {
      setFormData({
        scientificName: item.scientificName,
        commonName: item.commonName ?? '',
        family: item.family ?? '',
        genus: item.genus ?? '',
        kingdom: item.kingdom ?? '',
        phylum: item.phylum ?? '',
        plantClass: item.class ?? '',
        order: item.order ?? '',
        author: item.author ?? '',
        description: item.notes ?? '',
      })
    }
  }, [item, editing])

  const handleSave = async () => {
    if (!formData.scientificName.trim()) {
      setSaveError('Scientific name is required.')
      return
    }
    setSaving(true)
    setSaveError(null)
    try {
      const updated = await api.species.update(id, {
        scientificName: formData.scientificName,
        commonName: formData.commonName,
        family: formData.family,
        genus: formData.genus,
        kingdom: formData.kingdom,
        phylum: formData.phylum,
        class: formData.plantClass,
        order: formData.order,
        author: formData.author,
        notes: formData.description,
      })
      setItem(updated)
      setEditing(false)
    } catch {
      setSaveError('Failed to save changes.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditing(false)
    setSaveError(null)
    if (item) {
      setFormData({
        scientificName: item.scientificName,
        commonName: item.commonName ?? '',
        family: item.family ?? '',
        genus: item.genus ?? '',
        kingdom: item.kingdom ?? '',
        phylum: item.phylum ?? '',
        plantClass: item.class ?? '',
        order: item.order ?? '',
        author: item.author ?? '',
        description: item.notes ?? '',
      })
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
        <div className="h-16 rounded-[20px] shimmer" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 rounded-[20px] shimmer" />
          <div className="h-64 rounded-[20px] shimmer" />
        </div>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in">
        <Link href="/species" className="inline-flex items-center gap-2 text-sm font-medium text-[#6D4C41] hover:text-[#1C1B1F] mb-6 transition-colors">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Back to Taxonomy
        </Link>
        <div className="bg-[#FFEBEE] text-[#C62828] px-6 py-5 rounded-[20px] border border-[#FFCDD2] flex items-center gap-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 8V12M12 16H12.01M3 12C3 7.029 7.029 3 12 3s9 4.029 9 9-4.029 9-9 9-9-4.029-9-9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          <p className="font-medium">{error || 'Species not found.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-12">
      <Link href="/species" className="inline-flex items-center gap-2 text-sm font-medium text-[#6D4C41] hover:text-[#1C1B1F] mb-6 transition-colors">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Back to Taxonomy
      </Link>

      {editing && (
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-[#EEEEEE] px-6 py-3 flex justify-end gap-3 -mx-6 mb-6">
          <button
            onClick={handleCancel}
            disabled={saving}
            className="px-5 py-2 rounded-full bg-white border border-[#EEEEEE] text-[#49454F] text-xs font-medium hover:bg-[#F5F5F5] transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-full bg-[#3D7A52] text-white text-xs font-medium hover:bg-[#2D5F3F] transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}

      {saveError && (
        <div className="bg-[#FFEBEE] text-[#C62828] px-4 py-3 rounded-[12px] mb-6 text-sm border border-[#FFCDD2] flex items-center gap-3">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 5V8M8 11H8.01M2 8C2 4.686 4.686 2 8 2s6 2.686 6 6-2.686 6-6 6-6-2.686-6-6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          {saveError}
        </div>
      )}

      <header className="flex items-start justify-between gap-4 mb-8">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-[#3D7A52] flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white font-mono font-bold text-2xl">{item.scientificName.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold italic text-[#1C1B1F] tracking-tight">{item.scientificName}</h1>
            {item.commonName && <p className="text-sm text-[#6D4C41] mt-1">{item.commonName}</p>}
            {item.kingdom && (
              <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#E8F5E9] text-[#2D5F3F] border border-[#C8E6C9]">
                {item.kingdom}
              </span>
            )}
          </div>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#E8F5E9] text-[#3D7A52] text-xs font-medium hover:bg-[#C8E6C9] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5l13.732-13.732z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Edit
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6">
          <div className="flex items-center gap-2 mb-6">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[#3D7A52]">
              <path d="M12 22C12 22 20 18 20 12C20 6 12 2 12 2C12 2 4 6 4 12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 22V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 12L16 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 16L8 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h2 className="text-[11px] font-bold text-[#3D7A52] uppercase tracking-widest">Classification</h2>
          </div>

          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1">Scientific Name *</label>
                <input
                  type="text"
                  value={formData.scientificName}
                  onChange={e => setFormData({ ...formData, scientificName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-[12px] bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors italic"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1">Common Name</label>
                <input
                  type="text"
                  value={formData.commonName}
                  onChange={e => setFormData({ ...formData, commonName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-[12px] bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1">Kingdom</label>
                  <input
                    type="text"
                    value={formData.kingdom}
                    onChange={e => setFormData({ ...formData, kingdom: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-[12px] bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1">Phylum</label>
                  <input
                    type="text"
                    value={formData.phylum}
                    onChange={e => setFormData({ ...formData, phylum: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-[12px] bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1">Class</label>
                  <input
                    type="text"
                    value={formData.plantClass}
                    onChange={e => setFormData({ ...formData, plantClass: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-[12px] bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1">Order</label>
                  <input
                    type="text"
                    value={formData.order}
                    onChange={e => setFormData({ ...formData, order: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-[12px] bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1">Family</label>
                  <input
                    type="text"
                    value={formData.family}
                    onChange={e => setFormData({ ...formData, family: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-[12px] bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1">Genus</label>
                  <input
                    type="text"
                    value={formData.genus}
                    onChange={e => setFormData({ ...formData, genus: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-[12px] bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1">Author</label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={e => setFormData({ ...formData, author: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-[12px] bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Field label="Scientific Name" value={item.scientificName} />
              <Field label="Common Name" value={item.commonName} />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Kingdom" value={item.kingdom} />
                <Field label="Phylum" value={item.phylum} />
                <Field label="Class" value={item.class} />
                <Field label="Order" value={item.order} />
                <Field label="Family" value={item.family} />
                <Field label="Genus" value={item.genus} />
              </div>
              <Field label="Author" value={item.author} />
            </div>
          )}
        </div>

        <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6">
          <div className="flex items-center gap-2 mb-6">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[#3D7A52]">
              <path d="M13 16H12V12H11M12 8H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h2 className="text-[11px] font-bold text-[#3D7A52] uppercase tracking-widest">Details</h2>
          </div>

          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1">Description / Notes</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-[12px] bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors resize-none"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <Field label="Description / Notes" value={item.notes} />
              
              <div>
                <div className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1">Status</div>
                <span className={clsx(
                  "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
                  item.isActive 
                    ? "bg-[#E8F5E9] text-[#2D5F3F] border-[#C8E6C9]" 
                    : "bg-[#F5F5F5] text-[#6D4C41] border-[#EEEEEE]"
                )}>
                  {item.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div>
                <div className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1">Added</div>
                <div className="text-sm text-[#1C1B1F] font-medium">
                  {new Date(item.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {!editing && (
        <div className="flex justify-center">
          <Link 
            href={`/registry?search=${encodeURIComponent(item.scientificName)}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-[#EEEEEE] text-[#49454F] text-sm font-medium hover:bg-[#F5F5F5] transition-colors shadow-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#3D7A52]">
              <path d="M12 22C12 22 20 18 20 12C20 6 12 2 12 2C12 2 4 6 4 12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 22V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            View Specimens
          </Link>
        </div>
      )}
    </div>
  )
}
