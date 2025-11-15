
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, BookOpen, Sparkles, Heart, Users, Beaker, Library, Calendar, BarChart3, Package, Star, HelpCircle, Lightbulb, CheckCircle, ChevronRight, X, RotateCcw, Database } from "lucide-react";
import { useTooltips } from "../components/onboarding/TooltipManager";
import { toast } from "sonner";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e3cd78523fb5fba0a8466/632f6e485_PlantLogos.png";

const ONBOARDING_STEPS = [
{
  icon: Library,
  title: "Build Your Collection",
  description: "Start by adding your first African violet. Track cultivar details, photos, care schedules, and lineage.",
  link: "AddPlant",
  linkText: "Add Your First Plant",
  color: "#C4B5FD"
},
{
  icon: Sparkles,
  title: "Log Care Activities",
  description: "Record watering, fertilizing, grooming, and repotting. The app automatically tracks intervals and sends reminders.",
  color: "#A7F3D0"
},
{
  icon: Calendar,
  title: "View Your Care Calendar",
  description: "See all upcoming and past care tasks in a beautiful calendar view. Never miss a watering day!",
  link: "CareCalendar",
  linkText: "Open Calendar",
  color: "#7DD3FC"
},
{
  icon: Beaker,
  title: "Track Breeding Projects",
  description: "Document hybridization and propagation projects, track offspring, and record experimental results.",
  link: "Projects",
  linkText: "Start a Project",
  color: "#E9D5FF"
},
{
  icon: Users,
  title: "Join the Community",
  description: "Share your beautiful blooms, discover new cultivars, and connect with fellow African violet enthusiasts.",
  link: "CommunityFeed",
  linkText: "Explore Community",
  color: "#FCA5A5"
},
{
  icon: BarChart3,
  title: "Track Your Progress",
  description: "View detailed analytics about your collection growth, care patterns, and plant health trends.",
  link: "AnalyticsDashboard",
  linkText: "View Analytics",
  color: "#FCD34D"
}];


const FEATURES = [
{
  icon: Library,
  title: "Comprehensive Plant Library",
  description: "Track every detail about your African violets including cultivar names, AVSA numbers, hybridizers, bloom characteristics, and care schedules.",
  color: "#C4B5FD"
},
{
  icon: Sparkles,
  title: "Smart Care Tracking",
  description: "Log watering, fertilizing, grooming, and repotting with automatic interval calculations and reminders.",
  color: "#A7F3D0"
},
{
  icon: Calendar,
  title: "Care Calendar",
  description: "Visual calendar showing all upcoming and past care tasks with color-coded indicators and overdue alerts.",
  color: "#7DD3FC"
},
{
  icon: Heart,
  title: "Health Monitoring",
  description: "Track plant health observations, symptoms, and issues with photo documentation and AI-powered insights.",
  color: "#FCA5A5"
},
{
  icon: Beaker,
  title: "Breeding & Propagation",
  description: "Document hybridization projects, track offspring traits, and manage propagation batches with detailed logs.",
  color: "#E9D5FF"
},
{
  icon: Users,
  title: "Community Sharing",
  description: "Connect with other growers, share your blooms, discover new cultivars, and learn from the community.",
  color: "#FCA5A5"
},
{
  icon: Package,
  title: "Supply Inventory",
  description: "Track soil, fertilizers, pots, and other supplies with low stock alerts and usage history.",
  color: "#FCD34D"
},
{
  icon: BarChart3,
  title: "Analytics Dashboard",
  description: "View collection growth, care frequency, health trends, and blooming patterns with beautiful charts.",
  color: "#A7F3D0"
},
{
  icon: Star,
  title: "Wishlist Management",
  description: "Keep track of cultivars you want to acquire with priority levels, notes, and purchase tracking.",
  color: "#FCD34D"
},
{
  icon: Database,
  title: "Cultivar Database",
  description: "Explore the complete AVSA registry with 19,000+ registered African violet cultivars. Search and filter to discover new varieties.",
  color: "#E9D5FF"
}];


export default function Info() {
  const { resetTooltips } = useTooltips();
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleResetTooltips = () => {
    resetTooltips();
    toast.success("Tooltips Reset!", {
      description: "All contextual tooltips will appear again as you navigate the app."
    });
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
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
              <img
                src={LOGO_URL}
                alt="Saintpaulia Studio"
                className="w-full h-full object-contain" />

            </div>
            <div>
              <h1 className="text-4xl font-bold" style={{
                color: 'var(--text-primary)',
                textShadow: 'var(--heading-shadow)',
                fontFamily: "'Playfair Display', Georgia, serif"
              }}>
                Information & Help
              </h1>
              <p className="text-muted" style={{ color: 'var(--text-secondary)' }}>
                Learn about Saintpaulia Studio and how to get started
              </p>
            </div>
          </div>
        </div>

        {/* Quick Links - More Prominent */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Link to={createPageUrl("CareGuide")}>
            <div className="glass-card rounded-3xl p-8 hover:shadow-2xl transition-all group cursor-pointer">
              <div className="flex items-start gap-5">
                <div className="glass-accent-moss w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-8 h-8" style={{ color: "#A7F3D0", strokeWidth: 1.8 }} />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3" style={{
                    color: "var(--text-primary)",
                    fontFamily: "'Playfair Display', Georgia, serif"
                  }}>
                    African Violet Care Guide
                  </h3>
                  <p className="text-base mb-4 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    Complete guide covering light, watering, soil, temperature, humidity, fertilizing, common problems, and expert tips.
                  </p>
                  <div className="flex items-center gap-2 text-base font-semibold" style={{ color: "#A7F3D0" }}>
                    <span className="text-pink-300">Read the Guide</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          </Link>

          <Link to={createPageUrl("SaintpauliaDatabase")}>
            <div className="glass-card rounded-3xl p-8 hover:shadow-2xl transition-all group cursor-pointer">
              <div className="flex items-start gap-5">
                <div className="glass-accent-lavender w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Database className="w-8 h-8" style={{ color: "#F0EBFF", strokeWidth: 1.8 }} />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3" style={{
                    color: "var(--text-primary)",
                    fontFamily: "'Playfair Display', Georgia, serif"
                  }}>
                    Saintpaulia Database
                  </h3>
                  <p className="text-base mb-4 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    Explore the complete AVSA registry with 19,000+ registered cultivars. Search by name, hybridizer, or characteristics.
                  </p>
                  <div className="flex items-center gap-2 text-base font-semibold" style={{ color: "#F0EBFF" }}>
                    <span className="text-violet-400">Browse Database</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Getting Started & Reset Tooltips - Side by Side */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={() => setShowOnboarding(true)}
            className="glass-card rounded-3xl p-6 hover:shadow-2xl transition-all group cursor-pointer text-left">

            <div className="flex items-start gap-4">
              <div className="glass-accent-lavender w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-6 h-6" style={{ color: "#F0EBFF", strokeWidth: 1.8 }} />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-2" style={{
                  color: "var(--text-primary)",
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}>
                  Getting Started Guide
                </h2>
                <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
                  New to the app? Follow our step-by-step guide to learn all the features.
                </p>
                <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: "#F0EBFF" }}>
                  <span className="text-violet-400">Show Me Around</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </button>

          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-start gap-4">
              <div className="glass-accent-moss w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0">
                <RotateCcw className="w-6 h-6" style={{ color: "#FFFFFF", strokeWidth: 1.8 }} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2" style={{
                  color: "var(--text-primary)",
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}>
                  Reset Contextual Tooltips
                </h3>
                <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                  Show all helpful tooltips again as you navigate through the app.
                </p>
                <button
                  onClick={handleResetTooltips}
                  className="glass-accent-lavender px-5 py-2.5 rounded-2xl font-semibold flex items-center gap-2 hover:shadow-lg transition-all"
                  style={{ color: "#F0EBFF" }}>

                  <RotateCcw className="w-4 h-4" style={{ strokeWidth: 2 }} />
                  Reset Tooltips
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="glass-card rounded-3xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{
            color: "var(--text-primary)",
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            <Heart className="w-6 h-6" style={{ color: "#FCA5A5", strokeWidth: 1.8 }} />
            About Saintpaulia Studio
          </h2>
          
          <div className="space-y-4" style={{ color: "var(--text-secondary)" }}>
            <p className="text-base leading-relaxed">
              <strong style={{ color: "var(--text-primary)" }}>Saintpaulia Studio</strong> is the first specialized app designed exclusively for African violet enthusiasts. Unlike generic plant trackers, it provides precision tools for managing cultivar collections, documenting hybridization and propagation projects, tracking detailed care schedules, and monitoring plant health with photo documentation—all while connecting you with a passionate community of serious growers.
            </p>
            
            <p className="text-base leading-relaxed">
              Created by Katrina when existing plant apps couldn't support the specific data tracking needs of violet collectors and hybridizers, Saintpaulia Studio was built from the ground up with African violets in mind. This ever-evolving project honors her grandmother's passion for these beautiful plants and her grandfather's dedication to problem-solving—<em>inspired by heritage, designed for precision.</em>
            </p>
          </div>
        </div>

        {/* Key Features */}
        <div className="glass-card rounded-3xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6" style={{
            color: "var(--text-primary)",
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            Key Features
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {FEATURES.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="glass-button rounded-2xl p-5">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-xl flex-shrink-0"
                      style={{
                        background: `${feature.color}20`,
                        border: `1px solid ${feature.color}40`
                      }}>

                      <Icon className="w-5 h-5" style={{ color: feature.color, strokeWidth: 1.8 }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold mb-1" style={{ color: "var(--text-primary)" }}>
                        {feature.title}
                      </h3>
                      <p className="text-sm" style={{ color: "var(--text-secondary)", opacity: 0.9 }}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>);

            })}
          </div>
        </div>

        {/* Support Section */}
        <div className="glass-card rounded-3xl p-8">
          <h2 className="text-2xl font-bold mb-6" style={{
            color: "var(--text-primary)",
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            Need Help?
          </h2>
          
          <div className="space-y-4">
            <div className="glass-button rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <HelpCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: "#C4B5FD", strokeWidth: 1.8 }} />
                <div>
                  <h3 className="font-bold mb-1" style={{ color: "var(--text-primary)" }}>
                    Frequently Asked Questions
                  </h3>
                  <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
                    Find answers to common questions in our Care Guide's FAQ section.
                  </p>
                  <Link to={createPageUrl("CareGuide")}>
                    <span className="text-sm font-semibold" style={{ color: "#C4B5FD" }}>
                      View FAQs →
                    </span>
                  </Link>
                </div>
              </div>
            </div>

            <div className="glass-button rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: "#FCD34D", strokeWidth: 1.8 }} />
                <div>
                  <h3 className="font-bold mb-1" style={{ color: "var(--text-primary)" }}>
                    Pro Tips & Best Practices
                  </h3>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    Learn advanced techniques and expert advice for growing show-quality African violets.
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-button rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: "#A7F3D0", strokeWidth: 1.8 }} />
                <div>
                  <h3 className="font-bold mb-1" style={{ color: "var(--text-primary)" }}>
                    Community Support
                  </h3>
                  <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
                    Connect with experienced growers in our community feed. Ask questions, share experiences, and learn together.
                  </p>
                  <Link to={createPageUrl("CommunityFeed")}>
                    <span className="text-sm font-semibold" style={{ color: "#A7F3D0" }}>
                      Join Community →
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Attribution */}
        <div className="mt-8 text-center">
          <p className="text-sm" style={{ color: "var(--text-muted)", opacity: 0.7 }}>
            Made with {" "}
            <Heart className="w-3 h-3 inline" style={{ fill: "#FCA5A5", color: "#FCA5A5" }} />
            {" "} for the African Violet community
          </p>
          <p className="text-xs mt-2" style={{ color: "var(--text-muted)", opacity: 0.6 }}>
            © {new Date().getFullYear()} Katrina Brye. All rights reserved.
          </p>
        </div>
      </div>

      {/* Onboarding Modal */}
      {showOnboarding &&
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-card rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8"
        style={{
          background: "linear-gradient(135deg, rgba(79, 63, 115, 0.95) 0%, rgba(60, 46, 90, 0.95) 100%)",
          border: "1px solid rgba(227, 201, 255, 0.4)"
        }}>
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="glass-accent-lavender w-14 h-14 rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-7 h-7" style={{ color: "#F0EBFF", strokeWidth: 1.8 }} />
                </div>
                <div>
                  <h2 className="text-3xl font-bold" style={{
                  color: "#F5F3FF",
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}>
                    Welcome to Saintpaulia Studio!
                  </h2>
                  <p style={{ color: "#DDD6FE" }}>
                    Let's get you started with these simple steps
                  </p>
                </div>
              </div>
              <button
              onClick={() => setShowOnboarding(false)}
              className="glass-button w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ color: "#DDD6FE" }}>

                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {ONBOARDING_STEPS.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="glass-button rounded-2xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-xl mb-2"
                        style={{
                          background: `${step.color}20`,
                          border: `1px solid ${step.color}40`
                        }}>

                          <Icon className="w-6 h-6" style={{ color: step.color, strokeWidth: 1.8 }} />
                        </div>
                        <div
                        className="text-center text-xs font-bold"
                        style={{ color: step.color }}>

                          Step {idx + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold mb-2" style={{
                        color: "#F5F3FF",
                        fontFamily: "'Playfair Display', Georgia, serif"
                      }}>
                          {step.title}
                        </h3>
                        <p className="text-sm mb-3" style={{ color: "#DDD6FE" }}>
                          {step.description}
                        </p>
                        {step.link &&
                      <Link to={createPageUrl(step.link)}>
                            <button
                          onClick={() => setShowOnboarding(false)}
                          className="glass-accent-moss px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2"
                          style={{ color: "#A7F3D0" }}>

                              <span>{step.linkText}</span>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </Link>
                      }
                      </div>
                    </div>
                  </div>);

            })}
            </div>

            <div className="mt-6 pt-6" style={{ borderTop: "1px solid rgba(227, 201, 255, 0.2)" }}>
              <div className="flex items-center justify-center gap-2 text-sm" style={{ color: "#A7F3D0" }}>
                <CheckCircle className="w-4 h-4" />
                <span className="font-semibold">You're all set! Start exploring your new plant companion.</span>
              </div>
            </div>
          </div>
        </div>
      }
    </div>);

}
