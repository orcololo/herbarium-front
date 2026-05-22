'use client'

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api, type User } from './api'

interface AuthState {
  user: User | null
  loading: boolean
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, institution?: string) => Promise<void>
  refreshUser: () => Promise<User>
  updateProfile: (data: { name?: string; email?: string; institution?: string; avatar?: string }) => Promise<User>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, loading: true })

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      api.auth.revoke().catch(() => {})
      setState({ user: null, loading: false })
      return
    }
    api.auth.me()
      .then(user => {
        setState({ user, loading: false })
      })
      .catch(() => {
        localStorage.removeItem('access_token')
        api.auth.revoke().catch(() => {})
        setState({ user: null, loading: false })
      })
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { accessToken, user } = await api.auth.login(email, password)
    localStorage.setItem('access_token', accessToken)
    setState({ user, loading: false })
  }, [])

  const register = useCallback(async (name: string, email: string, password: string, institution?: string) => {
    const { accessToken, user } = await api.auth.register(name, email, password, institution)
    localStorage.setItem('access_token', accessToken)
    setState({ user, loading: false })
  }, [])

  const refreshUser = useCallback(async () => {
    const user = await api.auth.me()
    setState({ user, loading: false })
    return user
  }, [])

  const updateProfile = useCallback(async (data: { name?: string; email?: string; institution?: string; avatar?: string }) => {
    const user = await api.users.updateProfile(data)
    setState({ user, loading: false })
    return user
  }, [])

  const logout = useCallback(async () => {
    await api.auth.logout().catch(() => {})
    localStorage.removeItem('access_token')
    await api.auth.revoke().catch(() => {})
    setState({ user: null, loading: false })
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, register, refreshUser, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
