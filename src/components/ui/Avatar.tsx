import { avatarColor, initials as getInitials, AVATAR_COLORS } from "@/lib/design/tokens"

interface AvatarProps {
  handle: string
  displayName?: string | null
  size?: number
  ghost?: boolean
  className?: string
}

export function Avatar({ handle, displayName, size = 30, ghost = false, className }: AvatarProps) {
  const col = ghost ? AVATAR_COLORS["__ghost__"] : avatarColor(handle)
  const text = getInitials(handle, displayName)
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        backgroundColor: col.bg,
        color: col.fg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: Math.round(size * 0.36),
        fontWeight: 500,
        userSelect: "none",
        lineHeight: 1,
      }}
      aria-hidden="true"
    >
      {text}
    </div>
  )
}

export function AvatarStack({ handles, size = 30, max = 5 }: {
  handles: Array<{ handle: string; displayName?: string | null; ghost?: boolean }>
  size?: number
  max?: number
}) {
  const visible = handles.slice(0, max)
  const extra   = handles.length - max
  return (
    <div style={{ display: "flex" }}>
      {visible.map((h, i) => (
        <div
          key={h.handle + i}
          className="avatar-ring"
          style={{ marginLeft: i === 0 ? 0 : -8, borderRadius: "50%" }}
        >
          <Avatar handle={h.handle} displayName={h.displayName} size={size} ghost={h.ghost} />
        </div>
      ))}
      {extra > 0 && (
        <div
          className="avatar-ring"
          style={{
            marginLeft: -8, borderRadius: "50%",
            width: size, height: size,
            backgroundColor: "#EDE8E1",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: Math.round(size * 0.32), color: "#A8A29E", fontWeight: 500,
          }}
        >
          +{extra}
        </div>
      )}
    </div>
  )
}
