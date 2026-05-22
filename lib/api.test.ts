import { afterEach, describe, expect, it, vi } from 'vitest'
import { api } from './api'

function mockJsonResponse(data: unknown = {}) {
  const fetchMock = vi.fn(async () => new Response(
    JSON.stringify({ success: true, data }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  ))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function lastFetch(fetchMock: ReturnType<typeof mockJsonResponse>) {
  const [url, init] = fetchMock.mock.calls.at(-1) ?? []
  return {
    url: new URL(String(url), 'http://localhost'),
    init: init as RequestInit,
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('api client contracts', () => {
  it('creates users through the admin users endpoint', async () => {
    const fetchMock = mockJsonResponse({ id: 'user-1' })

    await api.users.create({
      name: 'Ana Ribeiro',
      email: 'ana@example.com',
      password: 'strongPassword123',
      role: 'researcher',
      institution: 'Herbário Central',
    })

    const { url, init } = lastFetch(fetchMock)
    expect(url.pathname).toBe('/api/v1/users')
    expect(init.method).toBe('POST')
    expect(JSON.parse(String(init.body))).toEqual({
      name: 'Ana Ribeiro',
      email: 'ana@example.com',
      password: 'strongPassword123',
      role: 'researcher',
      institution: 'Herbário Central',
    })
  })

  it('updates the current profile without using admin-only user routes', async () => {
    const fetchMock = mockJsonResponse({ id: 'current-user' })

    await api.users.updateProfile({
      name: 'Ana Ribeiro',
      email: 'ana@example.com',
      institution: 'Herbário Central',
      avatar: 'https://example.com/avatar.jpg',
    })

    const { url, init } = lastFetch(fetchMock)
    expect(url.pathname).toBe('/api/v1/users/profile')
    expect(init.method).toBe('PATCH')
  })

  it('passes search and role filters to the users list endpoint', async () => {
    const fetchMock = mockJsonResponse({ data: [], total: 0, page: 2, limit: 5 })

    await api.users.list({ page: 2, limit: 5, search: 'ana', role: 'researcher' })

    const { url } = lastFetch(fetchMock)
    expect(url.pathname).toBe('/api/v1/users')
    expect(url.searchParams.get('page')).toBe('2')
    expect(url.searchParams.get('limit')).toBe('5')
    expect(url.searchParams.get('search')).toBe('ana')
    expect(url.searchParams.get('role')).toBe('researcher')
  })

  it('deletes species through the species endpoint', async () => {
    const fetchMock = mockJsonResponse(undefined)

    await api.species.delete('species-1')

    const { url, init } = lastFetch(fetchMock)
    expect(url.pathname).toBe('/api/v1/species/species-1')
    expect(init.method).toBe('DELETE')
  })

  it('searches taxa through the POWO proxy endpoint', async () => {
    const fetchMock = mockJsonResponse([])

    await api.taxa.search({ q: 'Mimosa', limit: 12 })

    const { url } = lastFetch(fetchMock)
    expect(url.pathname).toBe('/api/v1/taxa/search')
    expect(url.searchParams.get('q')).toBe('Mimosa')
    expect(url.searchParams.get('limit')).toBe('12')
  })

  it('pulls sync changes with query params', async () => {
    const fetchMock = mockJsonResponse({ registries: [], sessions: [], syncedAt: '2026-05-22T00:00:00.000Z', hasMore: false })

    await api.sync.pull({ since: '2026-05-01T00:00:00.000Z', limit: 25 })

    const { url, init } = lastFetch(fetchMock)
    expect(url.pathname).toBe('/api/v1/sync/pull')
    expect(url.searchParams.get('since')).toBe('2026-05-01T00:00:00.000Z')
    expect(url.searchParams.get('limit')).toBe('25')
    expect(init.method).toBeUndefined()
  })

  it('pushes sync changes to the sync endpoint', async () => {
    const fetchMock = mockJsonResponse({ registries: [], sessions: [], syncedAt: '2026-05-22T00:00:00.000Z' })

    await api.sync.push({ deviceId: 'web-admin', registries: [], sessions: [] })

    const { url, init } = lastFetch(fetchMock)
    expect(url.pathname).toBe('/api/v1/sync/push')
    expect(init.method).toBe('POST')
    expect(JSON.parse(String(init.body))).toEqual({ deviceId: 'web-admin', registries: [], sessions: [] })
  })

  it('uploads audio as multipart form data', async () => {
    const fetchMock = mockJsonResponse({ key: 'audio/user/file.webm', url: 'https://example.com/file.webm' })
    const audio = new File(['audio-bytes'], 'note.webm', { type: 'audio/webm' })

    await api.upload.audio(audio)

    const { url, init } = lastFetch(fetchMock)
    expect(url.pathname).toBe('/api/v1/upload/audio')
    expect(init.method).toBe('POST')
    expect(init.body).toBeInstanceOf(FormData)
  })
})
