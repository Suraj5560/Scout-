import { FinalResult, ApplicationDraft } from './types';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export async function checkHealth() {
  const res = await fetch(`${API_BASE}/api/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
  return res.json();
}

export async function createRun(profileText: string): Promise<{ run_id: string }> {
  const res = await fetch(`${API_BASE}/api/runs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile_text: profileText }),
  });
  if (!res.ok) throw new Error(`Create run failed: ${res.statusText}`);
  return res.json();
}

export async function getRun(runId: string): Promise<FinalResult> {
  const res = await fetch(`${API_BASE}/api/runs/${runId}`);
  if (!res.ok) throw new Error(`Get run failed: ${res.statusText}`);
  return res.json();
}

export async function createDraft(runId: string, opportunityId: string): Promise<ApplicationDraft> {
  const res = await fetch(`${API_BASE}/api/runs/${runId}/drafts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ opportunity_id: opportunityId }),
  });
  if (!res.ok) throw new Error(`Create draft failed: ${res.statusText}`);
  return res.json();
}
