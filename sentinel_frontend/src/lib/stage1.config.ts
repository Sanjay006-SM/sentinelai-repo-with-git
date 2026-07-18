import { ConnectorSchemaField } from "@/types/stage1";

// TODO: replace with real Stage 1 implementation from teammate.
export const STAGE1_CONFIG = {
  UI_MAPS: {
    CONNECTOR_STATUS_COLORS: {
      available: "bg-slate-100 text-slate-700",
      coming_soon: "bg-slate-100 text-slate-500",
      configured: "bg-blue-100 text-blue-700",
      syncing: "bg-indigo-100 text-indigo-700",
      success: "bg-emerald-100 text-emerald-700",
      synced_no_new_events: "bg-emerald-50 text-emerald-600",
      error: "bg-rose-100 text-rose-700",
    } as Record<string, string>,
    
    CONNECTOR_STATUS_LABELS: {
      available: "Available",
      coming_soon: "Coming Soon",
      configured: "Configured",
      syncing: "Syncing...",
      success: "Synced",
      synced_no_new_events: "Synced",
      error: "Error",
    } as Record<string, string>,
    
    CONNECTOR_NAMES: {
      aws: "AWS CloudTrail",
      azure: "Azure Active Directory",
      okta: "Okta Identity",
      crowdstrike: "CrowdStrike Falcon",
      wazuh: "Wazuh SIEM",
      suricata: "Suricata IDS",
      openvas: "OpenVAS",
    } as Record<string, string>,
  },
  
  CONNECTOR_SCHEMAS: {
    aws: [],
    azure: [],
    okta: [],
    crowdstrike: [],
    wazuh: [],
    suricata: [],
    openvas: [],
  } as Record<string, ConnectorSchemaField[]>
};
