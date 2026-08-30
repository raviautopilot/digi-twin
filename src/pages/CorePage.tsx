import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Plus,
  Trash2,
  Edit2,
  Search,
  User,
  Building2,
  MapPin,
  Mail,
  Share2,
  ChevronRight,
  X,
  Database,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import {
  useCoreHealth,
  useEntities,
  useCreateEntity,
  useUpdateEntity,
  useDeleteEntity,
  usePeople,
  useCreatePerson,
  useUpdatePerson,
  useOrganizations,
  useCreateOrganization,
  useUpdateOrganization,
  usePersonAddresses,
  useCreatePersonAddress,
  useDeletePersonAddress,
  useOrganizationAddresses,
  useCreateOrganizationAddress,
  useDeleteOrganizationAddress,
  usePersonContacts,
  useCreatePersonContact,
  useDeletePersonContact,
  useOrganizationContacts,
  useCreateOrganizationContact,
  useDeleteOrganizationContact,
  useRelationships,
  useCreateRelationship,
  useDeleteRelationship,
  usePrimaryContacts,
  useCreatePrimaryContact,
  useDeletePrimaryContact,
} from '../api/core';
import { ServiceOffline } from '../components/ServiceOffline';

// ----------------------------------------------------
// Validation Schemas
// ----------------------------------------------------
const personSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(100),
  middle_name: z.string().max(100).optional().or(z.literal('')),
  last_name: z.string().min(1, 'Last name is required').max(100),
  preferred_name: z.string().max(100).optional().or(z.literal('')),
  gender: z.string().min(1, 'Gender is required'),
  date_of_birth: z.string().optional().or(z.literal('')),
  national_id: z.string().max(50).optional().or(z.literal('')),
  notes: z.string().max(500).optional().or(z.literal('')),
  is_active: z.boolean().default(true),
});

const organizationSchema = z.object({
  legal_name: z.string().min(1, 'Legal name is required').max(200),
  trade_name: z.string().max(200).optional().or(z.literal('')),
  organization_type: z.string().min(1, 'Organization type is required'),
  registration_number: z.string().max(100).optional().or(z.literal('')),
  tax_identifier: z.string().max(100).optional().or(z.literal('')),
  industry: z.string().max(100).optional().or(z.literal('')),
  website: z.string().max(250).optional().or(z.literal('')),
  notes: z.string().max(500).optional().or(z.literal('')),
  is_active: z.boolean().default(true),
});

const addressSchema = z.object({
  address_type: z.string().min(1, 'Address type is required'),
  address_line1: z.string().min(3, 'Address line 1 is required').max(250),
  address_line2: z.string().max(250).optional().or(z.literal('')),
  city: z.string().min(2, 'City is required').max(100),
  state: z.string().min(2, 'State is required').max(100),
  postal_code: z.string().min(3, 'Postal code is required').max(20),
  country: z.string().min(2, 'Country code is required').max(10),
  is_primary: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

const contactSchema = z.object({
  contact_type: z.string().min(1, 'Contact type is required'),
  contact_value: z.string().min(2, 'Contact value is required').max(250),
  is_primary: z.boolean().default(false),
  notes: z.string().max(250).optional().or(z.literal('')),
  is_active: z.boolean().default(true),
});

const relationshipSchema = z.object({
  target_entity_id: z.coerce.number().int().min(1, 'Target entity is required'),
  relationship_type: z.string().min(1, 'Relationship type is required'),
  start_date: z.string().optional().or(z.literal('')),
  end_date: z.string().optional().or(z.literal('')),
  is_active: z.boolean().default(true),
});

const primaryContactSchema = z.object({
  organization_id: z.coerce.number().int().min(1, 'Organization is required'),
  person_id: z.coerce.number().int().min(1, 'Person is required'),
  role: z.string().min(1, 'Role is required').max(100),
  notes: z.string().max(250).optional().or(z.literal('')),
  is_active: z.boolean().default(true),
});

export const CorePage: React.FC = () => {
  const [selectedEntityId, setSelectedEntityId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [slideOverType, setSlideOverType] = useState<'entity' | 'address' | 'contact' | 'relationship' | 'primaryContact'>('entity');
  const [onboardType, setOnboardType] = useState<'PERSON' | 'ORGANIZATION'>('PERSON');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Health and Data Fetching
  const { data: healthData, isError: isHealthError, refetch: refetchHealth } = useCoreHealth();
  const { data: entities, isLoading: entitiesLoading, refetch: refetchEntities } = useEntities(200);
  const { data: people, isLoading: peopleLoading, refetch: refetchPeople } = usePeople(200);
  const { data: organizations, isLoading: orgsLoading, refetch: refetchOrgs } = useOrganizations(200);
  const { data: personAddresses, refetch: refetchPAddrs } = usePersonAddresses(500);
  const { data: orgAddresses, refetch: refetchOAddrs } = useOrganizationAddresses(500);
  const { data: personContacts, refetch: refetchPContacts } = usePersonContacts(500);
  const { data: orgContacts, refetch: refetchOContacts } = useOrganizationContacts(500);
  const { data: relationships, refetch: refetchRels } = useRelationships(500);
  const { data: primaryContacts, refetch: refetchPrimaryContacts } = usePrimaryContacts(500);

  // Mutations
  const createEntity = useCreateEntity();
  const updateEntity = useUpdateEntity();
  const deleteEntity = useDeleteEntity();
  const createPerson = useCreatePerson();
  const updatePerson = useUpdatePerson();
  const createOrg = useCreateOrganization();
  const updateOrg = useUpdateOrganization();

  const [editingEntity, setEditingEntity] = useState<{ id: number; isPerson: boolean; detailId: number } | null>(null);

  const createPAddress = useCreatePersonAddress();
  const deletePAddress = useDeletePersonAddress();
  const createOAddress = useCreateOrganizationAddress();
  const deleteOAddress = useDeleteOrganizationAddress();

  const createPContact = useCreatePersonContact();
  const deletePContact = useDeletePersonContact();
  const createOContact = useCreateOrganizationContact();
  const deleteOContact = useDeleteOrganizationContact();

  const createRelationship = useCreateRelationship();
  const deleteRelationship = useDeleteRelationship();

  const createPrimaryContact = useCreatePrimaryContact();
  const deletePrimaryContact = useDeletePrimaryContact();

  // Toast helper
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Forms
  const {
    register: regPerson,
    handleSubmit: hPerson,
    reset: rPerson,
    formState: { errors: errPerson },
  } = useForm({ resolver: zodResolver(personSchema), defaultValues: { is_active: true } });

  const {
    register: regOrg,
    handleSubmit: hOrg,
    reset: rOrg,
    formState: { errors: errOrg },
  } = useForm({ resolver: zodResolver(organizationSchema), defaultValues: { is_active: true } });

  const {
    register: regAddr,
    handleSubmit: hAddr,
    reset: rAddr,
    formState: { errors: errAddr },
  } = useForm({ resolver: zodResolver(addressSchema), defaultValues: { is_primary: false, is_active: true } });

  const {
    register: regContact,
    handleSubmit: hContact,
    reset: rContact,
    formState: { errors: errContact },
  } = useForm({ resolver: zodResolver(contactSchema), defaultValues: { is_primary: false, is_active: true } });

  const {
    register: regRel,
    handleSubmit: hRel,
    reset: rRel,
    formState: { errors: errRel },
  } = useForm({ resolver: zodResolver(relationshipSchema), defaultValues: { is_active: true } });

  const {
    register: regPrimContact,
    handleSubmit: hPrimContact,
    reset: rPrimContact,
    formState: { errors: errPrimContact },
  } = useForm({ resolver: zodResolver(primaryContactSchema), defaultValues: { is_active: true } });

  // Onboard Entity Modal Open
  const handleOpenOnboard = () => {
    setEditingEntity(null);
    setSlideOverType('entity');
    setOnboardType('PERSON');
    rPerson({ first_name: '', middle_name: '', last_name: '', preferred_name: '', gender: 'MALE', date_of_birth: '', national_id: '', notes: '', is_active: true });
    rOrg({ legal_name: '', trade_name: '', organization_type: 'CORPORATION', registration_number: '', tax_identifier: '', industry: '', website: '', notes: '', is_active: true });
    setIsSlideOverOpen(true);
  };

  const handleEditEntity = (entityId: number) => {
    const ent = entities?.find(e => e.id === entityId);
    if (!ent) return;
    const isPerson = ent.entity_type === 'PERSON';
    setSlideOverType('entity');
    if (isPerson) {
      const p = people?.find(x => x.entity_id === entityId);
      if (!p) return;
      setEditingEntity({ id: entityId, isPerson: true, detailId: p.id });
      setOnboardType('PERSON');
      rPerson({
        first_name: p.first_name || '',
        middle_name: p.middle_name || '',
        last_name: p.last_name || '',
        preferred_name: p.preferred_name || '',
        gender: p.gender || 'MALE',
        date_of_birth: p.date_of_birth ? p.date_of_birth.split('T')[0] : '',
        national_id: p.national_id || '',
        notes: p.notes || '',
        is_active: p.is_active ?? true,
      });
    } else {
      const o = organizations?.find(x => x.entity_id === entityId);
      if (!o) return;
      setEditingEntity({ id: entityId, isPerson: false, detailId: o.id });
      setOnboardType('ORGANIZATION');
      rOrg({
        legal_name: o.legal_name || '',
        trade_name: o.trade_name || '',
        organization_type: o.organization_type || 'CORPORATION',
        registration_number: o.registration_number || '',
        tax_identifier: o.tax_identifier || '',
        industry: o.industry || '',
        website: o.website || '',
        notes: o.notes || '',
        is_active: o.is_active ?? true,
      });
    }
    setIsSlideOverOpen(true);
  };

  const handleOpenAddSubItem = (type: 'address' | 'contact' | 'relationship' | 'primaryContact') => {
    if (!selectedEntityId) return;
    setSlideOverType(type);
    if (type === 'address') {
      rAddr({ address_type: 'HOME', address_line1: '', address_line2: '', city: '', state: '', postal_code: '', country: 'IND', is_primary: false, is_active: true });
    } else if (type === 'contact') {
      rContact({ contact_type: 'MOBILE', contact_value: '', is_primary: false, notes: '', is_active: true });
    } else if (type === 'relationship') {
      rRel({ target_entity_id: 0, relationship_type: 'FRIEND', start_date: '', end_date: '', is_active: true });
    } else if (type === 'primaryContact') {
      const isPerson = entities?.find(e => e.id === selectedEntityId)?.entity_type === 'PERSON';
      if (isPerson) {
        const personRecord = people?.find(p => p.entity_id === selectedEntityId);
        rPrimContact({
          person_id: personRecord?.id || 0,
          organization_id: 0,
          role: 'MANAGER',
          notes: '',
          is_active: true,
        });
      } else {
        const orgRecord = organizations?.find(o => o.entity_id === selectedEntityId);
        rPrimContact({
          person_id: 0,
          organization_id: orgRecord?.id || 0,
          role: 'MANAGER',
          notes: '',
          is_active: true,
        });
      }
    }
    setIsSlideOverOpen(true);
  };

  // Submit Handler for Onboarding & Associations
  const onSubmit = async (data: any) => {
    try {
      if (slideOverType === 'entity') {
        if (editingEntity) {
          if (editingEntity.isPerson) {
            const payload = {
              ...data,
              entity_id: editingEntity.id,
              date_of_birth: data.date_of_birth ? `${data.date_of_birth}T00:00:00Z` : undefined,
            };
            await updatePerson.mutateAsync({ id: editingEntity.detailId, data: payload });
            showToast(`Person ${data.first_name} updated successfully`, 'success');
          } else {
            const payload = {
              ...data,
              entity_id: editingEntity.id,
            };
            await updateOrg.mutateAsync({ id: editingEntity.detailId, data: payload });
            showToast(`Organization ${data.legal_name} updated successfully`, 'success');
          }
          setEditingEntity(null);
        } else {
          const entityRes = await createEntity.mutateAsync({
            entity_type: onboardType,
            is_active: data.is_active ?? true,
          });

          const entityId = entityRes.id;
          if (!entityId) throw new Error('Failed to generate base entity ID');

          if (onboardType === 'PERSON') {
            const payload = {
              ...data,
              entity_id: entityId,
              date_of_birth: data.date_of_birth ? `${data.date_of_birth}T00:00:00Z` : undefined,
            };
            await createPerson.mutateAsync(payload);
            showToast(`Person ${data.first_name} onboarded successfully`, 'success');
          } else {
            const payload = {
              ...data,
              entity_id: entityId,
            };
            await createOrg.mutateAsync(payload);
            showToast(`Organization ${data.legal_name} onboarded successfully`, 'success');
          }

          setSelectedEntityId(entityId);
        }
      } else if (slideOverType === 'address' && selectedEntityId) {
        const isPerson = entities?.find(e => e.id === selectedEntityId)?.entity_type === 'PERSON';
        if (isPerson) {
          const personRecord = people?.find(p => p.entity_id === selectedEntityId);
          if (!personRecord?.id) throw new Error('Person record not found');
          await createPAddress.mutateAsync({
            ...data,
            person_id: personRecord.id,
          });
        } else {
          const orgRecord = organizations?.find(o => o.entity_id === selectedEntityId);
          if (!orgRecord?.id) throw new Error('Organization record not found');
          await createOAddress.mutateAsync({
            ...data,
            organization_id: orgRecord.id,
          });
        }
        showToast('Address added successfully', 'success');
      } else if (slideOverType === 'contact' && selectedEntityId) {
        const isPerson = entities?.find(e => e.id === selectedEntityId)?.entity_type === 'PERSON';
        if (isPerson) {
          const personRecord = people?.find(p => p.entity_id === selectedEntityId);
          if (!personRecord?.id) throw new Error('Person record not found');
          await createPContact.mutateAsync({
            ...data,
            person_id: personRecord.id,
          });
        } else {
          const orgRecord = organizations?.find(o => o.entity_id === selectedEntityId);
          if (!orgRecord?.id) throw new Error('Organization record not found');
          await createOContact.mutateAsync({
            ...data,
            organization_id: orgRecord.id,
          });
        }
        showToast('Contact channel added successfully', 'success');
      } else if (slideOverType === 'relationship' && selectedEntityId) {
        await createRelationship.mutateAsync({
          ...data,
          source_entity_id: selectedEntityId,
        });
        showToast('Relationship linked successfully', 'success');
      } else if (slideOverType === 'primaryContact' && selectedEntityId) {
        // Ensure values are integer IDs
        const payload = {
          ...data,
          person_id: parseInt(data.person_id as any, 10),
          organization_id: parseInt(data.organization_id as any, 10),
        };
        await createPrimaryContact.mutateAsync(payload);
        showToast('Primary contact link established', 'success');
      }

      setIsSlideOverOpen(false);
    } catch (err: any) {
      showToast(err.response?.data?.error || err.message || 'Operation failed', 'error');
    }
  };

  // Delete Entity
  const handleDeleteEntity = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete entity ${name} (ID: ${id})?`)) return;
    try {
      await deleteEntity.mutateAsync(id);
      showToast('Entity deleted successfully', 'success');
      if (selectedEntityId === id) setSelectedEntityId(null);
    } catch (err: any) {
      showToast(err.response?.data?.error || err.message || 'Delete failed', 'error');
    }
  };

  // Delete Address
  const handleDeleteAddress = async (id: number, isPerson: boolean) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      if (isPerson) {
        await deletePAddress.mutateAsync(id);
      } else {
        await deleteOAddress.mutateAsync(id);
      }
      showToast('Address deleted', 'success');
    } catch (err: any) {
      showToast('Delete address failed', 'error');
    }
  };

  // Delete Contact
  const handleDeleteContact = async (id: number, isPerson: boolean) => {
    if (!window.confirm('Delete this contact details?')) return;
    try {
      if (isPerson) {
        await deletePContact.mutateAsync(id);
      } else {
        await deleteOContact.mutateAsync(id);
      }
      showToast('Contact details deleted', 'success');
    } catch (err: any) {
      showToast('Delete contact failed', 'error');
    }
  };

  // Delete Relationship
  const handleDeleteRelationship = async (id: number) => {
    if (!window.confirm('Remove relationship?')) return;
    try {
      await deleteRelationship.mutateAsync(id);
      showToast('Relationship removed', 'success');
    } catch (err: any) {
      showToast('Remove relationship failed', 'error');
    }
  };

  // Delete Primary Contact connection
  const handleDeletePrimaryContact = async (id: number) => {
    if (!window.confirm('Remove primary contact connection?')) return;
    try {
      await deletePrimaryContact.mutateAsync(id);
      showToast('Primary contact connection removed', 'success');
    } catch (err: any) {
      showToast('Remove connection failed', 'error');
    }
  };

  // Maps Entities with Names for displaying in table
  const mappedEntities = useMemo(() => {
    if (!entities) return [];
    return entities.map((ent) => {
      let name = `Entity #${ent.id}`;
      let detail = '';

      if (ent.entity_type === 'PERSON') {
        const p = people?.find((x) => x.entity_id === ent.id);
        if (p) {
          name = `${p.first_name} ${p.last_name}`;
          detail = `${p.gender || 'Unknown'}${p.date_of_birth ? `, DOB: ${p.date_of_birth.split('T')[0]}` : ''}`;
        }
      } else {
        const o = organizations?.find((x) => x.entity_id === ent.id);
        if (o) {
          name = o.legal_name;
          detail = `${o.organization_type} ${o.industry ? `[${o.industry}]` : ''}`;
        }
      }

      return {
        ...ent,
        name,
        detail,
      };
    });
  }, [entities, people, organizations]);

  // Filters Master List
  const filteredEntities = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return mappedEntities.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.entity_type.toLowerCase().includes(q) ||
        e.detail.toLowerCase().includes(q)
    );
  }, [mappedEntities, searchQuery]);

  // Selected Entity Details calculations
  const selectedDetails = useMemo(() => {
    if (!selectedEntityId || !entities) return null;
    const base = entities.find(e => e.id === selectedEntityId);
    if (!base) return null;

    const isPerson = base.entity_type === 'PERSON';
    let detailRecord: any = null;
    let addresses: any[] = [];
    let contacts: any[] = [];

    if (isPerson) {
      detailRecord = people?.find(p => p.entity_id === selectedEntityId);
      if (detailRecord) {
        addresses = personAddresses?.filter(a => a.person_id === detailRecord.id) || [];
        contacts = personContacts?.filter(c => c.person_id === detailRecord.id) || [];
      }
    } else {
      detailRecord = organizations?.find(o => o.entity_id === selectedEntityId);
      if (detailRecord) {
        addresses = orgAddresses?.filter(a => a.organization_id === detailRecord.id) || [];
        contacts = orgContacts?.filter(c => c.organization_id === detailRecord.id) || [];
      }
    }

    // Relationships linked to this base entity (where this is source or target)
    const entityRels = relationships?.filter(
      r => r.source_entity_id === selectedEntityId || r.target_entity_id === selectedEntityId
    ).map(r => {
      const isSource = r.source_entity_id === selectedEntityId;
      const peerId = isSource ? r.target_entity_id : r.source_entity_id;
      const peerBase = entities.find(e => e.id === peerId);
      let peerName = `Entity #${peerId}`;
      if (peerBase?.entity_type === 'PERSON') {
        const p = people?.find(x => x.entity_id === peerId);
        if (p) peerName = `${p.first_name} ${p.last_name} (Person)`;
      } else if (peerBase?.entity_type === 'ORGANIZATION') {
        const o = organizations?.find(x => x.entity_id === peerId);
        if (o) peerName = `${o.legal_name} (Org)`;
      }

      return {
        ...r,
        peerName,
        direction: isSource ? 'outgoing' : 'incoming',
      };
    }) || [];

    // Primary Contacts mapped to this entity
    let linkedPrimaryContacts: any[] = [];
    if (isPerson && detailRecord) {
      linkedPrimaryContacts = primaryContacts?.filter(pc => pc.person_id === detailRecord.id).map(pc => {
        const orgRecord = organizations?.find(o => o.id === pc.organization_id);
        const orgName = orgRecord ? orgRecord.legal_name : `Organization ID #${pc.organization_id}`;
        return {
          ...pc,
          peerName: orgName,
        };
      }) || [];
    } else if (!isPerson && detailRecord) {
      linkedPrimaryContacts = primaryContacts?.filter(pc => pc.organization_id === detailRecord.id).map(pc => {
        const personRecord = people?.find(p => p.id === pc.person_id);
        const personName = personRecord ? `${personRecord.first_name} ${personRecord.last_name}` : `Person ID #${pc.person_id}`;
        return {
          ...pc,
          peerName: personName,
        };
      }) || [];
    }

    return {
      base,
      isPerson,
      detailRecord,
      addresses,
      contacts,
      relationships: entityRels,
      primaryContacts: linkedPrimaryContacts,
    };
  }, [selectedEntityId, entities, people, organizations, personAddresses, orgAddresses, personContacts, orgContacts, relationships, primaryContacts]);

  const handleRetryConnection = () => {
    refetchHealth();
    refetchEntities();
    refetchPeople();
    refetchOrgs();
    refetchPAddrs();
    refetchOAddrs();
    refetchPContacts();
    refetchOContacts();
    refetchRels();
    refetchPrimaryContacts();
  };

  // Render Service Offline State
  if (isHealthError || healthData?.status !== 'UP') {
    return (
      <div className="flex h-[75vh] items-center justify-center">
        <ServiceOffline serviceName="Core" port={1706} onRetry={handleRetryConnection} />
      </div>
    );
  }

  const isLoading = entitiesLoading || peopleLoading || orgsLoading;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg backdrop-blur-md transition-all ${
            toast.type === 'success'
              ? 'border-emerald-500/20 bg-emerald-950/80 text-emerald-300'
              : 'border-red-500/20 bg-red-950/80 text-red-300'
          }`}
        >
          <span className="text-sm font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)} className="text-gray-400 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header and Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Database size={22} className="text-indigo-400" />
            Base Entity Setup & Management
          </h1>
          <p className="text-sm text-gray-500">
            Dedicated onboarding workflows for People and Organizations. Establish primary profile data before future modules bind transactions.
          </p>
        </div>
        <button
          onClick={handleOpenOnboard}
          testId="core-onboard-btn"
          className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 transition-all self-start sm:self-auto"
        >
          <Plus size={16} />
          Onboard Entity
        </button>
      </div>

      {/* Main Split Pane Layout (Table / Details Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Master Entity Table */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search bar */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
              <Search size={14} />
            </span>
            <input
              type="text"
              placeholder="Filter entities by name, type, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              testId="core-search-input"
              className="w-full rounded-lg border border-[#1a1c23] bg-[#0c0d12]/50 py-2 pl-9 pr-4 text-sm text-white placeholder-gray-500 backdrop-blur-sm transition-all focus:border-indigo-500/40 focus:outline-none"
            />
          </div>

          <div className="overflow-hidden rounded-xl border border-[#1a1c23] bg-[#0c0d12]/40 backdrop-blur-sm shadow-xl">
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="flex h-48 flex-col items-center justify-center gap-3 text-gray-500">
                  <RotateCcw className="animate-spin text-indigo-400" size={24} />
                  <span className="text-xs">Loading entities data...</span>
                </div>
              ) : filteredEntities.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center gap-2 text-gray-500">
                  <AlertTriangle size={24} className="text-gray-600" />
                  <span className="text-sm">No onboarded entities found.</span>
                </div>
              ) : (
                <table className="w-full border-collapse text-left text-sm text-gray-400">
                  <thead className="bg-[#13151a]/60 text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-[#1a1c23]">
                    <tr>
                      <th className="px-6 py-3">ID</th>
                      <th className="px-6 py-3">Entity Name</th>
                      <th className="px-6 py-3">Type</th>
                      <th className="px-6 py-3">Details / Info</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1a1c23]/60 bg-transparent">
                    {filteredEntities.map((row) => (
                      <tr
                        key={row.id}
                        onClick={() => row.id && setSelectedEntityId(row.id)}
                        testId={`core-entity-row-${row.id}`}
                        className={`cursor-pointer transition-colors ${
                          selectedEntityId === row.id
                            ? 'bg-indigo-600/10 text-indigo-300'
                            : 'hover:bg-[#13151a]/30'
                        }`}
                      >
                        <td className="whitespace-nowrap px-6 py-3.5 font-mono text-xs font-semibold text-gray-400">
                          {row.id}
                        </td>
                        <td className="px-6 py-3.5 font-semibold text-white">
                          {row.name}
                        </td>
                        <td className="whitespace-nowrap px-6 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border ${
                              row.entity_type === 'PERSON'
                                ? 'bg-purple-950/30 border-purple-500/20 text-purple-400'
                                : 'bg-blue-950/30 border-blue-500/20 text-blue-400'
                            }`}
                          >
                            {row.entity_type === 'PERSON' ? <User size={10} /> : <Building2 size={10} />}
                            {row.entity_type}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-xs text-gray-500 max-w-xs truncate">
                          {row.detail}
                        </td>
                        <td className="whitespace-nowrap px-6 py-3.5 text-right text-xs font-medium space-x-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => row.id && handleEditEntity(row.id)}
                            testId={`core-entity-edit-btn-${row.id}`}
                            className="rounded p-1 hover:bg-[#1a1c23] hover:text-white"
                            title="Edit Entity"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => row.id && handleDeleteEntity(row.id, row.name)}
                            testId={`core-entity-delete-btn-${row.id}`}
                            className="rounded p-1 hover:bg-[#2e1518] hover:text-red-400"
                            title="Delete Entity"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Entity Master-Detail Drawer/Panel */}
        <div className="lg:col-span-1 border border-[#1a1c23] bg-[#0c0d12]/80 backdrop-blur-sm rounded-xl p-5 shadow-xl space-y-6 max-h-[85vh] overflow-y-auto stable-gutter scroll-contain">
          {!selectedDetails ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500 space-y-3">
              <div className="h-10 w-10 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-600">
                <ChevronRight size={20} className="rotate-90 lg:rotate-0" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-400">No Entity Selected</p>
                <p className="text-xs text-gray-600 max-w-[200px] mt-1 leading-normal">
                  Select an onboarded entity from the table to manage properties, addresses, contacts, and relationships.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 text-left">
              {/* Profile Card Header */}
              <div className="flex justify-between items-start border-b border-[#1a1c23] pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white leading-snug">
                    {selectedDetails.detailRecord?.first_name 
                      ? `${selectedDetails.detailRecord.first_name} ${selectedDetails.detailRecord.last_name}`
                      : selectedDetails.detailRecord?.legal_name || `Entity #${selectedEntityId}`}
                  </h3>
                  <p className="text-xs text-indigo-400 font-mono mt-0.5 uppercase tracking-wider">
                    ID: {selectedEntityId} &bull; {selectedDetails.base.entity_type}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => selectedEntityId && handleEditEntity(selectedEntityId)}
                    testId="core-detail-edit-btn"
                    className="rounded bg-[#1a1c23] p-1 text-gray-400 hover:text-white hover:bg-gray-800"
                    title="Edit Profile"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    onClick={() => setSelectedEntityId(null)}
                    testId="core-detail-close-btn"
                    className="rounded bg-[#1a1c23] p-1 text-gray-400 hover:text-white hover:bg-gray-800"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>

              {/* Extended properties */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
                {selectedDetails.isPerson ? (
                  <>
                    <div>
                      <span className="text-gray-500 block text-3xs uppercase font-semibold">Preferred Name</span>
                      <span className="text-gray-300">{selectedDetails.detailRecord?.preferred_name || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-3xs uppercase font-semibold">Gender</span>
                      <span className="text-gray-300 font-semibold">{selectedDetails.detailRecord?.gender || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-3xs uppercase font-semibold">Date of Birth</span>
                      <span className="text-gray-300">{selectedDetails.detailRecord?.date_of_birth ? selectedDetails.detailRecord.date_of_birth.split('T')[0] : 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-3xs uppercase font-semibold">National ID</span>
                      <span className="text-gray-300 font-mono">{selectedDetails.detailRecord?.national_id || 'N/A'}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <span className="text-gray-500 block text-3xs uppercase font-semibold">Trade Name</span>
                      <span className="text-gray-300">{selectedDetails.detailRecord?.trade_name || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-3xs uppercase font-semibold">Org Type</span>
                      <span className="text-gray-300 font-semibold">{selectedDetails.detailRecord?.organization_type || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-3xs uppercase font-semibold">Reg Number</span>
                      <span className="text-gray-300 font-mono">{selectedDetails.detailRecord?.registration_number || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-3xs uppercase font-semibold">Tax ID</span>
                      <span className="text-gray-300 font-mono">{selectedDetails.detailRecord?.tax_identifier || 'N/A'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500 block text-3xs uppercase font-semibold">Website</span>
                      {selectedDetails.detailRecord?.website ? (
                        <a
                          href={selectedDetails.detailRecord.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline break-all"
                        >
                          {selectedDetails.detailRecord.website}
                        </a>
                      ) : (
                        <span className="text-gray-300">N/A</span>
                      )}
                    </div>
                  </>
                )}
                {selectedDetails.detailRecord?.notes && (
                  <div className="col-span-2 mt-1.5 pt-2 border-t border-gray-900">
                    <span className="text-gray-500 block mb-0.5 text-3xs uppercase font-semibold">Notes</span>
                    <p className="text-gray-400 italic bg-[#0c0d12] p-2 rounded border border-gray-900 leading-normal">
                      {selectedDetails.detailRecord.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Primary Contacts Section */}
              <div className="space-y-2.5 border-t border-gray-900 pt-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                    <User size={12} />
                    Primary Contacts / Orgs ({selectedDetails.primaryContacts.length})
                  </h4>
                  <button
                    onClick={() => handleOpenAddSubItem('primaryContact')}
                    testId="core-detail-add-primary-contact-btn"
                    className="text-2xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5"
                  >
                    <Plus size={10} /> Link
                  </button>
                </div>
                {selectedDetails.primaryContacts.length === 0 ? (
                  <p className="text-2xs text-gray-600 italic">No primary contact links recorded.</p>
                ) : (
                  <div className="space-y-1.5">
                    {selectedDetails.primaryContacts.map((pc) => (
                      <div
                        key={pc.id}
                        className="flex items-center justify-between rounded border border-gray-900 bg-[#0c0d12] p-2.5 text-xs text-gray-300 relative group/card"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-indigo-400 font-bold text-2xs uppercase bg-indigo-950/20 px-1 py-0.2 rounded border border-indigo-900/40">
                              {pc.role}
                            </span>
                            {pc.notes && <span className="text-3xs text-gray-500">({pc.notes})</span>}
                          </div>
                          <p className="text-2xs text-gray-200 mt-1">{pc.peerName}</p>
                        </div>
                        <button
                          onClick={() => pc.id && handleDeletePrimaryContact(pc.id)}
                          testId={`core-detail-delete-primary-contact-btn-${pc.id}`}
                          className="hidden group-hover/card:block text-gray-500 hover:text-red-400 rounded hover:bg-gray-800 p-0.5"
                          title="Remove link"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Linked Addresses Section */}
              <div className="space-y-2.5 border-t border-gray-900 pt-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                    <MapPin size={12} />
                    Linked Addresses ({selectedDetails.addresses.length})
                  </h4>
                  <button
                    onClick={() => handleOpenAddSubItem('address')}
                    testId="core-detail-add-address-btn"
                    className="text-2xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5"
                  >
                    <Plus size={10} /> Add
                  </button>
                </div>
                {selectedDetails.addresses.length === 0 ? (
                  <p className="text-2xs text-gray-600 italic">No addresses linked.</p>
                ) : (
                  <div className="space-y-1.5">
                    {selectedDetails.addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className="rounded border border-gray-900 bg-[#0c0d12] p-2.5 text-xs text-gray-300 relative group/card"
                      >
                        <button
                          onClick={() => addr.id && handleDeleteAddress(addr.id, selectedDetails.isPerson)}
                          testId={`core-detail-delete-address-btn-${addr.id}`}
                          className="absolute top-2 right-2 hidden group-hover/card:block text-gray-500 hover:text-red-400 rounded hover:bg-gray-800 p-0.5"
                          title="Remove address"
                        >
                          <Trash2 size={10} />
                        </button>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-2xs font-semibold text-indigo-400 uppercase font-mono bg-indigo-950/30 px-1 py-0.2 rounded border border-indigo-900/40">
                            {addr.address_type}
                          </span>
                          {addr.is_primary && (
                            <span className="text-3xs text-emerald-400 border border-emerald-500/20 bg-emerald-950/20 px-1 rounded uppercase tracking-wider">
                              Primary
                            </span>
                          )}
                        </div>
                        <p>{addr.address_line1}</p>
                        {addr.address_line2 && <p className="text-gray-500">{addr.address_line2}</p>}
                        <p className="text-gray-400 mt-0.5">
                          {addr.city}, {addr.state} {addr.postal_code} &bull; {addr.country}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Linked Contacts Section */}
              <div className="space-y-2.5 border-t border-gray-900 pt-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                    <Mail size={12} />
                    Contact Channels ({selectedDetails.contacts.length})
                  </h4>
                  <button
                    onClick={() => handleOpenAddSubItem('contact')}
                    testId="core-detail-add-contact-btn"
                    className="text-2xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5"
                  >
                    <Plus size={10} /> Add
                  </button>
                </div>
                {selectedDetails.contacts.length === 0 ? (
                  <p className="text-2xs text-gray-600 italic">No contact channels configured.</p>
                ) : (
                  <div className="space-y-1.5">
                    {selectedDetails.contacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-center justify-between rounded border border-gray-900 bg-[#0c0d12] p-2.5 text-xs text-gray-300 relative group/card"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-2xs uppercase text-indigo-400 bg-indigo-950/10 px-1 py-0.2 rounded">
                              {contact.contact_type}:
                            </span>
                            <span className="text-gray-200 font-semibold select-all">{contact.contact_value}</span>
                          </div>
                          {contact.notes && <p className="text-3xs text-gray-500 italic mt-0.5">{contact.notes}</p>}
                        </div>
                        <div className="flex items-center gap-1">
                          {contact.is_primary && (
                            <span className="text-[8px] border border-emerald-500/20 bg-emerald-950/20 px-1 py-0.2 text-emerald-400 rounded">
                              Primary
                            </span>
                          )}
                          <button
                            onClick={() => contact.id && handleDeleteContact(contact.id, selectedDetails.isPerson)}
                            testId={`core-detail-delete-contact-btn-${contact.id}`}
                            className="hidden group-hover/card:block text-gray-500 hover:text-red-400 rounded hover:bg-gray-800 p-0.5"
                            title="Remove contact"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Linked Relationships Section */}
              <div className="space-y-2.5 border-t border-gray-900 pt-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                    <Share2 size={12} />
                    Relationships ({selectedDetails.relationships.length})
                  </h4>
                  <button
                    onClick={() => handleOpenAddSubItem('relationship')}
                    testId="core-detail-add-relationship-btn"
                    className="text-2xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5"
                  >
                    <Plus size={10} /> Link
                  </button>
                </div>
                {selectedDetails.relationships.length === 0 ? (
                  <p className="text-2xs text-gray-600 italic">No relationships recorded.</p>
                ) : (
                  <div className="space-y-1.5">
                    {selectedDetails.relationships.map((rel) => (
                      <div
                        key={rel.id}
                        className="flex items-center justify-between rounded border border-gray-900 bg-[#0c0d12] p-2.5 text-xs text-gray-300 relative group/card"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-indigo-300">
                              {rel.relationship_type}
                            </span>
                            <span className="text-gray-400 text-3xs font-mono lowercase">
                              ({rel.direction})
                            </span>
                          </div>
                          <p className="text-2xs text-gray-200 mt-0.5">{rel.peerName}</p>
                        </div>
                        <button
                          onClick={() => rel.id && handleDeleteRelationship(rel.id)}
                          testId={`core-detail-delete-relationship-btn-${rel.id}`}
                          className="hidden group-hover/card:block text-gray-500 hover:text-red-400 rounded hover:bg-gray-800 p-0.5"
                          title="Remove link"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Slide-Over Drawer */}
      {isSlideOverOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsSlideOverOpen(false)} />
          <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
            <div className="w-screen max-w-md border-l border-[#1a1c23] bg-[#0c0d12] p-6 shadow-2xl flex flex-col h-full text-left">
              <div className="flex items-center justify-between border-b border-[#1a1c23] pb-4 mb-6">
                <h3 className="text-lg font-semibold text-white">
                  {slideOverType === 'entity' && (editingEntity ? (editingEntity.isPerson ? 'Edit Person' : 'Edit Organization') : 'Onboard Base Entity')}
                  {slideOverType === 'address' && 'Add Address'}
                  {slideOverType === 'contact' && 'Add Contact Channel'}
                  {slideOverType === 'relationship' && 'Link Relationship'}
                  {slideOverType === 'primaryContact' && 'Link Primary Contact'}
                </h3>
                <button
                  onClick={() => setIsSlideOverOpen(false)}
                  testId="core-drawer-close-btn"
                  className="rounded-lg p-1 text-gray-400 hover:bg-[#1a1c23] hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Content */}
              <div className="flex-1 overflow-y-auto pr-1 stable-gutter">
                {/* Onboard Entity Form */}
                {slideOverType === 'entity' && (
                  <div className="space-y-6">
                    {!editingEntity && (
                      <div className="flex gap-2 p-1 rounded-lg bg-[#13151a] border border-[#1a1c23]">
                        <button
                          type="button"
                          onClick={() => setOnboardType('PERSON')}
                          testId="onboard-toggle-person"
                          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded ${
                            onboardType === 'PERSON'
                              ? 'bg-indigo-600 text-white shadow'
                              : 'text-gray-400 hover:text-gray-200'
                          }`}
                        >
                          <User size={12} />
                          Person
                        </button>
                        <button
                          type="button"
                          onClick={() => setOnboardType('ORGANIZATION')}
                          testId="onboard-toggle-organization"
                          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded ${
                            onboardType === 'ORGANIZATION'
                              ? 'bg-indigo-600 text-white shadow'
                              : 'text-gray-400 hover:text-gray-200'
                          }`}
                        >
                          <Building2 size={12} />
                          Organization
                        </button>
                      </div>
                    )}

                    {onboardType === 'PERSON' && (
                      <form onSubmit={hPerson(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                              First Name *
                            </label>
                             <input
                              type="text"
                              {...regPerson('first_name')}
                              testId="person-form-first-name-input"
                              placeholder="Ravi"
                              className="w-full rounded-lg border border-[#1a1c23] bg-[#13151a] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-indigo-500/40 focus:outline-none"
                            />
                            {errPerson.first_name && <p className="mt-1 text-xs text-red-400">{errPerson.first_name.message}</p>}
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                              Last Name *
                            </label>
                            <input
                              type="text"
                              {...regPerson('last_name')}
                              testId="person-form-last-name-input"
                              placeholder="Doe"
                              className="w-full rounded-lg border border-[#1a1c23] bg-[#13151a] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-indigo-500/40 focus:outline-none"
                            />
                            {errPerson.last_name && <p className="mt-1 text-xs text-red-400">{errPerson.last_name.message}</p>}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                              Middle Name
                            </label>
                            <input
                              type="text"
                              {...regPerson('middle_name')}
                              testId="person-form-middle-name-input"
                              placeholder="Jaganathan"
                              className="w-full rounded-lg border border-[#1a1c23] bg-[#13151a] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-indigo-500/40 focus:outline-none"
                            />
                            {errPerson.middle_name && <p className="mt-1 text-xs text-red-400">{errPerson.middle_name.message}</p>}
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                              Preferred Name
                            </label>
                            <input
                              type="text"
                              {...regPerson('preferred_name')}
                              testId="person-form-preferred-name-input"
                              placeholder="Ravi"
                              className="w-full rounded-lg border border-[#1a1c23] bg-[#13151a] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-indigo-500/40 focus:outline-none"
                            />
                            {errPerson.preferred_name && <p className="mt-1 text-xs text-red-400">{errPerson.preferred_name.message}</p>}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                              Gender *
                            </label>
                            <select
                              {...regPerson('gender')}
                              testId="person-form-gender-select"
                              className="w-full rounded-lg border border-[#1a1c23] bg-[#13151a] px-3 py-2 text-sm text-white focus:border-indigo-500/40 focus:outline-none"
                            >
                              <option value="MALE">Male</option>
                              <option value="FEMALE">Female</option>
                              <option value="NON_BINARY">Non-Binary</option>
                              <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                            </select>
                            {errPerson.gender && <p className="mt-1 text-xs text-red-400">{errPerson.gender.message}</p>}
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                              Date of Birth
                            </label>
                            <input
                              type="date"
                              {...regPerson('date_of_birth')}
                              testId="person-form-dob-input"
                              className="w-full rounded-lg border border-[#1a1c23] bg-[#13151a] px-3 py-2 text-sm text-white focus:border-indigo-500/40 focus:outline-none"
                            />
                            {errPerson.date_of_birth && <p className="mt-1 text-xs text-red-400">{errPerson.date_of_birth.message}</p>}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                            National ID / SSN
                          </label>
                          <input
                            type="text"
                            {...regPerson('national_id')}
                            testId="person-form-national-id-input"
                            placeholder="e.g. SSN-123-45-6789"
                            className="w-full rounded-lg border border-[#1a1c23] bg-[#13151a] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-indigo-500/40 focus:outline-none font-mono"
                          />
                          {errPerson.national_id && <p className="mt-1 text-xs text-red-400">{errPerson.national_id.message}</p>}
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                            Profile Notes
                          </label>
                          <textarea
                            {...regPerson('notes')}
                            testId="person-form-notes-input"
                            placeholder="Add core descriptions or notes..."
                            rows={3}
                            className="w-full rounded-lg border border-[#1a1c23] bg-[#13151a] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-indigo-500/40 focus:outline-none resize-none"
                          />
                          {errPerson.notes && <p className="mt-1 text-xs text-red-400">{errPerson.notes.message}</p>}
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="p_active"
                            {...regPerson('is_active')}
                            testId="person-form-active-checkbox"
                            className="rounded border-[#1a1c23] bg-[#13151a] text-indigo-600 focus:ring-0"
                          />
                          <label htmlFor="p_active" className="text-sm text-gray-300">
                            Is Active
                          </label>
                        </div>

                        <div className="border-t border-[#1a1c23] pt-6 flex justify-end gap-3 mt-8">
                          <button
                            type="button"
                            onClick={() => setIsSlideOverOpen(false)}
                            testId="person-form-cancel-btn"
                            className="rounded-lg border border-[#1a1c23] hover:bg-[#13151a] px-4 py-2 text-sm text-gray-400 hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            testId="person-form-submit-btn"
                            className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/25"
                          >
                            {editingEntity ? 'Update Person' : 'Create Person'}
                          </button>
                        </div>
                      </form>
                    )}

                    {onboardType === 'ORGANIZATION' && (
                      <form onSubmit={hOrg(onSubmit, (errs) => console.error('Org form errors:', errs))} className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                            Legal Business Name *
                          </label>
                          <input
                            type="text"
                            {...regOrg('legal_name')}
                            testId="org-form-legal-name-input"
                            placeholder="e.g. HDFC Bank Limited"
                            className="w-full rounded-lg border border-[#1a1c23] bg-[#13151a] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-indigo-500/40 focus:outline-none"
                          />
                          {errOrg.legal_name && <p className="mt-1 text-xs text-red-400">{errOrg.legal_name.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                              Trade Name
                            </label>
                            <input
                              type="text"
                              {...regOrg('trade_name')}
                              placeholder="e.g. HDFC"
                              className="w-full rounded-lg border border-[#1a1c23] bg-[#13151a] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-indigo-500/40 focus:outline-none"
                            />
                            {errOrg.trade_name && <p className="mt-1 text-xs text-red-400">{errOrg.trade_name.message}</p>}
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                              Org Type *
                            </label>
                            <select
                              {...regOrg('organization_type')}
                              testId="org-form-type-select"
                              className="w-full rounded-lg border border-[#1a1c23] bg-[#13151a] px-3 py-2 text-sm text-white focus:border-indigo-500/40 focus:outline-none"
                            >
                              <option value="BANK">Bank / Financial Inst</option>
                              <option value="CORPORATION">Corporation</option>
                              <option value="LLC">LLC</option>
                              <option value="SOLE_PROPRIETORSHIP">Sole Proprietorship</option>
                              <option value="NON_PROFIT">Non-Profit</option>
                              <option value="PARTNERSHIP">Partnership</option>
                              <option value="HUF">HUF / Family Trust</option>
                            </select>
                            {errOrg.organization_type && <p className="mt-1 text-xs text-red-400">{errOrg.organization_type.message}</p>}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                              Reg Number
                            </label>
                            <input
                              type="text"
                              {...regOrg('registration_number')}
                              testId="org-form-reg-number-input"
                              placeholder="BANK-REG-001"
                              className="w-full rounded-lg border border-[#1a1c23] bg-[#13151a] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-indigo-500/40 focus:outline-none font-mono"
                            />
                            {errOrg.registration_number && <p className="mt-1 text-xs text-red-400">{errOrg.registration_number.message}</p>}
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                              Tax ID
                            </label>
                            <input
                              type="text"
                              {...regOrg('tax_identifier')}
                              testId="org-form-tax-id-input"
                              placeholder="TAX-BANK-001"
                              className="w-full rounded-lg border border-[#1a1c23] bg-[#13151a] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-indigo-500/40 focus:outline-none font-mono"
                            />
                            {errOrg.tax_identifier && <p className="mt-1 text-xs text-red-400">{errOrg.tax_identifier.message}</p>}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                              Industry Sector
                            </label>
                            <input
                              type="text"
                              {...regOrg('industry')}
                              testId="org-form-sector-input"
                              placeholder="e.g. FINANCE"
                              className="w-full rounded-lg border border-[#1a1c23] bg-[#13151a] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-indigo-500/40 focus:outline-none"
                            />
                            {errOrg.industry && <p className="mt-1 text-xs text-red-400">{errOrg.industry.message}</p>}
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                              Website URL
                            </label>
                            <input
                              type="text"
                              {...regOrg('website')}
                              testId="org-form-website-input"
                              placeholder="https://example.com"
                              className="w-full rounded-lg border border-[#1a1c23] bg-[#13151a] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-indigo-500/40 focus:outline-none"
                            />
                            {errOrg.website && <p className="mt-1 text-xs text-red-400">{errOrg.website.message}</p>}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                            Organization Notes
                          </label>
                          <textarea
                            {...regOrg('notes')}
                            testId="org-form-notes-input"
                            placeholder="Add organization descriptions..."
                            rows={3}
                            className="w-full rounded-lg border border-[#1a1c23] bg-[#13151a] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-indigo-500/40 focus:outline-none resize-none"
                          />
                          {errOrg.notes && <p className="mt-1 text-xs text-red-400">{errOrg.notes.message}</p>}
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="o_active"
                            {...regOrg('is_active')}
                            testId="org-form-active-checkbox"
                            className="rounded border-[#1a1c23] bg-[#13151a] text-indigo-600 focus:ring-0"
                          />
                          <label htmlFor="o_active" className="text-sm text-gray-300">
                            Is Active
                          </label>
                        </div>

                        <div className="border-t border-[#1a1c23] pt-6 flex justify-end gap-3 mt-8">
                          <button
                            type="button"
                            onClick={() => setIsSlideOverOpen(false)}
                            testId="org-form-cancel-btn"
                            className="rounded-lg border border-[#1a1c23] hover:bg-[#13151a] px-4 py-2 text-sm text-gray-400 hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            testId="org-form-submit-btn"
                            className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/25"
                          >
                            {editingEntity ? 'Update Organization' : 'Create Organization'}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                {/* Sub-item Address Form */}
                {slideOverType === 'address' && (
                  <form onSubmit={hAddr(onSubmit)} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                        Address Type
                      </label>
                      <select
                        {...regAddr('address_type')}
                        testId="address-form-type-select"
                        className="w-full rounded-lg border border-[#1a1c23] bg-[#13151a] px-3 py-2 text-sm text-white focus:border-indigo-500/40 focus:outline-none"
                      >
                        <option value="HOME">Home</option>
                        <option value="WORK">Work</option>
                        <option value="BILLING">Billing</option>
                        <option value="SHIPPING">Shipping</option>
                        <option value="MAILING">Mailing</option>
                        <option value="REGISTERED">Registered Office</option>
                        <option value="LEGAL">Legal Address</option>
                      </select>
                      {errAddr.address_type && <p className="mt-1 text-xs text-red-400">{errAddr.address_type.message}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                        Address Line 1 *
                      </label>
                      <input
                        type="text"
                        {...regAddr('address_line1')}
                        placeholder="123, Anna Nagar Main Road"
                        className="w-full rounded-lg border border-[#1a1c23] bg-[#13151a] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-indigo-500/40 focus:outline-none"
                      />
                      {errAddr.address_line1 && <p className="mt-1 text-xs text-red-400">{errAddr.address_line1.message}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                        Address Line 2
                      </label>
                      <input
                        type="text"
                        {...regAddr('address_line2')}
                        placeholder="Suite 100 / landmark details"
                        className="w-full rounded-lg border border-[#1a1c23] bg-[#13151a] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-indigo-500/40 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                          City *
                        </label>
                        <input
                          type="text"
                          {...regAddr('city')}
                          placeholder="Chennai"
                          className="w-full rounded-lg border border-[#1a1c23] bg-[#13151a] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-indigo-500/40 focus:outline-none"
                        />
                        {errAddr.city && <p className="mt-1 text-xs text-red-400">{errAddr.city.message}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                          State / Region *
                        </label>
                        <input
                          type="text"
                          {...regAddr('state')}
                          placeholder="Tamil Nadu"
                          className="w-full rounded-lg border border-[#1a1c23] bg-[#13151a] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-indigo-500/40 focus:outline-none"
                        />
                        {errAddr.state && <p className="mt-1 text-xs text-red-400">{errAddr.state.message}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                          Postal Code *
                        </label>
                        <input
                          type="text"
                          {...regAddr('postal_code')}
                          testId="address-form-postal-code-input"
                          placeholder="600040"
                          className="w-full rounded-lg border border-[#1a1c23] bg-[#13151a] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-indigo-500/40 focus:outline-none font-mono"
                        />
                        {errAddr.postal_code && <p className="mt-1 text-xs text-red-400">{errAddr.postal_code.message}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                          Country Code *
                        </label>
                        <input
                          type="text"
                          {...regAddr('country')}
                          testId="address-form-country-input"
                          placeholder="e.g. IND"
                          className="w-full rounded-lg border border-[#1a1c23] bg-[#13151a] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-indigo-500/40 focus:outline-none font-mono"
                        />
                        {errAddr.country && <p className="mt-1 text-xs text-red-400">{errAddr.country.message}</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="a_primary"
                          {...regAddr('is_primary')}
                          testId="address-form-primary-checkbox"
                          className="rounded border-[#1a1c23] bg-[#13151a] text-indigo-600 focus:ring-0"
                        />
                        <label htmlFor="a_primary" className="text-sm text-gray-300">
                          Is Primary
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="a_active"
                          {...regAddr('is_active')}
                          testId="address-form-active-checkbox"
                          className="rounded border-[#1a1c23] bg-[#13151a] text-indigo-600 focus:ring-0"
                        />
                        <label htmlFor="a_active" className="text-sm text-gray-300">
                          Is Active
                        </label>
                      </div>
                    </div>

                    <div className="border-t border-[#1a1c23] pt-6 flex justify-end gap-3 mt-8">
                      <button
                        type="button"
                        onClick={() => setIsSlideOverOpen(false)}
                        testId="address-form-cancel-btn"
                        className="rounded-lg border border-[#1a1c23] hover:bg-[#13151a] px-4 py-2 text-sm text-gray-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        testId="address-form-submit-btn"
                        className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-lg"
                      >
                        Save Address
                      </button>
                    </div>
                  </form>
                )}

                {/* Sub-item Contact Form */}
                {slideOverType === 'contact' && (
                  <form onSubmit={hContact(onSubmit)} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                        Contact Type
                      </label>
                      <select
                        {...regContact('contact_type')}
                        testId="contact-form-type-select"
                        className="w-full rounded-lg border border-[#1a1c23] bg-[#13151a] px-3 py-2 text-sm text-white focus:border-indigo-500/40 focus:outline-none"
                      >
                        <option value="MOBILE">Mobile Phone</option>
                        <option value="EMAIL">Email Address</option>
                        <option value="WHATSAPP">WhatsApp</option>
                        <option value="PHONE">Landline Phone</option>
                        <option value="TELEGRAM">Telegram</option>
                        <option value="WEBSITE">Website URL</option>
                        <option value="LINKEDIN">LinkedIn Profile</option>
                      </select>
                      {errContact.contact_type && <p className="mt-1 text-xs text-red-400">{errContact.contact_type.message}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                        Contact Value *
                      </label>
                      <input
                        type="text"
                        {...regContact('contact_value')}
                        testId="contact-form-value-input"
                        placeholder="e.g. +91-98765-43210 or email@domain.com"
                        className="w-full rounded-lg border border-[#1a1c23] bg-[#13151a] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-indigo-500/40 focus:outline-none"
                      />
                      {errContact.contact_value && <p className="mt-1 text-xs text-red-400">{errContact.contact_value.message}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                        Notes
                      </label>
                      <input
                        type="text"
                        {...regContact('notes')}
                        testId="contact-form-notes-input"
                        placeholder="Primary mobile / work email"
                        className="w-full rounded-lg border border-[#1a1c23] bg-[#13151a] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-indigo-500/40 focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="c_primary"
                          {...regContact('is_primary')}
                          testId="contact-form-primary-checkbox"
                          className="rounded border-[#1a1c23] bg-[#13151a] text-indigo-600 focus:ring-0"
                        />
                        <label htmlFor="c_primary" className="text-sm text-gray-300">
                          Is Primary
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="c_active"
                          {...regContact('is_active')}
                          testId="contact-form-active-checkbox"
                          className="rounded border-[#1a1c23] bg-[#13151a] text-indigo-600 focus:ring-0"
                        />
                        <label htmlFor="c_active" className="text-sm text-gray-300">
                          Is Active
                        </label>
                      </div>
                    </div>

                    <div className="border-t border-[#1a1c23] pt-6 flex justify-end gap-3 mt-8">
                      <button
                        type="button"
                        onClick={() => setIsSlideOverOpen(false)}
                        testId="contact-form-cancel-btn"
                        className="rounded-lg border border-[#1a1c23] hover:bg-[#13151a] px-4 py-2 text-sm text-gray-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        testId="contact-form-submit-btn"
                        className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-lg"
                      >
                        Save Contact
                      </button>
                    </div>
                  </form>
                )}

                {/* Sub-item Relationship Form */}
                {slideOverType === 'relationship' && (
                  <form onSubmit={hRel(onSubmit)} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                        Target Entity *
                      </label>
                      <select
                        {...regRel('target_entity_id')}
                        testId="relationship-form-target-select"
                        className="w-full rounded-lg border border-[#1a1c23] bg-[#13151a] px-3 py-2 text-sm text-white focus:border-indigo-500/40 focus:outline-none"
                      >
                        <option value="">Select Target Entity</option>
                        {mappedEntities
                          ?.filter((e) => e.id !== selectedEntityId)
                          ?.map((e) => (
                             <option key={e.id} value={e.id}>
                               {e.name} (ID: {e.id})
                             </option>
                          ))}
                      </select>
                      {errRel.target_entity_id && <p className="mt-1 text-xs text-red-400">{errRel.target_entity_id.message}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                        Relationship Type *
                      </label>
                      <select
                        {...regRel('relationship_type')}
                        testId="relationship-form-type-select"
                        className="w-full rounded-lg border border-[#1a1c23] bg-[#13151a] px-3 py-2 text-sm text-white focus:border-indigo-500/40 focus:outline-none"
                      >
                        <option value="SPOUSE">Spouse</option>
                        <option value="HUSBAND">Husband</option>
                        <option value="WIFE">Wife</option>
                        <option value="FATHER">Father</option>
                        <option value="MOTHER">Mother</option>
                        <option value="SON">Son</option>
                        <option value="DAUGHTER">Daughter</option>
                        <option value="SIBLING">Sibling</option>
                        <option value="BROTHER">Brother</option>
                        <option value="SISTER">Sister</option>
                        <option value="FRIEND">Friend</option>
                        <option value="EMPLOYER">Employer</option>
                        <option value="EMPLOYEE">Employee</option>
                        <option value="PARTNER">Business Partner</option>
                        <option value="MEMBER_ROLE">Member / Associate</option>
                      </select>
                      {errRel.relationship_type && <p className="mt-1 text-xs text-red-400">{errRel.relationship_type.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                          Start Date
                        </label>
                        <input
                          type="date"
                          {...regRel('start_date')}
                          testId="relationship-form-start-date-input"
                          className="w-full rounded-lg border border-[#1a1c23] bg-[#13151a] px-3 py-2 text-sm text-white focus:border-indigo-500/40 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                          End Date
                        </label>
                        <input
                          type="date"
                          {...regRel('end_date')}
                          testId="relationship-form-end-date-input"
                          className="w-full rounded-lg border border-[#1a1c23] bg-[#13151a] px-3 py-2 text-sm text-white focus:border-indigo-500/40 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="r_active"
                        {...regRel('is_active')}
                        testId="relationship-form-active-checkbox"
                        className="rounded border-[#1a1c23] bg-[#13151a] text-indigo-600 focus:ring-0"
                      />
                      <label htmlFor="r_active" className="text-sm text-gray-300">
                        Is Active
                      </label>
                    </div>

                    <div className="border-t border-[#1a1c23] pt-6 flex justify-end gap-3 mt-8">
                      <button
                        type="button"
                        onClick={() => setIsSlideOverOpen(false)}
                        testId="relationship-form-cancel-btn"
                        className="rounded-lg border border-[#1a1c23] hover:bg-[#13151a] px-4 py-2 text-sm text-gray-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        testId="relationship-form-submit-btn"
                        className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-lg"
                      >
                        Link Relationship
                      </button>
                    </div>
                  </form>
                )}

                {/* Sub-item Primary Contact Form */}
                {slideOverType === 'primaryContact' && (
                  <form onSubmit={hPrimContact(onSubmit)} className="space-y-4">
                    {selectedDetails?.isPerson ? (
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                          Organization *
                        </label>
                        <select
                          {...regPrimContact('organization_id')}
                          testId="primary-contact-form-org-select"
                          className="w-full rounded-lg border border-[#1a1c23] bg-[#13151a] px-3 py-2 text-sm text-white focus:border-indigo-500/40 focus:outline-none font-sans"
                        >
                          <option value="">Select Organization</option>
                          {organizations?.map((o) => (
                            <option key={o.id} value={o.id}>
                              {o.legal_name} (ID: {o.id})
                            </option>
                          ))}
                        </select>
                        {errPrimContact.organization_id && <p className="mt-1 text-xs text-red-400">{errPrimContact.organization_id.message}</p>}
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                          Person *
                        </label>
                        <select
                          {...regPrimContact('person_id')}
                          testId="primary-contact-form-person-select"
                          className="w-full rounded-lg border border-[#1a1c23] bg-[#13151a] px-3 py-2 text-sm text-white focus:border-indigo-500/40 focus:outline-none"
                        >
                          <option value="">Select Person</option>
                          {people?.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.first_name} {p.last_name} (ID: {p.id})
                            </option>
                          ))}
                        </select>
                        {errPrimContact.person_id && <p className="mt-1 text-xs text-red-400">{errPrimContact.person_id.message}</p>}
                      </div>
                    )}

                    {/* Hidden inputs to make sure we supply the correct IDs */}
                    {selectedDetails?.isPerson ? (
                      <input type="hidden" {...regPrimContact('person_id')} />
                    ) : (
                      <input type="hidden" {...regPrimContact('organization_id')} />
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                        Role / Designation *
                      </label>
                      <input
                        type="text"
                        {...regPrimContact('role')}
                        testId="primary-contact-form-role-input"
                        placeholder="e.g. KARTA, MANAGER, TRUSTEE"
                        className="w-full rounded-lg border border-[#1a1c23] bg-[#13151a] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-indigo-500/40 focus:outline-none font-sans"
                      />
                      {errPrimContact.role && <p className="mt-1 text-xs text-red-400">{errPrimContact.role.message}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                        Notes
                      </label>
                      <input
                        type="text"
                        {...regPrimContact('notes')}
                        testId="primary-contact-form-notes-input"
                        placeholder="e.g. Authorized signatory"
                        className="w-full rounded-lg border border-[#1a1c23] bg-[#13151a] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-indigo-500/40 focus:outline-none font-sans"
                      />
                      {errPrimContact.notes && <p className="mt-1 text-xs text-red-400">{errPrimContact.notes.message}</p>}
                    </div>

                    <div className="border-t border-[#1a1c23] pt-6 flex justify-end gap-3 mt-8">
                      <button
                        type="button"
                        onClick={() => setIsSlideOverOpen(false)}
                        testId="primary-contact-form-cancel-btn"
                        className="rounded-lg border border-[#1a1c23] hover:bg-[#13151a] px-4 py-2 text-sm text-gray-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        testId="primary-contact-form-submit-btn"
                        className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-lg"
                      >
                        Link Primary Contact
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
