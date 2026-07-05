import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coreClient } from './clients';
import type {
  CoreEntity,
  CorePerson,
  CoreOrganization,
  CoreRelationship,
  PersonAddress,
  OrganizationAddress,
  PersonContact,
  OrganizationContact,
  PrimaryContact,
} from '../types/core';
import type { HealthResponse } from './config';

// Health Check
export const useCoreHealth = () => {
  return useQuery<HealthResponse>({
    queryKey: ['core', 'health'],
    queryFn: async () => {
      const res = await coreClient.get('/health');
      return res.data;
    },
    refetchInterval: 5000, // Check every 5s
    retry: 1,
  });
};

// ==========================================
// CoreEntities CRUD
// ==========================================
export const useEntities = (limit = 100, offset = 0) => {
  return useQuery<CoreEntity[]>({
    queryKey: ['core', 'entities', limit, offset],
    queryFn: async () => {
      const res = await coreClient.get('/core/entities', {
        params: { limit, offset },
      });
      return res.data;
    },
    retry: false,
  });
};

export const useCreateEntity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CoreEntity) => {
      const res = await coreClient.post('/core/entities', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['core', 'entities'] });
    },
  });
};

export const useUpdateEntity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CoreEntity }) => {
      const res = await coreClient.put(`/core/entities/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['core', 'entities'] });
    },
  });
};

export const useDeleteEntity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await coreClient.delete(`/core/entities/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['core', 'entities'] });
    },
  });
};

// ==========================================
// CorePeople CRUD
// ==========================================
export const usePeople = (limit = 100, offset = 0) => {
  return useQuery<CorePerson[]>({
    queryKey: ['core', 'people', limit, offset],
    queryFn: async () => {
      const res = await coreClient.get('/core/people', {
        params: { limit, offset },
      });
      return res.data;
    },
    retry: false,
  });
};

export const useCreatePerson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CorePerson) => {
      const res = await coreClient.post('/core/people', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['core', 'people'] });
    },
  });
};

export const useUpdatePerson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CorePerson }) => {
      const res = await coreClient.put(`/core/people/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['core', 'people'] });
    },
  });
};

export const useDeletePerson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await coreClient.delete(`/core/people/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['core', 'people'] });
    },
  });
};

// ==========================================
// CoreOrganizations CRUD
// ==========================================
export const useOrganizations = (limit = 100, offset = 0) => {
  return useQuery<CoreOrganization[]>({
    queryKey: ['core', 'organizations', limit, offset],
    queryFn: async () => {
      const res = await coreClient.get('/core/organizations', {
        params: { limit, offset },
      });
      return res.data;
    },
    retry: false,
  });
};

export const useCreateOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CoreOrganization) => {
      const res = await coreClient.post('/core/organizations', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['core', 'organizations'] });
    },
  });
};

export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CoreOrganization }) => {
      const res = await coreClient.put(`/core/organizations/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['core', 'organizations'] });
    },
  });
};

export const useDeleteOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await coreClient.delete(`/core/organizations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['core', 'organizations'] });
    },
  });
};

// ==========================================
// CoreRelationships CRUD
// ==========================================
export const useRelationships = (limit = 100, offset = 0) => {
  return useQuery<CoreRelationship[]>({
    queryKey: ['core', 'relationships', limit, offset],
    queryFn: async () => {
      const res = await coreClient.get('/core/relationships', {
        params: { limit, offset },
      });
      return res.data;
    },
    retry: false,
  });
};

export const useCreateRelationship = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CoreRelationship) => {
      const res = await coreClient.post('/core/relationships', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['core', 'relationships'] });
    },
  });
};

export const useUpdateRelationship = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CoreRelationship }) => {
      const res = await coreClient.put(`/core/relationships/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['core', 'relationships'] });
    },
  });
};

export const useDeleteRelationship = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await coreClient.delete(`/core/relationships/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['core', 'relationships'] });
    },
  });
};

// ==========================================
// Addresses CRUD (Person)
// ==========================================
export const usePersonAddresses = (limit = 200, offset = 0) => {
  return useQuery<PersonAddress[]>({
    queryKey: ['core', 'person-addresses', limit, offset],
    queryFn: async () => {
      const res = await coreClient.get('/core/person-addresses', {
        params: { limit, offset },
      });
      return res.data;
    },
    retry: false,
  });
};

export const useCreatePersonAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: PersonAddress) => {
      const res = await coreClient.post('/core/person-addresses', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['core', 'person-addresses'] });
    },
  });
};

export const useUpdatePersonAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: PersonAddress }) => {
      const res = await coreClient.put(`/core/person-addresses/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['core', 'person-addresses'] });
    },
  });
};

export const useDeletePersonAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await coreClient.delete(`/core/person-addresses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['core', 'person-addresses'] });
    },
  });
};

// ==========================================
// Addresses CRUD (Organization)
// ==========================================
export const useOrganizationAddresses = (limit = 200, offset = 0) => {
  return useQuery<OrganizationAddress[]>({
    queryKey: ['core', 'organization-addresses', limit, offset],
    queryFn: async () => {
      const res = await coreClient.get('/core/organization-addresses', {
        params: { limit, offset },
      });
      return res.data;
    },
    retry: false,
  });
};

export const useCreateOrganizationAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: OrganizationAddress) => {
      const res = await coreClient.post('/core/organization-addresses', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['core', 'organization-addresses'] });
    },
  });
};

export const useUpdateOrganizationAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: OrganizationAddress }) => {
      const res = await coreClient.put(`/core/organization-addresses/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['core', 'organization-addresses'] });
    },
  });
};

export const useDeleteOrganizationAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await coreClient.delete(`/core/organization-addresses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['core', 'organization-addresses'] });
    },
  });
};

// ==========================================
// Contacts CRUD (Person)
// ==========================================
export const usePersonContacts = (limit = 200, offset = 0) => {
  return useQuery<PersonContact[]>({
    queryKey: ['core', 'person-contacts', limit, offset],
    queryFn: async () => {
      const res = await coreClient.get('/core/person-contacts', {
        params: { limit, offset },
      });
      return res.data;
    },
    retry: false,
  });
};

export const useCreatePersonContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: PersonContact) => {
      const res = await coreClient.post('/core/person-contacts', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['core', 'person-contacts'] });
    },
  });
};

export const useUpdatePersonContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: PersonContact }) => {
      const res = await coreClient.put(`/core/person-contacts/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['core', 'person-contacts'] });
    },
  });
};

export const useDeletePersonContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await coreClient.delete(`/core/person-contacts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['core', 'person-contacts'] });
    },
  });
};

// ==========================================
// Contacts CRUD (Organization)
// ==========================================
export const useOrganizationContacts = (limit = 200, offset = 0) => {
  return useQuery<OrganizationContact[]>({
    queryKey: ['core', 'organization-contacts', limit, offset],
    queryFn: async () => {
      const res = await coreClient.get('/core/organization-contacts', {
        params: { limit, offset },
      });
      return res.data;
    },
    retry: false,
  });
};

export const useCreateOrganizationContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: OrganizationContact) => {
      const res = await coreClient.post('/core/organization-contacts', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['core', 'organization-contacts'] });
    },
  });
};

export const useUpdateOrganizationContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: OrganizationContact }) => {
      const res = await coreClient.put(`/core/organization-contacts/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['core', 'organization-contacts'] });
    },
  });
};

export const useDeleteOrganizationContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await coreClient.delete(`/core/organization-contacts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['core', 'organization-contacts'] });
    },
  });
};

// ==========================================
// PrimaryContacts CRUD (Person <-> Org)
// ==========================================
export const usePrimaryContacts = (limit = 100, offset = 0) => {
  return useQuery<PrimaryContact[]>({
    queryKey: ['core', 'primary-contacts', limit, offset],
    queryFn: async () => {
      const res = await coreClient.get('/core/primary-contacts', {
        params: { limit, offset },
      });
      return res.data;
    },
    retry: false,
  });
};

export const useCreatePrimaryContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: PrimaryContact) => {
      const res = await coreClient.post('/core/primary-contacts', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['core', 'primary-contacts'] });
    },
  });
};

export const useUpdatePrimaryContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: PrimaryContact }) => {
      const res = await coreClient.put(`/core/primary-contacts/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['core', 'primary-contacts'] });
    },
  });
};

export const useDeletePrimaryContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await coreClient.delete(`/core/primary-contacts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['core', 'primary-contacts'] });
    },
  });
};
