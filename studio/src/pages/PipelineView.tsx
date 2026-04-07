import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Pause,
  Edit,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Bot,
  Loader2,
  Activity,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { mockPipelines, mockExecutionRuns, mockFieldMappings, mockThroughputData } from '@/data/mock';
import type { ExecutionRun } from '@/types';

function StatusBadge({ status }: { status: 'success' | 'failed' | 'running' }) {
  const cfg = {
    success: { bg: '#EFF7ED', color: '#31A56D', label: 'Success', icon: <CheckCircle2 size={12} /> },
    failed: { bg: '#F9EEEE', color: '#D12329', label: 'Failed', icon: <XCircle size={12} /> },
    running: { bg: '#f0f0fc', color: '#6360D8', label: 'Running', icon: <Activity size={12} /> },
  }[status];

  return (
    <span
      className="flex items-center gap-1 rounded-[4px] px-2 py-0.5"
      style={{ background: cfg.bg, color: cfg.color, fontSize: 11, fontWeight: 600 }}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

function RunRow({ run, expanded, onToggle }: { run: ExecutionRun; expanded: boolean; onToggle: () => void }) {
  return (
    <>
      <tr
        className="group"
        style={{ borderBottom: '1px solid var(--table-border)', cursor: run.errorMessage ? 'pointer' : 'default' }}
        onClick={run.errorMessage ? onToggle : undefined}
        onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'var(--shell-hover)'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}
      >
        <td style={{ padding: '8px 16px', fontSize: 12, color: 'var(--shell-text)' }}>
          <div className="flex items-center gap-2">
            {run.errorMessage && (expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />)}
            {run.startedAt}
          </div>
        </td>
        <td style={{ padding: '8px 16px', fontSize: 12, color: 'var(--shell-text)' }}>{run.duration}</td>
        <td style={{ padding: '8px 16px', fontSize: 12, color: 'var(--shell-text)', fontVariantNumeric: 'tabular-nums' }}>{run.records}</td>
        <td style={{ padding: '8px 16px' }}><StatusBadge status={run.status} /></td>
      </tr>
      {run.errorMessage && expanded && (
        <tr>
          <td colSpan={4} style={{ padding: '0 16px 12px 40px' }}>
            <div
              className="rounded-[4px] p-3"
              style={{ background: '#F9EEEE', border: '1px solid #D12329', fontSize: 11, color: '#D12329', fontFamily: 'SF Mono, Fira Code, monospace' }}
            >
              {run.errorMessage}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function PipelineView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const pipeline = mockPipelines.find((p) => p.id === id) ?? mockPipelines[0];
  const [expandedRun, setExpandedRun] = useState<string | null>(null);
  const [diagnosing, setDiagnosing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<string | null>(null);

  const handleDiagnose = async () => {
    setDiagnosing(true);
    setDiagnosis(null);
    await new Promise((r) => setTimeout(r, 1800));
    setDiagnosis(
      '**Root Cause:** The REST API endpoint returned `403 Forbidden` after 3 retries. This typically indicates the API token has expired or been revoked.\n\n**Recommended Fix:**\n1. Navigate to **Settings → Credential Vault**\n2. Find "REST API Production Token"\n3. Click **Rotate** to generate a new token\n4. Trigger a manual re-run\n\n**Prevention:** Set up credential expiry alerts in Settings → Notifications.',
    );
    setDiagnosing(false);
  };

  const pipelineStatus = pipeline.status;
  const statusConfig = {
    active: { bg: '#EFF7ED', color: '#31A56D', label: 'Active' },
    paused: { bg: '#FEF3C7', color: '#D98B1D', label: 'Paused' },
    failed: { bg: '#F9EEEE', color: '#D12329', label: 'Failed' },
    running: { bg: '#f0f0fc', color: '#6360D8', label: 'Running' },
  }[pipelineStatus];

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Sub-header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/pipelines')}
          className="flex items-center justify-center rounded-full"
          style={{ width: 32, height: 32, background: 'var(--card-bg)', border: '1px solid var(--ctrl-border)', cursor: 'pointer', color: 'var(--shell-text-muted)' }}
        >
          <ArrowLeft size={14} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--shell-text)' }}>{pipeline.name}</span>
            <span
              className="rounded-[4px] px-2 py-0.5"
              style={{ background: statusConfig.bg, color: statusConfig.color, fontSize: 11, fontWeight: 600 }}
            >
              {statusConfig.label}
            </span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--shell-text-muted)' }}>
            Data Ingestion Studio / Pipelines / <span style={{ color: 'var(--shell-accent)' }}>{pipeline.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-2 rounded-[44px] px-3 py-1.5"
            style={{ fontSize: 12, background: 'var(--card-bg)', border: '1px solid var(--ctrl-border)', cursor: 'pointer', color: 'var(--shell-text)' }}
          >
            <Edit size={13} /> Edit
          </button>
          {pipelineStatus === 'active' ? (
            <button
              className="flex items-center gap-2 rounded-[44px] px-3 py-1.5"
              style={{ fontSize: 12, background: 'var(--card-bg)', border: '1px solid var(--ctrl-border)', cursor: 'pointer', color: 'var(--shell-text)' }}
            >
              <Pause size={13} /> Pause
            </button>
          ) : (
            <button
              className="flex items-center gap-2 rounded-[44px] px-4 py-1.5"
              style={{ fontSize: 12, background: 'var(--shell-accent)', border: 'none', cursor: 'pointer', color: '#fff', fontWeight: 500 }}
            >
              <Play size={13} /> Run Now
            </button>
          )}
          <button
            className="flex items-center gap-2 rounded-[44px] px-3 py-1.5"
            style={{ fontSize: 12, background: 'var(--card-bg)', border: '1px solid var(--ctrl-border)', cursor: 'pointer', color: 'var(--shell-text)' }}
          >
            <RefreshCw size={13} /> Re-run
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {[
          { label: 'Total Records', value: pipeline.records, delta: '+4.8% today', positive: true },
          { label: 'Avg Duration', value: pipeline.duration, delta: '-8s vs last week', positive: true },
          { label: 'Success Rate', value: `${pipeline.successRate}%`, delta: pipeline.successRate >= 98 ? 'Excellent' : 'Needs attention', positive: pipeline.successRate >= 95 },
          { label: 'Schedule', value: pipeline.schedule, delta: `Next: ${pipeline.nextRun}`, positive: true },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-[4px] p-3"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
          >
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--shell-text)' }}>{kpi.value}</div>
            <div style={{ fontSize: 11, color: 'var(--shell-text-muted)', marginTop: 2 }}>{kpi.label}</div>
            <div style={{ fontSize: 11, color: kpi.positive ? '#31A56D' : '#D98B1D', marginTop: 4 }}>{kpi.delta}</div>
          </div>
        ))}
      </div>

      {/* Throughput chart + Error diagnosis */}
      <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 320px' }}>
        {/* Throughput */}
        <div
          className="rounded-[4px] p-6"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--shell-text)', marginBottom: 16 }}>
            Records Throughput — Today
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={mockThroughputData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="throughGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6360D8" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6360D8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--table-border)" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: 'var(--shell-text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--shell-text-muted)' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 1000000).toFixed(1)}M`} />
              <Tooltip
                contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 4, fontSize: 12 }}
                formatter={(v: number) => [`${(v / 1000000).toFixed(2)}M`, 'Records']}
              />
              <Area type="monotone" dataKey="records" stroke="#6360D8" strokeWidth={2} fill="url(#throughGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* AI Diagnosis panel */}
        <div
          className="rounded-[4px] p-4 flex flex-col gap-4"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
        >
          <div className="flex items-center gap-2">
            <Bot size={16} style={{ color: 'var(--shell-accent)' }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--shell-text)' }}>AI Diagnosis</span>
          </div>

          {!diagnosis && !diagnosing && (
            <>
              <p style={{ fontSize: 12, color: 'var(--shell-text-muted)', lineHeight: 1.6 }}>
                {pipelineStatus === 'failed'
                  ? 'This pipeline has failed. Click below to let AI analyze the error logs and suggest a fix.'
                  : 'Run AI analysis to get insights on performance bottlenecks and optimization suggestions.'}
              </p>
              <button
                onClick={handleDiagnose}
                className="flex items-center justify-center gap-2 rounded-[44px] px-4 py-2"
                style={{ fontSize: 12, background: pipelineStatus === 'failed' ? '#dc2626' : 'var(--shell-accent)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 500 }}
              >
                <Bot size={14} />
                {pipelineStatus === 'failed' ? 'Diagnose Error' : 'Analyze Pipeline'}
              </button>
            </>
          )}

          {diagnosing && (
            <div className="flex items-center gap-2" style={{ fontSize: 12, color: 'var(--shell-text-muted)' }}>
              <Loader2 size={14} className="animate-spin" />
              Analyzing error logs…
            </div>
          )}

          {diagnosis && (
            <div style={{ fontSize: 12, color: 'var(--shell-text)', lineHeight: 1.6 }}>
              <div
                dangerouslySetInnerHTML={{
                  __html: diagnosis
                    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                    .replace(/`([^`]+)`/g, '<code style="background:var(--shell-raised);padding:1px 4px;border-radius:3px;font-size:11px">$1</code>')
                    .replace(/\n/g, '<br/>'),
                }}
              />
              <button
                onClick={() => setDiagnosis(null)}
                className="mt-3 rounded-[44px] px-3 py-1.5"
                style={{ fontSize: 11, background: 'var(--shell-raised)', border: '1px solid var(--ctrl-border)', cursor: 'pointer', color: 'var(--shell-text-muted)' }}
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Field mapping visualization */}
      <div
        className="rounded-[4px] p-6"
        style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
      >
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--shell-text)', marginBottom: 16 }}>
          Field Mappings — {pipeline.connector} → {pipeline.target}
        </div>
        <div className="flex flex-col gap-2">
          {mockFieldMappings.map((m) => (
            <div key={m.id} className="flex items-center gap-4">
              {/* Source */}
              <div
                className="flex items-center gap-2 rounded-[4px] px-3 py-1.5 flex-1"
                style={{ background: 'var(--shell-raised)', border: '1px solid var(--shell-border)' }}
              >
                <span style={{ fontSize: 12, color: 'var(--shell-text)', fontWeight: 500 }}>{m.source}</span>
                <span style={{ fontSize: 11, color: 'var(--shell-text-muted)' }}>{m.sourceType}</span>
              </div>

              {/* Arrow + confidence */}
              <div className="flex flex-col items-center gap-0.5 flex-shrink-0" style={{ width: 80 }}>
                <ArrowRight size={14} style={{ color: m.aiSuggested ? 'var(--shell-accent)' : 'var(--shell-text-muted)' }} />
                {m.aiSuggested && m.confidence !== undefined && (
                  <span
                    className="rounded-[4px] px-1.5"
                    style={{ fontSize: 10, background: 'var(--shell-active)', color: 'var(--shell-accent)', fontWeight: 600 }}
                  >
                    AI {m.confidence}%
                  </span>
                )}
              </div>

              {/* Target */}
              <div
                className="flex items-center gap-2 rounded-[4px] px-3 py-1.5 flex-1"
                style={{ background: 'var(--shell-raised)', border: '1px solid var(--shell-border)' }}
              >
                <span style={{ fontSize: 12, color: 'var(--shell-text)', fontWeight: 500 }}>{m.target}</span>
                <span style={{ fontSize: 11, color: 'var(--shell-text-muted)' }}>{m.targetType}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Execution history */}
      <div
        className="rounded-[4px] overflow-hidden"
        style={{ border: '1px solid var(--table-border)' }}
      >
        <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--table-border)' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--shell-text)' }}>Execution History</span>
        </div>
        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--table-th-bg)' }}>
              {['Started At', 'Duration', 'Records', 'Status'].map((h) => (
                <th
                  key={h}
                  style={{ padding: '8px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--shell-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid var(--table-border)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockExecutionRuns.map((run) => (
              <RunRow
                key={run.id}
                run={run}
                expanded={expandedRun === run.id}
                onToggle={() => setExpandedRun(expandedRun === run.id ? null : run.id)}
              />
            ))}
          </tbody>
        </table>
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderTop: '1px solid var(--table-border)' }}
        >
          <span style={{ fontSize: 11, color: 'var(--shell-text-muted)' }}>
            Showing 1–{mockExecutionRuns.length} of {mockExecutionRuns.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              className="flex items-center justify-center rounded-[4px]"
              style={{ width: 28, height: 28, fontSize: 12, border: '1px solid var(--shell-accent)', background: 'var(--shell-active)', color: 'var(--shell-accent)', cursor: 'pointer', fontWeight: 600 }}
            >
              1
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
