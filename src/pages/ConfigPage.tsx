import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  Sliders,
  Layers,
  FileText,
  GitCommit,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
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

// ----------------------------------------------------
// Validation Schemas using Zod
// ----------------------------------------------------
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

export const ConfigPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('modules');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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

  // Toast helper
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Forms
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
  } = useForm({ resolver: zodResolver(valueSchema), defaultValues: { is_active: true, display_order: 1 } });

  const {
    register: regDep,
    handleSubmit: hDep,
    reset: rDep,
    formState: { errors: errDep },
  } = useForm({ resolver: zodResolver(dependencySchema), defaultValues: { is_active: true } });

  // Open Form Slideover for Create/Edit
  const handleOpenForm = (record: any = null) => {
    setEditingRecord(record);
    if (activeTab === 'modules') {
      rModule(record || { code: '', name: '', description: '', is_active: true });
    } else if (activeTab === 'types') {
      rType(record || { code: '', module_code: '', name: '', description: '', is_active: true });
    } else if (activeTab === 'values') {
      rValue(record || { code: '', type_code: '', value: '', description: '', display_order: 1, is_active: true });
    } else if (activeTab === 'dependencies') {
      rDep(record || { parent_value_code: '', child_value_code: '', dependency_type: 'REQUIRES', is_active: true });
    }
    setIsSlideOverOpen(true);
  };

  // Handle Form Submission
  const onSubmit = async (data: any) => {
    try {
      if (activeTab === 'modules') {
        if (editingRecord) {
          await updateModule.mutateAsync({ id: editingRecord.id, data });
          showToast(`Module ${data.code} updated successfully`, 'success');
        } else {
          await createModule.mutateAsync(data);
          showToast(`Module ${data.code} created successfully`, 'success');
        }
      } else if (activeTab === 'types') {
        if (editingRecord) {
          await updateType.mutateAsync({ id: editingRecord.id, data });
          showToast(`Config Type ${data.code} updated successfully`, 'success');
        } else {
          await createType.mutateAsync(data);
          showToast(`Config Type ${data.code} created successfully`, 'success');
        }
      } else if (activeTab === 'values') {
        // Ensure display_order is parsed as int
        data.display_order = parseInt(data.display_order as any, 10) || 1;
        if (editingRecord) {
          await updateValue.mutateAsync({ id: editingRecord.id, data });
          showToast(`Config Value ${data.code} updated successfully`, 'success');
        } else {
          await createValue.mutateAsync(data);
          showToast(`Config Value ${data.code} created successfully`, 'success');
        }
      } else if (activeTab === 'dependencies') {
        if (editingRecord) {
          await updateDependency.mutateAsync({ id: editingRecord.id, data });
          showToast(`Dependency updated successfully`, 'success');
        } else {
          await createDependency.mutateAsync(data);
          showToast(`Dependency created successfully`, 'success');
        }
      }
      setIsSlideOverOpen(false);
      setEditingRecord(null);
    } catch (err: any) {
      const errMsg = err.response?.data?.error || err.message || 'Operation failed';
      showToast(errMsg, 'error');
    }
  };

  // Delete Action
  const handleDelete = async (id: number, code: string) => {
    if (!window.confirm(`Are you sure you want to delete ${code || 'this record'}?`)) return;
    try {
      if (activeTab === 'modules') {
        await deleteModule.mutateAsync(id);
      } else if (activeTab === 'types') {
        await deleteType.mutateAsync(id);
      } else if (activeTab === 'values') {
        await deleteValue.mutateAsync(id);
      } else if (activeTab === 'dependencies') {
        await deleteDependency.mutateAsync(id);
      }
      showToast('Record soft-deleted successfully', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.error || err.message || 'Soft delete failed', 'error');
    }
  };

  // Tab Filtering & Search
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
      return types.filter(
        (t) =>
          t.code.toLowerCase().includes(q) ||
          t.name.toLowerCase().includes(q) ||
          t.module_code.toLowerCase().includes(q)
      );
    }
    if (activeTab === 'values' && values) {
      return values.filter(
        (v) =>
          v.code.toLowerCase().includes(q) ||
          v.value.toLowerCase().includes(q) ||
          v.type_code.toLowerCase().includes(q)
      );
    }
    if (activeTab === 'dependencies' && dependencies) {
      return dependencies.filter(
        (d) =>
          d.parent_value_code.toLowerCase().includes(q) ||
          d.child_value_code.toLowerCase().includes(q) ||
          d.dependency_type.toLowerCase().includes(q)
      );
    }
    return [];
  }, [activeTab, searchQuery, modules, types, values, dependencies]);

  // Handler for retry
  const handleRetryConnection = () => {
    refetchHealth();
    refetchModules();
    refetchTypes();
    refetchValues();
    refetchDeps();
  };

  // Render Service Offline State
  if (isHealthError || healthData?.status !== 'UP') {
    return (
      <div className="flex h-[75vh] items-center justify-center">
        <ServiceOffline serviceName="Config" port={1705} onRetry={handleRetryConnection} />
      </div>
    );
  }

  const isLoading =
    (activeTab === 'modules' && modulesLoading) ||
    (activeTab === 'types' && typesLoading) ||
    (activeTab === 'values' && valuesLoading) ||
    (activeTab === 'dependencies' && depsLoading);

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
            <Sliders size={22} className="text-purple-400" />
            Configuration Control Plane
          </h1>
          <p className="text-sm text-gray-500">
            CRUD admin panel for modules, standard operational config types, parameter keys, and lifecycle rules.
          </p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          testId="config-add-btn"
          className="flex items-center justify-center gap-2 rounded-lg bg-purple-600 hover:bg-purple-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/35 transition-all self-start sm:self-auto"
        >
          <Plus size={16} />
          Add {activeTab === 'modules' ? 'Module' : activeTab === 'types' ? 'Type' : activeTab === 'values' ? 'Value' : 'Dependency'}
        </button>
      </div>

      {/* Inner Navigation Tabs */}
      <div className="flex border-b border-[#1a1c23] gap-2 overflow-x-auto pb-px">
        {[
          { id: 'modules', label: 'Modules', icon: Layers, count: modules?.length || 0 },
          { id: 'types', label: 'Config Types', icon: Sliders, count: types?.length || 0 },
          { id: 'values', label: 'Config Values', icon: FileText, count: values?.length || 0 },
          { id: 'dependencies', label: 'Dependencies', icon: GitCommit, count: dependencies?.length || 0 },
        ].map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as TabType);
                setSearchQuery('');
              }}
              testId={`config-tab-${tab.id}`}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-all whitespace-nowrap -mb-px ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-400 bg-purple-500/5'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <TabIcon size={16} />
              <span>{tab.label}</span>
              <span className="rounded bg-[#1a1c23] border border-gray-800 px-1.5 py-0.5 text-xs text-gray-400 font-mono">
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Filter Bar */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
          <Search size={14} />
        </span>
        <input
          type="text"
          placeholder={`Search ${activeTab}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          testId="config-search-input"
          className="w-full rounded-lg border border-[#1a1c23] bg-[#0c0d12]/50 py-2 pl-9 pr-4 text-sm text-white placeholder-gray-500 backdrop-blur-sm transition-all focus:border-purple-500/40 focus:outline-none"
        />
      </div>

      {/* Data Table */}
      <div className="overflow-hidden rounded-xl border border-[#1a1c23] bg-[#0c0d12]/40 backdrop-blur-sm shadow-xl">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex h-48 flex-col items-center justify-center gap-3 text-gray-500">
              <RotateCcw className="animate-spin text-purple-400" size={24} />
              <span className="text-xs">Loading {activeTab} data...</span>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center gap-2 text-gray-500">
              <AlertTriangle size={24} className="text-gray-600" />
              <span className="text-sm">No records found matching search queries.</span>
            </div>
          ) : (
            <table className="w-full border-collapse text-left text-sm text-gray-400">
              <thead className="bg-[#13151a]/60 text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-[#1a1c23]">
                {activeTab === 'modules' && (
                  <tr>
                    <th className="px-6 py-3">Code</th>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Description</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                )}
                {activeTab === 'types' && (
                  <tr>
                    <th className="px-6 py-3">Code</th>
                    <th className="px-6 py-3">Module Code</th>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Description</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                )}
                {activeTab === 'values' && (
                  <tr>
                    <th className="px-6 py-3">Code</th>
                    <th className="px-6 py-3">Type Code</th>
                    <th className="px-6 py-3">Value Label</th>
                    <th className="px-6 py-3">Description</th>
                    <th className="px-6 py-3">Order</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                )}
                {activeTab === 'dependencies' && (
                  <tr>
                    <th className="px-6 py-3">Parent Code</th>
                    <th className="px-6 py-3">Child Code</th>
                    <th className="px-6 py-3">Dependency Type</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-[#1a1c23]/60 bg-transparent">
                {activeTab === 'modules' &&
                  (filteredData as CfgModule[]).map((row) => (
                    <tr key={row.id} className="hover:bg-[#13151a]/30 transition-colors">
                      <td className="whitespace-nowrap px-6 py-3.5 font-semibold text-white font-mono text-xs">
                        {row.code}
                      </td>
                      <td className="px-6 py-3.5 text-gray-200">{row.name}</td>
                      <td className="px-6 py-3.5 max-w-xs truncate text-gray-500" title={row.description}>
                        {row.description}
                      </td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-2xs font-medium border ${
                            row.is_active
                              ? 'bg-emerald-950/30 border-emerald-500/20 text-emerald-400'
                              : 'bg-gray-900 border-gray-800 text-gray-500'
                          }`}
                        >
                          {row.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-3.5 text-right text-xs font-medium space-x-1.5">
                        <button
                          onClick={() => handleOpenForm(row)}
                          testId={`config-edit-btn-${row.code}`}
                          className="rounded p-1 hover:bg-[#1a1c23] hover:text-white"
                          title="Edit"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => row.id && handleDelete(row.id, row.code)}
                          testId={`config-delete-btn-${row.code}`}
                          className="rounded p-1 hover:bg-[#2e1518] hover:text-red-400"
                          title="Soft Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}

                {activeTab === 'types' &&
                  (filteredData as CfgType[]).map((row) => (
                    <tr key={row.id} className="hover:bg-[#13151a]/30 transition-colors">
                      <td className="whitespace-nowrap px-6 py-3.5 font-semibold text-white font-mono text-xs">
                        {row.code}
                      </td>
                      <td className="whitespace-nowrap px-6 py-3.5 font-mono text-xs text-purple-400">
                        {row.module_code}
                      </td>
                      <td className="px-6 py-3.5 text-gray-200">{row.name}</td>
                      <td className="px-6 py-3.5 max-w-xs truncate text-gray-500" title={row.description}>
                        {row.description}
                      </td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-2xs font-medium border ${
                            row.is_active
                              ? 'bg-emerald-950/30 border-emerald-500/20 text-emerald-400'
                              : 'bg-gray-900 border-gray-800 text-gray-500'
                          }`}
                        >
                          {row.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-3.5 text-right text-xs font-medium space-x-1.5">
                        <button
                          onClick={() => handleOpenForm(row)}
                          testId={`config-edit-btn-${row.code}`}
                          className="rounded p-1 hover:bg-[#1a1c23] hover:text-white"
                          title="Edit"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => row.id && handleDelete(row.id, row.code)}
                          testId={`config-delete-btn-${row.code}`}
                          className="rounded p-1 hover:bg-[#2e1518] hover:text-red-400"
                          title="Soft Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}

                {activeTab === 'values' &&
                  (filteredData as CfgValue[]).map((row) => (
                    <tr key={row.id} className="hover:bg-[#13151a]/30 transition-colors">
                      <td className="whitespace-nowrap px-6 py-3.5 font-semibold text-white font-mono text-xs">
                        {row.code}
                      </td>
                      <td className="whitespace-nowrap px-6 py-3.5 font-mono text-xs text-indigo-400">
                        {row.type_code}
                      </td>
                      <td className="px-6 py-3.5 text-gray-200">{row.value}</td>
                      <td className="px-6 py-3.5 max-w-xs truncate text-gray-500" title={row.description}>
                        {row.description}
                      </td>
                      <td className="px-6 py-3.5 text-gray-300 font-mono text-xs">{row.display_order}</td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-2xs font-medium border ${
                            row.is_active
                              ? 'bg-emerald-950/30 border-emerald-500/20 text-emerald-400'
                              : 'bg-gray-900 border-gray-800 text-gray-500'
                          }`}
                        >
                          {row.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-3.5 text-right text-xs font-medium space-x-1.5">
                        <button
                          onClick={() => handleOpenForm(row)}
                          testId={`config-edit-btn-${row.code}`}
                          className="rounded p-1 hover:bg-[#1a1c23] hover:text-white"
                          title="Edit"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => row.id && handleDelete(row.id, row.code)}
                          testId={`config-delete-btn-${row.code}`}
                          className="rounded p-1 hover:bg-[#2e1518] hover:text-red-400"
                          title="Soft Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}

                {activeTab === 'dependencies' &&
                  (filteredData as CfgDependency[]).map((row) => (
                    <tr key={row.id} className="hover:bg-[#13151a]/30 transition-colors">
                      <td className="whitespace-nowrap px-6 py-3.5 font-semibold text-gray-200 font-mono text-xs">
                        {row.parent_value_code}
                      </td>
                      <td className="whitespace-nowrap px-6 py-3.5 text-gray-200 font-mono text-xs">
                        {row.child_value_code}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="rounded bg-indigo-950/20 border border-indigo-500/10 px-2 py-0.5 text-xs text-indigo-300 font-mono">
                          {row.dependency_type}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-2xs font-medium border ${
                            row.is_active
                              ? 'bg-emerald-950/30 border-emerald-500/20 text-emerald-400'
                              : 'bg-gray-900 border-gray-800 text-gray-500'
                          }`}
                        >
                          {row.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-3.5 text-right text-xs font-medium space-x-1.5">
                        <button
                          onClick={() => handleOpenForm(row)}
                          testId={`config-edit-btn-${row.parent_value_code}-${row.child_value_code}`}
                          className="rounded p-1 hover:bg-[#1a1c23] hover:text-white"
                          title="Edit"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => row.id && handleDelete(row.id, `${row.parent_value_code} -> ${row.child_value_code}`)}
                          testId={`config-delete-btn-${row.parent_value_code}-${row.child_value_code}`}
                          className="rounded p-1 hover:bg-[#2e1518] hover:text-red-400"
                          title="Soft Delete"
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

      {/* Slide-Over Drawer for Adding/Editing Config */}
      {isSlideOverOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsSlideOverOpen(false)} />
          <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
            <div className="w-screen max-w-md border-l border-[#1a1c23] bg-[#0c0d12] p-6 shadow-2xl flex flex-col h-full text-left">
              <div className="flex items-center justify-between border-b border-[#1a1c23] pb-4 mb-6">
                <h3 className="text-lg font-semibold text-white">
                  {editingRecord ? 'Edit' : 'Create New'}{' '}
                  {activeTab === 'modules' ? 'Module' : activeTab === 'types' ? 'Config Type' : activeTab === 'values' ? 'Config Value' : 'Dependency'}
                </h3>
                <button
                  onClick={() => setIsSlideOverOpen(false)}
                  testId="config-drawer-close-btn"
                  className="rounded-lg p-1 text-gray-400 hover:bg-[#1a1c23] hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Content */}
              <div className="flex-1 overflow-y-auto pr-1 stable-gutter">
                {/* Modules Form */}
                {activeTab === 'modules' && (
                  <form onSubmit={hModule(onSubmit)} className="space-y-4">
                     <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                        Module Code
                      </label>
                      <input
                        type="text"
                        disabled={!!editingRecord}
                        {...regModule('code')}
                        testId="module-form-code-input"
                        placeholder="e.g. finance"
                        className="w-full rounded-lg border border-[#1a1c23] bg-[#13151a] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-purple-500/40 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      {errModule.code && <p className="mt-1 text-xs text-red-400">{errModule.code.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                        Name
                      </label>
                      <input
                        type="text"
                        {...regModule('name')}
                        testId="module-form-name-input"
                        placeholder="e.g. Finance Module"
                        className="w-full rounded-lg border border-[#1a1c23] bg-[#13151a] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-purple-500/40 focus:outline-none"
                      />
                      {errModule.name && <p className="mt-1 text-xs text-red-400">{errModule.name.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                        Description
                      </label>
                      <textarea
                        {...regModule('description')}
                        testId="module-form-desc-input"
                        placeholder="Detail the modules capabilities..."
                        rows={3}
                        className="w-full rounded-lg border border-[#1a1c23] bg-[#13151a] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-purple-500/40 focus:outline-none resize-none"
                      />
                      {errModule.description && <p className="mt-1 text-xs text-red-400">{errModule.description.message}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="m_active"
                        {...regModule('is_active')}
                        testId="module-form-active-checkbox"
                        className="rounded border-[#1a1c23] bg-[#13151a] text-purple-600 focus:ring-0"
                      />
                      <label htmlFor="m_active" className="text-sm text-gray-300">
                        Is Active
                      </label>
                    </div>

                    <div className="border-t border-[#1a1c23] pt-6 flex justify-end gap-3 mt-8">
                      <button
                        type="button"
                        onClick={() => setIsSlideOverOpen(false)}
                        testId="config-drawer-cancel-btn"
                        className="rounded-lg border border-[#1a1c23] hover:bg-[#13151a] px-4 py-2 text-sm text-gray-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        testId="config-drawer-submit-btn"
                        className="rounded-lg bg-purple-600 hover:bg-purple-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-purple-500/25"
                      >
                        {editingRecord ? 'Save Changes' : 'Create Module'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Types Form */}
                {activeTab === 'types' && (
                  <form onSubmit={hType(onSubmit)} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                        Config Type Code
                      </label>
                      <input
                        type="text"
                        disabled={!!editingRecord}
                        {...regType('code')}
                        testId="type-form-code-input"
                        placeholder="e.g. status"
                        className="w-full rounded-lg border border-[#1a1c23] bg-[#13151a] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-purple-500/40 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      {errType.code && <p className="mt-1 text-xs text-red-400">{errType.code.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                        Module Code
                      </label>
                      <select
                        {...regType('module_code')}
                        testId="type-form-module-select"
                        className="w-full rounded-lg border border-[#1a1c23] bg-[#13151a] px-3 py-2 text-sm text-white focus:border-purple-500/40 focus:outline-none"
                      >
                        <option value="">Select a Module</option>
                        {modules?.map((m) => (
                          <option key={m.code} value={m.code}>
                            {m.name} ({m.code})
                          </option>
                        ))}
                      </select>
                      {errType.module_code && <p className="mt-1 text-xs text-red-400">{errType.module_code.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                        Name
                      </label>
                      <input
                        type="text"
                        {...regType('name')}
                        testId="type-form-name-input"
                        placeholder="e.g. Standard Status"
                        className="w-full rounded-lg border border-[#1a1c23] bg-[#13151a] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-purple-500/40 focus:outline-none"
                      />
                      {errType.name && <p className="mt-1 text-xs text-red-400">{errType.name.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                        Description
                      </label>
                      <textarea
                        {...regType('description')}
                        testId="type-form-desc-input"
                        placeholder="Operational configuration classification..."
                        rows={3}
                        className="w-full rounded-lg border border-[#1a1c23] bg-[#13151a] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-purple-500/40 focus:outline-none resize-none"
                      />
                      {errType.description && <p className="mt-1 text-xs text-red-400">{errType.description.message}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="t_active"
                        {...regType('is_active')}
                        testId="type-form-active-checkbox"
                        className="rounded border-[#1a1c23] bg-[#13151a] text-purple-600 focus:ring-0"
                      />
                      <label htmlFor="t_active" className="text-sm text-gray-300">
                        Is Active
                      </label>
                    </div>

                    <div className="border-t border-[#1a1c23] pt-6 flex justify-end gap-3 mt-8">
                      <button
                        type="button"
                        onClick={() => setIsSlideOverOpen(false)}
                        testId="config-drawer-cancel-btn"
                        className="rounded-lg border border-[#1a1c23] hover:bg-[#13151a] px-4 py-2 text-sm text-gray-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        testId="config-drawer-submit-btn"
                        className="rounded-lg bg-purple-600 hover:bg-purple-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-purple-500/25"
                      >
                        {editingRecord ? 'Save Changes' : 'Create Type'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Values Form */}
                {activeTab === 'values' && (
                  <form onSubmit={hValue(onSubmit)} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                        Config Value Code
                      </label>
                      <input
                        type="text"
                        disabled={!!editingRecord}
                        {...regValue('code')}
                        testId="value-form-code-input"
                        placeholder="e.g. ACTIVE"
                        className="w-full rounded-lg border border-[#1a1c23] bg-[#13151a] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-purple-500/40 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      {errValue.code && <p className="mt-1 text-xs text-red-400">{errValue.code.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                        Config Type Code
                      </label>
                      <select
                        {...regValue('type_code')}
                        testId="value-form-type-select"
                        className="w-full rounded-lg border border-[#1a1c23] bg-[#13151a] px-3 py-2 text-sm text-white focus:border-purple-500/40 focus:outline-none"
                      >
                        <option value="">Select a Type</option>
                        {types?.map((t) => (
                          <option key={t.code} value={t.code}>
                            {t.name} ({t.code})
                          </option>
                        ))}
                      </select>
                      {errValue.type_code && <p className="mt-1 text-xs text-red-400">{errValue.type_code.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                        Value Content / Label
                      </label>
                      <input
                        type="text"
                        {...regValue('value')}
                        testId="value-form-value-input"
                        placeholder="e.g. Active Record"
                        className="w-full rounded-lg border border-[#1a1c23] bg-[#13151a] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-purple-500/40 focus:outline-none"
                      />
                      {errValue.value && <p className="mt-1 text-xs text-red-400">{errValue.value.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                        Description
                      </label>
                      <textarea
                        {...regValue('description')}
                        testId="value-form-desc-input"
                        placeholder="Operational details for value code..."
                        rows={3}
                        className="w-full rounded-lg border border-[#1a1c23] bg-[#13151a] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-purple-500/40 focus:outline-none resize-none"
                      />
                      {errValue.description && <p className="mt-1 text-xs text-red-400">{errValue.description.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                        Display Order
                      </label>
                      <input
                        type="number"
                        {...regValue('display_order', { valueAsNumber: true })}
                        testId="value-form-order-input"
                        placeholder="e.g. 1"
                        className="w-full rounded-lg border border-[#1a1c23] bg-[#13151a] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-purple-500/40 focus:outline-none"
                      />
                      {errValue.display_order && <p className="mt-1 text-xs text-red-400">{errValue.display_order.message}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="v_active"
                        {...regValue('is_active')}
                        testId="value-form-active-checkbox"
                        className="rounded border-[#1a1c23] bg-[#13151a] text-purple-600 focus:ring-0"
                      />
                      <label htmlFor="v_active" className="text-sm text-gray-300">
                        Is Active
                      </label>
                    </div>

                    <div className="border-t border-[#1a1c23] pt-6 flex justify-end gap-3 mt-8">
                      <button
                        type="button"
                        onClick={() => setIsSlideOverOpen(false)}
                        testId="config-drawer-cancel-btn"
                        className="rounded-lg border border-[#1a1c23] hover:bg-[#13151a] px-4 py-2 text-sm text-gray-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        testId="config-drawer-submit-btn"
                        className="rounded-lg bg-purple-600 hover:bg-purple-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-purple-500/25"
                      >
                        {editingRecord ? 'Save Changes' : 'Create Value'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Dependencies Form */}
                {activeTab === 'dependencies' && (
                  <form onSubmit={hDep(onSubmit)} className="space-y-4">
                     <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                        Parent Value Code
                      </label>
                      <select
                        {...regDep('parent_value_code')}
                        testId="dep-form-parent-select"
                        className="w-full rounded-lg border border-[#1a1c23] bg-[#13151a] px-3 py-2 text-sm text-white focus:border-purple-500/40 focus:outline-none"
                      >
                        <option value="">Select Parent Value</option>
                        {values?.map((v) => (
                          <option key={v.code} value={v.code}>
                            {v.value} ({v.code}) [type: {v.type_code}]
                          </option>
                        ))}
                      </select>
                      {errDep.parent_value_code && <p className="mt-1 text-xs text-red-400">{errDep.parent_value_code.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                        Child Value Code
                      </label>
                      <select
                        {...regDep('child_value_code')}
                        testId="dep-form-child-select"
                        className="w-full rounded-lg border border-[#1a1c23] bg-[#13151a] px-3 py-2 text-sm text-white focus:border-purple-500/40 focus:outline-none"
                      >
                        <option value="">Select Child Value</option>
                        {values?.map((v) => (
                          <option key={v.code} value={v.code}>
                            {v.value} ({v.code}) [type: {v.type_code}]
                          </option>
                        ))}
                      </select>
                      {errDep.child_value_code && <p className="mt-1 text-xs text-red-400">{errDep.child_value_code.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                        Dependency Type
                      </label>
                      <input
                        type="text"
                        {...regDep('dependency_type')}
                        testId="dep-form-type-input"
                        placeholder="e.g. REQUIRES"
                        className="w-full rounded-lg border border-[#1a1c23] bg-[#13151a] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-purple-500/40 focus:outline-none"
                      />
                      {errDep.dependency_type && <p className="mt-1 text-xs text-red-400">{errDep.dependency_type.message}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="d_active"
                        {...regDep('is_active')}
                        testId="dep-form-active-checkbox"
                        className="rounded border-[#1a1c23] bg-[#13151a] text-purple-600 focus:ring-0"
                      />
                      <label htmlFor="d_active" className="text-sm text-gray-300">
                        Is Active
                      </label>
                    </div>

                    <div className="border-t border-[#1a1c23] pt-6 flex justify-end gap-3 mt-8">
                      <button
                        type="button"
                        onClick={() => setIsSlideOverOpen(false)}
                        testId="config-drawer-cancel-btn"
                        className="rounded-lg border border-[#1a1c23] hover:bg-[#13151a] px-4 py-2 text-sm text-gray-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        testId="config-drawer-submit-btn"
                        className="rounded-lg bg-purple-600 hover:bg-purple-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-purple-500/25"
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
    </div>
  );
};
