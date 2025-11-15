import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, FileText } from "lucide-react";

export default function TermsOfService() {
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
              <FileText className="w-8 h-8" style={{ color: "#C4B5FD", strokeWidth: 1.5 }} />
            </div>
            <div>
              <h1 className="text-4xl font-bold" style={{
                color: 'var(--text-primary)',
                textShadow: 'var(--heading-shadow)',
                fontFamily: "'Playfair Display', Georgia, serif"
              }}>
                Terms of Service
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
              1. Acceptance of Terms
            </h2>
            <p className="leading-relaxed">
              By accessing and using Saintpaulia Studio ("the App"), you accept and agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use the App.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ 
              color: 'var(--text-primary)',
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              2. Description of Service
            </h2>
            <p className="leading-relaxed mb-3">
              Saintpaulia Studio is a specialized web application designed for African violet enthusiasts to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Track and manage their plant collections</li>
              <li>Document care activities and breeding projects</li>
              <li>Share photos and connect with the community</li>
              <li>Access African violet cultivar information and care guides</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ 
              color: 'var(--text-primary)',
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              3. User Accounts
            </h2>
            <p className="leading-relaxed mb-3">
              You are responsible for maintaining the confidentiality of your account credentials and for all activities 
              that occur under your account. You agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide accurate and complete information during registration</li>
              <li>Keep your account information up to date</li>
              <li>Immediately notify us of any unauthorized use of your account</li>
              <li>Not share your account credentials with others</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ 
              color: 'var(--text-primary)',
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              4. User Content and Data
            </h2>
            <p className="leading-relaxed mb-3">
              You retain ownership of all content you create and upload to the App, including plant records, photos, 
              journal entries, and community posts. By using the App, you grant us a limited license to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Store and display your content within the App</li>
              <li>Share your public community posts with other users</li>
              <li>Use aggregated, anonymized data to improve the service</li>
            </ul>
            <p className="leading-relaxed mt-3">
              You agree not to upload content that is illegal, harmful, offensive, or violates others' rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ 
              color: 'var(--text-primary)',
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              5. Community Guidelines
            </h2>
            <p className="leading-relaxed mb-3">
              When participating in the community features, you agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Be respectful and courteous to other users</li>
              <li>Share accurate information and properly credit sources</li>
              <li>Not spam, harass, or engage in harmful behavior</li>
              <li>Not misrepresent plant cultivars or mislead others</li>
              <li>Respect intellectual property rights of hybridizers and photographers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ 
              color: 'var(--text-primary)',
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              6. Intellectual Property
            </h2>
            <p className="leading-relaxed">
              The App's design, features, code, and branding are owned by Katrina Brye and protected by copyright law. 
              The cultivar database information is sourced from the African Violet Society of America (AVSA) registry 
              and is used for informational purposes only.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ 
              color: 'var(--text-primary)',
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              7. Disclaimer of Warranties
            </h2>
            <p className="leading-relaxed">
              The App is provided "as is" without warranties of any kind. While we strive to provide accurate care 
              information and reliable functionality, we do not guarantee that the App will be error-free, uninterrupted, 
              or that plant care advice will result in successful growing outcomes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ 
              color: 'var(--text-primary)',
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              8. Limitation of Liability
            </h2>
            <p className="leading-relaxed">
              We are not liable for any damages arising from your use of the App, including data loss, plant loss, 
              or any indirect, incidental, or consequential damages.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ 
              color: 'var(--text-primary)',
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              9. Data Export and Account Deletion
            </h2>
            <p className="leading-relaxed">
              You may export your data at any time through the Profile Settings page. If you delete your account, 
              all your personal data and plant records will be permanently removed from our servers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ 
              color: 'var(--text-primary)',
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              10. Changes to Terms
            </h2>
            <p className="leading-relaxed">
              We may update these Terms of Service from time to time. We will notify users of significant changes 
              via email or in-app notification. Continued use of the App after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ 
              color: 'var(--text-primary)',
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              11. Termination
            </h2>
            <p className="leading-relaxed">
              We reserve the right to suspend or terminate accounts that violate these terms, engage in abusive behavior, 
              or misuse the App. You may terminate your account at any time through Profile Settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ 
              color: 'var(--text-primary)',
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>
              12. Contact
            </h2>
            <p className="leading-relaxed">
              For questions about these Terms of Service, please contact us through the app's support channels or 
              reach out to the developer.
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