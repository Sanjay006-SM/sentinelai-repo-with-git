export type ConnectorType = 'aws' | 'azure' | 'okta' | 'crowdstrike' | 'wazuh' | 'suricata' | 'openvas';
export type ConnectorStatus = 'available' | 'coming_soon' | 'configured' | 'syncing' | 'success' | 'synced_no_new_events' | 'error';
export type EventSeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type EventStatus = 'SUCCESS' | 'FAILED' | 'PENDING' | 'BLOCKED';
export type ActorClassification = 'USER' | 'SERVICE_PRINCIPAL' | 'SYSTEM' | 'EXTERNAL_ENTITY' | 'INTERNAL_ENGINE' | 'UNKNOWN';
export type ResourceClassification = 'COMPUTE' | 'STORAGE' | 'NETWORK' | 'DATABASE' | 'IDENTITY' | 'SYSTEM' | 'UNKNOWN';

export interface IntegrationResponse {
  provider: ConnectorType;
  name: string;
  status: ConnectorStatus;
  id?: string;
  config?: Record<string, any>;
  last_sync_time?: string | null;
  events_retrieved?: number;
  error_message?: string | null;
}

export interface AwsValidateRequest {
  account_id: string;
  region: string;
  auth_method: 'access_key' | 'role_arn';
  role_arn?: string;
  external_id?: string;
  access_key?: string;
  secret_key?: string;
}

export interface AwsValidateResponse {
  valid: boolean;
  account_id: string;
  arn: string;
  user_id: string;
  message: string;
}

export interface TriggerIngestionRequest {
  connector_name: string;
  config?: Record<string, any>;
}

export interface TriggerIngestionResponse {
  connector: string;
  status: string;
  events_received: number;
  events_validated: number;
  events_deduplicated: number;
  events_published: number;
  failures: Array<{event_id: string, reason: string}>;
  processing_time_ms: number;
}

export interface UploadLogResponse {
  message: string;
  job_id: string;
  filename: string;
  status: string;
  total_events: number;
  inserted: number;
  duplicates: number;
  failed: number;
  identities_discovered: number;
  risk_findings_generated: number;
  neo4j_nodes_created: number;
  neo4j_relationships_created: number;
  processing_time_ms: number;
}

export interface HealthStatusResponse {
  status: string;
  database?: string;
  neo4j?: string;
}

export type FieldType = 'text' | 'password' | 'select' | 'number';

export interface ConnectorSchemaField {
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
  defaultValue?: any;
}

export interface PipelineStage {
  id: string;
  name: string;
  status: 'healthy' | 'degraded' | 'offline';
  description: string;
}

export interface TableColumnConfig {
  key: string;
  label: string;
  type: 'string' | 'date' | 'badge' | 'severity';
  sortable: boolean;
}

export interface PipelineConfig {
  stages: PipelineStage[];
  columns: TableColumnConfig[];
  healthThresholds: {
    latencyMs: number;
    errorRatePercent: number;
  };
}

export interface MonitoringMetrics {
  totalEvents: number;
  eventsPerMinute: number;
  validationSuccessRate: number;
  activeConnectors: number;
  chartData: Array<{ time: string; events: number; validated: number }>;
}

export interface LiveEvent {
  id: string;
  timestamp: string;
  connector: string;
  eventType: string;
  severity: EventSeverity;
  status: EventStatus;
  message: string;
}
