import { useState, useEffect, useCallback } from 'react'
import Map from './components/Map'
import BirdSearch from './components/BirdSearch'
import StateSelect from './components/StateSelect'
import DateRange from './components/DateRange'
import AnimationControls from './components/AnimationControls'
import { useObservations } from './hooks/useObservations'
import { useAnimation } from './hooks/useAnimation'
import { getDatesInRange, getDefaultDateRange } from './lib/dates'
import type { EbirdObservation } from './types'

const PREFETCH_AHEAD = 3

export default function App() {
  const defaults = getDefaultDateRange()

  const [speciesCode, setSpeciesCode] = useState('')
  const [comName, setComName] = useState('')
  const [stateCode, setStateCode] = useState('')
  const [stateName, setStateName] = useState('')
  const [startDate, setStartDate] = useState(defaults.start)
  const [endDate, setEndDate] = useState(defaults.end)
  const [dates, setDates] = useState<string[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const { fetchDay, getDay, clearCache } = useObservations()
  const { currentIndex, isPlaying, speedIndex, setSpeedIndex, play, stop, goTo } = useAnimation(dates.length)

  const canSearch = Boolean(speciesCode && stateCode && startDate && endDate)

  function handleSearch() {
    if (!canSearch) return
    clearCache()
    setDates(getDatesInRange(startDate, endDate))
    setSidebarOpen(false)
  }

  useEffect(() => {
    if (!speciesCode || !stateCode || dates.length === 0) return
    for (let i = currentIndex; i < Math.min(currentIndex + PREFETCH_AHEAD + 1, dates.length); i++) {
      fetchDay(stateCode, speciesCode, dates[i])
    }
  }, [currentIndex, dates, speciesCode, stateCode, fetchDay])

  const currentDayData = dates[currentIndex]
    ? getDay(stateCode, speciesCode, dates[currentIndex])
    : undefined

  const observations: EbirdObservation[] = Array.isArray(currentDayData) ? currentDayData : []
  const dayLoading = currentDayData === 'loading'

  const handleBirdChange = useCallback((code: string, name: string) => {
    setSpeciesCode(code)
    setComName(name)
  }, [])

  const handleStateChange = useCallback((code: string, name: string) => {
    setStateCode(code)
    setStateName(name)
  }, [])

  const handleDateChange = useCallback((start: string, end: string) => {
    setStartDate(start)
    setEndDate(end)
  }, [])

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-white overflow-hidden">
      {/* Top bar */}
      <header className="flex items-center gap-3 px-4 py-3 bg-zinc-900 border-b border-zinc-800 shrink-0 z-10">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🦅</span>
          <span className="font-bold text-lg tracking-tight">WingTrace</span>
        </div>
        {comName && stateCode && (
          <div className="flex items-center gap-2 text-sm text-zinc-300">
            <span className="text-zinc-600">|</span>
            <span className="text-amber-400 font-medium">{comName}</span>
            <span className="text-zinc-500">in</span>
            <span>{stateName}</span>
          </div>
        )}
        <button
          onClick={() => setSidebarOpen(o => !o)}
          className="ml-auto flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition px-3 py-1.5 rounded-lg hover:bg-zinc-800"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          {sidebarOpen ? 'Close' : 'Settings'}
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-72 bg-zinc-900 border-r border-zinc-800 flex flex-col shrink-0 overflow-y-auto z-10">
            <div className="p-4 space-y-5 flex-1">
              <BirdSearch value={speciesCode} displayName={comName} onChange={handleBirdChange} />
              <StateSelect value={stateCode} onChange={handleStateChange} />
              <DateRange start={startDate} end={endDate} onChange={handleDateChange} />

              <button
                onClick={handleSearch}
                disabled={!canSearch}
                className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-semibold text-sm transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Animate Migration
              </button>

              {!canSearch && (
                <p className="text-xs text-zinc-500 text-center">
                  Select a bird, state, and date range to begin.
                </p>
              )}
            </div>

            {/* Dot size legend */}
            <div className="p-4 border-t border-zinc-800">
              <p className="text-xs text-zinc-400 uppercase tracking-wider mb-3">Dot Size = # Sightings</p>
              <div className="flex items-end gap-4">
                {[1, 10, 50, 200].map(count => {
                  const r = Math.max(5, Math.min(22, 5 + Math.log10(count + 1) * 8.5))
                  return (
                    <div key={count} className="flex flex-col items-center gap-1.5">
                      <div
                        className="rounded-full bg-amber-400/80"
                        style={{ width: r * 2, height: r * 2 }}
                      />
                      <span className="text-xs text-zinc-500">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </aside>
        )}

        {/* Map + controls */}
        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
          {dates.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 gap-3 p-8 text-center">
              <span className="text-6xl">🌎</span>
              <p className="text-lg font-medium text-zinc-500">Ready to trace a migration</p>
              <p className="text-sm text-zinc-600 max-w-xs">
                Choose a bird species, a state, and a date range — then hit <span className="text-amber-400/70">Animate Migration</span>.
              </p>
            </div>
          ) : (
            <>
              <div className="flex-1 min-h-0">
                <Map observations={observations} loading={dayLoading} />
              </div>
              <AnimationControls
                dates={dates}
                currentIndex={currentIndex}
                isPlaying={isPlaying}
                speedIndex={speedIndex}
                loading={dayLoading}
                onPlay={play}
                onStop={stop}
                onGoTo={goTo}
                onSetSpeed={setSpeedIndex}
              />
            </>
          )}
        </main>
      </div>
    </div>
  )
}
