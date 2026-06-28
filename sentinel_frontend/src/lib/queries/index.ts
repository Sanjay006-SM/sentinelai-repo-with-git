import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api";
import { DashboardSummary, Identity, RiskFinding } from "../../types";
import { AttackPathGraph, AIInvestigationRequest, AIInvestigationResponse } from "../../types/canvas";

export const useDashboardSummary = () => {
  return useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: async (): Promise<DashboardSummary> => {
      const res = await api.get('/dashboard/summary');
      return res;
    }
  });
};

export const useRecentFindings = () => {
  return useQuery({
    queryKey: ['recentFindings'],
    queryFn: async (): Promise<RiskFinding[]> => {
      const res = await api.get('/dashboard/recent-findings');
      return res;
    }
  });
};

export const useRecentEvents = () => {
  return useQuery({
    queryKey: ['recentEvents'],
    queryFn: async (): Promise<any[]> => {
      const res = await api.get('/dashboard/recent-events');
      return res;
    },
    refetchInterval: 5000 // Poll every 5s for live updates
  });
};

export const useTopAttackPaths = () => {
  return useQuery({
    queryKey: ['topAttackPaths'],
    queryFn: async (): Promise<any[]> => {
      const res = await api.get('/dashboard/top-attack-paths');
      return res;
    }
  });
};

export const useIdentities = () => {
  return useQuery({
    queryKey: ['identities'],
    queryFn: async (): Promise<Identity[]> => {
      const res = await api.get('/identities');
      return res.sort((a: any, b: any) => b.risk_score - a.risk_score);
    }
  });
};

export const useGetAttackPath = (identityId: string) => {
  return useQuery({
    queryKey: ['attackPath', identityId],
    queryFn: async (): Promise<AttackPathGraph> => {
      const res = await api.get(`/identities/${identityId}/attack-path`);
      return res;
    },
    enabled: !!identityId,
  });
};

export const useAiInvestigate = () => {
  return useMutation({
    mutationFn: async (req: AIInvestigationRequest): Promise<AIInvestigationResponse> => {
      const res = await api.post('/ai/investigate', req);
      return res;
    }
  });
};

export const useUploadCloudTrail = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      // Let the browser handle the Content-Type boundary for FormData
      const res = await api.post('/ingestion/upload', formData);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      queryClient.invalidateQueries({ queryKey: ['identities'] });
      queryClient.invalidateQueries({ queryKey: ['recentFindings'] });
      queryClient.invalidateQueries({ queryKey: ['recentEvents'] });
      queryClient.invalidateQueries({ queryKey: ['topAttackPaths'] });
    }
  });
};
