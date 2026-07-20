---
title: FAQ and troubleshooting
description: Common questions and solutions, organized by topic
icon: HelpCircle
order: 1
---

Common questions and solutions, organized by topic. If your question isn't covered here, see **Contact**.

## Account and general

**Is Saintpaulia Studio free?**
It uses a freemium model. Free accounts can manage a collection of up to 25 plants with full care tracking. Premium unlocks unlimited plants plus breeding, propagation, lineage and pedigree, analytics, sports tracking, photo attachments on notes, and multiple photos per plant.

**Can I use the app on my phone?**
Yes. Saintpaulia Studio is a web app optimized for mobile browsers. Care logging was specifically designed for use at the plant shelf.

**How do I change my email or password?**
Open **Settings** from the app menu and use the Account section. (The old "Profile & Settings" page is now simply Settings.)

**Is my data backed up?**
Your data is stored in the cloud via Supabase, so you don't need to worry about data loss from device issues. We still recommend exporting your data periodically from **Settings → Data** as a local backup.

## Plant library

**What's the difference between cultivar name and nickname?**
The cultivar name is the official registered variety name (e.g., "Optimara EverGrace"). The nickname is your personal label (e.g., "Desk Violet"). If set, the nickname displays in place of the cultivar name in most views, but the cultivar name is always preserved.

**Can I have multiple plants of the same cultivar?**
Yes. Each plant is a separate record. Use nicknames to tell them apart.

**How do I delete a plant?**
Open the plant's detail page, enter edit mode, and use the delete option. Note that deleting a plant also removes its care log history.

**Can I switch between grid and list view?**
Yes. The Plant Library has a toggle for grid view (cards) and list view (compact text). You can also narrow the collection with the filter chips along the top, or open the filter drawer for more precise filtering.

## Care tracking

**What if I forgot to log care yesterday?**
Care logs currently record the timestamp when you tap the button. You can note a past date in the notes field. Backdating support may come in a future update.

**How are care thresholds set?**
Each plant is flagged for care based on how long it's been since the last action. The thresholds are configurable in **Settings → Care** — the defaults are 7 days for watering, 14 days for fertilizing, and 7 days for grooming, which match typical African violet care schedules. Adjust them to fit your own routine and growing conditions.

**Can I track custom care types like rotating or misting?**
The app currently supports five care types — watering, fertilizing, grooming, repotting, and treatment. Fully custom care types are still planned. You can, however, save your own fertilizer, treatment, and location options in **Settings → Care**.

## Breeding and propagation

**What's the difference between a clone and offspring?**
Propagating a leaf produces a **clone** — genetically identical to the parent, since it shares the parent's genome. A cross produces genetically new **offspring**, combining two parents through pollination. The distinction is modeled explicitly: clones appear in a separate ribbon on the lineage page, while offspring appear as descendants in the pedigree tree.

**Why does the pod parent go first in cross notation?**
This is the standard convention in botanical nomenclature. The maternal (pod) parent is listed first because some traits are maternally inherited.

**How long does the whole breeding process take?**
From pollination to evaluating seedlings, expect roughly 12–18 months. The pod alone takes 6–9 months to ripen, and seedlings need most of a year of growth before they bloom and can be meaningfully evaluated.

**My completed cross disappeared. Where is it?**
Completed crosses move out of the active view. Use the status filter to find them. When a cross completes, it prompts you to add offspring — this is the intended flow, and the cross record with its full stage log is preserved for reference.

**Can I archive a cross instead of completing it?**
Yes. Archived status is for crosses you want to keep on record but aren't actively working on.

**I made a mistake on a breeding stage. Can I undo it?**
Stage advances are recorded in the stage log. Reach out through **Contact** if you need a correction.

**Are generation labels calculated automatically?**
Yes. When you add offspring from a cross, the generation label (F1, F2, etc.) is determined automatically based on the parents' generations.

## Troubleshooting

**The app won't load or shows a blank screen.**
Refresh the page. If the issue persists, clear your browser cache or try a different browser. On mobile, check your internet connection.

**My plant photo won't upload.**
Make sure the image is a supported format (JPG, PNG, WebP) and not excessively large. Try reducing the resolution.

**I can't see my plants on the dashboard.**
Confirm you're logged into the same account you used to create them. Plants sync automatically across devices on the same account.

**Care status shows "overdue" even though I just cared for the plant.**
The status only updates when you log the action through the app. If you watered but didn't tap the Water button, the app doesn't know about it.
