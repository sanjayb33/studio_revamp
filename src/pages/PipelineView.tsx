import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Play, Pause, Edit, RefreshCw, CheckCircle2, XCircle,
  ArrowRight, Bot, Loader2, Activity, ChevronDown, ChevronRight,
  Database, Settings2, Network, GitMerge, Upload, AlertTriangle,
  Eye, EyeOff, Zap, Check, GitMerge as Merge,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { mockPipelines, mockExecutionRuns, mockThroughputData } from '@/data/mock';
import type { PipelineStage, StageStatus, StageName } from '@/types';

// ─── Stage meta ───────────────────────────────────────────────────────────────

const STAGE_META: Record<StageName, { label: string; icon: React.ElementType; num: number }> = {
  ingest:  { label: 'Ingest',           icon: Database,  num: 1 },
  parse:   { label: 'Parse / Normalize',icon: Settings2, num: 2 },
  extract: { label: 'Extract Entities', icon: Network,   num: 3 },
  resolve: { label: 'Resolve',          icon: GitMerge,  num: 4 },
  publish: { label: 'KG Publish',       icon: Upload,    num: 5 },
};

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_CFG: Record<StageStatus, { bg: string; color: string; border: string; label: string }> = {
  healthy: { bg: '#EFF7ED', color: '#31A56D', border: '#31A56D40', label: 'Healthy' },
  warning: { bg: '#FEF3C7', color: '#D98B1D', border: '#D98B1D40', label: 'Warning' },
  error:   { bg: '#F9EEEE', color: '#D12329', border: '#D1232940', label: 'Error'   },
  idle:    { bg: 'var(--shell-raised)', color: 'var(--shell-text-muted)', border: 'var(--shell-border)', label: 'Idle' },
  running: { bg: 'var(--shell-active)', color: 'var(--shell-accent)',      border: 'var(--shell-accent)', label: 'Running' },
};

// ─── Mock data preview tables per stage ──────────────────────────────────────

const STAGE_PREVIEWS: Record<StageName, { headers: string[]; rows: string[][] }> = {
  ingest: {
    headers: ['raw_id', 'feed', 'event_time', 'payload', 'ingested_at'],
    rows: [
      ['evt_18240', 'Detections',     '2026-04-07T14:01:58Z', '2.4 KB', '14:02:01'],
      ['evt_18239', 'Detections',     '2026-04-07T14:01:57Z', '1.8 KB', '14:02:01'],
      ['evt_18238', 'Event Stream',   '2026-04-07T14:01:56Z', '3.1 KB', '14:02:01'],
      ['evt_18237', 'Device Inventory','2026-04-07T14:01:55Z','0.9 KB', '14:02:00'],
      ['evt_18236', 'Detections',     '2026-04-07T14:01:54Z', '2.2 KB', '14:02:00'],
    ],
  },
  parse: {
    headers: ['record_id', 'hostname', 'severity', 'tactic', 'observed_at'],
    rows: [
      ['evt_18240', 'ws-prod-042',  '8',  'Execution',         '2026-04-07 14:01:58'],
      ['evt_18239', 'srv-db-011',   '9',  'Persistence',       '2026-04-07 14:01:57'],
      ['evt_18238', 'ws-dev-107',   '4',  'Discovery',         '2026-04-07 14:01:56'],
      ['evt_18237', 'svc-app-003',  '7',  'Defense Evasion',   '2026-04-07 14:01:55'],
      ['evt_18236', 'ws-prod-019',  '6',  'Lateral Movement',  '2026-04-07 14:01:54'],
    ],
  },
  extract: {
    headers: ['entity_type', 'entity_id', 'confidence', 'source_record', 'extracted_at'],
    rows: [
      ['Alert', 'ALT-18240', '0.99', 'evt_18240', '14:02:03'],
      ['Asset', 'AST-00042', '0.97', 'evt_18240', '14:02:03'],
      ['Alert', 'ALT-18239', '0.98', 'evt_18239', '14:02:03'],
      ['Asset', 'AST-00011', '0.96', 'evt_18239', '14:02:03'],
      ['Alert', 'ALT-18238', '0.91', 'evt_18238', '14:02:03'],
    ],
  },
  resolve: {
    headers: ['entity_id', 'canonical_id', 'strategy', 'similarity', 'resolved_at'],
    rows: [
      ['AST-00042', 'CANO-4291', 'exact',  '1.00', '14:02:05'],
      ['AST-00011', 'CANO-1108', 'fuzzy',  '0.94', '14:02:05'],
      ['ALT-18240', 'CANO-8821', 'exact',  '1.00', '14:02:05'],
      ['ALT-18239', 'CANO-8820', 'ml',     '0.87', '14:02:05'],
      ['ALT-18238', 'CANO-8819', 'fuzzy',  '0.91', '14:02:05'],
    ],
  },
  publish: {
    headers: ['kg_node_id', 'entity_type', 'relations', 'published_at', 'operation'],
    rows: [
      ['KG-ALT-8821', 'Alert', '3', '14:02:07', 'upsert'],
      ['KG-AST-4291', 'Asset', '7', '14:02:07', 'upsert'],
      ['KG-ALT-8820', 'Alert', '2', '14:02:07', 'upsert'],
      ['KG-AST-1108', 'Asset', '5', '14:02:07', 'create'],
      ['KG-ALT-8819', 'Alert', '4', '14:02:07', 'upsert'],
    ],
  },
};

// ─── Disambiguation backlog (shown in Resolve stage detail) ──────────────────

const DISAMBIG_BACKLOG = [
  { id: 'db-1', entityType: 'Asset',    c1: 'web-server-01',    c2: 'WEB-SRV-01',      src1: 'CrowdStrike',     src2: 'Tenable',          sim: 94 },
  { id: 'db-2', entityType: 'Identity', c1: 'j.doe@acme.com',   c2: 'jdoe@acme.com',   src1: 'Okta',            src2: 'Active Directory',  sim: 91 },
  { id: 'db-3', entityType: 'Asset',    c1: '192.168.1.45',     c2: '192.168.1.045',   src1: 'Tenable',         src2: 'AWS Security Hub',  sim: 88 },
  { id: 'db-4', entityType: 'Asset',    c1: 'DESKTOP-XK22P',    c2: 'desktop-xk22p',   src1: 'Active Directory',src2: 'CrowdStrike',       sim: 99 },
  { id: 'db-5', entityType: 'IOC',      c1: '185.220.101.34',   c2: '185.220.101.034', src1: 'MISP',            src2: 'Recorded Future',   sim: 97 },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function PipelineStatusBadge({ status }: { status: string }) {
  const cfg = {
    active:  { bg: '#EFF7ED', color: '#31A56D', label: 'Active'  },
    paused:  { bg: '#FEF3C7', color: '#D98B1D', label: 'Paused'  },
    failed:  { bg: '#F9EEEE', color: '#D12329', label: 'Failed'  },
    running: { bg: 'var(--shell-active)', color: 'var(--shell-accent)', label: 'Running' },
  }[status] ?? { bg: 'var(--shell-raised)', color: 'var(--shell-text-muted)', label: status };

  return (
    <span
      className="rounded-[44px] px-2 py-0.5"
      style={{ background: cfg.bg, color: cfg.color, fontSize: 11, fontWeight: 600 }}
    >
      {cfg.label}
    </span>
  );
}

function RunStatusBadge({ status }: { status: 'success' | 'failed' | 'running' }) {
  const cfg = {
    success: { bg: '#EFF7ED', color: '#31A56D', label: 'Success', icon: <CheckCircle2 size={11} /> },
    failed:  { bg: '#F9EEEE', color: '#D12329', label: 'Failed',  icon: <XCircle size={11} />     },
    running: { bg: 'var(--shell-active)', color: 'var(--shell-accent)', label: 'Running', icon: <Activity size={11} /> },
  }[status];
  return (
    <span className="flex items-center gap-1 rounded-[44px] px-2 py-0.5" style={{ background: cfg.bg, color: cfg.color, fontSize: 11, fontWeight: 600 }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

// ─── Stage card in the health strip ──────────────────────────────────────────

interface StageCardProps {
  stage: PipelineStage;
  active: boolean;
  isLast: boolean;
  onSelect: () => void;
  onRunStage: () => void;
  runningStage: string | null;
}

function StageHealthCard({ stage, active, isLast, onSelect, onRunStage, runningStage }: StageCardProps) {
  const meta  = STAGE_META[stage.name];
  const scfg  = STATUS_CFG[runningStage === stage.name ? 'running' : stage.status];
  const Icon  = meta.icon;
  const isRunning = runningStage === stage.name;

  return (
    <div className="flex items-stretch gap-0" style={{ flex: 1, minWidth: 0 }}>
      {/* Card */}
      <button
        onClick={onSelect}
        style={{
          flex: 1,
          minWidth: 0,
          padding: '14px 14px 12px',
          borderRadius: 4,
          border: `1.5px solid ${active ? 'var(--shell-accent)' : scfg.border}`,
          background: active ? 'var(--shell-active)' : scfg.bg,
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'border-color 0.15s, background 0.15s',
          boxShadow: active ? '0 0 0 3px var(--shell-active)' : 'none',
          position: 'relative',
        }}
      >
        {/* Top row: number + status badge */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span
              className="flex items-center justify-center rounded-full text-[10px] font-bold"
              style={{
                width: 20, height: 20, flexShrink: 0,
                background: stage.status === 'healthy' ? '#31A56D'
                  : stage.status === 'error' ? '#D12329'
                  : stage.status === 'warning' ? '#D98B1D'
                  : isRunning ? 'var(--shell-accent)'
                  : 'var(--ctrl-border)',
                color: stage.status !== 'idle' || isRunning ? '#fff' : 'var(--shell-text-muted)',
              }}
            >
              {stage.status === 'healthy' ? <Check size={10} /> : meta.num}
            </span>
            <Icon size={13} style={{ color: scfg.color }} />
          </div>
          <span
            className="text-[9px] font-bold px-2 py-0.5 rounded-[44px]"
            style={{ background: scfg.bg, color: scfg.color, border: `1px solid ${scfg.border}` }}
          >
            {isRunning ? 'Running…' : scfg.label}
          </span>
        </div>

        {/* Stage name */}
        <p className="text-[11px] font-semibold mb-2 leading-tight" style={{ color: active ? 'var(--shell-accent)' : 'var(--shell-text)' }}>
          {meta.label}
        </p>

        {/* Records in/out */}
        {(stage.recordsIn !== undefined) ? (
          <div className="text-[10px]" style={{ color: 'var(--shell-text-muted)' }}>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>{stage.recordsIn?.toLocaleString()}</span>
            <span className="mx-1">→</span>
            <span style={{ fontVariantNumeric: 'tabular-nums', color: stage.dropRate && stage.dropRate > 1 ? '#D98B1D' : 'var(--shell-text-muted)' }}>
              {stage.recordsOut?.toLocaleString()}
            </span>
            {stage.dropRate !== undefined && stage.dropRate > 0 && (
              <span className="ml-1" style={{ color: stage.dropRate > 2 ? '#D12329' : '#D98B1D' }}>
                ({stage.dropRate}% drop)
              </span>
            )}
          </div>
        ) : (
          <div className="text-[10px]" style={{ color: 'var(--shell-text-muted)' }}>No data yet</div>
        )}

        {/* Error count badge */}
        {stage.errorCount !== undefined && stage.errorCount > 0 && (
          <div className="mt-1.5 flex items-center gap-1 text-[10px]" style={{ color: '#D98B1D' }}>
            <AlertTriangle size={10} />
            {stage.errorCount.toLocaleString()} pending
          </div>
        )}

        {/* Run stage button */}
        <button
          onClick={e => { e.stopPropagation(); onRunStage(); }}
          className="mt-2.5 w-full flex items-center justify-center gap-1 rounded-[44px] text-[10px] font-medium transition-colors"
          style={{
            padding: '4px 0',
            background: 'transparent',
            border: `1px solid ${scfg.border}`,
            color: scfg.color,
            cursor: 'pointer',
          }}
          title="Run this stage only"
        >
          {isRunning ? <Loader2 size={9} className="animate-spin" /> : <Zap size={9} />}
          {isRunning ? 'Running…' : 'Run stage'}
        </button>
      </button>

      {/* Connector arrow */}
      {!isLast && (
        <div className="flex items-center flex-shrink-0" style={{ width: 28 }}>
          <div style={{ flex: 1, height: 1.5, background: stage.status === 'healthy' ? '#31A56D' : 'var(--shell-border)' }} />
          <ArrowRight size={11} style={{ color: stage.status === 'healthy' ? '#31A56D' : 'var(--shell-text-muted)', flexShrink: 0 }} />
        </div>
      )}
    </div>
  );
}

// ─── Expanded stage detail panel ──────────────────────────────────────────────

function StageDetailPanel({ stage }: { stage: PipelineStage }) {
  const [showPreview, setShowPreview] = useState(false);
  const meta = STAGE_META[stage.name];
  const preview = STAGE_PREVIEWS[stage.name];

  const metrics = [
    { label: 'Records In',   value: stage.recordsIn?.toLocaleString()  ?? '—' },
    { label: 'Records Out',  value: stage.recordsOut?.toLocaleString() ?? '—' },
    { label: 'Drop Rate',    value: stage.dropRate !== undefined ? `${stage.dropRate}%` : '—' },
    { label: 'Last Duration',value: stage.lastRunDuration ?? '—' },
    { label: 'Error Count',  value: stage.errorCount?.toLocaleString() ?? '0' },
  ];

  return (
    <div
      className="rounded-[4px] overflow-hidden"
      style={{ border: '1px solid var(--card-border)', background: 'var(--card-bg)' }}
    >
      {/* Panel header */}
      <div
        className="flex items-center justify-between"
        style={{ padding: '12px 16px', borderBottom: '1px solid var(--card-border)', background: 'var(--shell-raised)' }}
      >
        <div className="flex items-center gap-2">
          <span
            className="flex items-center justify-center rounded-full text-[10px] font-bold"
            style={{ width: 20, height: 20, background: 'var(--shell-accent)', color: '#fff', flexShrink: 0 }}
          >
            {meta.num}
          </span>
          <span className="text-[13px] font-semibold" style={{ color: 'var(--shell-text)' }}>{meta.label}</span>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-[44px]"
            style={{ background: STATUS_CFG[stage.status].bg, color: STATUS_CFG[stage.status].color }}
          >
            {STATUS_CFG[stage.status].label}
          </span>
        </div>
        <button
          onClick={() => setShowPreview(v => !v)}
          className="flex items-center gap-1.5 text-[11px] font-medium rounded-[44px] transition-colors"
          style={{
            padding: '5px 12px',
            background: showPreview ? 'var(--shell-active)' : 'var(--ctrl-bg)',
            border: `1px solid ${showPreview ? 'var(--shell-accent)' : 'var(--ctrl-border)'}`,
            color: showPreview ? 'var(--shell-accent)' : 'var(--shell-text-muted)',
            cursor: 'pointer',
          }}
        >
          {showPreview ? <EyeOff size={12} /> : <Eye size={12} />}
          {showPreview ? 'Hide Preview' : 'Preview Data'}
        </button>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Metrics grid */}
        <div className="grid gap-3 mb-4" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
          {metrics.map(m => (
            <div key={m.label} className="rounded-[4px]" style={{ padding: '10px 12px', background: 'var(--shell-raised)', border: '1px solid var(--shell-border)' }}>
              <p className="text-[14px] font-bold" style={{ color: 'var(--shell-text)', fontVariantNumeric: 'tabular-nums' }}>{m.value}</p>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--shell-text-muted)' }}>{m.label}</p>
            </div>
          ))}
        </div>

        {/* Error / warning message */}
        {stage.errorMessage && (
          <div
            className="flex items-start gap-2 rounded-[4px] mb-4"
            style={{
              padding: '10px 12px',
              background: stage.status === 'error' ? '#F9EEEE' : '#FEF3C7',
              border: `1px solid ${stage.status === 'error' ? '#D12329' : '#D98B1D'}`,
            }}
          >
            <AlertTriangle size={14} style={{ color: stage.status === 'error' ? '#D12329' : '#D98B1D', flexShrink: 0, marginTop: 1 }} />
            <div>
              <p className="text-[12px] font-semibold" style={{ color: stage.status === 'error' ? '#D12329' : '#D98B1D' }}>
                {stage.status === 'error' ? 'Stage Error' : 'Stage Warning'}
              </p>
              <p className="text-[11px] mt-0.5 font-mono leading-relaxed" style={{ color: stage.status === 'error' ? '#D12329' : '#D98B1D' }}>
                {stage.errorMessage}
              </p>
            </div>
          </div>
        )}

        {/* Disambiguation backlog (Resolve stage only, only when there are pending items) */}
        {stage.name === 'resolve' && stage.errorCount !== undefined && stage.errorCount > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[12px] font-semibold" style={{ color: 'var(--shell-text)' }}>
                Disambiguation Backlog
                <span
                  className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-[3px]"
                  style={{ background: '#FEF3C7', color: '#D98B1D' }}
                >
                  342 pending
                </span>
              </p>
              <button
                className="text-[11px] rounded-[44px] transition-colors"
                style={{ padding: '4px 10px', background: 'var(--shell-active)', color: 'var(--shell-accent)', border: '1px solid var(--shell-accent)', cursor: 'pointer' }}
              >
                Review all
              </button>
            </div>
            <div
              className="rounded-[4px] overflow-hidden"
              style={{ border: '1px solid var(--table-border)', background: 'var(--card-bg)' }}
            >
              <table className="w-full" style={{ fontSize: 11, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--table-th-bg)' }}>
                    {['Entity Type', 'Candidate A', 'Candidate B', 'Sources', 'Similarity', 'Action'].map(h => (
                      <th key={h} className="text-left px-3 py-2 font-semibold uppercase" style={{ fontSize: 10, letterSpacing: '0.06em', color: 'var(--shell-text-muted)', borderBottom: '1px solid var(--table-border)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DISAMBIG_BACKLOG.map((row, i) => (
                    <tr key={row.id} className="group" style={{ borderTop: i > 0 ? '1px solid var(--table-border)' : undefined }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--shell-hover)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td className="px-3 py-2">
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded-[3px] font-medium"
                          style={{ background: 'var(--shell-active)', color: 'var(--shell-accent)' }}
                        >
                          {row.entityType}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-mono" style={{ color: 'var(--shell-text)' }}>{row.c1}</td>
                      <td className="px-3 py-2 font-mono" style={{ color: 'var(--shell-text)' }}>{row.c2}</td>
                      <td className="px-3 py-2" style={{ color: 'var(--shell-text-muted)' }}>
                        {row.src1} / {row.src2}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1.5">
                          <div style={{ flex: 1, height: 4, background: 'var(--shell-border)', borderRadius: 2, maxWidth: 48 }}>
                            <div style={{ width: `${row.sim}%`, height: '100%', background: row.sim >= 95 ? '#31A56D' : '#D98B1D', borderRadius: 2 }} />
                          </div>
                          <span style={{ color: row.sim >= 95 ? '#31A56D' : '#D98B1D', fontWeight: 600 }}>{row.sim}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1">
                          <button
                            className="flex items-center gap-0.5 text-[10px] rounded-[44px] font-medium transition-colors"
                            style={{ padding: '3px 8px', background: '#EFF7ED', color: '#31A56D', border: '1px solid #31A56D40', cursor: 'pointer' }}
                          >
                            <Merge size={9} /> Merge
                          </button>
                          <button
                            className="flex items-center gap-0.5 text-[10px] rounded-[44px] transition-colors"
                            style={{ padding: '3px 8px', background: 'var(--shell-raised)', color: 'var(--shell-text-muted)', border: '1px solid var(--ctrl-border)', cursor: 'pointer' }}
                          >
                            Skip
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Data preview table */}
        {showPreview && (
          <div>
            <p className="text-[12px] font-semibold mb-2" style={{ color: 'var(--shell-text)' }}>
              Data Preview
              <span className="ml-2 text-[10px] font-normal" style={{ color: 'var(--shell-text-muted)' }}>
                Sample — 5 of {stage.recordsOut?.toLocaleString() ?? '?'} records at this stage
              </span>
            </p>
            <div
              className="rounded-[4px] overflow-x-auto"
              style={{ border: '1px solid var(--table-border)', background: 'var(--card-bg)' }}
            >
              <table className="w-full" style={{ fontSize: 11, borderCollapse: 'collapse', minWidth: 560 }}>
                <thead>
                  <tr style={{ background: 'var(--table-th-bg)' }}>
                    {preview.headers.map(h => (
                      <th key={h} className="text-left px-3 py-2 font-semibold font-mono" style={{ color: 'var(--shell-text-muted)', borderBottom: '1px solid var(--table-border)', whiteSpace: 'nowrap' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map((row, ri) => (
                    <tr key={ri} style={{ borderTop: ri > 0 ? '1px solid var(--table-border)' : undefined }}>
                      {row.map((cell, ci) => (
                        <td key={ci} className="px-3 py-2 font-mono" style={{ color: 'var(--shell-text)', whiteSpace: 'nowrap' }}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Execution run row ────────────────────────────────────────────────────────

function RunRow({ run, expanded, onToggle }: { run: typeof mockExecutionRuns[0]; expanded: boolean; onToggle: () => void }) {
  // Derive failed stage from error message
  const failedStage = run.errorMessage
    ? run.errorMessage.toLowerCase().includes('ingest') ? 'Ingest'
    : run.errorMessage.toLowerCase().includes('parse') ? 'Parse'
    : run.errorMessage.toLowerCase().includes('extract') ? 'Extract'
    : run.errorMessage.toLowerCase().includes('resolve') ? 'Resolve'
    : run.errorMessage.toLowerCase().includes('publish') ? 'Publish'
    : '—'
    : '—';

  return (
    <>
      <tr
        style={{ borderTop: '1px solid var(--table-border)', cursor: run.errorMessage ? 'pointer' : 'default' }}
        onClick={run.errorMessage ? onToggle : undefined}
        onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'var(--shell-hover)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}
      >
        <td style={{ padding: '8px 16px', fontSize: 12, color: 'var(--shell-text)' }}>
          <div className="flex items-center gap-2">
            {run.errorMessage && (expanded ? <ChevronDown size={12} style={{ color: 'var(--shell-text-muted)' }} /> : <ChevronRight size={12} style={{ color: 'var(--shell-text-muted)' }} />)}
            {run.startedAt}
          </div>
        </td>
        <td style={{ padding: '8px 16px', fontSize: 12, color: 'var(--shell-text)' }}>{run.duration}</td>
        <td style={{ padding: '8px 16px', fontSize: 12, color: 'var(--shell-text)', fontVariantNumeric: 'tabular-nums' }}>{run.records}</td>
        <td style={{ padding: '8px 16px' }}><RunStatusBadge status={run.status} /></td>
        <td style={{ padding: '8px 16px', fontSize: 12, color: run.errorMessage ? '#D12329' : 'var(--shell-text-muted)' }}>
          {failedStage !== '—' ? (
            <span className="flex items-center gap-1">
              <AlertTriangle size={11} style={{ color: '#D12329' }} />
              {failedStage}
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <CheckCircle2 size={11} style={{ color: '#31A56D' }} />
              All stages
            </span>
          )}
        </td>
      </tr>
      {run.errorMessage && expanded && (
        <tr>
          <td colSpan={5} style={{ padding: '0 16px 12px 44px' }}>
            <div
              className="rounded-[4px] p-3"
              style={{ background: '#F9EEEE', border: '1px solid #D12329', fontSize: 11, color: '#D12329', fontFamily: 'SF Mono, Fira Code, monospace', lineHeight: 1.6 }}
            >
              {run.errorMessage}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PipelineView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const pipeline = mockPipelines.find(p => p.id === id) ?? mockPipelines[0];

  const [selectedStage, setSelectedStage] = useState<StageName | null>(null);
  const [runningStage, setRunningStage] = useState<string | null>(null);
  const [expandedRun, setExpandedRun] = useState<string | null>(null);
  const [diagnosing, setDiagnosing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<string | null>(null);

  const stages = pipeline.stages ?? [];

  function handleRunStage(stageName: string) {
    if (runningStage) return;
    setRunningStage(stageName);
    setTimeout(() => setRunningStage(null), 3000);
  }

  async function handleDiagnose() {
    setDiagnosing(true);
    setDiagnosis(null);
    await new Promise(r => setTimeout(r, 1800));
    setDiagnosis(
      '**Root Cause:** The REST API endpoint returned `503 Service Unavailable` after 3 retries. This typically indicates the source API is temporarily down or rate-limiting.\n\n**Recommended Fix:**\n1. Navigate to **Connectors → Credentials Vault**\n2. Find the connector credential and verify connectivity\n3. Check the vendor status page for outages\n4. Trigger a manual re-run once the source is back\n\n**Prevention:** Set up credential health monitoring in Configuration → Notifications.'
    );
    setDiagnosing(false);
  }

  // Stage health summary for top strip
  const healthCounts = stages.reduce(
    (acc, s) => { acc[s.status] = (acc[s.status] ?? 0) + 1; return acc; },
    {} as Record<string, number>
  );

  return (
    <div className="flex flex-col gap-5" style={{ padding: '20px 24px 32px' }}>

      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/pipelines')}
          className="flex items-center justify-center rounded-full flex-shrink-0"
          style={{ width: 30, height: 30, background: 'var(--card-bg)', border: '1px solid var(--ctrl-border)', cursor: 'pointer', color: 'var(--shell-text-muted)' }}
        >
          <ArrowLeft size={13} />
        </button>

        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <span className="text-[14px] font-semibold truncate" style={{ color: 'var(--shell-text)' }}>{pipeline.name}</span>
          <PipelineStatusBadge status={pipeline.status} />
          {pipeline.fromTemplate && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-[3px]" style={{ background: 'var(--shell-active)', color: 'var(--shell-accent)' }}>
              {pipeline.fromTemplate}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/pipeline/new?edit=${pipeline.id}`)}
            className="flex items-center gap-1.5 rounded-[44px] text-[12px] transition-colors"
            style={{ padding: '6px 12px', background: 'var(--card-bg)', border: '1px solid var(--ctrl-border)', cursor: 'pointer', color: 'var(--shell-text)' }}
          >
            <Edit size={12} /> Edit
          </button>
          <button
            className="flex items-center gap-1.5 rounded-[44px] text-[12px] transition-colors"
            style={{ padding: '6px 12px', background: 'var(--card-bg)', border: '1px solid var(--ctrl-border)', cursor: 'pointer', color: 'var(--shell-text)' }}
          >
            <RefreshCw size={12} /> Re-run All
          </button>
          {pipeline.status === 'active' ? (
            <button
              className="flex items-center gap-1.5 rounded-[44px] text-[12px] transition-colors"
              style={{ padding: '6px 12px', background: 'var(--card-bg)', border: '1px solid var(--ctrl-border)', cursor: 'pointer', color: 'var(--shell-text)' }}
            >
              <Pause size={12} /> Pause
            </button>
          ) : (
            <button
              className="flex items-center gap-1.5 rounded-[44px] text-[12px] font-medium"
              style={{ padding: '6px 14px', background: 'var(--shell-accent)', border: 'none', cursor: 'pointer', color: '#fff' }}
            >
              <Play size={12} /> Run Now
            </button>
          )}
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {[
          { label: 'Total Records',  value: pipeline.records,          sub: '+4.8% today',           pos: true  },
          { label: 'Avg Duration',   value: pipeline.duration,         sub: '−8s vs last week',      pos: true  },
          { label: 'Success Rate',   value: `${pipeline.successRate}%`, sub: pipeline.successRate >= 98 ? 'Excellent' : 'Needs attention', pos: pipeline.successRate >= 95 },
          { label: 'Next Run',       value: pipeline.nextRun,          sub: pipeline.schedule,       pos: true  },
        ].map(k => (
          <div key={k.label} className="rounded-[4px]" style={{ padding: '14px 16px', background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
            <p className="text-[14px] font-bold" style={{ color: 'var(--shell-text)', fontVariantNumeric: 'tabular-nums' }}>{k.value}</p>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--shell-text-muted)' }}>{k.label}</p>
            <p className="text-[11px] mt-1.5" style={{ color: k.pos ? '#31A56D' : '#D98B1D' }}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Stage health strip ── */}
      <div className="rounded-[4px]" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
        {/* Strip header */}
        <div
          className="flex items-center justify-between"
          style={{ padding: '14px 16px', borderBottom: '1px solid var(--card-border)' }}
        >
          <div>
            <p className="text-[13px] font-semibold" style={{ color: 'var(--shell-text)' }}>Stage Health</p>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--shell-text-muted)' }}>
              Click a stage to inspect — use "Run stage" to debug individual stages
            </p>
          </div>
          {/* Health summary pills */}
          <div className="flex items-center gap-2">
            {(['healthy', 'warning', 'error'] as StageStatus[]).map(s => {
              const count = healthCounts[s] ?? 0;
              if (!count) return null;
              return (
                <span
                  key={s}
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-[3px]"
                  style={{ background: STATUS_CFG[s].bg, color: STATUS_CFG[s].color }}
                >
                  {count} {STATUS_CFG[s].label}
                </span>
              );
            })}
            {stages.every(s => s.status === 'idle') && (
              <span className="text-[11px]" style={{ color: 'var(--shell-text-muted)' }}>Pipeline not yet run</span>
            )}
          </div>
        </div>

        {/* Stage cards */}
        <div className="flex items-stretch" style={{ padding: '20px 20px 16px' }}>
          {stages.length > 0 ? (
            stages.map((stage, idx) => (
              <StageHealthCard
                key={stage.name}
                stage={stage}
                active={selectedStage === stage.name}
                isLast={idx === stages.length - 1}
                onSelect={() => setSelectedStage(selectedStage === stage.name ? null : stage.name)}
                onRunStage={() => handleRunStage(stage.name)}
                runningStage={runningStage}
              />
            ))
          ) : (
            <p className="text-[12px]" style={{ color: 'var(--shell-text-muted)' }}>No stage data available for this pipeline.</p>
          )}
        </div>

        {/* Expanded stage detail */}
        {selectedStage && (
          <div style={{ padding: '0 16px 16px' }}>
            {stages.filter(s => s.name === selectedStage).map(stage => (
              <StageDetailPanel key={stage.name} stage={stage} />
            ))}
          </div>
        )}
      </div>

      {/* ── Throughput chart + AI Diagnosis ── */}
      <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 320px' }}>
        {/* Throughput */}
        <div className="rounded-[4px]" style={{ padding: '18px 20px', background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <p className="text-[13px] font-semibold mb-4" style={{ color: 'var(--shell-text)' }}>Records Throughput — Today</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={mockThroughputData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="tpGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6360D8" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6360D8" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--shell-border)" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: 'var(--shell-text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--shell-text-muted)' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 4, fontSize: 12 }}
                formatter={(v: number) => [`${v.toLocaleString()}`, 'Records']}
              />
              <Area type="monotone" dataKey="records" stroke="#6360D8" strokeWidth={2} fill="url(#tpGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* AI Diagnosis */}
        <div className="rounded-[4px] flex flex-col gap-4" style={{ padding: '18px 18px', background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <div className="flex items-center gap-2">
            <Bot size={15} style={{ color: 'var(--shell-accent)' }} />
            <p className="text-[13px] font-semibold" style={{ color: 'var(--shell-text)' }}>AI Diagnosis</p>
          </div>

          {!diagnosis && !diagnosing && (
            <>
              <p className="text-[12px] leading-relaxed" style={{ color: 'var(--shell-text-muted)' }}>
                {pipeline.status === 'failed'
                  ? 'This pipeline has failed. Let AI analyze the error logs and suggest a fix.'
                  : 'Run AI analysis for performance insights and optimization suggestions.'}
              </p>
              <button
                onClick={handleDiagnose}
                className="flex items-center justify-center gap-2 rounded-[44px] text-[12px] font-medium"
                style={{
                  padding: '8px 16px',
                  background: pipeline.status === 'failed' ? '#D12329' : 'var(--shell-accent)',
                  color: '#fff', border: 'none', cursor: 'pointer',
                }}
              >
                <Bot size={14} />
                {pipeline.status === 'failed' ? 'Diagnose Error' : 'Analyze Pipeline'}
              </button>
            </>
          )}

          {diagnosing && (
            <div className="flex items-center gap-2 text-[12px]" style={{ color: 'var(--shell-text-muted)' }}>
              <Loader2 size={14} className="animate-spin" /> Analyzing logs…
            </div>
          )}

          {diagnosis && (
            <div className="text-[12px] leading-relaxed" style={{ color: 'var(--shell-text)' }}>
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
                className="mt-3 rounded-[44px]"
                style={{ padding: '4px 12px', fontSize: 11, background: 'var(--shell-raised)', border: '1px solid var(--ctrl-border)', cursor: 'pointer', color: 'var(--shell-text-muted)' }}
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Execution history ── */}
      <div className="rounded-[4px] overflow-hidden" style={{ border: '1px solid var(--table-border)', background: 'var(--card-bg)' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--table-border)' }}>
          <p className="text-[13px] font-semibold" style={{ color: 'var(--shell-text)' }}>Execution History</p>
        </div>
        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--table-th-bg)' }}>
              {['Started At', 'Duration', 'Records', 'Status', 'Completed Through'].map(h => (
                <th
                  key={h}
                  className="text-left font-semibold uppercase"
                  style={{ padding: '8px 16px', fontSize: 10, letterSpacing: '0.05em', color: 'var(--shell-text-muted)', borderBottom: '1px solid var(--table-border)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockExecutionRuns.map(run => (
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
          className="flex items-center justify-between"
          style={{ padding: '10px 16px', borderTop: '1px solid var(--table-border)' }}
        >
          <span className="text-[11px]" style={{ color: 'var(--shell-text-muted)' }}>
            Showing 1–{mockExecutionRuns.length} of {mockExecutionRuns.length} runs
          </span>
          <div className="flex items-center gap-1">
            <button
              className="flex items-center justify-center rounded-[4px] text-[12px] font-bold"
              style={{ width: 28, height: 28, border: '1px solid var(--shell-accent)', background: 'var(--shell-active)', color: 'var(--shell-accent)', cursor: 'pointer' }}
            >
              1
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
