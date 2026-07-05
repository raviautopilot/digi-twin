import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Settings,
  Users,
  DollarSign,
  TrendingUp,
  Bell,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Search,
  Cpu,
  Database,
  RefreshCw,
} from 'lucide-react';
import { useConfigHealth } from '../api/config';
import { useCoreHealth } from '../api/core';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const { data: configHealth, isLoading: configLoading, isError: configError, refetch: refetchConfig } = useConfigHealth();
  const { data: coreHealth, isLoading: coreLoading, isError: coreError, refetch: refetchCore } = useCoreHealth();

  const isConfigUp = configHealth?.status === 'UP' && !configError;
  const isCoreUp = coreHealth?.status === 'UP' && !coreError;

  const toggleSidebar = () => setCollapsed(!collapsed);

  const navItems = [
    {
      group: 'System',
      items: [
        {
          name: 'Config Control Plane',
          path: '/config',
          icon: Settings,
          active: true,
          badge: 'Phase 1',
        },
        {
          name: 'Base Entity Setup',
          path: '/core',
          icon: Users,
          active: true,
          badge: 'Phase 1',
        },
      ],
    },
    {
      group: 'Modules',
      items: [
        {
          name: 'Finance Module',
          path: '/finance',
          icon: DollarSign,
          active: false,
          badge: 'Coming Soon',
        },
        {
          name: 'Trade Module',
          path: '/trade',
          icon: TrendingUp,
          active: false,
          badge: 'Coming Soon',
        },
        {
          name: 'Reminders & Alerts',
          path: '/reminders',
          icon: Bell,
          active: false,
          badge: 'Coming Soon',
        },
        {
          name: 'Kanban & Planning',
          path: '/kanban',
          icon: LayoutGrid,
          active: false,
          badge: 'Coming Soon',
        },
      ],
    },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a0b0d] text-[#e4e5e7]">
      {/* Collapsible Sidebar */}
      <aside
        className={`flex flex-col border-r border-[#1a1c23] bg-[#0c0d12]/95 backdrop-blur-md transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-14 items-center justify-between border-b border-[#1a1c23] px-4">
          <Link to="/" className="flex items-center gap-2 overflow-hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 font-bold text-white shadow-lg shadow-purple-500/30 shrink-0">
              DT
            </div>
            {!collapsed && (
              <span className="bg-gradient-to-r from-white via-[#d1d5db] to-[#9ca3af] bg-clip-text text-sm font-semibold tracking-wide text-transparent uppercase whitespace-nowrap">
                Digital Twin ERP
              </span>
            )}
          </Link>
          {!collapsed && (
            <button
              onClick={toggleSidebar}
              className="rounded-lg p-1 text-gray-500 hover:bg-[#1a1c23] hover:text-white"
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        {/* Navigation List */}
        <nav className="flex-1 space-y-6 overflow-y-auto py-4 stable-gutter scroll-contain">
          {navItems.map((group, groupIdx) => (
            <div key={groupIdx} className="px-3">
              {!collapsed && (
                <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-gray-600">
                  {group.group}
                </h3>
              )}
              <ul className="space-y-1">
                {group.items.map((item, itemIdx) => {
                  const Icon = item.icon;
                  if (!item.active) {
                    return (
                      <li key={itemIdx}>
                        <div
                          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 cursor-not-allowed group relative ${
                            collapsed ? 'justify-center' : ''
                          }`}
                        >
                          <Icon size={18} className="text-gray-700 shrink-0" />
                          {!collapsed && (
                            <span className="flex-1 truncate">{item.name}</span>
                          )}
                          {!collapsed && (
                            <span className="rounded bg-[#1a1c23] px-1.5 py-0.5 text-[10px] font-medium text-gray-500 border border-gray-800">
                              Locked
                            </span>
                          )}
                          {collapsed && (
                            <div className="absolute left-full ml-2 z-50 hidden rounded-md bg-[#13151a] border border-[#1a1c23] px-2 py-1 text-xs text-gray-400 group-hover:block whitespace-nowrap shadow-xl">
                              {item.name} (Coming Soon)
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  }

                  return (
                    <li key={itemIdx}>
                      <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                          `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors group relative ${
                            isActive
                              ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20'
                              : 'text-gray-400 hover:bg-[#13151a] hover:text-white border border-transparent'
                          } ${collapsed ? 'justify-center' : ''}`
                        }
                      >
                        <Icon size={18} className="shrink-0" />
                        {!collapsed && (
                          <span className="flex-1 truncate">{item.name}</span>
                        )}
                        {!collapsed && item.badge && (
                          <span className="rounded bg-purple-950/40 border border-purple-500/30 px-1.5 py-0.5 text-[10px] text-purple-300">
                            {item.badge}
                          </span>
                        )}
                        {collapsed && (
                          <div className="absolute left-full ml-2 z-50 hidden rounded-md bg-[#13151a] border border-[#1a1c23] px-2 py-1 text-xs text-white group-hover:block whitespace-nowrap shadow-xl">
                            {item.name}
                          </div>
                        )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer with Collapse Button when Collapsed */}
        <div className="border-t border-[#1a1c23] p-3 flex justify-center">
          {collapsed ? (
            <button
              onClick={toggleSidebar}
              className="rounded-lg p-1.5 text-gray-500 hover:bg-[#1a1c23] hover:text-white"
            >
              <ChevronRight size={18} />
            </button>
          ) : (
            <div className="w-full flex flex-col gap-2 p-2 rounded-lg bg-[#13151a] border border-[#1a1c23] text-xs text-gray-500">
              <div className="flex justify-between items-center">
                <span>Active Profile</span>
                <span className="font-semibold text-gray-300">Ravi Karta</span>
              </div>
              <div className="h-px bg-[#1a1c23] my-1" />
              <div className="flex justify-between items-center text-[10px]">
                <span>Workspace:</span>
                <span className="text-[#9ca3af]">digi-twin</span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header / Command Bar */}
        <header className="flex h-14 items-center justify-between border-b border-[#1a1c23] bg-[#0c0d12]/90 px-6 backdrop-blur-md shrink-0">
          {/* Search Trigger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex w-64 items-center gap-2 rounded-lg bg-[#13151a] border border-[#1a1c23] px-3 py-1.5 text-left text-xs text-gray-500 hover:border-purple-500/30 hover:text-gray-300 transition-all focus:outline-none"
            >
              <Search size={14} />
              <span className="flex-1">Search dashboard...</span>
              <kbd className="pointer-events-none rounded bg-[#1a1c23] border border-gray-800 px-1.5 py-0.5 text-[10px] font-mono text-gray-400">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Environment and Service Health statuses */}
          <div className="flex items-center gap-4">
            <span className="rounded bg-indigo-950/40 border border-indigo-500/30 px-2 py-0.5 text-xs text-indigo-300 font-mono tracking-wider uppercase">
              Environment: Dev/Local
            </span>

            {/* Config Service Health Status */}
            <div className="flex items-center gap-1.5 rounded-lg border border-[#1a1c23] bg-[#13151a] px-2.5 py-1 text-xs">
              <Cpu size={12} className="text-gray-400" />
              <span className="text-gray-400 hidden sm:inline">Config Service</span>
              {configLoading ? (
                <div className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
              ) : isConfigUp ? (
                <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/50" />
              ) : (
                <div className="h-2 w-2 rounded-full bg-red-500 shadow-md shadow-red-500/50" />
              )}
            </div>

            {/* Core Service Health Status */}
            <div className="flex items-center gap-1.5 rounded-lg border border-[#1a1c23] bg-[#13151a] px-2.5 py-1 text-xs">
              <Database size={12} className="text-gray-400" />
              <span className="text-gray-400 hidden sm:inline">Core Service</span>
              {coreLoading ? (
                <div className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
              ) : isCoreUp ? (
                <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/50" />
              ) : (
                <div className="h-2 w-2 rounded-full bg-red-500 shadow-md shadow-red-500/50" />
              )}
            </div>

            <button
              onClick={() => {
                refetchConfig();
                refetchCore();
              }}
              title="Refresh services health status"
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1a1c23]"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#0a0b0d] p-6 stable-gutter scroll-contain">
          {children}
        </main>
      </div>

      {/* Global Command Palette Mock Modal */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-20 backdrop-blur-sm"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-xl border border-[#1a1c23] bg-[#0c0d12] shadow-2xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center border-b border-[#1a1c23] px-3 py-3">
              <Search className="mr-2 text-gray-500" size={18} />
              <input
                type="text"
                autoFocus
                placeholder="Type a command or search..."
                className="w-full bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="rounded bg-[#1a1c23] border border-gray-800 px-1.5 py-0.5 text-xs text-gray-400 hover:text-white"
              >
                ESC
              </button>
            </div>
            <div className="p-4 text-xs text-gray-600">
              <p className="font-semibold text-gray-400 mb-2">System Commands</p>
              <ul className="space-y-1.5 text-gray-300">
                <li className="flex items-center justify-between rounded p-1.5 hover:bg-purple-600/10 hover:text-purple-400 cursor-pointer">
                  <span>Go to Configuration Control Plane</span>
                  <span className="text-gray-500 font-mono">/config</span>
                </li>
                <li className="flex items-center justify-between rounded p-1.5 hover:bg-purple-600/10 hover:text-purple-400 cursor-pointer">
                  <span>Go to Core Base Entity Setup</span>
                  <span className="text-gray-500 font-mono">/core</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
