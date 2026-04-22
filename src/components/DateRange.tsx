interface DateRangeProps {
  start: string
  end: string
  onChange: (start: string, end: string) => void
}

export default function DateRange({ start, end, onChange }: DateRangeProps) {
  const today = new Date().toISOString().split('T')[0]
  const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  return (
    <div>
      <label className="block text-xs text-zinc-400 mb-1 uppercase tracking-wider">Date Range</label>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-xs text-zinc-500 mb-1">From</label>
          <input
            type="date"
            value={start}
            min={oneYearAgo}
            max={end || today}
            onChange={e => onChange(e.target.value, end)}
            className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-2 py-2 text-sm text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-zinc-500 mb-1">To</label>
          <input
            type="date"
            value={end}
            min={start}
            max={today}
            onChange={e => onChange(start, e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-2 py-2 text-sm text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30"
          />
        </div>
      </div>
    </div>
  )
}
