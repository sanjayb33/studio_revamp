import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, GitBranch, Share2, Plug, Settings2,
  PanelLeftClose, PanelLeftOpen, Bell, ChevronDown, ChevronRight,
  List, FileText, Cpu, CheckSquare,
} from 'lucide-react';
import AIChatWidget from './AIChatWidget';

// ─── Nav definition ───────────────────────────────────────────────────────────

interface NavLeaf {
  kind: 'leaf';
  id: string;
  label: string;
  icon: React.ElementType;
  to: string;
}

interface NavParent {
  kind: 'parent';
  id: string;
  label: string;
  icon: React.ElementType;
  children: { label: string; to: string; icon: React.ElementType }[];
  // paths that belong to this section (for auto-expand detection)
  matchPaths: string[];
}

type NavEntry = NavLeaf | NavParent;

const NAV: NavEntry[] = [
  {
    kind: 'leaf',
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    to: '/',
  },
  {
    kind: 'parent',
    id: 'pipelines',
    label: 'Pipelines',
    icon: GitBranch,
    matchPaths: ['/pipelines', '/pipeline', '/templates'],
    children: [
      { label: 'Pipeline List', to: '/pipelines', icon: List     },
      { label: 'Templates',     to: '/templates', icon: FileText },
    ],
  },
  {
    kind: 'leaf',
    id: 'knowledge-graph',
    label: 'Knowledge Graph',
    icon: Share2,
    to: '/knowledge-graph',
  },
  {
    kind: 'parent',
    id: 'data-sources',
    label: 'Data Sources',
    icon: Plug,
    matchPaths: ['/connectors', '/solutions'],
    children: [
      { label: 'Connectors', to: '/connectors', icon: Cpu        },
      { label: 'Solutions',  to: '/solutions',  icon: CheckSquare },
    ],
  },
  {
    kind: 'leaf',
    id: 'configuration',
    label: 'Configuration',
    icon: Settings2,
    to: '/configuration',
  },
];

// ─── Page meta (breadcrumb + title) ──────────────────────────────────────────

function getPageMeta(pathname: string): { title: string; crumbs: string[] } {
  if (pathname === '/')                                    return { title: 'Dashboard',       crumbs: ['Dashboard'] };
  if (pathname.startsWith('/pipeline/new'))               return { title: 'New Pipeline',    crumbs: ['Pipelines', 'New Pipeline'] };
  if (/^\/pipeline\/[^/]+/.test(pathname))               return { title: 'Pipeline Details', crumbs: ['Pipelines', 'Pipeline Details'] };
  if (pathname.startsWith('/pipelines'))                  return { title: 'Pipeline List',   crumbs: ['Pipelines', 'Pipeline List'] };
  if (pathname.startsWith('/templates'))                  return { title: 'Templates',       crumbs: ['Pipelines', 'Templates'] };
  if (pathname.startsWith('/knowledge-graph'))            return { title: 'Knowledge Graph', crumbs: ['Knowledge Graph'] };
  if (pathname.startsWith('/connectors'))                 return { title: 'Connectors',      crumbs: ['Data Sources', 'Connectors'] };
  if (pathname.startsWith('/solutions'))                  return { title: 'Solutions',       crumbs: ['Data Sources', 'Solutions'] };
  if (pathname.startsWith('/configuration') || pathname.startsWith('/settings'))
                                                          return { title: 'Configuration',   crumbs: ['Settings', 'Configuration'] };
  return { title: '', crumbs: [] };
}

// ─── Notifications ────────────────────────────────────────────────────────────

const NOTIFICATIONS = [
  { id: 1, title: 'CrowdStrike Falcon pipeline failed', time: '3 min ago' },
  { id: 2, title: 'Okta pipeline paused — stale identity data', time: '6h ago' },
  { id: 3, title: 'KG disambiguation backlog: 342 pending', time: '1h ago' },
];

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function Layout() {
  const [collapsed, setCollapsed]     = useState(false);
  const [notifOpen, setNotifOpen]     = useState(false);
  const [readIds, setReadIds]         = useState<number[]>([3]);
  const [expanded, setExpanded]       = useState<Record<string, boolean>>({});
  const [pageActions, setPageActions] = useState<React.ReactNode>(null);
  const location  = useLocation();
  const pageMeta  = getPageMeta(location.pathname);

  const unreadCount = NOTIFICATIONS.filter(n => !readIds.includes(n.id)).length;

  // Determine if a parent section is active (any child path matches current route)
  function isSectionActive(entry: NavParent) {
    return entry.matchPaths.some(p =>
      p === '/'
        ? location.pathname === '/'
        : location.pathname.startsWith(p)
    );
  }

  // Is this parent expanded? — auto-open when its section is active
  function isExpanded(entry: NavParent) {
    if (entry.id in expanded) return expanded[entry.id];
    return isSectionActive(entry); // auto-expand active section
  }

  function toggleExpanded(id: string) {
    setExpanded(prev => ({ ...prev, [id]: !isExpanded(NAV.find(e => e.id === id) as NavParent) }));
  }

  return (
    <div className="min-h-screen bg-[var(--shell-bg)]">

      {/* ── Topbar ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4"
        style={{ height: 48, background: '#131313' }}
      >
        <img
          src={`${import.meta.env.BASE_URL}pai-logo.svg`}
          alt="Prevalent AI"
          className="block flex-shrink-0"
          style={{ height: 16, width: 'auto' }}
        />
        <span style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.15)', flexShrink: 0 }} />
        <span className="text-[12px] font-medium" style={{ color: '#9CA3AF' }}>Data Studio</span>
        <div className="flex-1" />

        {/* Notifications */}
        <div className="relative">
          <button
            className="relative flex items-center justify-center w-8 h-8 rounded-full transition-colors hover:bg-white/[0.08]"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}
            onClick={() => { setNotifOpen(v => !v); setReadIds(NOTIFICATIONS.map(n => n.id)); }}
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 rounded-full" style={{ width: 6, height: 6, background: '#D12329' }} />
            )}
          </button>
          {notifOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
              <div
                className="absolute right-0 z-50 rounded-[4px] overflow-hidden"
                style={{ top: 36, width: 300, background: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
              >
                <div className="flex items-center justify-between" style={{ padding: '10px 14px', borderBottom: '1px solid var(--shell-border)' }}>
                  <p className="text-[12px] font-semibold" style={{ color: 'var(--shell-text)' }}>Notifications</p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-[3px]" style={{ background: 'var(--shell-active)', color: 'var(--shell-accent)' }}>
                    {NOTIFICATIONS.length} total
                  </span>
                </div>
                {NOTIFICATIONS.map((n, i) => (
                  <div
                    key={n.id}
                    className="flex items-start gap-2.5"
                    style={{ padding: '10px 14px', borderBottom: i < NOTIFICATIONS.length - 1 ? '1px solid var(--shell-border)' : 'none' }}
                  >
                    <div>
                      <p className="text-[12px]" style={{ color: 'var(--shell-text)' }}>{n.title}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: 'var(--shell-text-muted)' }}>{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* User */}
        <button
          className="flex items-center gap-2 px-2 py-1 rounded-[6px] transition-colors hover:bg-white/[0.08]"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}
        >
          <span
            className="flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-semibold"
            style={{ background: 'rgba(99,96,216,0.6)', color: '#fff' }}
          >
            AR
          </span>
          {!collapsed && (
            <>
              <span className="text-[12px] font-medium hidden sm:block" style={{ color: '#E5E7EB' }}>Alex Rodriguez</span>
              <ChevronDown size={12} />
            </>
          )}
        </button>
      </header>

      {/* ── Sub-header / breadcrumb bar ── */}
      <div
        className="fixed z-30 flex items-center"
        style={{
          top: 48,
          left: collapsed ? 52 : 220,
          right: 0,
          height: 48,
          background: 'var(--card-bg)',
          borderBottom: '1px solid var(--card-border)',
          padding: '0 24px',
          transition: 'left 0.22s ease',
        }}
      >
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold leading-tight" style={{ color: 'var(--shell-text)' }}>
            {pageMeta.title}
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            {pageMeta.crumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight size={9} style={{ color: 'var(--shell-text-muted)' }} />}
                <span
                  className="text-[10px]"
                  style={{ color: i === pageMeta.crumbs.length - 1 ? 'var(--shell-accent)' : 'var(--shell-text-muted)' }}
                >
                  {crumb}
                </span>
              </span>
            ))}
          </div>
        </div>
        {pageActions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {pageActions}
          </div>
        )}
      </div>

      {/* ── Sidebar ── */}
      <aside
        id="shell-nav"
        className="fixed left-0 bottom-0 flex flex-col border-r border-[var(--card-border)] z-40 overflow-hidden"
        style={{ top: 48, width: collapsed ? 52 : 220, transition: 'width 0.22s ease', background: 'var(--card-bg)' }}
      >
        {/* Workspace header — fixed 48px to align its border with the sub-header bar */}
        <div
          className="flex items-center justify-between border-b border-[var(--card-border)] flex-shrink-0"
          style={{
            height: 48,
            padding: collapsed ? '0 8px' : '0 8px 0 12px',
          }}
        >
          {!collapsed && (
            <div>
              <p className="text-[12px] font-semibold truncate" style={{ color: 'var(--shell-text)', maxWidth: 148 }}>
                Data Studio
              </p>
              <p className="text-[11px] truncate mt-0.5" style={{ color: 'var(--shell-text-muted)', maxWidth: 148 }}>
                Knowledge Graph Platform
              </p>
            </div>
          )}
          <button
            id="shell-nav-btn"
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center rounded-[6px] transition-colors hover:bg-[var(--shell-hover)]"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--shell-text-muted)', padding: 4, flexShrink: 0 }}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto" style={{ padding: '8px 0' }}>
          {NAV.map(entry => {
            const Icon = entry.icon;

            /* ── Leaf item ── */
            if (entry.kind === 'leaf') {
              return (
                <div key={entry.id} style={{ padding: '1px 8px' }}>
                  <NavLink
                    to={entry.to}
                    end={entry.to === '/'}
                    className={({ isActive }) =>
                      [
                        'flex items-center rounded-[6px] text-[12px] transition-colors select-none no-underline',
                        collapsed ? 'justify-center' : 'gap-2.5',
                        isActive
                          ? 'font-medium bg-[var(--shell-active)] text-[var(--shell-accent)]'
                          : 'font-normal text-[var(--shell-text-muted)] hover:bg-[var(--shell-hover)] hover:text-[var(--shell-text)]',
                      ].join(' ')
                    }
                    style={{ height: 36, padding: collapsed ? '0 8px' : '0 10px' }}
                    title={collapsed ? entry.label : undefined}
                  >
                    <Icon size={15} className="flex-shrink-0" />
                    {!collapsed && <span className="truncate">{entry.label}</span>}
                  </NavLink>
                </div>
              );
            }

            /* ── Parent item with sub-items ── */
            const sectionActive = isSectionActive(entry);
            const open = isExpanded(entry);

            return (
              <div key={entry.id} style={{ padding: '1px 8px' }}>
                {/* Section header button */}
                <button
                  onClick={() => collapsed ? undefined : toggleExpanded(entry.id)}
                  title={collapsed ? entry.label : undefined}
                  className="flex items-center w-full rounded-[6px] text-[12px] font-medium transition-colors select-none"
                  style={{
                    height: 36,
                    padding: collapsed ? '0 8px' : '0 10px',
                    gap: collapsed ? 0 : 10,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    background: sectionActive ? 'var(--shell-raised)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: sectionActive ? 'var(--shell-text)' : 'var(--shell-text-muted)',
                    borderRadius: 6,
                  }}
                >
                  <Icon size={15} className="flex-shrink-0" style={{ color: sectionActive ? 'var(--shell-accent)' : 'var(--shell-text-muted)' }} />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left truncate">{entry.label}</span>
                      <ChevronDown
                        size={13}
                        style={{
                          color: 'var(--shell-text-muted)',
                          flexShrink: 0,
                          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.18s ease',
                        }}
                      />
                    </>
                  )}
                </button>

                {/* Sub-items — hidden when collapsed or section closed */}
                {!collapsed && open && (
                  <div
                    style={{
                      marginLeft: 8,
                      marginBottom: 2,
                    }}
                  >
                    {entry.children.map(child => {
                      const ChildIcon = child.icon;
                      return (
                        <NavLink
                          key={child.to}
                          to={child.to}
                          end
                          className={({ isActive }) =>
                            [
                              'flex items-center gap-2 text-[12px] transition-colors select-none no-underline',
                              isActive
                                ? 'font-medium text-[var(--shell-accent)] bg-[var(--shell-active)]'
                                : 'font-normal text-[var(--shell-text-muted)] hover:bg-[var(--shell-hover)] hover:text-[var(--shell-text)]',
                            ].join(' ')
                          }
                          style={{ height: 38, paddingLeft: 18, paddingRight: 10, borderRadius: 6 }}
                        >
                          <ChildIcon size={13} className="flex-shrink-0" />
                          <span className="truncate">{child.label}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

        </nav>
      </aside>

      {/* ── Main content ── */}
      <main
        style={{
          marginLeft: collapsed ? 52 : 220,
          paddingTop: 96,
          minHeight: '100vh',
          transition: 'margin-left 0.22s ease',
        }}
      >
        <Outlet context={{ setPageActions }} />
      </main>

      <AIChatWidget />
    </div>
  );
}
