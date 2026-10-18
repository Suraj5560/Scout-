import React, { useState } from 'react';
import { ArrowRight, Compass, ShieldCheck, Zap, Sliders, Eye, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { MatchRing } from '../components/ui/MatchRing';
import { VerdictBadge, CategoryBadge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import type { Verdict } from '../lib/types';

export const Styleguide: React.FC = () => {
  const [sliderScore, setSliderScore] = useState(88);
  const [selectedVerdict, setSelectedVerdict] = useState<Verdict>('eligible');
  const [ringKey, setRingKey] = useState(0);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  const toggleReducedMotion = () => {
    setIsReducedMotion(!isReducedMotion);
    document.documentElement.classList.toggle('reduce-motion', !isReducedMotion);
  };

  const colors = [
    { name: '--bg', hex: '#09090B', label: 'Canvas Base', role: 'Main background' },
    { name: '--bg-raised', hex: '#0F0F12', label: 'Raised Background', role: 'Input and elevated containers' },
    { name: '--surface', hex: '#131317', label: 'Surface', role: 'Default card background' },
    { name: '--surface-2', hex: '#1A1A20', label: 'Surface 2', role: 'Hover and active surfaces' },
    { name: '--border', hex: 'rgba(255,255,255,0.08)', label: 'Border', role: 'Subtle separators' },
    { name: '--border-strong', hex: 'rgba(255,255,255,0.16)', label: 'Border Strong', role: 'Hover states and controls' },
    { name: '--text', hex: '#EDEDEF', label: 'Text', role: 'Primary titles and content' },
    { name: '--text-muted', hex: '#8C8C96', label: 'Text Muted', role: 'Descriptions and body' },
    { name: '--text-faint', hex: '#5B5B65', label: 'Text Faint', role: 'Subtle captions and borders' },
    { name: '--signal', hex: '#D4FF3A', label: 'Signal Lime', role: 'Primary CTA, live states, scores' },
    { name: '--ok', hex: '#4ADE80', label: 'Eligible Green', role: 'Confirmed criteria' },
    { name: '--amber', hex: '#FFB84D', label: 'Likely Amber', role: 'Probable qualifications' },
    { name: '--ice', hex: '#7CC4FF', label: 'Ice Blue', role: 'Stage B agents & links' },
    { name: '--coral', hex: '#FF6B4A', label: 'Ineligible Coral', role: 'Unmet criteria & urgent deadlines' },
  ];

  return (
    <div className="relative min-h-screen text-text pb-36">
      {/* Background ambient lighting and grid */}
      <div className="scout-atmosphere" />
      <div className="scout-grid" />
      <div className="scout-grain" />

      {/* Top Bar */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-bg/80 border-b border-border">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg tracking-tight text-text">scout</span>
            <span className="w-1.5 h-1.5 rounded-full bg-signal shadow-[0_0_8px_#D4FF3A]" />
            <span className="mono-label text-[10px] text-text-faint ml-2 px-2 py-0.5 rounded border border-border">
              DESIGN SYSTEM / STYLEGUIDE
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleReducedMotion}
              className={`text-xs px-3 py-1.5 rounded-pill font-mono border transition-all ${
                isReducedMotion 
                  ? 'bg-signal/10 border-signal text-signal' 
                  : 'bg-surface border-border text-text-muted hover:text-text'
              }`}
            >
              {isReducedMotion ? 'Reduced Motion: ON' : 'Reduced Motion: OFF'}
            </button>
            <Button variant="secondary" size="sm" onClick={() => window.location.href = '/'}>
              View Landing
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-[1200px] mx-auto px-6 pt-16 space-y-24">
        
        {/* Intro */}
        <section className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-white/[0.04] border border-border">
            <Compass className="w-3.5 h-3.5 text-signal" strokeWidth={1.5} />
            <span className="mono-label text-[11px] text-signal">SCOUT ATELIER</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-text">
            Dark Editorial <span className="serif-emphasis text-signal">Mission Control</span>
          </h1>
          <p className="text-text-muted max-w-2xl text-lg leading-relaxed">
            Strict token-driven design system engineered for high-density intelligence feeds. 
            Near-black canvas, 1px crisp geometry, zero generic gradients, and one electric lime signal accent used with restraint.
          </p>
        </section>

        {/* 1. Color Palette Tokens */}
        <section className="space-y-6">
          <div className="border-b border-border pb-3">
            <span className="mono-label text-text-muted">01 / PALETTE TOKENS</span>
            <h2 className="text-2xl font-semibold text-text mt-1">Foundational Colors</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {colors.map((c) => (
              <div 
                key={c.name}
                className="group relative p-3 rounded-[14px] bg-surface border border-border transition-all duration-200 hover:border-border-strong hover:-translate-y-0.5"
              >
                <div 
                  className="w-full h-14 rounded-lg mb-2.5 border border-white/5 relative overflow-hidden"
                  style={{ backgroundColor: c.hex.startsWith('rgba') ? c.hex : c.hex }}
                >
                  {c.name === '--signal' && (
                    <div className="absolute inset-0 bg-signal shadow-[0_0_20px_rgba(212,255,58,0.4)]" />
                  )}
                </div>
                <div className="font-mono text-xs font-semibold text-text truncate">{c.name}</div>
                <div className="font-mono text-[10px] text-text-muted uppercase tracking-wider">{c.hex}</div>
                <div className="text-[11px] text-text-faint mt-1 line-clamp-1">{c.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. Typography Hierarchy */}
        <section className="space-y-6">
          <div className="border-b border-border pb-3">
            <span className="mono-label text-text-muted">02 / TYPOGRAPHY PAIRING</span>
            <h2 className="text-2xl font-semibold text-text mt-1">Inter + Instrument Serif + JetBrains Mono</h2>
          </div>

          <Card className="space-y-8 p-8">
            <div className="space-y-2">
              <span className="mono-label text-text-faint">DISPLAY (INTER 600 + SERIF ITALIC EMPHASIS)</span>
              <div className="display-title text-text">
                Every opportunity. <span className="serif-emphasis text-signal">Found</span> before the deadline.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-border">
              <div className="space-y-2">
                <span className="mono-label text-text-faint">EDITORIAL SUBHEAD & BODY (INTER 16-18PX / 1.6 LH)</span>
                <p className="text-text-muted text-base leading-relaxed">
                  Autonomous web agents navigate fragmented fellowship portals, dissect legal eligibility criteria against your background, and draft ready-to-refine statements of purpose.
                </p>
              </div>

              <div className="space-y-3">
                <span className="mono-label text-text-faint">DATA LABELS & TELEMETRY (JETBRAINS MONO 11PX)</span>
                <div className="flex flex-wrap gap-3">
                  <div className="p-2.5 rounded-lg bg-bg-raised border border-border">
                    <span className="mono-label text-text-faint block">LATENCY</span>
                    <span className="font-mono text-sm text-signal font-semibold">2.41s</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-bg-raised border border-border">
                    <span className="mono-label text-text-faint block">PARALLEL AGENTS</span>
                    <span className="font-mono text-sm text-text font-semibold">10 ACTIVE</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-bg-raised border border-border">
                    <span className="mono-label text-text-faint block">DEADLINE RESOLUTION</span>
                    <span className="font-mono text-sm text-ok font-semibold">ISO-8601 VERIFIED</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* 3. Magnetic Buttons & Controls */}
        <section className="space-y-6">
          <div className="border-b border-border pb-3">
            <span className="mono-label text-text-muted">03 / INTERACTION (A6 MOTION SPEC)</span>
            <h2 className="text-2xl font-semibold text-text mt-1">Magnetic Buttons & Pill States</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="space-y-4">
              <span className="mono-label text-text-faint block">PRIMARY MAGNETIC (SPRING 300 / 20)</span>
              <p className="text-xs text-text-muted">
                Pulls dynamically within 80px radius (clamped to max 8px). Arrow transitions on hover.
              </p>
              <div className="pt-2 flex flex-col gap-3 items-start">
                <Button variant="primary" magnetic withArrow size="lg">
                  Run Scout Radar
                </Button>
                <Button variant="primary" magnetic withArrow size="md">
                  Discover Opportunities
                </Button>
                <Button variant="primary" size="sm">
                  Quick Search
                </Button>
              </div>
            </Card>

            <Card className="space-y-4">
              <span className="mono-label text-text-faint block">SECONDARY & OUTLINE</span>
              <p className="text-xs text-text-muted">
                Transparent with border-strong or surface base. Smooth hover lift.
              </p>
              <div className="pt-2 flex flex-col gap-3 items-start">
                <Button variant="secondary" size="lg" withArrow>
                  Browse Sources
                </Button>
                <Button variant="secondary" size="md">
                  View Demo Run
                </Button>
                <Button variant="outline" size="sm">
                  Filter by Category
                </Button>
              </div>
            </Card>

            <Card className="space-y-4">
              <span className="mono-label text-text-faint block">GHOST & STATUS CHIPS</span>
              <p className="text-xs text-text-muted">
                Accessible focus rings (2px lime outline) and disabled state behaviors.
              </p>
              <div className="pt-2 flex flex-col gap-3 items-start">
                <Button variant="ghost" size="md">
                  Documentation
                </Button>
                <Button variant="primary" disabled size="md">
                  Processing Run...
                </Button>
                <div className="flex items-center gap-2 text-xs font-mono text-signal">
                  <span className="w-2 h-2 rounded-full bg-signal animate-pulse" />
                  AGENTS CONNECTED
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* 4. Match Rings & Score Math (A8) */}
        <section className="space-y-6">
          <div className="border-b border-border pb-3 flex items-center justify-between">
            <div>
              <span className="mono-label text-text-muted">04 / DATA VISUALIZATION (A8)</span>
              <h2 className="text-2xl font-semibold text-text mt-1">SVG Match Rings & Count-Up</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={() => setRingKey(prev => prev + 1)}
            >
              Replay Animation
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" key={ringKey}>
            <Card className="p-8 space-y-6">
              <span className="mono-label text-text-faint block">PRESET VERDICT RINGS (56PX / 3PX STROKE)</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-bg-raised border border-border">
                  <MatchRing score={94} verdict="eligible" />
                  <span className="mono-label text-[10px] text-ok">94% Eligible</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-bg-raised border border-border">
                  <MatchRing score={78} verdict="likely" />
                  <span className="mono-label text-[10px] text-amber">78% Likely</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-bg-raised border border-border">
                  <MatchRing score={45} verdict="unclear" />
                  <span className="mono-label text-[10px] text-text-muted">45% Unclear</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-bg-raised border border-border">
                  <MatchRing score={18} verdict="ineligible" />
                  <span className="mono-label text-[10px] text-coral">18% Ineligible</span>
                </div>
              </div>
            </Card>

            <Card className="p-8 space-y-6">
              <span className="mono-label text-text-faint block">INTERACTIVE TEST BENCH</span>
              <div className="flex items-center gap-6">
                <MatchRing score={sliderScore} verdict={selectedVerdict} size={72} strokeWidth={4} />
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-text-muted">Score: {sliderScore}%</span>
                    <span className="text-signal uppercase">{selectedVerdict}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderScore}
                    onChange={(e) => setSliderScore(Number(e.target.value))}
                    className="w-full accent-signal cursor-pointer"
                  />
                  <div className="flex gap-2">
                    {(['eligible', 'likely', 'unclear', 'ineligible'] as Verdict[]).map((v) => (
                      <button
                        key={v}
                        onClick={() => setSelectedVerdict(v)}
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                          selectedVerdict === v 
                            ? 'bg-signal/10 border-signal text-signal' 
                            : 'border-border text-text-muted hover:text-text'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* 5. Spotlight Cards & Bento Hierarchy */}
        <section className="space-y-6">
          <div className="border-b border-border pb-3">
            <span className="mono-label text-text-muted">05 / SPATIAL CARDS (A5 & CURSOR SPOTLIGHT)</span>
            <h2 className="text-2xl font-semibold text-text mt-1">Radial Spotlight Surfaces</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 space-y-4">
              <div className="w-8 h-8 rounded-full bg-signal/10 border border-signal/20 flex items-center justify-center text-signal">
                <Zap className="w-4 h-4" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-semibold text-text">Two-Stage Pipeline</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Stage A fast discovery fans out across 6 portals to capture deadlines, followed by Stage B deep-dive rule extraction.
              </p>
              <div className="pt-2 flex items-center gap-2">
                <CategoryBadge category="scholarship" />
                <CategoryBadge category="internship" />
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <div className="w-8 h-8 rounded-full bg-ok/10 border border-ok/20 flex items-center justify-center text-ok">
                <ShieldCheck className="w-4 h-4" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-semibold text-text">Evidence-First Reasoning</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Rules are verified against raw web quotes with zero hallucinations. Every qualification cites its exact source line.
              </p>
              <div className="pt-2">
                <VerdictBadge verdict="eligible" />
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <div className="w-8 h-8 rounded-full bg-ice/10 border border-ice/20 flex items-center justify-center text-ice">
                <Sliders className="w-4 h-4" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-semibold text-text">Deterministic Ranker</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Fit, value, urgency, and effort are scored via pure mathematical formulas. LLMs never compute numbers.
              </p>
              <div className="pt-2 flex items-center gap-2">
                <VerdictBadge verdict="likely" />
                <CategoryBadge category="hackathon" />
              </div>
            </Card>
          </div>
        </section>

        {/* 6. Verdict Badges & Category Chips */}
        <section className="space-y-6">
          <div className="border-b border-border pb-3">
            <span className="mono-label text-text-muted">06 / BADGES & CHIPS</span>
            <h2 className="text-2xl font-semibold text-text mt-1">Classification Tokens</h2>
          </div>

          <Card className="p-8 space-y-6">
            <div className="space-y-3">
              <span className="mono-label text-text-faint block">VERDICT STATES (ALWAYS ICON + LABEL / 1.5 STROKE)</span>
              <div className="flex flex-wrap gap-3">
                <VerdictBadge verdict="eligible" />
                <VerdictBadge verdict="likely" />
                <VerdictBadge verdict="unclear" />
                <VerdictBadge verdict="ineligible" />
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-border">
              <span className="mono-label text-text-faint block">CATEGORY BADGES</span>
              <div className="flex flex-wrap gap-3">
                <CategoryBadge category="scholarship" />
                <CategoryBadge category="internship" />
                <CategoryBadge category="hackathon" />
                <CategoryBadge category="fellowship" />
              </div>
            </div>
          </Card>
        </section>

        {/* 7. Skeleton Shimmer (A13) */}
        <section className="space-y-6">
          <div className="border-b border-border pb-3">
            <span className="mono-label text-text-muted">07 / SKELETON SHIMMER (A13 SPEC)</span>
            <h2 className="text-2xl font-semibold text-text mt-1">1.6s Sweep Shimmer (Zero Spinners)</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="w-24 h-5" rounded="pill" />
                <Skeleton className="w-14 h-14" rounded="full" />
              </div>
              <Skeleton className="w-3/4 h-7" rounded="md" />
              <Skeleton className="w-1/2 h-4" rounded="md" />
              <div className="space-y-2 pt-2">
                <Skeleton className="w-full h-3" rounded="sm" />
                <Skeleton className="w-5/6 h-3" rounded="sm" />
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10" rounded="full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="w-32 h-4" rounded="md" />
                  <Skeleton className="w-20 h-3" rounded="sm" />
                </div>
              </div>
              <Skeleton className="w-full h-16" rounded="lg" />
              <div className="flex justify-between items-center pt-2">
                <Skeleton className="w-28 h-8" rounded="pill" />
                <Skeleton className="w-20 h-4" rounded="md" />
              </div>
            </Card>
          </div>
        </section>

        {/* 8. Compliance & Visual QA Checklist */}
        <section className="space-y-6">
          <div className="border-b border-border pb-3">
            <span className="mono-label text-text-muted">08 / PHASE 1 ACCEPTANCE CHECKLIST</span>
            <h2 className="text-2xl font-semibold text-text mt-1">Visual QA Verification</h2>
          </div>

          <Card className="p-8 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono">
              <div className="flex items-center gap-2.5 text-ok">
                <ShieldCheck className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                <span>Strict tokens only (No default Tailwind colors)</span>
              </div>
              <div className="flex items-center gap-2.5 text-ok">
                <ShieldCheck className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                <span>Signal lime #D4FF3A used sparingly for CTA & highlights</span>
              </div>
              <div className="flex items-center gap-2.5 text-ok">
                <ShieldCheck className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                <span>Magnetic buttons with spring physics (stiffness 300 / damping 20)</span>
              </div>
              <div className="flex items-center gap-2.5 text-ok">
                <ShieldCheck className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                <span>Cursor-following radial spotlight on cards</span>
              </div>
              <div className="flex items-center gap-2.5 text-ok">
                <ShieldCheck className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                <span>SVG MatchRing with 1.1s expo-out + mono count-up</span>
              </div>
              <div className="flex items-center gap-2.5 text-ok">
                <ShieldCheck className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                <span>Visible 2px lime focus rings & prefers-reduced-motion</span>
              </div>
              <div className="flex items-center gap-2.5 text-ok">
                <ShieldCheck className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                <span>Self-hosted fonts: Inter + Instrument Serif + JetBrains Mono</span>
              </div>
              <div className="flex items-center gap-2.5 text-ok">
                <ShieldCheck className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                <span>FastAPI backend with /api/health and Pydantic models</span>
              </div>
            </div>
          </Card>
        </section>

      </main>
    </div>
  );
};
