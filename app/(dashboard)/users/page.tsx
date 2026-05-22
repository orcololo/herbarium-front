'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Search, ShieldCheck, Trash2, Users } from 'lucide-react'
import { api, ApiError, type PaginatedResponse, type User, type UserRole } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  researcher: 'Pesquisador',
  collector: 'Coletor',
}

function RoleBadge({ role }: { role?: UserRole }) {
  const styles: Record<UserRole, string> = {
    admin: 'bg-[#E8F5E9] text-[#2D5F3F]',
    researcher: 'bg-[#E1F5FE] text-[#01579B]',
    collector: 'bg-[#F5F5F5] text-[#49454F]',
  }
  const resolvedRole = role ?? 'collector'

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[resolvedRole]}`}>
      {ROLE_LABELS[resolvedRole]}
    </span>
  )
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-[#EEEEEE]" /><div className="h-4 w-32 bg-[#EEEEEE] rounded" /></div></td>
      <td className="px-6 py-4"><div className="h-4 w-40 bg-[#EEEEEE] rounded" /></td>
      <td className="px-6 py-4"><div className="h-5 w-20 bg-[#EEEEEE] rounded-full" /></td>
      <td className="px-6 py-4"><div className="h-4 w-28 bg-[#EEEEEE] rounded" /></td>
      <td className="px-6 py-4"><div className="h-4 w-20 bg-[#EEEEEE] rounded" /></td>
    </tr>
  )
}

export default function UsersPage() {
  const { user: currentUser } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<PaginatedResponse<User> | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [role, setRole] = useState<UserRole | 'all'>('all')
  const [error, setError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const limit = 10

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 350)
    return () => clearTimeout(timer)
  }, [search])

  const load = useCallback(async () => {
    if (currentUser?.role !== 'admin') {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await api.users.list({
        page,
        limit,
        search: debouncedSearch || undefined,
        role: role === 'all' ? undefined : role,
      })
      setData(res)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Falha ao carregar usuários.')
    } finally {
      setLoading(false)
    }
  }, [currentUser?.role, debouncedSearch, page, role])

  useEffect(() => { load() }, [load])

  async function handleDelete(id: string) {
    setDeleting(true)
    setError(null)
    try {
      await api.users.delete(id)
      setDeleteId(null)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Falha ao remover usuário.')
    } finally {
      setDeleting(false)
    }
  }

  if (currentUser?.role !== 'admin') {
    return (
      <div className="bg-white rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8 text-center max-w-xl mx-auto">
        <ShieldCheck className="w-10 h-10 text-[#9E9E9E] mx-auto mb-3" />
        <h1 className="text-xl font-bold text-[#1C1B1F]">Acesso restrito</h1>
        <p className="text-sm text-[#49454F] mt-2">Usuários podem ser gerenciados apenas por administradores.</p>
      </div>
    )
  }

  const totalPages = data ? Math.ceil(data.total / limit) : 0

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#E8F5E9] flex items-center justify-center">
            <Users className="w-5 h-5 text-[#3D7A52]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1C1B1F]">Usuários</h1>
            <p className="text-sm text-[#9E9E9E]">
              {data ? `${data.total} usuários ativos` : 'Carregando...'}
            </p>
          </div>
        </div>

        <Link
          href="/users/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#3D7A52] text-white text-sm font-medium shadow-[0_2px_8px_rgba(61,122,82,0.3)] hover:bg-[#2D5F3F] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo usuário
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9E9E9E]" />
          <input
            type="search"
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Buscar por nome ou instituição…"
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-[#DDDDDD] text-sm text-[#1C1B1F] placeholder:text-[#9E9E9E] focus:outline-none focus:ring-2 focus:ring-[#3D7A52] focus:border-transparent transition-shadow"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(['all', 'admin', 'researcher', 'collector'] as const).map(option => (
            <button
              key={option}
              type="button"
              onClick={() => { setRole(option); setPage(1) }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${role === option ? 'bg-[#E8F5E9] text-[#2D5F3F]' : 'bg-white text-[#49454F] border border-[#DDDDDD] hover:bg-[#F5F5F5]'}`}
            >
              {option === 'all' ? 'Todos' : ROLE_LABELS[option]}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-[#FFEBEE] text-[#C62828] px-4 py-3 rounded-[12px] text-sm border border-[#FFCDD2]">
          {error}
          <button onClick={load} className="ml-auto text-xs font-medium underline hover:no-underline">Tentar novamente</button>
        </div>
      )}

      <div className="bg-white rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-[#DDDDDD]">
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#9E9E9E] uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#9E9E9E] uppercase tracking-wider">E-mail</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#9E9E9E] uppercase tracking-wider">Função</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#9E9E9E] uppercase tracking-wider">Instituição</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-[#9E9E9E] uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F0F0]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : data?.data.length ? (
                data.data.map(user => (
                  <tr key={user.id} className="hover:bg-[#F5F5F5] transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/users/${user.id}`} className="flex items-center gap-3 group">
                        <div className="w-9 h-9 rounded-full bg-[#E8F5E9] flex items-center justify-center text-[#3D7A52] text-sm font-bold overflow-hidden">
                          {user.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : user.name?.charAt(0).toUpperCase() ?? 'U'}
                        </div>
                        <span className="text-sm font-medium text-[#1C1B1F] group-hover:text-[#3D7A52] transition-colors">
                          {user.name}
                        </span>
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#49454F]">{user.email}</td>
                    <td className="px-6 py-4"><RoleBadge role={user.role} /></td>
                    <td className="px-6 py-4 text-sm text-[#49454F]">{user.institution ?? '—'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => router.push(`/users/${user.id}`)}
                          className="px-3 py-1.5 rounded-full border border-[#DDDDDD] text-xs font-medium text-[#49454F] hover:bg-white transition-colors"
                        >
                          Editar
                        </button>
                        {deleteId === user.id ? (
                          <button
                            type="button"
                            disabled={deleting}
                            onClick={() => handleDelete(user.id)}
                            className="px-3 py-1.5 rounded-full bg-[#FFEBEE] text-[#C62828] text-xs font-medium hover:bg-[#FFCDD2] disabled:opacity-60 transition-colors"
                          >
                            Confirmar
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={user.id === currentUser?.id}
                            onClick={() => setDeleteId(user.id)}
                            className="w-8 h-8 rounded-full text-[#9E9E9E] hover:bg-[#FFEBEE] hover:text-[#C62828] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#9E9E9E] transition-colors inline-flex items-center justify-center"
                            aria-label="Remover usuário"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center text-sm text-[#9E9E9E]">Nenhum usuário encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#F0F0F0]">
            <p className="text-sm text-[#9E9E9E]">Página {page} de {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 text-sm font-medium border border-[#DDDDDD] rounded-full text-[#49454F] hover:bg-[#F5F5F5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Anterior</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 text-sm font-medium border border-[#DDDDDD] rounded-full text-[#49454F] hover:bg-[#F5F5F5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Próximo</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
