/**
 * Settings copy & configuration
 *
 * All user-facing strings and option lists for the Settings page live here so
 * the page and its panes stay free of inline copy.
 */

import { User, Crown, Droplet, Layout, Database } from 'lucide-react';
import { version } from '../../package.json';

// Auto-tracks the version in package.json so the sidebar never goes stale.
export const APP_VERSION = `Saintpaulia Studio v${version}`;

/** Sidebar / mobile tab-strip navigation. `id` also drives the URL (/settings/:id). */
export const SETTINGS_NAV = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'subscription', label: 'Subscription', icon: Crown },
  { id: 'care', label: 'Care', icon: Droplet },
  { id: 'display', label: 'Display', icon: Layout },
  { id: 'data', label: 'Data', icon: Database },
];

export const DEFAULT_PANE = 'account';

/** Care-reminder dropdown options — unchanged from the previous build. */
export const WATERING_OPTIONS = [
  { value: 5, label: '5 days' },
  { value: 7, label: '7 days' },
  { value: 10, label: '10 days' },
  { value: 14, label: '14 days' },
];

export const FERTILIZING_OPTIONS = [
  { value: 7, label: '7 days' },
  { value: 14, label: '14 days' },
  { value: 21, label: '21 days' },
  { value: 30, label: '30 days' },
];

export const GROOMING_OPTIONS = [
  { value: 7, label: '7 days' },
  { value: 14, label: '14 days' },
  { value: 21, label: '21 days' },
];

export const REPOTTING_OPTIONS = [
  { value: 90, label: '3 months' },
  { value: 180, label: '6 months' },
  { value: 270, label: '9 months' },
  { value: 365, label: '12 months' },
];

export const VIEW_OPTIONS = [
  { value: 'grid', label: 'Grid' },
  { value: 'list', label: 'List' },
];

export const PER_PAGE_OPTIONS = [
  { value: 12, label: '12' },
  { value: 24, label: '24' },
  { value: 48, label: '48' },
  { value: 100, label: '100' },
];

/** Config for the three tabs of the merged custom-options card. */
export const CUSTOM_OPTION_TABS = [
  { id: 'fertilizers', label: 'Fertilizers', settingKey: 'customFertilizers', placeholder: 'Schultz 10-15-10' },
  { id: 'treatments', label: 'Treatments', settingKey: 'customTreatments', placeholder: 'Neem oil' },
  { id: 'locations', label: 'Locations', settingKey: 'customLocations', placeholder: 'Kitchen window' },
];

export const SETTINGS_COPY = {
  pageTitle: 'Settings',

  account: {
    label: 'Account',
    memberSince: 'Member since',
    preferredName: {
      label: 'Preferred name',
      help: 'Shown on your dashboard welcome message. Leave blank to use your email.',
      placeholder: 'Alex',
      save: 'Save',
    },
    logOut: 'Log out',
    logoutConfirm: {
      title: 'Log out?',
      body: 'Are you sure you want to log out of your account?',
      cancel: 'Cancel',
      confirm: 'Log Out',
    },
  },

  subscription: {
    label: 'Subscription',
    premiumPlan: 'Premium Plan',
    freePlan: 'Free Plan',
    freeBlurb: '25 plant limit. Upgrade for unlimited plants, breeding, propagation, lineage, and analytics.',
    manageBilling: 'Manage billing',
    active: 'Active',
    canceling: 'Canceling',
  },

  care: {
    reminders: {
      label: 'Care reminders',
      description: 'When plants get flagged as needing care',
      watering: 'Watering',
      fertilizing: 'Fertilizing',
      grooming: 'Grooming',
      repotting: 'Repotting',
    },
    custom: {
      label: 'Custom options',
      description: 'Your own fertilizers, treatments, and locations, available across the app',
      add: 'Add',
    },
  },

  display: {
    display: {
      label: 'Display',
      defaultView: 'Default library view',
      plantsPerPage: 'Plants per page',
    },
    accessibility: {
      label: 'Accessibility',
      description: 'Adjust the display to meet your visual needs (WCAG compliant)',
      highContrast: {
        label: 'High contrast',
        help: 'Increases text and border contrast for readability',
      },
      reduceMotion: {
        label: 'Reduce motion',
        help: 'Minimizes animations and transitions',
      },
      largerText: {
        label: 'Larger text',
        help: 'Increases base font size throughout the app',
      },
    },
  },

  data: {
    label: 'Data',
    import: {
      heading: 'Import plants',
      description:
        'Bring an existing collection over from a CSV or XLSX spreadsheet. Map your columns, review your plants, and import in one batch.',
      button: 'Import',
    },
    export: {
      heading: 'Export all data',
      description:
        'Download all your data as CSV files — plants, care logs, bloom logs, health logs, journal entries, propagations, and breeding crosses.',
      button: 'Export',
      exporting: 'Exporting...',
    },
  },
};
