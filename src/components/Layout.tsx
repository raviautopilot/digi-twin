import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useConfigHealth } from '../api/config';
import { useCoreHealth } from '../api/core';

// ── Nav Module Definition ──────────────────────────────────────────────────

export interface NavModule {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  color: string; // tailwind bg class
  accent: string; // tailwind text class
  custom?: boolean;
}

// ── SVG Icons ──────────────────────────────────────────────────────────────

export const icons: Record<string, React.ReactNode> = {
  dashboard: (
    <svg fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
    </svg>
  ),
  crm: (
    <svg fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  ),
  finance: (
    <svg fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
    </svg>
  ),
  hr: (
    <svg fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
    </svg>
  ),
  manufacturing: (
    <svg fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l5.654-4.654m5.714-4.144a9 9 0 0 1-6.284 6.284c-1.505.376-3.441.02-4.985-1.425L5.09 8.28a9 9 0 0 1 6.285-6.285c1.505-.375 3.44-.019 4.985 1.425Z" />
    </svg>
  ),
  inventory: (
    <svg fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
    </svg>
  ),
  schedules: (
    <svg fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
    </svg>
  ),
  health: (
    <svg fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
    </svg>
  ),
  learning: (
    <svg fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 3.741-1.342" />
    </svg>
  ),
  shopping: (
    <svg fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
    </svg>
  ),
  config: (
    <svg fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  ),
  core: (
    <svg fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
    </svg>
  ),
  custom: (
    <svg fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
    </svg>
  ),
};

const ICON_OPTIONS = ['crm', 'finance', 'hr', 'manufacturing', 'inventory', 'schedules', 'health', 'learning', 'shopping', 'dashboard', 'config', 'custom'];

const COLOR_OPTIONS = [
  { label: 'Violet', bg: 'bg-violet-600', text: 'text-violet-300' },
  { label: 'Emerald', bg: 'bg-emerald-600', text: 'text-emerald-300' },
  { label: 'Blue', bg: 'bg-blue-600', text: 'text-blue-300' },
  { label: 'Orange', bg: 'bg-orange-600', text: 'text-orange-300' },
  { label: 'Amber', bg: 'bg-amber-600', text: 'text-amber-300' },
  { label: 'Sky', bg: 'bg-sky-600', text: 'text-sky-300' },
  { label: 'Rose', bg: 'bg-rose-600', text: 'text-rose-300' },
  { label: 'Indigo', bg: 'bg-indigo-600', text: 'text-indigo-300' },
  { label: 'Teal', bg: 'bg-teal-600', text: 'text-teal-300' },
  { label: 'Cyan', bg: 'bg-cyan-600', text: 'text-cyan-300' },
  { label: 'Slate', bg: 'bg-slate-500', text: 'text-slate-300' },
  { label: 'Pink', bg: 'bg-pink-600', text: 'text-pink-300' },
];

export const PRESET_MODULES: NavModule[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/', icon: icons.dashboard, color: 'bg-slate-600', accent: 'text-slate-300' },
];

export const CORE_MODULES: NavModule[] = [
  { id: 'crm', label: 'CRM', path: '/modules/crm', icon: icons.crm, color: 'bg-violet-600', accent: 'text-violet-300' },
  { id: 'finance', label: 'Finance', path: '/modules/finance', icon: icons.finance, color: 'bg-emerald-600', accent: 'text-emerald-300' },
  { id: 'hr', label: 'Human Resources', path: '/modules/hr', icon: icons.hr, color: 'bg-blue-600', accent: 'text-blue-300' },
  { id: 'manufacturing', label: 'Manufacturing', path: '/modules/manufacturing', icon: icons.manufacturing, color: 'bg-orange-600', accent: 'text-orange-300' },
  { id: 'inventory', label: 'Inventory', path: '/modules/inventory', icon: icons.inventory, color: 'bg-amber-600', accent: 'text-amber-300' },
];

export const OPS_MODULES: NavModule[] = [
  { id: 'schedules', label: 'Schedules', path: '/modules/schedules', icon: icons.schedules, color: 'bg-sky-600', accent: 'text-sky-300' },
  { id: 'health', label: 'Health', path: '/modules/health', icon: icons.health, color: 'bg-rose-600', accent: 'text-rose-300' },
  { id: 'learning', label: 'Learning', path: '/modules/learning', icon: icons.learning, color: 'bg-indigo-600', accent: 'text-indigo-300' },
  { id: 'shopping', label: 'Shopping', path: '/modules/shopping', icon: icons.shopping, color: 'bg-teal-600', accent: 'text-teal-300' },
];

export const SYSTEM_MODULES: NavModule[] = [
  { id: 'config', label: 'Configuration', path: '/config', icon: icons.config, color: 'bg-cyan-600', accent: 'text-cyan-300' },
  { id: 'core', label: 'Base Entities', path: '/core', icon: icons.core, color: 'bg-indigo-600', accent: 'text-indigo-300' },
];

// ── Add Module Modal ───────────────────────────────────────────────────────

function AddModuleModal({ onClose, onAdd }: { onClose: () => void; onAdd: (m: NavModule) => void }) {
  const [label, setLabel] = useState('');
  const [iconKey, setIconKey] = useState('custom');
  const [colorIdx, setColorIdx] = useState(0);

  const valid = label.trim().length > 0;

  const handleAdd = () => {
    if (!valid) return;
    const color = COLOR_OPTIONS[colorIdx];
    const id = `custom_${Date.now()}`;
    onAdd({
      id,
      label: label.trim(),
      path: `/modules/${id}`,
      icon: icons[iconKey] ?? icons.custom,
      color: color.bg,
      accent: color.text,
      custom: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative bg-[#111827] border border-slate-700 rounded w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-700">
          <h3 className="text-sm font-semibold text-slate-200">Add ERP Module</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-lg leading-none">
            ×
          </button>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1 tracking-wide uppercase font-mono">
              Module Name
            </label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Project Management"
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600/40 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2 tracking-wide uppercase font-mono">
              Icon
            </label>
            <div className="grid grid-cols-6 gap-1.5">
              {ICON_OPTIONS.map((k) => (
                <button
                  key={k}
                  onClick={() => setIconKey(k)}
                  className={`flex items-center justify-center h-9 rounded border transition-colors ${
                    iconKey === k
                      ? 'border-cyan-600 bg-cyan-950/40 text-cyan-300'
                      : 'border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300'
                  }`}
                >
                  {icons[k]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2 tracking-wide uppercase font-mono">
              Color
            </label>
            <div className="grid grid-cols-6 gap-1.5">
              {COLOR_OPTIONS.map((c, i) => (
                <button
                  key={c.label}
                  onClick={() => setColorIdx(i)}
                  className={`h-7 rounded border-2 transition-all ${c.bg} ${
                    colorIdx === i ? 'border-white scale-110' : 'border-transparent'
                  }`}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          {label && (
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-900 rounded border border-slate-700">
              <div className={`w-6 h-6 rounded ${COLOR_OPTIONS[colorIdx].bg} flex items-center justify-center text-white`}>
                {icons[iconKey]}
              </div>
              <span className={`text-sm font-medium ${COLOR_OPTIONS[colorIdx].text}`}>{label}</span>
              <span className="text-xs text-slate-500 ml-auto font-mono">preview</span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-slate-700">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!valid}
            className="px-4 py-1.5 text-xs font-semibold rounded transition-colors bg-cyan-500 hover:bg-cyan-400 text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Add Module
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Sidebar Nav Item Group ─────────────────────────────────────────────────

interface SidebarGroupProps {
  label?: string;
  modules: NavModule[];
  currentPath: string;
  collapsed: boolean;
}

function SidebarGroup({ label, modules, currentPath, collapsed }: SidebarGroupProps) {
  return (
    <div className="mb-1">
      {label && !collapsed && (
        <p className="px-3 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-widest font-mono">
          {label}
        </p>
      )}
      {label && collapsed && <div className="mx-3 my-1 h-px bg-slate-800" />}
      {modules.map((m) => {
        const isActive =
          currentPath === m.path || (m.path !== '/' && currentPath.startsWith(m.path));
        return (
          <NavLink
            key={m.id}
            to={m.path}
            title={collapsed ? m.label : undefined}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded mx-0 transition-colors text-left group relative ${
              isActive
                ? `bg-slate-800 ${m.accent}`
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <span className={`shrink-0 ${isActive ? '' : 'opacity-70 group-hover:opacity-100'}`}>
              <span
                className={`flex items-center justify-center w-6 h-6 rounded ${
                  isActive ? m.color : ''
                } ${isActive ? 'text-white' : ''} transition-colors`}
              >
                {m.icon}
              </span>
            </span>
            {!collapsed && <span className="text-xs font-medium truncate">{m.label}</span>}
            {!collapsed && m.custom && (
              <span className="ml-auto text-[9px] font-mono text-slate-500 border border-slate-700 px-1 rounded">
                custom
              </span>
            )}
          </NavLink>
        );
      })}
    </div>
  );
}

// ── Main Layout Component ──────────────────────────────────────────────────

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [customModules, setCustomModules] = useState<NavModule[]>(() => {
    try {
      const saved = localStorage.getItem('nexuserp_custom_modules');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((m: any) => ({
          ...m,
          icon: icons[m.iconKey] || icons.custom,
        }));
      }
    } catch {
      // ignore
    }
    return [];
  });
  const [showAddModal, setShowAddModal] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Service health status
  const { data: configHealth, isError: configError } = useConfigHealth();
  const { data: coreHealth, isError: coreError } = useCoreHealth();

  const isConfigUp = configHealth?.status === 'UP' && !configError;
  const isCoreUp = coreHealth?.status === 'UP' && !coreError;

  const allModules = [...PRESET_MODULES, ...CORE_MODULES, ...OPS_MODULES, ...customModules, ...SYSTEM_MODULES];

  const currentModule =
    allModules.find((m) =>
      m.path === location.pathname || (m.path !== '/' && location.pathname.startsWith(m.path))
    ) || PRESET_MODULES[0];

  const handleAddModule = (newMod: NavModule) => {
    const updated = [...customModules, newMod];
    setCustomModules(updated);
    try {
      localStorage.setItem('nexuserp_custom_modules', JSON.stringify(updated));
    } catch {
      // ignore
    }
    navigate(newMod.path);
  };

  return (
    <div className="h-full flex bg-[#0a0e17] overflow-hidden text-slate-200">
      {/* Sidebar */}
      <aside
        className={`flex flex-col border-r border-slate-800 bg-[#0d1421] transition-all duration-200 shrink-0 ${
          collapsed ? 'w-14' : 'w-52'
        }`}
      >
        {/* Brand Logo Header */}
        <div
          className={`flex items-center border-b border-slate-800 h-12 px-3 ${
            collapsed ? 'justify-center' : 'gap-2.5'
          }`}
        >
          <div className="w-7 h-7 rounded-md bg-cyan-500 flex items-center justify-center shrink-0 shadow-sm shadow-cyan-500/20">
            <svg className="w-4 h-4 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="currentColor"
                fill="none"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-100 tracking-wide">NexusERP</span>
              <span className="text-[10px] text-cyan-400/80 font-mono -mt-1">Digital Twin</span>
            </div>
          )}
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto py-2 px-1.5 space-y-0.5">
          <SidebarGroup modules={PRESET_MODULES} currentPath={location.pathname} collapsed={collapsed} />
          <SidebarGroup label="Core" modules={CORE_MODULES} currentPath={location.pathname} collapsed={collapsed} />
          <SidebarGroup label="Operations" modules={OPS_MODULES} currentPath={location.pathname} collapsed={collapsed} />

          {customModules.length > 0 && (
            <SidebarGroup label="Custom" modules={customModules} currentPath={location.pathname} collapsed={collapsed} />
          )}

          <SidebarGroup label="System" modules={SYSTEM_MODULES} currentPath={location.pathname} collapsed={collapsed} />
        </nav>

        {/* Footer actions: Add Module & Collapse */}
        <div className="border-t border-slate-800 p-1.5 space-y-0.5">
          <button
            onClick={() => setShowAddModal(true)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-slate-400 hover:text-cyan-400 hover:bg-cyan-950/30 transition-colors ${
              collapsed ? 'justify-center' : ''
            }`}
            title={collapsed ? 'Add Module' : undefined}
          >
            <svg fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" className="w-4 h-4 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {!collapsed && <span className="text-xs font-medium">Add Module</span>}
          </button>

          <button
            onClick={() => setCollapsed((c) => !c)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-800/40 transition-colors ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <svg
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
              className={`w-4 h-4 shrink-0 transition-transform ${collapsed ? 'rotate-180' : ''}`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            {!collapsed && <span className="text-xs font-medium">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main App Canvas */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-12 border-b border-slate-800 bg-[#0d1421] flex items-center px-5 justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className={`w-5 h-5 rounded ${currentModule.color} flex items-center justify-center text-white shrink-0`}>
              <span className="scale-90">{currentModule.icon}</span>
            </div>
            <span className="text-sm font-semibold text-slate-200">{currentModule.label}</span>
            <span className="text-slate-700 text-xs">/</span>
            <span className="text-xs font-mono text-slate-500">api/v1/{currentModule.id}</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Health indicators */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5" title="Config Service (Port 1705)">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConfigUp
                      ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]'
                      : 'bg-rose-500'
                  }`}
                />
                <span className="text-[11px] font-mono text-slate-400">CONFIG {isConfigUp ? 'UP' : 'OFF'}</span>
              </div>
              <div className="flex items-center gap-1.5" title="Core Service (Port 1706)">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isCoreUp
                      ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]'
                      : 'bg-rose-500'
                  }`}
                />
                <span className="text-[11px] font-mono text-slate-400">CORE {isCoreUp ? 'UP' : 'OFF'}</span>
              </div>
            </div>

            {/* User Profile avatar */}
            <div className="w-7 h-7 rounded-full bg-cyan-900/60 border border-cyan-700/60 flex items-center justify-center text-xs font-bold text-cyan-300">
              A
            </div>
          </div>
        </header>

        {/* Inner Page View */}
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>

      {showAddModal && (
        <AddModuleModal onClose={() => setShowAddModal(false)} onAdd={handleAddModule} />
      )}
    </div>
  );
};
