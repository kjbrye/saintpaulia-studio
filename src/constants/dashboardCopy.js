/**
 * Dashboard copy strings
 *
 * All user-facing text for the dashboard lives here so nothing is hardcoded in
 * components. Data-driven phrases (subtitle, task counts) still come from their
 * own utils/services — this covers the static labels, headings, and links.
 */

export const DASHBOARD_COPY = {
  searchPlaceholder: 'Search plants, notes, tasks…',
  addPlant: 'Add plant',
  notifications: 'Notifications',
  notificationsEmpty: "You're all caught up 🌿",

  hero: {
    greeting: (name) => `Welcome back, ${name}`,
    featuredAlt: 'A plant from your collection',
    changePhoto: 'Change photo',
    picker: {
      title: 'Choose a featured photo',
      subtitle: 'Pick any plant from your library to feature here.',
      auto: 'Use most recent automatically',
      empty: 'Add a photo to a plant to feature it here.',
    },
  },

  careSnapshot: {
    title: 'Care snapshot',
    viewCareLog: 'View care log →',
    needWater: 'Need water',
    needFertilizer: 'Need fertilizer',
    blooming: 'Blooming',
    upToDate: 'Up to date',
  },

  bloomingNow: {
    title: 'Blooming now',
    viewAll: 'View all plants →',
    empty: 'No blooms are open right now — the next flush is on its way.',
    statusHealthy: 'Healthy',
    statusNeedsWater: 'Needs water',
  },

  collection: {
    title: 'Collection at a glance',
    totalPlants: 'Total plants',
    blooming: 'Blooming',
    propagations: 'Propagations',
    // No "hybrids" count exists yet; the breeding crosses count stands in.
    crosses: 'Crosses',
    sports: 'Sports',
  },

  tasks: {
    title: 'Upcoming tasks',
    viewAll: 'View all →',
    empty: "You're all caught up — nothing's due today.",
    water: (n) => `Water ${n} ${n === 1 ? 'plant' : 'plants'}`,
    fertilize: (n) => `Fertilize ${n} ${n === 1 ? 'plant' : 'plants'}`,
    blooms: (n) => `${n} ${n === 1 ? 'bloom' : 'blooms'} to update`,
    dueToday: 'Due today',
    overdue: 'Overdue',
  },

  recentNote: {
    title: 'Recent note',
    viewAll: 'View all →',
    empty: 'No notes yet. Jot down an observation and it will appear here.',
    addNote: 'Add a note',
  },

  // Shown in the sidebar footer and the recent-note card's purple tint block.
  sanctuaryQuote: 'In every leaf, a small act of patience.',
};
