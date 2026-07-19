/**
 * AccountPane
 *
 * User info, preferred name (explicit save), and log out.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useSettings } from '../../../hooks/useSettings.jsx';
import { useToast } from '../../../hooks/useToast';
import SettingsCard from '../SettingsCard';
import { SETTINGS_COPY } from '../../../constants/settings';

const copy = SETTINGS_COPY.account;

function PreferredNameField({ value, onSave }) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const trimmed = draft.trim();
  const dirty = trimmed !== value.trim();

  const handleSave = () => {
    if (!dirty) return;
    onSave(trimmed);
  };

  return (
    <div>
      <label htmlFor="preferred-name" className="text-body block mb-1">
        {copy.preferredName.label}
      </label>
      <p className="settings-desc mb-2">{copy.preferredName.help}</p>
      <div className="flex gap-2">
        <input
          id="preferred-name"
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          placeholder={copy.preferredName.placeholder}
          className="input flex-1 py-2"
          maxLength={50}
        />
        <button onClick={handleSave} disabled={!dirty} className="btn btn-primary">
          {copy.preferredName.save}
        </button>
      </div>
    </div>
  );
}

export default function AccountPane() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { settings, updateSetting } = useSettings();
  const toast = useToast();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Unknown';

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      navigate('/login');
    } catch {
      toast.error('Failed to log out. Please try again.');
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <SettingsCard label={copy.label}>
        <div className="card-inset p-4 flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
            <User size={24} color="var(--purple-400)" />
          </div>
          <div>
            <p className="text-body font-semibold">{user?.email || 'Guest User'}</p>
            <p className="text-small text-muted">
              {copy.memberSince} {memberSince}
            </p>
          </div>
        </div>

        <PreferredNameField
          value={settings.displayName || ''}
          onSave={(v) => updateSetting('displayName', v)}
        />

        <div className="settings-divider mt-6 pt-6">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="btn btn-secondary flex items-center gap-2"
          >
            <LogOut size={18} />
            {copy.logOut}
          </button>
        </div>
      </SettingsCard>

      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-8 max-w-sm w-full">
            <h2 className="heading heading-lg mb-2">{copy.logoutConfirm.title}</h2>
            <p className="text-muted mb-6">{copy.logoutConfirm.body}</p>
            <div className="flex justify-end gap-3">
              <button className="btn btn-secondary" onClick={() => setShowLogoutConfirm(false)}>
                {copy.logoutConfirm.cancel}
              </button>
              <button className="btn btn-primary" onClick={handleLogout} disabled={isLoggingOut}>
                {isLoggingOut ? 'Logging out...' : copy.logoutConfirm.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
