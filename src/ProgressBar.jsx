export function ProgressBar({ value, color }) {
  return (
    <div className="progress-track" aria-label={`Progress ${Math.round(value)} percent`}>
      <div className="progress-value" style={{ width: `${value}%`, backgroundColor: color, boxShadow: `0 0 22px ${color}66` }} />
    </div>
  )
}
