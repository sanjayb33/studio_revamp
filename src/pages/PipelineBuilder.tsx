import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ChevronRight, Check, Settings2, Play, Database, Network,
  GitMerge, Upload, Sparkles, X, CheckCircle2, Loader2,
  ArrowRight, Save, Zap, Info, AlertTriangle,
} from 'lucide-react';
import { mockCyberConnectors, mockPipelineTemplates } from '@/data/mock';
import type { KGEntityType, StageName, ConnectorType } from '@/types';

// ─── Stage Definitions ────────────────────────────────────────────────────────

interface StageDef {
  name: StageName;
  label: string;
  num: number;
  icon: React.ElementType;
  hint: string;
}

const STAGES: StageDef[] = [
  { name: 'ingest',  label: 'Ingest',           num: 1, icon: Database,  hint: 'Select a connector and feeds to pull data from' },
  { name: 'parse',   label: 'Parse / Normalize', num: 2, icon: Settings2, hint: 'Define how raw data is parsed and normalized' },
  { name: 'extract', label: 'Extract Entities',  num: 3, icon: Network,   hint: 'Choose which KG entity types to extract' },
  { name: 'resolve', label: 'Resolve',           num: 4, icon: GitMerge,  hint: 'Configure disambiguation and deduplication rules' },
  { name: 'publish', label: 'KG Publish',        num: 5, icon: Upload,    hint: 'Review and publish to the Knowledge Graph' },
];

// ─── Mock feed options per connector ─────────────────────────────────────────

const CONNECTOR_FEEDS: Partial<Record<ConnectorType, string[]>> = {
  'crowdstrike':      ['Detections',          'Event Stream',        'Device Inventory',    'Threat Graphs'],
  'splunk':           ['Notable Events',       'Search Alerts',       'Correlation Results', 'Risk Scores'],
  'misp':             ['Threat Events',        'IOC Feed',            'Galaxy Clusters',     'Sightings'],
  'okta':             ['System Log',           'Users',               'Groups',              'Auth Events'],
  'tenable':          ['Vulnerabilities',      'Assets',              'Scan Results',        'Plugin Data'],
  'aws-security-hub': ['Findings',             'Insights',            'Security Standards',  'Compliance Checks'],
  'sentinelone':      ['Threats',              'Agents',              'Activities'],
  'microsoft-sentinel':['Incidents',           'Alerts',              'Hunting Results'],
  'recorded-future':  ['Threat Actors',        'CVE Intelligence',    'Risk Scores'],
  'qualys':           ['VM Detections',        'Host Assets',         'Compliance Scans'],
  'active-directory': ['Users',                'Computers',           'Groups',              'OU Structure'],
};

// ─── KG Entity type config ────────────────────────────────────────────────────

const ALL_ENTITIES: KGEntityType[] = [
  'host', 'identity', 'vulnerability', 'finding', 'account', 'person',
  'application', 'network', 'network-interface', 'network-services',
  'cloud-account', 'cloud-container', 'cloud-cluster', 'cloud-storage',
  'assessment', 'Group',
];

const ENTITY_COLORS: Record<KGEntityType, string> = {
  host:               '#0EA5E9',
  identity:           '#DB2777',
  vulnerability:      '#DC2626',
  finding:            '#6360D8',
  account:            '#7C3AED',
  person:             '#0891B2',
  application:        '#D97706',
  network:            '#059669',
  'network-interface':'#EC4899',
  'network-services': '#65A30D',
  'cloud-account':    '#6D28D9',
  'cloud-container':  '#A78BFA',
  'cloud-cluster':    '#2563EB',
  'cloud-storage':    '#3B82F6',
  assessment:         '#B45309',
  Group:              '#0D9488',
};

// ─── Stage Config State ───────────────────────────────────────────────────────

interface IngestConfig   { connectorId?: ConnectorType; feeds: string[]; loadMode: 'incremental' | 'full'; }
interface ParseConfig    { parserType?: 'json' | 'cef' | 'syslog' | 'csv' | 'xml' | 'auto'; aiRules: boolean; }
interface ExtractConfig  { entityTypes: KGEntityType[]; aiPrediction: boolean; }
interface ResolveConfig  { intraDedupField: string; interStrategy: 'exact' | 'fuzzy' | 'ml'; ruleField: string; ruleOp: string; ruleValue: string; }
interface PublishConfig  { dryRun: boolean; confirmed: boolean; }

interface StageConfigs {
  ingest:  IngestConfig;
  parse:   ParseConfig;
  extract: ExtractConfig;
  resolve: ResolveConfig;
  publish: PublishConfig;
}

const DEFAULT_CONFIGS: StageConfigs = {
  ingest:  { feeds: [], loadMode: 'incremental' },
  parse:   { aiRules: false },
  extract: { entityTypes: [], aiPrediction: false },
  resolve: { intraDedupField: '', interStrategy: 'exact', ruleField: 'severity', ruleOp: '>=', ruleValue: '7' },
  publish: { dryRun: false, confirmed: false },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isStageConfigured(name: StageName, cfg: StageConfigs): boolean {
  switch (name) {
    case 'ingest':  return !!cfg.ingest.connectorId && cfg.ingest.feeds.length > 0;
    case 'parse':   return !!cfg.parse.parserType;
    case 'extract': return cfg.extract.entityTypes.length > 0;
    case 'resolve': return cfg.resolve.intraDedupField !== '';
    case 'publish': return cfg.publish.confirmed;
  }
}

// ─── Stage Card ───────────────────────────────────────────────────────────────

interface StageCardProps {
  stage: StageDef;
  idx: number;
  active: boolean;
  configured: boolean;
  locked: boolean;
  onClick: () => void;
}

function StageCard({ stage, idx, active, configured, locked, onClick }: StageCardProps) {
  const Icon = stage.icon;
  const isLast = idx === STAGES.length - 1;

  const borderColor = active
    ? 'var(--shell-accent)'
    : configured
    ? '#31A56D'
    : 'var(--card-border)';

  const bgColor = active
    ? 'var(--shell-active)'
    : configured
    ? '#F6FBF8'
    : 'var(--card-bg)';

  return (
    <div className="flex items-center gap-0">
      {/* Card */}
      <button
        onClick={locked ? undefined : onClick}
        disabled={locked}
        style={{
          width: 160,
          padding: '16px 14px',
          borderRadius: 4,
          border: `1.5px solid ${borderColor}`,
          background: bgColor,
          cursor: locked ? 'not-allowed' : 'pointer',
          opacity: locked ? 0.45 : 1,
          textAlign: 'left',
          transition: 'border-color 0.2s, background 0.2s, box-shadow 0.15s',
          boxShadow: active ? '0 0 0 3px var(--shell-active)' : 'none',
          position: 'relative',
        }}
      >
        {/* Number badge */}
        <div className="flex items-center justify-between mb-2">
          <span
            className="flex items-center justify-center rounded-full text-[11px] font-bold"
            style={{
              width: 22, height: 22,
              background: configured ? '#31A56D' : active ? 'var(--shell-accent)' : 'var(--shell-raised)',
              color: configured || active ? '#fff' : 'var(--shell-text-muted)',
              flexShrink: 0,
            }}
          >
            {configured ? <Check size={11} /> : stage.num}
          </span>
          <Icon
            size={15}
            style={{ color: configured ? '#31A56D' : active ? 'var(--shell-accent)' : 'var(--shell-text-muted)' }}
          />
        </div>

        {/* Label */}
        <p
          className="text-[12px] font-semibold leading-tight"
          style={{ color: active ? 'var(--shell-accent)' : configured ? '#31A56D' : 'var(--shell-text)' }}
        >
          {stage.label}
        </p>

        {/* Status text */}
        <p className="text-[10px] mt-1" style={{ color: 'var(--shell-text-muted)' }}>
          {configured ? 'Configured' : active ? 'Configuring…' : 'Click to configure'}
        </p>
      </button>

      {/* Arrow connector */}
      {!isLast && (
        <div className="flex items-center" style={{ width: 32, flexShrink: 0 }}>
          <div style={{ flex: 1, height: 1.5, background: configured ? '#31A56D' : 'var(--shell-border)' }} />
          <ArrowRight size={12} style={{ color: configured ? '#31A56D' : 'var(--shell-text-muted)', flexShrink: 0 }} />
        </div>
      )}
    </div>
  );
}

// ─── Left Panel ───────────────────────────────────────────────────────────────

interface LeftPanelProps {
  name: string;
  setName: (v: string) => void;
  configs: StageConfigs;
  setConfigs: React.Dispatch<React.SetStateAction<StageConfigs>>;
  schedule: string;
  setSchedule: (v: string) => void;
  scheduleLabel: string;
  setScheduleLabel: (v: string) => void;
}

const SCHEDULE_PRESETS = [
  { label: 'Real-time',    cron: '* * * * *'     },
  { label: 'Every 15 min', cron: '*/15 * * * *'  },
  { label: 'Hourly',       cron: '0 * * * *'     },
  { label: 'Daily',        cron: '0 8 * * *'     },
  { label: 'Custom',       cron: ''              },
];

function LeftPanel({ name, setName, configs, schedule, setSchedule, scheduleLabel, setScheduleLabel }: LeftPanelProps) {
  const selectedConnector = configs.ingest.connectorId
    ? mockCyberConnectors.find(c => c.id === configs.ingest.connectorId)
    : null;

  return (
    <div
      style={{
        width: 240,
        flexShrink: 0,
        borderRight: '1px solid var(--shell-border)',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        overflowY: 'auto',
        background: 'var(--card-bg)',
      }}
    >
      {/* Pipeline Name */}
      <div>
        <label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--shell-text-muted)' }}>
          Pipeline Name
        </label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. CrowdStrike Alerts"
          className="w-full mt-1.5 text-[13px] rounded-[4px] outline-none"
          style={{
            border: '1px solid var(--ctrl-border)',
            background: 'var(--ctrl-bg)',
            padding: '7px 10px',
            color: 'var(--shell-text)',
          }}
        />
      </div>

      {/* Selected connector (shows when Ingest is configured) */}
      {selectedConnector && (
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--shell-text-muted)' }}>
            Data Source
          </label>
          <div
            className="mt-1.5 flex items-center gap-2 rounded-[4px]"
            style={{ padding: '8px 10px', background: '#EFF7ED', border: '1px solid #31A56D40' }}
          >
            <CheckCircle2 size={12} style={{ color: '#31A56D', flexShrink: 0 }} />
            <div className="min-w-0">
              <p className="text-[12px] font-medium truncate" style={{ color: 'var(--shell-text)' }}>{selectedConnector.name}</p>
              <p className="text-[10px]" style={{ color: '#31A56D' }}>
                {configs.ingest.feeds.length} feed{configs.ingest.feeds.length !== 1 ? 's' : ''} · {configs.ingest.loadMode}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Schedule */}
      <div>
        <label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--shell-text-muted)' }}>
          Schedule
        </label>
        <div className="mt-2 flex flex-col gap-1.5">
          {SCHEDULE_PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => { setScheduleLabel(p.label); if (p.label !== 'Custom') setSchedule(p.cron); }}
              className="flex items-center gap-2 text-[12px] rounded-[4px] text-left transition-colors"
              style={{
                padding: '6px 10px',
                background: scheduleLabel === p.label ? 'var(--shell-active)' : 'transparent',
                border: `1px solid ${scheduleLabel === p.label ? 'var(--shell-accent)' : 'transparent'}`,
                color: scheduleLabel === p.label ? 'var(--shell-accent)' : 'var(--shell-text)',
                cursor: 'pointer',
              }}
            >
              <span
                className="rounded-full flex-shrink-0"
                style={{
                  width: 12, height: 12,
                  border: `2px solid ${scheduleLabel === p.label ? 'var(--shell-accent)' : 'var(--ctrl-border)'}`,
                  background: scheduleLabel === p.label ? 'var(--shell-accent)' : 'transparent',
                }}
              />
              {p.label}
            </button>
          ))}
        </div>
        {scheduleLabel === 'Custom' && (
          <input
            value={schedule}
            onChange={e => setSchedule(e.target.value)}
            placeholder="*/30 * * * *"
            className="w-full mt-2 text-[12px] font-mono rounded-[4px] outline-none"
            style={{
              border: '1px solid var(--ctrl-border)',
              background: 'var(--ctrl-bg)',
              padding: '6px 10px',
              color: 'var(--shell-text)',
            }}
          />
        )}
        {schedule && scheduleLabel !== 'Custom' && (
          <p className="mt-1.5 text-[11px] font-mono" style={{ color: 'var(--shell-text-muted)' }}>{schedule}</p>
        )}
      </div>

      {/* Pipeline info box */}
      <div
        className="rounded-[4px]"
        style={{ background: 'var(--shell-raised)', border: '1px solid var(--shell-border)', padding: '12px' }}
      >
        <p className="text-[11px] font-semibold" style={{ color: 'var(--shell-text)' }}>5-Stage Pipeline</p>
        <p className="text-[11px] mt-1 leading-relaxed" style={{ color: 'var(--shell-text-muted)' }}>
          Configure each stage in any order. Stages turn green when configured.
        </p>
        <div className="mt-3 flex flex-col gap-1">
          {STAGES.map(s => (
            <div key={s.name} className="flex items-center gap-2 text-[11px]" style={{ color: 'var(--shell-text-muted)' }}>
              <span style={{ width: 16, height: 16, borderRadius: 12, background: 'var(--shell-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: 'var(--shell-text-muted)', flexShrink: 0 }}>{s.num}</span>
              {s.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Stage Config Panels ──────────────────────────────────────────────────────

function IngestPanel({
  cfg,
  setCfg,
  onDone,
}: {
  cfg: IngestConfig;
  setCfg: (c: IngestConfig) => void;
  onDone: () => void;
}) {
  const configuredConnectors = mockCyberConnectors.filter(c => c.configured);
  const feeds = cfg.connectorId ? (CONNECTOR_FEEDS[cfg.connectorId] ?? []) : [];

  function toggleFeed(f: string) {
    const already = cfg.feeds.includes(f);
    setCfg({ ...cfg, feeds: already ? cfg.feeds.filter(x => x !== f) : [...cfg.feeds, f] });
  }

  const ready = !!cfg.connectorId && cfg.feeds.length > 0;

  return (
    <div className="flex flex-col gap-5">
      {/* Connector select */}
      <div>
        <label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--shell-text-muted)' }}>
          Connector <span style={{ color: '#D12329' }}>*</span>
        </label>
        <div className="mt-2 flex flex-col gap-1.5">
          {configuredConnectors.map(c => (
            <button
              key={c.id}
              onClick={() => setCfg({ ...cfg, connectorId: c.id, feeds: [] })}
              className="flex items-center gap-2.5 text-left rounded-[4px] transition-colors"
              style={{
                padding: '8px 10px',
                border: `1.5px solid ${cfg.connectorId === c.id ? 'var(--shell-accent)' : 'var(--ctrl-border)'}`,
                background: cfg.connectorId === c.id ? 'var(--shell-active)' : 'var(--ctrl-bg)',
                cursor: 'pointer',
              }}
            >
              <span
                className="rounded-full flex-shrink-0"
                style={{
                  width: 14, height: 14,
                  border: `2px solid ${cfg.connectorId === c.id ? 'var(--shell-accent)' : 'var(--ctrl-border)'}`,
                  background: cfg.connectorId === c.id ? 'var(--shell-accent)' : 'transparent',
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium" style={{ color: 'var(--shell-text)' }}>{c.name}</p>
                <p className="text-[10px] truncate" style={{ color: 'var(--shell-text-muted)' }}>{c.configuredAs}</p>
              </div>
              <span
                className="text-[9px] px-1.5 py-0.5 rounded-[3px] flex-shrink-0"
                style={{ background: '#EFF7ED', color: '#31A56D', fontWeight: 600 }}
              >
                Connected
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Feed selection */}
      {feeds.length > 0 && (
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--shell-text-muted)' }}>
            Data Feeds <span style={{ color: '#D12329' }}>*</span>
          </label>
          <p className="text-[11px] mt-1 mb-2" style={{ color: 'var(--shell-text-muted)' }}>
            Select feeds to ingest from this connector
          </p>
          <div className="flex flex-col gap-1.5">
            {feeds.map(f => (
              <label key={f} className="flex items-center gap-2.5 cursor-pointer">
                <span
                  className="flex items-center justify-center rounded-[3px] flex-shrink-0"
                  onClick={() => toggleFeed(f)}
                  style={{
                    width: 16, height: 16,
                    border: `2px solid ${cfg.feeds.includes(f) ? 'var(--shell-accent)' : 'var(--ctrl-border)'}`,
                    background: cfg.feeds.includes(f) ? 'var(--shell-accent)' : 'var(--ctrl-bg)',
                    cursor: 'pointer',
                  }}
                >
                  {cfg.feeds.includes(f) && <Check size={9} color="#fff" />}
                </span>
                <span className="text-[12px]" style={{ color: 'var(--shell-text)' }}>{f}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Load mode */}
      {cfg.connectorId && (
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--shell-text-muted)' }}>
            Load Mode
          </label>
          <div className="mt-2 flex gap-2">
            {(['incremental', 'full'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setCfg({ ...cfg, loadMode: mode })}
                className="flex-1 text-[12px] rounded-[4px] transition-colors"
                style={{
                  padding: '7px 0',
                  border: `1.5px solid ${cfg.loadMode === mode ? 'var(--shell-accent)' : 'var(--ctrl-border)'}`,
                  background: cfg.loadMode === mode ? 'var(--shell-active)' : 'var(--ctrl-bg)',
                  color: cfg.loadMode === mode ? 'var(--shell-accent)' : 'var(--shell-text)',
                  fontWeight: cfg.loadMode === mode ? 600 : 400,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {mode === 'incremental' ? 'Incremental' : 'Full Load'}
              </button>
            ))}
          </div>
          <p className="text-[10px] mt-1.5" style={{ color: 'var(--shell-text-muted)' }}>
            {cfg.loadMode === 'incremental' ? 'Only fetch new/changed records since last run.' : 'Re-ingest all records on every run.'}
          </p>
        </div>
      )}

      <button
        onClick={ready ? onDone : undefined}
        disabled={!ready}
        className="rounded-[44px] text-[12px] font-semibold transition-colors"
        style={{
          padding: '9px 0',
          background: ready ? 'var(--shell-accent)' : 'var(--shell-raised)',
          color: ready ? '#fff' : 'var(--shell-text-muted)',
          border: 'none',
          cursor: ready ? 'pointer' : 'not-allowed',
        }}
      >
        {ready ? 'Confirm Ingest Stage' : 'Select connector & feeds to continue'}
      </button>
    </div>
  );
}

function ParsePanel({ cfg, setCfg, onDone }: { cfg: ParseConfig; setCfg: (c: ParseConfig) => void; onDone: () => void; }) {
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const PARSER_TYPES = [
    { id: 'json',    label: 'JSON',        desc: 'Standard JSON / NDJSON' },
    { id: 'cef',     label: 'CEF',         desc: 'Common Event Format (ArcSight)' },
    { id: 'syslog',  label: 'Syslog',      desc: 'RFC 3164 / RFC 5424' },
    { id: 'csv',     label: 'CSV',         desc: 'Comma-separated values' },
    { id: 'xml',     label: 'XML',         desc: 'Structured XML payloads' },
    { id: 'auto',    label: 'Auto-detect', desc: 'AI infers format at runtime' },
  ] as const;

  const SAMPLE_FIELDS = [
    { raw: 'event_id',       normalized: 'record_id',     type: 'string' },
    { raw: 'host_name',      normalized: 'asset.hostname',type: 'string' },
    { raw: 'severity',       normalized: 'alert.severity',type: 'integer' },
    { raw: 'detection_time', normalized: 'observed_at',   type: 'timestamp' },
    { raw: 'tactic',         normalized: 'mitre.tactic',  type: 'string' },
  ];

  function handleAI() {
    if (generated) return;
    setGenerating(true);
    setTimeout(() => { setGenerating(false); setGenerated(true); setCfg({ ...cfg, aiRules: true }); }, 1800);
  }

  const ready = !!cfg.parserType;

  return (
    <div className="flex flex-col gap-5">
      {/* Parser type */}
      <div>
        <label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--shell-text-muted)' }}>
          Parser Type <span style={{ color: '#D12329' }}>*</span>
        </label>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {PARSER_TYPES.map(p => (
            <button
              key={p.id}
              onClick={() => setCfg({ ...cfg, parserType: p.id as ParseConfig['parserType'] })}
              className="text-left rounded-[4px] transition-colors"
              style={{
                padding: '8px 10px',
                border: `1.5px solid ${cfg.parserType === p.id ? 'var(--shell-accent)' : 'var(--ctrl-border)'}`,
                background: cfg.parserType === p.id ? 'var(--shell-active)' : 'var(--ctrl-bg)',
                cursor: 'pointer',
              }}
            >
              <p className="text-[12px] font-semibold" style={{ color: cfg.parserType === p.id ? 'var(--shell-accent)' : 'var(--shell-text)' }}>{p.label}</p>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--shell-text-muted)' }}>{p.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Field preview (shown once type is selected) */}
      {cfg.parserType && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--shell-text-muted)' }}>
              Field Preview
            </label>
            <button
              onClick={handleAI}
              disabled={generating}
              className="flex items-center gap-1 text-[11px] font-medium rounded-[44px] transition-colors"
              style={{
                padding: '4px 10px',
                background: generated ? '#EFF7ED' : 'var(--shell-active)',
                color: generated ? '#31A56D' : 'var(--shell-accent)',
                border: `1px solid ${generated ? '#31A56D' : 'var(--shell-accent)'}`,
                cursor: generating ? 'default' : 'pointer',
              }}
            >
              {generating ? <Loader2 size={11} className="animate-spin" /> : generated ? <Check size={11} /> : <Sparkles size={11} />}
              {generating ? 'Generating…' : generated ? 'Rules generated' : 'AI-generate rules'}
            </button>
          </div>
          <div
            className="rounded-[4px] overflow-hidden"
            style={{ border: '1px solid var(--table-border)', background: 'var(--card-bg)' }}
          >
            <table className="w-full" style={{ fontSize: 11, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--table-th-bg)' }}>
                  <th className="text-left px-2.5 py-1.5 font-semibold uppercase" style={{ fontSize: 10, letterSpacing: '0.06em', color: 'var(--shell-text-muted)', borderBottom: '1px solid var(--table-border)' }}>Raw field</th>
                  <th className="text-left px-2.5 py-1.5 font-semibold uppercase" style={{ fontSize: 10, letterSpacing: '0.06em', color: 'var(--shell-text-muted)', borderBottom: '1px solid var(--table-border)' }}>Normalized</th>
                  <th className="text-left px-2.5 py-1.5 font-semibold uppercase" style={{ fontSize: 10, letterSpacing: '0.06em', color: 'var(--shell-text-muted)', borderBottom: '1px solid var(--table-border)' }}>Type</th>
                </tr>
              </thead>
              <tbody>
                {SAMPLE_FIELDS.map((f, i) => (
                  <tr key={i} style={{ borderTop: '1px solid var(--table-border)' }}>
                    <td className="px-2.5 py-1.5 font-mono" style={{ color: 'var(--shell-text)' }}>{f.raw}</td>
                    <td className="px-2.5 py-1.5 font-mono" style={{ color: generated ? 'var(--shell-accent)' : 'var(--shell-text-muted)' }}>
                      {generated ? f.normalized : '—'}
                    </td>
                    <td className="px-2.5 py-1.5" style={{ color: 'var(--shell-text-muted)' }}>{f.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {generated && (
            <p className="text-[10px] mt-1.5 flex items-center gap-1" style={{ color: '#31A56D' }}>
              <Check size={10} /> 5 field mappings generated by AI
            </p>
          )}
        </div>
      )}

      <button
        onClick={ready ? onDone : undefined}
        disabled={!ready}
        className="rounded-[44px] text-[12px] font-semibold transition-colors"
        style={{
          padding: '9px 0',
          background: ready ? 'var(--shell-accent)' : 'var(--shell-raised)',
          color: ready ? '#fff' : 'var(--shell-text-muted)',
          border: 'none',
          cursor: ready ? 'pointer' : 'not-allowed',
        }}
      >
        {ready ? 'Confirm Parse Stage' : 'Select a parser type to continue'}
      </button>
    </div>
  );
}

function ExtractPanel({ cfg, setCfg, onDone }: { cfg: ExtractConfig; setCfg: (c: ExtractConfig) => void; onDone: () => void; }) {
  function toggleEntity(e: KGEntityType) {
    const has = cfg.entityTypes.includes(e);
    setCfg({ ...cfg, entityTypes: has ? cfg.entityTypes.filter(x => x !== e) : [...cfg.entityTypes, e] });
  }

  const ready = cfg.entityTypes.length > 0;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--shell-text-muted)' }}>
          KG Entity Types <span style={{ color: '#D12329' }}>*</span>
        </label>
        <p className="text-[11px] mt-1 mb-3" style={{ color: 'var(--shell-text-muted)' }}>
          Select which entity types to extract from parsed records
        </p>
        <div className="grid grid-cols-2 gap-2">
          {ALL_ENTITIES.map(entity => {
            const selected = cfg.entityTypes.includes(entity);
            const color = ENTITY_COLORS[entity];
            return (
              <button
                key={entity}
                onClick={() => toggleEntity(entity)}
                className="flex items-center gap-2 rounded-[4px] text-left transition-colors"
                style={{
                  padding: '8px 10px',
                  border: `1.5px solid ${selected ? color : 'var(--ctrl-border)'}`,
                  background: selected ? `${color}14` : 'var(--ctrl-bg)',
                  cursor: 'pointer',
                }}
              >
                <span
                  className="flex items-center justify-center rounded-[3px] flex-shrink-0"
                  style={{
                    width: 16, height: 16,
                    border: `2px solid ${selected ? color : 'var(--ctrl-border)'}`,
                    background: selected ? color : 'transparent',
                  }}
                >
                  {selected && <Check size={9} color="#fff" />}
                </span>
                <span className="text-[12px] font-medium" style={{ color: selected ? color : 'var(--shell-text)' }}>
                  {entity}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* AI prediction toggle */}
      <div
        className="flex items-center justify-between rounded-[4px]"
        style={{ padding: '10px 12px', border: '1px solid var(--card-border)', background: 'var(--card-bg)' }}
      >
        <div>
          <p className="text-[12px] font-medium" style={{ color: 'var(--shell-text)' }}>AI Attribute Prediction</p>
          <p className="text-[10px] mt-0.5" style={{ color: 'var(--shell-text-muted)' }}>
            Auto-fill missing attributes using AI inference
          </p>
        </div>
        <button
          onClick={() => setCfg({ ...cfg, aiPrediction: !cfg.aiPrediction })}
          className="rounded-full transition-colors flex-shrink-0"
          style={{
            width: 36, height: 20,
            background: cfg.aiPrediction ? 'var(--shell-accent)' : 'var(--ctrl-border)',
            position: 'relative',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <span
            className="absolute rounded-full transition-all"
            style={{
              width: 14, height: 14,
              background: '#fff',
              top: 3, left: cfg.aiPrediction ? 19 : 3,
            }}
          />
        </button>
      </div>

      <button
        onClick={ready ? onDone : undefined}
        disabled={!ready}
        className="rounded-[44px] text-[12px] font-semibold transition-colors"
        style={{
          padding: '9px 0',
          background: ready ? 'var(--shell-accent)' : 'var(--shell-raised)',
          color: ready ? '#fff' : 'var(--shell-text-muted)',
          border: 'none',
          cursor: ready ? 'pointer' : 'not-allowed',
        }}
      >
        {ready ? `Confirm — ${cfg.entityTypes.length} entity type${cfg.entityTypes.length > 1 ? 's' : ''} selected` : 'Select at least one entity type'}
      </button>
    </div>
  );
}

function ResolvePanel({ cfg, setCfg, onDone }: { cfg: ResolveConfig; setCfg: (c: ResolveConfig) => void; onDone: () => void; }) {
  const DEDUP_FIELDS = ['record_id', 'ip_address', 'hostname', 'email', 'cve_id', 'sha256_hash', 'domain'];
  const OPERATORS = ['>=', '<=', '==', '!=', 'contains', 'starts_with'];

  const ready = cfg.intraDedupField !== '';

  return (
    <div className="flex flex-col gap-5">
      {/* Intra-source dedup */}
      <div>
        <label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--shell-text-muted)' }}>
          Intra-source Deduplication <span style={{ color: '#D12329' }}>*</span>
        </label>
        <p className="text-[11px] mt-1 mb-2" style={{ color: 'var(--shell-text-muted)' }}>
          Field used to identify duplicate records within a single source
        </p>
        <select
          value={cfg.intraDedupField}
          onChange={e => setCfg({ ...cfg, intraDedupField: e.target.value })}
          className="w-full text-[12px] rounded-[4px] outline-none"
          style={{
            border: '1px solid var(--ctrl-border)',
            background: 'var(--ctrl-bg)',
            padding: '7px 10px',
            color: cfg.intraDedupField ? 'var(--shell-text)' : 'var(--shell-text-muted)',
          }}
        >
          <option value="">— Select dedup field —</option>
          {DEDUP_FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      {/* Inter-source strategy */}
      <div>
        <label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--shell-text-muted)' }}>
          Inter-source Matching Strategy
        </label>
        <p className="text-[11px] mt-1 mb-2" style={{ color: 'var(--shell-text-muted)' }}>
          How to resolve entities across different connectors
        </p>
        <div className="flex flex-col gap-1.5">
          {([
            { id: 'exact', label: 'Exact Match',  desc: 'Identical field values only — highest precision' },
            { id: 'fuzzy', label: 'Fuzzy Match',  desc: 'Approximate matching with configurable threshold' },
            { id: 'ml',    label: 'ML-based',     desc: 'AI model scores entity similarity' },
          ] as const).map(s => (
            <button
              key={s.id}
              onClick={() => setCfg({ ...cfg, interStrategy: s.id })}
              className="flex items-center gap-2.5 text-left rounded-[4px] transition-colors"
              style={{
                padding: '8px 10px',
                border: `1.5px solid ${cfg.interStrategy === s.id ? 'var(--shell-accent)' : 'var(--ctrl-border)'}`,
                background: cfg.interStrategy === s.id ? 'var(--shell-active)' : 'var(--ctrl-bg)',
                cursor: 'pointer',
              }}
            >
              <span
                className="rounded-full flex-shrink-0"
                style={{
                  width: 14, height: 14,
                  border: `2px solid ${cfg.interStrategy === s.id ? 'var(--shell-accent)' : 'var(--ctrl-border)'}`,
                  background: cfg.interStrategy === s.id ? 'var(--shell-accent)' : 'transparent',
                }}
              />
              <div>
                <p className="text-[12px] font-medium" style={{ color: cfg.interStrategy === s.id ? 'var(--shell-accent)' : 'var(--shell-text)' }}>{s.label}</p>
                <p className="text-[10px]" style={{ color: 'var(--shell-text-muted)' }}>{s.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Guided rule builder */}
      <div>
        <label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--shell-text-muted)' }}>
          Guided Rule Builder
        </label>
        <p className="text-[11px] mt-1 mb-2" style={{ color: 'var(--shell-text-muted)' }}>
          Filter which records enter the resolve stage
        </p>
        <div className="flex items-center gap-2">
          <select
            value={cfg.ruleField}
            onChange={e => setCfg({ ...cfg, ruleField: e.target.value })}
            className="flex-1 text-[12px] rounded-[4px] outline-none"
            style={{ border: '1px solid var(--ctrl-border)', background: 'var(--ctrl-bg)', padding: '6px 8px', color: 'var(--shell-text)' }}
          >
            {['severity', 'confidence', 'risk_score', 'entity_count'].map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <select
            value={cfg.ruleOp}
            onChange={e => setCfg({ ...cfg, ruleOp: e.target.value })}
            className="text-[12px] rounded-[4px] outline-none"
            style={{ border: '1px solid var(--ctrl-border)', background: 'var(--ctrl-bg)', padding: '6px 8px', color: 'var(--shell-text)', width: 72 }}
          >
            {OPERATORS.map(op => <option key={op} value={op}>{op}</option>)}
          </select>
          <input
            value={cfg.ruleValue}
            onChange={e => setCfg({ ...cfg, ruleValue: e.target.value })}
            className="text-[12px] rounded-[4px] outline-none"
            style={{ border: '1px solid var(--ctrl-border)', background: 'var(--ctrl-bg)', padding: '6px 8px', color: 'var(--shell-text)', width: 56 }}
          />
        </div>
        <p className="text-[10px] mt-1.5" style={{ color: 'var(--shell-text-muted)' }}>
          Only records where <span style={{ color: 'var(--shell-accent)', fontFamily: 'monospace' }}>{cfg.ruleField} {cfg.ruleOp} {cfg.ruleValue}</span> will be resolved
        </p>
      </div>

      <button
        onClick={ready ? onDone : undefined}
        disabled={!ready}
        className="rounded-[44px] text-[12px] font-semibold transition-colors"
        style={{
          padding: '9px 0',
          background: ready ? 'var(--shell-accent)' : 'var(--shell-raised)',
          color: ready ? '#fff' : 'var(--shell-text-muted)',
          border: 'none',
          cursor: ready ? 'pointer' : 'not-allowed',
        }}
      >
        {ready ? 'Confirm Resolve Stage' : 'Select a dedup field to continue'}
      </button>
    </div>
  );
}

// ─── Dry Run Preview ─────────────────────────────────────────────────────────

const SAMPLE_ENTITIES: Partial<Record<KGEntityType, object[]>> = {
  host: [
    { id: 'host::prod-web-01', hostname: 'prod-web-01', ip: '10.0.4.21', os: 'Ubuntu 22.04', risk_score: 72, tags: ['prod', 'web'] },
    { id: 'host::prod-db-04',  hostname: 'prod-db-04',  ip: '10.0.4.44', os: 'RHEL 9.1',    risk_score: 88, tags: ['prod', 'db', 'critical'] },
  ],
  vulnerability: [
    { id: 'vuln::CVE-2024-21762', cve_id: 'CVE-2024-21762', cvss: 9.8,  severity: 'critical', affected_hosts: 14, has_exploit: true },
    { id: 'vuln::CVE-2023-44487', cve_id: 'CVE-2023-44487', cvss: 7.5,  severity: 'high',     affected_hosts: 32, has_exploit: false },
  ],
  identity: [
    { id: 'identity::alice.chen@acme.com', email: 'alice.chen@acme.com', provider: 'Okta', mfa_enabled: true,  risk: 'low' },
    { id: 'identity::bob.smith@acme.com',  email: 'bob.smith@acme.com',  provider: 'Okta', mfa_enabled: false, risk: 'high' },
  ],
  finding: [
    { id: 'finding::cs-det-8823', source: 'CrowdStrike', severity: 'high',   tactic: 'Lateral Movement', status: 'open',     host: 'prod-web-01' },
    { id: 'finding::cs-det-8824', source: 'CrowdStrike', severity: 'medium', tactic: 'Discovery',        status: 'resolved', host: 'prod-db-04' },
  ],
  account: [
    { id: 'account::svc-deploy-01', name: 'svc-deploy-01', type: 'service', privileged: true,  last_seen: '2 min ago' },
    { id: 'account::jdoe-admin',    name: 'jdoe-admin',    type: 'human',   privileged: true,  last_seen: '4h ago' },
  ],
};

const FALLBACK_SAMPLE = [
  { id: 'entity::sample-001', type: 'unknown', source: 'pipeline', ingested_at: new Date().toISOString() },
  { id: 'entity::sample-002', type: 'unknown', source: 'pipeline', ingested_at: new Date().toISOString() },
];

function DryRunPreview({ entityTypes }: { entityTypes: KGEntityType[] }) {
  const firstType = entityTypes.find(t => SAMPLE_ENTITIES[t]) ?? entityTypes[0];
  const samples: object[] = (firstType && SAMPLE_ENTITIES[firstType]) ?? FALLBACK_SAMPLE;
  const color = firstType ? ENTITY_COLORS[firstType] : '#6360D8';

  return (
    <div
      className="rounded-[4px]"
      style={{ border: '1px solid var(--card-border)', background: 'var(--shell-raised)', overflow: 'hidden' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ borderBottom: '1px solid var(--card-border)', background: 'var(--card-bg)' }}
      >
        <div className="flex items-center gap-2">
          <Play size={11} style={{ color }} />
          <span className="text-[11px] font-semibold" style={{ color: 'var(--shell-text)' }}>Dry Run — Sample Output</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-[3px]" style={{ background: `${color}18`, color }}>
            {firstType ?? 'entity'}
          </span>
          <span className="text-[10px]" style={{ color: 'var(--shell-text-muted)' }}>{samples.length} of ~{(samples.length * 312).toLocaleString()} records</span>
        </div>
      </div>

      {/* JSON-like sample rows */}
      <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {samples.map((entity, i) => (
          <div
            key={i}
            className="rounded-[3px] text-[10px] font-mono leading-relaxed"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '8px 10px', color: 'var(--shell-text-muted)', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
          >
            {Object.entries(entity).map(([k, v]) => (
              <div key={k}>
                <span style={{ color: '#6360D8' }}>{`"${k}"`}</span>
                <span style={{ color: 'var(--shell-text-muted)' }}>{': '}</span>
                <span style={{ color: typeof v === 'boolean' ? '#D98B1D' : typeof v === 'number' ? '#31A56D' : Array.isArray(v) ? '#0EA5E9' : 'var(--shell-text)' }}>
                  {JSON.stringify(v)}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div
        className="px-3 py-2 text-[10px]"
        style={{ borderTop: '1px solid var(--card-border)', color: 'var(--shell-text-muted)', background: 'var(--card-bg)' }}
      >
        No writes to Knowledge Graph in dry run mode — disable to publish for real.
      </div>
    </div>
  );
}

function PublishPanel({
  cfg,
  setCfg,
  onDone,
  pipelineName,
  schedule,
  entityTypes,
}: {
  cfg: PublishConfig;
  setCfg: (c: PublishConfig) => void;
  onDone: () => void;
  pipelineName: string;
  schedule: string;
  entityTypes: KGEntityType[];
}) {
  const checks = [
    { label: 'Pipeline name set',         ok: pipelineName.trim().length > 0, detail: pipelineName.trim() || null },
    { label: 'Schedule configured',       ok: !!schedule, detail: schedule || null },
    { label: 'Entity types selected',     ok: entityTypes.length > 0, detail: entityTypes.length > 0 ? `${entityTypes.length} type${entityTypes.length > 1 ? 's' : ''}` : null },
    { label: 'Target: Knowledge Graph',   ok: true, detail: 'Production' },
  ];

  const allOk = checks.every(c => c.ok);

  return (
    <div className="flex flex-col gap-5">
      {/* Target */}
      <div
        className="flex items-center gap-3 rounded-[4px]"
        style={{ padding: '12px', background: 'var(--shell-active)', border: '1px solid var(--shell-accent)' }}
      >
        <div
          className="flex items-center justify-center rounded-[4px]"
          style={{ width: 36, height: 36, background: 'var(--shell-accent)', flexShrink: 0 }}
        >
          <Network size={18} color="#fff" />
        </div>
        <div>
          <p className="text-[12px] font-semibold" style={{ color: 'var(--shell-text)' }}>Knowledge Graph</p>
          <p className="text-[11px]" style={{ color: 'var(--shell-text-muted)' }}>Tenant KG — Production</p>
        </div>
        <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-[3px]" style={{ background: '#EFF7ED', color: '#31A56D', fontWeight: 600 }}>
          Target
        </span>
      </div>

      {/* Entities being published */}
      {entityTypes.length > 0 && (
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--shell-text-muted)' }}>
            Publishing Entity Types
          </label>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {entityTypes.map(e => (
              <span
                key={e}
                className="text-[11px] px-2 py-0.5 rounded-[3px] font-medium"
                style={{ background: `${ENTITY_COLORS[e]}18`, color: ENTITY_COLORS[e], border: `1px solid ${ENTITY_COLORS[e]}40` }}
              >
                {e}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Validation checklist */}
      <div>
        <label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--shell-text-muted)' }}>
          Pre-deploy Validation
        </label>
        <div className="mt-2 flex flex-col gap-1.5">
          {checks.map(c => (
            <div key={c.label} className="flex items-center gap-2 text-[12px]">
              {c.ok
                ? <CheckCircle2 size={14} style={{ color: '#31A56D', flexShrink: 0 }} />
                : <AlertTriangle size={14} style={{ color: '#D98B1D', flexShrink: 0 }} />}
              <span style={{ color: c.ok ? 'var(--shell-text)' : '#D98B1D' }}>{c.label}</span>
              {c.ok && c.detail && (
                <span className="ml-auto text-[10px] font-mono" style={{ color: 'var(--shell-text-muted)' }}>{c.detail}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Dry run toggle */}
      <div
        className="flex items-center justify-between rounded-[4px]"
        style={{ padding: '10px 12px', border: '1px solid var(--card-border)', background: 'var(--card-bg)' }}
      >
        <div>
          <p className="text-[12px] font-medium" style={{ color: 'var(--shell-text)' }}>Dry Run Mode</p>
          <p className="text-[10px] mt-0.5" style={{ color: 'var(--shell-text-muted)' }}>
            Process records without writing to KG — for testing
          </p>
        </div>
        <button
          onClick={() => setCfg({ ...cfg, dryRun: !cfg.dryRun })}
          className="rounded-full transition-colors flex-shrink-0"
          style={{
            width: 36, height: 20,
            background: cfg.dryRun ? 'var(--shell-accent)' : 'var(--ctrl-border)',
            position: 'relative',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <span
            className="absolute rounded-full transition-all"
            style={{ width: 14, height: 14, background: '#fff', top: 3, left: cfg.dryRun ? 19 : 3 }}
          />
        </button>
      </div>

      {/* Dry Run Preview */}
      {cfg.dryRun && (
        <DryRunPreview entityTypes={entityTypes} />
      )}

      <button
        onClick={() => { setCfg({ ...cfg, confirmed: true }); onDone(); }}
        disabled={!allOk}
        className="rounded-[44px] text-[12px] font-semibold transition-colors"
        style={{
          padding: '9px 0',
          background: allOk ? '#31A56D' : 'var(--shell-raised)',
          color: allOk ? '#fff' : 'var(--shell-text-muted)',
          border: 'none',
          cursor: allOk ? 'pointer' : 'not-allowed',
        }}
      >
        {allOk ? (cfg.dryRun ? 'Confirm — Dry Run' : 'Confirm Publish Stage') : 'Complete required fields first'}
      </button>
    </div>
  );
}

// ─── Right Panel Wrapper ──────────────────────────────────────────────────────

interface RightPanelProps {
  activeStage: StageName | null;
  configs: StageConfigs;
  setConfigs: React.Dispatch<React.SetStateAction<StageConfigs>>;
  onClose: () => void;
  onNext: (stage: StageName) => void;
  pipelineName: string;
  schedule: string;
}

function RightPanel({ activeStage, configs, setConfigs, onClose, onNext, pipelineName, schedule }: RightPanelProps) {
  if (!activeStage) return null;

  const stage = STAGES.find(s => s.name === activeStage)!;

  function handleDone() {
    const idx = STAGES.findIndex(s => s.name === activeStage);
    const nextStage = STAGES[idx + 1];
    if (nextStage) {
      onNext(nextStage.name);
    } else {
      onClose();
    }
  }

  return (
    <div
      style={{
        width: 360,
        flexShrink: 0,
        borderLeft: '1px solid var(--shell-border)',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--card-bg)',
        overflow: 'hidden',
      }}
    >
      {/* Panel header */}
      <div
        className="flex items-center justify-between flex-shrink-0"
        style={{ padding: '16px 20px', borderBottom: '1px solid var(--shell-border)' }}
      >
        <div className="flex items-center gap-2.5">
          <span
            className="flex items-center justify-center rounded-full text-[11px] font-bold"
            style={{ width: 24, height: 24, background: 'var(--shell-accent)', color: '#fff', flexShrink: 0 }}
          >
            {stage.num}
          </span>
          <div>
            <p className="text-[13px] font-semibold" style={{ color: 'var(--shell-text)' }}>{stage.label}</p>
            <p className="text-[11px]" style={{ color: 'var(--shell-text-muted)' }}>{stage.hint}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-[4px] transition-colors"
          style={{ padding: 4, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--shell-text-muted)' }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Panel body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {activeStage === 'ingest' && (
          <IngestPanel
            cfg={configs.ingest}
            setCfg={c => setConfigs(prev => ({ ...prev, ingest: c }))}
            onDone={handleDone}
          />
        )}
        {activeStage === 'parse' && (
          <ParsePanel
            cfg={configs.parse}
            setCfg={c => setConfigs(prev => ({ ...prev, parse: c }))}
            onDone={handleDone}
          />
        )}
        {activeStage === 'extract' && (
          <ExtractPanel
            cfg={configs.extract}
            setCfg={c => setConfigs(prev => ({ ...prev, extract: c }))}
            onDone={handleDone}
          />
        )}
        {activeStage === 'resolve' && (
          <ResolvePanel
            cfg={configs.resolve}
            setCfg={c => setConfigs(prev => ({ ...prev, resolve: c }))}
            onDone={handleDone}
          />
        )}
        {activeStage === 'publish' && (
          <PublishPanel
            cfg={configs.publish}
            setCfg={c => setConfigs(prev => ({ ...prev, publish: c }))}
            onDone={handleDone}
            pipelineName={pipelineName}
            schedule={schedule}
            entityTypes={configs.extract.entityTypes}
          />
        )}
      </div>
    </div>
  );
}

// ─── Deploy Modal ─────────────────────────────────────────────────────────────

function DeployModal({ pipelineName, onClose, onConfirm, success }: { pipelineName: string; onClose: () => void; onConfirm: () => void; success: boolean; }) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.4)', zIndex: 1000 }}
      onClick={success ? undefined : onClose}
    >
      <div
        className="rounded-[4px]"
        style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '28px', width: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}
        onClick={e => e.stopPropagation()}
      >
        {success ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="flex items-center justify-center rounded-full" style={{ width: 56, height: 56, background: '#EFF7ED' }}>
              <CheckCircle2 size={28} style={{ color: '#31A56D' }} />
            </div>
            <p className="text-[14px] font-semibold" style={{ color: 'var(--shell-text)' }}>Pipeline Deployed!</p>
            <p className="text-[12px] text-center" style={{ color: 'var(--shell-text-muted)' }}>
              <strong style={{ color: 'var(--shell-text)' }}>{pipelineName || 'Untitled Pipeline'}</strong> is now active and ingesting data.
            </p>
            <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--shell-text-muted)' }}>
              <Loader2 size={11} className="animate-spin" />
              Redirecting to pipeline view…
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center rounded-[4px]" style={{ width: 40, height: 40, background: 'var(--shell-active)', flexShrink: 0 }}>
                <Zap size={20} style={{ color: 'var(--shell-accent)' }} />
              </div>
              <div>
                <p className="text-[14px] font-semibold" style={{ color: 'var(--shell-text)' }}>Deploy Pipeline</p>
                <p className="text-[12px]" style={{ color: 'var(--shell-text-muted)' }}>This will activate the pipeline and begin ingestion</p>
              </div>
            </div>
            <div className="rounded-[4px] mb-5" style={{ background: 'var(--shell-raised)', border: '1px solid var(--shell-border)', padding: '10px 12px' }}>
              <p className="text-[12px] font-medium" style={{ color: 'var(--shell-text)' }}>{pipelineName || 'Untitled Pipeline'}</p>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--shell-text-muted)' }}>Will start running on the configured schedule</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 rounded-[44px] text-[13px] font-medium transition-colors"
                style={{ padding: '9px 0', background: 'var(--shell-raised)', border: '1px solid var(--ctrl-border)', color: 'var(--shell-text)', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 rounded-[44px] text-[13px] font-semibold transition-colors"
                style={{ padding: '9px 0', background: 'var(--shell-accent)', border: 'none', color: '#fff', cursor: 'pointer' }}
              >
                Deploy Pipeline
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PipelineBuilder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('template');

  const [name, setName] = useState('');
  const [schedule, setSchedule] = useState('*/15 * * * *');
  const [scheduleLabel, setScheduleLabel] = useState('Every 15 min');
  const [configs, setConfigs] = useState<StageConfigs>(DEFAULT_CONFIGS);
  const [activeStage, setActiveStage] = useState<StageName | null>(null);
  const [saving, setSaving] = useState(false);
  const [showDeploy, setShowDeploy] = useState(false);
  const [deploySuccess, setDeploySuccess] = useState(false);

  // Prefill from template
  useEffect(() => {
    if (!templateId) return;
    const tpl = mockPipelineTemplates.find(t => t.id === templateId);
    if (!tpl) return;

    setName(tpl.name);

    // Pre-select connector if configured
    const matchedConnector = mockCyberConnectors.find(
      c => c.id === tpl.connectorType && c.configured
    );

    const defaultFeeds = matchedConnector
      ? (CONNECTOR_FEEDS[matchedConnector.id] ?? []).slice(0, 2)
      : [];

    setConfigs(prev => ({
      ...prev,
      ingest: {
        connectorId: matchedConnector?.id,
        feeds: defaultFeeds,
        loadMode: 'incremental',
      },
      extract: {
        entityTypes: tpl.targetEntities,
        aiPrediction: false,
      },
    }));
  }, [templateId]);

  const configuredCount = STAGES.filter(s => isStageConfigured(s.name, configs)).length;
  const allConfigured = configuredCount === STAGES.length;

  function handleSaveDraft() {
    setSaving(true);
    setTimeout(() => { setSaving(false); }, 1200);
  }

  function handleDeploy() {
    setDeploySuccess(true);
    setTimeout(() => {
      navigate('/pipelines');
    }, 1800);
  }

  const fromTemplate = templateId ? mockPipelineTemplates.find(t => t.id === templateId) : null;

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 96px)', overflow: 'hidden' }}>
      {/* Top action bar */}
      <div
        className="flex items-center justify-between flex-shrink-0"
        style={{ padding: '12px 24px', borderBottom: '1px solid var(--shell-border)', background: 'var(--card-bg)' }}
      >
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[13px]">
          <button
            onClick={() => navigate(fromTemplate ? '/templates' : '/pipelines')}
            className="transition-colors"
            style={{ color: 'var(--shell-text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            {fromTemplate ? 'Templates' : 'Pipelines'}
          </button>
          <ChevronRight size={14} style={{ color: 'var(--shell-text-muted)' }} />
          <span style={{ color: 'var(--shell-text)', fontWeight: 500 }}>
            {fromTemplate ? fromTemplate.name : (name || 'New Pipeline')}
          </span>
        </div>

        {/* Step wizard */}
        <div className="flex items-center gap-0">
          {STAGES.map((s, i) => {
            const done = isStageConfigured(s.name, configs);
            const active = activeStage === s.name;
            return (
              <div key={s.name} className="flex items-center gap-0">
                {/* Step pill */}
                <button
                  onClick={() => setActiveStage(active ? null : s.name)}
                  className="flex items-center gap-1.5"
                  style={{
                    padding: '5px 10px',
                    borderRadius: 44,
                    border: `1.5px solid ${active ? 'var(--shell-accent)' : done ? '#31A56D' : 'var(--shell-border)'}`,
                    background: active ? 'var(--shell-active)' : done ? 'rgba(49,165,109,0.08)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <span
                    className="flex items-center justify-center rounded-full text-[10px] font-bold flex-shrink-0"
                    style={{
                      width: 18, height: 18,
                      background: done ? '#31A56D' : active ? 'var(--shell-accent)' : 'var(--shell-border)',
                      color: done || active ? '#fff' : 'var(--shell-text-muted)',
                    }}
                  >
                    {done ? <Check size={9} /> : s.num}
                  </span>
                  <span
                    className="text-[11px] font-medium"
                    style={{ color: active ? 'var(--shell-accent)' : done ? '#31A56D' : 'var(--shell-text-muted)' }}
                  >
                    {s.label}
                  </span>
                </button>
                {/* Connector line */}
                {i < STAGES.length - 1 && (
                  <div style={{ width: 20, height: 1.5, background: done ? '#31A56D' : 'var(--shell-border)', flexShrink: 0 }} />
                )}
              </div>
            );
          })}
          <span className="text-[11px] font-medium ml-3" style={{ color: configuredCount === STAGES.length ? '#31A56D' : 'var(--shell-text-muted)', flexShrink: 0 }}>
            {configuredCount}/{STAGES.length}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveDraft}
            className="flex items-center gap-1.5 text-[12px] font-medium rounded-[44px] transition-colors"
            style={{
              padding: '7px 14px',
              border: '1px solid var(--ctrl-border)',
              background: 'var(--ctrl-bg)',
              color: 'var(--shell-text)',
              cursor: 'pointer',
            }}
          >
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
            {saving ? 'Saving…' : 'Save Draft'}
          </button>

          <button
            onClick={() => navigate('/pipelines')}
            className="flex items-center gap-1.5 text-[12px] font-medium rounded-[44px] transition-colors"
            style={{
              padding: '7px 14px',
              border: '1px solid var(--ctrl-border)',
              background: 'var(--ctrl-bg)',
              color: 'var(--shell-text)',
              cursor: 'pointer',
            }}
          >
            <Play size={12} />
            Dry Run
          </button>

          <button
            onClick={() => setShowDeploy(true)}
            disabled={!allConfigured}
            className="flex items-center gap-1.5 text-[12px] font-semibold rounded-[44px] transition-colors"
            style={{
              padding: '7px 16px',
              background: allConfigured ? 'var(--shell-accent)' : 'var(--shell-raised)',
              border: 'none',
              color: allConfigured ? '#fff' : 'var(--shell-text-muted)',
              cursor: allConfigured ? 'pointer' : 'not-allowed',
            }}
          >
            <Zap size={12} />
            Deploy
          </button>
        </div>
      </div>

      {/* Main body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <LeftPanel
          name={name}
          setName={setName}
          configs={configs}
          setConfigs={setConfigs}
          schedule={schedule}
          setSchedule={setSchedule}
          scheduleLabel={scheduleLabel}
          setScheduleLabel={setScheduleLabel}
        />

        {/* Stage canvas */}
        <div
          className="flex flex-col"
          style={{ flex: 1, overflow: 'hidden', background: 'var(--shell-bg)' }}
        >
          {/* Canvas header */}
          <div
            className="flex items-center justify-between flex-shrink-0"
            style={{ padding: '16px 24px', borderBottom: '1px solid var(--shell-border)', background: 'var(--card-bg)' }}
          >
            <div>
              <p className="text-[14px] font-semibold" style={{ color: 'var(--shell-text)' }}>Pipeline Stage Canvas</p>
              <p className="text-[12px] mt-0.5" style={{ color: 'var(--shell-text-muted)' }}>
                Click any stage to configure it. Stages can be configured in any order.
              </p>
            </div>
            {!allConfigured && (
              <div
                className="flex items-center gap-1.5 text-[12px] rounded-[4px]"
                style={{ padding: '6px 12px', background: '#FEF3C7', color: '#D98B1D', border: '1px solid #F59E0B40' }}
              >
                <Info size={13} />
                Configure all 5 stages to deploy
              </div>
            )}
            {allConfigured && (
              <div
                className="flex items-center gap-1.5 text-[12px] rounded-[4px]"
                style={{ padding: '6px 12px', background: '#EFF7ED', color: '#31A56D', border: '1px solid #31A56D40' }}
              >
                <CheckCircle2 size={13} />
                All stages configured — ready to deploy
              </div>
            )}
          </div>

          {/* Stage cards */}
          <div
            className="flex flex-col items-center justify-center"
            style={{
              flex: 1,
              padding: '40px 24px',
              overflow: 'auto',
              backgroundImage: 'radial-gradient(circle, var(--shell-border) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          >
            {/* Stage flow row */}
            <div className="flex items-center gap-0 flex-wrap justify-center" style={{ gap: 0 }}>
              {STAGES.map((stage, idx) => {
                const configured = isStageConfigured(stage.name, configs);
                const active = activeStage === stage.name;
                return (
                  <StageCard
                    key={stage.name}
                    stage={stage}
                    idx={idx}
                    active={active}
                    configured={configured}
                    locked={false}
                    onClick={() => setActiveStage(active ? null : stage.name)}
                  />
                );
              })}
            </div>

            {/* Stage summary rows (if configured) */}
            {configuredCount > 0 && (
              <div
                className="mt-10 rounded-[4px] w-full"
                style={{ maxWidth: 860, border: '1px solid var(--card-border)', background: 'var(--card-bg)', overflow: 'hidden' }}
              >
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--card-border)' }}>
                  <p className="text-[12px] font-semibold" style={{ color: 'var(--shell-text)' }}>Configuration Summary</p>
                </div>
                <table className="w-full" style={{ fontSize: 12, borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--table-th-bg)' }}>
                      <th className="text-left px-4 py-2.5 font-semibold uppercase" style={{ fontSize: 10, letterSpacing: '0.06em', color: 'var(--shell-text-muted)', width: 160, borderBottom: '1px solid var(--table-border)' }}>Stage</th>
                      <th className="text-left px-4 py-2.5 font-semibold uppercase" style={{ fontSize: 10, letterSpacing: '0.06em', color: 'var(--shell-text-muted)', borderBottom: '1px solid var(--table-border)' }}>Configuration</th>
                      <th className="text-left px-4 py-2.5 font-semibold uppercase" style={{ fontSize: 10, letterSpacing: '0.06em', color: 'var(--shell-text-muted)', width: 100, borderBottom: '1px solid var(--table-border)' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {STAGES.filter(s => isStageConfigured(s.name, configs)).map(s => {
                      const ok = true;
                      let summary = '—';
                      if (s.name === 'ingest' && configs.ingest.connectorId) {
                        const conn = mockCyberConnectors.find(c => c.id === configs.ingest.connectorId);
                        summary = `${conn?.name ?? configs.ingest.connectorId} · ${configs.ingest.feeds.join(', ')} · ${configs.ingest.loadMode}`;
                      } else if (s.name === 'parse' && configs.parse.parserType) {
                        summary = `${configs.parse.parserType.toUpperCase()} parser${configs.parse.aiRules ? ' · AI rules generated' : ''}`;
                      } else if (s.name === 'extract' && configs.extract.entityTypes.length > 0) {
                        summary = configs.extract.entityTypes.join(', ') + (configs.extract.aiPrediction ? ' · AI prediction on' : '');
                      } else if (s.name === 'resolve' && configs.resolve.intraDedupField) {
                        summary = `Dedup: ${configs.resolve.intraDedupField} · ${configs.resolve.interStrategy} match`;
                      } else if (s.name === 'publish' && configs.publish.confirmed) {
                        summary = `Knowledge Graph${configs.publish.dryRun ? ' · Dry run' : ''}`;
                      }
                      return (
                        <tr key={s.name} style={{ borderTop: '1px solid var(--table-border)' }}>
                          <td className="px-4 py-2.5 font-medium" style={{ color: 'var(--shell-text)' }}>
                            <div className="flex items-center gap-2">
                              <span
                                className="text-[10px] font-bold rounded-full flex items-center justify-center"
                                style={{ width: 18, height: 18, background: ok ? '#EFF7ED' : 'var(--shell-raised)', color: ok ? '#31A56D' : 'var(--shell-text-muted)', flexShrink: 0 }}
                              >
                                {ok ? <Check size={9} /> : s.num}
                              </span>
                              {s.label}
                            </div>
                          </td>
                          <td className="px-4 py-2.5" style={{ color: 'var(--shell-text)' }}>
                            {summary}
                          </td>
                          <td className="px-4 py-2.5">
                            <span
                              className="text-[10px] px-2 py-0.5 rounded-[44px] font-medium"
                              style={{ background: '#EFF7ED', color: '#31A56D' }}
                            >
                              Configured
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right config panel */}
        <RightPanel
          activeStage={activeStage}
          configs={configs}
          setConfigs={setConfigs}
          onClose={() => setActiveStage(null)}
          onNext={(stage) => setActiveStage(stage)}
          pipelineName={name}
          schedule={schedule}
        />
      </div>

      {/* Deploy confirmation modal */}
      {showDeploy && (
        <DeployModal
          pipelineName={name}
          onClose={() => setShowDeploy(false)}
          onConfirm={handleDeploy}
          success={deploySuccess}
        />
      )}
    </div>
  );
}
