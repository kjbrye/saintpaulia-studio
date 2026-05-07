# Changelog

A running record of notable changes per release. Versions follow [Semantic Versioning](https://semver.org/) — MAJOR.MINOR.PATCH:
- **MAJOR**: breaking changes
- **MINOR**: new features (backward-compatible)
- **PATCH**: bug fixes only

---

## 1.5.0 — 2026-05-07

### Added
- **Care Log calendar view** — month grid with colored dots per care type, prev/next/today nav, and an inline drawer showing the selected day's logs. Toggle between calendar and list in the page header; calendar is the default. All filters (care type, plant, search, date range) are shared across both views.
- **Dashboard Sports stat row** — total sport count above Propagations, in purple, linked to `/sports`.

### Fixed
- **Lazy-load chunk failures no longer crash to the ErrorBoundary on a single transient error.** Each route import now retries up to 3 times with backoff before falling through to a one-shot reload.
- **Stage Advance modal silently swallowed errors.** It now awaits the mutation and surfaces failure messages inline so the user knows what happened.

### Notes
- Earlier this same day a 1.4.1 was tagged that included the calendar feature; corrected to 1.5.0 because new features warrant a minor bump under SemVer.

---

## 1.4.0 — 2026-05-07

### Added
- **Sports feature** — track bloom and foliage variations descended from a parent plant, with stability status and observations.
- **Bi-color and multi-color bloom picker** on plants with a canonical description field.

---

## 1.3.0 — 2026-05-04 → 2026-05-06

### Added
- **Notes feature** with premium photo attachments.
- **Treatment care type** for logging pest/disease treatments.
- **Plant status badges** (struggling, recovering, dormant) in the library.
- **Legal page** with data policy and terms; linked from About.

---

## 1.2.1 — 2026-05-04

### Added
- AVSA registration number and hybridizer fields on the new-plant form.

---

## 1.1.0 — 2026-05-03

### Added
- Global keyboard shortcuts.

---

## 0.1.0 — 2026-04-04

- Beta launch.
