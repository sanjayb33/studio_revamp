// ─── Pipeline & Status ────────────────────────────────────────────────────────

export type PipelineStatus = 'active' | 'paused' | 'failed' | 'running';

export type StageStatus = 'healthy' | 'warning' | 'error' | 'idle' | 'running';

export type StageName = 'ingest' | 'parse' | 'extract' | 'resolve' | 'publish';

export interface PipelineStage {
  name: StageName;
  label: string;
  status: StageStatus;
  recordsIn?: number;
  recordsOut?: number;
  dropRate?: number;      // percentage
  errorCount?: number;
  lastRunDuration?: string;
  errorMessage?: string;
}

// ─── Connector Types ──────────────────────────────────────────────────────────

// Legacy connector types (kept for backward compat)
export type ConnectorType =
  | 'salesforce' | 'postgresql' | 'mysql' | 'rest-api' | 's3'
  | 'stripe' | 'hubspot' | 'bigquery' | 'snowflake' | 'mongodb'
  | 'redshift' | 'kafka'
  // Cybersecurity connectors
  | 'crowdstrike' | 'sentinelone' | 'carbon-black'
  | 'splunk' | 'microsoft-sentinel' | 'qradar' | 'elastic-siem'
  | 'misp' | 'recorded-future' | 'virustotal' | 'taxii'
  | 'tenable' | 'qualys' | 'rapid7' | 'wiz'
  | 'aws-security-hub' | 'azure-defender' | 'gcp-scc'
  | 'okta' | 'active-directory' | 'cyberark'
  | 'palo-alto' | 'cisco-ftd' | 'fortinet'
  | 'servicenow-cmdb' | 'tanium';

export type ConnectorCategory =
  | 'edr-xdr'
  | 'siem'
  | 'threat-intel'
  | 'vulnerability'
  | 'cloud-security'
  | 'identity'
  | 'network'
  | 'itsm-cmdb';

export const CONNECTOR_CATEGORY_LABELS: Record<ConnectorCategory, string> = {
  'edr-xdr':       'EDR / XDR',
  'siem':          'SIEM',
  'threat-intel':  'Threat Intelligence',
  'vulnerability': 'Vulnerability Management',
  'cloud-security':'Cloud Security',
  'identity':      'Identity & Access',
  'network':       'Network & Firewall',
  'itsm-cmdb':     'ITSM / CMDB',
};

export interface CyberConnector {
  id: ConnectorType;
  name: string;
  vendor: string;
  category: ConnectorCategory;
  description: string;
  authType: 'oauth' | 'api-key' | 'credentials' | 'connection-string' | 'certificate';
  configured: boolean;
  configuredAs?: string;       // credential name if configured
  connectedPipelines?: number;
  tags?: string[];             // e.g. ['MITRE ATT&CK', 'Real-time']
}

// Legacy connector interface kept for existing wizard
export interface Connector {
  id: ConnectorType;
  name: string;
  category: 'source' | 'destination' | 'both';
  description: string;
  icon: string;
  authType: 'oauth' | 'api-key' | 'credentials' | 'connection-string';
}

// ─── Knowledge Graph ──────────────────────────────────────────────────────────

export type KGEntityType =
  | 'account'
  | 'application'
  | 'assessment'
  | 'cloud-account'
  | 'cloud-container'
  | 'cloud-cluster'
  | 'finding'
  | 'host'
  | 'identity'
  | 'network'
  | 'network-interface'
  | 'network-services'
  | 'person'
  | 'cloud-storage'
  | 'vulnerability'
  | 'Group';

export type EntityFreshness = 'fresh' | 'stale' | 'critical';

export interface KGEntityStats {
  type: KGEntityType;
  count: number;
  delta: number;          // change since yesterday
  freshness: EntityFreshness;
  lastUpdated: string;
  pipelineCount: number;  // how many pipelines feed this entity type
  color: string;          // chart color
}

export interface KGHealthSummary {
  totalEntities: number;
  totalRelationships: number;
  coverageScore: number;        // 0–100 % of entity types that are fresh
  disambiguationBacklog: number;
  staleEntityTypes: number;
  growthToday: number;
}

// ─── Pipeline ─────────────────────────────────────────────────────────────────

export interface Pipeline {
  id: string;
  name: string;
  connector: string;
  connectorType: ConnectorType;
  connectorCategory?: ConnectorCategory;
  target: string;               // always 'Knowledge Graph' in new model
  targetEntities?: KGEntityType[];
  status: PipelineStatus;
  stages?: PipelineStage[];
  lastRun: string;
  nextRun: string;
  records: string;
  schedule: string;
  createdAt: string;
  duration: string;
  successRate: number;
  fromTemplate?: string;
}

// ─── Activity ────────────────────────────────────────────────────────────────

export interface ActivityItem {
  id: string;
  type: 'run' | 'error' | 'created' | 'paused' | 'deployed' | 'warning';
  pipeline: string;
  time: string;
  detail: string;
}

// ─── Execution ───────────────────────────────────────────────────────────────

export interface ExecutionRun {
  id: string;
  startedAt: string;
  duration: string;
  status: 'success' | 'failed' | 'running';
  records: string;
  errorMessage?: string;
}

// ─── Field / Entity Mapping ───────────────────────────────────────────────────

export interface FieldMapping {
  id: string;
  source: string;
  sourceType: string;
  target: string;
  targetType: string;
  confidence?: number;
  aiSuggested?: boolean;
  transform?: string;
}

// ─── Team & Credentials ───────────────────────────────────────────────────────

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  lastActive: string;
}

export interface Credential {
  id: string;
  name: string;
  type: string;
  connectorId: ConnectorType;
  connectorName: string;
  connectedPipelines: number;
  createdAt: string;
  lastUsed: string;
  lastAuthAt: string;
  health: 'healthy' | 'warning' | 'error';
  healthMessage?: string;
  createdBy: string;
  environment: 'production' | 'staging' | 'development';
}

export type AIBuilderSourceType = 'url' | 'paste' | 'upload' | 'github';

export interface AIBuilderDiscoveredFeed {
  id: string;
  name: string;
  endpoint: string;
  description: string;
  entityTypes: KGEntityType[];
  selected: boolean;
}

export interface AIBuilderResult {
  connectorName: string;
  vendor: string;
  category: ConnectorCategory;
  authType: CyberConnector['authType'];
  baseUrl: string;
  feedsDiscovered: AIBuilderDiscoveredFeed[];
  endpoints: number;
  confidence: number; // 0–100
}

// ─── Pipeline Builder Wizard (legacy) ────────────────────────────────────────

export type WizardStep =
  | 'connector'
  | 'config'
  | 'feed'
  | 'feed-config'
  | 'mapping'
  | 'schedule'
  | 'review';

// ─── Chat ─────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ─── Pipeline Templates ──────────────────────────────────────────────────────

export interface PipelineTemplate {
  id: string;
  name: string;
  description: string;
  connectorType: ConnectorType;
  connectorName: string;
  connectorCategory: ConnectorCategory;
  targetEntities: KGEntityType[];
  relationships: string[];       // e.g. ['Alert → RELATES_TO → Asset']
  estimatedSetupMins: number;
  usedByCount: number;
  requiredCredentialType: string;
  tags: string[];
}
