import { Check, Circle, MousePointer2 } from 'lucide-react'

export function OptionCard({ label, selected, index, accent, multi, onClick }) {
  return (
    <button
      type="button"
      className={`option-card ${selected ? 'option-card--selected' : ''}`}
      style={selected ? { borderColor: accent, background: `${accent}14`, boxShadow: `0 0 0 1px ${accent}26 inset, 0 18px 40px rgba(0,0,0,.18)` } : undefined}
      onClick={onClick}
    >
      <span className="option-card__index">{String.fromCharCode(65 + index)}</span>
      <span className="option-card__label">{label}</span>
      <span className="option-card__mark">{selected ? <Check size={17} strokeWidth={3} /> : multi ? <Circle size={16} /> : <MousePointer2 size={15} />}</span>
    </button>
  )
}
