# Potluck — Extracted Design Tokens

Extracted from: `Ski Trip 2026 (1).html`, `Clear the Table.html`, `Landing and Onboarding (1).html`

---

## Colors

### Core palette
| Name | Hex | Usage |
|------|-----|-------|
| `HEARTH` | `#C07A38` | Primary CTA, arc fills, focus rings, key highlights |
| `hearth.light` | `#FDF3E8` | Hearth-tinted backgrounds (card tint, CTA section, confirmation) |
| `hearth.dark` | `#9A5E28` | (Tailwind config, not used directly in spec) |
| `CREAM` | `#F8F5F0` | Page background, nav background |

### Text colors
| Token | Hex | Usage |
|-------|-----|-------|
| Dark / primary | `#1C1917` | Main text, headings, pool name, page nav |
| Stone 600 | `#78716C` | Secondary body text, label text, ghost button text |
| Stone 400 | `#A8A29E` | Placeholder, tertiary, "you" labels, nav back |
| Stone 300 | `#C4BAB0` | Dimmed / empty / "brought" column label, divider text |
| Stone 200 | `#B8B0A8` | Disabled / settling state text |

### Surface / border colors
| Token | Hex | Usage |
|-------|-----|-------|
| Divider | `#EDE8E1` | Member row borders, section dividers, card borders |
| Card border | `#E2D9CE` | Transactional card border, ghost button border |
| Info card bg | `#FAF8F5` | Quiet info card background |
| Member chip bg | `#F5F0EA` | Member chip pill background |
| Archived badge bg | `#F0EBE3` | Archived status badge |
| Section white | `#FFFFFF` | White content sections on landing |
| Section dark | `#1C1917` | Dark footer |
| Annotation bar | `#141010` | Design preview annotation (not real UI) |

### Avatar palette (deterministic by handle)
```
anna.init:    bg #D4C5B0  fg #5A4A3A
philipp.init: bg #B9C0CA  fg #3A3F50
lisa.init:    bg #BBC8B6  fg #3A5038
tom.init:     bg #CAB9B0  fg #5A3A38
maya.init:    bg #C07A38  fg #FFFFFF  ← same as HEARTH
ghost (pending): bg #E8E3DC  fg #A8A29E
```

---

## Typography

### Font
- **Family**: DM Sans
- **Source**: Google Fonts `?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,450;9..40,500;9..40,600;9..40,700`
- **Optical size axis**: 9–40 (variable)
- **Weight axis values used**: 300, 400, 450, 480, 490, 500, 520, 550, 560, 580, 590, 600, 620, 640

### Size scale
| Context | px | Used for |
|---------|-----|---------|
| 56 | 56px | Landing hero H1 |
| 38 | 38px | Step number (font-weight 300) |
| 34 | 34px | Landing CTA section H2 |
| 30 | 30px | Pool name H1 (detail page) |
| 28 | 28px | Clear the Table H1 |
| 25 | 25px | Create/sign-in H1 |
| 24 | 24px | Sign in H1 (slightly smaller) |
| 22 | 22px | Stat values (pot balance, spread, per person) |
| 21 | 21px | Dashboard heading |
| 20 | 20px | Landing problem section lead |
| 18 | 18px | Landing hero body, remaining amount |
| 17 | 17px | Landing nav wordmark |
| 16 | 16px | Landing body, CTA body |
| 15.5 | 15.5px | Landing how-it-works titles, settle distributing total |
| 15 | 15px | Input text, settle amount input |
| 14.5 | 14.5px | Google button text |
| 14 | 14px | Body text, pool subtitle, button text |
| 13.5 | 13.5px | Member names (settle), ghost/outline buttons |
| 13 | 13px | Nav back, section items, pool stat labels |
| 12.5 | 12.5px | Field labels, info card copy |
| 12 | 12px | Section labels, timestamps, fine print |
| 11.5 | 11.5px | Nav/subtext, amount label, bottom hints |
| 11 | 11px | "you" label, routing chip text |
| 10.5 | 10.5px | Card section title (BRING YOUR SHARE) |
| 10 | 10px | Archived badge text |

### Letter spacing
| Context | Value |
|---------|-------|
| Hero H1 | `-0.035em` |
| Main headings | `-0.025em` |
| Pool name, sub headings | `-0.02em` |
| Stat values / money | `-0.02em` |
| Settle amounts | `-0.015em` |
| Button labels | `-0.01em` |
| Section label caps | `+0.08em` to `+0.1em` |
| Landing nav brand | `-0.025em` |

### Number rendering
- All monetary values use `font-variant-numeric: tabular-nums`
- `.tabular` class everywhere money appears

---

## Spacing

### Layout
| Token | Value | Usage |
|-------|-------|-------|
| Max width | `1080px` | All pages |
| Nav height | `52px` | AppNav |
| Landing nav height | `56px` | LandingNav |
| Outer padding | `32px` | Detail pages (left/right) |
| Landing outer padding | `48px` | Landing page sections |
| Main padding (detail) | `40px 32px 64px` | Pool detail main |
| Landing hero padding | `88px 48px 100px` | Landing hero section |
| Grid columns | `3fr 2fr` | Pool detail grid |
| Grid gap | `48px` | Pool detail left/right gap |
| Landing how-it-works grid | `1fr 1fr 1fr`, gap `52px` |

### Component spacing
| Token | Value | Usage |
|-------|-------|-------|
| Member row padding | `13px 0` | Balance board rows |
| Expense item padding | `11px 0` | Expense feed rows |
| Transactional card padding | `20px 20px 22px` | "Bring your share" inner |
| Info card padding | `14px 16px` | Closing note, pending invites |
| Section gap | `36px` | After header before divider |
| Post-divider margin | `28px` | After each section divider |
| Avatar overlap | `-8px` | Stack margin-left |
| Member row gap | `14px` | Arc + avatar + name |
| Expense item gap | `12px` | Avatar + content |

---

## Border radii
| Context | Value |
|---------|-------|
| Cards (main) | `10px` |
| CTA buttons | `7px` |
| Small buttons | `6px` |
| Field inputs | `6px` or `7px` |
| Member chips (pill) | `20px` |
| Archived badge | `20px` |
| Avatar | `50%` |
| One-tap pill | `20px` |

---

## Motion

### Keyframes
```css
/* Arc draw — balance board arcs */
@keyframes arcDraw {
  from { stroke-dasharray: 0 200; opacity: 0; }
  10%  { opacity: 1; }
}
/* duration: 0.7s cubic-bezier(0.4, 0, 0.2, 1) */
/* stagger: delay = index * 60ms */

/* Fade slide — member rows, expense items */
@keyframes fadeSlide {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
/* duration: 0.3s ease */
/* stagger: delay = index * 40ms (rows), 200ms + index*40ms (expenses) */

/* Screen entry — page transitions */
@keyframes screenIn {
  from { transform: translateY(4px); }
  to   { transform: translateY(0); }
}
/* duration: 0.22s ease */

/* Settle pulse — rows during tx execution */
@keyframes settlePulse {
  0%, 100% { opacity: 1; }
  45%       { opacity: 0.38; }
}
/* duration: 1.1s ease-in-out infinite */
/* stagger: row-0 0ms, row-1 120ms, row-2 240ms, row-3 360ms, row-4 480ms */

/* Dot ellipsis — "Settling…" animation */
@keyframes dot1 { 0%,66%,100% {opacity:0} 22% {opacity:1} }
@keyframes dot2 { 0%,33%,100% {opacity:0} 55% {opacity:1} }
@keyframes dot3 { 0%,55%,100% {opacity:0} 77% {opacity:1} }
/* duration: 1.2s infinite */

/* Aftermath fade up */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
/* duration: 0.35s ease */

/* Badge pop — archived badge */
@keyframes badgePop {
  from { opacity: 0; transform: scale(0.88); }
  to   { opacity: 1; transform: scale(1); }
}
/* duration: 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), delay 0.15s */
```

### Interaction values
| Interaction | Value |
|-------------|-------|
| Hover opacity | `0.88` |
| Border transition | `0.15s` |
| Color transition | `0.15s` |
| CTA background transition | `0.22s ease` (settle confirm) |
| Focus border color | `#C07A38` (HEARTH) |
| Focus box-shadow | `0 0 0 3px rgba(192,122,56,0.12)` |

---

## Component Patterns

### Avatar
- Circular (`border-radius: 50%`)
- Size = prop (default 30-32)
- `fontSize = size * 0.35` (approx)
- Color: determined by handle, from AVATAR_COLORS map
- Ghost state: `bg #E8E3DC`, `fg #A8A29E`

### Arc (CoverageArc)
- SVG, `rotate(-90deg)` transform
- Stroke width: `2.5`
- Track: `#EDE8E1`
- Fill: `#C07A38` (HEARTH)
- `strokeLinecap: round`
- `arcDraw` animation on mount
- Completion dot at 12 o'clock when `pct >= 1`

### CTABtn
- Background: `#C07A38` (HEARTH), disabled: `#EDE8E1`
- Color: `#FFFFFF`, disabled: `#B8B0A8`
- `border-radius: 7px`
- `font-weight: 560`
- `letter-spacing: -0.01em`
- Hover: `opacity 0.88`
- Transition: `opacity 0.15s`
- Sizes: `lg` (13px 32px, 15.5px), `md` (10px 22px, 14px), `sm` (7px 16px, 13px)

### GhostBtn
- Background: `transparent`
- Border: `1px solid #E2D9CE`
- Color: `#78716C`
- Hover: `border-color #C07A38`, `color #C07A38`

### AppNav
- Position: `sticky`, `top: 0`, `z-index: 20`
- Background: `#F8F5F0` (CREAM)
- Border-bottom: `1px solid #EDE8E1`
- Height: `52px`
- Max-width: `1080px`, padding `0 32px`
- Back chevron: 15×15 SVG path `M9.5 12L5 7.5 9.5 3`

### One-tap pill
- `background #FDF3E8`, `color #C07A38`
- `padding: 3px 10px`, `border-radius: 20px`
- `font-size: 11.5px`, `font-weight: 500`
- Dot: `6px × 6px`, `opacity 0.8`

### Transactional card (Bring your share)
- Background: `#FFFFFF`
- Border: `1px solid #E2D9CE`
- Border-radius: `10px`
- Top accent bar: `3px` height, `#C07A38`
- Section title: `10.5px`, weight `620`, `letter-spacing 0.08em`, `text-transform uppercase`

### Info card (closing note)
- Background: `#FAF8F5`
- Border: `1px solid #EDE8E1`
- Border-radius: `10px`

### MemberRow
- Display: flex, gap `14px`, padding `13px 0`
- Border-bottom: `1px solid #EDE8E1` (last: none)
- "Is me" highlight: `background #FAF8F5`, margin/padding `4px`, `border-radius 6px`
- Net positive: `font-weight 510`, `color #1C1917`
- Net negative: `font-weight 400`, `color #A8A29E`
- Net zero: `font-weight 400`, `color #C4BAB0`, displayed as `—`

### ExpenseItem
- Display: flex, gap `12px`, padding `11px 0`
- Border-bottom: `1px solid #EDE8E1`

### SectionLabel
- `font-size: 12px`, `color #A8A29E`, `font-weight 450`, `letter-spacing 0.01em`

### DistRow (settlement)
- Display: flex, gap `12px`, padding `13px 0`
- Border-bottom: `1px solid #EDE8E1`
- Routing chip: `font-size 11px`, `color #B8B0A8`, `→ ChainName`
- "change" link: `font-size 11px`, `color #C9C1B8`, underline

### Field input
- Border: `1px solid #DDD6CE`, border-radius `6-7px`
- Focus: `border-color #C07A38`
- Transition: `border-color 0.15s`
- Font: DM Sans, `font-size 14px`, `color #1C1917`
- No spinner arrows on `type=number`

### Member chip (in create form)
- Background: `#F5F0EA`
- Border-radius: `20px`
- Padding: `3px 8px`
- Font-size: `13px`, color `#5A4A3A`
- Includes: 18px Avatar + @handle + × button

### "Add to the spread" button (dashed)
- Border: `1px dashed #DDD6CE`
- Color: `#A8A29E`
- Hover: border `#C07A38`, color `#C07A38`
- Border-radius: `6px`, padding `9px 0`

---

## Landing page sections
| Section | Background | Padding |
|---------|-----------|---------|
| Nav | `#F8F5F0` (cream) sticky | — |
| Hero | `#F8F5F0` | `88px 48px 100px` |
| Problem | `#FFFFFF` | `68px 48px` |
| How it works | `#F8F5F0` | `72px 48px 80px` |
| Trust strip | `#FFFFFF` | `36px 48px` |
| Second CTA | `#FDF3E8` (hearth.light) | `80px 48px` |
| Footer | `#1C1917` (dark) | `44px 48px 36px` |

---

## Copy / Voice
- **Set the table** — create a potluck
- **Bring your share** — contribute funds
- **Add to the spread** — log an expense
- **Pass the plate** — auto-reimburse payer
- **Clear the table** — settle and close
- **Take leftovers home** — bridge withdrawal
- **The spread** — expense feed section label
- **Balance board** — member net positions section
- **Pot balance** / **The spread** / **Per person** — stat cluster labels
- Settling copy: *"Everyone brings something. Nobody has to ask."*
- Empty expense: *"Nothing here yet. Add the first expense when something gets paid."*
- Info tone: warm, direct, no crypto jargon
