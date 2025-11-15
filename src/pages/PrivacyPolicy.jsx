import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("Collection")}>
            <button className="glass-button w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ color: "var(--accent)" }}>
              <ArrowLeft className="w-5 h-5" style={{ strokeWidth: 2 }} />
            </button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="glass-card w-16 h-16 rounded-3xl flex items-center justify-center glow-violet p-2">
              <Shield className="w-8 h-8" style={{ color: "#A7F3D0", strokeWidth: 1.5 }} />
            </div>
            <div>
              <h1 className="text-4xl font-bold" style={{
                color: 'var(--text-primary)',
                textShadow: 'var(--heading-shadow)',
                fontFamily: "'Playfair Display', Georgia, serif"
              }}>
                Privacy Policy
              </h1>
              <p className="text-muted" style={{ color: 'var(--text-secondary)' }}>
                Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="glass-card rounded-3xl p-8 space-y-6" style={{ color: 'var(--text-secondary)' }}>
          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ 
              color: 'var(--text-primary)',
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              Introduction
            </h2>
            <p className="leading-relaxed">
              Saintpaulia Studio ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy 
              explains how we collect, use, disclose, and safeguard your information when you use our application.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ 
              color: 'var(--text-primary)',
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              Information We Collect
            </h2>
            <p className="leading-relaxed mb-3">
              We collect information that you provide directly to us when using Saintpaulia Studio:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Account Information:</strong> Email address, name, and profile picture</li>
              <li><strong>Plant Data:</strong> Plant records, photos, care logs, journal entries, and breeding project details</li>
              <li><strong>Community Content:</strong> Posts, comments, and interactions with other users</li>
              <li><strong>Preferences:</strong> Theme settings, dashboard customization, and notification preferences</li>
              <li><strong>Usage Data:</strong> How you interact with the app, features used, and session information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ 
              color: 'var(--text-primary)',
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              How We Use Your Information
            </h2>
            <p className="leading-relaxed mb-3">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide, maintain, and improve the App's functionality</li>
              <li>Store and display your plant collection and related data</li>
              <li>Enable community features and facilitate user interactions</li>
              <li>Send notifications about care reminders and app updates</li>
              <li>Analyze usage patterns to improve user experience</li>
              <li>Respond to your support requests and communications</li>
              <li>Ensure security and prevent fraud or abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ 
              color: 'var(--text-primary)',
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              Data Sharing and Disclosure
            </h2>
            <p className="leading-relaxed mb-3">
              We do not sell your personal information. We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Community Features:</strong> Content you choose to share publicly (posts, photos) is visible to other users</li>
              <li><strong>Service Providers:</strong> Third-party services that help us operate the app (hosting, storage, analytics)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect rights, property, or safety</li>
              <li><strong>Business Transfers:</strong> In connection with any merger, sale, or acquisition</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ 
              color: 'var(--text-primary)',
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              Data Security
            </h2>
            <p className="leading-relaxed">
              We implement appropriate technical and organizational measures to protect your information against 
              unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over 
              the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ 
              color: 'var(--text-primary)',
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              Your Rights and Choices
            </h2>
            <p className="leading-relaxed mb-3">
              You have the following rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Access:</strong> View and review your personal data within the app</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Export:</strong> Download a copy of your data through Profile Settings</li>
              <li><strong>Deletion:</strong> Request deletion of your account and all associated data</li>
              <li><strong>Opt-Out:</strong> Manage notification preferences in settings</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ 
              color: 'var(--text-primary)',
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              Data Retention
            </h2>
            <p className="leading-relaxed">
              We retain your information for as long as your account is active or as needed to provide services. 
              When you delete your account, all your personal data and plant records are permanently removed from 
              our servers. Some aggregated, anonymized data may be retained for analytics purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ 
              color: 'var(--text-primary)',
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              Cookies and Tracking
            </h2>
            <p className="leading-relaxed">
              We use essential cookies and similar technologies to maintain your session and remember your preferences. 
              We do not use third-party advertising cookies or sell your data to advertisers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ 
              color: 'var(--text-primary)',
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              Children's Privacy
            </h2>
            <p className="leading-relaxed">
              Saintpaulia Studio is not intended for children under 13 years of age. We do not knowingly collect 
              personal information from children under 13. If we become aware that we have collected such information, 
              we will take steps to delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ 
              color: 'var(--text-primary)',
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              Changes to This Privacy Policy
            </h2>
            <p className="leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of significant changes via 
              email or in-app notification. Your continued use of the App after changes become effective constitutes 
              acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ 
              color: 'var(--text-primary)',
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              Contact Us
            </h2>
            <p className="leading-relaxed">
              If you have questions or concerns about this Privacy Policy or our data practices, please contact us 
              through the app's support channels.
            </p>
          </section>
        </div>

        {/* Back to Info */}
        <div className="mt-6 text-center">
          <Link to={createPageUrl("Info")}>
            <button className="glass-button px-6 py-3 rounded-2xl font-semibold"
              style={{ color: "var(--text-secondary)" }}>
              ← Back to Info & Help
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}