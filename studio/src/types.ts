export type PipelineStatus = 'active' | 'paused' | 'failed' | 'running';

export interface Pipeline {
  id: string;
  name: string;
  connector: string;
  connectorType: ConnectorType;
  target: string;
  status: PipelineStatus;
  lastRun: string;
  nextRun: string;
  records: string;
  schedule: string;
  createdAt: string;
  duration: string;
  successRate: number;
}

export type ConnectorType =
  | 'salesforce'
  | 'postgresql'
  | 'mysql'
  | 'rest-api'
  | 's3'
  | 'stripe'
  | 'hubspot'
  | 'bigquery'
  | 'snowflake'
  | 'mongodb'
  | 'redshift'
  | 'kafka';

export interface Connector {
  id: ConnectorType;
  name: string;
  category: 'source' | 'destination' | 'both';
  description: string;
  icon: string;
  authType: 'oauth' | 'api-key' | 'credentials' | 'connection-string';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ActivityItem {
  id: string;
  type: 'run' | 'error' | 'created' | 'paused' | 'deployed';
  pipeline: string;
  time: string;
  detail: string;
}

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

export interface ExecutionRun {
  id: string;
  startedAt: string;
  duration: string;
  status: 'success' | 'failed' | 'running';
  records: string;
  errorMessage?: string;
}

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
  connectedPipelines: number;
  createdAt: string;
  lastUsed: string;
}

export type WizardStep =
  | 'connector'
  | 'config'
  | 'feed'
  | 'feed-config'
  | 'mapping'
  | 'schedule'
  | 'review';
