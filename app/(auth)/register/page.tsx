'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { ApiError } from '@/lib/api'

export default function RegisterPage() {
  const { register } = useAuth()
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [institution, setInstitution] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await register(name, email, password, institution || undefined)
      router.replace('/registry')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Erro inesperado. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md animate-slide-up">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] overflow-hidden border border-white/20">
        <div className="px-8 pt-10 pb-5 text-center flex flex-col items-center">
          <div className="inline-flex items-center justify-center w-[64px] h-[64px] rounded-full bg-[#E8F5E9] mb-5 shadow-sm">
            <svg width="36" height="36" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 4C16 4 6 10 6 20C6 25.52 10.48 30 16 30C21.52 30 26 25.52 26 20C26 10 16 4 16 4Z" fill="#3D7A52" fillOpacity="0.9"/>
              <path d="M16 4C16 4 16 14 10 20" stroke="#E8F5E9" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="text-[24px] font-bold text-[#1C1B1F] tracking-tight">Criar conta</h1>
          <p className="text-[#6D4C41] text-sm mt-1 italic">Junte-se ao Folium</p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#49454F] mb-1.5 uppercase tracking-wider" htmlFor="name">
              Nome completo
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#F5F5F5] text-[#1C1B1F] text-sm outline-none border-2 border-transparent focus:border-[#3D7A52] transition-all duration-200 placeholder:text-[#AAAAAA]"
              placeholder="Dr. Ana Ribeiro"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#49454F] mb-1.5 uppercase tracking-wider" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#F5F5F5] text-[#1C1B1F] text-sm outline-none border-2 border-transparent focus:border-[#3D7A52] transition-all duration-200 placeholder:text-[#AAAAAA]"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#49454F] mb-1.5 uppercase tracking-wider" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#F5F5F5] text-[#1C1B1F] text-sm outline-none border-2 border-transparent focus:border-[#3D7A52] transition-all duration-200 placeholder:text-[#AAAAAA]"
              placeholder="Mín. 8 caracteres"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#49454F] mb-1.5 uppercase tracking-wider" htmlFor="institution">
              Instituição
              <span className="normal-case font-normal text-[#AAAAAA] ml-1">(opcional)</span>
            </label>
            <input
              id="institution"
              type="text"
              autoComplete="organization"
              value={institution}
              onChange={e => setInstitution(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#F5F5F5] text-[#1C1B1F] text-sm outline-none border-2 border-transparent focus:border-[#3D7A52] transition-all duration-200 placeholder:text-[#AAAAAA]"
              placeholder="Universidade ou herbário"
            />
          </div>

          {error && (
            <div className="bg-[#FFEBEE] border border-[#FFCDD2] rounded-xl p-3 flex items-start gap-2">
              <svg className="w-4 h-4 text-[#E53935] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-[#E53935] text-xs font-medium">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 mt-1 rounded-full bg-[#3D7A52] text-white text-sm font-medium shadow-[0_4px_12px_rgba(61,122,82,0.3)] hover:bg-[#2D5F3F] hover:shadow-[0_6px_16px_rgba(61,122,82,0.4)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[0_4px_12px_rgba(61,122,82,0.3)]"
          >
            {loading ? 'Criando conta…' : 'Criar conta'}
          </button>

          <p className="text-center text-xs text-[#9E9E9E] pt-1">
            Já tem uma conta?{' '}
            <Link href="/login" className="text-[#3D7A52] font-medium hover:underline">
              Entrar
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
