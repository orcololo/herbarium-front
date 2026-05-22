// All requests go through the Next.js rewrite proxy (/api/v1 → BACKEND_URL).
// BACKEND_URL is a server-side-only env var configured in next.config.ts.
// Do NOT set NEXT_PUBLIC_API_URL — direct cross-origin calls break httpOnly cookies.
const BASE_URL = '/api/v1'

export type PlantCategory =
  | 'trees'
  | 'shrubs'
  | 'herbs'
  | 'ferns'
  | 'grasses'
  | 'vines'
  | 'cacti'
  | 'aquatic'

export interface AuthTokens {
  accessToken: string
}

export type UserRole = 'admin' | 'researcher' | 'collector'

export interface User {
  id: string
  email: string
  name: string
  role?: UserRole
  avatar?: string
  institution?: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface Species {
  id: string
  scientificName: string
  commonName?: string
  family?: string
  genus?: string
  species?: string
  category?: PlantCategory
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface StemMorphology {
  type?: string
  color?: string
  size?: string
  circumference?: string
  sap?: string
}

export interface LeafMorphology {
  bainha?: string
  peciolo?: string
  lamina?: string
}

export interface FlowerMorphology {
  inflorescence?: string
  color?: string
  size?: string
}

export interface FruitMorphology {
  color?: string
  format?: string
  size?: string
}

export interface SeedMorphology {
  format?: string
  color?: string
  size?: string
}

export interface Morphology {
  root?: string
  stem?: StemMorphology
  leaf?: LeafMorphology
  flower?: FlowerMorphology
  fruit?: FruitMorphology
  seed?: SeedMorphology
}

export interface Measurement {
  label: string
  value: number
  unit?: string
}

export interface ImageRef {
  key: string
  url: string
  thumbnailKey: string
  thumbnailUrl: string
}

export interface UploadResult extends ImageRef {
  originalUrl?: string
}

interface BackendUploadResult {
  key: string
  thumbnailKey: string
  originalUrl: string
  thumbnailUrl: string
}

export interface PhotoMetadata {
  exifDataJson?: string
  dateTaken?: string
  latitude?: number
  longitude?: number
  fileSize?: number
}

export interface Determination {
  determinedBy: string
  determinedAt?: string
  scientificName: string
  family?: string
  notes?: string
  basis?: string
}

export interface GpsPoint {
  latitude?: number
  longitude?: number
  altitude?: number
  timestamp?: string
}

export interface SyncMetadata {
  deviceId?: string
  lastSyncedAt?: string
  localModifiedAt?: string
  conflictData?: string
  syncStatus: 'pending' | 'synced' | 'conflict' | 'error'
  lastPushedHash?: string
  syncVersion: number
}

export interface Registry {
  id: string
  uuid: string
  registryIdentifier: string
  species: Species | string
  collector: User | string
  sessionId?: string
  latitude?: number
  longitude?: number
  dateCollected?: string
  habitat?: string
  locality?: string
  state?: string
  country?: string
  municipality?: string
  scientificAuthor?: string
  taxonStatus?: string
  morphology?: Morphology
  measurements: Measurement[]
  determinations: Determination[]
  images: ImageRef[]
  audioNotes: string[]
  audioTranscripts: string[]
  photoMetadata: PhotoMetadata[]
  notes?: string
  contributorName?: string
  isDraft: boolean
  altitude?: number
  temperature?: number
  humidity?: number
  weatherCondition?: string
  weatherNotes?: string
  moonPhase?: string
  windSpeed?: number
  collectorNumber?: string
  numberOfIndividuals?: number
  substrate?: string
  associatedTaxa?: string
  vegetationType?: string
  topography?: string
  determinationQualifier?: string
  phenologicalState?: string
  phenologyFournier?: string
  collectionMethod?: string
  duplicateOf?: string
  duplicateUuids: string[]
  iNaturalistId?: string
  iNaturalistSyncedAt?: string
  caule?: string
  folhaDescricao?: string
  florDescricao?: string
  frutoDescricao?: string
  sementeDescricao?: string
  photoPaths: string[]
  audioNotePaths: string[]
  syncMetadata?: SyncMetadata
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CollectionSession {
  id: string
  uuid: string
  tripName: string
  startDate: string
  endDate?: string
  location?: string
  teamMembers: string[]
  shareCode?: string
  sharedWith: string[]
  track: GpsPoint[]
  notes?: string
  isArchived: boolean
  isActive: boolean
  owner: User | string
  syncMetadata?: SyncMetadata
  createdAt: string
  updatedAt: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

interface BackendPaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages?: number
  }
}

export interface CreateRegistryPayload {
  uuid: string
  registryIdentifier: string
  scientificName: string
  commonName?: string
  family?: string
  genus?: string
  speciesEpithet?: string
  scientificAuthor?: string
  taxonStatus?: string
  category?: PlantCategory
  sessionId?: string
  latitude?: number
  longitude?: number
  altitude?: number
  dateCollected?: string
  habitat?: string
  locality?: string
  state?: string
  country?: string
  municipality?: string
  morphology?: Morphology
  measurements?: Measurement[]
  determinations?: Determination[]
  notes?: string
  audioTranscripts?: string[]
  photoMetadata?: PhotoMetadata[]
  contributorName?: string
  isDraft?: boolean
  deviceId?: string
  temperature?: number
  humidity?: number
  weatherCondition?: string
  weatherNotes?: string
  moonPhase?: string
  windSpeed?: number
  collectorNumber?: string
  numberOfIndividuals?: number
  substrate?: string
  associatedTaxa?: string
  vegetationType?: string
  topography?: string
  determinationQualifier?: string
  phenologicalState?: string
  phenologyFournier?: string
  collectionMethod?: string
  duplicateOf?: string
  duplicateUuids?: string[]
  iNaturalistId?: string
  iNaturalistSyncedAt?: string
  caule?: string
  folhaDescricao?: string
  florDescricao?: string
  frutoDescricao?: string
  sementeDescricao?: string
  photoPaths?: string[]
  audioNotePaths?: string[]
}

export interface CreateSessionPayload {
  uuid: string
  tripName: string
  startDate: string
  endDate?: string
  location?: string
  teamMembers?: string[]
  shareCode?: string
  sharedWith?: string[]
  track?: GpsPoint[]
  notes?: string
  isArchived?: boolean
  deviceId?: string
}

export interface CreateSpeciesPayload {
  scientificName: string
  commonName?: string
  family?: string
  genus?: string
  species?: string
  category?: PlantCategory
  description?: string
}

export interface CreateUserPayload {
  name: string
  email: string
  password: string
  role?: UserRole
  institution?: string
}

export interface UpdateProfilePayload {
  name?: string
  email?: string
  institution?: string
  avatar?: string
}

export interface TaxonSuggestion {
  id: string
  name: string
  author?: string
  family?: string
  status: 'accepted' | 'synonym'
  rank?: string
}

export interface SyncItemResult {
  uuid: string
  status: 'created' | 'updated' | 'conflict' | 'error' | 'forbidden'
  serverId?: string
  syncVersion?: number
  message?: string
  serverData?: Record<string, unknown>
}

export interface SyncPushPayload {
  deviceId: string
  registries?: Array<Partial<CreateRegistryPayload> & {
    uuid: string
    syncVersion?: number
    localModifiedAt?: string
    images?: ImageRef[]
  }>
  sessions?: Array<Partial<CreateSessionPayload> & {
    uuid: string
    syncVersion?: number
    localModifiedAt?: string
  }>
}

export interface SyncPushResponse {
  registries: SyncItemResult[]
  sessions: SyncItemResult[]
  syncedAt: string
}

export interface SyncPullResponse {
  registries: Registry[]
  sessions: CollectionSession[]
  syncedAt: string
  hasMore: boolean
  lastUpdatedAt?: string
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('access_token')
}

function storeTokens(tokens: AuthTokens): void {
  localStorage.setItem('access_token', tokens.accessToken)
}

function clearTokens(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('access_token')
  fetch(`${BASE_URL}/auth/revoke`, { method: 'POST', credentials: 'include' }).catch(() => {})
}

let refreshPromise: Promise<AuthTokens> | null = null

async function doRefresh(): Promise<AuthTokens> {
  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({}),
  })

  if (!res.ok) {
    clearTokens()
    throw new ApiError(401, 'Session expired')
  }

  const envelope = await res.json() as { success: boolean; data: AuthTokens }
  storeTokens(envelope.data)
  return envelope.data
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  _isRetry = false,
): Promise<T> {
  const token = getAccessToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers, credentials: 'include' })

  const isAuthEndpoint = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/google', '/auth/logout', '/auth/revoke'].some(p => path.startsWith(p))

  if (res.status === 401 && !_isRetry && !isAuthEndpoint) {
    try {
      if (!refreshPromise) {
        refreshPromise = doRefresh().finally(() => { refreshPromise = null })
      }
      await refreshPromise
    } catch {
      clearTokens()
      throw new ApiError(401, 'Session expired — please sign in again')
    }
    return request<T>(path, options, true)
  }

  if (!res.ok) {
    let message = res.statusText
    try {
      const body = await res.json() as { message?: string }
      message = body.message ?? message
    } catch { /* ignore */ }
    throw new ApiError(res.status, message)
  }

  if (res.status === 204) return undefined as T

  const envelope = await res.json() as { success: boolean; data: T } | T
  if (
    envelope !== null &&
    typeof envelope === 'object' &&
    'success' in (envelope as object) &&
    'data' in (envelope as object)
  ) {
    return (envelope as { success: boolean; data: T }).data
  }
  return envelope as T
}

function normalizePaginated<T>(response: PaginatedResponse<T> | BackendPaginatedResponse<T>): PaginatedResponse<T> {
  if ('meta' in response) {
    return {
      data: response.data,
      total: response.meta.total,
      page: response.meta.page,
      limit: response.meta.limit,
    }
  }
  return response
}

function normalizeUpload(result: UploadResult | BackendUploadResult): UploadResult {
  return {
    key: result.key,
    url: 'url' in result ? result.url : result.originalUrl,
    thumbnailKey: result.thumbnailKey,
    thumbnailUrl: result.thumbnailUrl,
    originalUrl: 'originalUrl' in result ? result.originalUrl : result.url,
  }
}

async function uploadFile(path: string, file: File): Promise<UploadResult> {
  const token = getAccessToken()
  const formData = new FormData()
  formData.append('file', file)
  const headers: Record<string, string> = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: formData,
  })
  if (!res.ok) {
    let message = res.statusText
    try {
      const body = await res.json() as { message?: string }
      message = body.message ?? message
    } catch { /* ignore */ }
    throw new ApiError(res.status, message)
  }
  const envelope = await res.json() as { success?: boolean; data?: UploadResult | BackendUploadResult } | UploadResult | BackendUploadResult
  const data = 'success' in envelope && envelope.success ? envelope.data : envelope
  return normalizeUpload(data as UploadResult | BackendUploadResult)
}

export const api = {
  auth: {
    login: async (email: string, password: string): Promise<AuthTokens & { user: User }> => {
      const result = await request<AuthTokens & { user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      storeTokens(result)
      return result
    },

    register: async (name: string, email: string, password: string, institution?: string): Promise<AuthTokens & { user: User }> => {
      const result = await request<AuthTokens & { user: User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, institution }),
      })
      storeTokens(result)
      return result
    },

    refresh: () =>
      request<AuthTokens>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({}),
      }),

    logout: () => request<void>('/auth/logout', { method: 'POST' }),

    revoke: () => request<void>('/auth/revoke', { method: 'POST' }),

    me: () => request<User>('/users/profile'),
  },

  registry: {
    list: (params?: {
      page?: number
      limit?: number
      sessionId?: string
      search?: string
      collector?: string
      isDraft?: boolean
      sortBy?: string
      sortOrder?: 'asc' | 'desc'
    }) => {
      const q = new URLSearchParams()
      if (params?.page)      q.set('page',      String(params.page))
      if (params?.limit)     q.set('limit',     String(params.limit))
      if (params?.sessionId) q.set('sessionId', params.sessionId)
      if (params?.search)    q.set('search',    params.search)
      if (params?.collector) q.set('collector', params.collector)
      if (params?.isDraft !== undefined) q.set('isDraft', String(params.isDraft))
      if (params?.sortBy)    q.set('sortBy',    params.sortBy)
      if (params?.sortOrder) q.set('sortOrder', params.sortOrder)
      return request<PaginatedResponse<Registry> | BackendPaginatedResponse<Registry>>(`/registries?${q.toString()}`)
        .then(normalizePaginated)
    },
    get: (id: string) => request<Registry>(`/registries/${id}`),
    create: (data: CreateRegistryPayload) =>
      request<Registry>('/registries', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Registry>) =>
      request<Registry>(`/registries/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: string) => request<void>(`/registries/${id}`, { method: 'DELETE' }),
  },

  sessions: {
    list: (params?: { page?: number; limit?: number; search?: string; isArchived?: boolean }) => {
      const q = new URLSearchParams()
      if (params?.page)  q.set('page',  String(params.page))
      if (params?.limit) q.set('limit', String(params.limit))
      if (params?.search) q.set('search', params.search)
      if (params?.isArchived !== undefined) q.set('isArchived', String(params.isArchived))
      return request<PaginatedResponse<CollectionSession> | BackendPaginatedResponse<CollectionSession>>(`/sessions?${q.toString()}`)
        .then(normalizePaginated)
    },
    get: (id: string) => request<CollectionSession>(`/sessions/${id}`),
    create: (data: CreateSessionPayload) =>
      request<CollectionSession>('/sessions', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<CollectionSession>) =>
      request<CollectionSession>(`/sessions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: string) => request<void>(`/sessions/${id}`, { method: 'DELETE' }),
  },

  species: {
    list: (params?: { page?: number; limit?: number; search?: string }) => {
      const q = new URLSearchParams()
      if (params?.page)   q.set('page',   String(params.page))
      if (params?.limit)  q.set('limit',  String(params.limit))
      if (params?.search) q.set('search', params.search)
      return request<PaginatedResponse<Species> | BackendPaginatedResponse<Species>>(`/species?${q.toString()}`)
        .then(normalizePaginated)
    },
    get: (id: string) => request<Species>(`/species/${id}`),
    create: (data: CreateSpeciesPayload) =>
      request<Species>('/species', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Species>) =>
      request<Species>(`/species/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: string) => request<void>(`/species/${id}`, { method: 'DELETE' }),
  },

  users: {
    list: (params?: { page?: number; limit?: number; search?: string; role?: UserRole }) => {
      const q = new URLSearchParams()
      if (params?.page)  q.set('page',  String(params.page))
      if (params?.limit) q.set('limit', String(params.limit))
      if (params?.search) q.set('search', params.search)
      if (params?.role) q.set('role', params.role)
      return request<PaginatedResponse<User> | BackendPaginatedResponse<User>>(`/users?${q.toString()}`)
        .then(normalizePaginated)
    },
    create: (data: CreateUserPayload) =>
      request<User>('/users', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    get: (id: string) => request<User>(`/users/${id}`),
    update: (id: string, data: Partial<User>) =>
      request<User>(`/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    updateProfile: (data: UpdateProfilePayload) =>
      request<User>('/users/profile', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: string) => request<void>(`/users/${id}`, { method: 'DELETE' }),
  },

  taxa: {
    search: (params: { q: string; limit?: number }) => {
      const q = new URLSearchParams()
      q.set('q', params.q)
      if (params.limit) q.set('limit', String(params.limit))
      return request<TaxonSuggestion[]>(`/taxa/search?${q.toString()}`)
    },
  },

  sync: {
    pull: (params?: { since?: string; limit?: number }) => {
      const q = new URLSearchParams()
      if (params?.since) q.set('since', params.since)
      if (params?.limit) q.set('limit', String(params.limit))
      const suffix = q.toString() ? `?${q.toString()}` : ''
      return request<SyncPullResponse>(`/sync/pull${suffix}`)
    },
    push: (data: SyncPushPayload) =>
      request<SyncPushResponse>('/sync/push', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  upload: {
    image: (file: File): Promise<UploadResult> => uploadFile('/upload/image', file),
    audio: (file: File): Promise<UploadResult> => uploadFile('/upload/audio', file),
  },
}
