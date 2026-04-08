import { useState, useEffect, useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  RefreshCw, ArrowRight, AlertTriangle, CheckCircle2, XCircle,
  TrendingUp, Clock, ExternalLink, ChevronRight, GitMerge,
} from 'lucide-react';
import { mockKGEntityStats, mockKGHealth, mockPipelines } from '@/data/mock';
import type { KGEntityType, EntityFreshness } from '@/types';

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

// ─── Static data ──────────────────────────────────────────────────────────────

const FRESHNESS_CFG: Record<EntityFreshness, { label: string; bg: string; color: string }> = {
  fresh:    { label: 'Fresh',    bg: '#EFF7ED', color: '#31A56D' },
  stale:    { label: 'Stale',    bg: '#FEF3C7', color: '#D98B1D' },
  critical: { label: 'No Data',  bg: '#F9EEEE', color: '#D12329' },
};

function toPascalCase(str: string) {
  return str.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
}

// 7-day daily entity growth (Apr 1–7)
const SPARKLINE_DATA: Record<KGEntityType, number[]> = {
  host:              [2400, 2600, 2500, 2700, 2800, 2900, 2840],
  identity:          [0,    0,    0,    0,    0,    0,    0   ],
  vulnerability:     [300,  350,  380,  290,  310,  360,  380 ],
  finding:           [980,  1020, 1100, 1050, 1080, 1100, 1120],
  account:           [14000,16000,18000,17500,18200,19000,18240],
  person:            [400,  390,  410,  430,  420,  410,  420 ],
  application:       [180,  200,  210,  195,  205,  210,  210 ],
  network:           [160,  165,  175,  170,  175,  180,  180 ],
  'network-interface':[0,   0,    0,    0,    0,    0,    0   ],
  'network-services': [70,  75,   80,   82,   84,   84,   84  ],
  'cloud-account':   [28,   30,   30,   31,   32,   32,   32  ],
  'cloud-container': [0,    0,    0,    0,    0,    0,    0   ],
  'cloud-cluster':   [10,   11,   11,   12,   12,   12,   12  ],
  'cloud-storage':   [0,    0,    0,    0,    0,    0,    0   ],
  assessment:        [24,   26,   26,   27,   28,   28,   28  ],
  Group:             [0,    0,    0,    0,    0,    0,    0   ],
};

// SVG graph — two-ring radial layout
// Centre: host · Inner ring (6): identity, account, vulnerability, finding, network, person
// Outer ring (9): application, assessment, cloud-account, cloud-container, cloud-cluster,
//                 cloud-storage, Group, network-services, network-interface
// ViewBox: 560 × 480, centre at (280, 240)
type NodePos = { x: number; y: number; r: number };
const NODE_POS: Record<KGEntityType, NodePos> = {
  // Centre hub
  host:              { x: 280, y: 240, r: 22 },
  // Inner ring — r=115, 6 nodes at 60° starting –90°
  identity:          { x: 280, y: 125, r: 18 },   // –90°
  account:           { x: 380, y: 183, r: 17 },   // –30°
  vulnerability:     { x: 380, y: 297, r: 17 },   // +30°
  finding:           { x: 280, y: 355, r: 16 },   // +90°
  network:           { x: 180, y: 297, r: 15 },   // +150°
  person:            { x: 180, y: 183, r: 15 },   // +210°
  // Outer ring — r=200, 9 nodes at 40° starting –90°
  application:       { x: 280, y:  40, r: 13 },   // –90°
  assessment:        { x: 409, y:  87, r: 12 },   // –50°
  'cloud-account':   { x: 477, y: 205, r: 12 },   // –10°
  'cloud-container': { x: 453, y: 340, r: 12 },   // +30°
  'cloud-cluster':   { x: 348, y: 428, r: 12 },   // +70°
  'cloud-storage':   { x: 212, y: 428, r: 12 },   // +110°
  Group:             { x: 107, y: 340, r: 12 },   // +150°
  'network-services':{ x:  83, y: 205, r: 12 },   // +190°
  'network-interface':{ x: 151, y:  87, r: 12 },  // +230°
};

// All 12 valid edges for the full interactive graph
const GRAPH_EDGES_ALL: { from: KGEntityType; to: KGEntityType; label: string; weight: number }[] = [
  { from: 'finding',      to: 'host',               label: 'DETECTED_ON',   weight: 3 },
  { from: 'finding',      to: 'vulnerability',      label: 'LINKED_TO',     weight: 2 },
  { from: 'finding',      to: 'account',            label: 'PART_OF',       weight: 2 },
  { from: 'vulnerability',to: 'host',               label: 'AFFECTS',       weight: 3 },
  { from: 'identity',     to: 'account',            label: 'BELONGS_TO',    weight: 3 },
  { from: 'identity',     to: 'host',               label: 'HAS_ACCESS_TO', weight: 2 },
  { from: 'person',       to: 'identity',           label: 'HAS_IDENTITY',  weight: 2 },
  { from: 'host',         to: 'network',            label: 'CONNECTED_TO',  weight: 3 },
  { from: 'host',         to: 'network-interface',  label: 'HAS_INTERFACE', weight: 2 },
  { from: 'account',      to: 'cloud-account',      label: 'OWNS',          weight: 2 },
  { from: 'assessment',   to: 'host',               label: 'SCANNED',       weight: 2 },
  { from: 'Group',        to: 'identity',           label: 'CONTAINS',      weight: 2 },
];

// Relationship types for the legend
const ENTITY_RELATIONSHIPS = [
  { from: 'finding',        rel: 'DETECTED_ON',    to: 'host'              },
  { from: 'finding',        rel: 'LINKED_TO',      to: 'vulnerability'     },
  { from: 'finding',        rel: 'PART_OF',        to: 'account'           },
  { from: 'finding',        rel: 'VIOLATES',       to: 'ComplianceControl' },
  { from: 'vulnerability',  rel: 'AFFECTS',        to: 'host'              },
  { from: 'vulnerability',  rel: 'HAS_CVE',        to: 'CVERecord'         },
  { from: 'identity',       rel: 'BELONGS_TO',     to: 'account'           },
  { from: 'identity',       rel: 'HAS_ACCESS_TO',  to: 'host'              },
  { from: 'person',         rel: 'HAS_IDENTITY',   to: 'identity'          },
  { from: 'host',           rel: 'CONNECTED_TO',   to: 'network'           },
  { from: 'host',           rel: 'HAS_INTERFACE',  to: 'network-interface' },
  { from: 'account',        rel: 'OWNS',           to: 'cloud-account'     },
  { from: 'assessment',     rel: 'SCANNED',        to: 'host'              },
  { from: 'Group',          rel: 'CONTAINS',       to: 'identity'          },
];

// Sample records per entity type (5 rows for detail panel)
const ENTITY_SAMPLE_RECORDS: Record<KGEntityType, { headers: string[]; rows: string[][] }> = {
  host: {
    headers: ['host_id', 'hostname', 'ip_address', 'os', 'last_seen'],
    rows: [
      ['HST-00042', 'ws-prod-042',  '10.0.1.42',  'Windows 11',  '2026-04-07 14:02'],
      ['HST-00011', 'srv-db-011',   '10.0.2.11',  'Ubuntu 22.04','2026-04-07 14:01'],
      ['HST-00107', 'ws-dev-107',   '10.0.3.107', 'Windows 11',  '2026-04-07 13:58'],
      ['HST-00003', 'svc-app-003',  '10.0.2.3',   'RHEL 9',      '2026-04-07 13:55'],
      ['HST-00019', 'ws-prod-019',  '10.0.1.19',  'Windows 10',  '2026-04-07 13:50'],
    ],
  },
  identity: {
    headers: ['identity_id', 'email', 'type', 'mfa_enabled', 'risk_score'],
    rows: [
      ['IDN-00001', 'admin@acme.com',       'User',            'Yes', '12'],
      ['IDN-00002', 'svc-deploy@acme.com',  'Service Account', 'No',  '87'],
      ['IDN-00003', 'j.doe@acme.com',       'User',            'Yes',  '4'],
      ['IDN-00004', 'j.smith@acme.com',     'User',            'No',  '34'],
      ['IDN-00005', 'backup-svc@acme.com',  'Service Account', 'No',  '61'],
    ],
  },
  vulnerability: {
    headers: ['vuln_id', 'cve_id', 'severity', 'cvss', 'affected_hosts'],
    rows: [
      ['VUL-0001', 'CVE-2024-3400',  'Critical', '10.0', '14'],
      ['VUL-0002', 'CVE-2024-21887', 'Critical',  '9.8',  '8'],
      ['VUL-0003', 'CVE-2024-1709',  'Critical',  '9.8',  '3'],
      ['VUL-0004', 'CVE-2023-46805', 'High',      '8.2',  '6'],
      ['VUL-0005', 'CVE-2024-23897', 'High',      '7.5',  '2'],
    ],
  },
  finding: {
    headers: ['finding_id', 'control', 'resource', 'severity', 'age'],
    rows: [
      ['FND-00001', 'S3 bucket public read',    'prod-backup-s3', 'Critical', '3d'],
      ['FND-00002', 'Security group 0.0.0.0/0', 'sg-webapp-prod', 'High',     '5d'],
      ['FND-00003', 'Unencrypted EBS volume',   'i-0a1b2c3d4e5',  'Medium',   '1d'],
      ['FND-00004', 'Root account used',         'AWS root',       'Critical', '7d'],
      ['FND-00005', 'MFA not enabled on IAM',   'svc-deploy-iam', 'High',     '2d'],
    ],
  },
  account: {
    headers: ['account_id', 'name', 'provider', 'region', 'resources'],
    rows: [
      ['ACC-00001', 'acme-prod',     'AWS',   'us-east-1',    '1,842'],
      ['ACC-00002', 'acme-staging',  'AWS',   'us-west-2',    '482'],
      ['ACC-00003', 'acme-corp',     'Azure', 'eastus',       '984'],
      ['ACC-00004', 'acme-gcp-main', 'GCP',   'us-central1',  '342'],
      ['ACC-00005', 'acme-dev',      'AWS',   'eu-west-1',    '188'],
    ],
  },
  person: {
    headers: ['person_id', 'name', 'title', 'department', 'risk_score'],
    rows: [
      ['PRS-00001', 'Alex Rodriguez', 'Sr. Engineer',    'Platform',  '8'],
      ['PRS-00002', 'Jamie Lee',      'DevOps Lead',     'Infra',    '22'],
      ['PRS-00003', 'Morgan Chen',    'Security Analyst','SecOps',    '5'],
      ['PRS-00004', 'Sam Torres',     'DB Admin',        'Data',     '41'],
      ['PRS-00005', 'Taylor Kim',     'IT Admin',        'IT Ops',   '18'],
    ],
  },
  application: {
    headers: ['app_id', 'name', 'version', 'owner', 'cve_count'],
    rows: [
      ['APP-00001', 'acme-api-gateway', '3.2.1',  'Platform',  '2'],
      ['APP-00002', 'acme-auth-svc',    '2.0.4',  'Identity',  '0'],
      ['APP-00003', 'acme-data-ingest', '1.8.0',  'Data',      '1'],
      ['APP-00004', 'acme-dashboard',   '4.1.2',  'Frontend',  '0'],
      ['APP-00005', 'acme-worker',      '2.3.0',  'Platform',  '3'],
    ],
  },
  network: {
    headers: ['network_id', 'cidr', 'name', 'zone', 'host_count'],
    rows: [
      ['NET-00001', '10.0.0.0/16',  'vpc-prod',        'prod',    '1,420'],
      ['NET-00002', '10.1.0.0/16',  'vpc-staging',     'staging',  '312'],
      ['NET-00003', '10.2.0.0/24',  'subnet-db',       'private',   '48'],
      ['NET-00004', '172.16.0.0/12','on-prem-corp',    'corp',      '840'],
      ['NET-00005', '192.168.0.0/24','mgmt-net',       'mgmt',      '28'],
    ],
  },
  'network-interface': {
    headers: ['nic_id', 'mac_address', 'ip_address', 'host', 'status'],
    rows: [
      ['NIC-00001', '00:1A:2B:3C:4D:01', '10.0.1.42',  'ws-prod-042', 'Up'],
      ['NIC-00002', '00:1A:2B:3C:4D:02', '10.0.2.11',  'srv-db-011',  'Up'],
      ['NIC-00003', '00:1A:2B:3C:4D:03', '10.0.3.107', 'ws-dev-107',  'Up'],
      ['NIC-00004', '00:1A:2B:3C:4D:04', '10.0.2.3',   'svc-app-003', 'Up'],
      ['NIC-00005', '00:1A:2B:3C:4D:05', '10.0.1.19',  'ws-prod-019', 'Down'],
    ],
  },
  'network-services': {
    headers: ['svc_id', 'name', 'protocol', 'port', 'host_count'],
    rows: [
      ['SVC-00001', 'HTTPS', 'TCP', '443', '284'],
      ['SVC-00002', 'SSH',   'TCP', '22',   '48'],
      ['SVC-00003', 'RDP',   'TCP', '3389', '12'],
      ['SVC-00004', 'MySQL', 'TCP', '3306', '11'],
      ['SVC-00005', 'Redis', 'TCP', '6379',  '8'],
    ],
  },
  'cloud-account': {
    headers: ['ca_id', 'account_id', 'provider', 'status', 'findings'],
    rows: [
      ['CA-00001', '123456789012', 'AWS',   'Active', '14'],
      ['CA-00002', '234567890123', 'AWS',   'Active',  '3'],
      ['CA-00003', 'sub-abc-123',  'Azure', 'Active',  '7'],
      ['CA-00004', 'gcp-proj-1',   'GCP',   'Active',  '2'],
      ['CA-00005', '345678901234', 'AWS',   'Active',  '1'],
    ],
  },
  'cloud-container': {
    headers: ['container_id', 'image', 'registry', 'status', 'cve_count'],
    rows: [
      ['CTR-00001', 'acme/api:3.2.1',    'ECR', 'Running', '2'],
      ['CTR-00002', 'acme/worker:2.3.0', 'ECR', 'Running', '4'],
      ['CTR-00003', 'nginx:1.25',         'Hub', 'Running', '0'],
      ['CTR-00004', 'postgres:15',        'Hub', 'Stopped', '1'],
      ['CTR-00005', 'acme/auth:2.0.4',   'ECR', 'Running', '0'],
    ],
  },
  'cloud-cluster': {
    headers: ['cluster_id', 'name', 'provider', 'version', 'node_count'],
    rows: [
      ['CLC-00001', 'prod-eks-us-east',  'AWS EKS',  '1.29', '24'],
      ['CLC-00002', 'staging-eks',       'AWS EKS',  '1.28',  '8'],
      ['CLC-00003', 'gke-prod-central',  'GCP GKE',  '1.29', '12'],
      ['CLC-00004', 'aks-prod-east',     'Azure AKS','1.29', '16'],
      ['CLC-00005', 'dev-kind',          'On-prem',  '1.28',  '3'],
    ],
  },
  'cloud-storage': {
    headers: ['storage_id', 'name', 'provider', 'public', 'size_gb'],
    rows: [
      ['STG-00001', 'prod-backup-s3',    'AWS S3',      'No',  '8,420'],
      ['STG-00002', 'logs-archive',      'AWS S3',      'No',  '14,200'],
      ['STG-00003', 'acme-assets-cdn',   'AWS S3',      'Yes',   '320'],
      ['STG-00004', 'db-backups-azure',  'Azure Blob',  'No',  '4,820'],
      ['STG-00005', 'gcs-ml-datasets',   'GCP GCS',     'No',  '18,400'],
    ],
  },
  assessment: {
    headers: ['assessment_id', 'type', 'target', 'score', 'date'],
    rows: [
      ['ASM-00001', 'Vulnerability Scan', 'vpc-prod',    '74/100', '2026-04-06'],
      ['ASM-00002', 'CIS Benchmark',      'AWS account', '82/100', '2026-04-05'],
      ['ASM-00003', 'Pen Test',           'web-app',     '68/100', '2026-03-28'],
      ['ASM-00004', 'SOC2 Audit',         'Platform',    '91/100', '2026-03-15'],
      ['ASM-00005', 'DAST Scan',          'acme-api',    '77/100', '2026-04-07'],
    ],
  },
  Group: {
    headers: ['group_id', 'name', 'provider', 'member_count', 'type'],
    rows: [
      ['GRP-00001', 'Domain Admins',   'Active Directory', '8',   'Security'],
      ['GRP-00002', 'DevOps',          'Okta',             '24',  'SCIM'],
      ['GRP-00003', 'SecurityOps',     'Okta',             '12',  'SCIM'],
      ['GRP-00004', 'DB Admins',       'Active Directory', '5',   'Security'],
      ['GRP-00005', 'aws-admins',      'AWS IAM',          '7',   'IAM'],
    ],
  },
};

// Disambiguation backlog (global view)
const GLOBAL_DISAMBIG = [
  { id: 'dg-1', entityType: 'host' as KGEntityType,     count: 148, pipeline: 'AWS Security Hub',        oldest: '6h ago',     strategy: 'Fuzzy match' },
  { id: 'dg-2', entityType: 'host' as KGEntityType,     count: 87,  pipeline: 'CrowdStrike Falcon',       oldest: '14 min ago', strategy: 'Exact match' },
  { id: 'dg-3', entityType: 'identity' as KGEntityType, count: 62,  pipeline: 'Okta Identity Provider',   oldest: '6h ago',     strategy: 'ML-based'    },
  { id: 'dg-4', entityType: 'finding' as KGEntityType,  count: 45,  pipeline: 'MISP Threat Intelligence', oldest: '3h ago',     strategy: 'Fuzzy match' },
];

// ─── Sparkline SVG ────────────────────────────────────────────────────────────

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const W = 72, H = 26;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * W},${H - ((v - min) / range) * (H - 4) - 2}`)
    .join(' ');
  // Gradient fill area
  const areaEnd = `${W},${H} 0,${H}`;
  return (
    <svg width={W} height={H} style={{ overflow: 'visible', display: 'block' }}>
      <defs>
        <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={`${pts} ${areaEnd}`} fill={`url(#sg-${color.replace('#', '')})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Entity card ──────────────────────────────────────────────────────────────

function EntityCard({
  entity, selected, onClick,
}: {
  entity: typeof mockKGEntityStats[0];
  selected: boolean;
  onClick: () => void;
}) {
  const fresh = FRESHNESS_CFG[entity.freshness];
  return (
    <button
      onClick={onClick}
      style={{
        textAlign: 'left',
        padding: '14px 16px',
        borderRadius: 4,
        border: `1.5px solid ${selected ? 'var(--shell-accent)' : 'var(--card-border)'}`,
        background: selected ? 'var(--shell-active)' : 'var(--card-bg)',
        cursor: 'pointer',
        transition: 'border-color 0.15s, background 0.15s',
        boxShadow: selected ? '0 0 0 3px var(--shell-active)' : 'none',
      }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <img src={ENTITY_ICON[entity.type]} width={20} height={20} alt={entity.type} style={{ flexShrink: 0 }} />
          <span className="text-[12px] font-semibold" style={{ color: 'var(--shell-text)' }}>{toPascalCase(entity.type)}</span>
        </div>
        <span
          className="text-[9px] font-bold px-1.5 py-0.5 rounded-[3px]"
          style={{ background: fresh.bg, color: fresh.color }}
        >
          {fresh.label}
        </span>
      </div>

      {/* Count + sparkline */}
      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="text-[14px] font-bold leading-none" style={{ color: 'var(--shell-text)', fontVariantNumeric: 'tabular-nums' }}>
            {entity.count.toLocaleString()}
          </p>
          <p className="text-[10px] mt-1" style={{ color: entity.delta > 0 ? '#31A56D' : 'var(--shell-text-muted)' }}>
            {entity.delta > 0 ? `+${entity.delta.toLocaleString()} today` : entity.freshness !== 'fresh' ? 'Source inactive' : 'No growth today'}
          </p>
        </div>
        <Sparkline data={SPARKLINE_DATA[entity.type]} color={entity.freshness === 'fresh' ? entity.color : '#CFCFCF'} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3">
        <span className="text-[10px]" style={{ color: 'var(--shell-text-muted)' }}>
          <Clock size={9} style={{ display: 'inline', marginRight: 3 }} />
          {entity.lastUpdated}
        </span>
        <span className="text-[10px]" style={{ color: 'var(--shell-text-muted)' }}>
          {entity.pipelineCount} pipeline{entity.pipelineCount !== 1 ? 's' : ''}
        </span>
      </div>
    </button>
  );
}

// ─── Entity detail drill-down panel ──────────────────────────────────────────

function EntityDetailPanel({ entityType }: { entityType: KGEntityType }) {
  const navigate = useNavigate();
  const entity = mockKGEntityStats.find(e => e.type === entityType)!;
  const fresh = FRESHNESS_CFG[entity.freshness];
  const linkedPipelines = mockPipelines.filter(p => p.targetEntities?.includes(entityType));
  const sampleData = ENTITY_SAMPLE_RECORDS[entityType];
  const relationships = ENTITY_RELATIONSHIPS.filter(r => r.from === entityType || r.to === entityType);

  return (
    <div className="rounded-[4px] overflow-hidden" style={{ border: '1px solid var(--card-border)', background: 'var(--card-bg)' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between"
        style={{ padding: '12px 16px', borderBottom: '1px solid var(--card-border)', background: 'var(--shell-raised)' }}
      >
        <div className="flex items-center gap-2.5">
          <img src={ENTITY_ICON[entity.type]} width={20} height={20} alt={entity.type} style={{ flexShrink: 0 }} />
          <span className="text-[13px] font-semibold" style={{ color: 'var(--shell-text)' }}>{toPascalCase(entity.type)}</span>
          <span className="text-[14px] font-bold tabular-nums" style={{ color: 'var(--shell-text)' }}>
            {entity.count.toLocaleString()}
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-[3px]" style={{ background: fresh.bg, color: fresh.color }}>
            {fresh.label}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[11px]" style={{ color: 'var(--shell-text-muted)' }}>
            Last updated: {entity.lastUpdated}
          </span>
        </div>
      </div>

      <div className="grid gap-5" style={{ padding: '16px', gridTemplateColumns: '1fr 220px' }}>
        {/* Sample records */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--shell-text-muted)' }}>
            Sample Records
          </p>
          <div className="rounded-[4px] overflow-hidden" style={{ border: '1px solid var(--table-border)', background: 'var(--card-bg)' }}>
            <table className="w-full" style={{ fontSize: 11, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--table-th-bg)' }}>
                  {sampleData.headers.map(h => (
                    <th key={h} className="text-left px-3 py-2 font-semibold font-mono" style={{ color: 'var(--shell-text-muted)', borderBottom: '1px solid var(--table-border)', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sampleData.rows.map((row, ri) => (
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

        {/* Right column: pipelines + relationships */}
        <div className="flex flex-col gap-4">
          {/* Linked pipelines */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--shell-text-muted)' }}>
              Source Pipelines
            </p>
            {linkedPipelines.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                {linkedPipelines.map(p => (
                  <button
                    key={p.id}
                    onClick={() => navigate(`/pipeline/${p.id}`)}
                    className="flex items-center justify-between rounded-[4px] text-left transition-colors"
                    style={{ padding: '7px 10px', border: '1px solid var(--card-border)', background: 'var(--card-bg)', cursor: 'pointer' }}
                  >
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium truncate" style={{ color: 'var(--shell-text)' }}>{p.name}</p>
                      <p className="text-[10px]" style={{ color: p.status === 'active' ? '#31A56D' : p.status === 'failed' ? '#D12329' : 'var(--shell-text-muted)' }}>
                        {p.status}
                      </p>
                    </div>
                    <ExternalLink size={11} style={{ color: 'var(--shell-text-muted)', flexShrink: 0 }} />
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-[4px]" style={{ padding: '8px 10px', background: '#FEF3C7', border: '1px solid #D98B1D40' }}>
                <p className="text-[11px]" style={{ color: '#D98B1D' }}>No pipeline configured</p>
              </div>
            )}
          </div>

          {/* Relationships */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--shell-text-muted)' }}>
              Relationships ({relationships.length})
            </p>
            <div className="flex flex-col gap-1">
              {relationships.map((r, i) => (
                <div key={i} className="flex items-center gap-1 text-[10px] flex-wrap" style={{ color: 'var(--shell-text-muted)' }}>
                  <span style={{ color: r.from === entityType ? entity.color : 'var(--shell-text-muted)', fontWeight: 600 }}>{toPascalCase(r.from)}</span>
                  <span className="px-1 py-0.5 rounded-[2px]" style={{ background: 'var(--shell-active)', color: 'var(--shell-accent)', fontWeight: 600, fontSize: 9 }}>{r.rel}</span>
                  <span>{toPascalCase(r.to)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Full-width interactive graph visualization ───────────────────────────────

function GraphVisualization({
  selectedEntity,
  onNodeClick,
}: {
  selectedEntity: KGEntityType | null;
  onNodeClick: (e: KGEntityType) => void;
}) {
  const INIT_VB = { x: 0, y: 0, w: 560, h: 480 };
  const [vb, setVb] = useState(INIT_VB);
  const [hoveredNode, setHoveredNode] = useState<KGEntityType | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const panStart = useRef({ cx: 0, cy: 0, vx: 0, vy: 0, vw: 560, vh: 480 });
  const entityStats = Object.fromEntries(mockKGEntityStats.map(e => [e.type, e]));

  // Wheel zoom — requires passive:false, so use imperative listener
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 1.15 : 0.87;
      const rect = svg.getBoundingClientRect();
      setVb(v => {
        const mx = ((e.clientX - rect.left) / rect.width) * v.w + v.x;
        const my = ((e.clientY - rect.top) / rect.height) * v.h + v.y;
        const nw = Math.min(1400, Math.max(140, v.w * factor));
        const nh = nw * (480 / 560);
        return { x: mx - (mx - v.x) * (nw / v.w), y: my - (my - v.y) * (nh / v.h), w: nw, h: nh };
      });
    };
    svg.addEventListener('wheel', handler, { passive: false });
    return () => svg.removeEventListener('wheel', handler);
  }, []);

  function onBgMouseDown(e: React.MouseEvent) {
    setIsPanning(true);
    panStart.current = { cx: e.clientX, cy: e.clientY, vx: vb.x, vy: vb.y, vw: vb.w, vh: vb.h };
  }
  function onMouseMove(e: React.MouseEvent) {
    if (!isPanning) return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const dx = (panStart.current.cx - e.clientX) * (panStart.current.vw / rect.width);
    const dy = (panStart.current.cy - e.clientY) * (panStart.current.vh / rect.height);
    setVb({ x: panStart.current.vx + dx, y: panStart.current.vy + dy, w: panStart.current.vw, h: panStart.current.vh });
  }
  function onMouseUp() { setIsPanning(false); }

  function zoomBy(factor: number) {
    setVb(v => {
      const nw = Math.min(1400, Math.max(140, v.w * factor));
      const nh = nw * (480 / 560);
      return { x: v.x + (v.w - nw) / 2, y: v.y + (v.h - nh) / 2, w: nw, h: nh };
    });
  }

  // Convert SVG node position → absolute px within container for tooltip placement
  function tooltipStyle(nodeType: KGEntityType): React.CSSProperties {
    const pos = NODE_POS[nodeType];
    const c = containerRef.current;
    if (!c) return { display: 'none' };
    const px = (pos.x - vb.x) / vb.w * c.clientWidth;
    const py = (pos.y - vb.y) / vb.h * c.clientHeight;
    const W = 170;
    let left = px - W / 2;
    let top = py - 118;
    if (left < 4) left = 4;
    if (left + W > c.clientWidth - 4) left = c.clientWidth - W - 4;
    if (top < 4) top = py + 28;
    return { position: 'absolute', left, top, pointerEvents: 'none', zIndex: 10, width: W };
  }

  const hovStat = hoveredNode ? entityStats[hoveredNode] : null;

  return (
    <div className="rounded-[4px] mb-4" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', overflow: 'hidden' }}>
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap" style={{ padding: '12px 16px', borderBottom: '1px solid var(--card-border)' }}>
        <span className="text-[13px] font-semibold" style={{ color: 'var(--shell-text)' }}>Knowledge Graph</span>
        <span className="text-[11px]" style={{ color: 'var(--shell-text-muted)' }}>
          {mockKGHealth.totalEntities.toLocaleString()} entities · {mockKGHealth.totalRelationships.toLocaleString()} relationships · 12 relationship types
        </span>
        <div className="flex items-center gap-4 ml-2">
          {[{ color: '#31A56D', label: 'Fresh' }, { color: '#D98B1D', label: 'Stale' }, { color: '#D12329', label: 'No Data' }].map(l => (
            <div key={l.label} className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--shell-text-muted)' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: l.color, display: 'inline-block', flexShrink: 0 }} />
              {l.label}
            </div>
          ))}
        </div>
        <span className="text-[10px] ml-auto" style={{ color: 'var(--shell-text-muted)' }}>Scroll to zoom · Drag to pan · Click node to inspect</span>
        <div className="flex items-center gap-1">
          {[{ lbl: '+', fn: () => zoomBy(0.77) }, { lbl: '⊙', fn: () => setVb(INIT_VB) }, { lbl: '−', fn: () => zoomBy(1.3) }].map(b => (
            <button key={b.lbl} onClick={b.fn}
              className="flex items-center justify-center text-[11px] font-bold rounded-[4px]"
              style={{ width: 24, height: 24, border: '1px solid var(--ctrl-border)', background: 'var(--ctrl-bg)', cursor: 'pointer', color: 'var(--shell-text-muted)' }}
            >{b.lbl}</button>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        style={{ height: 480, position: 'relative', cursor: isPanning ? 'grabbing' : 'grab' }}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <svg
          ref={svgRef}
          width="100%" height="100%"
          viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
          style={{ display: 'block', background: 'var(--shell-bg)' }}
        >
          <defs>
            <pattern id="kg-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.9" fill="#D4D4E0" />
            </pattern>
            <marker id="kg-arr" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
              <path d="M0,1 L0,6 L6,3.5 z" fill="#BCBCCC" />
            </marker>
            <marker id="kg-arr-hi" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
              <path d="M0,1 L0,6 L6,3.5 z" fill="#6360D8" />
            </marker>
          </defs>

          {/* Dot-grid background */}
          <rect x={vb.x - 300} y={vb.y - 300} width={vb.w + 600} height={vb.h + 600} fill="url(#kg-dots)" />
          {/* Transparent pan target */}
          <rect x={vb.x - 300} y={vb.y - 300} width={vb.w + 600} height={vb.h + 600} fill="transparent" onMouseDown={onBgMouseDown} />

          {/* Edges */}
          {GRAPH_EDGES_ALL.map((edge, i) => {
            const from = NODE_POS[edge.from], to = NODE_POS[edge.to];
            if (!from || !to) return null;
            const dx = to.x - from.x, dy = to.y - from.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            const ux = dx / len, uy = dy / len;
            const x1 = from.x + ux * (from.r + 3);
            const y1 = from.y + uy * (from.r + 3);
            const x2 = to.x - ux * (to.r + 8);
            const y2 = to.y - uy * (to.r + 8);
            const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
            const selConn = !!(selectedEntity && (selectedEntity === edge.from || selectedEntity === edge.to));
            const hovConn = !!(hoveredNode && (hoveredNode === edge.from || hoveredNode === edge.to));
            const hi = selConn || hovConn;
            const dim = !!(selectedEntity && !selConn);
            return (
              <g key={i}>
                <line x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={hi ? '#6360D8' : '#C0C0D0'}
                  strokeWidth={hi ? edge.weight * 0.75 : 0.9}
                  strokeOpacity={dim ? 0.07 : hi ? 0.9 : 0.5}
                  markerEnd={`url(#kg-arr${hi ? '-hi' : ''})`}
                />
                {hi && (
                  <>
                    <rect x={mx - edge.label.length * 2.9} y={my - 6.5} width={edge.label.length * 5.8} height={11} rx={3}
                      fill="white" stroke="#6360D8" strokeWidth={0.5} strokeOpacity={0.6} />
                    <text x={mx} y={my + 2.5} textAnchor="middle"
                      style={{ fontSize: 7.5, fill: '#6360D8', fontFamily: 'system-ui', fontWeight: 700, letterSpacing: '0.03em' }}>
                      {edge.label}
                    </text>
                  </>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {(Object.entries(NODE_POS) as [KGEntityType, NodePos][]).map(([type, pos]) => {
            const stat = entityStats[type];
            const isSel = selectedEntity === type;
            const isHov = hoveredNode === type;
            const isConn = GRAPH_EDGES_ALL.some(e =>
              (e.from === selectedEntity && e.to === type) || (e.to === selectedEntity && e.from === type)
            );
            const dim = !!(selectedEntity && !isSel && !isConn);
            const freshColor = stat?.freshness === 'fresh' ? stat.color
              : stat?.freshness === 'stale' ? '#D98B1D' : '#D12329';
            return (
              <g key={type}
                style={{ cursor: 'pointer', opacity: dim ? 0.15 : 1, transition: 'opacity 0.18s' }}
                onClick={() => onNodeClick(type)}
                onMouseDown={e => e.stopPropagation()}
                onMouseEnter={() => setHoveredNode(type)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {isSel && (
                  <circle cx={pos.x} cy={pos.y} r={pos.r + 10} fill="none" stroke="#6360D8" strokeWidth={2.5} strokeOpacity={0.3} />
                )}
                {/* Freshness ring */}
                <circle cx={pos.x} cy={pos.y} r={pos.r + 4}
                  fill={freshColor} fillOpacity={isSel || isHov ? 0.18 : 0.08}
                  stroke={freshColor} strokeWidth={isSel ? 2.5 : isHov ? 2 : 1.5}
                  strokeOpacity={isSel || isHov ? 1 : 0.5} />
                {/* White bg */}
                <circle cx={pos.x} cy={pos.y} r={pos.r} fill="white" />
                {/* Icon */}
                <image
                  href={ENTITY_ICON[type] || ''}
                  x={pos.x - pos.r * 0.72} y={pos.y - pos.r * 0.72}
                  width={pos.r * 1.44} height={pos.r * 1.44}
                  pointerEvents="none"
                  opacity={stat?.freshness === 'critical' ? 0.4 : 1}
                />
                {/* Click target */}
                <circle cx={pos.x} cy={pos.y} r={pos.r + 5} fill="transparent" />
                {/* Name */}
                <text x={pos.x} y={pos.y + pos.r + 13} textAnchor="middle"
                  style={{ fontSize: 9, fontFamily: 'system-ui', fontWeight: isSel ? 700 : 500, fill: isSel ? '#6360D8' : '#101010' }}>
                  {toPascalCase(type)}
                </text>
                {/* Count (larger nodes only) */}
                {pos.r >= 15 && stat && (
                  <text x={pos.x} y={pos.y + pos.r + 23} textAnchor="middle"
                    style={{ fontSize: 8, fontFamily: 'system-ui', fill: '#7A7A8A', fontVariantNumeric: 'tabular-nums' }}>
                    {stat.count >= 1000000 ? `${(stat.count / 1000000).toFixed(1)}M`
                      : stat.count >= 1000 ? `${(stat.count / 1000).toFixed(0)}K`
                      : stat.count.toString()}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover tooltip */}
        {hoveredNode && hovStat && (
          <div style={{
            ...tooltipStyle(hoveredNode),
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: 6,
            padding: '10px 12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.14)',
          }}>
            <div className="flex items-center gap-2 mb-1.5">
              <img src={ENTITY_ICON[hoveredNode]} width={15} height={15} alt="" />
              <span className="text-[12px] font-semibold" style={{ color: 'var(--shell-text)' }}>{toPascalCase(hoveredNode)}</span>
            </div>
            <p className="text-[14px] font-bold tabular-nums mb-0.5" style={{ color: 'var(--shell-text)' }}>
              {hovStat.count.toLocaleString()}
            </p>
            <p className="text-[10px]" style={{ color: hovStat.delta > 0 ? '#31A56D' : 'var(--shell-text-muted)' }}>
              {hovStat.delta > 0 ? `+${hovStat.delta.toLocaleString()} today` : 'No change today'}
            </p>
            <div className="flex items-center gap-1.5 mt-2">
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: FRESHNESS_CFG[hovStat.freshness].color, display: 'inline-block', flexShrink: 0 }} />
              <span className="text-[10px]" style={{ color: 'var(--shell-text-muted)' }}>
                {FRESHNESS_CFG[hovStat.freshness].label} · {hovStat.lastUpdated}
              </span>
            </div>
            <p className="text-[10px] mt-0.5" style={{ color: 'var(--shell-text-muted)' }}>
              {hovStat.pipelineCount} pipeline{hovStat.pipelineCount !== 1 ? 's' : ''} feeding
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Coverage gaps panel ──────────────────────────────────────────────────────

function CoverageGaps({ onSelect }: { onSelect: (e: KGEntityType) => void }) {
  const gaps = mockKGEntityStats.filter(e => e.freshness !== 'fresh');
  const uncovered: KGEntityType[] = []; // entity types with pipelineCount = 0 — none in mock, but the UI is ready

  if (gaps.length === 0 && uncovered.length === 0) return null;

  return (
    <div className="rounded-[4px]" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--card-border)' }}>
        <div className="flex items-center gap-2">
          <AlertTriangle size={14} style={{ color: '#D98B1D' }} />
          <p className="text-[13px] font-semibold" style={{ color: 'var(--shell-text)' }}>Coverage Gaps</p>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-[3px]" style={{ background: '#FEF3C7', color: '#D98B1D' }}>
            {gaps.length} issue{gaps.length !== 1 ? 's' : ''}
          </span>
        </div>
        <p className="text-[11px] mt-0.5" style={{ color: 'var(--shell-text-muted)' }}>
          Entity types that are stale or missing a data source
        </p>
      </div>
      <div style={{ padding: '0' }}>
        {gaps.map((entity, i) => {
          const fresh = FRESHNESS_CFG[entity.freshness];
          return (
            <div
              key={entity.type}
              className="flex items-center justify-between"
              style={{
                padding: '10px 16px',
                borderBottom: i < gaps.length - 1 ? '1px solid var(--card-border)' : 'none',
                background: entity.freshness === 'critical' ? '#FFF5F5' : '#FFFBEB',
              }}
            >
              <div className="flex items-center gap-2.5">
                <span className="rounded-full" style={{ width: 8, height: 8, background: entity.color, flexShrink: 0 }} />
                <div>
                  <p className="text-[12px] font-medium" style={{ color: 'var(--shell-text)' }}>{toPascalCase(entity.type)}</p>
                  <p className="text-[10px]" style={{ color: 'var(--shell-text-muted)' }}>
                    Last updated {entity.lastUpdated} · {entity.count.toLocaleString()} entities at risk of becoming stale
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-[3px]" style={{ background: fresh.bg, color: fresh.color }}>
                  {fresh.label}
                </span>
                <button
                  onClick={() => onSelect(entity.type)}
                  className="text-[11px] font-medium rounded-[44px] transition-colors"
                  style={{ padding: '4px 10px', background: 'var(--shell-active)', color: 'var(--shell-accent)', border: '1px solid var(--shell-accent)', cursor: 'pointer' }}
                >
                  Inspect
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Disambiguation backlog (global) ─────────────────────────────────────────

function DisambigBacklogPanel() {
  const navigate = useNavigate();
  const total = mockKGHealth.disambiguationBacklog;

  return (
    <div className="rounded-[4px]" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', overflow: 'hidden' }}>
      <div className="flex items-center justify-between" style={{ padding: '12px 16px', borderBottom: '1px solid var(--card-border)' }}>
        <div className="flex items-center gap-2">
          <GitMerge size={14} style={{ color: 'var(--shell-accent)' }} />
          <p className="text-[13px] font-semibold" style={{ color: 'var(--shell-text)' }}>Disambiguation Backlog</p>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-[3px]" style={{ background: 'var(--shell-active)', color: 'var(--shell-accent)' }}>
            {total.toLocaleString()} total
          </span>
        </div>
        <button
          className="text-[11px] rounded-[44px] transition-colors"
          style={{ padding: '4px 10px', background: 'var(--shell-raised)', color: 'var(--shell-text-muted)', border: '1px solid var(--ctrl-border)', cursor: 'pointer' }}
        >
          Review all
        </button>
      </div>
      <table className="w-full" style={{ fontSize: 11, borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'var(--table-th-bg)' }}>
            {['Entity Type', 'Pending', 'Source Pipeline', 'Oldest Record', 'Strategy', ''].map(h => (
              <th key={h} className="text-left px-4 py-2 font-semibold uppercase" style={{ color: 'var(--shell-text-muted)', fontSize: 10, letterSpacing: '0.05em', borderBottom: '1px solid var(--table-border)' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {GLOBAL_DISAMBIG.map((row, i) => {
            const entityStat = mockKGEntityStats.find(e => e.type === row.entityType)!;
            return (
              <tr key={row.id} className="group" style={{ borderTop: i > 0 ? '1px solid var(--table-border)' : undefined }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--shell-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-full" style={{ width: 7, height: 7, background: entityStat.color, flexShrink: 0 }} />
                    <span className="font-medium" style={{ color: 'var(--shell-text)' }}>{toPascalCase(row.entityType)}</span>
                  </div>
                </td>
                <td className="px-4 py-2.5 font-bold tabular-nums" style={{ color: '#D98B1D' }}>
                  {row.count}
                </td>
                <td className="px-4 py-2.5" style={{ color: 'var(--shell-text)' }}>{row.pipeline}</td>
                <td className="px-4 py-2.5" style={{ color: 'var(--shell-text-muted)' }}>{row.oldest}</td>
                <td className="px-4 py-2.5">
                  <span className="px-1.5 py-0.5 rounded-[3px] text-[10px]" style={{ background: 'var(--shell-active)', color: 'var(--shell-accent)' }}>
                    {row.strategy}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <button
                    onClick={() => navigate(`/pipeline/${mockPipelines.find(p => p.name.includes(row.pipeline.split(' ')[0]))?.id ?? '1'}`)}
                    className="flex items-center gap-1 text-[11px] font-medium transition-colors"
                    style={{ color: 'var(--shell-accent)', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Review <ChevronRight size={11} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div style={{ padding: '10px 16px', borderTop: '1px solid var(--card-border)', background: 'var(--shell-raised)' }}>
        <p className="text-[11px]" style={{ color: 'var(--shell-text-muted)' }}>
          Showing top {GLOBAL_DISAMBIG.length} groups · {total - GLOBAL_DISAMBIG.reduce((s, r) => s + r.count, 0)} additional records in other groups
        </p>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function KnowledgeGraph() {
  const kg = mockKGHealth;
  const [selectedEntity, setSelectedEntity] = useState<KGEntityType | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showRelationships, setShowRelationships] = useState(false);
  const { setPageActions } = useOutletContext<{ setPageActions: (n: React.ReactNode) => void }>();

  function handleRefresh() {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  }

  useEffect(() => {
    setPageActions(
      <button
        onClick={handleRefresh}
        className="flex items-center gap-1.5 text-[12px] font-medium rounded-[44px] transition-colors"
        style={{ padding: '6px 14px', background: 'var(--card-bg)', color: 'var(--shell-text)', border: '1px solid var(--ctrl-border)', cursor: 'pointer' }}
      >
        <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
        {refreshing ? 'Refreshing…' : 'Refresh'}
      </button>
    );
    return () => setPageActions(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshing]);

  function handleSelectEntity(type: KGEntityType) {
    setSelectedEntity(prev => prev === type ? null : type);
  }

  return (
    <div style={{ padding: '20px 24px 36px' }}>

      {/* ── KPI tiles ── */}
      <div className="grid gap-3 mb-5" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        {[
          { label: 'Total Entities',        value: kg.totalEntities.toLocaleString(),      icon: <TrendingUp size={13} />,  color: 'var(--shell-accent)', sub: `+${kg.growthToday.toLocaleString()} today` },
          { label: 'Relationships',          value: kg.totalRelationships.toLocaleString(), icon: <ArrowRight size={13} />,  color: '#31A56D',              sub: '10 relationship types' },
          { label: 'Coverage Score',         value: `${kg.coverageScore}%`,                 icon: <CheckCircle2 size={13} />,color: kg.coverageScore >= 80 ? '#31A56D' : '#D98B1D', sub: `${mockKGEntityStats.filter(e => e.freshness === 'fresh').length} of ${mockKGEntityStats.length} fresh` },
          { label: 'Disambig Backlog',       value: kg.disambiguationBacklog.toLocaleString(), icon: <Clock size={13} />,   color: '#D98B1D',              sub: 'Across 4 pipelines' },
          { label: 'Stale Entity Types',     value: `${kg.staleEntityTypes}`,               icon: <XCircle size={13} />,     color: kg.staleEntityTypes > 0 ? '#D12329' : '#31A56D', sub: 'Require attention' },
        ].map(k => (
          <div key={k.label} className="rounded-[4px]" style={{ padding: '14px 16px', background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
            <div className="flex items-center gap-1.5 mb-2" style={{ color: k.color }}>
              {k.icon}
              <span className="text-[11px]" style={{ color: 'var(--shell-text-muted)' }}>{k.label}</span>
            </div>
            <p className="text-[14px] font-bold" style={{ color: 'var(--shell-text)', fontVariantNumeric: 'tabular-nums' }}>{k.value}</p>
            <p className="text-[10px] mt-1" style={{ color: 'var(--shell-text-muted)' }}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Interactive graph visualization (full-width) ── */}
      <GraphVisualization selectedEntity={selectedEntity} onNodeClick={handleSelectEntity} />

      {/* ── Entity cards grid ── */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[13px] font-semibold" style={{ color: 'var(--shell-text)' }}>
            Entity Types
            <span className="ml-2 text-[11px] font-normal" style={{ color: 'var(--shell-text-muted)' }}>
              {mockKGEntityStats.filter(e => e.freshness === 'fresh').length} of {mockKGEntityStats.length} fresh — click to inspect
            </span>
          </p>
        </div>
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
          {mockKGEntityStats.map(entity => (
            <EntityCard
              key={entity.type}
              entity={entity}
              selected={selectedEntity === entity.type}
              onClick={() => handleSelectEntity(entity.type)}
            />
          ))}
        </div>
      </div>

      {/* ── Entity detail panel (inline) ── */}
      {selectedEntity && (
        <div className="mb-4">
          <EntityDetailPanel entityType={selectedEntity} />
        </div>
      )}

      {/* ── Relationship types (below graph, collapsible) ── */}
      <div className="mb-4 rounded-[4px]" style={{ border: '1px solid var(--card-border)', background: 'var(--card-bg)' }}>
        <button
          onClick={() => setShowRelationships(v => !v)}
          className="w-full flex items-center gap-2 text-[12px] font-semibold"
          style={{ padding: '12px 16px', color: 'var(--shell-text)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
        >
          <ChevronRight size={13} style={{ color: 'var(--shell-accent)', transform: showRelationships ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }} />
          Relationship Types ({ENTITY_RELATIONSHIPS.length})
          <span className="ml-auto text-[11px] font-normal" style={{ color: 'var(--shell-text-muted)' }}>
            {showRelationships ? 'click to collapse' : 'click to expand'}
          </span>
        </button>
        {showRelationships && (
          <div style={{ borderTop: '1px solid var(--card-border)', padding: '12px 16px' }}>
            <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              {ENTITY_RELATIONSHIPS.map((rel, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px]">
                  <span className="font-medium" style={{ color: 'var(--shell-text)', minWidth: 96 }}>{rel.from}</span>
                  <span className="px-1.5 py-0.5 rounded-[3px] text-[9px] font-bold" style={{ background: 'var(--shell-active)', color: 'var(--shell-accent)', flexShrink: 0 }}>
                    {rel.rel}
                  </span>
                  <ArrowRight size={9} style={{ color: 'var(--shell-text-muted)', flexShrink: 0 }} />
                  <span style={{ color: 'var(--shell-text-muted)' }}>{rel.to}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Coverage gaps + disambiguation backlog ── */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <CoverageGaps onSelect={handleSelectEntity} />
        <DisambigBacklogPanel />
      </div>
    </div>
  );
}
