import React from 'react';
import { CheckCircle2, Sparkles, HelpCircle, XCircle } from 'lucide-react';
import type { Verdict, Category } from '../../lib/types';

export interface VerdictBadgeProps {
  verdict: Verdict;
  className?: string;
  showIcon?: boolean;
}

export const VerdictBadge: React.FC<VerdictBadgeProps> = ({
  verdict,
  className = '',
  showIcon = true,
}) => {
  const configs = {
    eligible: {
      label: 'Eligible',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-ok" strokeWidth={1.5} />,
      bg: 'bg-ok/10 border-ok/20 text-ok',
    },
    likely: {
      label: 'Likely Eligible',
      icon: <Sparkles className="w-3.5 h-3.5 text-amber" strokeWidth={1.5} />,
      bg: 'bg-amber/10 border-amber/20 text-amber',
    },
    unclear: {
      label: 'Criteria Unclear',
      icon: <HelpCircle className="w-3.5 h-3.5 text-text-muted" strokeWidth={1.5} />,
      bg: 'bg-white/[0.04] border-white/10 text-text-muted',
    },
    ineligible: {
      label: 'Ineligible',
      icon: <XCircle className="w-3.5 h-3.5 text-coral" strokeWidth={1.5} />,
      bg: 'bg-coral/10 border-coral/20 text-coral',
    },
  }[verdict];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill text-xs font-mono font-medium tracking-wide border ${configs.bg} ${className}`}
    >
      {showIcon && configs.icon}
      <span>{configs.label}</span>
    </span>
  );
};

export interface CategoryBadgeProps {
  category: Category;
  className?: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  className = '',
}) => {
  const categoryLabels: Record<Category, string> = {
    scholarship: 'Scholarship',
    internship: 'Internship',
    hackathon: 'Hackathon',
    fellowship: 'Fellowship',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-pill text-[11px] font-mono uppercase tracking-wider bg-white/[0.04] border border-border text-text-muted ${className}`}
    >
      {categoryLabels[category] || category}
    </span>
  );
};
