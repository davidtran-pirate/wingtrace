import { SPEED_OPTIONS } from '../hooks/useAnimation'
import { formatDisplayDate } from '../lib/dates'

interface AnimationControlsProps {
  dates: string[]
  currentIndex: number
  isPlaying: boolean
  speedIndex: number
  loading: boolean
  onPlay: () => void
  onStop: () => void
  onGoTo: (i: number) => void
  onSetSpeed: (i: number) => void
}

export default function AnimationControls({
  dates,
  currentIndex,
  isPlaying,
  speedIndex,
  loading,
  onPlay,
  onStop,
  onGoTo,
  onSetSpeed,
}: AnimationControlsProps) {
  const total = dates.length
  const currentDate = dates[currentIndex]

  if (total === 0) return null

  return (
    <div className="bg-zinc-900/95 backdrop-blur border-t border-zinc-700 px-4 py-3 space-y-3">
      {/* Date display */}
      <div className="flex items-center justify-between">
        <span className="text-amber-400 font-semibold text-sm">
          {currentDate ? formatDisplayDate(currentDate) : '—'}
        </span>
        <span className="text-zinc-400 text-xs">
          Day {currentIndex + 1} / {total}
        </span>
      </div>

      {/* Scrubber */}
      <input
        type="range"
        min={0}
        max={total - 1}
        value={currentIndex}
        onChange={e => onGoTo(Number(e.target.value))}
        className="w-full h-1.5 accent-amber-400 cursor-pointer"
      />

      {/* Controls row */}
      <div className="flex items-center gap-3">
        {/* Play / Pause */}
        <button
          onClick={isPlaying ? onStop : onPlay}
          disabled={loading}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-400 hover:bg-amber-300 active:scale-95 transition disabled:opacity-40 shrink-0"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Step back */}
        <button
          onClick={() => onGoTo(currentIndex - 1)}
          disabled={currentIndex === 0}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-700 hover:bg-zinc-600 active:scale-95 transition disabled:opacity-30"
          aria-label="Previous day"
        >
          <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z" />
          </svg>
        </button>

        {/* Step forward */}
        <button
          onClick={() => onGoTo(currentIndex + 1)}
          disabled={currentIndex === total - 1}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-700 hover:bg-zinc-600 active:scale-95 transition disabled:opacity-30"
          aria-label="Next day"
        >
          <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
          </svg>
        </button>

        {/* Speed selector */}
        <div className="flex gap-1 ml-auto">
          {SPEED_OPTIONS.map((opt, i) => (
            <button
              key={opt.label}
              onClick={() => onSetSpeed(i)}
              className={`px-2 py-1 rounded text-xs font-mono transition ${
                i === speedIndex
                  ? 'bg-amber-400 text-black font-bold'
                  : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <p className="text-xs text-zinc-500 text-center">Fetching data for this day…</p>
      )}
    </div>
  )
}
