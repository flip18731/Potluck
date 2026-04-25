interface ArcProps {
  /** 0–1 completion (use only for non-monetary visuals, or omit in favor of ratio) */
  pct?: number
  /** Coverage numerator in uinit (bigint) */
  ratioNum?: bigint
  /** Coverage denominator in uinit (bigint); arc = min(1, num/den) via fixed-point math */
  ratioDen?: bigint
  size?: number
  delay?: number
  animated?: boolean
}

export function Arc({ pct, ratioNum, ratioDen, size = 40, delay = 0, animated = true }: ArcProps) {
  let p = pct ?? 0
  if (ratioDen !== undefined && ratioDen > 0n && ratioNum !== undefined) {
    const ppm = (ratioNum * 1_000_000n) / ratioDen
    const capped = ppm > 1_000_000n ? 1_000_000n : ppm
    p = Number(capped) / 1_000_000
  }
  p = Math.min(1, Math.max(0, p))

  const sw    = 2.5
  const r     = size / 2 - sw
  const c     = size / 2
  const circ  = 2 * Math.PI * r
  const fill  = p * circ
  const done  = p >= 1

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
