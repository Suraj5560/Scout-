import { useState, useCallback, useRef } from 'react';
import type {
  StudentProfile,
  ScoredOpportunity,
  ApplicationDraft,
  FinalResult,
  Stage
} from '../lib/types';

export interface AgentStatus {
  taskId: string;
  source: string;
  stage: 'discover' | 'detail';
  status: 'pending' | 'running' | 'retrying' | 'fallback' | 'done' | 'failed';
  message: string;
  foundCount: number;
}

export interface PrefilterStats {
  keptCount: number;
  expiredCount: number;
  duplicateCount: number;
  offCount: number;
}

export function useRunStream() {
  const [isRunning, setIsRunning] = useState(false);
  const [runId, setRunId] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>('discover');
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [agents, setAgents] = useState<Record<string, AgentStatus>>({});
  const [logs, setLogs] = useState<Array<{ time: string; text: string; type?: string }>>([]);
  const [prefilter, setPrefilter] = useState<PrefilterStats | null>(null);
  const [opportunities, setOpportunities] = useState<ScoredOpportunity[]>([]);
  const [drafts, setDrafts] = useState<ApplicationDraft[]>([]);
  const [finalResult, setFinalResult] = useState<FinalResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);

  const addLog = useCallback((text: string, type?: string) => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs((prev) => [{ time, text, type }, ...prev.slice(0, 49)]);
  }, []);

  const startRun = useCallback(async (profileText: string) => {
    setIsRunning(true);
    setError(null);
    setAgents({});
    setLogs([]);
    setOpportunities([]);
    setDrafts([]);
    setFinalResult(null);
    setPrefilter(null);
    setStage('discover');

    addLog('Initiating multi-agent run...', 'info');

    try {
      const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
      const res = await fetch(`${apiBase}/api/runs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_text: profileText }),
      });

      if (!res.ok) {
        throw new Error(`Failed to create run: ${res.statusText}`);
      }

      const { run_id } = await res.json();
      setRunId(run_id);
      addLog(`Run registered [ID: ${run_id}]`, 'info');

      // Connect to SSE stream
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const sse = new EventSource(`${apiBase}/api/runs/${run_id}/stream`);
      eventSourceRef.current = sse;

      sse.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const type = data.type;

          if (type === 'profile_parsed') {
            setProfile(data.profile);
            addLog(`Profile parsed: ${data.profile.year} ${data.profile.course} (${data.profile.state})`, 'success');
          } else if (type === 'stage_changed') {
            setStage(data.stage);
            addLog(`Stage changed to: ${data.stage.toUpperCase()}`, 'info');
          } else if (type === 'plan_ready') {
            addLog(`Planner scheduled ${data.tasks_count} discovery agents: ${data.sources.join(', ')}`, 'info');
          } else if (type === 'agent_started') {
            setAgents((prev) => ({
              ...prev,
              [data.task_id]: {
                taskId: data.task_id,
                source: data.source,
                stage: data.stage,
                status: 'running',
                message: `Agent fanning out across ${data.source}...`,
                foundCount: 0,
              },
            }));
            addLog(`Agent started on ${data.source}`, 'agent');
          } else if (type === 'agent_progress') {
            setAgents((prev) => {
              const current = prev[data.task_id];
              if (!current) return prev;
              return {
                ...prev,
                [data.task_id]: {
                  ...current,
                  message: data.message,
                },
              };
            });
            addLog(`[${data.source}] ${data.message}`, 'progress');
          } else if (type === 'agent_retry') {
            setAgents((prev) => {
              const current = prev[data.task_id];
              if (!current) return prev;
              return {
                ...prev,
                [data.task_id]: {
                  ...current,
                  status: 'retrying',
                  message: `Retry attempt #${data.attempt}: ${data.error}`,
                },
              };
            });
            addLog(`Retry triggered on ${data.source}: ${data.error}`, 'warning');
          } else if (type === 'agent_fallback') {
            setAgents((prev) => {
              const current = prev[data.task_id];
              if (!current) return prev;
              return {
                ...prev,
                [data.task_id]: {
                  ...current,
                  status: 'fallback',
                  message: `Falling back to ${data.fallback_to}`,
                },
              };
            });
            addLog(`Agent switching to fallback: ${data.fallback_to}`, 'warning');
          } else if (type === 'opportunity_found') {
            setAgents((prev) => {
              const current = prev[data.raw.source] || Object.values(prev).find(a => a.source.includes(data.source));
              if (!current) return prev;
              return {
                ...prev,
                [current.taskId]: {
                  ...current,
                  foundCount: current.foundCount + 1,
                },
              };
            });
            addLog(`Discovered: "${data.raw.title}"`, 'found');
          } else if (type === 'agent_done') {
            setAgents((prev) => {
              const current = prev[data.task_id];
              if (!current) return prev;
              return {
                ...prev,
                [data.task_id]: {
                  ...current,
                  status: 'done',
                  message: `Completed extraction (${data.found_count ?? 1} items).`,
                },
              };
            });
          } else if (type === 'agent_failed') {
            setAgents((prev) => {
              const current = prev[data.task_id];
              if (!current) return prev;
              return {
                ...prev,
                [data.task_id]: {
                  ...current,
                  status: 'failed',
                  message: data.error || 'Agent encountered network error.',
                },
              };
            });
            addLog(`Agent failure: ${data.error}`, 'error');
          } else if (type === 'candidates_picked') {
            const d = data.dropped;
            setPrefilter({
              keptCount: data.kept_count,
              expiredCount: d.expired_count,
              duplicateCount: d.duplicate_count,
              offCount: d.off_count,
            });
            addLog(
              `Prefilter preserved top ${data.kept_count} candidates (dropped ${d.expired_count} expired, ${d.duplicate_count} duplicates).`,
              'info'
            );
          } else if (type === 'opportunity_scored') {
            setOpportunities((prev) => {
              const existingIdx = prev.findIndex((o) => o.opportunity.raw.id === data.scored.opportunity.raw.id);
              if (existingIdx >= 0) {
                const next = [...prev];
                next[existingIdx] = data.scored;
                return next;
              }
              return [...prev, data.scored];
            });
          } else if (type === 'draft_ready') {
            setDrafts((prev) => [...prev, data.draft]);
            addLog(`Application draft prepared for top match.`, 'success');
          } else if (type === 'result_ready') {
            setFinalResult(data.result);
            setOpportunities(data.result.ranked);
            setDrafts(data.result.drafts);
            setIsRunning(false);
            addLog(`Run completed in ${(data.result.duration_ms / 1000).toFixed(1)}s`, 'success');
            sse.close();
          } else if (type === 'run_error') {
            setError(data.error);
            setIsRunning(false);
            addLog(`Run halted: ${data.error}`, 'error');
            sse.close();
          }
        } catch (err) {
          console.error('Error handling SSE event:', err);
        }
      };

      sse.onerror = (err) => {
        console.warn('SSE stream closed or interrupted:', err);
        sse.close();
        setIsRunning(false);
      };
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch run');
      setIsRunning(false);
      addLog(`Failed to connect: ${err.message}`, 'error');
    }
  }, [addLog]);

  const resetRun = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    setIsRunning(false);
    setRunId(null);
    setProfile(null);
    setAgents({});
    setLogs([]);
    setPrefilter(null);
    setOpportunities([]);
    setDrafts([]);
    setFinalResult(null);
    setError(null);
  }, []);

  return {
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
    resetRun,
  };
}
