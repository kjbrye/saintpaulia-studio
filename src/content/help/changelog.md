---
title: Changelog
description: A running log of releases, improvements, and fixes
icon: History
order: 2
---

A running log of releases, improvements, and fixes. Updated with each release, in the repo alongside the code.

## About version numbers

Saintpaulia Studio follows **SemVer** (Semantic Versioning). A version looks like `MAJOR.MINOR.PATCH`:

- **MAJOR (X.0.0)** — breaking changes. Example: a complete UI overhaul, removal of existing features, or a change to how user data is handled that breaks backwards compatibility.
- **MINOR (0.X.0)** — backwards-compatible changes. Example: adding a new dashboard, a new Settings page, or improving search without changing how the rest of the app works.
- **PATCH (0.0.X)** — backwards-compatible bug fixes. Example: fixing a broken button, correcting a typo, or improving performance behind the scenes.

---

## 1.6.0

**Added**
- Repot due-date tracking, so repotting joins the other care types with its own schedule.

**Changed**
- Revamped the Settings page with sidebar navigation and contrast fixes for readability.

**Fixed**
- The batch toolbar now shows "Select all" immediately.
- Premium access is retained when a customer has another active subscription.
- The fertilizing care icon now uses sage instead of copper.

## 1.5.1

**Fixed**
- Treatment care actions now show up in the Care Log and plant detail care history.

## 1.5.0

**Added**
- Care Log calendar view — month grid with colored dots per care type, prev/next/today navigation, and an inline drawer showing the selected day's logs. Toggle between calendar and list in the page header; calendar is the default. All filters (care type, plant, search, date range) are shared across both views.
- Dashboard Sports stat row — total sport count above Propagations, in purple, linked to the Sports page.

**Fixed**
- Lazy-load chunk failures no longer crash to the error boundary on a single transient error. Each route import now retries up to 3 times with backoff before falling through to a one-shot reload.
- The Stage Advance modal no longer silently swallows errors. It now awaits the mutation and surfaces failure messages inline.

**Notes**
- Earlier the same day a `1.4.1` was tagged that included the calendar feature; corrected to `1.5.0` because new features warrant a minor bump under SemVer.

## 1.4.0

**Added**
- Sports feature — track bloom and foliage variations descended from a parent plant, with stability status and observations.
- Bi-color and multi-color bloom picker on plants, with a canonical description field.

## 1.3.0

**Added**
- Notes feature with premium photo attachments.
- Treatment care type for logging pest and disease treatments.
- Plant status badges (struggling, recovering, dormant) in the library.
- Legal page with data policy and terms, linked from About.

## 1.2.0

**Added**
- AVSA registration number and hybridizer fields on the new-plant form.

## 1.1.0

**Added**
- Global keyboard shortcuts.

**Fixed**
- Account rate limiting now allows up to 300 new users per hour instead of 4.

## 1.0.0

- Beta launch.
