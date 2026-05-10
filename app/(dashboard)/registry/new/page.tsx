'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api, type CreateRegistryPayload } from '@/lib/api'
import clsx from 'clsx'

type FormData = {
  registryIdentifier: string
  scientificName: string
  commonName: string
  family: string
  genus: string
  dateCollected: string
  habitat: string
  locality: string
  state: string
  country: string
  municipality: string
  latitude: string
  longitude: string
  altitude: string
  substrate: string
  phenologicalState: string
  collectionMethod: string
  weatherCondition: string
  weatherNotes: string
  moonPhase: string
  windSpeed: string
  collectorNumber: string
  numberOfIndividuals: string
  associatedTaxa: string
  vegetationType: string
  topography: string
  determinationQualifier: string
  notes: string
}

export default function NewSpecimenPage() {
  const router = useRouter()
  const [form, setForm] = useState<FormData>({
    registryIdentifier: '',
    scientificName: '',
    commonName: '',
    family: '',
    genus: '',
    dateCollected: '',
    habitat: '',
    locality: '',
    state: '',
    country: '',
    municipality: '',
    latitude: '',
    longitude: '',
    altitude: '',
    substrate: '',
    phenologicalState: '',
    collectionMethod: '',
    weatherCondition: '',
    weatherNotes: '',
    moonPhase: '',
    windSpeed: '',
    collectorNumber: '',
    numberOfIndividuals: '',
    associatedTaxa: '',
    vegetationType: '',
    topography: '',
    determinationQualifier: '',
    notes: '',
  })
  const [errors, setErrors] = useState<{ registryIdentifier?: string; scientificName?: string }>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const newErrors: { registryIdentifier?: string; scientificName?: string } = {}
    if (!form.registryIdentifier.trim()) newErrors.registryIdentifier = 'Registry identifier is required'
    if (!form.scientificName.trim()) newErrors.scientificName = 'Scientific name is required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setSubmitting(true)
    setSubmitError(null)
    try {
      const payload: CreateRegistryPayload = {
        uuid: crypto.randomUUID(),
        registryIdentifier: form.registryIdentifier,
        scientificName: form.scientificName,
        ...(form.commonName && { commonName: form.commonName }),
        ...(form.family && { family: form.family }),
        ...(form.genus && { genus: form.genus }),
        ...(form.dateCollected && { dateCollected: form.dateCollected }),
        ...(form.habitat && { habitat: form.habitat }),
        ...(form.locality && { locality: form.locality }),
        ...(form.state && { state: form.state }),
        ...(form.country && { country: form.country }),
        ...(form.municipality && { municipality: form.municipality }),
        ...(form.latitude && { latitude: parseFloat(form.latitude) }),
        ...(form.longitude && { longitude: parseFloat(form.longitude) }),
        ...(form.altitude && { altitude: parseFloat(form.altitude) }),
        ...(form.substrate && { substrate: form.substrate }),
        ...(form.phenologicalState && { phenologicalState: form.phenologicalState }),
        ...(form.collectionMethod && { collectionMethod: form.collectionMethod }),
        ...(form.weatherCondition && { weatherCondition: form.weatherCondition }),
        ...(form.weatherNotes && { weatherNotes: form.weatherNotes }),
        ...(form.moonPhase && { moonPhase: form.moonPhase }),
        ...(form.windSpeed && { windSpeed: parseFloat(form.windSpeed) }),
        ...(form.collectorNumber && { collectorNumber: form.collectorNumber }),
        ...(form.numberOfIndividuals && { numberOfIndividuals: parseInt(form.numberOfIndividuals, 10) }),
        ...(form.associatedTaxa && { associatedTaxa: form.associatedTaxa }),
        ...(form.vegetationType && { vegetationType: form.vegetationType }),
        ...(form.topography && { topography: form.topography }),
        ...(form.determinationQualifier && { determinationQualifier: form.determinationQualifier }),
        ...(form.notes && { notes: form.notes }),
      }
      const created = await api.registry.create(payload)
      router.push(`/registry/${created.id}`)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create specimen.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="animate-fade-in max-w-5xl mx-auto pb-12">
      <header className="mb-8">
        <Link href="/registry" className="inline-flex items-center gap-2 text-sm font-medium text-[#6D4C41] hover:text-[#3D7A52] transition-colors mb-4">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Back
        </Link>
        <h1 className="text-2xl font-semibold text-[#1C1B1F] tracking-tight">New Specimen</h1>
        <p className="text-sm text-[#6D4C41] mt-1">Record a new botanical collection</p>
      </header>

      {submitError && (
        <div className="flex items-center gap-3 bg-[#FFEBEE] text-[#C62828] px-4 py-3 rounded-[12px] mb-6 text-sm border border-[#FFCDD2]">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 5V8M8 11H8.01M2 8C2 4.686 4.686 2 8 2s6 2.686 6 6-2.686 6-6 6-6-2.686-6-6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6">
            <div className="flex items-center gap-2 mb-6">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#3D7A52]">
                <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h2 className="text-[11px] font-bold text-[#3D7A52] uppercase tracking-widest">Identification</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1.5 block">Registry Identifier *</label>
                <input
                  type="text"
                  name="registryIdentifier"
                  value={form.registryIdentifier}
                  onChange={handleChange}
                  className={clsx(
                    "w-full px-4 py-2.5 rounded-[12px] text-sm text-[#1C1B1F] border-2 outline-none transition-colors",
                    errors.registryIdentifier ? "border-[#E53935] bg-[#FFF5F5]" : "bg-[#F5F5F5] border-transparent focus:border-[#3D7A52]"
                  )}
                />
                {errors.registryIdentifier && <p className="text-[#E53935] text-xs mt-1">{errors.registryIdentifier}</p>}
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1.5 block">Scientific Name *</label>
                <input
                  type="text"
                  name="scientificName"
                  value={form.scientificName}
                  onChange={handleChange}
                  className={clsx(
                    "w-full px-4 py-2.5 rounded-[12px] text-sm text-[#1C1B1F] border-2 outline-none transition-colors",
                    errors.scientificName ? "border-[#E53935] bg-[#FFF5F5]" : "bg-[#F5F5F5] border-transparent focus:border-[#3D7A52]"
                  )}
                />
                {errors.scientificName && <p className="text-[#E53935] text-xs mt-1">{errors.scientificName}</p>}
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1.5 block">Common Name</label>
                <input
                  type="text"
                  name="commonName"
                  value={form.commonName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-[12px] bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1.5 block">Family</label>
                  <input
                    type="text"
                    name="family"
                    value={form.family}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-[12px] bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1.5 block">Genus</label>
                  <input
                    type="text"
                    name="genus"
                    value={form.genus}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-[12px] bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6">
            <div className="flex items-center gap-2 mb-6">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#3D7A52]">
                <path d="M12 21C12 21 5 14.5 5 9C5 5.13401 8.13401 2 12 2C15.866 2 19 5.13401 19 9C19 14.5 12 21 12 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="9" r="3" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <h2 className="text-[11px] font-bold text-[#3D7A52] uppercase tracking-widest">Collection Info</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1.5 block">Date Collected</label>
                <input
                  type="date"
                  name="dateCollected"
                  value={form.dateCollected}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-[12px] bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1.5 block">Habitat</label>
                <input
                  type="text"
                  name="habitat"
                  value={form.habitat}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-[12px] bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1.5 block">Latitude</label>
                  <input type="number" step="any" name="latitude" value={form.latitude} onChange={handleChange} className="w-full px-4 py-2.5 rounded-[12px] bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1.5 block">Longitude</label>
                  <input type="number" step="any" name="longitude" value={form.longitude} onChange={handleChange} className="w-full px-4 py-2.5 rounded-[12px] bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1.5 block">Altitude (m)</label>
                  <input type="number" step="any" name="altitude" value={form.altitude} onChange={handleChange} className="w-full px-4 py-2.5 rounded-[12px] bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1.5 block">Locality</label>
                  <input type="text" name="locality" value={form.locality} onChange={handleChange} className="w-full px-4 py-2.5 rounded-[12px] bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1.5 block">Municipality</label>
                  <input type="text" name="municipality" value={form.municipality} onChange={handleChange} className="w-full px-4 py-2.5 rounded-[12px] bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1.5 block">State</label>
                  <input type="text" name="state" value={form.state} onChange={handleChange} className="w-full px-4 py-2.5 rounded-[12px] bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1.5 block">Country</label>
                  <input type="text" name="country" value={form.country} onChange={handleChange} className="w-full px-4 py-2.5 rounded-[12px] bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1.5 block">Substrate</label>
                <input type="text" name="substrate" value={form.substrate} onChange={handleChange} className="w-full px-4 py-2.5 rounded-[12px] bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#3D7A52]">
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h2 className="text-[11px] font-bold text-[#3D7A52] uppercase tracking-widest">Field Conditions &amp; Observation</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1.5 block">Phenological State</label>
                <input type="text" name="phenologicalState" value={form.phenologicalState} onChange={handleChange} className="w-full px-4 py-2.5 rounded-[12px] bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1.5 block">Collection Method</label>
                <input type="text" name="collectionMethod" value={form.collectionMethod} onChange={handleChange} className="w-full px-4 py-2.5 rounded-[12px] bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1.5 block">Collector Number</label>
                <input type="text" name="collectorNumber" value={form.collectorNumber} onChange={handleChange} className="w-full px-4 py-2.5 rounded-[12px] bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1.5 block">No. of Individuals</label>
                <input type="number" name="numberOfIndividuals" value={form.numberOfIndividuals} onChange={handleChange} className="w-full px-4 py-2.5 rounded-[12px] bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1.5 block">Weather Condition</label>
                <input type="text" name="weatherCondition" value={form.weatherCondition} onChange={handleChange} placeholder="sunny, cloudy, rainy…" className="w-full px-4 py-2.5 rounded-[12px] bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1.5 block">Weather Notes</label>
                <input type="text" name="weatherNotes" value={form.weatherNotes} onChange={handleChange} className="w-full px-4 py-2.5 rounded-[12px] bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1.5 block">Moon Phase</label>
                <input type="text" name="moonPhase" value={form.moonPhase} onChange={handleChange} className="w-full px-4 py-2.5 rounded-[12px] bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1.5 block">Wind Speed (km/h)</label>
                <input type="number" step="any" name="windSpeed" value={form.windSpeed} onChange={handleChange} className="w-full px-4 py-2.5 rounded-[12px] bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1.5 block">Associated Taxa</label>
                <input type="text" name="associatedTaxa" value={form.associatedTaxa} onChange={handleChange} className="w-full px-4 py-2.5 rounded-[12px] bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1.5 block">Vegetation Type</label>
                <input type="text" name="vegetationType" value={form.vegetationType} onChange={handleChange} placeholder="Cerrado, Mata Atlântica…" className="w-full px-4 py-2.5 rounded-[12px] bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1.5 block">Topography</label>
                <input type="text" name="topography" value={form.topography} onChange={handleChange} placeholder="slope, valley, hilltop…" className="w-full px-4 py-2.5 rounded-[12px] bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1.5 block">Det. Qualifier</label>
                <input type="text" name="determinationQualifier" value={form.determinationQualifier} onChange={handleChange} placeholder='cf., aff., ?' className="w-full px-4 py-2.5 rounded-[12px] bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#3D7A52]">
                <path d="M4 6H20M4 12H20M4 18H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h2 className="text-[11px] font-bold text-[#3D7A52] uppercase tracking-widest">Notes</h2>
            </div>
            <div>
              <textarea
                name="notes"
                rows={5}
                placeholder="Field observations, identifiers, voucher references..."
                value={form.notes}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-[12px] bg-[#F5F5F5] text-sm text-[#1C1B1F] border-2 border-transparent focus:border-[#3D7A52] outline-none transition-colors resize-none"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 pt-4">
          <Link
            href="/registry"
            className="px-6 py-3 rounded-full bg-white border border-[#EEEEEE] text-[#49454F] text-sm font-medium hover:bg-[#F5F5F5] transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 rounded-full bg-[#3D7A52] text-white text-sm font-medium shadow-[0_2px_8px_rgba(61,122,82,0.3)] hover:bg-[#2D5F3F] transition-colors disabled:opacity-60"
          >
            {submitting ? 'Saving...' : 'Save Specimen'}
          </button>
        </div>
      </form>
    </div>
  )
}
