/**
 * Settings Page
 *
 * User profile and app preferences.
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Bell, Layout, LogOut, AlertTriangle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSettings } from '../hooks/useSettings.jsx';

const WATERING_OPTIONS = [
  { value: 5, label: '5 days' },
  { value: 7, label: '7 days' },
  { value: 10, label: '10 days' },
  { value: 14, label: '14 days' },
];

const FERTILIZING_OPTIONS = [
  { value: 7, label: '7 days' },
  { value: 14, label: '14 days' },
  { value: 21, label: '21 days' },
  { value: 30, label: '30 days' },
];

const GROOMING_OPTIONS = [
  { value: 7, label: '7 days' },
  { value: 14, label: '14 days' },
  { value: 21, label: '21 days' },
];

const VIEW_OPTIONS = [
  { value: 'grid', label: 'Grid' },
  { value: 'list', label: 'List' },
];

const PER_PAGE_OPTIONS = [
  { value: 12, label: '12' },
  { value: 24, label: '24' },
  { value: 48, label: '48' },
  { value: 100, label: '100' },
];

export default function Settings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { settings, updateSetting } = useSettings();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
      setIsLoggingOut(false);
    }
  };

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      })
    : 'Unknown';

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="flex items-center gap-4 mb-8">
          <Link to="/">
            <button className="icon-container">
              <ArrowLeft size={20} color="var(--sage-600)" />
            </button>
          </Link>
          <h1 className="heading heading-xl">Settings</h1>
        </header>

        {/* Account Section */}
        <section className="card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <User size={18} color="var(--sage-600)" />
            <h2 className="text-label">Account</h2>
          </div>

          <div className="card-inset p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <User size={24} color="var(--purple-400)" />
            </div>
            <div>
              <p className="text-body font-semibold">{user?.email || 'Guest User'}</p>
              <p className="text-small text-muted">Member since {memberSince}</p>
            </div>
          </div>
        </section>

        {/* Care Reminders Section */}
        <section className="card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={18} color="var(--sage-600)" />
            <h2 className="text-label">Care Reminders</h2>
          </div>
          <p className="text-small text-muted mb-4">
            Set when plants should be flagged as needing care
          </p>

          <div className="space-y-4">
            <SettingRow
              label="Watering reminder"
              value={settings.wateringThreshold}
              options={WATERING_OPTIONS}
              onChange={(v) => updateSetting('wateringThreshold', v)}
            />
            <SettingRow
              label="Fertilizing reminder"
              value={settings.fertilizingThreshold}
              options={FERTILIZING_OPTIONS}
              onChange={(v) => updateSetting('fertilizingThreshold', v)}
            />
            <SettingRow
              label="Grooming reminder"
              value={settings.groomingThreshold}
              options={GROOMING_OPTIONS}
              onChange={(v) => updateSetting('groomingThreshold', v)}
            />
          </div>
        </section>

        {/* Display Section */}
        <section className="card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Layout size={18} color="var(--sage-600)" />
            <h2 className="text-label">Display</h2>
          </div>

          <div className="space-y-4">
            <SettingRow
              label="Default library view"
              value={settings.defaultView}
              options={VIEW_OPTIONS}
              onChange={(v) => updateSetting('defaultView', v)}
            />
            <SettingRow
              label="Plants per page"
              value={settings.plantsPerPage}
              options={PER_PAGE_OPTIONS}
              onChange={(v) => updateSetting('plantsPerPage', v)}
            />
          </div>
        </section>

        {/* Danger Zone */}
        <section className="card p-6 border-copper-400/30">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} color="var(--copper-500)" />
            <h2 className="text-label" style={{ color: 'var(--copper-600)' }}>Danger Zone</h2>
          </div>

          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="btn btn-secondary flex items-center gap-2"
          >
            <LogOut size={18} />
            Log Out
          </button>
        </section>

        {/* App Version */}
        <p className="text-center text-small text-muted mt-8">
          Saintpaulia Studio v2.0.0
        </p>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-8 max-w-sm w-full">
            <h2 className="heading heading-lg mb-2">Log out?</h2>
            <p className="text-muted mb-6">
              Are you sure you want to log out of your account?
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="btn btn-secondary"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? 'Logging out...' : 'Log Out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingRow({ label, value, options, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-body">{label}</span>
      <select
        className="input py-2 px-4 min-w-[120px]"
        value={value}
        onChange={(e) => {
          const val = e.target.value;
          onChange(isNaN(val) ? val : Number(val));
        }}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
