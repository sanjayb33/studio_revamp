import { BookOpen, Globe, Users, Shield } from 'lucide-react';

const CONFIG_SECTIONS = [
  {
    icon: <BookOpen size={18} style={{ color: '#6360D8' }} />,
    title: 'Entity Dictionaries',
    description: 'Define and manage entity schemas, attribute types, and allowed values for Knowledge Graph entities.',
    items: ['Asset Schema', 'Identity Schema', 'Vulnerability Schema', 'Alert Schema', 'IOC Schema'],
    status: 'Available in Stage 6',
  },
  {
    icon: <Globe size={18} style={{ color: '#31A56D' }} />,
    title: 'Global Configuration',
    description: 'Platform-wide settings including default schedules, retry policies, normalization rules, and enrichment sources.',
    items: ['Default Pipeline Schedule', 'Retry Policy', 'GeoIP Enrichment', 'CVE Enrichment (NVD)', 'Hash Reputation (VirusTotal)'],
    status: 'Available in Stage 6',
  },
  {
    icon: <Users size={18} style={{ color: '#0EA5E9' }} />,
    title: 'Access Control',
    description: 'Role-based access control for pipeline configurations, connector credentials, and platform settings.',
    items: ['Admin Role', 'Security Engineer Role', 'Viewer Role', 'Approval Workflows'],
    status: 'Available in Stage 6',
  },
  {
    icon: <Shield size={18} style={{ color: '#D98B1D' }} />,
    title: 'Audit & Compliance',
    description: 'Audit trail for all configuration changes, pipeline deployments, and credential access.',
    items: ['Change Log', 'Deployment History', 'Credential Access Log'],
    status: 'Available in Stage 6',
  },
];

export default function Configuration() {
  return (
    <div style={{ padding: '24px 28px' }}>
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
        {CONFIG_SECTIONS.map(section => (
          <div
            key={section.title}
            className="rounded-[4px]"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '20px', opacity: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="rounded-[6px] flex items-center justify-center"
                style={{ width: 36, height: 36, background: 'var(--shell-raised)', flexShrink: 0 }}
              >
                {section.icon}
              </div>
              <div>
                <p className="text-[13px] font-semibold" style={{ color: 'var(--shell-text)' }}>{section.title}</p>
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-[3px] font-medium"
                  style={{ background: 'var(--shell-raised)', color: 'var(--shell-text-muted)', border: '1px solid var(--ctrl-border)' }}
                >
                  {section.status}
                </span>
              </div>
            </div>
            <p className="text-[12px] leading-relaxed mb-3" style={{ color: 'var(--shell-text-muted)' }}>
              {section.description}
            </p>
            <div className="flex flex-col gap-1">
              {section.items.map(item => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-[12px]"
                  style={{ color: 'var(--shell-text-muted)', padding: '4px 0' }}
                >
                  <span
                    style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--ctrl-border)', flexShrink: 0 }}
                  />
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
