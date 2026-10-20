# PRD: Lesson Prep Planner

Derived from `PROPOSAL.md`. Review this and flag anything that doesn't match
what you intended — this document drives everything built after it.

## 1. Data Model

There are two kinds of data, kept separate on purpose:

### 1a. Starter Activities (fixed, read-only)

A hard-coded JavaScript array of objects, shipped in a `.js` file (e.g.
`activities-data.js`). This is the catalog of lesson activities a teacher can
schedule. Per the proposal's "Out of Scope," users **cannot** create, edit, or
delete entries in this list.

Each starter activity object:

| Field           | Type     | Example                              |
|-----------------|----------|---------------------------------------|
| `id`            | string   | `"color-sorting"`                     |
| `name`          | string   | `"Color Sorting Bins"`                |
| `ageRange`      | string   | `"2-3 years"`                         |
| `durationMinutes` | number | `20`                                   |
| `prepMinutes`   | number   | `10`                                   |
| `materials`     | array of strings | `["sorting bins", "colored pom-poms"]` |
| `image`         | string (path) | `"images/color-sorting.jpg"` — a reference photo of the activity, shown on its card |

### 1b. Scheduled Plan (user-created, saved in `localStorage`)

When a user schedules a starter activity onto a date, a **scheduled entry**
is created. This is the only data the user adds, and it's what persists
across a page refresh.

Each scheduled entry object:

| Field           | Type     | Notes                                                |
|-----------------|----------|-------------------------------------------------------|
| `scheduleId`    | string   | Unique ID for this entry (e.g. timestamp-based)       |
| `activityId`    | string   | References a starter activity's `id`                 |
| `date`          | string   | `YYYY-MM-DD`, chosen by the user                      |
| `materialsReady`| object   | `{ "sorting bins": false, "colored pom-poms": true }` — one entry per material, toggled by checkbox |

`materialsReady` belongs to the individual scheduled entry (keyed by its own
`scheduleId`), not to the starter activity. If the same catalog activity is
scheduled on two different dates (or twice on the same date), each resulting
entry gets its own independent `materialsReady` object — checking a material
ready on one entry has no effect on any other entry.

**Derived prep status** (not stored, calculated on render): an entry is
`"Ready"` if every material in `materialsReady` is `true`, otherwise
`"Needs Prep"`.

The full array of scheduled entries is saved to `localStorage` under one key
(e.g. `lessonPrepPlan`) every time it changes, and read back in on page load.

---

## 2. Actions & State Changes

| Action | Trigger | State change | Persisted? |
|---|---|---|---|
| **Schedule an activity** | Form submit: pick activity (dropdown) + date (date input) | Validates inputs → appends a new scheduled entry to the in-memory array (with all materials defaulted to `false`) → re-renders | Yes, saved to `localStorage` |
| **Toggle material ready** | Checkbox click on a scheduled entry | Flips that material's boolean in `materialsReady` for that entry → re-renders totals and status | Yes, saved to `localStorage` |
| **Filter by date** | Dropdown change (options built from dates that currently have scheduled entries, e.g. "All dates" + one option per distinct scheduled date) | Does **not** change stored data — only changes what's rendered in the "upcoming activities" list | No |
| **Remove a scheduled entry** | "Remove" button on a single scheduled entry | Removes that one entry from the in-memory array by `scheduleId` → re-renders totals and list | Yes, saved to `localStorage` |
| **Reset** | Reset button click | Clears the in-memory scheduled array to `[]` → clears the `localStorage` key → re-renders without reloading the page | Yes (clears storage) |

---

## 3. Calculated Outputs

Computed fresh from state on every render — never stored directly:

1. **Total prep minutes per day** — group scheduled entries by `date`, sum
   each entry's starter activity's `prepMinutes`. Shown per date (e.g. in a
   small table or list: "Oct 22 — 35 min prep needed").
2. **Upcoming activities with materials & status** — scheduled entries with
   a `date` of today or later, sorted by date, showing: activity name, date,
   age range, a reference photo of the activity, materials list (with
   ready/not-ready checkboxes **per material**), and a clearly visible
   **overall status badge** for the whole activity ("Ready" when every
   material is checked, "Needs Prep" otherwise) — so the user can tell at a
   glance whether an activity is fully prepped without reading every
   checkbox.

---

## 4. Validation (inline, no `alert()`)

| Field | Rule | Message shown |
|---|---|---|
| Activity dropdown | Must select one (not the placeholder) | "Please choose an activity." |
| Date | Must not be empty | "Please choose a date." |

- Messages appear inline next to the form, styled distinctly (e.g. red text),
  and disappear once the issue is fixed and resubmitted successfully.
- Invalid submission does **not** clear the user's partial form input and
  does **not** add anything to the scheduled list.

---

## 5. Page States

### Empty
- No scheduled entries exist (first visit, or nothing scheduled yet).
- Scheduling form is visible and usable.
- "Upcoming activities" area shows a friendly placeholder message (e.g. "No
  activities scheduled yet — pick one above to get started.").
- Prep-time-per-day output shows nothing or a "0 minutes" placeholder.

### Invalid Input
- Triggered by submitting the form with a missing activity or date.
- Inline validation message(s) appear near the relevant field(s).
- The scheduled list and totals remain exactly as they were — nothing is
  added or removed.
- The rest of the page (filter, existing checkboxes, reset) stays fully
  usable.

### In Use
- One or more scheduled entries exist.
- "Upcoming activities" list shows each entry with activity name, date, age
  range, duration, per-material checkboxes, an overall "Ready"/"Needs Prep"
  status badge, and a "Remove" button for that entry.
- Prep-minutes-per-day output reflects current totals.
- Date filter dropdown lists only dates that currently have scheduled
  entries (plus an "All dates" option) and narrows the visible list without
  altering stored data.

### After Reset
- User clicks Reset; confirmation text briefly appears (e.g. "Plan reset.").
- Scheduled list and `localStorage` key are cleared immediately, no page
  reload.
- Page visually matches the **Empty** state afterward.
- Starter activity catalog (dropdown options) is unaffected — still fully
  available to schedule again.

---

## Decisions Confirmed

1. Date filter is a dropdown built from dates that currently have scheduled
   entries (not a free-form date range picker).
2. Users can remove a single scheduled entry individually, in addition to
   the full Reset action.
3. Materials get individual checkboxes, **and** each scheduled activity also
   shows one overall "Ready" / "Needs Prep" status badge derived from those
   checkboxes.
