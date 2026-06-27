export interface AttackPathGraph {
  nodes: Array<{ id: string; type?: string; label?: string; data: any; position?: any }>;
  edges: Array<{ id: string; source: string; target: string; label?: string; type?: string }>;
}

export interface AIInvestigationRequest {
  identity_id: string;
  query?: string;
}

export interface AIInvestigationResponse {
  investigation_id: string;
  identity_id: string;
  executive_summary: string;
  findings: string[];
  recommendations: string[];
  analyzed_at: string;
}
