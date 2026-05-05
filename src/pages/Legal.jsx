/**
 * Legal Page - Data Policy and Terms of Service
 */

import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, FileText } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';

export default function Legal() {
  usePageTitle('Legal');
  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex items-center gap-4 mb-8">
          <Link to="/about">
            <button className="icon-container">
              <ArrowLeft size={20} style={{ color: 'var(--sage-600)' }} />
            </button>
          </Link>
          <div>
            <h1 className="heading heading-xl">Legal</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Data policy and terms of service</p>
          </div>
        </header>

        {/* Data Policy */}
        <section id="data-policy" className="card p-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="icon-container-purple" style={{ width: 48, height: 48 }}>
              <Shield size={24} style={{ color: 'var(--purple-400)' }} />
            </div>
            <h2 className="heading heading-lg pt-2">Data Policy</h2>
          </div>
          <div className="space-y-4" style={{ color: 'var(--text-primary)' }}>
            <p className="leading-relaxed">
              Saintpaulia Studio is built around your personal violet collection. We collect only
              what's needed to run the app: your account email, the data you enter (plants,
              photos, care logs, journal entries, breeding records), and basic usage diagnostics
              to keep the app stable.
            </p>
            <h3 className="heading heading-md">What we store</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Account information (email, authentication identifiers)</li>
              <li>Collection data you enter into the app</li>
              <li>Photos you upload, stored in our secure cloud storage</li>
              <li>Anonymized error reports to diagnose crashes (via Sentry)</li>
            </ul>
            <h3 className="heading heading-md">How we use it</h3>
            <p className="leading-relaxed">
              Your data is used solely to provide the Saintpaulia Studio service to you. We do not
              sell, rent, or share your personal data or collection records with third parties for
              marketing purposes.
            </p>
            <h3 className="heading heading-md">Your control</h3>
            <p className="leading-relaxed">
              You can export or delete your data at any time. Deleting your account removes your
              records from our active systems; backup copies are purged on a rolling schedule.
            </p>
            <h3 className="heading heading-md">Contact</h3>
            <p className="leading-relaxed">
              Questions about your data? Reach out at{' '}
              <a
                href="mailto:support@saintpauliastudio.com"
                style={{ color: 'var(--purple-500)', textDecoration: 'underline' }}
              >
                support@saintpauliastudio.com
              </a>
              .
            </p>
          </div>
        </section>

        {/* Terms of Service */}
        <section id="terms" className="card p-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="icon-container-cream" style={{ width: 48, height: 48 }}>
              <FileText size={24} style={{ color: 'var(--copper-500)' }} />
            </div>
            <h2 className="heading heading-lg pt-2">Terms of Service</h2>
          </div>
          <div className="space-y-4" style={{ color: 'var(--text-primary)' }}>
            <h3 className="heading heading-md">Use of the service</h3>
            <p className="leading-relaxed">
              Saintpaulia Studio is provided as a tool to help you manage your African violet
              collection. By using the app, you agree to use it for lawful, personal purposes and
              not to attempt to disrupt, reverse-engineer, or abuse the service.
            </p>
            <h3 className="heading heading-md">Your content</h3>
            <p className="leading-relaxed">
              You retain ownership of all data and photos you upload. You grant us a limited
              license to store and display that content solely so the app can function for you.
            </p>
            <h3 className="heading heading-md">Subscriptions</h3>
            <p className="leading-relaxed">
              Some features may require a paid subscription. Subscription terms, including
              billing, renewal, and cancellation, are presented at the point of purchase.
            </p>
            <h3 className="heading heading-md">Disclaimer</h3>
            <p className="leading-relaxed">
              The service is provided "as is" without warranties of any kind. We do our best to
              keep your data safe and the service running smoothly, but we cannot guarantee
              uninterrupted availability or error-free operation.
            </p>
            <h3 className="heading heading-md">Changes</h3>
            <p className="leading-relaxed">
              These terms may be updated as the app evolves. Continued use of the service after
              changes constitutes acceptance of the updated terms.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
