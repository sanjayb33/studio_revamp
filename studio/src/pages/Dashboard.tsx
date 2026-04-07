import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Upload,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  CheckCircle2,
  XCircle,
  PauseCircle,
  Zap,
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
import { mockPipelines, mockActivity, mockIngestionTrend } from '@/data/mock';

const STATUS_CONFIG = {
  active: { label: 'Active', bg: '#EFF7ED', color: '#31A56D', icon: <CheckCircle2 size={12} /> },
  paused: { label: 'Paused', bg: '#FEF3C7', color: '#D98B1D', icon: <PauseCircle size={12} /> },
  failed: { label: 'Failed', bg: '#F9EEEE', color: '#D12329', icon: <XCircle size={12} /> },
  running: { label: 'Running', bg: '#f0f0fc', color: '#6360D8', icon: <Activity size={12} /> },
};

const ACTIVITY_ICONS = {
  run: <CheckCircle2 size={14} style={{ color: '#31A56D' }} />,
  error: <XCircle size={14} style={{ color: '#D12329' }} />,
  created: <Zap size={14} style={{ color: '#6360D8' }} />,
  paused: <PauseCircle size={14} style={{ color: '#D98B1D' }} />,
  deployed: <Zap size={14} style={{ color: '#6360D8' }} />,
};

function KpiCard({
  value,
  label,
  delta,
  direction,
}: {
  value: string;
  label: string;
  delta: string;
  direction: 'up-good' | 'down-good' | 'up-bad' | 'down-bad';
}) {
  const positive = direction === 'up-good' || direction === 'down-good';
  const color = positive ? '#31A56D' : '#D12329';
  const Arrow = direction.startsWith('up') ? ArrowUpRight : ArrowDownRight;

  return (
    <div
      className="flex flex-col gap-1 rounded-[4px] p-2"
      style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
    >
      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--shell-text)', lineHeight: 1.2 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: 'var(--shell-text-muted)' }}>{label}</div>
      <div className="flex items-center gap-1" style={{ fontSize: 11, color }}>
        <Arrow size={12} />
        {delta}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const activePipelines = mockPipelines.filter((p) => p.status === 'active').length;
  const failedPipelines = mockPipelines.filter((p) => p.status === 'failed').length;


  const filteredPipelines = mockPipelines.filter(
    (p) =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.connector.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Sub-header */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--shell-text)' }}>Dashboard</div>
        <div style={{ fontSize: 11, color: 'var(--shell-text-muted)' }}>
          Data Ingestion Studio / <span style={{ color: 'var(--shell-accent)' }}>Overview</span>
        </div>
      </div>

      {/* Search + Actions */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-2 flex-1 max-w-md rounded-[8px] px-3 py-2"
          style={{ background: 'var(--ctrl-bg)', border: '1px solid var(--ctrl-border)' }}
        >
          <Search size={14} style={{ color: 'var(--ctrl-placeholder)', flexShrink: 0 }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pipelines, connectors, or ask AI…"
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: 12,
              color: 'var(--shell-text)',
              width: '100%',
            }}
          />
        </div>
        <button
          onClick={() => navigate('/pipeline/new')}
          className="flex items-center gap-2 rounded-[44px] px-4 py-2 transition-colors"
          style={{
            background: 'var(--shell-accent)',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 500,
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-dark)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--shell-accent)'; }}
        >
          <Plus size={14} />
          New Pipeline
        </button>
        <button
          className="flex items-center gap-2 rounded-[44px] px-4 py-2 transition-colors"
          style={{
            background: 'transparent',
            color: 'var(--shell-text)',
            border: '1px solid var(--ctrl-border)',
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          <Upload size={14} />
          Import Template
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <KpiCard value="42" label="Pipelines Run Today" delta="+8 vs yesterday" direction="up-good" />
        <KpiCard value="5.2B" label="Records Ingested" delta="+12% this week" direction="up-good" />
        <KpiCard value={String(activePipelines)} label="Active Pipelines" delta="+1 since last week" direction="up-good" />
        <KpiCard value={String(failedPipelines)} label="Failed Runs" delta="+1 vs yesterday" direction="up-bad" />
        <KpiCard value="3m 42s" label="Avg Run Duration" delta="-8s vs last week" direction="down-good" />
      </div>

      {/* Chart + Activity */}
      <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 320px' }}>
        {/* Ingestion trend chart */}
        <div
          className="rounded-[4px] p-6"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--shell-text)', marginBottom: 16 }}>
            Records Ingested — Last 7 Days
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={mockIngestionTrend} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6360D8" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6360D8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--table-border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--shell-text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--shell-text-muted)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `${(v / 1000000).toFixed(1)}M`}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--card-border)',
                  borderRadius: 4,
                  fontSize: 12,
                }}
                formatter={(v: number) => [`${(v / 1000000).toFixed(2)}M records`, 'Ingested']}
              />
              <Area
                type="monotone"
                dataKey="records"
                stroke="#6360D8"
                strokeWidth={2}
                fill="url(#areaGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Activity feed */}
        <div
          className="rounded-[4px] p-4 flex flex-col gap-3 overflow-y-auto"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', maxHeight: 280 }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--shell-text)', marginBottom: 4 }}>
            Recent Activity
          </div>
          {mockActivity.map((item) => (
            <div key={item.id} className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {ACTIVITY_ICONS[item.type]}
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="font-medium truncate"
                  style={{ fontSize: 12, color: 'var(--shell-text)' }}
                >
                  {item.pipeline}
                </div>
                <div style={{ fontSize: 11, color: 'var(--shell-text-muted)' }}>{item.detail}</div>
                <div style={{ fontSize: 11, color: 'var(--ctrl-placeholder)', marginTop: 2 }}>{item.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline Cards */}
      <div>
        <div
          className="flex items-center justify-between mb-4"
        >
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--shell-text)' }}>
            {search ? `Results for "${search}"` : 'All Pipelines'}
          </span>
          <button
            onClick={() => navigate('/pipelines')}
            style={{
              fontSize: 12,
              color: 'var(--shell-accent)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            View all →
          </button>
        </div>

        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {filteredPipelines.map((p) => {
            const cfg = STATUS_CONFIG[p.status];
            return (
              <div
                key={p.id}
                className="rounded-[4px] p-4 cursor-pointer transition-colors"
                style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--card-border)',
                }}
                onClick={() => navigate(`/pipeline/${p.id}`)}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--shell-hover)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--shell-accent)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--card-bg)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--card-border)'; }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--shell-text)' }}>
                    {p.name}
                  </div>
                  <span
                    className="flex items-center gap-1 rounded-[4px] px-2 py-0.5"
                    style={{ background: cfg.bg, color: cfg.color, fontSize: 11, fontWeight: 600, flexShrink: 0 }}
                  >
                    {cfg.icon}
                    {cfg.label}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--shell-text-muted)' }}>Last run</div>
                    <div style={{ fontSize: 12, color: 'var(--shell-text)' }}>{p.lastRun}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--shell-text-muted)' }}>Records</div>
                    <div style={{ fontSize: 12, color: 'var(--shell-text)' }}>{p.records}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--shell-text-muted)' }}>Next run</div>
                    <div style={{ fontSize: 12, color: 'var(--shell-text)' }}>{p.nextRun}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--shell-text-muted)' }}>Success rate</div>
                    <div style={{ fontSize: 12, color: p.successRate >= 95 ? '#31A56D' : '#D98B1D' }}>
                      {p.successRate}%
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredPipelines.length === 0 && (
          <div
            className="rounded-[4px] flex flex-col items-center justify-center py-12"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
          >
            <div style={{ fontSize: 28, marginBottom: 12 }}>🚦</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--shell-text)', marginBottom: 8 }}>
              No Data… For Now!
            </div>
            <div style={{ fontSize: 12, color: 'var(--shell-text-muted)' }}>
              No pipelines match your search. Try different keywords.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
