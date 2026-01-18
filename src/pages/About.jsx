/**
 * About Page - App introduction and information
 */

import { Link } from 'react-router-dom';
import { ArrowLeft, Flower2, Heart, Sparkles, BookOpen, Droplets, BarChart3 } from 'lucide-react';

const features = [
  { icon: Flower2, label: 'Collection Management', desc: 'Organize and track your entire violet collection' },
  { icon: Droplets, label: 'Care Tracking', desc: 'Log watering, fertilizing, and grooming with smart reminders' },
  { icon: BookOpen, label: 'Breeding Tracker', desc: 'Document crosses and track lineage', coming: true },
  { icon: BarChart3, label: 'Analytics', desc: 'Insights into your care patterns and plant health', coming: true },
];

export default function About() {
  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex items-center gap-4 mb-8">
          <Link to="/">
            <button className="icon-container">
              <ArrowLeft size={20} style={{ color: 'var(--sage-600)' }} />
            </button>
          </Link>
          <div>
            <h1 className="heading heading-xl">About Saintpaulia Studio</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Your companion for violet care</p>
          </div>
        </header>

        {/* Introduction */}
        <section className="card p-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="icon-container-purple" style={{ width: 48, height: 48 }}>
              <Flower2 size={24} style={{ color: 'var(--purple-400)' }} />
            </div>
            <h2 className="heading heading-lg pt-2">What is Saintpaulia Studio?</h2>
          </div>
          <p className="leading-relaxed mb-4" style={{ color: 'var(--text-primary)' }}>
            Saintpaulia Studio is a personal collection manager built for African violet
            enthusiasts. Whether you have a windowsill trio or a light-stand full of blooms,
            this app helps you keep track of every plant, every care task, and every glorious
            flowering moment.
          </p>
          <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Born from a love of these fuzzy-leaved beauties, Saintpaulia Studio is designed
            to make plant care feel less like a chore and more like the peaceful hobby it
            should be.
          </p>
        </section>

        {/* Features */}
        <section className="card p-8">
          <h2 className="heading heading-lg mb-6">Features</h2>
          <div className="space-y-4">
            {features.map(({ icon: Icon, label, desc, coming }) => (
              <div key={label} className="flex items-start gap-4">
                <div className="icon-container" style={{ width: 40, height: 40, flexShrink: 0 }}>
                  <Icon size={20} style={{ color: 'var(--sage-600)' }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{label}</span>
                    {coming && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ background: 'var(--purple-100)', color: 'var(--purple-600)' }}>
                        <Sparkles size={10} /> Coming Soon
                      </span>
                    )}
                  </div>
                  <p className="text-small" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* About African Violets */}
        <section className="card p-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="icon-container-cream" style={{ width: 48, height: 48 }}>
              <BookOpen size={24} style={{ color: 'var(--copper-500)' }} />
            </div>
            <h2 className="heading heading-lg pt-2">About African Violets</h2>
          </div>
          <p className="leading-relaxed mb-4" style={{ color: 'var(--text-primary)' }}>
            African violets (<em>Saintpaulia</em>) are beloved houseplants native to the
            coastal mountains of East Africa. First discovered in 1892, they've since become
            one of the world's most popular flowering houseplants.
          </p>
          <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Known for their velvety leaves and jewel-toned blooms, African violets thrive
            under indoor conditions and can bloom nearly year-round with proper care.
            Collectors appreciate the incredible variety of flower forms, colors, and
            leaf patterns available.
          </p>
        </section>

        {/* Version / Credits */}
        <section className="card p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart size={16} style={{ color: 'var(--copper-500)' }} />
            <span className="text-small font-medium" style={{ color: 'var(--text-secondary)' }}>
              Version 2.0
            </span>
          </div>
          <p className="text-small" style={{ color: 'var(--text-secondary)' }}>
            Made with love for violet enthusiasts everywhere
          </p>
        </section>
      </div>
    </div>
  );
}
