import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useConfigHealth,
  useModules,
  useCreateModule,
  useUpdateModule,
  useDeleteModule,
  useTypes,
  useCreateType,
  useUpdateType,
  useDeleteType,
  useValues,
  useCreateValue,
  useUpdateValue,
  useDeleteValue,
  useDependencies,
  useCreateDependency,
  useUpdateDependency,
  useDeleteDependency,
} from '../api/config';
import { ServiceOffline } from '../components/ServiceOffline';
import type { CfgModule, CfgType, CfgValue, CfgDependency } from '../types/config';

// ── Validation Schemas using Zod ───────────────────────────────────────────

const moduleSchema = z.object({
  code: z.string().min(2, 'Code must be at least 2 chars').max(50, 'Max 50 chars'),
  name: z.string().min(2, 'Name must be at least 2 chars').max(100, 'Max 100 chars'),
  description: z.string().max(255, 'Max 255 chars').default(''),
  is_active: z.boolean().default(true),
});

const typeSchema = z.object({
  code: z.string().min(2, 'Code must be at least 2 chars').max(50, 'Max 50 chars'),
  module_code: z.string().min(1, 'Module Code is required'),
  name: z.string().min(2, 'Name must be at least 2 chars').max(100, 'Max 100 chars'),
  description: z.string().max(255, 'Max 255 chars').default(''),
  is_active: z.boolean().default(true),
});

const valueSchema = z.object({
  code: z.string().min(1, 'Code is required').max(100, 'Max 100 chars'),
  type_code: z.string().min(1, 'Type Code is required'),
  value: z.string().min(1, 'Value content is required'),
  description: z.string().max(255, 'Max 255 chars').default(''),
  display_order: z.number().int().default(1),
  is_active: z.boolean().default(true),
});

const dependencySchema = z.object({
  parent_value_code: z.string().min(1, 'Parent code is required'),
  child_value_code: z.string().min(1, 'Child code is required'),
  dependency_type: z.string().min(1, 'Dependency type is required'),
  is_active: z.boolean().default(true),
});

type TabType = 'modules' | 'types' | 'values' | 'dependencies';

// ── Figma-Twin UI Primitives ───────────────────────────────────────────────

function CodeTag({ value }: { value: string }) {
  return (
    <span className="font-mono text-xs text-cyan-300 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/60 font-semibold tracking-wide">
      {value}
    </span>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-medium tracking-wide ${
        active
          ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
          : 'bg-slate-800 text-slate-500 border border-slate-700'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-cyan-400' : 'bg-slate-600'}`} />
      {active ? 'ACTIVE' : 'INACTIVE'}
    </span>
  );
}

function DepTypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    REQUIRES: 'text-amber-400 bg-amber-950/50 border-amber-800',
    EXCLUDES: 'text-rose-400 bg-rose-950/50 border-rose-800',
    SUPERSEDES: 'text-violet-400 bg-violet-950/50 border-violet-800',
    DERIVED_FROM: 'text-emerald-400 bg-emerald-950/50 border-emerald-800',
    COMPATIBLE: 'text-cyan-400 bg-cyan-950/50 border-cyan-800',
  };
  return (
    <span
      className={`inline-flex font-mono text-xs px-2 py-0.5 rounded border ${
        colors[type] ?? 'text-slate-400 bg-slate-800 border-slate-700'
      }`}
    >
      {type}
    </span>
  );
}

function formatDate(d?: string) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  } catch {
    return d;
  }
}

// ── Toast Stack ────────────────────────────────────────────────────────────

interface ToastItem {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

function ToastStack({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: number) => void }) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded border shadow-xl text-xs font-medium pointer-events-auto transition-all ${
            t.type === 'success'
              ? 'bg-emerald-950 border-emerald-700 text-emerald-300'
              : t.type === 'error'
              ? 'bg-rose-950 border-rose-700 text-rose-300'
              : 'bg-slate-800 border-slate-600 text-slate-300'
          }`}
        >
          {t.type === 'success' && (
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          )}
          {t.type === 'error' && (
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {t.type === 'info' && (
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
              />
            </svg>
          )}
          <span>{t.message}</span>
          <button
            onClick={() => onDismiss(t.id)}
            className="ml-2 opacity-60 hover:opacity-100 transition-opacity text-base leading-none"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

// ── Step bar ───────────────────────────────────────────────────────────────

const STEPS: { id: TabType; label: string }[] = [
  { id: 'modules', label: 'Modules' },
  { id: 'types', label: 'Config Types' },
  { id: 'values', label: 'Config Values' },
  { id: 'dependencies', label: 'Dependencies' },
];

export const ConfigPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('modules');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);

  // Drilldown filter contexts
  const [filterModuleCode, setFilterModuleCode] = useState<string | null>(null);
  const [filterTypeCode, setFilterTypeCode] = useState<string | null>(null);
  const [filterValueCode, setFilterValueCode] = useState<string | null>(null);

  // Toast stack
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const pushToast = useCallback((message: string, type: ToastItem['type'] = 'success') => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);
  const dismissToast = useCallback((id: number) => {
    setToasts((p) => p.filter((t) => t.id !== id));
  }, []);

  // Health and Data Fetching
  const { data: healthData, isError: isHealthError, refetch: refetchHealth } = useConfigHealth();
  const { data: modules, isLoading: modulesLoading, refetch: refetchModules } = useModules();
  const { data: types, isLoading: typesLoading, refetch: refetchTypes } = useTypes();
  const { data: values, isLoading: valuesLoading, refetch: refetchValues } = useValues();
  const { data: dependencies, isLoading: depsLoading, refetch: refetchDeps } = useDependencies();

  // Mutations
  const createModule = useCreateModule();
  const updateModule = useUpdateModule();
  const deleteModule = useDeleteModule();

  const createType = useCreateType();
  const updateType = useUpdateType();
  const deleteType = useDeleteType();

  const createValue = useCreateValue();
  const updateValue = useUpdateValue();
  const deleteValue = useDeleteValue();

  const createDependency = useCreateDependency();
  const updateDependency = useUpdateDependency();
  const deleteDependency = useDeleteDependency();

  // React Hook Forms
  const {
    register: regModule,
    handleSubmit: hModule,
    reset: rModule,
    formState: { errors: errModule },
  } = useForm({ resolver: zodResolver(moduleSchema), defaultValues: { is_active: true } });

  const {
    register: regType,
    handleSubmit: hType,
    reset: rType,
    formState: { errors: errType },
  } = useForm({ resolver: zodResolver(typeSchema), defaultValues: { is_active: true } });

  const {
    register: regValue,
    handleSubmit: hValue,
    reset: rValue,
    formState: { errors: errValue },
  } = useForm({
    resolver: zodResolver(valueSchema),
    defaultValues: { is_active: true, display_order: 1 },
  });

  const {
    register: regDep,
    handleSubmit: hDep,
    reset: rDep,
    formState: { errors: errDep },
  } = useForm({
    resolver: zodResolver(dependencySchema),
    defaultValues: { is_active: true, dependency_type: 'REQUIRES' },
  });

  // Draft key & draft restoration
  const DRAFT_KEY = 'nexuserp_cfg_draft';

  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.tab) setActiveTab(parsed.tab);
        if (parsed.filterModuleCode) setFilterModuleCode(parsed.filterModuleCode);
        if (parsed.filterTypeCode) setFilterTypeCode(parsed.filterTypeCode);
        if (parsed.filterValueCode) setFilterValueCode(parsed.filterValueCode);
        const when = new Date(parsed.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        pushToast(`Draft session restored from ${when}`, 'info');
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveDraft = useCallback(() => {
    const draft = {
      tab: activeTab,
      filterModuleCode,
      filterTypeCode,
      filterValueCode,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    pushToast(`Draft saved for ${activeTab.toUpperCase()}`, 'success');
  }, [activeTab, filterModuleCode, filterTypeCode, filterValueCode, pushToast]);

  // Open Form Drawer for Create/Edit
  const handleOpenForm = (record: any = null) => {
    setEditingRecord(record);
    if (activeTab === 'modules') {
      rModule(record || { code: '', name: '', description: '', is_active: true });
    } else if (activeTab === 'types') {
      rType(
        record || {
          code: '',
          module_code: filterModuleCode || (modules && modules[0]?.code) || '',
          name: '',
          description: '',
          is_active: true,
        }
      );
    } else if (activeTab === 'values') {
      rValue(
        record || {
          code: '',
          type_code: filterTypeCode || (types && types[0]?.code) || '',
          value: '',
          description: '',
          display_order: 1,
          is_active: true,
        }
      );
    } else if (activeTab === 'dependencies') {
      rDep(
        record || {
          parent_value_code: filterValueCode || (values && values[0]?.code) || '',
          child_value_code: (values && values[1]?.code) || '',
          dependency_type: 'REQUIRES',
          is_active: true,
        }
      );
    }
    setIsDrawerOpen(true);
  };

  // Handle Form Submission
  const onSubmit = async (data: any) => {
    try {
      if (activeTab === 'modules') {
        if (editingRecord) {
          await updateModule.mutateAsync({ id: editingRecord.id, data });
          pushToast(`Module ${data.code} updated successfully`, 'success');
        } else {
          await createModule.mutateAsync(data);
          pushToast(`Module ${data.code} created successfully`, 'success');
        }
      } else if (activeTab === 'types') {
        if (editingRecord) {
          await updateType.mutateAsync({ id: editingRecord.id, data });
          pushToast(`Config Type ${data.code} updated successfully`, 'success');
        } else {
          await createType.mutateAsync(data);
          pushToast(`Config Type ${data.code} created successfully`, 'success');
        }
      } else if (activeTab === 'values') {
        data.display_order = parseInt(data.display_order as any, 10) || 1;
        if (editingRecord) {
          await updateValue.mutateAsync({ id: editingRecord.id, data });
          pushToast(`Config Value ${data.code} updated successfully`, 'success');
        } else {
          await createValue.mutateAsync(data);
          pushToast(`Config Value ${data.code} created successfully`, 'success');
        }
      } else if (activeTab === 'dependencies') {
        if (editingRecord) {
          await updateDependency.mutateAsync({ id: editingRecord.id, data });
          pushToast(`Dependency updated successfully`, 'success');
        } else {
          await createDependency.mutateAsync(data);
          pushToast(`Dependency created successfully`, 'success');
        }
      }
      setIsDrawerOpen(false);
      setEditingRecord(null);
    } catch (err: any) {
      const errMsg = err.response?.data?.error || err.message || 'Operation failed';
      pushToast(errMsg, 'error');
    }
  };

  // Delete Action with native confirmation dialog
  const handleDelete = async (id: number, code: string, entityType: TabType = activeTab) => {
    if (!window.confirm(`Are you sure you want to delete ${code || 'this record'}?`)) return;
    try {
      if (entityType === 'modules') {
        await deleteModule.mutateAsync(id);
      } else if (entityType === 'types') {
        await deleteType.mutateAsync(id);
      } else if (entityType === 'values') {
        await deleteValue.mutateAsync(id);
      } else if (entityType === 'dependencies') {
        await deleteDependency.mutateAsync(id);
      }
      pushToast('Record deleted successfully', 'success');
    } catch (err: any) {
      pushToast(err.response?.data?.error || err.message || 'Delete operation failed', 'error');
    }
  };

  // Filtered & Searched Data
  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (activeTab === 'modules' && modules) {
      return modules.filter(
        (m) =>
          m.code.toLowerCase().includes(q) ||
          m.name.toLowerCase().includes(q) ||
          (m.description && m.description.toLowerCase().includes(q))
      );
    }
    if (activeTab === 'types' && types) {
      return types.filter((t) => {
        const matchesModule = filterModuleCode ? t.module_code === filterModuleCode : true;
        const matchesSearch =
          t.code.toLowerCase().includes(q) ||
          t.name.toLowerCase().includes(q) ||
          t.module_code.toLowerCase().includes(q);
        return matchesModule && matchesSearch;
      });
    }
    if (activeTab === 'values' && values) {
      return values.filter((v) => {
        const matchesType = filterTypeCode ? v.type_code === filterTypeCode : true;
        const matchesSearch =
          v.code.toLowerCase().includes(q) ||
          v.value.toLowerCase().includes(q) ||
          v.type_code.toLowerCase().includes(q);
        return matchesType && matchesSearch;
      });
    }
    if (activeTab === 'dependencies' && dependencies) {
      return dependencies.filter((d) => {
        const matchesValue = filterValueCode
          ? d.parent_value_code === filterValueCode || d.child_value_code === filterValueCode
          : true;
        const matchesSearch =
          d.parent_value_code.toLowerCase().includes(q) ||
          d.child_value_code.toLowerCase().includes(q) ||
          d.dependency_type.toLowerCase().includes(q);
        return matchesValue && matchesSearch;
      });
    }
    return [];
  }, [activeTab, searchQuery, modules, types, values, dependencies, filterModuleCode, filterTypeCode, filterValueCode]);

  // Loading state
  const isLoading =
    (activeTab === 'modules' && modulesLoading) ||
    (activeTab === 'types' && typesLoading) ||
    (activeTab === 'values' && valuesLoading) ||
    (activeTab === 'dependencies' && depsLoading);

  // Render Service Offline State
  if (isHealthError || healthData?.status !== 'UP') {
    return (
      <div className="flex h-[75vh] items-center justify-center">
        <ServiceOffline
          serviceName="Config"
          port={1705}
          onRetry={() => {
            refetchHealth();
            refetchModules();
            refetchTypes();
            refetchValues();
            refetchDeps();
          }}
        />
      </div>
    );
  }

  const currentStepIdx = STEPS.findIndex((s) => s.id === activeTab);

  return (
    <div className="h-full overflow-auto px-6 pt-6 pb-8 space-y-5 text-slate-200">
      {/* Wizard Header Bar: Breadcrumb + Save Draft */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <button
            onClick={() => {
              setActiveTab('modules');
              setFilterModuleCode(null);
              setFilterTypeCode(null);
              setFilterValueCode(null);
            }}
            className={`hover:text-cyan-400 transition-colors ${
              activeTab === 'modules' ? 'text-slate-200 font-semibold' : 'text-slate-500'
            }`}
          >
            Modules
          </button>

          {filterModuleCode && (
            <>
              <span className="text-slate-700">›</span>
              <button
                onClick={() => {
                  setActiveTab('types');
                  setFilterTypeCode(null);
                  setFilterValueCode(null);
                }}
                className={`hover:text-cyan-400 transition-colors ${
                  activeTab === 'types' ? 'text-slate-200 font-semibold' : 'text-slate-500'
                }`}
              >
                Types in <span className="text-cyan-400 font-bold">{filterModuleCode}</span>
              </button>
            </>
          )}

          {filterTypeCode && (
            <>
              <span className="text-slate-700">›</span>
              <button
                onClick={() => {
                  setActiveTab('values');
                  setFilterValueCode(null);
                }}
                className={`hover:text-cyan-400 transition-colors ${
                  activeTab === 'values' ? 'text-slate-200 font-semibold' : 'text-slate-500'
                }`}
              >
                Values for <span className="text-cyan-400 font-bold">{filterTypeCode}</span>
              </button>
            </>
          )}

          {filterValueCode && (
            <>
              <span className="text-slate-700">›</span>
              <span className="text-slate-200 font-semibold">
                Deps of <span className="text-cyan-400 font-bold">{filterValueCode}</span>
              </span>
            </>
          )}
        </div>

        {/* Save Draft Button */}
        <button
          onClick={saveDraft}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-500 px-3 py-1.5 rounded transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Save as Draft
        </button>
      </div>

      {/* Main Page Header (must contain Configuration Control Plane in h1) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
            Configuration Control Plane
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            System parameter hierarchy, operational schemas, key-value enumerations, and validation dependencies.
          </p>
        </div>

        <button
          onClick={() => handleOpenForm()}
          testId="config-add-btn"
          testid="config-add-btn"
          className="flex items-center justify-center gap-1.5 rounded bg-cyan-500 hover:bg-cyan-400 px-3.5 py-1.5 text-xs font-semibold text-slate-900 shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <span className="text-base leading-none font-bold">+</span>
          Add{' '}
          {activeTab === 'modules'
            ? 'Module'
            : activeTab === 'types'
            ? 'Type'
            : activeTab === 'values'
            ? 'Value'
            : 'Dependency'}
        </button>
      </div>

      {/* Step Bar & Direct Tabs Selection */}
      <div className="flex items-center gap-1 border-b border-slate-800 pb-2 overflow-x-auto">
        {STEPS.map((s, idx) => {
          const isActive = activeTab === s.id;
          const isDone = idx < currentStepIdx;
          const count =
            s.id === 'modules'
              ? modules?.length || 0
              : s.id === 'types'
              ? types?.length || 0
              : s.id === 'values'
              ? values?.length || 0
              : dependencies?.length || 0;

          return (
            <button
              key={s.id}
              onClick={() => {
                setActiveTab(s.id);
                setSearchQuery('');
              }}
              testId={`config-tab-${s.id}`}
              testid={`config-tab-${s.id}`}
              className={`flex items-center gap-2 px-3.5 py-2 rounded text-xs font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shrink-0 ${
                  isActive
                    ? 'bg-cyan-500 text-slate-900'
                    : isDone
                    ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                    : 'bg-slate-800 text-slate-500 border border-slate-700'
                }`}
              >
                {idx + 1}
              </span>
              <span>{s.label}</span>
              <span className="font-mono text-[10px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-slate-400">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Filter & Context Filter Tags */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
            <svg fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder={`Search ${activeTab}…`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            testId="config-search-input"
            testid="config-search-input"
            className="w-full rounded bg-slate-900 border border-slate-800 py-1.5 pl-8 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600/40 focus:outline-none transition-colors"
          />
        </div>

        {/* Active contextual filter pill */}
        {(filterModuleCode || filterTypeCode || filterValueCode) && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-mono">Scoped by:</span>
            {filterModuleCode && (
              <span className="bg-cyan-950/60 border border-cyan-800 text-cyan-300 px-2 py-0.5 rounded font-mono text-[11px] flex items-center gap-1">
                Module: {filterModuleCode}
                <button
                  onClick={() => setFilterModuleCode(null)}
                  className="hover:text-white ml-1 font-bold"
                >
                  ×
                </button>
              </span>
            )}
            {filterTypeCode && (
              <span className="bg-cyan-950/60 border border-cyan-800 text-cyan-300 px-2 py-0.5 rounded font-mono text-[11px] flex items-center gap-1">
                Type: {filterTypeCode}
                <button
                  onClick={() => setFilterTypeCode(null)}
                  className="hover:text-white ml-1 font-bold"
                >
                  ×
                </button>
              </span>
            )}
            {filterValueCode && (
              <span className="bg-cyan-950/60 border border-cyan-800 text-cyan-300 px-2 py-0.5 rounded font-mono text-[11px] flex items-center gap-1">
                Value: {filterValueCode}
                <button
                  onClick={() => setFilterValueCode(null)}
                  className="hover:text-white ml-1 font-bold"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Table Canvas */}
      <div className="border border-slate-800 rounded overflow-hidden bg-[#111827] shadow-lg">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex h-48 flex-col items-center justify-center gap-2 text-slate-500">
              <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-mono">Loading {activeTab} data…</span>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center gap-2 text-slate-500">
              <span className="text-xs font-mono">No records found matching criteria.</span>
            </div>
          ) : (
            <table className="w-full border-collapse text-left">
              <thead className="bg-slate-900/80 border-b border-slate-800">
                <tr>
                  {activeTab === 'modules' && (
                    <>
                      <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-widest font-mono">Code</th>
                      <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-widest">Name</th>
                      <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-widest">Description</th>
                      <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-widest">Status</th>
                      <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-widest font-mono">Updated</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-widest">Actions</th>
                    </>
                  )}
                  {activeTab === 'types' && (
                    <>
                      <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-widest font-mono">Code</th>
                      <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-widest font-mono">Module</th>
                      <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-widest">Name</th>
                      <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-widest">Description</th>
                      <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-widest">Status</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-widest">Actions</th>
                    </>
                  )}
                  {activeTab === 'values' && (
                    <>
                      <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-widest font-mono">Code</th>
                      <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-widest font-mono">Type</th>
                      <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-widest">Value</th>
                      <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-widest font-mono">Order</th>
                      <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-widest">Description</th>
                      <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-widest">Status</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-widest">Actions</th>
                    </>
                  )}
                  {activeTab === 'dependencies' && (
                    <>
                      <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-widest font-mono">Parent Code</th>
                      <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-widest font-mono">Child Code</th>
                      <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-widest font-mono">Relation</th>
                      <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-widest">Status</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-widest">Actions</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {/* ── MODULES ── */}
                {activeTab === 'modules' &&
                  (filteredData as CfgModule[]).map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => {
                        setFilterModuleCode(row.code);
                        setActiveTab('types');
                      }}
                      className="group hover:bg-cyan-950/20 cursor-pointer transition-colors border-l-2 border-transparent hover:border-cyan-500"
                    >
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <CodeTag value={row.code} />
                      </td>
                      <td className="px-4 py-2.5 text-sm font-medium text-slate-200">{row.name}</td>
                      <td className="px-4 py-2.5 text-xs text-slate-400 max-w-xs truncate">{row.description}</td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <StatusBadge active={row.is_active} />
                      </td>
                      <td className="px-4 py-2.5 text-xs font-mono text-slate-500 whitespace-nowrap">
                        {formatDate(row.updated_at)}
                      </td>
                      <td
                        className="px-4 py-2.5 text-right whitespace-nowrap text-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenForm(row)}
                            testId={`config-edit-btn-${row.code}`}
                            testid={`config-edit-btn-${row.code}`}
                            className="px-2 py-1 text-slate-400 hover:text-cyan-400 hover:bg-cyan-950/40 rounded transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => row.id && handleDelete(row.id, row.code, 'modules')}
                            testId={`config-delete-btn-${row.code}`}
                            testid={`config-delete-btn-${row.code}`}
                            className="px-2 py-1 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                {/* ── TYPES ── */}
                {activeTab === 'types' &&
                  (filteredData as CfgType[]).map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => {
                        setFilterTypeCode(row.code);
                        setActiveTab('values');
                      }}
                      className="group hover:bg-cyan-950/20 cursor-pointer transition-colors border-l-2 border-transparent hover:border-cyan-500"
                    >
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <CodeTag value={row.code} />
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs text-cyan-400 whitespace-nowrap font-medium">
                        {row.module_code}
                      </td>
                      <td className="px-4 py-2.5 text-sm font-medium text-slate-200">{row.name}</td>
                      <td className="px-4 py-2.5 text-xs text-slate-400 max-w-xs truncate">{row.description}</td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <StatusBadge active={row.is_active} />
                      </td>
                      <td
                        className="px-4 py-2.5 text-right whitespace-nowrap text-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenForm(row)}
                            testId={`config-edit-btn-${row.code}`}
                            testid={`config-edit-btn-${row.code}`}
                            className="px-2 py-1 text-slate-400 hover:text-cyan-400 hover:bg-cyan-950/40 rounded transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => row.id && handleDelete(row.id, row.code, 'types')}
                            testId={`config-delete-btn-${row.code}`}
                            testid={`config-delete-btn-${row.code}`}
                            className="px-2 py-1 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                {/* ── VALUES ── */}
                {activeTab === 'values' &&
                  (filteredData as CfgValue[]).map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => {
                        setFilterValueCode(row.code);
                        setActiveTab('dependencies');
                      }}
                      className="group hover:bg-cyan-950/20 cursor-pointer transition-colors border-l-2 border-transparent hover:border-cyan-500"
                    >
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <CodeTag value={row.code} />
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs text-cyan-400 whitespace-nowrap font-medium">
                        {row.type_code}
                      </td>
                      <td className="px-4 py-2.5 text-sm font-medium text-slate-200">{row.value}</td>
                      <td className="px-4 py-2.5 text-xs font-mono text-slate-400">{row.display_order}</td>
                      <td className="px-4 py-2.5 text-xs text-slate-400 max-w-xs truncate">{row.description}</td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <StatusBadge active={row.is_active} />
                      </td>
                      <td
                        className="px-4 py-2.5 text-right whitespace-nowrap text-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenForm(row)}
                            testId={`config-edit-btn-${row.code}`}
                            testid={`config-edit-btn-${row.code}`}
                            className="px-2 py-1 text-slate-400 hover:text-cyan-400 hover:bg-cyan-950/40 rounded transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => row.id && handleDelete(row.id, row.code, 'values')}
                            testId={`config-delete-btn-${row.code}`}
                            testid={`config-delete-btn-${row.code}`}
                            className="px-2 py-1 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                {/* ── DEPENDENCIES ── */}
                {activeTab === 'dependencies' &&
                  (filteredData as CfgDependency[]).map((row) => (
                    <tr key={row.id} className="group hover:bg-cyan-950/20 transition-colors">
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <CodeTag value={row.parent_value_code} />
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <CodeTag value={row.child_value_code} />
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <DepTypeBadge type={row.dependency_type} />
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <StatusBadge active={row.is_active} />
                      </td>
                      <td className="px-4 py-2.5 text-right whitespace-nowrap text-xs">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenForm(row)}
                            testId={`config-edit-btn-${row.parent_value_code}-${row.child_value_code}`}
                            testid={`config-edit-btn-${row.parent_value_code}-${row.child_value_code}`}
                            className="px-2 py-1 text-slate-400 hover:text-cyan-400 hover:bg-cyan-950/40 rounded transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              row.id &&
                              handleDelete(row.id, `${row.parent_value_code} -> ${row.child_value_code}`, 'dependencies')
                            }
                            testId={`config-delete-btn-${row.parent_value_code}-${row.child_value_code}`}
                            testid={`config-delete-btn-${row.parent_value_code}-${row.child_value_code}`}
                            className="px-2 py-1 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Slide-over Form Drawer (with test-ids matching config.spec.ts) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
            <div className="w-screen max-w-md border-l border-slate-700 bg-[#111827] p-6 shadow-2xl flex flex-col h-full text-left text-slate-200">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-700 pb-4 mb-6">
                <h3 className="text-sm font-semibold text-slate-100 tracking-wide uppercase font-mono">
                  {editingRecord ? 'Edit' : 'Create'}{' '}
                  {activeTab === 'modules'
                    ? 'Module'
                    : activeTab === 'types'
                    ? 'Config Type'
                    : activeTab === 'values'
                    ? 'Config Value'
                    : 'Dependency'}
                </h3>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  testId="config-drawer-close-btn"
                  testid="config-drawer-close-btn"
                  className="text-slate-400 hover:text-white text-xl leading-none"
                >
                  ×
                </button>
              </div>

              {/* Drawer Forms */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-4">
                {/* 1. MODULE FORM */}
                {activeTab === 'modules' && (
                  <form onSubmit={hModule(onSubmit)} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 font-mono">
                        Module Code
                      </label>
                      <input
                        type="text"
                        disabled={!!editingRecord}
                        {...regModule('code')}
                        testId="module-form-code-input"
                        testid="module-form-code-input"
                        placeholder="e.g. HR"
                        className="w-full rounded bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-slate-200 font-mono focus:border-cyan-600 focus:outline-none disabled:opacity-50"
                      />
                      {errModule.code && <p className="mt-1 text-xs text-rose-400">{errModule.code.message}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 font-mono">
                        Name
                      </label>
                      <input
                        type="text"
                        {...regModule('name')}
                        testId="module-form-name-input"
                        testid="module-form-name-input"
                        placeholder="e.g. Human Resources"
                        className="w-full rounded bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-slate-200 focus:border-cyan-600 focus:outline-none"
                      />
                      {errModule.name && <p className="mt-1 text-xs text-rose-400">{errModule.name.message}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 font-mono">
                        Description
                      </label>
                      <textarea
                        {...regModule('description')}
                        testId="module-form-desc-input"
                        testid="module-form-desc-input"
                        placeholder="Brief operational description…"
                        rows={3}
                        className="w-full rounded bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-slate-200 focus:border-cyan-600 focus:outline-none resize-none"
                      />
                      {errModule.description && (
                        <p className="mt-1 text-xs text-rose-400">{errModule.description.message}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="mod_active"
                        {...regModule('is_active')}
                        testId="module-form-active-checkbox"
                        testid="module-form-active-checkbox"
                        className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                      />
                      <label htmlFor="mod_active" className="text-xs text-slate-300 font-medium">
                        Active
                      </label>
                    </div>

                    <div className="border-t border-slate-700 pt-5 flex justify-end gap-2 mt-8">
                      <button
                        type="button"
                        onClick={() => setIsDrawerOpen(false)}
                        testId="config-drawer-cancel-btn"
                        testid="config-drawer-cancel-btn"
                        className="rounded border border-slate-700 hover:border-slate-500 px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        testId="config-drawer-submit-btn"
                        testid="config-drawer-submit-btn"
                        className="rounded bg-cyan-500 hover:bg-cyan-400 px-4 py-1.5 text-xs font-semibold text-slate-900 transition-colors"
                      >
                        {editingRecord ? 'Save Changes' : 'Create Module'}
                      </button>
                    </div>
                  </form>
                )}

                {/* 2. TYPE FORM */}
                {activeTab === 'types' && (
                  <form onSubmit={hType(onSubmit)} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 font-mono">
                        Config Type Code
                      </label>
                      <input
                        type="text"
                        disabled={!!editingRecord}
                        {...regType('code')}
                        testId="type-form-code-input"
                        testid="type-form-code-input"
                        placeholder="e.g. EMP_STATUS"
                        className="w-full rounded bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-slate-200 font-mono focus:border-cyan-600 focus:outline-none disabled:opacity-50"
                      />
                      {errType.code && <p className="mt-1 text-xs text-rose-400">{errType.code.message}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 font-mono">
                        Module Code
                      </label>
                      <select
                        {...regType('module_code')}
                        testId="type-form-module-select"
                        testid="type-form-module-select"
                        className="w-full rounded bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-slate-200 focus:border-cyan-600 focus:outline-none"
                      >
                        <option value="">Select a Module</option>
                        {modules?.map((m) => (
                          <option key={m.code} value={m.code}>
                            {m.name} ({m.code})
                          </option>
                        ))}
                      </select>
                      {errType.module_code && (
                        <p className="mt-1 text-xs text-rose-400">{errType.module_code.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 font-mono">
                        Name
                      </label>
                      <input
                        type="text"
                        {...regType('name')}
                        testId="type-form-name-input"
                        testid="type-form-name-input"
                        placeholder="e.g. Employee Status"
                        className="w-full rounded bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-slate-200 focus:border-cyan-600 focus:outline-none"
                      />
                      {errType.name && <p className="mt-1 text-xs text-rose-400">{errType.name.message}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 font-mono">
                        Description
                      </label>
                      <textarea
                        {...regType('description')}
                        testId="type-form-desc-input"
                        testid="type-form-desc-input"
                        placeholder="Classification details…"
                        rows={3}
                        className="w-full rounded bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-slate-200 focus:border-cyan-600 focus:outline-none resize-none"
                      />
                      {errType.description && (
                        <p className="mt-1 text-xs text-rose-400">{errType.description.message}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="typ_active"
                        {...regType('is_active')}
                        testId="type-form-active-checkbox"
                        testid="type-form-active-checkbox"
                        className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                      />
                      <label htmlFor="typ_active" className="text-xs text-slate-300 font-medium">
                        Active
                      </label>
                    </div>

                    <div className="border-t border-slate-700 pt-5 flex justify-end gap-2 mt-8">
                      <button
                        type="button"
                        onClick={() => setIsDrawerOpen(false)}
                        testId="config-drawer-cancel-btn"
                        testid="config-drawer-cancel-btn"
                        className="rounded border border-slate-700 hover:border-slate-500 px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        testId="config-drawer-submit-btn"
                        testid="config-drawer-submit-btn"
                        className="rounded bg-cyan-500 hover:bg-cyan-400 px-4 py-1.5 text-xs font-semibold text-slate-900 transition-colors"
                      >
                        {editingRecord ? 'Save Changes' : 'Create Type'}
                      </button>
                    </div>
                  </form>
                )}

                {/* 3. VALUE FORM */}
                {activeTab === 'values' && (
                  <form onSubmit={hValue(onSubmit)} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 font-mono">
                        Config Value Code
                      </label>
                      <input
                        type="text"
                        disabled={!!editingRecord}
                        {...regValue('code')}
                        testId="value-form-code-input"
                        testid="value-form-code-input"
                        placeholder="e.g. ACTIVE"
                        className="w-full rounded bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-slate-200 font-mono focus:border-cyan-600 focus:outline-none disabled:opacity-50"
                      />
                      {errValue.code && <p className="mt-1 text-xs text-rose-400">{errValue.code.message}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 font-mono">
                        Config Type Code
                      </label>
                      <select
                        {...regValue('type_code')}
                        testId="value-form-type-select"
                        testid="value-form-type-select"
                        className="w-full rounded bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-slate-200 focus:border-cyan-600 focus:outline-none"
                      >
                        <option value="">Select a Type</option>
                        {types?.map((t) => (
                          <option key={t.code} value={t.code}>
                            {t.name} ({t.code})
                          </option>
                        ))}
                      </select>
                      {errValue.type_code && (
                        <p className="mt-1 text-xs text-rose-400">{errValue.type_code.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 font-mono">
                        Value Content / Label
                      </label>
                      <input
                        type="text"
                        {...regValue('value')}
                        testId="value-form-value-input"
                        testid="value-form-value-input"
                        placeholder="e.g. Active Employee"
                        className="w-full rounded bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-slate-200 focus:border-cyan-600 focus:outline-none"
                      />
                      {errValue.value && <p className="mt-1 text-xs text-rose-400">{errValue.value.message}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 font-mono">
                        Description
                      </label>
                      <textarea
                        {...regValue('description')}
                        testId="value-form-desc-input"
                        testid="value-form-desc-input"
                        placeholder="Value definition…"
                        rows={3}
                        className="w-full rounded bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-slate-200 focus:border-cyan-600 focus:outline-none resize-none"
                      />
                      {errValue.description && (
                        <p className="mt-1 text-xs text-rose-400">{errValue.description.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 font-mono">
                        Display Order
                      </label>
                      <input
                        type="number"
                        {...regValue('display_order', { valueAsNumber: true })}
                        testId="value-form-order-input"
                        testid="value-form-order-input"
                        placeholder="1"
                        className="w-full rounded bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-slate-200 font-mono focus:border-cyan-600 focus:outline-none"
                      />
                      {errValue.display_order && (
                        <p className="mt-1 text-xs text-rose-400">{errValue.display_order.message}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="val_active"
                        {...regValue('is_active')}
                        testId="value-form-active-checkbox"
                        testid="value-form-active-checkbox"
                        className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                      />
                      <label htmlFor="val_active" className="text-xs text-slate-300 font-medium">
                        Active
                      </label>
                    </div>

                    <div className="border-t border-slate-700 pt-5 flex justify-end gap-2 mt-8">
                      <button
                        type="button"
                        onClick={() => setIsDrawerOpen(false)}
                        testId="config-drawer-cancel-btn"
                        testid="config-drawer-cancel-btn"
                        className="rounded border border-slate-700 hover:border-slate-500 px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        testId="config-drawer-submit-btn"
                        testid="config-drawer-submit-btn"
                        className="rounded bg-cyan-500 hover:bg-cyan-400 px-4 py-1.5 text-xs font-semibold text-slate-900 transition-colors"
                      >
                        {editingRecord ? 'Save Changes' : 'Create Value'}
                      </button>
                    </div>
                  </form>
                )}

                {/* 4. DEPENDENCIES FORM */}
                {activeTab === 'dependencies' && (
                  <form onSubmit={hDep(onSubmit)} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 font-mono">
                        Parent Value Code
                      </label>
                      <select
                        {...regDep('parent_value_code')}
                        testId="dep-form-parent-select"
                        testid="dep-form-parent-select"
                        className="w-full rounded bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-slate-200 focus:border-cyan-600 focus:outline-none"
                      >
                        <option value="">Select Parent Value</option>
                        {values?.map((v) => (
                          <option key={v.code} value={v.code}>
                            {v.value} ({v.code}) [{v.type_code}]
                          </option>
                        ))}
                      </select>
                      {errDep.parent_value_code && (
                        <p className="mt-1 text-xs text-rose-400">{errDep.parent_value_code.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 font-mono">
                        Child Value Code
                      </label>
                      <select
                        {...regDep('child_value_code')}
                        testId="dep-form-child-select"
                        testid="dep-form-child-select"
                        className="w-full rounded bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-slate-200 focus:border-cyan-600 focus:outline-none"
                      >
                        <option value="">Select Child Value</option>
                        {values?.map((v) => (
                          <option key={v.code} value={v.code}>
                            {v.value} ({v.code}) [{v.type_code}]
                          </option>
                        ))}
                      </select>
                      {errDep.child_value_code && (
                        <p className="mt-1 text-xs text-rose-400">{errDep.child_value_code.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 font-mono">
                        Dependency Type
                      </label>
                      <input
                        type="text"
                        {...regDep('dependency_type')}
                        testId="dep-form-type-input"
                        testid="dep-form-type-input"
                        placeholder="e.g. REQUIRES, EXCLUDES, COMPATIBLE"
                        className="w-full rounded bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-slate-200 font-mono focus:border-cyan-600 focus:outline-none"
                      />
                      {errDep.dependency_type && (
                        <p className="mt-1 text-xs text-rose-400">{errDep.dependency_type.message}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="dep_active"
                        {...regDep('is_active')}
                        testId="dep-form-active-checkbox"
                        testid="dep-form-active-checkbox"
                        className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                      />
                      <label htmlFor="dep_active" className="text-xs text-slate-300 font-medium">
                        Active
                      </label>
                    </div>

                    <div className="border-t border-slate-700 pt-5 flex justify-end gap-2 mt-8">
                      <button
                        type="button"
                        onClick={() => setIsDrawerOpen(false)}
                        testId="config-drawer-cancel-btn"
                        testid="config-drawer-cancel-btn"
                        className="rounded border border-slate-700 hover:border-slate-500 px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        testId="config-drawer-submit-btn"
                        testid="config-drawer-submit-btn"
                        className="rounded bg-cyan-500 hover:bg-cyan-400 px-4 py-1.5 text-xs font-semibold text-slate-900 transition-colors"
                      >
                        {editingRecord ? 'Save Changes' : 'Create Dependency'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification Stack */}
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};
