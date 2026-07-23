# Big Dog Media — Website Brand Guide

**For:** building the Big Dog Media website (hand this whole file to Claude).
**One-line brief:** premium black-and-bone video/social-advertising studio with a single confident gold accent. Bold type, high contrast, lots of negative space, zero clutter.

> **How to use this:** Follow the tokens and rules below *exactly*. Don't invent new colors, fonts, or gradients. When in doubt, choose the more restrained, higher-contrast option. Gold is a seasoning, not a sauce.

---

## 1. Brand essence

- **What we are:** a video production & social advertising studio.
- **Personality:** confident, polished, a little bite. The "big dog" in the room — loud without shouting.
- **Promise / tagline:** *We make brands impossible to ignore.*
- **Feeling the site should give:** expensive, sharp, effortless. Think premium agency reel, not SaaS dashboard.

**Voice for all copy:**
- Confident and declarative. Short sentences. Big claims we can back up.
- Polished, never stiff. No jargon, no filler ("leverage", "synergy", "solutions").
- A wink of attitude is welcome. Example: *"Stop the scroll. Start the talk."*
- Say: "We built a launch film that moved 2M views in a week." Not: "We leverage synergistic content solutions."

---

## 2. Color

Monochrome system + **one** gold accent. High contrast is the whole point.

| Token | Hex | Use |
|---|---|---|
| `--ink` | `#0A0A0A` | Primary bg (dark sections), primary text on light |
| `--bone` | `#F4F1EA` | Light bg, text on dark |
| `--gold` | `#CF9A4A` | Accent only — one detail per view |
| `--gold-ink` | `#B07F2F` | Gold on light bg (contrast-safe) |
| `--stone` | `#8F8B83` | Muted / secondary text |
| `--line` | `#23221E` (on dark) / `#D8D3C8` (on light) | Hairline borders, dividers |
| `--body` | `#33302B` | Body copy on light bg |

**Rules**
- Sections alternate **ink** and **bone** backgrounds. Never more than these two field colors.
- Gold appears **once or twice per screen** max: one word in a headline, a rule, a small tag, a CTA. Never large gold fills except a deliberate promo/CTA block.
- No gradients. No drop shadows for decoration (subtle elevation on interactive cards only). No color tints beyond this table.
- `::selection` = gold background, ink text.

---

## 3. Typography

Three families, all on Google Fonts. **Do not** substitute Inter/Roboto/Arial.

- **Archivo** — display & headings. Weights **800–900**, `UPPERCASE`, letter-spacing `-0.02em`, line-height `0.82–0.92`. This carries the brand.
- **Instrument Serif** — editorial accents, taglines, pull-quotes. Use *italic* for emphasis lines. Never for body or UI.
- **Instrument Sans** — body copy, labels, UI. Weights 400–600.

| Role | Font / weight | Size | Notes |
|---|---|---|---|
| Hero display | Archivo 900 | `clamp(52px, 9vw, 150px)` | UPPERCASE, lh 0.85, tracking -0.02em |
| Section H2 | Archivo 800 | `clamp(30px, 4vw, 58px)` | UPPERCASE |
| Editorial headline | Instrument Serif | `clamp(30px, 4.6vw, 68px)` | mixed case, italic emphasis in gold |
| Eyebrow / label | Archivo 600–800 | `12px` | UPPERCASE, tracking `0.28em`, gold |
| Body | Instrument Sans 400 | `16–18px` | lh 1.6, color `--body` / `--stone` on dark |
| Small / meta | Archivo 600 | `11–12px` | UPPERCASE, tracking `0.2em`, stone |

**Rules:** `text-wrap: pretty` on headlines; max line length ~62ch for body; italic-gold one phrase per headline for emphasis.

---

## 4. Layout & spacing

- **Grid:** generous. Section padding `min(12vw, 130px)` vertical, `7vw` horizontal. Max content width ~1400px, centered.
- **Rhythm:** big whitespace between sections; content should feel unhurried and premium.
- **Radius:** `6–12px` on cards/media; pills (`100px`) for tags and small CTAs only.
- **Borders:** 1px hairlines using `--line`. Use borders, not shadows, to separate on flat fields.
- **Dividers:** thin gold rules (2px, ~34px wide) flanking small labels; full-width 1px hairlines between blocks.
- **Numbered sections:** prefix major sections with an eyebrow like `01 — The idea` (gold, Archivo, tracked).

---

## 5. Components

**Buttons / CTA** — Primary: ink fill, bone text (inverted per field), Archivo 800, UPPERCASE, tracking 0.1em, padding `14px 22px`. Secondary: text link with `→` and gold hover. Hover: lift 1–2px or gold text swap. No color explosions.

**Cards / work tiles** — Ink card, `--line-dark` border, radius 12px. 4:3 media on top, text below. Placeholder while awaiting footage: `repeating-linear-gradient(135deg,#161512 0 14px,#1c1b17 14px 28px)` with an uppercase stone label. Metrics in gold.

**Nav** — Minimal: wordmark left, 3–5 links, one CTA right. Uppercase Archivo labels, small, tracked.

**Sections** — Alternate ink/bone. Each opens with a gold eyebrow, then Archivo H2 or Instrument Serif editorial headline (vary the rhythm).

---

## 6. Logo

**Stacked wordmark** — pure type, no bitmap dog.
- Full lockup: `BIG` / `DOG` stacked (Archivo 900), then `— MEDIA —` with 2px gold rules, letter-spacing `0.5em`.
- Compact mark: small `BIG DOG` + tiny gold `MEDIA`.
- On dark: bone + gold. On light: ink + `--gold-ink`. Never stretch, recolor, or shadow.

---

## 7. Imagery & motion

- Real video stills, graded warm-neutral. Until then: striped placeholder + uppercase caption of what belongs there.
- Text over imagery gets an ink gradient scrim.
- Motion: fade/slide-up on scroll (200–400ms, ease-out), one hover lift on cards. No bounce, no parallax overload, no autoplay audio.

---

## 8. Accessibility

- Body ≥16px; meta never below 12px.
- Gold text only on ink; `--gold-ink` on light.
- Visible gold focus states. Respect `prefers-reduced-motion`.

---

## 9. Don'ts

- ❌ No gradients, glows, or neon.
- ❌ No gold backgrounds except the single CTA/promo block.
- ❌ No Inter/Roboto/Arial; only the 3 named fonts.
- ❌ No blob illustrations, emoji, or stock icon sets.
- ❌ No cramped layouts — when unsure, add space and remove elements.

---

## 10. Contact

- Email: **vincentarmato.co@gmail.com**
- Phone: **630-338-2172**
- Handle: **@bigdogmedia**
