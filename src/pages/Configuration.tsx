import { BookOpen, Globe, Users, Shield, ChevronRight, CheckCircle2, ToggleRight } from 'lucide-react';

const CONFIG_SECTIONS = [
  {
    icon: <BookOpen size={18} style={{ color: '#6360D8' }} />,
    iconBg: 'rgba(99,96,216,0.08)',
    title: 'Entity Dictionaries',
    description: 'Define and manage entity schemas, attribute types, and allowed values for Knowledge Graph entities.',
    items: [
      { label: 'Asset Schema', status: 'active' },
      { label: 'Identity Schema', status: 'active' },
      { label: 'Vulnerability Schema', status: 'active' },
      { label: 'Alert Schema', status: 'active' },
      { label: 'IOC Schema', status: 'inactive' },
    ],
    badge: '4 of 5 active',
    badgeBg: '#EFF7ED',
    badgeColor: '#31A56D',
  },
  {
    icon: <Globe size={18} style={{ color: '#31A56D' }} />,
    iconBg: 'rgba(49,165,109,0.08)',
    title: 'Global Configuration',
    description: 'Platform-wide settings including default schedules, retry policies, normalization rules, and enrichment sources.',
    items: [
      { label: 'Default Pipeline Schedule', status: 'active' },
      { label: 'Retry Policy', status: 'active' },
      { label: 'GeoIP Enrichment', status: 'active' },
      { label: 'CVE Enrichment (NVD)', status: 'active' },
      { label: 'Hash Reputation (VirusTotal)', status: 'inactive' },
    ],
    badge: 'Configured',
    badgeBg: '#EFF7ED',
    badgeColor: '#31A56D',
  },
  {
    icon: <Users size={18} style={{ color: '#0EA5E9' }} />,
    iconBg: 'rgba(14,165,233,0.08)',
    title: 'Access Control',
    description: 'Role-based access control for pipeline configurations, connector credentials, and platform settings.',
    items: [
      { label: 'Admin Role', status: 'active' },
      { label: 'Security Engineer Role', status: 'active' },
      { label: 'Viewer Role', status: 'active' },
      { label: 'Approval Workflows', status: 'inactive' },
    ],
    badge: '3 roles configured',
    badgeBg: '#EFF7ED',
    badgeColor: '#31A56D',
  },
  {
    icon: <Shield size={18} style={{ color: '#D98B1D' }} />,
    iconBg: 'rgba(217,139,29,0.08)',
    title: 'Audit & Compliance',
    description: 'Audit trail for all configuration changes, pipeline deployments, and credential access.',
    items: [
      { label: 'Change Log', status: 'active' },
      { label: 'Deployment History', status: 'active' },
      { label: 'Credential Access Log', status: 'active' },
    ],
    badge: 'Enabled',
    badgeBg: '#EFF7ED',
    badgeColor: '#31A56D',
  },
];

export default function Configuration() {
  return (
    <div style={{ padding: '24px 28px' }}>
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
        {CONFIG_SECTIONS.map(section => (
          <div
            key={section.title}
            className="rounded-[4px] flex flex-col"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '20px' }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
              <div
                className="rounded-[6px] flex items-center justify-center flex-shrink-0"
                style={{ width: 36, height: 36, background: section.iconBg }}
              >
                {section.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold" style={{ color: 'var(--shell-text)' }}>{section.title}</p>
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-[3px] font-medium inline-flex items-center gap-1"
                  style={{ background: section.badgeBg, color: section.badgeColor }}
                >
                  <CheckCircle2 size={9} />
                  {section.badge}
                </span>
              </div>
              <button
                className="flex-shrink-0 flex items-center gap-1 text-[11px] font-medium rounded-[4px] transition-colors"
                style={{ color: 'var(--shell-accent)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px' }}
              >
                Manage <ChevronRight size={12} />
              </button>
            </div>

            {/* Description */}
            <p className="text-[12px] leading-relaxed mb-3" style={{ color: 'var(--shell-text-muted)' }}>
              {section.description}
            </p>

            {/* Items */}
            <div className="flex flex-col gap-1">
              {section.items.map(item => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-2 text-[12px]"
                  style={{ color: 'var(--shell-text)', padding: '4px 0', borderBottom: '1px solid var(--shell-border)' }}
                >
                  <span style={{ color: item.status === 'active' ? 'var(--shell-text)' : 'var(--shell-text-muted)' }}>
                    {item.label}
                  </span>
                  <ToggleRight
                    size={16}
                    style={{ color: item.status === 'active' ? '#31A56D' : 'var(--ctrl-border)', flexShrink: 0 }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
