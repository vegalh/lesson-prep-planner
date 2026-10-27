# Lesson Prep Planner

**Live site:** https://vegalh.github.io/lesson-prep-planner/

A planning tool for a Montessori/early-childhood classroom teacher. It
stores a fixed catalog of practical-life activities (based on real
classroom photos — see [`reference-photos/`](./reference-photos)) and lets
the teacher schedule them onto dates, track which materials are ready for
each scheduled activity, and see at a glance how much total prep time each
day needs.

## What it does

- Ships with 16 starter activities (food prep, care of self, care of the
  environment, fine motor, and nature/sensory play), each with an age
  range, duration, prep time, and materials list.
- Lets the teacher schedule any starter activity onto a date.
- Tracks a **separate, independent materials checklist** for every
  scheduled entry — scheduling "Watering Plants" twice gives two entries,
  each with its own ready/not-ready checkboxes.
- Calculates **total prep minutes per day** and shows an overall
  **Ready / Needs Prep** status for each scheduled activity.
- Lets the teacher filter the upcoming-activities list by date, remove a
  single scheduled entry, or reset the whole plan.
- Saves scheduled entries to `localStorage` so the plan survives a page
  refresh. The starter catalog itself is fixed and never changes.

## How to use it

1. Open the [live site](https://vegalh.github.io/lesson-prep-planner/).
2. In **Schedule an Activity**, pick an activity and a date, then
   **+ Add to Plan**.
3. In **Upcoming Activities**, check off each material as you prepare it —
   the status badge flips from "Needs Prep" to "Ready" once every material
   is checked.
4. Use the **Overview** section's date dropdown to narrow the list to
   Today, Tomorrow, This Week, or This Month — or leave it on "All
   Upcoming." A "Past (Outdated)" option appears automatically whenever an
   entry's date has passed, so overdue activities can be found and cleaned up.
5. Use **Remove** on a card to drop just that one scheduled entry, or
   **Reset Plan** to clear everything and start over. The starter activity
   dropdown always stays fully populated, even after a reset.

## Project docs

This project followed a strict process before any code was written:
[`PROPOSAL.md`](./PROPOSAL.md) (written solely by the student) →
[`PRD.md`](./PRD.md) (data model, actions, calculated outputs, validation,
page states) → design trials in [`design-trials/`](./design-trials) →
[`DESIGN.md`](./DESIGN.md) (chosen visual direction) →
[`AGENTS.md`](./AGENTS.md) (build constraints) → the actual tool
(`index.html`, `styles.css`, `app.js`, `activities-data.js`).

## Where the implementation differed from my expectation

- I originally expected to land on one design direction right away, but it
  took five trial pages before the final look was right. The first
  direction (warm serif, card grid) and a cooler/denser alternative were
  both rejected before I asked to match the colors and component style of
  my other project, **rootmapmvp**.
- I wanted to reuse rootmapmvp's fonts exactly, but that project loads
  "Nunito" and "Caveat" from Google Fonts over a CDN, which this project's
  rules don't allow. I substituted a system font stack instead, and a
  cursive stand-in I tried for headings (`Brush Script MT`) turned out to
  be hard to read, so the final build uses a bold weight of the regular
  body font for headings instead.
- The trial pages had a decorative "Practical Life" tag on each card, but
  that category isn't actually part of the data model defined in
  `PRD.md`, so it was left out of the real build rather than inventing a
  new field that wasn't planned for.

## AI-output reflection

This project was built with AI assistance in small, committed steps.

**A case where I changed the AI's first output:** The first version of the
chosen design direction (Trial 5) used a cursive stand-in font for
headings and had a layout bug where material checkboxes were stretched
full-width and misaligned from their labels. I flagged both problems
("the cursive heading font is bad and the spacing is not working, go and
check"). The fix — replacing the cursive font with bold sans-serif
headings, and scoping the `width: 100%` CSS rule to text/date inputs only
instead of all inputs — is in commit
[`5d6250a`](https://github.com/vegalh/lesson-prep-planner/commit/5d6250aec880dfba886881c616c9fb9ed135b7c0),
which also added `DESIGN.md` documenting the fix as a pitfall to avoid
going forward.

**A case where I accepted the first output:** The toggle-material,
remove-entry, filter-by-date, and reset interactions in
[`508d72f`](https://github.com/vegalh/lesson-prep-planner/commit/508d72f619123c99ef3bb88637b26571e1425b3a)
worked as given on the first try. I verified this by testing it live in
the browser before accepting it: checking each material flipped the status
badge from "Needs Prep" to "Ready," the date filter narrowed the list
without changing the saved data, and Reset cleared the plan and
`localStorage` while leaving the starter activity dropdown fully
populated.
