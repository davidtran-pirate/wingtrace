import { useState, useCallback, useRef } from 'react'
import { getHistoricObservations } from '../lib/ebird'
import type { EbirdObservation } from '../types'

type DayCache = Record<string, EbirdObservation[] | 'loading' | 'error'>

export function useObservations() {
  const cache = useRef<DayCache>({})
  const [, forceUpdate] = useState(0)

  const fetchDay = useCallback(async (regionCode: string, speciesCode: string, date: string) => {
    const key = `${regionCode}|${speciesCode}|${date}`
    if (cache.current[key] !== undefined) return
    cache.current[key] = 'loading'
    forceUpdate(n => n + 1)
    try {
      const data = await getHistoricObservations(regionCode, speciesCode, date)
      cache.current[key] = data
    } catch {
      cache.current[key] = 'error'
    }
    forceUpdate(n => n + 1)
  }, [])

  const getDay = useCallback((regionCode: string, speciesCode: string, date: string) => {
    const key = `${regionCode}|${speciesCode}|${date}`
    return cache.current[key]
  }, [])

  const clearCache = useCallback(() => {
    cache.current = {}
    forceUpdate(n => n + 1)
  }, [])

  return { fetchDay, getDay, clearCache }
}
