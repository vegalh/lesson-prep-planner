# DESIGN: Lesson Prep Planner

This documents the chosen visual direction after trying several trial pages
(kept in [`design-trials/`](./design-trials) for reference). The canonical
visual reference is
[`design-trials/trial-5-rootmap-style.html`](./design-trials/trial-5-rootmap-style.html).
Do not style the real tool differently from what's described here without
updating this file first.

## Direction Chosen

A single-column, mobile-first "phone shell" layout (max-width ~480px,
centered) with a card-grid layout for activities, using a color palette and
component style adapted from the user's other project, **rootmapmvp**
(https://vegalh.github.io/rootmapmvp).

### Trials considered and rejected

| Trial | Why not chosen |
|---|---|
| 1 — Card grid, warm serif, spacious | Layout liked, but serif/warm palette replaced by rootmapmvp colors |
| 2 — Compact list, cool blue palette | Too dense/cool-toned for the intended feel |
| 3 — Sidebar dashboard, pastel purple | Desktop-oriented sidebar didn't fit a phone-first classroom tool |
| 4 — Trial 1 layout + Trial 3 font + rootmapmvp colors | Good baseline, superseded by Trial 5's closer match to rootmapmvp's component style |
| 5 — rootmapmvp visual style adapted to card grid | **Chosen.** See below. |

Two deliberate departures from rootmapmvp's actual implementation:
- **Fonts**: rootmapmvp loads "Nunito" and "Caveat" from Google Fonts via a
  CDN `@import`. This project's rules forbid CDNs, so system-safe fonts are
  used instead (see Typography below). An initial cursive stand-in
  (`Brush Script MT`) was tried for headings and rejected as hard to read;
  headings use a bold weight of the body sans-serif instead.
- **Bottom tab navigation** (Today/Discover/Kids/Profile in rootmapmvp) is
  not used. It's multi-page app navigation for unrelated features. This
  tool is a single page, so it's omitted entirely.

---

## Color Palette

Extracted from rootmapmvp's shipped CSS custom properties (light theme).

| Variable | Hex | Role |
|---|---|---|
| `--bg` | `#fbf2e4` | Page background |
| `--card` | `#fffcf6` | Card/panel background |
| `--mint` | `#e3ebe0` | Highlight panel background (e.g. the schedule form) |
| `--primary` | `#4b7c63` | Primary buttons, "Ready" status badge, checkbox accent color |
| `--primary-dark` | `#2f4d3d` | Headings, hover state for primary buttons |
| `--danger` | `#b5582f` | "Needs Prep" status badge, validation error text, Remove button |
| `--apricot` | `#fbe9d7` | Summary chip background |
| `--silver` | `#ded0ba` | Reset button background (neutral, not primary/danger) |
| `--text` | `#3b2a1a` | Body text |
| `--muted` | `#8a7863` | Secondary/label text |
| `--border` | `#eee1d0` | Borders, input backgrounds pairing |
| `--on-primary` | `#ffffff` | Text on top of primary/danger colored backgrounds |

---

## Typography

- **No CDN fonts.** System font stack only:
  `-apple-system, 'Segoe UI', Verdana, sans-serif`.
- Headings use the **same stack, bold/800 weight**, colored `--primary-dark`
  — no separate heading font.
- Section labels (e.g. "OVERVIEW", "UPCOMING ACTIVITIES") are uppercase,
  `0.08em` letter-spacing, small size, `--muted` color.

---

## Components

- **Cards/panels**: `border-radius: 20–22px`, no border, background
  `--card` (or `--mint` for the schedule form panel specifically).
- **Buttons**: pill-shaped (`border-radius: 999px`), bold text.
  - Primary action (Add to Plan): `--primary` background, white text.
  - Destructive (Remove): outline style, `--danger` text/border, fills solid
    on hover.
  - Neutral (Reset Plan): `--silver` background, `--text` colored text —
    visually distinct from both primary and destructive actions.
- **Status badge**: small pill, bold white text.
  - "Ready" → `--primary` background.
  - "Needs Prep" → `--danger` background.
- **Metadata pills** (date/age/duration on each card): small pill,
  `--mint` background, `--primary-dark` text.
- **Activity photo**: a reference photo of the activity, placed on the
  card **below the metadata pills and above the materials checklist**.
  Fixed `4:3` aspect ratio with `object-fit: cover` so card heights stay
  consistent regardless of the source photo's proportions. Rounded
  corners (`border-radius: 14px`, slightly smaller than the card's own
  20px so it reads as nested), full card width, `0.75rem` margin below it
  before the checklist starts. Always includes descriptive `alt` text
  (the activity name) — it's content, not decoration.
- **Checkboxes**: native checkbox, `accent-color: var(--primary)`,
  fixed `18px` size (not stretched — see note below), left-aligned next to
  its material label with `0.5rem` gap.
- **Inline validation message**: `--danger` colored text directly under the
  relevant field, no `alert()`.

### Known pitfall to avoid when building the real tool

A single `input { width: 100% }` rule applied to *all* inputs will stretch
checkboxes and break their alignment with labels. Scope width rules to
`input[type="text"]` / `input[type="date"]` only, and style
`input[type="checkbox"]` separately with a fixed size. (This bug was found
and fixed during Trial 5 — see commit history.)

---

## Page States (visual mapping)

Building on `PRD.md`'s functional definitions:

- **Empty**: Schedule panel visible as normal; "Upcoming Activities" section
  shows a muted placeholder message instead of any cards; Overview section
  shows no chips or a "0 min" chip.
- **Invalid Input**: Inline `--danger` colored message appears directly
  below the offending field (activity or date); nothing else on the page
  changes.
- **In Use**: Cards render per scheduled entry with metadata pills, material
  checkboxes, a status badge, and a Remove button; Overview chips show
  totals per day; filter dropdown lists only dates with entries.
- **After Reset**: All cards removed, page matches Empty state; schedule
  form and starter activity dropdown remain fully populated and usable.

---

## Mobile Readability

- Layout is single-column by default (max-width ~480px, centered) — this
  already works on phone screens without a separate breakpoint.
  Resized/verified in the trial as a drop-in benefit of the phone-shell
  layout.
- One `@media (max-width: 360px)` breakpoint trims the shell/panel padding
  slightly on the smallest phones (e.g. iPhone SE), giving panels a bit more
  usable width. Added after the Overview summary chips were found to wrap
  one-per-row (each the width of nearly the whole panel) at narrow phone
  widths, which read as a long, repetitive list rather than a quick
  at-a-glance summary.
- Summary chips are a fixed ~2-up grid (`flex-basis: 50%`, not
  content-sized) and show the date and prep total on two stacked lines
  (bold date, smaller muted `X min prep` underneath). Earlier the chip
  text was a single line and was shortened to `Oct 27 · 5 min` to make it
  fit — but dropping "prep" made the number read as wrong (it doesn't
  match the activity duration shown on each card, e.g. a day can have
  8 min of combined *prep* but 25 min of combined activity *duration*).
  The two-line layout keeps the full, unambiguous `X min prep` wording
  while still guaranteeing two chips per row on any phone width.
