import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  Bot,
  ShieldCheck,
  Zap,
  Clock,
  Sparkles,
  FileText,
  Search,
  CheckCircle2,
  ChevronDown,
  Layers,
  Database,
  Filter
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { CategoryBadge } from '../components/ui/Badge';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const sources = [
    { name: "scholarships.gov.in", label: "National Scholarship Portal", category: "scholarship" as const, desc: "Central & state government merit-cum-means grants for Indian students." },
    { name: "buddy4study.com", label: "Buddy4Study", category: "scholarship" as const, desc: "Corporate CSR funds, private foundation grants, and women-in-STEM scholarships." },
    { name: "internshala.com", label: "Internshala", category: "internship" as const, desc: "Software, full stack, machine learning, and hardware internships with stipends." },
    { name: "unstop.com", label: "Unstop", category: "hackathon" as const, desc: "National competitions, corporate hiring challenges, and government hackathons." },
    { name: "devfolio.co", label: "Devfolio", category: "hackathon" as const, desc: "Premier community hackathons (ETHIndia, HackOut) and builder fellowships." },
    { name: "devpost.com", label: "Devpost", category: "hackathon" as const, desc: "Global AI contests, developer grants, and open hackathons." },
  ];

  const steps = [
    {
      num: "01",
      title: "Describe Yourself in Plain Text",
      desc: "No rigid 50-field forms. Just type your degree, year, college, state, skills, and goals in normal sentences. Our parser extracts your structured academic background instantly.",
      badge: "NATURAL LANGUAGE"
    },
    {
      num: "02",
      title: "Autonomous Agents Fan Out",
      desc: "Scout launches parallel Stage A web agents across fragmented portals. Each agent scans current listings, extracts raw deadlines, and captures candidate opportunities.",
      badge: "PARALLEL SWARM"
    },
    {
      num: "03",
      title: "Deep Rule & Eligibility Extraction",
      desc: "Stage B detail agents open candidate pages to dissect the legal fine print: income caps, state domiciles, minimum CGPA/percentages, and required documents with source citations.",
      badge: "EVIDENCE-FIRST"
    },
    {
      num: "04",
      title: "Deterministic Ranking & Tailored Drafts",
      desc: "A pure mathematical formula scores fit, financial value, and deadline urgency. Unqualified items are set aside, and top eligible matches receive custom-tailored application drafts.",
      badge: "ZERO HALLUCINATIONS"
    }
  ];

  const faqs = [
    {
      q: "How does Scout find opportunities without public APIs?",
      a: "Most student portals don't offer modern APIs. Scout utilizes autonomous web agents that navigate public web pages directly, evaluate DOM structures, follow pagination, and extract structured data."
    },
    {
      q: "How does Scout verify if I am really eligible?",
      a: "Unlike generic search engines, Scout compares published eligibility rules against your profile (e.g., family income limits, branch of study, graduation year, state domicile). It highlights verified rules and quotes the exact sentence from the portal for verification."
    },
    {
      q: "Does Scout automatically submit my applications?",
      a: "No. Scout never auto-submits applications and never requires your personal credentials. It drafts high-quality statements of purpose, provides the checklist of required documents, and gives you the direct official link to apply yourself."
    },
    {
      q: "Why are some opportunities marked 'Not for you'?",
      a: "Trust is paramount. If a scholarship requires family income below 2.5 LPA and yours is 3 LPA, or an internship requires Embedded C when you do React, Scout tells you openly rather than wasting your time on rejections."
    }
  ];

  return (
    <div className="relative min-h-screen text-text">
      {/* Ambient background atmosphere */}
      <div className="scout-atmosphere" />
      <div className="scout-grid" />
      <div className="scout-grain" />

      {/* 1. NAVIGATION BAR */}
      <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-bg/85 border-b border-border">
        <div className="max-w-[1240px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <span className="font-semibold text-xl tracking-tight text-text">scout</span>
            <span className="w-1.5 h-1.5 rounded-full bg-signal shadow-[0_0_8px_#D4FF3A]" />
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-mono text-text-muted">
            <a href="#how-it-works" className="hover:text-text transition-colors">How It Works</a>
            <a href="#sources" className="hover:text-text transition-colors">Sources</a>
            <a href="#features" className="hover:text-text transition-colors">Features</a>
            <a href="#faq" className="hover:text-text transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="primary"
              size="sm"
              withArrow
              onClick={() => navigate('/app')}
            >
              Start Hunting
            </Button>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <header className="relative z-10 max-w-[1240px] mx-auto px-6 pt-20 md:pt-32 pb-20 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-pill bg-white/[0.04] border border-border">
          <Bot className="w-4 h-4 text-signal" strokeWidth={1.5} />
          <span className="mono-label text-xs text-signal font-semibold">AGENTS ON THE OPEN WEB</span>
        </div>

        <h1 className="display-title text-text max-w-4xl mx-auto">
          Every opportunity you qualify for. <span className="serif-emphasis text-signal">Found</span> before the deadline.
        </h1>

        <p className="text-text-muted text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          Describe your background in plain text. Autonomous web agents fan out across scholarship, internship, hackathon, and fellowship portals, verify real eligibility rules, and draft your applications.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button
            variant="primary"
            size="lg"
            withArrow
            onClick={() => navigate('/app')}
          >
            Start Hunting Opportunities
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => {
              const el = document.getElementById('how-it-works');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            How It Works
          </Button>
        </div>

        {/* Telemetry Strip */}
        <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          <div className="p-4 rounded-xl bg-surface border border-border text-center">
            <span className="mono-label text-text-faint text-[10px] block">PORTALS COVERED</span>
            <span className="font-mono text-xl font-semibold text-signal mt-1 block">6 Curated Sources</span>
          </div>
          <div className="p-4 rounded-xl bg-surface border border-border text-center">
            <span className="mono-label text-text-faint text-[10px] block">CRITERIA VERIFICATION</span>
            <span className="font-mono text-xl font-semibold text-ok mt-1 block">Evidence-Backed</span>
          </div>
          <div className="p-4 rounded-xl bg-surface border border-border text-center">
            <span className="mono-label text-text-faint text-[10px] block">DEADLINE ENGINE</span>
            <span className="font-mono text-xl font-semibold text-text mt-1 block">ISO-8601 Validated</span>
          </div>
          <div className="p-4 rounded-xl bg-surface border border-border text-center">
            <span className="mono-label text-text-faint text-[10px] block">APPLICATION DRAFTS</span>
            <span className="font-mono text-xl font-semibold text-amber mt-1 block">Top 3 Tailored</span>
          </div>
        </div>
      </header>

      {/* 3. HOW IT WORKS (STEP-BY-STEP STORY) */}
      <section id="how-it-works" className="relative z-10 max-w-[1240px] mx-auto px-6 py-20 border-t border-border space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="mono-label text-signal">THE FOUR-STAGE PIPELINE</span>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-text">
            How Scout Scours the Web for You
          </h2>
          <p className="text-text-muted text-base">
            From natural language to verified eligibility proof in under 10 seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s) => (
            <Card key={s.num} className="p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-2xl font-bold text-signal">{s.num}</span>
                  <span className="mono-label text-[10px] text-text-faint bg-white/[0.03] px-2 py-0.5 rounded border border-border">
                    {s.badge}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-text leading-snug">{s.title}</h3>
                <p className="text-xs text-text-muted leading-relaxed">{s.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 4. SOURCES MARQUEE / GRID */}
      <section id="sources" className="relative z-10 max-w-[1240px] mx-auto px-6 py-20 border-t border-border space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="mono-label text-signal">PORTAL COVERAGE</span>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-text">
            Where Scout Dispatches Agents
          </h2>
          <p className="text-text-muted text-base">
            No good APIs? No problem. Scout's agents autonomously crawl government, private, and community portals directly.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {sources.map((src) => (
            <Card key={src.name} className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-signal">{src.name}</span>
                <CategoryBadge category={src.category} />
              </div>
              <h3 className="text-base font-semibold text-text">{src.label}</h3>
              <p className="text-xs text-text-muted leading-relaxed">{src.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* 5. FEATURES BENTO */}
      <section id="features" className="relative z-10 max-w-[1240px] mx-auto px-6 py-20 border-t border-border space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="mono-label text-signal">BUILT FOR STUDENTS</span>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-text">
            Why Scout is Different
          </h2>
          <p className="text-text-muted text-base">
            Engineered around truth, verification, and speed. Zero hallucinations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 space-y-4 md:col-span-2">
            <div className="w-9 h-9 rounded-full bg-signal/10 border border-signal/20 flex items-center justify-center text-signal">
              <ShieldCheck className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-semibold text-text">Evidence-Backed Verification</h3>
            <p className="text-sm text-text-muted leading-relaxed">
              Every qualification decision cites the exact text from the web page. If a scholarship requires annual family income under 3.5 LPA, Scout confirms your profile meets that criterion and quotes the clause.
            </p>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="w-9 h-9 rounded-full bg-coral/10 border border-coral/20 flex items-center justify-center text-coral">
              <Clock className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-semibold text-text">Urgency Radar</h3>
            <p className="text-sm text-text-muted leading-relaxed">
              Deadlines within 3 days trigger a pulsing alert. Urgency boosts your score so you never discover a match after applications close.
            </p>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="w-9 h-9 rounded-full bg-ice/10 border border-ice/20 flex items-center justify-center text-ice">
              <FileText className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-semibold text-text">Tailored Application Drafts</h3>
            <p className="text-sm text-text-muted leading-relaxed">
              Top 3 matches receive a tailored 120-180 word statement of purpose plus a checklist of required certificates ready to copy in 1 click.
            </p>
          </Card>

          <Card className="p-6 space-y-4 md:col-span-2">
            <div className="w-9 h-9 rounded-full bg-ok/10 border border-ok/20 flex items-center justify-center text-ok">
              <Filter className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-semibold text-text">Honest Rejections: "Not for you, and why"</h3>
            <p className="text-sm text-text-muted leading-relaxed">
              Ineligible opportunities aren't swept under the rug. Scout places them in an honest rejection drawer explaining the exact unmet criteria so you never waste hours preparing an invalid application.
            </p>
          </Card>
        </div>
      </section>

      {/* 6. FAQ ACCORDION */}
      <section id="faq" className="relative z-10 max-w-[800px] mx-auto px-6 py-20 border-t border-border space-y-8">
        <div className="text-center space-y-3">
          <span className="mono-label text-signal">QUESTIONS & ANSWERS</span>
          <h2 className="text-3xl font-semibold tracking-tight text-text">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-[14px] bg-surface border border-border overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02]"
                >
                  <span className="font-semibold text-text text-base">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-text-muted transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-signal' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="p-5 pt-0 text-sm text-text-muted leading-relaxed border-t border-border/40">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. FINAL CALL TO ACTION */}
      <section className="relative z-10 max-w-[1240px] mx-auto px-6 py-24 text-center border-t border-border space-y-6">
        <h2 className="text-3xl md:text-5xl font-semibold text-text max-w-2xl mx-auto leading-tight">
          Ready to discover what you qualify for? <span className="serif-emphasis text-signal">Start your radar.</span>
        </h2>
        <p className="text-text-muted text-base max-w-md mx-auto">
          Type your skills and college details. Let the agent swarm handle the portals.
        </p>
        <div className="pt-2">
          <Button
            variant="primary"
            size="lg"
            withArrow
            onClick={() => navigate('/app')}
          >
            Launch Opportunity Radar
          </Button>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="relative z-10 max-w-[1240px] mx-auto px-6 py-10 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-text-faint">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-text">scout</span>
          <span>© 2026 Multi-Agent Opportunity Radar</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="/styleguide" className="hover:text-text">Styleguide</a>
          <button onClick={() => navigate('/app')} className="text-signal hover:underline">
            Launch App
          </button>
        </div>
      </footer>
    </div>
  );
};
