import { useNavigate } from 'react-router-dom';
import { Share2, ShieldCheck, Crosshair, Eye, ArrowRight, CheckCircle2, XCircle, Clock } from 'lucide-react';

const SOLUTIONS = [
  {
    id: 'kg-detailed-view',
    name: 'Knowledge Graph Detailed View',
    description: 'Interactively explore the full security entity graph — traverse relationships between hosts, identities, vulnerabilities, cloud assets, and findings to understand your attack surface in context.',
    icon: <Share2 size={20} style={{ color: '#6360D8' }} />,
    iconBg: 'rgba(99,96,216,0.1)',
    status: 'active',
    route: '/knowledge-graph',
    feedingPipelines: ['CrowdStrike Falcon', 'Tenable.io Vulnerability', 'AWS Security Hub', 'Okta Identity Provider'],
    dataFreshnessSLA: '15 min',
    currentFreshness: '4 min',
    freshnessOk: true,
    kpis: [{ label: 'Total Entities', value: '248,312' }, { label: 'Relationships', value: '1.2M' }],
  },
  {
    id: 'controls-monitoring',
    name: 'Controls Monitoring',
    description: 'Continuously assess the health and coverage of your security controls. Correlate control state with asset inventory to surface gaps, failures, and remediation priorities across frameworks.',
    icon: <ShieldCheck size={20} style={{ color: '#31A56D' }} />,
    iconBg: 'rgba(49,165,109,0.1)',
    status: 'active',
    route: '/knowledge-graph',
    feedingPipelines: ['CrowdStrike Falcon', 'AWS Security Hub', 'Tenable.io Vulnerability'],
    dataFreshnessSLA: '1 hour',
    currentFreshness: '22 min',
    freshnessOk: true,
    kpis: [{ label: 'Controls Assessed', value: '3,847' }, { label: 'Passing', value: '94%' }],
  },
  {
    id: 'attack-surface',
    name: 'Attack Surface Dashboards',
    description: 'Visualize your external and internal attack surface across cloud, network, and identity layers. Aggregate exposure signals to prioritise which assets demand immediate attention.',
    icon: <Crosshair size={20} style={{ color: '#D98B1D' }} />,
    iconBg: 'rgba(217,139,29,0.1)',
    status: 'active',
    route: '/knowledge-graph',
    feedingPipelines: ['CrowdStrike Falcon', 'MISP Threat Intelligence', 'AWS Security Hub'],
    dataFreshnessSLA: '30 min',
    currentFreshness: '11 min',
    freshnessOk: true,
    kpis: [{ label: 'Exposed Assets', value: '12,440' }, { label: 'Critical Paths', value: '87' }],
  },
  {
    id: 'exposure-monitoring',
    name: 'Exposure Monitoring',
    description: 'Track asset exposure trends over time across environments. Correlate CVEs, misconfigurations, and identity risks into a unified exposure score with drill-down to root-cause entities.',
    icon: <Eye size={20} style={{ color: '#0EA5E9' }} />,
    iconBg: 'rgba(14,165,233,0.1)',
    status: 'degraded',
    route: '/knowledge-graph',
    feedingPipelines: ['Tenable.io Vulnerability', 'Okta Identity Provider'],
    dataFreshnessSLA: '4 hours',
    currentFreshness: '4h 12min',
    freshnessOk: false,
    freshnessNote: 'Tenable pipeline delayed — exposure scores may be stale',
    kpis: [{ label: 'Assets Monitored', value: '98,340' }, { label: 'High Exposure', value: '1,204' }],
  },
];

const STATUS_CONFIG = {
  active:   { label: 'Operational', bg: '#EFF7ED', color: '#31A56D', icon: <CheckCircle2 size={12} /> },
  degraded: { label: 'Degraded',    bg: '#FEF3C7', color: '#D98B1D', icon: <Clock size={12} /> },
  down:     { label: 'Down',        bg: '#F9EEEE', color: '#D12329', icon: <XCircle size={12} /> },
};

export default function Solutions() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '24px 28px' }}>
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))' }}>
        {SOLUTIONS.map(sol => {
          const s = STATUS_CONFIG[sol.status as keyof typeof STATUS_CONFIG];
          return (
            <div
              key={sol.id}
              className="rounded-[4px]"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '20px' }}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="rounded-[6px] flex items-center justify-center flex-shrink-0"
                    style={{ width: 40, height: 40, background: sol.iconBg }}
                  >
                    {sol.icon}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold" style={{ color: 'var(--shell-text)' }}>{sol.name}</p>
                    <span
                      className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-[44px] w-fit mt-0.5"
                      style={{ background: s.bg, color: s.color }}
                    >
                      {s.icon} {s.label}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => navigate(sol.route)}
                  className="flex items-center gap-1 text-[11px] font-medium rounded-[44px] flex-shrink-0 transition-colors"
                  style={{ padding: '5px 12px', background: 'var(--shell-accent)', color: '#fff', border: 'none', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-dark)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--shell-accent)')}
                >
                  Open <ArrowRight size={11} />
                </button>
              </div>

              <p className="text-[12px] leading-relaxed mb-4" style={{ color: 'var(--shell-text-muted)' }}>
                {sol.description}
              </p>

              {/* KPIs */}
              <div className="flex gap-4 mb-4 pb-4" style={{ borderBottom: '1px solid var(--shell-border)' }}>
                {sol.kpis.map(kpi => (
                  <div key={kpi.label}>
                    <p className="text-[14px] font-bold" style={{ color: 'var(--shell-text)' }}>{kpi.value}</p>
                    <p className="text-[11px]" style={{ color: 'var(--shell-text-muted)' }}>{kpi.label}</p>
                  </div>
                ))}
              </div>

              {/* Feeding pipelines */}
              <div className="mb-3">
                <p className="text-[11px] font-semibold uppercase mb-2" style={{ color: 'var(--shell-text-muted)', letterSpacing: '0.06em' }}>
                  Powered by
                </p>
                <div className="flex flex-wrap gap-1">
                  {sol.feedingPipelines.map(p => (
                    <span
                      key={p}
                      className="text-[10px] px-2 py-0.5 rounded-[3px]"
                      style={{ background: 'var(--shell-raised)', color: 'var(--shell-text-muted)', border: '1px solid var(--ctrl-border)' }}
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Freshness */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px]" style={{ color: sol.freshnessOk ? 'var(--shell-text-muted)' : '#D98B1D' }}>
                    {sol.freshnessOk
                      ? `Data freshness: ${sol.currentFreshness} (SLA: ${sol.dataFreshnessSLA})`
                      : sol.freshnessNote}
                  </p>
                </div>
                {!sol.freshnessOk && (
                  <button
                    className="flex items-center gap-1 text-[11px] font-medium rounded-[44px] transition-colors"
                    style={{ color: '#D98B1D', background: '#FEF3C7', border: '1px solid #D98B1D40', cursor: 'pointer', padding: '4px 10px' }}
                    onClick={() => navigate('/pipelines')}
                  >
                    Fix pipeline <ArrowRight size={11} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
