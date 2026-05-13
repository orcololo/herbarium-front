'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { api, type CollectionSession } from '@/lib/api'
import Link from 'next/link'
import clsx from 'clsx'

const EARTH_PALETTES = [
  'from-[#E8F5E9] to-[#A5D6A7]',
  'from-[#FFF8E1] to-[#FFE082]',
  'from-[#EFEBE9] to-[#BCAAA4]',
  'from-[#E0F2F1] to-[#80CBC4]',
]

function getGradient(id: string) {
  const index = id.charCodeAt(0) % EARTH_PALETTES.length
  return EARTH_PALETTES[index]
}

function Field({ label, value }: { label: string; value?: string | number | null }) {
  if (value == null || value === '') return null
  return (
    <div className="mb-4 last:mb-0">
      <p className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm text-[#1C1B1F] font-medium">{String(value)}</p>
    </div>
  )
}

export default function SessionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [session, setSession] = useState<CollectionSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [newMember, setNewMember] = useState('')
  const [formData, setFormData] = useState({
    tripName: '',
    startDate: '',
    endDate: '',
    location: '',
    teamMembers: [] as string[],
    notes: '',
    isArchived: false,
  })

  useEffect(() => {
    api.sessions.get(id)
      .then(setSession)
      .catch(() => setError('Falha ao carregar sessão.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleSave = async () => {
    if (!formData.tripName.trim()) {
      setSaveError('Nome da expedição é obrigatório')
      return
    }
    setSaving(true)
    setSaveError(null)
    try {
      const updated = await api.sessions.update(id, {
        tripName: formData.tripName,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        location: formData.location || undefined,
        teamMembers: formData.teamMembers,
        notes: formData.notes || undefined,
        isArchived: formData.isArchived,
      })
      setSession(updated)
      setEditing(false)
    } catch (err) {
      setSaveError('Falha ao salvar alterações')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditing(false)
    setSaveError(null)
  }

  const handleAddMember = () => {
    const name = newMember.trim()
    if (name && !formData.teamMembers.includes(name)) {
      setFormData(prev => ({ ...prev, teamMembers: [...prev.teamMembers, name] }))
      setNewMember('')
    }
  }

  const handleRemoveMember = (index: number) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((_, i) => i !== index)
    }))
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div className="h-48 rounded-[24px] shimmer" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-[24px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-4 shimmer rounded-full" style={{ width: `${60 + i * 5}%` }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <div className="w-16 h-16 rounded-full bg-[#FFEBEE] text-[#C62828] flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <p className="text-lg font-medium text-[#1C1B1F]">{error ?? 'Sessão não encontrada'}</p>
        <Link href="/sessions" className="inline-flex items-center gap-2 px-4 py-2 mt-6 rounded-full bg-white border border-[#EEEEEE] text-sm font-medium text-[#49454F] hover:bg-[#F5F5F5] transition-colors">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M12 15L7 10L12 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Voltar para Sessões
        </Link>
      </div>
    )
  }

  const startDateStr = new Date(session.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  const endDateStr = session.endDate ? new Date(session.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : null
  const dateRange = endDateStr ? `${startDateStr} → ${endDateStr}` : startDateStr

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-12">
      <div className="relative mb-16">
        <div className={clsx('h-48 rounded-[24px] bg-gradient-to-br flex items-center justify-center relative overflow-hidden shadow-sm', getGradient(session.id))}>
          <svg width="96" height="96" viewBox="0 0 48 48" fill="none" className="opacity-30 mix-blend-overlay">
            <rect x="8" y="10" width="32" height="28" rx="4" stroke="currentColor" strokeWidth="2"/>
            <path d="M16 6V14M32 6V14M8 20H40" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          
          <Link href="/sessions" className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm text-sm font-medium text-[#1C1B1F] hover:bg-white transition-colors shadow-sm">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M12 15L7 10L12 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Back
          </Link>

          {session.isArchived && (
            <div className="absolute top-4 right-4">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm text-[#9E9E9E] shadow-sm">
                Arquivada
              </span>
            </div>
          )}
        </div>

        <div className="absolute -bottom-10 left-8 right-8 bg-white rounded-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] p-6 border border-[#EEEEEE] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-[22px] font-bold text-[#1C1B1F] tracking-tight">{session.tripName}</h1>
              {!editing && (
                <button
                  onClick={() => {
                    setFormData({
                      tripName: session.tripName,
                      startDate: session.startDate.substring(0, 10),
                      endDate: session.endDate ? session.endDate.substring(0, 10) : '',
                      location: session.location ?? '',
                      teamMembers: [...session.teamMembers],
                      notes: session.notes ?? '',
                      isArchived: session.isArchived,
                    })
                    setEditing(true)
                  }}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E8F5E9] text-[#3D7A52] text-xs font-medium hover:bg-[#C8E6C9] transition-colors"
                  title="Edit Session"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                  </svg>
                  Editar
193	                </button>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-sm text-[#6D4C41]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>{dateRange}</span>
            </div>
          </div>
          
          <Link
            href={`/registry?sessionId=${session.uuid}`}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#3D7A52] text-white text-sm font-medium shadow-[0_2px_8px_rgba(61,122,82,0.3)] hover:bg-[#2D5F3F] hover:-translate-y-0.5 transition-all duration-200 shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 21C12 21 5 14.5 5 9C5 5.13401 8.13401 2 12 2C15.866 2 19 5.13401 19 9C19 14.5 12 21 12 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="9" r="3" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Ver Espécimes
          </Link>
        </div>
      </div>

      {editing && (
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-[#EEEEEE] px-6 py-3 flex justify-end gap-3 -mx-6 mb-6">
          {saveError && <span className="text-[#C62828] text-sm font-medium self-center mr-auto">{saveError}</span>}
          <button
            onClick={handleCancel}
            disabled={saving}
            className="px-5 py-2 rounded-full bg-white border border-[#EEEEEE] text-[#49454F] text-xs font-medium hover:bg-[#F5F5F5] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-full bg-[#3D7A52] text-white text-xs font-medium hover:bg-[#2D5F3F] transition-colors disabled:opacity-60"
          >
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6 border border-transparent hover:border-[#EEEEEE] transition-colors">
          <div className="flex items-center gap-2 mb-5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#3D7A52]">
              <path d="M12 21C12 21 5 14.5 5 9C5 5.13401 8.13401 2 12 2C15.866 2 19 5.13401 19 9C19 14.5 12 21 12 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="9" r="3" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <h2 className="text-[11px] font-bold text-[#3D7A52] uppercase tracking-widest">Detalhes da Expedição</h2>
          </div>
          
          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1">Nome da Expedição *</label>
                <input
                  type="text"
                  value={formData.tripName}
                  onChange={e => setFormData(prev => ({ ...prev, tripName: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-[12px] bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors"
                  placeholder="Nome da Expedição"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1">Data Início</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-[12px] bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1">Data Fim</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={e => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-[12px] bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1">Localidade</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-[12px] bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors"
                  placeholder="Localidade"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer mt-2">
                  <input
                    type="checkbox"
                    checked={formData.isArchived}
                    onChange={e => setFormData(prev => ({ ...prev, isArchived: e.target.checked }))}
                    className="w-4 h-4 text-[#3D7A52] rounded border-gray-300 focus:ring-[#3D7A52]"
                  />
                  <span className="text-sm font-medium text-[#1C1B1F]">Arquivada</span>
                </label>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1">Código de Compartilhamento</label>
                <p className="text-sm text-[#1C1B1F] font-medium px-4 py-2.5 bg-[#F5F5F5] rounded-[12px] opacity-70">{session.shareCode || 'Nenhum'}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <Field label="Localidade" value={session.location} />
              <Field label="Código de Compartilhamento" value={session.shareCode} />
            </div>
          )}
        </div>

        {(session.teamMembers.length > 0 || editing) && (
          <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6 border border-transparent hover:border-[#EEEEEE] transition-colors">
            <div className="flex items-center gap-2 mb-5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#3D7A52]">
                <path d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M23 21V19C23 17.1432 21.733 15.5824 20 15.13M16 3.13C17.733 3.5824 19 5.14318 19 7C19 8.85682 17.733 10.4176 16 10.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h2 className="text-[11px] font-bold text-[#3D7A52] uppercase tracking-widest">Membros da Equipe</h2>
            </div>
            
            {editing ? (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {formData.teamMembers.map((member, index) => (
                    <span key={index} className="flex items-center gap-1 text-xs pl-3.5 pr-2 py-1.5 rounded-full bg-[#E8F5E9] text-[#2D5F3F] font-medium border border-[#C8E6C9]">
                      {member}
                      <button
                        onClick={() => handleRemoveMember(index)}
                        className="w-4 h-4 rounded-full hover:bg-[#C8E6C9] flex items-center justify-center transition-colors"
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </span>
                  ))}
                  {formData.teamMembers.length === 0 && (
                    <span className="text-sm text-[#9E9E9E] italic">Nenhum membro na equipe</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMember}
                    onChange={e => setNewMember(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddMember()
                      }
                    }}
                    className="flex-1 px-4 py-2.5 rounded-[12px] bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors"
                    placeholder="Nome do membro..."
                  />
                  <button
                    onClick={handleAddMember}
                    className="px-5 py-2 rounded-[12px] bg-[#3D7A52] text-white text-xs font-medium hover:bg-[#2D5F3F] transition-colors"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {session.teamMembers.map(member => (
                  <span key={member} className="text-xs px-3.5 py-1.5 rounded-full bg-[#E8F5E9] text-[#2D5F3F] font-medium border border-[#C8E6C9]">{member}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {(session.notes || editing) && (
          <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6 border border-transparent hover:border-[#EEEEEE] transition-colors md:col-span-2">
            <div className="flex items-center gap-2 mb-5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#3D7A52]">
                <path d="M11 4H4C2.89543 4 2 4.89543 2 6V20C2 21.1046 2.89543 22 4 22H18C19.1046 22 20 21.1046 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18.5 2.50001C19.3284 1.67158 20.6716 1.67158 21.5 2.50001C22.3284 3.32844 22.3284 4.67158 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h2 className="text-[11px] font-bold text-[#3D7A52] uppercase tracking-widest">Notes</h2>
            </div>
            
            {editing ? (
              <textarea
                rows={4}
                value={formData.notes}
                onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-[12px] bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors resize-y"
                placeholder="Add notes about this session..."
              />
            ) : (
              <p className="text-sm text-[#49454F] leading-relaxed whitespace-pre-wrap">{session.notes}</p>
            )}
          </div>
        )}
      </div>

      {!editing && (
        <div className="mt-12 flex justify-center">
          <button
            onClick={() => {
              if (!confirm('Archive this session?')) return
              api.sessions.update(id, { isArchived: true }).then(() => router.replace('/sessions'))
            }}
            className="px-5 py-2 rounded-full bg-white border border-[#FFEBEE] text-[#C62828] text-xs font-medium hover:bg-[#FFEBEE] transition-colors"
          >
            Archive Session
          </button>
        </div>
      )}
    </div>
  )
}
