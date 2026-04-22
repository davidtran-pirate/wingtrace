import { US_STATES } from '../types'

interface StateSelectProps {
  value: string
  onChange: (code: string, name: string) => void
}

export default function StateSelect({ value, onChange }: StateSelectProps) {
  return (
    <div>
      <label className="block text-xs text-zinc-400 mb-1 uppercase tracking-wider">State</label>
      <select
        value={value}
        onChange={e => {
          const state = US_STATES.find(s => s.code === e.target.value)
          if (state) onChange(state.code, state.name)
        }}
        className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30"
      >
        <option value="">Select a state…</option>
        {US_STATES.map(s => (
          <option key={s.code} value={s.code}>{s.name}</option>
        ))}
      </select>
    </div>
  )
}
