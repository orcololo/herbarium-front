'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ShieldCheck, UserPlus } from 'lucide-react'
import { api, ApiError, type UserRole } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

const ROLE_OPTIONS: Array<{ value: UserRole; label: string }> = [
  { value: 'collector', label: 'Coletor' },
  { value: 'researcher', label: 'Pesquisador' },
  { value: 'admin', label: 'Administrador' },
]

export default function NewUserPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [institution, setInstitution] = useState('')
  const [role, setRole] = useState<UserRole>('collector')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const created = await api.users.create({
        name: name.trim(),
        email: email.trim(),
        password,
        institution: institution.trim() || undefined,
        role,
      })
      router.replace(`/users/${created.id}`)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Falha ao criar usuário.')
    } finally {
      setSaving(false)
    }
  }

  if (user?.role !== 'admin') {
    return (
      <div className="bg-white rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8 text-center max-w-xl mx-auto">
        <ShieldCheck className="w-10 h-10 text-[#9E9E9E] mx-auto mb-3" />
        <h1 className="text-xl font-bold text-[#1C1B1F]">Acesso restrito</h1>
        <p className="text-sm text-[#49454F] mt-2">Novos usuários podem ser criados apenas por administradores.</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in space-y-6">
      <Link href="/users" className="inline-flex items-center gap-2 text-sm font-medium text-[#6D4C41] hover:text-[#1C1B1F] transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Voltar para Usuários
      </Link>

      <header className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[#E8F5E9] flex items-center justify-center text-[#3D7A52]">
          <UserPlus className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1C1B1F]">Novo usuário</h1>
          <p className="text-sm text-[#6D4C41] mt-1">Conta administrativa criada pelo painel</p>
        </div>
      </header>

      {error && (
        <div className="bg-[#FFEBEE] text-[#C62828] px-4 py-3 rounded-[12px] text-sm border border-[#FFCDD2]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1.5 block">Nome</span>
            <input required value={name} onChange={event => setName(event.target.value)} className="w-full px-4 py-3 rounded-[12px] bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors" />
          </label>
          <label className="block">
            <span className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1.5 block">E-mail</span>
            <input type="email" required value={email} onChange={event => setEmail(event.target.value)} className="w-full px-4 py-3 rounded-[12px] bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors" />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1.5 block">Senha inicial</span>
            <input type="password" required minLength={8} value={password} onChange={event => setPassword(event.target.value)} className="w-full px-4 py-3 rounded-[12px] bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors" />
          </label>
          <label className="block">
            <span className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1.5 block">Função</span>
            <select value={role} onChange={event => setRole(event.target.value as UserRole)} className="w-full px-4 py-3 rounded-[12px] bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors">
              {ROLE_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1.5 block">Instituição</span>
          <input value={institution} onChange={event => setInstitution(event.target.value)} className="w-full px-4 py-3 rounded-[12px] bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors" />
        </label>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/users" className="px-5 py-2.5 rounded-full border border-[#DDDDDD] text-sm font-medium text-[#49454F] hover:bg-[#F5F5F5] transition-colors">Cancelar</Link>
          <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-full bg-[#3D7A52] text-white text-sm font-medium hover:bg-[#2D5F3F] disabled:opacity-60 transition-colors">
            {saving ? 'Criando...' : 'Criar usuário'}
          </button>
        </div>
      </form>
    </div>
  )
}
