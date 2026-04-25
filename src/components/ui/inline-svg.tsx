/** Warm Potluck icons — replaces lucide for hackathon design fidelity */

export function IconClose({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 3l10 10M13 3L3 13" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function IconLoader({ size = 16, color = "#C07A38" }: { size?: number; color?: string }) {
  return (
    <svg
      className="potluck-spin"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" opacity="0.22" />
      <path
        d="M21 12a9 9 0 00-9-9"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function IconAlert({ size = 16, color = "#C07A38" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 1.5L14.5 13H1.5L8 1.5z"
        stroke={color}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M8 6v3.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="8" cy="12" r="0.6" fill={color} />
    </svg>
  )
}

export function IconExternal({ size = 14, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M5 2h7v7M12 2L4.5 9.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M9 9v3H2V5h3" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconGlobe({ size = 14, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.25" stroke={color} strokeWidth="1.2" />
      <path d="M2 8h12M8 2c2 2.5 2 9.5 0 12M8 2c-2 2.5-2 9.5 0 12" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

export function IconCopy({ size = 12, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <rect x="3" y="3.5" width="6" height="6" rx="1" stroke={color} strokeWidth="1.1" />
      <path d="M4.5 3V2.5A1.5 1.5 0 016 1h3A1.5 1.5 0 0110.5 3v3A1.5 1.5 0 019 7.5H8.5" stroke={color} strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  )
}
