# AGENTS.md — Project Constraints for Lesson Prep Planner

This file governs how any AI assistant (or human contributor) should work
in this repository. Read `PROPOSAL.md`, `PRD.md`, and `DESIGN.md` first —
they define *what* to build and *how it should look*. This file defines the
hard constraints on *how* it must be built.

## Technology Constraints

- **Plain HTML, CSS, and JavaScript only.**
- **No frameworks or libraries** (no React, Vue, Tailwind, Bootstrap,
  jQuery, build tools, bundlers, etc.).
- **No CDNs** — no external `<script src="https://...">`,
  `<link href="https://...">`, or CSS `@import url(...)` of any kind
  (including Google Fonts). All fonts must come from the system font stack.
- **No server and no outside APIs.** The entire app must run as static
  files opened directly or served via GitHub Pages.
- **No database, CSV, or separate JSON data file** for starter content.
  Fixed starter data lives in a plain array of objects inside a `.js` file.
- Keep all project files inside this repository and deploy via GitHub
  Pages. Do not introduce a separate deployment target.

## State & Data Rules

- There are two kinds of data (see `PRD.md` for full field definitions):
  1. **Starter activities** — a fixed, read-only array of objects in a
     `.js` file. Never create, edit, or delete these at runtime.
  2. **Scheduled entries** — user-created data (an activity scheduled on a
     date, with per-material ready/not-ready checkboxes). This is the only
     data that is read from and written to `localStorage`.
- JavaScript state must be shared across multiple interactions — e.g. the
  same in-memory array that the form appends to is what the checkboxes
  mutate, what calculations read from, and what gets persisted.
- Every state-changing action (schedule, toggle material, remove entry,
  reset) must re-render the affected parts of the page **without a full
  page reload** and must **not use `alert()`**.
- Reset clears scheduled entries and `localStorage`, but must never touch
  or remove the starter activity catalog.

## Validation Rules

- All validation messages are **inline**, shown near the relevant field,
  styled distinctly (see `DESIGN.md` for color), and must not block the
  rest of the page from working.
- Invalid submissions must not corrupt or clear existing state.

## Design Rules

- Follow `DESIGN.md` exactly for colors, typography, spacing, and component
  styles. If a design decision isn't covered there, ask before improvising
  — update `DESIGN.md` first, then implement.
- Use **semantic HTML** (`<form>`, `<label>`, `<button>`, `<ul>`/`<li>`,
  `<article>`, headings in order, etc.) — not generic `<div>` soup.
- The page must be usable and readable on a phone-sized viewport without a
  separate mobile version.
- A known CSS pitfall to avoid (see `DESIGN.md`): don't apply a blanket
  `width: 100%` style to all `input` elements — it will break checkbox
  layout. Scope width rules to text/date inputs only.

## Required Interactions (minimum)

At least three interaction types, already decided in `PRD.md`:
1. A form (schedule an activity: activity dropdown + date input).
2. A filter dropdown (by date).
3. Checkboxes (mark individual materials ready).
4. Buttons (Add to Plan, Remove, Reset).

## Required Page States

Implement and visually distinguish all four states defined in `PRD.md` and
`DESIGN.md`: **Empty**, **Invalid Input**, **In Use**, **After Reset**.

## Workflow Rules

- **Commit in small, understandable steps** with clear messages. Do not
  squash the whole project into one final commit.
- Do not style the real tool (`index.html` and its CSS) in a way that
  contradicts `DESIGN.md` — update the doc first if the direction changes.
- Do not invent proposal content, PRD decisions, or design choices on
  behalf of the project owner — ask when something is ambiguous.
