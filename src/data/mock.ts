import type {
  Pipeline, ActivityItem, ExecutionRun, TeamMember, Credential,
  FieldMapping, KGEntityStats, KGHealthSummary, CyberConnector,
  PipelineTemplate,
} from '@/types';

// ─── Knowledge Graph Entity Stats ────────────────────────────────────────────

export const mockKGEntityStats: KGEntityStats[] = [
  { type: 'account',           count: 512394,  delta: 18240,  freshness: 'fresh',    lastUpdated: '2 min ago',    pipelineCount: 2, color: '#7C3AED' },
  { type: 'application',       count: 38940,   delta: 210,    freshness: 'fresh',    lastUpdated: '4h ago',       pipelineCount: 1, color: '#D97706' },
  { type: 'assessment',        count: 3842,    delta: 28,     freshness: 'fresh',    lastUpdated: '2h ago',       pipelineCount: 1, color: '#B45309' },
  { type: 'cloud-account',     count: 4820,    delta: 32,     freshness: 'fresh',    lastUpdated: '30 min ago',   pipelineCount: 1, color: '#6D28D9' },
  { type: 'cloud-cluster',     count: 840,     delta: 12,     freshness: 'fresh',    lastUpdated: '30 min ago',   pipelineCount: 1, color: '#2563EB' },
  { type: 'cloud-container',   count: 12840,   delta: 0,      freshness: 'critical', lastUpdated: '12h ago',      pipelineCount: 1, color: '#A78BFA' },
  { type: 'cloud-storage',     count: 7640,    delta: 0,      freshness: 'critical', lastUpdated: '14h ago',      pipelineCount: 1, color: '#3B82F6' },
  { type: 'finding',           count: 87234,   delta: 1120,   freshness: 'fresh',    lastUpdated: '3h ago',       pipelineCount: 2, color: '#6360D8' },
  { type: 'Group',             count: 8490,    delta: 0,      freshness: 'stale',    lastUpdated: '10h ago',      pipelineCount: 1, color: '#0D9488' },
  { type: 'host',              count: 284102,  delta: 2840,   freshness: 'fresh',    lastUpdated: '2 min ago',    pipelineCount: 3, color: '#0EA5E9' },
  { type: 'identity',          count: 98340,   delta: 0,      freshness: 'stale',    lastUpdated: '6h ago',       pipelineCount: 1, color: '#DB2777' },
  { type: 'network',           count: 22480,   delta: 180,    freshness: 'fresh',    lastUpdated: '2h ago',       pipelineCount: 1, color: '#059669' },
  { type: 'network-interface', count: 91230,   delta: 0,      freshness: 'stale',    lastUpdated: '8h ago',       pipelineCount: 1, color: '#EC4899' },
  { type: 'network-services',  count: 15490,   delta: 84,     freshness: 'fresh',    lastUpdated: '1h ago',       pipelineCount: 1, color: '#65A30D' },
  { type: 'person',            count: 64820,   delta: 420,    freshness: 'fresh',    lastUpdated: '1h ago',       pipelineCount: 1, color: '#0891B2' },
  { type: 'vulnerability',     count: 142088,  delta: 380,    freshness: 'fresh',    lastUpdated: '35 min ago',   pipelineCount: 1, color: '#DC2626' },
];

export const mockKGHealth: KGHealthSummary = {
  totalEntities:           1476494,
  totalRelationships:      6240820,
  coverageScore:           75,          // 12 of 16 entity types fresh
  disambiguationBacklog:   342,
  staleEntityTypes:        4,
  growthToday:             23546,
};

// ─── KG Growth Trend (7 days — new entities per day) ─────────────────────────

export const mockKGGrowthTrend = [
  { date: 'Apr 1', entities: 18200,  alerts: 8400,  vulns: 2100,  assets: 4800,  other: 2900 },
  { date: 'Apr 2', entities: 22400,  alerts: 10200, vulns: 2800,  assets: 5600,  other: 3800 },
  { date: 'Apr 3', entities: 19800,  alerts: 9200,  vulns: 2400,  assets: 4900,  other: 3300 },
  { date: 'Apr 4', entities: 25100,  alerts: 12400, vulns: 3100,  assets: 5800,  other: 3800 },
  { date: 'Apr 5', entities: 21600,  alerts: 10100, vulns: 2700,  assets: 5200,  other: 3600 },
  { date: 'Apr 6', entities: 23900,  alerts: 11200, vulns: 2900,  assets: 5700,  other: 4100 },
  { date: 'Apr 7', entities: 22676,  alerts: 18240, vulns: 380,   assets: 2840,  other: 1216 },
];

// ─── KG Growth Trend — 30 days (every 2 days, Mar 9 → Apr 7) ─────────────────

export const mockKGGrowthTrend30d = [
  { date: 'Mar 9',  alerts: 6200,  vulns: 1400, assets: 3400 },
  { date: 'Mar 11', alerts: 6800,  vulns: 1550, assets: 3600 },
  { date: 'Mar 13', alerts: 7100,  vulns: 1620, assets: 3750 },
  { date: 'Mar 15', alerts: 6500,  vulns: 1480, assets: 3500 },
  { date: 'Mar 17', alerts: 7400,  vulns: 1700, assets: 3900 },
  { date: 'Mar 19', alerts: 7900,  vulns: 1820, assets: 4100 },
  { date: 'Mar 21', alerts: 7600,  vulns: 1780, assets: 4000 },
  { date: 'Mar 23', alerts: 8200,  vulns: 1950, assets: 4300 },
  { date: 'Mar 25', alerts: 8600,  vulns: 2020, assets: 4500 },
  { date: 'Mar 27', alerts: 8100,  vulns: 1900, assets: 4200 },
  { date: 'Mar 29', alerts: 8900,  vulns: 2100, assets: 4700 },
  { date: 'Mar 31', alerts: 9200,  vulns: 2180, assets: 4850 },
  { date: 'Apr 2',  alerts: 10200, vulns: 2800, assets: 5600 },
  { date: 'Apr 4',  alerts: 12400, vulns: 3100, assets: 5800 },
  { date: 'Apr 7',  alerts: 18240, vulns: 380,  assets: 2840 },
];

// ─── KG Growth Trend — 60 days (every 5 days, Feb 7 → Apr 7) ─────────────────

export const mockKGGrowthTrend60d = [
  { date: 'Feb 7',  alerts: 3400,  vulns: 720,  assets: 1800 },
  { date: 'Feb 12', alerts: 3800,  vulns: 840,  assets: 2000 },
  { date: 'Feb 17', alerts: 4200,  vulns: 920,  assets: 2200 },
  { date: 'Feb 22', alerts: 4700,  vulns: 1050, assets: 2500 },
  { date: 'Feb 27', alerts: 5100,  vulns: 1150, assets: 2750 },
  { date: 'Mar 4',  alerts: 5500,  vulns: 1250, assets: 3000 },
  { date: 'Mar 9',  alerts: 6200,  vulns: 1400, assets: 3400 },
  { date: 'Mar 14', alerts: 6900,  vulns: 1600, assets: 3700 },
  { date: 'Mar 19', alerts: 7900,  vulns: 1820, assets: 4100 },
  { date: 'Mar 24', alerts: 8400,  vulns: 1980, assets: 4400 },
  { date: 'Mar 29', alerts: 8900,  vulns: 2100, assets: 4700 },
  { date: 'Apr 3',  alerts: 9800,  vulns: 2500, assets: 4900 },
  { date: 'Apr 7',  alerts: 18240, vulns: 380,  assets: 2840 },
];

// ─── KG Growth Trend — 90 days (every 7 days, Jan 7 → Apr 7) ─────────────────

export const mockKGGrowthTrend90d = [
  { date: 'Jan 7',  alerts: 1400,  vulns: 280,  assets: 720  },
  { date: 'Jan 14', alerts: 1800,  vulns: 360,  assets: 920  },
  { date: 'Jan 21', alerts: 2200,  vulns: 440,  assets: 1100 },
  { date: 'Jan 28', alerts: 2600,  vulns: 520,  assets: 1350 },
  { date: 'Feb 4',  alerts: 3100,  vulns: 640,  assets: 1620 },
  { date: 'Feb 11', alerts: 3700,  vulns: 800,  assets: 1980 },
  { date: 'Feb 18', alerts: 4300,  vulns: 950,  assets: 2280 },
  { date: 'Feb 25', alerts: 5000,  vulns: 1120, assets: 2680 },
  { date: 'Mar 4',  alerts: 5500,  vulns: 1250, assets: 3000 },
  { date: 'Mar 11', alerts: 6500,  vulns: 1480, assets: 3500 },
  { date: 'Mar 18', alerts: 7700,  vulns: 1760, assets: 4050 },
  { date: 'Mar 25', alerts: 8600,  vulns: 2020, assets: 4500 },
  { date: 'Apr 1',  alerts: 8400,  vulns: 2100, assets: 4800 },
  { date: 'Apr 7',  alerts: 18240, vulns: 380,  assets: 2840 },
];

// ─── Pipelines ────────────────────────────────────────────────────────────────

export const mockPipelines: Pipeline[] = [
  {
    id: '1',
    name: 'CrowdStrike Falcon',
    connector: 'CrowdStrike Falcon',
    connectorType: 'crowdstrike',
    connectorCategory: 'edr-xdr',
    target: 'Knowledge Graph',
    targetEntities: ['finding', 'host'],
    status: 'active',
    lastRun: '2 min ago',
    nextRun: 'in 13 min',
    records: '512,394',
    schedule: '*/15 * * * *',
    createdAt: '2026-01-12',
    duration: '4m 22s',
    successRate: 99.2,
    fromTemplate: 'EDR Alert Ingestion',
    stages: [
      { name: 'ingest',   label: 'Ingest',          status: 'healthy', recordsIn: 18240, recordsOut: 18240, dropRate: 0,    lastRunDuration: '1m 12s' },
      { name: 'parse',    label: 'Parse',            status: 'healthy', recordsIn: 18240, recordsOut: 18238, dropRate: 0.01, lastRunDuration: '0m 58s' },
      { name: 'extract',  label: 'Extract Entities', status: 'healthy', recordsIn: 18238, recordsOut: 18156, dropRate: 0.45, lastRunDuration: '1m 24s' },
      { name: 'resolve',  label: 'Resolve',          status: 'healthy', recordsIn: 18156, recordsOut: 18156, dropRate: 0,    lastRunDuration: '0m 32s' },
      { name: 'publish',  label: 'KG Publish',       status: 'healthy', recordsIn: 18156, recordsOut: 18156, dropRate: 0,    lastRunDuration: '0m 16s' },
    ],
  },
  {
    id: '2',
    name: 'Tenable.io Vulnerability',
    connector: 'Tenable.io',
    connectorType: 'tenable',
    connectorCategory: 'vulnerability',
    target: 'Knowledge Graph',
    targetEntities: ['vulnerability', 'host'],
    status: 'active',
    lastRun: '35 min ago',
    nextRun: 'in 25 min',
    records: '142,088',
    schedule: '0 */1 * * *',
    createdAt: '2026-01-18',
    duration: '6m 14s',
    successRate: 98.4,
    fromTemplate: 'Vulnerability Aggregation',
    stages: [
      { name: 'ingest',   label: 'Ingest',          status: 'healthy', recordsIn: 380,  recordsOut: 380,  dropRate: 0,   lastRunDuration: '1m 48s' },
      { name: 'parse',    label: 'Parse',            status: 'healthy', recordsIn: 380,  recordsOut: 380,  dropRate: 0,   lastRunDuration: '1m 12s' },
      { name: 'extract',  label: 'Extract Entities', status: 'healthy', recordsIn: 380,  recordsOut: 374,  dropRate: 1.6, lastRunDuration: '2m 04s' },
      { name: 'resolve',  label: 'Resolve',          status: 'healthy', recordsIn: 374,  recordsOut: 374,  dropRate: 0,   lastRunDuration: '0m 44s' },
      { name: 'publish',  label: 'KG Publish',       status: 'healthy', recordsIn: 374,  recordsOut: 374,  dropRate: 0,   lastRunDuration: '0m 26s' },
    ],
  },
  {
    id: '3',
    name: 'MISP Threat Intelligence',
    connector: 'MISP',
    connectorType: 'misp',
    connectorCategory: 'threat-intel',
    target: 'Knowledge Graph',
    targetEntities: ['account', 'identity'],
    status: 'failed',
    lastRun: '3h ago',
    nextRun: 'retry in 5 min',
    records: '192,048',
    schedule: '0 */3 * * *',
    createdAt: '2026-02-03',
    duration: '0m 22s',
    successRate: 82.4,
    stages: [
      { name: 'ingest',  label: 'Ingest', status: 'error', recordsIn: 0, recordsOut: 0, errorMessage: 'Connection timeout after 3 retries. MISP API endpoint unreachable: 503 Service Unavailable.' },
      { name: 'parse',   label: 'Parse',            status: 'idle' },
      { name: 'extract', label: 'Extract Entities', status: 'idle' },
      { name: 'resolve', label: 'Resolve',          status: 'idle' },
      { name: 'publish', label: 'KG Publish',       status: 'idle' },
    ],
  },
  {
    id: '4',
    name: 'Okta Identity Provider',
    connector: 'Okta',
    connectorType: 'okta',
    connectorCategory: 'identity',
    target: 'Knowledge Graph',
    targetEntities: ['identity'],
    status: 'paused',
    lastRun: '6h ago',
    nextRun: 'paused',
    records: '98,340',
    schedule: '0 */6 * * *',
    createdAt: '2025-12-20',
    duration: '2m 48s',
    successRate: 99.8,
    stages: [
      { name: 'ingest',   label: 'Ingest',          status: 'idle' },
      { name: 'parse',    label: 'Parse',            status: 'idle' },
      { name: 'extract',  label: 'Extract Entities', status: 'idle' },
      { name: 'resolve',  label: 'Resolve',          status: 'idle' },
      { name: 'publish',  label: 'KG Publish',       status: 'idle' },
    ],
  },
  {
    id: '5',
    name: 'AWS Security Hub',
    connector: 'AWS Security Hub',
    connectorType: 'aws-security-hub',
    connectorCategory: 'cloud-security',
    target: 'Knowledge Graph',
    targetEntities: ['finding', 'host'],
    status: 'active',
    lastRun: '3h ago',
    nextRun: 'in 1h',
    records: '87,234',
    schedule: '0 */4 * * *',
    createdAt: '2026-03-01',
    duration: '8m 32s',
    successRate: 96.1,
    stages: [
      { name: 'ingest',   label: 'Ingest',          status: 'healthy',  recordsIn: 1120, recordsOut: 1120, dropRate: 0,    lastRunDuration: '2m 14s' },
      { name: 'parse',    label: 'Parse',            status: 'healthy',  recordsIn: 1120, recordsOut: 1118, dropRate: 0.18, lastRunDuration: '1m 38s' },
      { name: 'extract',  label: 'Extract Entities', status: 'healthy',  recordsIn: 1118, recordsOut: 1102, dropRate: 1.43, lastRunDuration: '2m 42s' },
      { name: 'resolve',  label: 'Resolve',          status: 'warning',  recordsIn: 1102, recordsOut: 760,  dropRate: 0, errorCount: 342, lastRunDuration: '1m 24s', errorMessage: '342 records pending disambiguation — asset identity conflicts across multiple cloud accounts.' },
      { name: 'publish',  label: 'KG Publish',       status: 'healthy',  recordsIn: 760,  recordsOut: 760,  dropRate: 0,    lastRunDuration: '0m 34s' },
    ],
  },
  {
    id: '6',
    name: 'Splunk Enterprise SIEM',
    connector: 'Splunk Enterprise',
    connectorType: 'splunk',
    connectorCategory: 'siem',
    target: 'Knowledge Graph',
    targetEntities: ['finding', 'account'],
    status: 'active',
    lastRun: '1h ago',
    nextRun: 'in 30 min',
    records: '15,490',
    schedule: '0 */2 * * *',
    createdAt: '2026-02-14',
    duration: '3m 12s',
    successRate: 99.7,
    fromTemplate: 'SIEM Alert Normalization',
    stages: [
      { name: 'ingest',   label: 'Ingest',          status: 'healthy', recordsIn: 84,  recordsOut: 84,  dropRate: 0, lastRunDuration: '0m 48s' },
      { name: 'parse',    label: 'Parse',            status: 'healthy', recordsIn: 84,  recordsOut: 84,  dropRate: 0, lastRunDuration: '0m 42s' },
      { name: 'extract',  label: 'Extract Entities', status: 'healthy', recordsIn: 84,  recordsOut: 84,  dropRate: 0, lastRunDuration: '0m 58s' },
      { name: 'resolve',  label: 'Resolve',          status: 'healthy', recordsIn: 84,  recordsOut: 84,  dropRate: 0, lastRunDuration: '0m 38s' },
      { name: 'publish',  label: 'KG Publish',       status: 'healthy', recordsIn: 84,  recordsOut: 84,  dropRate: 0, lastRunDuration: '0m 06s' },
    ],
  },
];

// ─── Activity Feed ────────────────────────────────────────────────────────────

export const mockActivity: ActivityItem[] = [
  {
    id: 'a1', type: 'run', pipeline: 'CrowdStrike Falcon',
    time: '2 min ago',
    detail: '18,240 Alert entities ingested — 47 mapped to MITRE T1059 (Command & Scripting)',
  },
  {
    id: 'a2', type: 'error', pipeline: 'MISP Threat Intelligence',
    time: '3h ago',
    detail: 'Connection timeout after 3 retries — IOC + ThreatActor entities not updated',
  },
  {
    id: 'a3', type: 'run', pipeline: 'Tenable.io Vulnerability',
    time: '35 min ago',
    detail: '380 new CVEs processed — 6 Critical severity match assets in inventory',
  },
  {
    id: 'a4', type: 'paused', pipeline: 'Okta Identity Provider',
    time: '6h ago',
    detail: 'Manually paused by admin@company.com — 98,340 Identity entities may go stale',
  },
  {
    id: 'a5', type: 'warning', pipeline: 'AWS Security Hub',
    time: '3h ago',
    detail: 'Resolve stage: 342 records pending disambiguation — asset conflicts across cloud accounts',
  },
  {
    id: 'a6', type: 'run', pipeline: 'Splunk Enterprise SIEM',
    time: '1h ago',
    detail: '84 new Incident entities created — 12 linked to existing Threat Actors in KG',
  },
];

// ─── Execution Runs ───────────────────────────────────────────────────────────

export const mockExecutionRuns: ExecutionRun[] = [
  { id: 'r1', startedAt: '2026-04-07 14:02', duration: '4m 22s', status: 'success', records: '18,240' },
  { id: 'r2', startedAt: '2026-04-07 13:47', duration: '4m 01s', status: 'success', records: '16,800' },
  { id: 'r3', startedAt: '2026-04-07 13:32', duration: '4m 18s', status: 'success', records: '17,420' },
  {
    id: 'r4', startedAt: '2026-04-07 13:17', duration: '0m 22s', status: 'failed', records: '0',
    errorMessage: 'SSL certificate verification failed at Ingest stage. Remote host returned 403 Forbidden after 3 retries.',
  },
  { id: 'r5', startedAt: '2026-04-07 13:02', duration: '4m 11s', status: 'success', records: '17,190' },
  { id: 'r6', startedAt: '2026-04-07 12:47', duration: '4m 29s', status: 'success', records: '18,030' },
];

// ─── Field / Entity Mappings ──────────────────────────────────────────────────

export const mockFieldMappings: FieldMapping[] = [
  { id: 'f1', source: 'device_id',        sourceType: 'STRING',   target: 'Asset.asset_id',            targetType: 'UUID',         confidence: 100, aiSuggested: false },
  { id: 'f2', source: 'hostname',         sourceType: 'STRING',   target: 'Asset.hostname',            targetType: 'VARCHAR(255)', confidence: 98,  aiSuggested: true },
  { id: 'f3', source: 'tactic',           sourceType: 'STRING',   target: 'Alert.mitre_tactic',        targetType: 'VARCHAR(100)', confidence: 96,  aiSuggested: true, transform: 'MITRE ATT&CK lookup' },
  { id: 'f4', source: 'technique_id',     sourceType: 'STRING',   target: 'Alert.mitre_technique',     targetType: 'VARCHAR(20)',  confidence: 99,  aiSuggested: true },
  { id: 'f5', source: 'severity',         sourceType: 'INTEGER',  target: 'Alert.severity_level',      targetType: 'ENUM(1-5)',    confidence: 94,  aiSuggested: true, transform: 'Normalize 1-100 → 1-5' },
  { id: 'f6', source: 'timestamp',        sourceType: 'EPOCH_MS', target: 'Alert.detected_at',         targetType: 'TIMESTAMP',    confidence: 99,  aiSuggested: true, transform: 'epoch_ms → ISO8601' },
  { id: 'f7', source: 'local_ip',         sourceType: 'STRING',   target: 'Asset.ip_address',          targetType: 'INET',         confidence: 97,  aiSuggested: true },
  { id: 'f8', source: 'parent_process_id',sourceType: 'INTEGER',  target: 'Alert.parent_process_id',   targetType: 'BIGINT',       confidence: 88,  aiSuggested: true },
];

// ─── Team Members ─────────────────────────────────────────────────────────────

export const mockTeamMembers: TeamMember[] = [
  { id: 't1', name: 'Alex Rodriguez', email: 'alex@company.com',   role: 'admin',  lastActive: '2 min ago' },
  { id: 't2', name: 'Sarah Chen',     email: 'sarah@company.com',  role: 'editor', lastActive: '1h ago' },
  { id: 't3', name: 'Marcus Johnson', email: 'marcus@company.com', role: 'viewer', lastActive: '3h ago' },
  { id: 't4', name: 'Priya Patel',    email: 'priya@company.com',  role: 'editor', lastActive: 'Yesterday' },
];

// ─── Credentials (Admin-managed) ─────────────────────────────────────────────

export const mockCredentials: Credential[] = [
  {
    id: 'c1', name: 'CrowdStrike Falcon — Prod',
    type: 'OAuth 2.0', connectorId: 'crowdstrike', connectorName: 'CrowdStrike Falcon',
    connectedPipelines: 1, createdAt: '2026-01-10', lastUsed: '2 min ago',
    lastAuthAt: '2 min ago', health: 'healthy',
    createdBy: 'alex@company.com', environment: 'production',
  },
  {
    id: 'c2', name: 'Tenable.io — API',
    type: 'API Key', connectorId: 'tenable', connectorName: 'Tenable.io',
    connectedPipelines: 1, createdAt: '2026-01-15', lastUsed: '35 min ago',
    lastAuthAt: '35 min ago', health: 'healthy',
    createdBy: 'alex@company.com', environment: 'production',
  },
  {
    id: 'c3', name: 'MISP Instance — Internal',
    type: 'API Key', connectorId: 'misp', connectorName: 'MISP',
    connectedPipelines: 1, createdAt: '2026-02-01', lastUsed: '3h ago',
    lastAuthAt: '3h ago', health: 'error',
    healthMessage: 'Last authentication failed — API endpoint returned 503. Check MISP server status.',
    createdBy: 'sarah@company.com', environment: 'production',
  },
  {
    id: 'c4', name: 'Okta — SSO Org',
    type: 'OAuth 2.0', connectorId: 'okta', connectorName: 'Okta',
    connectedPipelines: 1, createdAt: '2025-12-01', lastUsed: '6h ago',
    lastAuthAt: '6h ago', health: 'warning',
    healthMessage: 'Token expires in 3 days — rotate credentials before expiry to avoid pipeline disruption.',
    createdBy: 'alex@company.com', environment: 'production',
  },
  {
    id: 'c5', name: 'AWS Security Hub — us-east-1',
    type: 'IAM Role', connectorId: 'aws-security-hub', connectorName: 'AWS Security Hub',
    connectedPipelines: 1, createdAt: '2026-02-28', lastUsed: '3h ago',
    lastAuthAt: '3h ago', health: 'healthy',
    createdBy: 'alex@company.com', environment: 'production',
  },
  {
    id: 'c6', name: 'Splunk — Enterprise Search',
    type: 'Credentials', connectorId: 'splunk', connectorName: 'Splunk Enterprise',
    connectedPipelines: 1, createdAt: '2026-02-14', lastUsed: '1h ago',
    lastAuthAt: '1h ago', health: 'healthy',
    createdBy: 'priya@company.com', environment: 'production',
  },
];

// ─── Cybersecurity Connector Catalog ─────────────────────────────────────────

export const mockCyberConnectors: CyberConnector[] = [
  // EDR / XDR
  { id: 'crowdstrike',   name: 'CrowdStrike Falcon',   vendor: 'CrowdStrike',    category: 'edr-xdr',       description: 'Endpoint alerts, detections, and device inventory',     authType: 'oauth',             configured: true,  configuredAs: 'CrowdStrike Falcon — Prod', connectedPipelines: 1, tags: ['MITRE ATT&CK', 'Real-time'] },
  { id: 'sentinelone',   name: 'SentinelOne',          vendor: 'SentinelOne',    category: 'edr-xdr',       description: 'Threat events, behavioral indicators, and assets',       authType: 'api-key',           configured: false, tags: ['MITRE ATT&CK'] },
  { id: 'carbon-black',  name: 'VMware Carbon Black',  vendor: 'VMware',         category: 'edr-xdr',       description: 'Endpoint events, watchlists, and process trees',          authType: 'api-key',           configured: false },
  // SIEM
  { id: 'splunk',        name: 'Splunk Enterprise',    vendor: 'Splunk',         category: 'siem',          description: 'Search alerts, notable events, and correlation results',  authType: 'credentials',       configured: true,  configuredAs: 'Splunk — Enterprise Search', connectedPipelines: 1 },
  { id: 'microsoft-sentinel', name: 'Microsoft Sentinel', vendor: 'Microsoft', category: 'siem',          description: 'Cloud-native SIEM incidents, alerts, and hunting results', authType: 'oauth',             configured: false, tags: ['Azure'] },
  { id: 'qradar',        name: 'IBM QRadar',           vendor: 'IBM',            category: 'siem',          description: 'Offenses, events, and flow data from QRadar SIEM',        authType: 'api-key',           configured: false },
  { id: 'elastic-siem',  name: 'Elastic SIEM',         vendor: 'Elastic',        category: 'siem',          description: 'Detection alerts and timeline events from Elastic',       authType: 'api-key',           configured: false },
  // Threat Intelligence
  { id: 'misp',          name: 'MISP',                 vendor: 'MISP Project',   category: 'threat-intel',  description: 'Threat events, IOCs, and galaxy clusters',               authType: 'api-key',           configured: true,  configuredAs: 'MISP Instance — Internal', connectedPipelines: 1, tags: ['IOC', 'STIX'] },
  { id: 'recorded-future', name: 'Recorded Future',   vendor: 'Recorded Future',category: 'threat-intel',  description: 'Threat actors, CVE intelligence, and risk scores',        authType: 'api-key',           configured: false, tags: ['Premium'] },
  { id: 'virustotal',    name: 'VirusTotal',           vendor: 'Google',         category: 'threat-intel',  description: 'File, URL, domain, and IP reputation data',              authType: 'api-key',           configured: false },
  { id: 'taxii',         name: 'STIX / TAXII Feed',    vendor: 'Open Standard',  category: 'threat-intel',  description: 'Any STIX 2.x threat intelligence feed via TAXII 2.1',    authType: 'credentials',       configured: false, tags: ['STIX', 'Open Standard'] },
  // Vulnerability
  { id: 'tenable',       name: 'Tenable.io',           vendor: 'Tenable',        category: 'vulnerability', description: 'Vulnerabilities, assets, and scan results',              authType: 'api-key',           configured: true,  configuredAs: 'Tenable.io — API', connectedPipelines: 1 },
  { id: 'qualys',        name: 'Qualys VMDR',          vendor: 'Qualys',         category: 'vulnerability', description: 'Vulnerabilities, detections, and host inventory',         authType: 'credentials',       configured: false },
  { id: 'rapid7',        name: 'Rapid7 InsightVM',     vendor: 'Rapid7',         category: 'vulnerability', description: 'Vulnerability findings, risk scores, and asset data',    authType: 'api-key',           configured: false },
  { id: 'wiz',           name: 'Wiz',                  vendor: 'Wiz',            category: 'vulnerability', description: 'Cloud security findings, misconfigurations, and risks',  authType: 'oauth',             configured: false, tags: ['Cloud Native'] },
  // Cloud Security
  { id: 'aws-security-hub', name: 'AWS Security Hub', vendor: 'Amazon',         category: 'cloud-security',description: 'Aggregated findings from AWS security services',           authType: 'credentials',       configured: true,  configuredAs: 'AWS Security Hub — us-east-1', connectedPipelines: 1, tags: ['AWS'] },
  { id: 'azure-defender', name: 'Microsoft Defender for Cloud', vendor: 'Microsoft', category: 'cloud-security', description: 'Security recommendations and threat alerts for Azure', authType: 'oauth',      configured: false, tags: ['Azure'] },
  { id: 'gcp-scc',       name: 'GCP Security Command Center', vendor: 'Google', category: 'cloud-security',description: 'Findings, assets, and vulnerabilities from GCP',          authType: 'credentials',       configured: false, tags: ['GCP'] },
  // Identity
  { id: 'okta',          name: 'Okta',                 vendor: 'Okta',           category: 'identity',      description: 'Users, groups, authentication events, and MFA status',   authType: 'oauth',             configured: true,  configuredAs: 'Okta — SSO Org', connectedPipelines: 1 },
  { id: 'active-directory', name: 'Active Directory', vendor: 'Microsoft',      category: 'identity',      description: 'Users, computers, groups, and OU structure via LDAP',    authType: 'credentials',       configured: false },
  { id: 'cyberark',      name: 'CyberArk PAM',         vendor: 'CyberArk',       category: 'identity',      description: 'Privileged accounts, vault activity, and session data',  authType: 'api-key',           configured: false, tags: ['PAM'] },
  // Network
  { id: 'palo-alto',     name: 'Palo Alto Panorama',   vendor: 'Palo Alto',      category: 'network',       description: 'Firewall logs, threat events, and traffic analytics',    authType: 'api-key',           configured: false },
  { id: 'cisco-ftd',     name: 'Cisco Firepower',      vendor: 'Cisco',          category: 'network',       description: 'IDS/IPS events, network flows, and security policies',   authType: 'credentials',       configured: false },
  { id: 'fortinet',      name: 'Fortinet FortiGate',   vendor: 'Fortinet',       category: 'network',       description: 'UTM events, VPN logs, and web filter activity',           authType: 'api-key',           configured: false },
  // ITSM / CMDB
  { id: 'servicenow-cmdb', name: 'ServiceNow CMDB',   vendor: 'ServiceNow',     category: 'itsm-cmdb',     description: 'CI records, relationships, and change history',           authType: 'oauth',             configured: false },
  { id: 'tanium',        name: 'Tanium',               vendor: 'Tanium',         category: 'itsm-cmdb',     description: 'Real-time endpoint inventory, patch state, and compliance',authType: 'api-key',           configured: false },
];

// ─── Pipeline Templates ───────────────────────────────────────────────────────

export const mockPipelineTemplates: PipelineTemplate[] = [
  {
    id: 'tpl-1',
    name: 'EDR Alert Ingestion',
    description: 'Ingest endpoint detection alerts, normalize severity, and map to MITRE ATT&CK tactics and techniques.',
    connectorType: 'crowdstrike',
    connectorName: 'CrowdStrike Falcon / SentinelOne / Carbon Black',
    connectorCategory: 'edr-xdr',
    targetEntities: ['finding', 'host'],
    relationships: ['Finding → DETECTED_ON → Host', 'Finding → MAPS_TO → MITRETechnique'],
    estimatedSetupMins: 8,
    usedByCount: 47,
    requiredCredentialType: 'OAuth 2.0 or API Key',
    tags: ['MITRE ATT&CK', 'Real-time'],
  },
  {
    id: 'tpl-2',
    name: 'Vulnerability Aggregation',
    description: 'Pull CVE findings from vulnerability scanners, enrich with CVSS scores, and correlate with asset inventory.',
    connectorType: 'tenable',
    connectorName: 'Tenable.io / Qualys VMDR / Rapid7 InsightVM',
    connectorCategory: 'vulnerability',
    targetEntities: ['vulnerability', 'host'],
    relationships: ['Vulnerability → AFFECTS → Host', 'Vulnerability → HAS_CVE → CVERecord'],
    estimatedSetupMins: 10,
    usedByCount: 62,
    requiredCredentialType: 'API Key',
    tags: ['CVE', 'CVSS', 'NVD Enrichment'],
  },
  {
    id: 'tpl-3',
    name: 'Threat Intelligence Enrichment',
    description: 'Ingest threat actor profiles, IOCs, and TTPs from threat intel platforms, structured as STIX objects.',
    connectorType: 'misp',
    connectorName: 'MISP / Recorded Future / STIX-TAXII',
    connectorCategory: 'threat-intel',
    targetEntities: ['account', 'identity'],
    relationships: ['ThreatActor → USES → IOC', 'ThreatActor → EMPLOYS → MITRETechnique'],
    estimatedSetupMins: 12,
    usedByCount: 38,
    requiredCredentialType: 'API Key',
    tags: ['STIX', 'IOC', 'TTP'],
  },
  {
    id: 'tpl-4',
    name: 'SIEM Alert Normalization',
    description: 'Normalize alerts from SIEM platforms into a unified alert schema, linking to incidents and source assets.',
    connectorType: 'splunk',
    connectorName: 'Splunk / Microsoft Sentinel / QRadar / Elastic',
    connectorCategory: 'siem',
    targetEntities: ['finding', 'account'],
    relationships: ['Finding → PART_OF → Account', 'Finding → GENERATED_BY → Host'],
    estimatedSetupMins: 15,
    usedByCount: 29,
    requiredCredentialType: 'Credentials or API Key',
    tags: ['Normalization', 'Incident Correlation'],
  },
  {
    id: 'tpl-5',
    name: 'Identity Risk Aggregation',
    description: 'Sync user and device identities, authentication events, and privilege levels from IAM platforms.',
    connectorType: 'okta',
    connectorName: 'Okta / Active Directory / CyberArk',
    connectorCategory: 'identity',
    targetEntities: ['identity'],
    relationships: ['Identity → HAS_ACCESS_TO → Asset', 'Identity → AUTHENTICATED_VIA → AuthEvent'],
    estimatedSetupMins: 10,
    usedByCount: 41,
    requiredCredentialType: 'OAuth 2.0 or LDAP Credentials',
    tags: ['PAM', 'Zero Trust'],
  },
  {
    id: 'tpl-6',
    name: 'Cloud Misconfiguration Feed',
    description: 'Ingest cloud security findings and misconfigurations from cloud-native security services.',
    connectorType: 'aws-security-hub',
    connectorName: 'AWS Security Hub / Azure Defender / Wiz',
    connectorCategory: 'cloud-security',
    targetEntities: ['finding', 'host'],
    relationships: ['Finding → AFFECTS → Host', 'Finding → VIOLATES → ComplianceControl'],
    estimatedSetupMins: 12,
    usedByCount: 33,
    requiredCredentialType: 'IAM Role or OAuth 2.0',
    tags: ['Cloud', 'Compliance'],
  },
  {
    id: 'tpl-7',
    name: 'Asset Inventory Sync',
    description: 'Build and maintain a unified asset inventory from CMDB, endpoint management, and cloud platforms.',
    connectorType: 'servicenow-cmdb',
    connectorName: 'ServiceNow CMDB / Tanium',
    connectorCategory: 'itsm-cmdb',
    targetEntities: ['host'],
    relationships: ['Host → MANAGED_BY → ServiceNow', 'Host → RUNS → SoftwareComponent'],
    estimatedSetupMins: 15,
    usedByCount: 55,
    requiredCredentialType: 'OAuth 2.0 or API Key',
    tags: ['CMDB', 'Asset Management'],
  },
];

// ─── Throughput (kept for pipeline view) ─────────────────────────────────────

export const mockThroughputData = [
  { time: '00:00', records: 14200 },
  { time: '02:00', records: 12800 },
  { time: '04:00', records: 10400 },
  { time: '06:00', records: 15600 },
  { time: '08:00', records: 18900 },
  { time: '10:00', records: 21200 },
  { time: '12:00', records: 19800 },
  { time: '14:00', records: 18240 },
];

// Legacy (kept for any references)
export const mockIngestionTrend = mockKGGrowthTrend.map(d => ({ date: d.date, records: d.entities }));
