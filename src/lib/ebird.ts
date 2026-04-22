import type { EbirdObservation, EbirdTaxon } from '../types'

const API_KEY = import.meta.env.VITE_EBIRD_API_KEY as string
const BASE = 'https://api.ebird.org/v2'

async function get<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE}${path}`)
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  }
  const res = await fetch(url.toString(), {
    headers: { 'X-eBirdApiToken': API_KEY },
  })
  if (!res.ok) throw new Error(`eBird API error: ${res.status}`)
  return res.json()
}

export async function searchSpecies(query: string): Promise<EbirdTaxon[]> {
  if (query.length < 2) return []
  return get<EbirdTaxon[]>('/ref/taxon/find', {
    q: query,
    locale: 'en',
    maxResults: '20',
  })
}

export async function getHistoricObservations(
  regionCode: string,
  speciesCode: string,
  date: string, // YYYY-MM-DD
): Promise<EbirdObservation[]> {
  const [y, m, d] = date.split('-')
  return get<EbirdObservation[]>(`/data/obs/${regionCode}/historic/${y}/${m}/${d}`, {
    speciesCode,
    includeProvisional: 'true',
    maxResults: '10000',
    rank: 'mrec',
    detail: 'simple',
  })
}

export function eocToCount(obs: EbirdObservation): number {
  return obs.howMany ?? 1
}
