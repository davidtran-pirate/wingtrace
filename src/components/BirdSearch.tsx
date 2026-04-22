import { useState, useEffect, useRef } from 'react'
import { searchSpecies } from '../lib/ebird'
import type { EbirdTaxon } from '../types'

interface BirdSearchProps {
  value: string
  displayName: string
  onChange: (code: string, name: string) => void
}

export default function BirdSearch({ value, displayName, onChange }: BirdSearchProps) {
  const [query, setQuery] = useState(displayName)
  const [results, setResults] = useState<EbirdTaxon[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setQuery(displayName)
  }, [displayName])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.length < 2) {
      setResults([])
      return
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await searchSpecies(query)
        setResults(data.slice(0, 10))
        setOpen(true)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)
  }, [query])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function select(taxon: EbirdTaxon) {
    onChange(taxon.speciesCode, taxon.comName)
    setQuery(taxon.comName)
    setOpen(false)
    setResults([])
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-xs text-zinc-400 mb-1 uppercase tracking-wider">Bird Species</label>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => query.length >= 2 && setOpen(true)}
          placeholder="Search e.g. American Woodcock"
          className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        )}
      </div>
      {value && (
        <p className="text-xs text-amber-400/70 mt-1 truncate">Selected: {displayName}</p>
      )}
      {open && results.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl max-h-52 overflow-y-auto">
          {results.map(t => (
            <li
              key={t.speciesCode}
              onMouseDown={() => select(t)}
              className="px-3 py-2 cursor-pointer hover:bg-zinc-700 text-sm"
            >
              <span className="text-white">{t.comName}</span>
              <span className="text-zinc-400 text-xs ml-2 italic">{t.sciName}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
