export type Category = "scholarship" | "internship" | "hackathon" | "fellowship";
export type Verdict = "eligible" | "likely" | "unclear" | "ineligible";
export type Stage = "discover" | "detail" | "reason" | "rank" | "draft";
export type RuleOperator = "eq" | "in" | "lte" | "gte" | "between" | "has" | "text";

export interface StudentProfile {
  education_level: string;
  course: string;
  year: string | number;
  institution: string;
  state: string;
  country?: string;
  category?: string; // General, OBC, SC, ST, EWS
  family_income_lpa?: number;
  score_percent?: number;
  skills: string[];
  interests: string[];
  wants: Category[];
  mode_pref: string; // remote, hybrid, in-person, any
  bio?: string;
}

export interface AgentTask {
  task_id: string;
  stage: "discover" | "detail";
  source: string;
  url: string;
  goal: string;
  fallback_sources: string[];
}

export interface OpportunityRaw {
  id: string;
  source: string;
  title: string;
  organization?: string;
  category: Category;
  url: string;
  deadline_text?: string;
  snippet?: string;
}

export interface EligibilityRule {
  field: string;
  operator: RuleOperator;
  value: any;
  raw_text: string;
}

export interface Opportunity {
  raw: OpportunityRaw;
  deadline?: string; // ISO format
  benefits?: string;
  amount_inr?: number;
  location?: string;
  mode?: string;
  rules: EligibilityRule[];
  documents_required: string[];
  apply_url?: string;
  effort_minutes_est?: number;
  evidence?: string;
  confidence: number;
}

export interface EligibilityAssessment {
  verdict: Verdict;
  confidence: number;
  met: string[];
  unmet: string[];
  unknown: string[];
  reasoning: string;
}

export interface ScoredOpportunity {
  opportunity: Opportunity;
  assessment: EligibilityAssessment;
  fit: number; // 0..1
  value: number; // 0..1
  urgency: number; // 0..1
  effort: number; // 0..1
  total: number; // 0..100
  days_left?: number;
  rank: number;
}

export interface ApplicationDraft {
  opportunity_id: string;
  text: string;
  checklist: string[];
  disclaimer: string;
}

export interface AgentResult {
  task_id: string;
  stage: "discover" | "detail";
  source: string;
  status: "success" | "failed" | "retry" | "fallback";
  raws: OpportunityRaw[];
  detail?: Opportunity;
  error?: string;
  duration_ms: number;
  attempts: number;
}

export interface FinalResult {
  run_id: string;
  profile: StudentProfile;
  ranked: ScoredOpportunity[];
  drafts: ApplicationDraft[];
  discovered_count: number;
  analyzed_count: number;
  agents_total: number;
  agents_ok: number;
  duration_ms: number;
  summary: string;
  warnings: string[];
}

export type SSEEventType =
  | "run_started"
  | "profile_parsed"
  | "plan_ready"
  | "stage_changed"
  | "agent_started"
  | "agent_progress"
  | "agent_retry"
  | "agent_fallback"
  | "opportunity_found"
  | "agent_done"
  | "agent_failed"
  | "candidates_picked"
  | "opportunity_scored"
  | "draft_ready"
  | "result_ready"
  | "run_error";

export interface SSEEventMessage {
  type: SSEEventType;
  [key: string]: any;
}
