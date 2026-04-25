interface ArcProps {
  pct: number
  size?: number
  delay?: number
  animated?: boolean
}

export function Arc({ pct, size = 40, delay = 0, animated = true }: ArcProps) {
  const sw    = 2.5
  const r     = size / 2 - sw
  const c     = size / 2
  const circ  = 2 * Math.PI * r
  const fill  = Math.min(Math.max(pct, 0), 1) * circ
  const done  = pct >= 1

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ transform: "rotate(-90deg)", flexShrink: 0 }}
      aria-hidden="true"
    >
      {/* Track */}
      <circle cx={c} cy={c} r={r} fill="none" stroke="#EDE8E1" strokeWidth={sw} />
      {/* Fill */}
      {fill > 0 && (
        <circle
          cx={c} cy={c} r={r}
          fill="none"
          stroke="#C07A38"
          strokeWidth={sw}
          strokeDasharray={`${fill} ${circ}`}
          strokeLinecap="round"
          className={animated ? "arc-fill" : undefined}
          style={animated ? { animationDelay: `${delay}ms` } : undefined}
        />
      )}
      {/* Completion dot at 12 o'clock */}
      {done && (
        <circle cx={c} cy={sw} r={1.5} fill="#C07A38" />
      )}
    </svg>
  )
}
