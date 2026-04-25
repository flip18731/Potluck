export const HEARTH = "#C07A38"
export const CREAM  = "#F8F5F0"

export const COLORS = {
  hearth:       HEARTH,
  hearthLight:  "#FDF3E8",
  hearthDark:   "#9A5E28",
  cream:        CREAM,
  dark:         "#1C1917",
  stone600:     "#78716C",
  stone500:     "#A8A29E",
  stone400:     "#C4BAB0",
  stone300:     "#B8B0A8",
  divider:      "#EDE8E1",
  cardBorder:   "#E2D9CE",
  infoCard:     "#FAF8F5",
  chipBg:       "#F5F0EA",
  fieldBorder:  "#DDD6CE",
  badgeBg:      "#F0EBE3",
  white:        "#FFFFFF",
}

export const AVATAR_COLORS: Record<string, { bg: string; fg: string }> = {
  "anna.init":    { bg: "#D4C5B0", fg: "#5A4A3A" },
  "philipp.init": { bg: "#B9C0CA", fg: "#3A3F50" },
  "lisa.init":    { bg: "#BBC8B6", fg: "#3A5038" },
  "tom.init":     { bg: "#CAB9B0", fg: "#5A3A38" },
  "maya.init":    { bg: HEARTH,    fg: "#FFFFFF"  },
  __ghost__:      { bg: "#E8E3DC", fg: "#A8A29E"  },
}

export function avatarColor(handle: string): { bg: string; fg: string } {
  if (AVATAR_COLORS[handle]) return AVATAR_COLORS[handle]
  // deterministic fallback based on string hash
  const h = [...handle].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 0)
  const palettes = [
    { bg: "#D4C5B0", fg: "#5A4A3A" },
    { bg: "#B9C0CA", fg: "#3A3F50" },
    { bg: "#BBC8B6", fg: "#3A5038" },
    { bg: "#CAB9B0", fg: "#5A3A38" },
    { bg: "#C4BAB5", fg: "#4A3A38" },
    { bg: "#B5C0B9", fg: "#3A4A3A" },
  ]
  return palettes[Math.abs(h) % palettes.length]
}

export function initials(handle: string, displayName?: string | null): string {
  const source = displayName || handle
  return source.replace(".init", "").slice(0, 1).toUpperCase()
}
