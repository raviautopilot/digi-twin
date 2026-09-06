import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { configClient } from './clients';
import type { CfgModule, CfgType, CfgValue, CfgDependency } from '../types/config';

// Health Check
export interface HealthResponse {
  status: string;
  rtwin_status: string;
  timestamp: string;
}

export const useConfigHealth = () => {
  return useQuery<HealthResponse>({
    queryKey: ['config', 'health'],
    queryFn: async () => {
      // The endpoint is actually /health or /api/v1/config/health? Let's check swagger.
      // In swagger it said: docs_swagger_health_get or paths_health
      // Let's assume /health (or fallback to /health if needed)
      const res = await configClient.get('/health');
      return res.data;
    },
    refetchInterval: 5000, // Check every 5s
    retry: 1,
  });
};

// ==========================================
// CfgModules CRUD
// ==========================================
export const useModules = (limit = 100, offset = 0) => {
  return useQuery<CfgModule[]>({
    queryKey: ['config', 'modules', limit, offset],
    queryFn: async () => {
      const res = await configClient.get('/config/modules', {
        params: { limit, offset },
      });
      return res.data;
    },
    retry: false,
  });
};

export const useCreateModule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CfgModule) => {
      const res = await configClient.post('/config/modules', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config', 'modules'] });
    },
  });
};

export const useUpdateModule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CfgModule }) => {
      const res = await configClient.put(`/config/modules/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config', 'modules'] });
    },
  });
};

export const useDeleteModule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await configClient.delete(`/config/modules/${id}`);
    },
    onSuccess: (_, id) => {
      queryClient.setQueriesData<CfgModule[]>({ queryKey: ['config', 'modules'] }, (old) =>
        old ? old.filter((m) => m.id !== id) : []
      );
      queryClient.invalidateQueries({ queryKey: ['config', 'modules'] });
    },
  });
};

// ==========================================
// CfgTypes CRUD
// ==========================================
export const useTypes = (limit = 100, offset = 0) => {
  return useQuery<CfgType[]>({
    queryKey: ['config', 'types', limit, offset],
    queryFn: async () => {
      const res = await configClient.get('/config/types', {
        params: { limit, offset },
      });
      return res.data;
    },
    retry: false,
  });
};

export const useCreateType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CfgType) => {
      const res = await configClient.post('/config/types', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config', 'types'] });
    },
  });
};

export const useUpdateType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CfgType }) => {
      const res = await configClient.put(`/config/types/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config', 'types'] });
    },
  });
};

export const useDeleteType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await configClient.delete(`/config/types/${id}`);
    },
    onSuccess: (_, id) => {
      queryClient.setQueriesData<CfgType[]>({ queryKey: ['config', 'types'] }, (old) =>
        old ? old.filter((t) => t.id !== id) : []
      );
      queryClient.invalidateQueries({ queryKey: ['config', 'types'] });
    },
  });
};

// ==========================================
// CfgValues CRUD
// ==========================================
export const useValues = (limit = 200, offset = 0) => {
  return useQuery<CfgValue[]>({
    queryKey: ['config', 'values', limit, offset],
    queryFn: async () => {
      const res = await configClient.get('/config/values', {
        params: { limit, offset },
      });
      return res.data;
    },
    retry: false,
  });
};

export const useCreateValue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CfgValue) => {
      const res = await configClient.post('/config/values', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config', 'values'] });
    },
  });
};

export const useUpdateValue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CfgValue }) => {
      const res = await configClient.put(`/config/values/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config', 'values'] });
    },
  });
};

export const useDeleteValue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await configClient.delete(`/config/values/${id}`);
    },
    onSuccess: (_, id) => {
      queryClient.setQueriesData<CfgValue[]>({ queryKey: ['config', 'values'] }, (old) =>
        old ? old.filter((v) => v.id !== id) : []
      );
      queryClient.invalidateQueries({ queryKey: ['config', 'values'] });
    },
  });
};

// ==========================================
// CfgDependencies CRUD
// ==========================================
export const useDependencies = (limit = 100, offset = 0) => {
  return useQuery<CfgDependency[]>({
    queryKey: ['config', 'dependencies', limit, offset],
    queryFn: async () => {
      const res = await configClient.get('/config/dependencies', {
        params: { limit, offset },
      });
      return res.data;
    },
    retry: false,
  });
};

export const useCreateDependency = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CfgDependency) => {
      const res = await configClient.post('/config/dependencies', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config', 'dependencies'] });
    },
  });
};

export const useUpdateDependency = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CfgDependency }) => {
      const res = await configClient.put(`/config/dependencies/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config', 'dependencies'] });
    },
  });
};

export const useDeleteDependency = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await configClient.delete(`/config/dependencies/${id}`);
    },
    onSuccess: (_, id) => {
      queryClient.setQueriesData<CfgDependency[]>({ queryKey: ['config', 'dependencies'] }, (old) =>
        old ? old.filter((d) => d.id !== id) : []
      );
      queryClient.invalidateQueries({ queryKey: ['config', 'dependencies'] });
    },
  });
};
