'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const railItems = [
  { id: 'dashboard',  path: '/dashboard',           icon: 'grid-4',        label: 'Dashboard'   },
  { id: 'workflows',  path: '/workflows',            icon: 'git-branch',    label: 'Workflows'   },
  { id: 'agents',     path: '/agents',               icon: 'robot',         label: 'AI Agents'   },
  { id: 'pipelines',  path: '/pipelines',            icon: 'arrow-fork',    label: 'Pipelines'   },
  { id: 'analytics',  path: '/analytics',            icon: 'chart-bar',     label: 'Analytics'   },
];

const SECTIONS = [
  {
    key: 'pinned',
    label: 'Pinned',
    items: [
      { id: 'lead-gen',    path: '/workflows/lead-gen',    icon: 'bolt',          label: 'Lead Gen Flow',     badge: null      },
      { id: 'email-seq',   path: '/workflows/email-seq',   icon: 'mail-forward',  label: 'Email Sequence',    badge: 'Live'    },
      { id: 'data-sync',   path: '/workflows/data-sync',   icon: 'refresh',       label: 'Data Sync',         badge: null      },
    ],
  },
  {
    key: 'automation',
    label: 'Automation',
    items: [
      { id: 'triggers',    path: '/triggers',              icon: 'player-play',   label: 'Triggers',          badge: null      },
      { id: 'actions',     path: '/actions',               icon: 'player-skip-forward', label: 'Actions',     badge: null      },
      { id: 'conditions',  path: '/conditions',            icon: 'git-merge',     label: 'Conditions',        badge: null      },
      { id: 'scheduler',   path: '/scheduler',             icon: 'clock',         label: 'Scheduler',         badge: 'Beta'    },
      { id: 'webhooks',    path: '/webhooks',              icon: 'webhook',       label: 'Webhooks',          badge: null      },
    ],
  },
  {
    key: 'ai',
    label: 'AI Modules',
    items: [
      { id: 'llm-node',    path: '/ai/llm',               icon: 'brain',         label: 'LLM Node',          badge: 'New'     },
      { id: 'embeddings',  path: '/ai/embeddings',        icon: 'topology-star', label: 'Embeddings',        badge: null      },
      { id: 'classifier',  path: '/ai/classifier',        icon: 'filter',        label: 'Classifier',        badge: null      },
      { id: 'extractor',   path: '/ai/extractor',         icon: 'scan',          label: 'Data Extractor',    badge: 'New'     },
    ],
  },
  {
    key: 'integrations',
    label: 'Integrations',
    items: [
      { id: 'crm',         path: '/integrations/crm',     icon: 'building',      label: 'CRM Connect',       badge: null      },
      { id: 'slack',       path: '/integrations/slack',   icon: 'brand-slack',   label: 'Slack',             badge: null      },
      { id: 'sheets',      path: '/integrations/sheets',  icon: 'table',         label: 'Google Sheets',     badge: null      },
    ],
  },
];

const settingsItems = [
  { path: '/settings/profile',       icon: 'user',          label: 'Profile'        },
  { path: '/settings/api-keys',      icon: 'key',           label: 'API Keys'       },
  { path: '/settings/billing',       icon: 'credit-card',   label: 'Billing'        },
  { path: '/settings/notifications', icon: 'bell',          label: 'Notifications'  },
  { path: '/settings/team',          icon: 'users',         label: 'Team'           },
];

export default function Sidebar() {
  const router   = useRouter();
  const pathname = usePathname();

  const [collapsed,     setCollapsed]     = useState(false);
  const [settingsOpen,  setSettingsOpen]  = useState(false);
  const [open, setOpen] = useState({ pinned: true, automation: true, ai: true, integrations: false });

  const toggle   = (key) => setOpen((p) => ({ ...p, [key]: !p[key] }));
  const isActive = (path) => pathname === path;
  const go       = (path) => { router.push(path); setSettingsOpen(false); };

  return (
    <div className="flex h-screen">

      {/* ── ICON RAIL ── */}
      <div className="flex flex-col w-14 bg-zinc-950 border-r border-zinc-800 items-center py-4 z-20 shrink-0">

        {/* Logo */}
        <div className="mb-6 w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2L14 5.5V10.5L8 14L2 10.5V5.5L8 2Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
            <circle cx="8" cy="8" r="2" fill="white"/>
          </svg>
        </div>

        {/* Rail nav */}
        <nav className="flex flex-col gap-1 flex-1">
          {railItems.map((r) => (
            <button
              key={r.id}
              title={r.label}
              onClick={() => go(r.path)}
              className={`group relative w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-150
                ${isActive(r.path)
                  ? 'bg-violet-600 text-white'
                  : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200'}`}
            >
              <i className={`ti ti-${r.icon} text-[18px]`} aria-hidden="true" />
              {/* Tooltip */}
              <span className="pointer-events-none absolute left-12 z-50 whitespace-nowrap rounded-md bg-zinc-800 px-2.5 py-1 text-xs text-zinc-100 opacity-0 group-hover:opacity-100 transition-opacity duration-150 border border-zinc-700">
                {r.label}
              </span>
            </button>
          ))}
        </nav>

        {/* Bottom buttons */}
        <div className="flex flex-col gap-1 items-center">
          <button
            title="Help"
            className="w-10 h-10 flex items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200 transition-all"
          >
            <i className="ti ti-help-circle text-[18px]" aria-hidden="true" />
          </button>

          {/* Settings with popup */}
          <div className="relative">
            <button
              title="Settings"
              onClick={() => setSettingsOpen((p) => !p)}
              className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-150
                ${settingsOpen ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200'}`}
            >
              <i className="ti ti-settings-2 text-[18px]" aria-hidden="true" />
            </button>

            {settingsOpen && (
              <div className="absolute bottom-0 left-12 z-50 w-52 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl shadow-black/50 py-1.5 overflow-hidden">
                <p className="px-3 py-1.5 text-[11px] font-medium text-zinc-500 uppercase tracking-widest">Settings</p>
                {settingsItems.map((s) => (
                  <button
                    key={s.path}
                    onClick={() => go(s.path)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                  >
                    <i className={`ti ti-${s.icon} text-[15px] text-zinc-500`} aria-hidden="true" />
                    {s.label}
                  </button>
                ))}
                <div className="my-1 border-t border-zinc-800" />
                <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:bg-zinc-800 transition-colors">
                  <i className="ti ti-logout text-[15px]" aria-hidden="true" />
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Avatar */}
          <div className="mt-2 w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-[11px] font-semibold text-white cursor-pointer">
            AK
          </div>
        </div>
      </div>

      {/* ── WIDE PANEL ── */}
      {!collapsed && (
        <div className="flex flex-col w-60 bg-zinc-950 border-r border-zinc-800 shrink-0 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3">
            <div>
              <p className="text-[13px] font-semibold text-zinc-100 leading-none">AutoFlow AI</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">Workspace</p>
            </div>
            <button
              onClick={() => setCollapsed(true)}
              className="w-7 h-7 flex items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-all"
            >
              <i className="ti ti-layout-sidebar-left-collapse text-[16px]" aria-hidden="true" />
            </button>
          </div>

          {/* Search */}
          <div className="px-3 pb-3">
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 h-8 hover:border-zinc-700 transition-colors cursor-text">
              <i className="ti ti-search text-[13px] text-zinc-500" aria-hidden="true" />
              <span className="text-[12px] text-zinc-500 select-none">Search workflows...</span>
              <span className="ml-auto text-[10px] text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded-md font-mono">⌘K</span>
            </div>
          </div>

          {/* Quick actions */}
          <div className="px-3 pb-4">
            <button
              onClick={() => go('/workflows/new')}
              className="w-full flex items-center justify-center gap-1.5 h-8 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[12px] font-medium transition-colors"
            >
              <i className="ti ti-plus text-[14px]" aria-hidden="true" />
              New Workflow
            </button>
          </div>

          {/* Nav sections */}
          <nav className="flex-1 overflow-y-auto px-2 space-y-0.5 scrollbar-none">
            {SECTIONS.map((sec) => (
              <div key={sec.key} className="mb-1">

                {/* Section header */}
                <button
                  onClick={() => toggle(sec.key)}
                  className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-zinc-900 transition-colors group"
                >
                  <i
                    className={`ti ti-chevron-right text-[12px] text-zinc-600 transition-transform duration-200 ${open[sec.key] ? 'rotate-90' : ''}`}
                    aria-hidden="true"
                  />
                  <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest group-hover:text-zinc-400 transition-colors">
                    {sec.label}
                  </span>
                </button>

                {/* Items */}
                {open[sec.key] && (
                  <div className="mt-0.5 space-y-px">
                    {sec.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => go(item.path)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all duration-100 group
                          ${isActive(item.path)
                            ? 'bg-violet-600/20 text-violet-300 border border-violet-600/30'
                            : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 border border-transparent'}`}
                      >
                        <i
                          className={`ti ti-${item.icon} text-[15px] shrink-0
                            ${isActive(item.path) ? 'text-violet-400' : 'text-zinc-600 group-hover:text-zinc-400'}`}
                          aria-hidden="true"
                        />
                        <span className="flex-1 text-left truncate">{item.label}</span>

                        {item.badge && (
                          <span className={`shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-md leading-none
                            ${item.badge === 'New'  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' :
                              item.badge === 'Live' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                              item.badge === 'Beta' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                              'bg-zinc-700 text-zinc-300 border border-zinc-600'}`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Upgrade card */}
          <div className="p-3">
            <div className="rounded-xl bg-gradient-to-br from-violet-900/60 to-fuchsia-900/40 border border-violet-700/40 p-3.5">
              <div className="flex items-center gap-2 mb-1.5">
                <i className="ti ti-sparkles text-[14px] text-violet-400" aria-hidden="true" />
                <p className="text-[12px] font-semibold text-violet-200">Upgrade to Pro</p>
              </div>
              <p className="text-[11px] text-violet-300/70 mb-3 leading-relaxed">
                Unlimited workflows, advanced AI nodes, priority support.
              </p>
              <button className="w-full h-7 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[11px] font-semibold transition-colors">
                Upgrade now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EXPAND BUTTON (when collapsed) ── */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="absolute top-4 left-16 z-30 w-6 h-6 flex items-center justify-center rounded-md bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 transition-all shadow-lg"
        >
          <i className="ti ti-chevron-right text-[13px]" aria-hidden="true" />
        </button>
      )}

    </div>
  );
}