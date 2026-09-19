export function Brand({ compact = false }) {
  return (
    <div className={`brand ${compact ? 'brand--compact' : ''}`}>
      <img src="/assets/imperium-logo.png" alt="The Imperium League" />
      <div className="brand__words">
        <span>THE IMPERIUM</span>
        <strong>LEAGUE</strong>
      </div>
    </div>
  )
}
