import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Mail, Send } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me().catch(() => null)
  });

  React.useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        name: currentUser.full_name || "",
        email: currentUser.email || ""
      }));
    }
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await base44.integrations.Core.SendEmail({
        to: "support@saintpauliastudio.com",
        subject: `Contact Form: ${formData.subject}`,
        body: `
Name: ${formData.name}
Email: ${formData.email}
Subject: ${formData.subject}

Message:
${formData.message}
        `
      });

      toast.success("Message sent!", {
        description: "We'll get back to you as soon as possible."
      });

      setFormData({
        name: currentUser?.full_name || "",
        email: currentUser?.email || "",
        subject: "",
        message: ""
      });
    } catch (error) {
      toast.error("Failed to send message", {
        description: "Please try again later or contact us directly."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
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
              <Mail className="w-8 h-8" style={{ color: "#C4B5FD", strokeWidth: 1.5 }} />
            </div>
            <div>
              <h1 className="text-4xl font-bold" style={{
                color: 'var(--text-primary)',
                textShadow: 'var(--heading-shadow)',
                fontFamily: "'Playfair Display', Georgia, serif"
              }}>
                Contact Us
              </h1>
              <p className="text-muted" style={{ color: 'var(--text-secondary)' }}>
                Get in touch with the Saintpaulia Studio team
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="glass-card rounded-3xl p-8">
          <p className="text-base leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
            Have questions, feedback, or need support? We'd love to hear from you! Fill out the form below 
            and we'll get back to you as soon as possible.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Your Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="glass-input w-full px-4 py-3 rounded-2xl"
                placeholder="Enter your name"
                style={{ color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="glass-input w-full px-4 py-3 rounded-2xl"
                placeholder="your@email.com"
                style={{ color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Subject
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
                className="glass-input w-full px-4 py-3 rounded-2xl"
                placeholder="What's this about?"
                style={{ color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Message
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                rows={6}
                className="glass-input w-full px-4 py-3 rounded-2xl resize-none"
                placeholder="Tell us more..."
                style={{ color: 'var(--text-primary)' }}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="glass-accent-lavender w-full px-6 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
              style={{ color: '#F0EBFF' }}
            >
              {isSubmitting ? (
                "Sending..."
              ) : (
                <>
                  <Send className="w-5 h-5" style={{ strokeWidth: 2 }} />
                  Send Message
                </>
              )}
            </button>
          </form>
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