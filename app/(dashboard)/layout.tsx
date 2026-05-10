'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useEffect } from 'react'
import clsx from 'clsx'

const NAV_GROUPS = [
  {
    label: 'Collections',
    items: [
      {
        href: '/registry',
        label: 'Registry',
        icon: (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 2C10 2 4 5.5 4 11.5C4 14.536 6.686 17 10 17C13.314 17 16 14.536 16 11.5C16 5.5 10 2 10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 2C10 2 10 9 7 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        ),
      },
      {
        href: '/sessions',
        label: 'Sessions',
        icon: (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M7 2V5M13 2V5M3 8H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        ),
      },
    ]
  },
  {
    label: 'Taxonomy',
    items: [
      {
        href: '/species',
        label: 'Species',
        icon: (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M10 3C10 3 7 5 7 7M10 3C10 3 13 5 13 7M10 17C10 17 7 15 7 13M10 17C10 17 13 15 13 13M3 10C3 10 5 7 7 7M17 10C17 10 15 7 13 7M3 10C3 10 5 13 7 13M17 10C17 10 15 13 13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        ),
      },
    ]
  }
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [loading, user, router])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="w-8 h-8 rounded-full border-2 border-[#3D7A52] border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAFAFA]">
      <aside className="w-60 flex-shrink-0 flex flex-col bg-white border-r border-[#EEEEEE] shadow-[1px_0_8px_rgba(0,0,0,0.02)] z-10 relative">
        <div className="relative flex items-center gap-3 px-6 py-7 border-b border-[#F0F0F0] overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-[0.03] pointer-events-none">
            <svg width="120" height="120" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 4C16 4 6 10 6 20C6 25.52 10.48 30 16 30C21.52 30 26 25.52 26 20C26 10 16 4 16 4Z" fill="#3D7A52"/>
            </svg>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2D5F3F] to-[#3D7A52] flex items-center justify-center shadow-sm z-10">
            <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
              <path d="M9 2C9 2 3 5.5 3 10.5C3 13.536 5.686 16 9 16C12.314 16 15 13.536 15 10.5C15 5.5 9 2 9 2Z" fill="white" fillOpacity="0.9"/>
              <path d="M9 2C9 2 9 9 6 11" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="z-10">
            <p className="text-base font-bold text-[#1C1B1F] tracking-tight">Folium</p>
            <p className="text-xs text-[#6D4C41] italic">Field Book</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-6 overflow-y-auto">
          {NAV_GROUPS.map((group, idx) => (
            <div key={idx}>
              <h3 className="px-4 text-[10px] font-bold uppercase tracking-wider text-[#9E9E9E] mb-2">
                {group.label}
              </h3>
              <div className="space-y-1">
                {group.items.map(item => {
                  const active = pathname.startsWith(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={clsx(
                        'flex items-center gap-3 px-4 py-2.5 rounded-r-full text-sm font-medium transition-all duration-200 relative',
                        active
                          ? 'bg-[#E8F5E9] text-[#2D5F3F]'
                          : 'text-[#49454F] hover:bg-[#F5F5F5] hover:text-[#1C1B1F]',
                      )}
                    >
                      {active && (
                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#3D7A52] rounded-r-full" />
                      )}
                      <span className={active ? 'text-[#3D7A52]' : 'text-[#9E9E9E]'}>{item.icon}</span>
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-[#F0F0F0] bg-white">
          <div className="flex items-center gap-3 p-2 mb-2 rounded-[12px] hover:bg-[#F5F5F5] transition-colors cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-[#E8F5E9] flex items-center justify-center text-[#3D7A52] text-sm font-bold shadow-sm">
              {user.name?.charAt(0).toUpperCase() ?? 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#1C1B1F] truncate">{user.name}</p>
              <p className="text-xs text-[#9E9E9E] truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => logout().then(() => router.replace('/login'))}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-full text-sm font-medium text-[#49454F] hover:bg-[#FFEBEE] hover:text-[#E53935] transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <path d="M6 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-[#FAFAFA] p-6 md:p-8 lg:p-10">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
