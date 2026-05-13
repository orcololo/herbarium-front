'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Shield } from 'lucide-react'
import { api, User } from '@/lib/api'

const ROLES = ['admin', 'researcher', 'user'] as const

function RoleBadge({ role }: { role: string }) {
  const styles = {
    admin: 'bg-[#E8F5E9] text-[#2D5F3F]',
    researcher: 'bg-[#E1F5FE] text-[#01579B]',
    user: 'bg-[#F5F5F5] text-[#49454F]',
  }
  const cls = styles[role as keyof typeof styles] ?? styles.user
  const labels: Record<string, string> = { admin: 'Administrador', researcher: 'Pesquisador', user: 'Coletor' }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {labels[role] ?? role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  )
}

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api.users.get(id).then(u => {
      setUser(u)
      setSelectedRole(u.role ?? 'user')
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    setSaved(false)
    try {
      const updated = await api.users.update(user.id, { role: selectedRole })
      setUser(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-24 bg-[#EEEEEE] rounded animate-pulse" />
        <div className="bg-white rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-[#EEEEEE] animate-pulse" />
            <div className="space-y-3">
              <div className="h-6 w-48 bg-[#EEEEEE] rounded animate-pulse" />
              <div className="h-4 w-36 bg-[#EEEEEE] rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-[#49454F] hover:text-[#1C1B1F] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <div className="bg-white rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8 text-center">
          <p className="text-[#9E9E9E]">Usuário não encontrado.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-[#49454F] hover:text-[#1C1B1F] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar para Usuários
      </button>

      <div className="bg-white rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 rounded-full bg-[#E8F5E9] flex items-center justify-center text-[#3D7A52] text-2xl font-bold">
            {user.name?.charAt(0).toUpperCase() ?? 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1C1B1F]">{user.name}</h1>
            <p className="text-sm text-[#49454F]">{user.email}</p>
            {user.institution && (
              <p className="text-sm text-[#9E9E9E] mt-1">{user.institution}</p>
            )}
          </div>
        </div>

        <div className="border-t border-[#F0F0F0] pt-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-[#3D7A52]" />
            <h2 className="text-lg font-semibold text-[#1C1B1F]">Gerenciamento de Função</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <label htmlFor="role-select" className="text-sm text-[#49454F]">
                Função atual:
              </label>
              <RoleBadge role={user.role ?? 'user'} />
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <select
              id="role-select"
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value)}
              className="px-4 py-2 border border-[#DDDDDD] rounded-full text-sm text-[#1C1B1F] bg-white focus:outline-none focus:ring-2 focus:ring-[#3D7A52] focus:border-transparent"
            >
              {ROLES.map(role => (
                <option key={role} value={role}>
                  {role === 'admin' ? 'Administrador' : role === 'researcher' ? 'Pesquisador' : 'Coletor'}
                </option>
              ))}
            </select>

            <button
              onClick={handleSave}
              disabled={saving || selectedRole === (user.role ?? 'user')}
              className="px-6 py-2 text-sm font-medium bg-[#3D7A52] text-white rounded-full hover:bg-[#2D5F3F] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Salvando...' : saved ? 'Salvo' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
