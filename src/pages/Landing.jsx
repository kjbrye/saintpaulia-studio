/**
 * Landing Page
 *
 * Public marketing page shown to signed-out users at `/`.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Flower2,
  Droplets,
  Sparkles,
  Scissors,
  Heart,
  GitBranch,
  ImageIcon,
} from 'lucide-react';
import { Button, Card, Seal } from '../components/ui';
import { usePageTitle } from '../hooks/usePageTitle';

const features = [
  {
    icon: Flower2,
    label: 'Collection Management',
    desc: 'Catalog every plant with photos, AVSA numbers, and acquisition history.',
    container: 'icon-container',
    iconColor: 'var(--sage-600)',
  },
  {
    icon: Droplets,
    label: 'Smart Care Tracking',
    desc: 'Log watering, fertilizing, and treatments. See what needs attention today.',
    container: 'icon-container',
    iconColor: 'var(--sage-600)',
  },
  {
    icon: Sparkles,
    label: 'Bloom Timeline',
    desc: 'Record bloom events with start and end dates and bloom forms. Track your best performers.',
    container: 'icon-container-purple',
    iconColor: 'var(--purple-400)',
  },
  {
    icon: Scissors,
    label: 'Propagation Studio',
    desc: 'Track leaf cuttings from cutting to established plantlet.',
    container: 'icon-container',
    iconColor: 'var(--sage-600)',
  },
  {
    icon: Heart,
    label: 'Breeding Tracker',
    desc: 'Document crosses, track stages, and link offspring to parents.',
    container: 'icon-container-cream',
    iconColor: 'var(--copper-500)',
  },
  {
    icon: GitBranch,
    label: 'Lineage & Pedigree',
    desc: 'Explore ancestry trees and watch your genetics work across generations.',
    container: 'icon-container-purple',
    iconColor: 'var(--purple-400)',
  },
];

const screenshots = [
  { src: '/screenshots/dashboard.png', label: 'Dashboard' },
  { src: '/screenshots/library.png', label: 'Plant Library' },
  { src: '/screenshots/lineage.png', label: 'Lineage View' },
];

function ScreenshotPreview({ src, label }) {
  const [errored, setErrored] = useState(false);

  return (
    <Card variant="elevated" className="overflow-hidden flex flex-col">
      <div
        className="w-full flex items-center justify-center aspect-[2732/2560]"
        style={{
          background: 'var(--gradient-sage-inset)',
          border: '1px solid var(--sage-400)',
          boxShadow: 'var(--shadow-sage-inset)',
        }}
      >
        {errored ? (
          <div className="flex flex-col items-center justify-center gap-2 px-4">
            <div className="icon-container" style={{ width: 48, height: 48 }}>
              <ImageIcon size={22} style={{ color: 'var(--sage-600)' }} />
            </div>
            <span className="text-small font-medium" style={{ color: 'var(--text-secondary)' }}>
              {label}
            </span>
          </div>
        ) : (
          <img
            src={src}
            alt={`${label} screenshot`}
            onError={() => setErrored(true)}
            className="w-full h-full object-contain block"
          />
        )}
      </div>
      <div className="p-4 text-center">
        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
          {label}
        </span>
      </div>
    </Card>
  );
}

export default function Landing() {
  usePageTitle('Welcome');

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-6">
        {/* Top nav */}
        <nav className="flex items-center justify-between mb-12">
          <Link to="/" className="flex items-center gap-3">
            <Seal src="/seal.png" size="sm" />
            <span
              className="heading text-xl"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}
            >
              Saintpaulia Studio
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/about">
              <Button variant="ghost" size="sm">
                About
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
          <div className="space-y-6 order-2 md:order-1">
            <h1 className="heading heading-xl">
              Your African violet collection, beautifully tracked.
            </h1>
            <p
              className="leading-relaxed text-lg"
              style={{ color: 'var(--text-secondary)' }}
            >
              A personal collection manager built for violet enthusiasts. Track every plant, log
              every care moment, and celebrate every glorious bloom.
            </p>
            <p className="leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Whether you have a windowsill trio or a light-stand full of blooms, Saintpaulia
              Studio helps you keep track of every plant, every care task, and every cross.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/login?mode=signup">
                <Button variant="primary" size="lg">
                  Get Started
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="ghost" size="lg">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex justify-center order-1 md:order-2">
            <Seal src="/seal.png" size="xl" className="!w-64 !h-64 md:!w-80 md:!h-80" />
          </div>
        </section>

        {/* Features */}
        <section className="mb-24">
          <div className="text-center mb-10">
            <h2 className="heading heading-lg mb-2">Built for violet collectors</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Every feature designed around how violet growers actually work.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, label, desc, container, iconColor }) => (
              <Card key={label} variant="elevated" className="p-6">
                <div className={container} style={{ width: 48, height: 48, marginBottom: 16 }}>
                  <Icon size={22} style={{ color: iconColor }} />
                </div>
                <h3
                  className="font-semibold mb-2"
                  style={{ color: 'var(--text-primary)', fontSize: '1.1rem' }}
                >
                  {label}
                </h3>
                <p className="text-small leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {desc}
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* Visual showcase */}
        <section className="mb-24">
          <div className="text-center mb-10">
            <h2 className="heading heading-lg mb-2">See it in action</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              A glimpse of the dashboards, library, and lineage views.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {screenshots.map((shot) => (
              <ScreenshotPreview key={shot.src} src={shot.src} label={shot.label} />
            ))}
          </div>
        </section>

        {/* Closing CTA */}
        <section className="mb-16">
          <Card variant="accent" className="p-10 text-center">
            <h2 className="heading heading-lg mb-3">Ready to start your collection?</h2>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              Create a free account and add your first plant in under a minute.
            </p>
            <Link to="/login?mode=signup">
              <Button variant="primary" size="lg">
                Get Started
              </Button>
            </Link>
          </Card>
        </section>

        {/* Footer */}
        <footer
          className="mt-16 pt-8 flex flex-wrap items-center justify-between gap-4"
          style={{ borderTop: 'var(--border-sage-light)' }}
        >
          <div className="flex flex-wrap items-center gap-5 text-small">
            <Link to="/about" style={{ color: 'var(--text-secondary)' }}>
              About
            </Link>
            <Link to="/legal" style={{ color: 'var(--text-secondary)' }}>
              Privacy & Terms
            </Link>
            <Link to="/help" style={{ color: 'var(--text-secondary)' }}>
              Help Center
            </Link>
          </div>
          <span className="text-small" style={{ color: 'var(--text-muted)' }}>
            Made with love for violet enthusiasts everywhere
          </span>
        </footer>
      </div>
    </div>
  );
}
