import { useQuery, useMutation } from "@tanstack/react-query";
import { IntegrationResponse, PipelineConfig, MonitoringMetrics, LiveEvent } from "@/types/stage1";

// TODO: replace with real Stage 1 implementation from teammate.

export const useIntegrations = () => {
  return useQuery({
    queryKey: ['integrations'],
    queryFn: async (): Promise<IntegrationResponse[]> => {
      // Return empty/mock data for now
      return [];
    }
  });
};

export const useConfigureIntegration = () => {
  return useMutation({
    mutationFn: async (req: { provider: string; config: Record<string, any> }): Promise<void> => {
      // Mock mutation
      return Promise.resolve();
    }
  });
};

export const useMonitoringConfig = () => {
  return useQuery({
    queryKey: ['monitoringConfig'],
    queryFn: async (): Promise<PipelineConfig> => {
      return { stages: [], columns: [], healthThresholds: { latencyMs: 0, errorRatePercent: 0 } };
    }
  });
};

export const useMonitoringMetrics = (interval?: number | null) => {
  return useQuery({
    queryKey: ['monitoringMetrics', interval],
    queryFn: async (): Promise<MonitoringMetrics> => {
      return { totalEvents: 0, eventsPerMinute: 0, validationSuccessRate: 0, activeConnectors: 0, chartData: [] };
    }
  });
};

export const useLiveEvents = (interval?: number | null, limit?: number) => {
  return useQuery({
    queryKey: ['liveEvents', interval, limit],
    queryFn: async (): Promise<LiveEvent[]> => {
      return [];
    }
  });
};
