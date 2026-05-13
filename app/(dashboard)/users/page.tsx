'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users } from 'lucide-react'
import { api, User, PaginatedResponse } from '@/lib/api'

function RoleBadge({ role }: { role?: string }) {
  const styles = {
    admin: 'bg-[#E8F5E9] text-[#2D5F3F]',
    researcher: 'bg-[#E1F5FE] text-[#01579B]',
    user: 'bg-[#F5F5F5] text-[#49454F]',
  }
  const r = role ?? 'user'
  const cls = styles[r as keyof typeof styles] ?? styles.user
  const labels: Record<string, string> = { admin: 'Administrador', researcher: 'Pesquisador', user: 'Coletor' }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {labels[r] ?? r.charAt(0).toUpperCase() + r.slice(1)}
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
      <td className="px-6 py-4"><div className="h-4 w-24 bg-[#EEEEEE] rounded" /></td>
    </tr>
  )
}

export default function UsersPage() {
  const [data, setData] = useState<PaginatedResponse<User> | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const limit = 10

  useEffect(() => {
    setLoading(true)
    api.users.list({ page, limit }).then(res => {
      setData(res)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [page])

  const totalPages = data ? Math.ceil(data.total / limit) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#E8F5E9] flex items-center justify-center">
            <Users className="w-5 h-5 text-[#3D7A52]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1C1B1F]">Usuários</h1>
            <p className="text-sm text-[#9E9E9E]">
              {data ? `${data.total} usuários registrados` : 'Carregando...'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#DDDDDD]">
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#9E9E9E] uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#9E9E9E] uppercase tracking-wider">E-mail</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#9E9E9E] uppercase tracking-wider">Função</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#9E9E9E] uppercase tracking-wider">Instituição</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#9E9E9E] uppercase tracking-wider">Cadastro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F0F0]">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : (
              data?.data.map(user => (
                <tr key={user.id} className="hover:bg-[#F5F5F5] transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/users/${user.id}`} className="flex items-center gap-3 group">
                      <div className="w-9 h-9 rounded-full bg-[#E8F5E9] flex items-center justify-center text-[#3D7A52] text-sm font-bold">
                        {user.name?.charAt(0).toUpperCase() ?? 'U'}
                      </div>
                      <span className="text-sm font-medium text-[#1C1B1F] group-hover:text-[#3D7A52] transition-colors">
                        {user.name}
                      </span>
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#49454F]">{user.email}</td>
                  <td className="px-6 py-4"><RoleBadge role={user.role} /></td>
                  <td className="px-6 py-4 text-sm text-[#49454F]">{user.institution ?? '—'}</td>
                  <td className="px-6 py-4 text-sm text-[#9E9E9E]">—</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#F0F0F0]">
            <p className="text-sm text-[#9E9E9E]">
              Página {page} de {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-medium border border-[#DDDDDD] rounded-full text-[#49454F] hover:bg-[#F5F5F5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Anterior
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm font-medium border border-[#DDDDDD] rounded-full text-[#49454F] hover:bg-[#F5F5F5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Próximo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
