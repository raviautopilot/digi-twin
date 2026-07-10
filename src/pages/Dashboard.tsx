import React from 'react';
import { Link } from 'react-router-dom';
import { Settings, Users, DollarSign, TrendingUp, Bell, LayoutGrid, ArrowRight } from 'lucide-react';
import { useConfigHealth } from '../api/config';
import { useCoreHealth } from '../api/core';

export const Dashboard: React.FC = () => {
  const { data: configHealth, isError: configError } = useConfigHealth();
  const { data: coreHealth, isError: coreError } = useCoreHealth();

  const isConfigUp = configHealth?.status === 'UP' && !configError;
  const isCoreUp = coreHealth?.status === 'UP' && !coreError;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Hero Welcome */}
      <div className="rounded-2xl border border-[#1a1c23] bg-gradient-to-br from-[#0c0d12]/95 via-[#0e1017]/95 to-[#13151f]/95 p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-purple-500/10 blur-[80px]" />
        <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-indigo-500/10 blur-[80px]" />
        
        <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
          Personal ERP & Digital Twin
        </h1>
        <p className="mt-3 text-base text-gray-400 max-w-2xl leading-relaxed">
          Welcome to the control plane for your personal digital twin. Lay down system configurations, manage operational parameters, and set up your core foundation entities.
        </p>

        {/* Quick status overview */}
        <div className="mt-6 flex flex-wrap gap-4 border-t border-[#1a1c23]/60 pt-6">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-gray-500">System Shell Online</span>
          </div>
          <div className="h-4 w-px bg-gray-800" />
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${isConfigUp ? 'bg-emerald-500' : 'bg-red-500'}`} />
            <span className="text-xs text-gray-500">Config API (Port 1705): {isConfigUp ? 'Connected' : 'Offline'}</span>
          </div>
          <div className="h-4 w-px bg-gray-800" />
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${isCoreUp ? 'bg-emerald-500' : 'bg-red-500'}`} />
            <span className="text-xs text-gray-500">Core API (Port 1706): {isCoreUp ? 'Connected' : 'Offline'}</span>
          </div>
        </div>
      </div>

      {/* Grid of Workspaces */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-wide text-gray-400">Phase 1 Control Plane Modules</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Config Module Card */}
          <Link
            to="/config"
            testId="dashboard-card-config"
            className="group block rounded-2xl border border-[#1a1c23] bg-[#0c0d12]/60 p-6 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-purple-500/30 hover:bg-[#0c0d12]/80 hover:shadow-xl hover:shadow-purple-500/5"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all">
                <Settings size={22} />
              </div>
              <span className="rounded-full bg-purple-950/40 border border-purple-500/30 px-2.5 py-0.5 text-xs text-purple-300 font-medium">
                Active
              </span>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">
              Configuration Management
            </h3>
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
              Define system-wide configurations, key-value rules, dependency behaviors, and modules. Keep your operational parameters synchronized.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-purple-400">
              Open Config Plane <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Core Entities Card */}
          <Link
            to="/core"
            testId="dashboard-card-core"
            className="group block rounded-2xl border border-[#1a1c23] bg-[#0c0d12]/60 p-6 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-indigo-500/30 hover:bg-[#0c0d12]/80 hover:shadow-xl hover:shadow-indigo-500/5"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                <Users size={22} />
              </div>
              <span className="rounded-full bg-indigo-950/40 border border-indigo-500/30 px-2.5 py-0.5 text-xs text-indigo-300 font-medium">
                Active
              </span>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors">
              Base Entities & Profiles
            </h3>
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
              Create and manage people, organizations, addresses, contacts, and relationships. Establish your base entities to link transactions and documents.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-indigo-400">
              Open Entity Setup <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* Locked / Future Modules */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold tracking-wide text-gray-400">Future Operational Modules (Locked)</h3>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { name: 'Finance Hub', icon: DollarSign, desc: 'Track cashflows, investment assets, loans, and credit card statement analysis.' },
            { name: 'Trade Terminal', icon: TrendingUp, desc: 'Analyze trade setups, track portfolios, and sync transaction logs.' },
            { name: 'Alerts & Reminders', icon: Bell, desc: 'Set up cron jobs, calendar events, warranty expirations, and triggers.' },
            { name: 'Kanban & Planning', icon: LayoutGrid, desc: 'Organize chores, personal backlog, study targets, and milestone plans.' },
          ].map((mod, idx) => {
            const Icon = mod.icon;
            return (
              <div
                key={idx}
                className="relative overflow-hidden rounded-xl border border-gray-900 bg-[#0c0d12]/30 p-5 cursor-not-allowed group"
              >
                <div className="absolute top-0 right-0 rounded-bl bg-gray-900 border-l border-b border-gray-800 px-1.5 py-0.5 text-[8px] font-bold text-gray-600 uppercase tracking-widest">
                  Soon
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 text-gray-700">
                  <Icon size={18} />
                </div>
                <h4 className="mt-3 text-sm font-semibold text-gray-500">{mod.name}</h4>
                <p className="mt-1 text-xs text-gray-700 leading-normal">{mod.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
