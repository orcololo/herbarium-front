'use client'

import { FormEvent, useEffect, useState } from 'react'
import { ApiError } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { Building2, Mail, Save, Shield, UserCircle } from 'lucide-react'

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  researcher: 'Pesquisador',
  collector: 'Coletor',
}

type ProfileForm = {
  name: string
  email: string
  institution: string
  avatar: string
}

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const [form, setForm] = useState<ProfileForm>({ name: '', email: '', institution: '', avatar: '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    setForm({
      name: user.name ?? '',
      email: user.email ?? '',
      institution: user.institution ?? '',
      avatar: user.avatar ?? '',
    })
  }, [user])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setSaved(false)
    setError(null)
    try {
      await updateProfile({
        name: form.name.trim(),
        email: form.email.trim(),
        institution: form.institution.trim() || undefined,
        avatar: form.avatar.trim() || undefined,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2400)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Falha ao salvar perfil.')
    } finally {
      setSaving(false)
    }
  }

  const initials = user?.name?.charAt(0).toUpperCase() ?? 'U'
  const role = user?.role ?? 'collector'

  return (
    <div className="max-w-5xl mx-auto animate-fade-in space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#E8F5E9] text-[#3D7A52] flex items-center justify-center shadow-sm overflow-hidden">
            {form.avatar ? (
              <img src={form.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-bold">{initials}</span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1C1B1F]">Perfil</h1>
            <p className="text-sm text-[#6D4C41] mt-1">{user?.email}</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E8F5E9] text-[#2D5F3F] text-xs font-bold uppercase tracking-wider w-fit">
          <Shield className="w-3.5 h-3.5" />
          {ROLE_LABELS[role] ?? role}
        </span>
      </header>

      {error && (
        <div className="bg-[#FFEBEE] text-[#C62828] px-4 py-3 rounded-[12px] text-sm border border-[#FFCDD2]">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="flex items-center gap-2 text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1.5">
                <UserCircle className="w-3.5 h-3.5" /> Nome
              </span>
              <input
                type="text"
                required
                value={form.name}
                onChange={event => setForm(prev => ({ ...prev, name: event.target.value }))}
                className="w-full px-4 py-3 rounded-[12px] bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors"
              />
            </label>

            <label className="block">
              <span className="flex items-center gap-2 text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1.5">
                <Mail className="w-3.5 h-3.5" /> E-mail
              </span>
              <input
                type="email"
                required
                value={form.email}
                onChange={event => setForm(prev => ({ ...prev, email: event.target.value }))}
                className="w-full px-4 py-3 rounded-[12px] bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors"
              />
            </label>
          </div>

          <label className="block">
            <span className="flex items-center gap-2 text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1.5">
              <Building2 className="w-3.5 h-3.5" /> Instituição
            </span>
            <input
              type="text"
              value={form.institution}
              onChange={event => setForm(prev => ({ ...prev, institution: event.target.value }))}
              className="w-full px-4 py-3 rounded-[12px] bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors"
            />
          </label>

          <label className="block">
            <span className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1.5 block">Avatar URL</span>
            <input
              type="url"
              value={form.avatar}
              onChange={event => setForm(prev => ({ ...prev, avatar: event.target.value }))}
              className="w-full px-4 py-3 rounded-[12px] bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors"
            />
          </label>

          <div className="flex items-center justify-end gap-3 pt-2">
            {saved && <span className="text-sm font-medium text-[#3D7A52]">Salvo</span>}
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#3D7A52] text-white text-sm font-medium hover:bg-[#2D5F3F] disabled:opacity-60 transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>

        <aside className="bg-white rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6 h-fit space-y-5">
          <div>
            <p className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1">ID</p>
            <p className="text-sm text-[#49454F] break-all font-mono">{user?.id}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1">Função</p>
            <p className="text-sm text-[#1C1B1F] font-medium">{ROLE_LABELS[role] ?? role}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1">Status</p>
            <p className="text-sm text-[#1C1B1F] font-medium">{user?.isActive === false ? 'Inativo' : 'Ativo'}</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
