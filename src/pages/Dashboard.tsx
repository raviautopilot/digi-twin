import React from 'react';
import { Link } from 'react-router-dom';
import { Settings, Users, ArrowRight } from 'lucide-react';
import { useConfigHealth } from '../api/config';
import { useCoreHealth } from '../api/core';
import { CORE_MODULES, OPS_MODULES } from '../components/Layout';

export const Dashboard: React.FC = () => {
  const { data: configHealth, isError: configError } = useConfigHealth();
  const { data: coreHealth, isError: coreError } = useCoreHealth();

  const isConfigUp = configHealth?.status === 'UP' && !configError;
  const isCoreUp = coreHealth?.status === 'UP' && !coreError;

  return (
    <div className="h-full overflow-auto px-6 pt-6 pb-8 space-y-6 max-w-7xl mx-auto text-slate-200">
      {/* Hero Welcome */}
      <div className="rounded-lg border border-slate-800 bg-[#0d1421] p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-cyan-500/5 blur-[80px]" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.6)]" />
              <span className="text-[10px] font-mono text-cyan-400 font-semibold tracking-wider uppercase">
                NexusERP System Shell
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Personal ERP & Digital Twin
            </h1>
            <p className="mt-1 text-xs text-slate-400 max-w-2xl leading-relaxed">
              Unified control plane for configuration parameters, base organizational entities, and full-suite ERP modular workflows.
            </p>
          </div>

          {/* Service health indicators */}
          <div className="flex flex-wrap items-center gap-3 border border-slate-800 bg-[#111827] px-4 py-2.5 rounded font-mono text-xs">
            <div className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${isConfigUp ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]' : 'bg-rose-500'}`} />
              <span className="text-slate-400">CONFIG:</span>
              <span className={isConfigUp ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                {isConfigUp ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
            <div className="h-3 w-px bg-slate-800" />
            <div className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${isCoreUp ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]' : 'bg-rose-500'}`} />
              <span className="text-slate-400">CORE:</span>
              <span className={isCoreUp ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                {isCoreUp ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Control Planes */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 font-mono">
          System Control Planes
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Config Module Card */}
          <Link
            to="/config"
            testId="dashboard-card-config"
            className="group block rounded border border-slate-800 bg-[#111827] p-5 transition-all hover:border-cyan-600 hover:bg-slate-900/60 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800/60 group-hover:scale-105 transition-transform">
                <Settings size={20} />
              </div>
              <span className="font-mono text-[10px] bg-cyan-950/60 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded font-semibold">
                ACTIVE
              </span>
            </div>
            <h3 className="mt-3 text-base font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors">
              Configuration Control Plane
            </h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              Define operational schemas, types, parameter values, and dependency trees with full CRUD support.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-cyan-400">
              Open Control Plane <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Core Entities Card */}
          <Link
            to="/core"
            testId="dashboard-card-core"
            className="group block rounded border border-slate-800 bg-[#111827] p-5 transition-all hover:border-indigo-600 hover:bg-slate-900/60 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded bg-indigo-950/60 text-indigo-400 border border-indigo-800/60 group-hover:scale-105 transition-transform">
                <Users size={20} />
              </div>
              <span className="font-mono text-[10px] bg-indigo-950/60 text-indigo-400 border border-indigo-800 px-2 py-0.5 rounded font-semibold">
                ACTIVE
              </span>
            </div>
            <h3 className="mt-3 text-base font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors">
              Base Entities & Profiles
            </h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              Maintain master entity registry for persons, corporate organizations, addresses, contacts, and relationships.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-indigo-400">
              Open Base Entities <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* Core ERP Modules Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 font-mono">
          Core ERP Modules
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {CORE_MODULES.map((mod) => (
            <Link
              key={mod.id}
              to={mod.path}
              className="rounded border border-slate-800 bg-[#111827] p-4 hover:border-slate-700 hover:bg-slate-900/40 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className={`w-8 h-8 rounded ${mod.color} flex items-center justify-center text-white mb-3`}>
                  {mod.icon}
                </div>
                <h4 className="text-sm font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                  {mod.label}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Live KPI metrics & transactions.
                </p>
              </div>
              <span className="text-[10px] font-mono text-cyan-500 mt-3 flex items-center gap-1">
                Explore →
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Operations ERP Modules Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 font-mono">
          Operations & Lifecycle Modules
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {OPS_MODULES.map((mod) => (
            <Link
              key={mod.id}
              to={mod.path}
              className="rounded border border-slate-800 bg-[#111827] p-4 hover:border-slate-700 hover:bg-slate-900/40 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className={`w-8 h-8 rounded ${mod.color} flex items-center justify-center text-white mb-3`}>
                  {mod.icon}
                </div>
                <h4 className="text-sm font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                  {mod.label}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Tracking, events, & operational records.
                </p>
              </div>
              <span className="text-[10px] font-mono text-cyan-500 mt-3 flex items-center gap-1">
                Explore →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
