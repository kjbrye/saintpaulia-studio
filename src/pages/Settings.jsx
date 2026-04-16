/**
 * Settings Page
 *
 * User profile and app preferences.
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Bell, Layout, LogOut, AlertTriangle, Eye, Download, Crown, Sparkles, Plus, X, MapPin } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useSettings } from '../hooks/useSettings.jsx';
import { useSubscription } from '../hooks/useSubscription';
import { exportAllData } from '../services/export';
import { createCheckoutSession, createPortalSession } from '../services/subscription';
import { PLANS, STRIPE_PRICES } from '../constants/plans';
import { usePageTitle } from '../hooks/usePageTitle';

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
  usePageTitle('Settings');
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const toast = useToast();
  const { settings, updateSetting } = useSettings();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { subscription, isPremium, plan } = useSubscription();
  const [billingLoading, setBillingLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      // Sentry captures this automatically via ErrorBoundary
      toast.error('Failed to log out. Please try again.');
      setIsLoggingOut(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const count = await exportAllData();
      toast.success(`Exported ${count} file${count > 1 ? 's' : ''} successfully`);
    } catch (error) {
      // Sentry captures this automatically via ErrorBoundary
      toast.error(error.message || 'Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
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

        {/* Subscription Section */}
        <section className="card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Crown size={18} color="var(--copper-500)" />
            <h2 className="text-label">Subscription</h2>
          </div>

          {isPremium ? (
            <div className="space-y-4">
              <div className="card-inset p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-body font-semibold">Premium Plan</p>
                    <p className="text-small text-muted">
                      {subscription?.cancel_at_period_end
                        ? `Downgrades to Free on ${new Date(subscription.current_period_end).toLocaleDateString()}`
                        : subscription?.current_period_end
                          ? `Renews ${new Date(subscription.current_period_end).toLocaleDateString()}`
                          : 'Active'}
                    </p>
                  </div>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold"
                    style={{
                      background: subscription?.cancel_at_period_end ? 'var(--color-warning)' : 'var(--color-success)',
                      color: 'var(--sage-900)',
                    }}
                  >
                    {subscription?.cancel_at_period_end ? 'Canceling' : 'Active'}
                  </span>
                </div>
              </div>
              <button
                className="btn btn-secondary"
                disabled={billingLoading}
                onClick={async () => {
                  setBillingLoading(true);
                  try {
                    const { url } = await createPortalSession();
                    window.location.href = url;
                  } catch {
                    toast.error('Failed to open billing portal');
                    setBillingLoading(false);
                  }
                }}
              >
                {billingLoading ? 'Opening...' : 'Manage Billing'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="card-inset p-4">
                <p className="text-body font-semibold">Free Plan</p>
                <p className="text-small text-muted">
                  25 plant limit. Upgrade for unlimited plants, breeding, propagation, lineage, and analytics.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  className="btn btn-primary"
                  disabled={billingLoading}
                  onClick={async () => {
                    if (!STRIPE_PRICES.annual) return;
                    setBillingLoading(true);
                    try {
                      const { url } = await createCheckoutSession(STRIPE_PRICES.annual);
                      window.location.href = url;
                    } catch {
                      toast.error('Failed to start checkout');
                      setBillingLoading(false);
                    }
                  }}
                >
                  <Sparkles size={16} />
                  {billingLoading ? 'Redirecting...' : `Upgrade Annual — $${PLANS.premium.annualPrice}/yr`}
                </button>
                <button
                  className="btn btn-secondary"
                  disabled={billingLoading}
                  onClick={async () => {
                    if (!STRIPE_PRICES.monthly) return;
                    setBillingLoading(true);
                    try {
                      const { url } = await createCheckoutSession(STRIPE_PRICES.monthly);
                      window.location.href = url;
                    } catch {
                      toast.error('Failed to start checkout');
                      setBillingLoading(false);
                    }
                  }}
                >
                  {billingLoading ? 'Redirecting...' : `Upgrade Monthly — $${PLANS.premium.monthlyPrice}/mo`}
                </button>
              </div>
            </div>
          )}
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

        {/* Custom Fertilizers Section */}
        <CustomListSection
          icon={Sparkles}
          iconColor="var(--purple-400)"
          title="Custom Fertilizers"
          description="Add your own fertilizer types to use when logging care"
          items={settings.customFertilizers || []}
          onChange={(list) => updateSetting('customFertilizers', list)}
          placeholder="e.g. Schultz 10-15-10"
        />

        {/* Custom Locations Section */}
        <CustomListSection
          icon={MapPin}
          iconColor="var(--sage-600)"
          title="Custom Locations"
          description="Add your own locations to use when placing plants"
          items={settings.customLocations || []}
          onChange={(list) => updateSetting('customLocations', list)}
          placeholder="e.g. Kitchen Window, Basement Rack"
        />

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

        {/* Accessibility Section */}
        <section className="card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Eye size={18} color="var(--sage-600)" />
            <h2 className="text-label">Accessibility</h2>
          </div>
          <p className="text-small text-muted mb-4">
            Adjust the display to meet your visual needs (WCAG compliant)
          </p>

          <div className="space-y-4">
            <ToggleRow
              label="High contrast"
              description="Increases text and border contrast for readability"
              checked={settings.highContrast}
              onChange={(v) => updateSetting('highContrast', v)}
            />
            <ToggleRow
              label="Reduce motion"
              description="Minimizes animations and transitions"
              checked={settings.reducedMotion}
              onChange={(v) => updateSetting('reducedMotion', v)}
            />
            <ToggleRow
              label="Larger text"
              description="Increases base font size throughout the app"
              checked={settings.largeText}
              onChange={(v) => updateSetting('largeText', v)}
            />
          </div>
        </section>

        {/* Data Export */}
        <section className="card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Download size={18} color="var(--sage-600)" />
            <h2 className="text-label">Data Export</h2>
          </div>
          <p className="text-small text-muted mb-4">
            Download all your data as CSV files — plants, care logs, bloom logs, health logs,
            journal entries, propagations, and breeding crosses.
          </p>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Download size={18} />
            {isExporting ? 'Exporting...' : 'Export All Data'}
          </button>
        </section>

        {/* Danger Zone */}
        <section className="card p-6 border-copper-400/30">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} color="var(--copper-500)" />
            <h2 className="text-label" style={{ color: 'var(--copper-600)' }}>
              Danger Zone
            </h2>
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
        <p className="text-center text-small text-muted mt-8">Saintpaulia Studio v0.1.0</p>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-8 max-w-sm w-full">
            <h2 className="heading heading-lg mb-2">Log out?</h2>
            <p className="text-muted mb-6">Are you sure you want to log out of your account?</p>
            <div className="flex justify-end gap-3">
              <button className="btn btn-secondary" onClick={() => setShowLogoutConfirm(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleLogout} disabled={isLoggingOut}>
                {isLoggingOut ? 'Logging out...' : 'Log Out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1">
        <span className="text-body">{label}</span>
        {description && <p className="text-small text-muted">{description}</p>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className="a11y-toggle"
        data-checked={checked ? 'true' : 'false'}
      >
        <span className="a11y-toggle-thumb" />
      </button>
    </div>
  );
}

function CustomListSection({ icon: Icon, iconColor, title, description, items, onChange, placeholder }) {
  const [newName, setNewName] = useState('');

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    if (items.some((f) => f.toLowerCase() === trimmed.toLowerCase())) return;
    onChange([...items, trimmed]);
    setNewName('');
  };

  const handleRemove = (index) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <section className="card p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={18} color={iconColor} />
        <h2 className="text-label">{title}</h2>
      </div>
      <p className="text-small text-muted mb-4">{description}</p>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder={placeholder}
          className="input flex-1 py-2 text-small"
          maxLength={50}
        />
        <button
          onClick={handleAdd}
          disabled={!newName.trim()}
          className="btn btn-primary flex items-center gap-1"
        >
          <Plus size={16} />
          Add
        </button>
      </div>

      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((name, index) => (
            <div
              key={index}
              className="card-inset px-4 py-2 flex items-center justify-between"
            >
              <span className="text-body">{name}</span>
              <button
                onClick={() => handleRemove(index)}
                className="icon-container icon-container-sm"
                aria-label={`Remove ${name}`}
              >
                <X size={14} style={{ color: 'var(--copper-500)' }} />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
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
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
