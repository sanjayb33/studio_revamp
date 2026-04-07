import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, List, Settings, PanelLeftClose, PanelLeftOpen, Plus, Bell, User } from 'lucide-react';
import AIChatWidget from './AIChatWidget';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  to: string;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard', icon: <Home size={16} />, to: '/' },
      { label: 'Pipelines', icon: <List size={16} />, to: '/pipelines' },
    ],
  },
  {
    label: 'Configuration',
    items: [
      { label: 'Settings', icon: <Settings size={16} />, to: '/settings' },
    ],
  },
];

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--shell-bg)]">

      {/* ── Topbar ── fixed, full-width, always #131313 */}
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
        <span className="text-[12px] font-medium" style={{ color: '#9CA3AF' }}>
          Data Ingestion Studio
        </span>
        <div className="flex-1" />
        <button
          className="flex items-center justify-center w-8 h-8 rounded-full transition-colors hover:bg-white/[0.08]"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}
        >
          <Bell size={16} />
        </button>
        <button
          className="flex items-center justify-center w-8 h-8 rounded-full"
          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}
        >
          <User size={14} />
        </button>
      </header>

      {/* ── Left Nav ── fixed, below topbar */}
      <aside
        id="shell-nav"
        className="fixed left-0 bottom-0 flex flex-col border-r border-[var(--shell-border)] bg-[var(--shell-bg)] z-40 overflow-hidden"
        style={{ top: 48, width: collapsed ? 52 : 220, transition: 'width 0.22s ease, padding 0.22s ease' }}
      >
        {/* Nav header — workspace name + toggle button (top-right per spec) */}
        <div
          className="flex items-start justify-between border-b border-[var(--shell-border)] flex-shrink-0"
          style={{
            padding: collapsed ? '12px 8px' : '8px 8px 8px 12px',
            flexDirection: collapsed ? 'column' : 'row',
            alignItems: collapsed ? 'center' : 'flex-start',
            gap: collapsed ? 8 : 0,
          }}
        >
          {/* Workspace info — hidden when collapsed */}
          {!collapsed && (
            <div>
              <p className="text-[12px] font-medium text-[var(--shell-text)] truncate" style={{ maxWidth: 148 }}>
                Data Ingestion Studio
              </p>
              <p className="text-[11px] text-[var(--shell-text-muted)] truncate mt-0.5" style={{ maxWidth: 148 }}>
                Pipeline Management
              </p>
            </div>
          )}

          {/* Toggle button — always visible, top-right when expanded, centered when collapsed */}
          <button
            id="shell-nav-btn"
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center rounded-[6px] transition-colors hover:bg-[var(--shell-hover)]"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--shell-text-muted)',
              padding: 4,
              flexShrink: 0,
            }}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed
              ? <PanelLeftOpen size={18} />
              : <PanelLeftClose size={18} />
            }
          </button>
        </div>

        {/* Nav sections */}
        <nav className="flex-1 overflow-y-auto" style={{ padding: '12px 0' }}>
          {navSections.map((section) => (
            <div key={section.label} className="mb-2">
              {/* Section label — hidden when collapsed */}
              {!collapsed && (
                <p
                  className="text-[10px] font-semibold uppercase"
                  style={{ letterSpacing: '0.08em', color: 'var(--shell-text-muted)', padding: '8px 16px 4px' }}
                >
                  {section.label}
                </p>
              )}

              <div className="flex flex-col px-2" style={{ gap: 2 }}>
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      [
                        'flex items-center rounded-[6px] text-[12px] transition-colors select-none no-underline',
                        collapsed ? 'justify-center' : 'gap-3',
                        isActive
                          ? 'font-medium bg-[var(--shell-active)] text-[var(--shell-accent)]'
                          : 'font-normal text-[var(--shell-text-muted)] hover:bg-[var(--shell-hover)] hover:text-[var(--shell-text)]',
                      ].join(' ')
                    }
                    style={{ padding: collapsed ? '8px' : '6px 12px' }}
                    title={collapsed ? item.label : undefined}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}

          {/* New Pipeline */}
          <div className="px-2 mt-2 pt-2 border-t border-[var(--shell-border)]">
            <button
              onClick={() => navigate('/pipeline/new')}
              className={[
                'flex items-center w-full rounded-[6px] text-[12px] font-medium transition-colors hover:bg-[var(--shell-active)]',
                collapsed ? 'justify-center' : 'gap-3',
              ].join(' ')}
              style={{
                padding: collapsed ? '8px' : '6px 12px',
                color: 'var(--shell-accent)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
              title={collapsed ? 'New Pipeline' : undefined}
            >
              <span className="flex-shrink-0"><Plus size={16} /></span>
              {!collapsed && <span className="truncate">New Pipeline</span>}
            </button>
          </div>
        </nav>
      </aside>

      {/* ── Page content ── offset for fixed topbar + fixed sidebar */}
      <main
        style={{
          marginLeft: collapsed ? 52 : 220,
          paddingTop: 48,
          minHeight: '100vh',
          transition: 'margin-left 0.22s ease',
        }}
      >
        <Outlet />
      </main>

      <AIChatWidget />
    </div>
  );
}
