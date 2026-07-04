export interface DashboardSummary {
  identities_count: number;
  critical_risk_count: number;
  attack_path_count: number;
  total_findings_count: number;
  cloud_accounts_count?: number;
}

export interface RiskFinding {
  id: string;
  identity_arn: string;
  finding_type: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  created_at: string;
}

export interface Identity {
  id: string;
  arn: string;
  identity_type: 'IAMUser' | 'AssumedRole' | 'AWSService';
  risk_score: number;
  risk_severity: 'Low' | 'Medium' | 'High' | 'Critical';
  account_id: string;
  total_events: number;
}
