'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Shield, ShieldCheck, Trash2 } from 'lucide-react'
import { api, ApiError, type User, type UserRole } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

const ROLE_OPTIONS: Array<{ value: UserRole; label: string }> = [
  { value: 'collector', label: 'Coletor' },
  { value: 'researcher', label: 'Pesquisador' },
  { value: 'admin', label: 'Administrador' },
]

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  researcher: 'Pesquisador',
  collector: 'Coletor',
}

type UserForm = {
  name: string
  email: string
  institution: string
  avatar: string
  role: UserRole
}

function RoleBadge({ role }: { role: UserRole }) {
  const styles: Record<UserRole, string> = {
    admin: 'bg-[#E8F5E9] text-[#2D5F3F]',
    researcher: 'bg-[#E1F5FE] text-[#01579B]',
    collector: 'bg-[#F5F5F5] text-[#49454F]',
  }

  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[role]}`}>{ROLE_LABELS[role]}</span>
}

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { user: currentUser, refreshUser } = useAuth()

  const [user, setUser] = useState<User | null>(null)
  const [form, setForm] = useState<UserForm>({ name: '', email: '', institution: '', avatar: '', role: 'collector' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let mounted = true
    api.users.get(id)
      .then(item => {
        if (!mounted) return
        setUser(item)
        setForm({
          name: item.name ?? '',
          email: item.email ?? '',
          institution: item.institution ?? '',
          avatar: item.avatar ?? '',
          role: item.role ?? 'collector',
        })
      })
      .catch(err => {
        if (mounted) setError(err instanceof ApiError ? err.message : 'Falha ao carregar usuário.')
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => { mounted = false }
  }, [id])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!user) return
    setSaving(true)
    setSaved(false)
    setError(null)
    try {
      const updated = await api.users.update(user.id, {
        name: form.name.trim(),
        email: form.email.trim(),
        institution: form.institution.trim() || undefined,
        avatar: form.avatar.trim() || undefined,
        role: form.role,
      })
      setUser(updated)
      setSaved(true)
      if (currentUser?.id === updated.id) await refreshUser()
      setTimeout(() => setSaved(false), 2200)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Falha ao salvar usuário.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!user) return
    setDeleting(true)
    setError(null)
    try {
      await api.users.delete(user.id)
      router.replace('/users')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Falha ao remover usuário.')
      setDeleting(false)
    }
  }

  if (currentUser?.role !== 'admin') {
    return (
      <div className="bg-white rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8 text-center max-w-xl mx-auto">
        <ShieldCheck className="w-10 h-10 text-[#9E9E9E] mx-auto mb-3" />
        <h1 className="text-xl font-bold text-[#1C1B1F]">Acesso restrito</h1>
        <p className="text-sm text-[#49454F] mt-2">Detalhes de usuários estão disponíveis apenas para administradores.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-28 shimmer rounded" />
        <div className="h-80 shimmer rounded-[16px]" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <Link href="/users" className="inline-flex items-center gap-2 text-sm text-[#49454F] hover:text-[#1C1B1F] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar para Usuários
        </Link>
        <div className="bg-white rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8 text-center">
          <p className="text-[#9E9E9E]">Usuário não encontrado.</p>
        </div>
      </div>
    )
  }

  const initials = user.name?.charAt(0).toUpperCase() ?? 'U'

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <Link href="/users" className="inline-flex items-center gap-2 text-sm text-[#49454F] hover:text-[#1C1B1F] transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar para Usuários
      </Link>

      <header className="bg-white rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-5 min-w-0">
          <div className="w-16 h-16 rounded-full bg-[#E8F5E9] flex items-center justify-center text-[#3D7A52] text-xl font-bold overflow-hidden shrink-0">
            {form.avatar ? <img src={form.avatar} alt="" className="w-full h-full object-cover" /> : initials}
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-[#1C1B1F] truncate">{user.name}</h1>
            <p className="text-sm text-[#49454F] truncate">{user.email}</p>
            <div className="mt-2"><RoleBadge role={user.role ?? 'collector'} /></div>
          </div>
        </div>

        {deleteConfirm ? (
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setDeleteConfirm(false)} className="px-4 py-2 rounded-full border border-[#DDDDDD] text-sm font-medium text-[#49454F] hover:bg-[#F5F5F5] transition-colors">Cancelar</button>
            <button type="button" onClick={handleDelete} disabled={deleting} className="px-4 py-2 rounded-full bg-[#FFEBEE] text-[#C62828] text-sm font-medium hover:bg-[#FFCDD2] disabled:opacity-60 transition-colors">Confirmar remoção</button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setDeleteConfirm(true)}
            disabled={user.id === currentUser?.id}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#FFCDD2] text-[#C62828] text-sm font-medium hover:bg-[#FFEBEE] disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Remover
          </button>
        )}
      </header>

      {error && <div className="bg-[#FFEBEE] text-[#C62828] px-4 py-3 rounded-[12px] text-sm border border-[#FFCDD2]">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6 space-y-5">
        <div className="flex items-center gap-3 border-b border-[#F0F0F0] pb-4">
          <Shield className="w-5 h-5 text-[#3D7A52]" />
          <h2 className="text-lg font-semibold text-[#1C1B1F]">Dados da conta</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1.5 block">Nome</span>
            <input required value={form.name} onChange={event => setForm(prev => ({ ...prev, name: event.target.value }))} className="w-full px-4 py-3 rounded-[12px] bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors" />
          </label>
          <label className="block">
            <span className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1.5 block">E-mail</span>
            <input type="email" required value={form.email} onChange={event => setForm(prev => ({ ...prev, email: event.target.value }))} className="w-full px-4 py-3 rounded-[12px] bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors" />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1.5 block">Instituição</span>
            <input value={form.institution} onChange={event => setForm(prev => ({ ...prev, institution: event.target.value }))} className="w-full px-4 py-3 rounded-[12px] bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors" />
          </label>
          <label className="block">
            <span className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1.5 block">Função</span>
            <select value={form.role} onChange={event => setForm(prev => ({ ...prev, role: event.target.value as UserRole }))} className="w-full px-4 py-3 rounded-[12px] bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors">
              {ROLE_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1.5 block">Avatar URL</span>
          <input type="url" value={form.avatar} onChange={event => setForm(prev => ({ ...prev, avatar: event.target.value }))} className="w-full px-4 py-3 rounded-[12px] bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors" />
        </label>

        <div className="flex items-center justify-end gap-3 pt-2">
          {saved && <span className="text-sm font-medium text-[#3D7A52]">Salvo</span>}
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#3D7A52] text-white text-sm font-medium hover:bg-[#2D5F3F] disabled:opacity-60 transition-colors">
            <Save className="w-4 h-4" />
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  )
}
