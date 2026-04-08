import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUpRight, ArrowDownRight,
  CheckCircle2, XCircle, PauseCircle, Activity,
  AlertTriangle, RefreshCw, Zap, Search, Link2,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  mockKGHealth, mockKGEntityStats, mockKGGrowthTrend, mockPipelines, mockActivity,
} from '@/data/mock';
import type { EntityFreshness, PipelineStatus } from '@/types';

// ─── Entity icons ─────────────────────────────────────────────────────────────
import accountIcon from '@/images/account.svg?url';
import applicationIcon from '@/images/application.svg?url';
import assessmentIcon from '@/images/assessment.svg?url';
import cloudAccountIcon from '@/images/cloud account.svg?url';
import cloudClusterIcon from '@/images/cloud cluster.svg?url';
import cloudContainerIcon from '@/images/cloud container.svg?url';
import cloudStorageIcon from '@/images/cloud storage.svg?url';
import findingIcon from '@/images/finding.svg?url';
import groupIcon from '@/images/group.svg?url';
import hostIcon from '@/images/host.svg?url';
import identityIcon from '@/images/identity.svg?url';
import networkInterfaceIcon from '@/images/network interface.svg?url';
import networkServicesIcon from '@/images/network services.svg?url';
import networkIcon from '@/images/network.svg?url';
import personIcon from '@/images/person.svg?url';
import vulnerabilityIcon from '@/images/vulnerability.svg?url';

const ENTITY_ICON: Record<string, string> = {
  account:            accountIcon,
  application:        applicationIcon,
  assessment:         assessmentIcon,
  'cloud-account':    cloudAccountIcon,
  'cloud-cluster':    cloudClusterIcon,
  'cloud-container':  cloudContainerIcon,
  'cloud-storage':    cloudStorageIcon,
  finding:            findingIcon,
  Group:              groupIcon,
  group:              groupIcon,
  host:               hostIcon,
  identity:           identityIcon,
  'network-interface':networkInterfaceIcon,
  'network-services': networkServicesIcon,
  network:            networkIcon,
  person:             personIcon,
  vulnerability:      vulnerabilityIcon,
};

// ─── Freshness badge ──────────────────────────────────────────────────────────

const FRESHNESS_CONFIG: Record<EntityFreshness, { label: string; bg: string; color: string }> = {
  fresh:    { label: 'Fresh',    bg: '#EFF7ED', color: '#31A56D' },
  stale:    { label: 'Stale',    bg: '#FEF3C7', color: '#D98B1D' },
  critical: { label: 'No Data',  bg: '#F9EEEE', color: '#D12329' },
};

// ─── Pipeline status config ───────────────────────────────────────────────────

const PIPELINE_STATUS: Record<PipelineStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  active:  { label: 'Active',  color: '#31A56D', bg: '#EFF7ED', icon: <CheckCircle2 size={12} /> },
  paused:  { label: 'Paused',  color: '#D98B1D', bg: '#FEF3C7', icon: <PauseCircle size={12} /> },
  failed:  { label: 'Failed',  color: '#D12329', bg: '#F9EEEE', icon: <XCircle size={12} /> },
  running: { label: 'Running', color: '#6360D8', bg: '#f0f0fc', icon: <Activity size={12} /> },
};

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  run:     <CheckCircle2 size={14} style={{ color: '#31A56D' }} />,
  error:   <XCircle size={14} style={{ color: '#D12329' }} />,
  created: <Zap size={14} style={{ color: '#6360D8' }} />,
  paused:  <PauseCircle size={14} style={{ color: '#D98B1D' }} />,
  deployed:<Zap size={14} style={{ color: '#6360D8' }} />,
  warning: <AlertTriangle size={14} style={{ color: '#D98B1D' }} />,
};

// ─── Custom tooltip for chart ─────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-[4px] shadow-md text-[11px]"
      style={{ background: '#fff', border: '1px solid var(--card-border)', padding: '8px 12px', minWidth: 140 }}
    >
      <p className="font-semibold mb-1" style={{ color: 'var(--shell-text)' }}>{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-3">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-medium" style={{ color: 'var(--shell-text)' }}>{p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  value, label, sub, deltaValue, deltaLabel, direction, accent,
}: {
  value: string;
  label: string;
  sub?: string;
  deltaValue?: string;
  deltaLabel?: string;
  direction?: 'up-good' | 'down-good' | 'up-bad' | 'down-bad' | 'neutral';
  accent?: boolean;
}) {
  const positive = direction === 'up-good' || direction === 'down-good';
  const negative = direction === 'up-bad' || direction === 'down-bad';
  const deltaColor = positive ? '#31A56D' : negative ? '#D12329' : 'var(--shell-text-muted)';
  const Arrow = direction?.startsWith('up') ? ArrowUpRight : ArrowDownRight;

  return (
    <div
      className="flex flex-col rounded-[4px] p-4"
      style={{
        background: accent ? 'var(--shell-accent)' : 'var(--card-bg)',
        border: accent ? 'none' : '1px solid var(--card-border)',
        flex: 1,
        minWidth: 0,
      }}
    >
      <p
        className="text-[11px] font-medium truncate mb-2"
        style={{ color: accent ? 'rgba(255,255,255,0.7)' : 'var(--shell-text-muted)' }}
      >
        {label}
      </p>
      <p
        className="text-[14px] font-bold leading-none"
        style={{ color: accent ? '#fff' : 'var(--shell-text)' }}
      >
        {value}
      </p>
      <div style={{ minHeight: 20 }}>
        {sub && (
          <p className="text-[11px] mt-1" style={{ color: accent ? 'rgba(255,255,255,0.6)' : 'var(--shell-text-muted)' }}>
            {sub}
          </p>
        )}
      </div>
      {deltaValue && (
        <div className="flex items-center gap-1 mt-2">
          {direction !== 'neutral' && <Arrow size={12} style={{ color: deltaColor }} />}
          <span className="text-[11px] font-medium" style={{ color: deltaColor }}>{deltaValue}</span>
          {deltaLabel && (
            <span className="text-[11px]" style={{ color: accent ? 'rgba(255,255,255,0.55)' : 'var(--shell-text-muted)' }}>
              {deltaLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function toPascalCase(str: string) {
  return str.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchQuery] = useState('');
  const [kgBannerDismissed, setKgBannerDismissed] = useState(false);
  const [kgSearch, setKgSearch] = useState('');

  function handleKgSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate('/knowledge-graph');
  }

  const kg = mockKGHealth;
  const activePipelines = mockPipelines.filter(p => p.status === 'active').length;
  const failedPipelines = mockPipelines.filter(p => p.status === 'failed').length;

  const filteredPipelines = mockPipelines.filter(p =>
    !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ padding: '24px 28px' }}>

      {/* ── KG health alert banner (if issues) ── */}
      {!kgBannerDismissed && (kg.staleEntityTypes > 0 || kg.disambiguationBacklog > 0) && (
        <div
          className="flex items-center gap-3 rounded-[4px] mb-5 text-[12px]"
          style={{ background: '#FFFBEB', border: '1px solid #FDE68A', padding: '10px 14px' }}
        >
          <AlertTriangle size={14} style={{ color: '#D98B1D', flexShrink: 0 }} />
          <span style={{ color: '#92400E' }}>
            <strong>Knowledge Graph needs attention:</strong>&nbsp;
            {kg.staleEntityTypes} entity type{kg.staleEntityTypes !== 1 ? 's' : ''} with stale or missing data,
            {' '}{kg.disambiguationBacklog.toLocaleString()} records pending disambiguation.
          </span>
          <button
            className="ml-auto text-[11px] font-medium underline"
            style={{ color: '#D98B1D', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}
            onClick={() => navigate('/knowledge-graph')}
          >
            View Details
          </button>
          <button
            onClick={() => setKgBannerDismissed(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#D98B1D', padding: '0 0 0 4px', flexShrink: 0, display: 'flex', alignItems: 'center' }}
            title="Dismiss"
          >
            <XCircle size={14} />
          </button>
        </div>
      )}

      {/* ── KPI row ── */}
      <div className="flex gap-3 mb-6" style={{ flexWrap: 'wrap' }}>
        <KpiCard
          value={kg.totalEntities.toLocaleString()}
          label="Total KG Entities"
          deltaValue={`+${kg.growthToday.toLocaleString()}`}
          deltaLabel="today"
          direction="up-good"
        />
        <KpiCard
          value={`${kg.coverageScore}%`}
          label="KG Coverage Score"
          sub={`${8 - kg.staleEntityTypes} of 8 entity types fresh`}
          deltaValue={kg.staleEntityTypes > 0 ? `${kg.staleEntityTypes} stale` : 'All current'}
          deltaLabel={kg.staleEntityTypes > 0 ? '' : ''}
          direction={kg.staleEntityTypes > 0 ? 'down-bad' : 'up-good'}
        />
        <KpiCard
          value={`${activePipelines} / ${mockPipelines.length}`}
          label="Active Pipelines"
          sub={failedPipelines > 0 ? `${failedPipelines} failed` : 'All healthy'}
          deltaValue={failedPipelines > 0 ? `${failedPipelines} failed` : undefined}
          direction={failedPipelines > 0 ? 'up-bad' : undefined}
        />
        <KpiCard
          value={kg.disambiguationBacklog.toLocaleString()}
          label="Disambiguation Backlog"
          sub="Pending entity resolution"
          deltaValue={kg.disambiguationBacklog > 0 ? 'Needs review' : 'Clear'}
          direction={kg.disambiguationBacklog > 0 ? 'up-bad' : 'up-good'}
        />
        <KpiCard
          value={kg.totalRelationships.toLocaleString()}
          label="Total Relationships"
          sub="Edges in Knowledge Graph"
          deltaValue="+38,420"
          deltaLabel="today"
          direction="up-good"
        />
      </div>

      {/* ── Cross-entity insight callout ── */}
      <div
        className="flex items-center gap-3 rounded-[4px] mb-2 text-[12px]"
        style={{ background: 'rgba(99,96,216,0.06)', border: '1px solid rgba(99,96,216,0.2)', padding: '10px 14px' }}
      >
        <Link2 size={14} style={{ color: '#6360D8', flexShrink: 0 }} />
        <span style={{ color: 'var(--shell-text)' }}>
          <strong style={{ color: '#6360D8' }}>247 identities</strong> are linked to{' '}
          <strong style={{ color: '#D12329' }}>38 critical CVEs</strong> — 12 with known active exploits in the last 7 days.
        </span>
        <button
          className="ml-auto text-[11px] font-medium flex-shrink-0"
          style={{ color: '#6360D8', background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
          onClick={() => navigate('/knowledge-graph')}
        >
          Explore in KG →
        </button>
      </div>

      {/* ── Search the Knowledge Graph ── */}
      <form onSubmit={handleKgSearch} className="mb-4">
        <div className="flex items-center gap-2 rounded-[4px]" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '8px 12px' }}>
          <Search size={14} style={{ color: 'var(--shell-text-muted)', flexShrink: 0 }} />
          <input
            type="text"
            value={kgSearch}
            onChange={e => setKgSearch(e.target.value)}
            placeholder="Search the Knowledge Graph — entities, CVEs, identities, assets…"
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              fontSize: 13,
              color: 'var(--shell-text)',
            }}
          />
          {kgSearch && (
            <button
              type="submit"
              className="text-[11px] font-medium px-2.5 py-1 rounded-[4px]"
              style={{ background: 'var(--shell-accent)', color: '#fff', border: 'none', cursor: 'pointer', flexShrink: 0 }}
            >
              Search
            </button>
          )}
        </div>
      </form>

      {/* ── Main content grid ── */}
      <div className="flex flex-col gap-4">

        {/* Row 1: KG Growth + Pipeline Health (same level) */}
        <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 320px' }}>

          {/* KG Growth Chart */}
          <div
            className="rounded-[4px] flex flex-col"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '20px 20px 12px' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[13px] font-semibold" style={{ color: 'var(--shell-text)' }}>
                  Knowledge Graph Growth
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--shell-text-muted)' }}>
                  New entities added per day — last 7 days
                </p>
              </div>
              <button
                className="flex items-center gap-1.5 text-[11px] rounded-[4px] transition-colors"
                style={{ color: 'var(--shell-text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}
              >
                <RefreshCw size={12} /> Refresh
              </button>
            </div>
            <ResponsiveContainer width="100%" height="100%" style={{ flex: 1, minHeight: 0 }}>
              <AreaChart data={mockKGGrowthTrend} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="gAlerts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6360D8" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6360D8" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gAssets" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#31A56D" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#31A56D" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gVulns" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#D98B1D" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#D98B1D" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--shell-border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--shell-text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--shell-text-muted)' }} axisLine={false} tickLine={false}
                  tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Area type="monotone" dataKey="alerts" name="Alerts"        stroke="#6360D8" fill="url(#gAlerts)" strokeWidth={2} />
                <Area type="monotone" dataKey="assets" name="Assets"        stroke="#31A56D" fill="url(#gAssets)" strokeWidth={2} />
                <Area type="monotone" dataKey="vulns"  name="Vulnerabilities" stroke="#D98B1D" fill="url(#gVulns)"  strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Pipeline health summary */}
          <div
            className="rounded-[4px]"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '16px 20px' }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-[13px] font-semibold" style={{ color: 'var(--shell-text)' }}>
                Pipeline Health
              </p>
              <button
                className="text-[11px] font-medium"
                style={{ color: 'var(--shell-accent)', background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => navigate('/pipelines')}
              >
                Manage
              </button>
            </div>
            <div className="flex flex-col" style={{ gap: 0 }}>
              {filteredPipelines.map((pipeline, i) => {
                const s = PIPELINE_STATUS[pipeline.status];
                const hasIssue = pipeline.status === 'failed' || pipeline.status === 'paused';
                return (
                  <div
                    key={pipeline.id}
                    className="flex items-center gap-3 py-2.5 cursor-pointer group"
                    style={{ borderBottom: i < filteredPipelines.length - 1 ? '1px solid var(--shell-border)' : 'none' }}
                    onClick={() => navigate(`/pipeline/${pipeline.id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-[12px] font-medium truncate group-hover:text-[var(--shell-accent)] transition-colors"
                        style={{ color: 'var(--shell-text)' }}
                      >
                        {pipeline.name}
                      </p>
                      <p className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--shell-text-muted)' }}>
                        {pipeline.targetEntities?.join(', ') ?? pipeline.target}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span
                        className="flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-[3px]"
                        style={{ background: s.bg, color: s.color }}
                      >
                        {s.icon}
                        {s.label}
                      </span>
                      {!hasIssue && (
                        <span className="text-[10px]" style={{ color: 'var(--shell-text-muted)' }}>
                          {pipeline.lastRun}
                        </span>
                      )}
                      {hasIssue && (
                        <span className="text-[10px]" style={{ color: s.color }}>
                          {pipeline.status === 'failed' ? 'Needs attention' : 'Data may be stale'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Row 2: Entities in Graph + Activity Feed */}
        <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>

          {/* Entities in Graph (extends to bottom) */}
          <div
            className="rounded-[4px]"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '16px 20px' }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-[13px] font-semibold" style={{ color: 'var(--shell-text)' }}>
                Entities in Graph
              </p>
              <button
                className="text-[11px] font-medium"
                style={{ color: 'var(--shell-accent)', background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => navigate('/knowledge-graph')}
              >
                Explore KG
              </button>
            </div>
            <div className="flex flex-col" style={{ gap: 0 }}>
              {mockKGEntityStats.map((entity, i) => {
                const fresh = FRESHNESS_CONFIG[entity.freshness];
                return (
                  <div
                    key={entity.type}
                    className="flex items-center gap-3 py-2.5"
                    style={{ borderBottom: i < mockKGEntityStats.length - 1 ? '1px solid var(--shell-border)' : 'none' }}
                  >
                    {/* Entity icon */}
                    <img
                      src={ENTITY_ICON[entity.type]}
                      width={20}
                      height={20}
                      alt={entity.type}
                      style={{ flexShrink: 0 }}
                    />
                    <span className="text-[12px] flex-1" style={{ color: 'var(--shell-text)' }}>
                      {toPascalCase(entity.type)}
                    </span>
                    {/* Freshness badge */}
                    <span
                      className="text-[10px] font-medium px-1.5 py-0.5 rounded-[3px] flex-shrink-0"
                      style={{ background: fresh.bg, color: fresh.color }}
                    >
                      {fresh.label}
                    </span>
                    <span
                      className="text-[12px] font-medium text-right flex-shrink-0"
                      style={{ color: 'var(--shell-text)', minWidth: 64 }}
                    >
                      {entity.count.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Total */}
            <div
              className="flex items-center justify-between pt-3 mt-1"
              style={{ borderTop: '1px solid var(--shell-border)' }}
            >
              <span className="text-[12px] font-semibold" style={{ color: 'var(--shell-text)' }}>Total</span>
              <span className="text-[12px] font-semibold" style={{ color: 'var(--shell-text)' }}>
                {kg.totalEntities.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Activity feed */}
          <div
            className="rounded-[4px]"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '16px 20px' }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-[13px] font-semibold" style={{ color: 'var(--shell-text)' }}>
                Recent Activity
              </p>
              <button
                className="text-[11px] font-medium"
                style={{ color: 'var(--shell-accent)', background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => navigate('/pipelines')}
              >
                View all
              </button>
            </div>
            <div className="flex flex-col" style={{ gap: 0 }}>
              {mockActivity.map((item, i) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 py-3"
                  style={{ borderBottom: i < mockActivity.length - 1 ? '1px solid var(--shell-border)' : 'none' }}
                >
                  <span className="flex-shrink-0 mt-0.5">{ACTIVITY_ICONS[item.type]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[12px] font-medium truncate" style={{ color: 'var(--shell-text)' }}>
                        {item.pipeline}
                      </span>
                      <span className="text-[11px] flex-shrink-0" style={{ color: 'var(--shell-text-muted)' }}>
                        {item.time}
                      </span>
                    </div>
                    <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: 'var(--shell-text-muted)' }}>
                      {item.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
