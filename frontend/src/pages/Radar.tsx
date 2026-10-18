import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  Sparkles,
  Bot,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Copy,
  Check,
  RotateCcw,
  ShieldAlert,
  ChevronDown,
  Terminal,
  FileText
} from 'lucide-react';
import { useRunStream } from '../hooks/useRunStream';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { MatchRing } from '../components/ui/MatchRing';
import { VerdictBadge, CategoryBadge } from '../components/ui/Badge';
import type { ScoredOpportunity, ApplicationDraft, Verdict } from '../lib/types';

const EXAMPLE_PROMPTS = [
  {
    label: "3rd Yr B.Tech CS @ NIT (Python, React)",
    text: "Hi, I am a 3rd year undergraduate student studying Computer Science at NIT Surathkal in Karnataka, India. Family income is 3 LPA and score is 88%. My core skills include Python, React, TypeScript, and Machine Learning. I am looking for tech internships, hackathons, and scholarships to support my education."
  },
  {
    label: "Final Yr AI/ML Research Student",
    text: "I am a 4th year undergraduate student in Computer Science with a focus on Artificial Intelligence and Machine Learning. Proficient in Python, LLM workflows, PyTorch, and Web Agents. Looking for research internships or fellowship grants with remote flexibility."
  },
  {
    label: "1st Yr Student seeking Scholarships",
    text: "I am a 1st year B.Tech student in Bangalore, Karnataka. Family annual income is under 2.5 Lakhs per annum and I scored 91% in my 12th board exams. Looking for verified merit-cum-means scholarships and student competitions."
  }
];

export const Radar: React.FC = () => {
  const navigate = useNavigate();
  const [profileText, setProfileText] = useState(EXAMPLE_PROMPTS[0].text);
  const [activeTab, setActiveTab] = useState<'best' | 'all' | 'deadlines' | 'ineligible'>('best');
  const [selectedDraft, setSelectedDraft] = useState<ApplicationDraft | null>(null);
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

  const {
    isRunning,
    runId,
    stage,
    profile,
    agents,
    logs,
    prefilter,
    opportunities,
    drafts,
    finalResult,
    error,
    startRun,
    resetRun
  } = useRunStream();

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileText.trim() || isRunning) return;
    startRun(profileText);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  // Filter opportunities based on active tab
  const filteredOpportunities = opportunities.filter((item) => {
    if (activeTab === 'best') {
      return item.assessment.verdict === 'eligible' || item.assessment.verdict === 'likely';
    }
    if (activeTab === 'ineligible') {
      return item.assessment.verdict === 'ineligible';
    }
    if (activeTab === 'deadlines') {
      return item.assessment.verdict !== 'ineligible' && item.days_left !== undefined;
    }
    return true; // 'all'
  });

  const agentList = Object.values(agents);

  // -------------------------------------------------------------
  // SCREEN 1: INPUT BOX (When no run has been initiated)
  // -------------------------------------------------------------
  if (!runId && !isRunning) {
    return (
      <div className="relative min-h-screen text-text flex flex-col justify-between p-6 md:p-12">
        <div className="scout-atmosphere" />
        <div className="scout-grid" />
        <div className="scout-grain" />

        {/* Top Header */}
        <header className="relative z-10 max-w-4xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1 text-xs font-mono text-text-muted hover:text-text px-2.5 py-1 rounded border border-border hover:border-border-strong transition-all cursor-pointer"
            >
              ← Home
            </button>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <span className="font-semibold text-xl tracking-tight text-text">scout</span>
              <span className="w-1.5 h-1.5 rounded-full bg-signal shadow-[0_0_8px_#D4FF3A]" />
            </div>
            <span className="mono-label text-[10px] text-text-faint ml-1 px-2 py-0.5 rounded border border-border">
              OPPORTUNITY RADAR
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs font-mono text-ok">
              <span className="w-1.5 h-1.5 rounded-full bg-ok animate-pulse" />
              BACKEND CONNECTED
            </span>
            <a
              href="/styleguide"
              className="text-xs font-mono text-text-muted hover:text-text px-2.5 py-1 rounded border border-border transition-colors"
            >
              /styleguide
            </a>
          </div>
        </header>

        {/* Center Input Form */}
        <main className="relative z-10 max-w-3xl mx-auto w-full my-auto space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-white/[0.04] border border-border">
              <Compass className="w-3.5 h-3.5 text-signal" strokeWidth={1.5} />
              <span className="mono-label text-[11px] text-signal">MULTI-AGENT SCOUT</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-text">
              Tell Scout <span className="serif-emphasis text-signal">about you.</span>
            </h1>
            <p className="text-text-muted text-base max-w-xl mx-auto">
              Describe your degree, year, state, technical skills, and opportunities you want. 
              Our agents will fan out across portals and extract eligibility proof for you.
            </p>
          </div>

          <form onSubmit={handleStart} className="space-y-4">
            <div className="relative group">
              <div className="absolute -inset-0.5 rounded-[24px] bg-gradient-to-r from-signal/20 to-ice/20 opacity-30 group-focus-within:opacity-100 transition duration-500 blur-sm pointer-events-none" />
              <div className="relative bg-surface rounded-[22px] border border-border group-focus-within:border-signal/50 p-4 transition-all">
                <textarea
                  value={profileText}
                  onChange={(e) => setProfileText(e.target.value)}
                  placeholder="E.g., 3rd year B.Tech student in CS at NIT Surathkal. Skills: Python, React, ML. Looking for internships, hackathons, and scholarships..."
                  rows={4}
                  className="w-full bg-transparent text-text placeholder-text-faint text-base focus:outline-none resize-none leading-relaxed"
                />

                <div className="flex items-center justify-between pt-3 border-t border-border mt-2">
                  <span className="mono-label text-[11px] text-text-faint">
                    PRESS ENTER OR CLICK SCAN
                  </span>
                  <Button
                    type="submit"
                    variant="primary"
                    magnetic
                    withArrow
                    size="md"
                    disabled={!profileText.trim()}
                  >
                    Scan Opportunities
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Load Example Chips */}
            <div className="space-y-2">
              <span className="mono-label text-[10px] text-text-faint block text-center">
                QUICK LOAD EXAMPLES
              </span>
              <div className="flex flex-wrap justify-center gap-2">
                {EXAMPLE_PROMPTS.map((ex, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setProfileText(ex.text)}
                    className="text-xs px-3 py-1.5 rounded-pill bg-white/[0.03] hover:bg-white/[0.08] border border-border hover:border-border-strong text-text-muted hover:text-text transition-all text-left"
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </main>

        {/* Footer info */}
        <footer className="relative z-10 max-w-4xl mx-auto w-full text-center">
          <span className="mono-label text-[10px] text-text-faint">
            MOCK MODE ACTIVE · 40+ VERIFIED FIXTURES · ZERO INVENTED APIS
          </span>
        </footer>
      </div>
    );
  }

  // -------------------------------------------------------------
  // SCREEN 2: LIVE MISSION CONTROL RESULTS VIEW
  // -------------------------------------------------------------
  return (
    <div className="relative min-h-screen text-text pb-24">
      <div className="scout-atmosphere" />
      <div className="scout-grid" />
      <div className="scout-grain" />

      {/* Top Mission Control Bar */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-bg/90 border-b border-border">
        <div className="max-w-[1240px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1 text-xs font-mono text-text-muted hover:text-text px-2.5 py-1 rounded border border-border hover:border-border-strong transition-all cursor-pointer"
            >
              ← Home
            </button>
            <button
              onClick={resetRun}
              className="flex items-center gap-1.5 text-xs font-mono text-text-muted hover:text-text px-2.5 py-1 rounded border border-border hover:border-border-strong transition-all cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              New Scan
            </button>
            <div className="h-4 w-[1px] bg-border" />
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <span className="font-semibold tracking-tight text-text">scout</span>
              <span className="w-1.5 h-1.5 rounded-full bg-signal shadow-[0_0_8px_#D4FF3A]" />
            </div>
            <span className="mono-label text-[10px] text-signal bg-signal/10 px-2 py-0.5 rounded border border-signal/20">
              {runId}
            </span>
          </div>

          {/* Profile summary chips */}
          {profile && (
            <div className="hidden md:flex items-center gap-2">
              <span className="mono-label text-text-faint text-[10px]">CANDIDATE:</span>
              <span className="text-xs px-2.5 py-0.5 rounded-pill bg-white/[0.04] border border-border text-text">
                {profile.year} {profile.course}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-pill bg-white/[0.04] border border-border text-text-muted">
                {profile.state}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-pill bg-white/[0.04] border border-border text-signal">
                {profile.skills.slice(0, 3).join(', ')}
              </span>
            </div>
          )}

          <div className="flex items-center gap-3">
            {isRunning ? (
              <span className="flex items-center gap-1.5 text-xs font-mono text-signal">
                <span className="w-2 h-2 rounded-full bg-signal animate-pulse" />
                AGENTS ACTIVE ({stage.toUpperCase()})
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-mono text-ok">
                <CheckCircle2 className="w-3.5 h-3.5" />
                RADAR COMPLETE
              </span>
            )}
          </div>
        </div>

        {/* Pipeline Stage Rail */}
        <div className="max-w-[1240px] mx-auto px-6 py-2 border-t border-white/[0.04] flex items-center justify-between overflow-x-auto text-xs font-mono">
          {[
            { id: 'discover', label: '01 / DISCOVER' },
            { id: 'prefilter', label: '02 / PREFILTER' },
            { id: 'detail', label: '03 / DETAIL' },
            { id: 'reason', label: '04 / REASON' },
            { id: 'rank', label: '05 / RANK' },
            { id: 'draft', label: '06 / DRAFT' },
          ].map((st) => {
            const isCurrent = stage === st.id;
            return (
              <div
                key={st.id}
                className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors whitespace-nowrap ${
                  isCurrent
                    ? 'text-signal bg-signal/10 border border-signal/20 font-semibold'
                    : 'text-text-faint'
                }`}
              >
                <span>{st.label}</span>
                {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-signal animate-ping" />}
              </div>
            );
          })}
        </div>
      </header>

      <main className="max-w-[1240px] mx-auto px-6 pt-8 space-y-10">
        
        {/* Error Banner if any */}
        {error && (
          <div className="p-4 rounded-xl bg-coral/10 border border-coral/30 text-coral flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>Execution notice: {error}</span>
          </div>
        )}

        {/* 1. AGENTS STATUS GRID */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-signal" strokeWidth={1.5} />
              <h2 className="text-lg font-semibold text-text">Autonomous Web Agents</h2>
              <span className="mono-label text-[10px] text-text-faint ml-2">
                PARALLEL PORTAL DISPATCH
              </span>
            </div>
            <button
              onClick={() => setShowLogs(!showLogs)}
              className="text-xs font-mono text-text-muted hover:text-text flex items-center gap-1"
            >
              <Terminal className="w-3.5 h-3.5" />
              {showLogs ? 'Hide Live Ticker' : `Show Live Ticker (${logs.length})`}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {agentList.map((ag) => (
              <div
                key={ag.taskId}
                className={`p-3.5 rounded-[14px] bg-surface border transition-all ${
                  ag.status === 'running'
                    ? 'border-signal/40 shadow-[0_0_15px_rgba(212,255,58,0.06)]'
                    : ag.status === 'done'
                    ? 'border-ok/30'
                    : ag.status === 'retrying' || ag.status === 'fallback'
                    ? 'border-amber/40'
                    : 'border-border'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-semibold text-text truncate max-w-[110px]">
                    {ag.source}
                  </span>
                  {ag.status === 'running' && (
                    <span className="w-2 h-2 rounded-full bg-signal animate-pulse" />
                  )}
                  {ag.status === 'done' && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-ok" strokeWidth={1.5} />
                  )}
                  {(ag.status === 'retrying' || ag.status === 'fallback') && (
                    <span className="mono-label text-[9px] text-amber">RETRY</span>
                  )}
                </div>

                <p className="text-[11px] text-text-muted line-clamp-2 h-8 leading-tight mb-2">
                  {ag.message}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[10px] font-mono">
                  <span className="text-text-faint uppercase">{ag.stage}</span>
                  <span className="text-signal font-semibold">
                    {ag.foundCount > 0 ? `${ag.foundCount} found` : 'Searching'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Prefilter moment counter banner */}
          {prefilter && (
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-border flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <span className="text-text">
                <span className="text-ok font-semibold">Stage 3 Prefilter:</span> Retained top{' '}
                <span className="text-signal font-semibold">{prefilter.keptCount}</span> opportunities
                by keyword & profile fit.
              </span>
              <div className="flex gap-4 text-text-muted">
                <span>Expired Dropped: <strong className="text-coral">{prefilter.expiredCount}</strong></span>
                <span>Duplicates Dropped: <strong className="text-amber">{prefilter.duplicateCount}</strong></span>
                <span>Off-Category: <strong className="text-text-faint">{prefilter.offCount}</strong></span>
              </div>
            </div>
          )}

          {/* Optional Collapsible Live Ticker */}
          {showLogs && (
            <div className="p-4 rounded-xl bg-bg-raised border border-border max-h-48 overflow-y-auto space-y-1 font-mono text-xs">
              {logs.map((lg, i) => (
                <div key={i} className="flex gap-3 text-[11px]">
                  <span className="text-text-faint shrink-0">{lg.time}</span>
                  <span
                    className={
                      lg.type === 'error'
                        ? 'text-coral'
                        : lg.type === 'success'
                        ? 'text-ok'
                        : lg.type === 'warning'
                        ? 'text-amber'
                        : 'text-text-muted'
                    }
                  >
                    {lg.text}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 2. RESULTS SECTION */}
        <section className="space-y-6 pt-4 border-t border-border">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-signal" strokeWidth={1.5} />
                <h2 className="text-2xl font-semibold text-text">Scout Radar Results</h2>
              </div>
              {finalResult && (
                <p className="text-sm text-text-muted mt-1">{finalResult.summary}</p>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1.5 p-1 rounded-pill bg-surface border border-border text-xs font-mono">
              {[
                { id: 'best', label: 'Best Matches' },
                { id: 'all', label: `All (${opportunities.length})` },
                { id: 'deadlines', label: 'Upcoming Deadlines' },
                { id: 'ineligible', label: 'Not for you' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-1.5 rounded-pill transition-all ${
                    activeTab === tab.id
                      ? 'bg-signal text-[#09090B] font-semibold'
                      : 'text-text-muted hover:text-text'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Opportunities List */}
          {filteredOpportunities.length === 0 ? (
            <Card className="p-12 text-center space-y-3">
              <span className="mono-label text-text-faint">NO OPPORTUNITIES IN THIS VIEW</span>
              <p className="text-text-muted text-sm">
                {isRunning
                  ? 'Discovery agents are fanning out and parsing live criteria...'
                  : 'No items matching this filter criterion.'}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredOpportunities.map((item) => {
                const opp = item.opportunity;
                const draft = drafts.find((d) => d.opportunity_id === opp.raw.id);

                return (
                  <Card
                    key={opp.raw.id}
                    className="p-6 flex flex-col justify-between space-y-5 transition-all hover:border-border-strong"
                  >
                    {/* Top Row: Category, Rank, MatchRing */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-text-faint">#{item.rank}</span>
                          <CategoryBadge category={opp.raw.category} />
                          <span className="mono-label text-[10px] text-text-muted">
                            {opp.raw.source}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-text leading-snug">
                          {opp.raw.title}
                        </h3>
                        {opp.raw.organization && (
                          <div className="text-xs text-text-muted">{opp.raw.organization}</div>
                        )}
                      </div>

                      {/* Score Ring */}
                      <MatchRing score={item.total} verdict={item.assessment.verdict} />
                    </div>

                    {/* Metadata strip: Benefits, Deadline, Location */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-3 px-3.5 rounded-lg bg-bg-raised border border-border text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-text-faint block">BENEFITS</span>
                        <span className="text-signal truncate block">
                          {opp.benefits || 'Educational Grant'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-text-faint block">DEADLINE</span>
                        <span
                          className={`truncate block ${
                            item.days_left !== undefined && item.days_left <= 3
                              ? 'text-coral font-semibold animate-pulse'
                              : 'text-text'
                          }`}
                        >
                          {opp.deadline || 'Ongoing'}
                          {item.days_left !== undefined && ` (${item.days_left}d left)`}
                        </span>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <span className="text-[10px] text-text-faint block">MODE</span>
                        <span className="text-text capitalize block">{opp.mode || 'Remote'}</span>
                      </div>
                    </div>

                    {/* Reasoning & Evidence Quote */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <VerdictBadge verdict={item.assessment.verdict} />
                        <span className="mono-label text-[10px] text-text-faint">
                          FIT: {(item.fit * 100).toFixed(0)}% · VAL: {(item.value * 100).toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-xs text-text-muted leading-relaxed">
                        {item.assessment.reasoning}
                      </p>

                      {/* Highlight unmet rules if ineligible */}
                      {item.assessment.unmet && item.assessment.unmet.length > 0 && (
                        <div className="p-2.5 rounded bg-coral/[0.06] border border-coral/20 text-xs text-coral space-y-1">
                          <span className="font-mono text-[10px] uppercase font-semibold block">
                            Unmet Requirement:
                          </span>
                          {item.assessment.unmet.map((un, idx) => (
                            <div key={idx} className="flex items-center gap-1.5">
                              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                              <span>{un}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      {opp.apply_url ? (
                        <a
                          href={opp.apply_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-mono text-text-muted hover:text-signal transition-colors"
                        >
                          Official Portal
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span className="text-xs font-mono text-text-faint">Direct application</span>
                      )}

                      {draft ? (
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<FileText className="w-3.5 h-3.5 text-signal" />}
                          onClick={() => setSelectedDraft(draft)}
                        >
                          View Draft
                        </Button>
                      ) : (
                        <span className="text-xs font-mono text-text-faint">Ranked #{item.rank}</span>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

      </main>

      {/* 3. APPLICATION DRAFT MODAL / DRAWER */}
      {selectedDraft && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-surface border border-border-strong rounded-[22px] max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-signal" strokeWidth={1.5} />
                <h3 className="text-xl font-semibold text-text">Tailored Application Draft</h3>
              </div>
              <button
                onClick={() => setSelectedDraft(null)}
                className="text-text-muted hover:text-text font-mono text-xs px-2.5 py-1 rounded border border-border"
              >
                Close
              </button>
            </div>

            <div className="space-y-4">
              <span className="mono-label text-text-faint text-[10px] block">
                STATEMENT OF PURPOSE / COVER NOTE (120-180 WORDS)
              </span>
              <div className="p-4 rounded-xl bg-bg-raised border border-border text-sm text-text leading-relaxed">
                {selectedDraft.text}
              </div>

              <div className="space-y-2">
                <span className="mono-label text-text-faint text-[10px] block">
                  REQUIRED DOCUMENTS CHECKLIST
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedDraft.checklist.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.02] border border-border text-xs text-text-muted"
                    >
                      <Check className="w-3.5 h-3.5 text-signal shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-white/[0.02] border border-border text-xs font-mono text-text-faint">
                ⚠️ {selectedDraft.disclaimer}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button
                variant="primary"
                size="md"
                icon={copiedDraft ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                onClick={() => copyToClipboard(selectedDraft.text)}
              >
                {copiedDraft ? 'Copied to Clipboard!' : 'Copy Statement'}
              </Button>
              <Button variant="secondary" size="md" onClick={() => setSelectedDraft(null)}>
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
