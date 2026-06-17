import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { logout } from '../../services/auth';
import { Avatar, Badge, ThemeToggle } from '../ui';

// ── Icons ─────────────────────────────────────────────────────────────────────
function Icon({ name, size = 18, stroke = 2, style }: { name: string; size?: number; stroke?: number; style?: React.CSSProperties }) {
  const paths: Record<string, string> = {
    grid:     'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
    inbox:    'M22 12h-6l-2 3h-4l-2-3H2M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z',
    layers:   'M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    edit:     'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
    chart:    'M18 20V10M12 20V4M6 20v-6',
    settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm6.22-1.5a1 1 0 0 0 .2 1.1l.06.06a1.5 1.5 0 0 1-2.12 2.12l-.06-.06a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.92V18a1.5 1.5 0 0 1-3 0v-.08a1 1 0 0 0-.66-.92 1 1 0 0 0-1.1.2l-.06.06a1.5 1.5 0 0 1-2.12-2.12l.06-.06a1 1 0 0 0 .2-1.1 1 1 0 0 0-.92-.6H6a1.5 1.5 0 0 1 0-3h.08a1 1 0 0 0 .92-.66 1 1 0 0 0-.2-1.1l-.06-.06a1.5 1.5 0 0 1 2.12-2.12l.06.06a1 1 0 0 0 1.1.2h.04a1 1 0 0 0 .6-.92V6a1.5 1.5 0 0 1 3 0v.08a1 1 0 0 0 .6.92 1 1 0 0 0 1.1-.2l.06-.06a1.5 1.5 0 0 1 2.12 2.12l-.06.06a1 1 0 0 0-.2 1.1v.04a1 1 0 0 0 .92.6H18a1.5 1.5 0 0 1 0 3h-.08a1 1 0 0 0-.7.68z',
    bell:     'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0',
    search:   'M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z',
    menu:     'M3 12h18M3 6h18M3 18h18',
    zap:      'M13 2 3 14h9l-1 8 10-12h-9l1-8z',
    logout:   'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
    shield:   'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    arrowL:   'M19 12H5M12 19l-7-7 7-7',
    chevDown: 'M6 9l6 6 6-6',
    building: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10',
    check:    'M20 6 9 17l-5-5',
    x:        'M18 6 6 18M6 6l12 12',
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d={paths[name] || ''} />
    </svg>
  );
}

// ── Nav items ─────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard',     icon: 'grid',     path: '/app/dashboard' },
  { id: 'leads',     label: 'Leads',         icon: 'inbox',    path: '/app/leads' },
  { id: 'widgets',   label: 'Widgets',       icon: 'layers',   path: '/app/widgets' },
  { id: 'builder',   label: 'Constructor',   icon: 'edit',     path: '/app/builder/demo', soon: false },
  { id: 'analytics', label: 'Analytics',     icon: 'chart',    path: '#', soon: true },
  { id: 'settings',  label: 'Configuración', icon: 'settings', path: '#', soon: true },
];

// ── NavLink ───────────────────────────────────────────────────────────────────
function NavLink({ item, active, badge, onClick }: {
  item: typeof NAV_ITEMS[0];
  active: boolean;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={item.soon}
      style={{
        display: 'flex', alignItems: 'center', gap: 11,
        width: '100%', height: 40, padding: '0 12px',
        borderRadius: 'var(--r-md)', border: 'none',
        cursor: item.soon ? 'default' : 'pointer',
        textAlign: 'left', position: 'relative',
        background: active ? 'var(--accent-soft)' : 'transparent',
        color: active ? 'var(--accent-2)' : 'var(--text-2)',
        fontSize: 14, fontWeight: active ? 650 : 500,
        letterSpacing: '-.01em',
        transition: 'background .16s, color .16s',
        opacity: item.soon ? .5 : 1,
      }}
      onMouseEnter={e => {
        if (!active && !item.soon) {
          (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)';
          (e.currentTarget as HTMLElement).style.color = 'var(--text)';
        }
      }}
      onMouseLeave={e => {
        if (!active && !item.soon) {
          (e.currentTarget as HTMLElement).style.background = 'transparent';
          (e.currentTarget as HTMLElement).style.color = 'var(--text-2)';
        }
      }}
    >
      {active && (
        <span style={{
          position: 'absolute', left: -12, top: 9, bottom: 9,
          width: 3, borderRadius: 99, background: 'var(--accent)',
        }} />
      )}
      <Icon name={item.icon} size={18} stroke={2} />
      <span style={{ flex: 1 }}>{item.label}</span>
      {badge != null && badge > 0 && <Badge count={badge} />}
      {item.soon && (
        <span style={{
          fontSize: 9.5, fontWeight: 700, letterSpacing: '.04em',
          color: 'var(--text-3)', background: 'var(--surface-2)',
          padding: '2px 6px', borderRadius: 6,
        }}>
          PRONTO
        </span>
      )}
    </button>
  );
}

// ── Notification bell ─────────────────────────────────────────────────────────
const MOCK_NOTIFS = [
  { id: 1, name: 'Franco Giménez', text: 'Dejó sus datos de contacto · Precios y modelos', time: 'hace 2 min', unseen: true },
  { id: 2, name: 'Lucía Fernández', text: 'Nueva consulta desde el sitio · Hablar con un asesor', time: 'hace 14 min', unseen: true },
  { id: 3, name: 'Juan Pablo Medina', text: 'Lead captado desde Google Ads', time: 'hace 1 h', unseen: false },
];

function NotifBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unseen = MOCK_NOTIFS.filter(n => n.unseen).length;

  useEffect(() => {
    function h(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: 38, height: 38, borderRadius: 'var(--r-md)',
          border: '1px solid var(--border)', background: 'var(--surface)',
          cursor: 'pointer', color: 'var(--text-2)', position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Icon name="bell" size={18} />
        {unseen > 0 && (
          <span style={{
            position: 'absolute', top: 7, right: 8,
            width: 8, height: 8, borderRadius: 99,
            background: 'var(--red)', border: '2px solid var(--surface)',
          }} />
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 46, width: 330,
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)', boxShadow: 'var(--sh-3)', zIndex: 70, overflow: 'hidden',
        }}>
          <div style={{
            padding: '13px 15px', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>Notificaciones</span>
            <span style={{ fontSize: 12, color: 'var(--accent-2)', fontWeight: 600, cursor: 'pointer' }}>
              Marcar leídas
            </span>
          </div>
          <div style={{ maxHeight: 340, overflowY: 'auto' }}>
            {MOCK_NOTIFS.map(n => (
              <div key={n.id} style={{
                display: 'flex', gap: 11, padding: '12px 15px', cursor: 'pointer',
                borderBottom: '1px solid var(--border)',
                background: n.unseen ? 'var(--accent-soft)' : 'transparent',
              }}>
                <Avatar name={n.name} size={36} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{n.name}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.35 }}>{n.text}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3 }}>{n.time}</div>
                </div>
                {n.unseen && (
                  <span style={{ width: 8, height: 8, borderRadius: 99, background: 'var(--accent)', marginTop: 5, flexShrink: 0 }} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
  unreadCount?: number;
}

function Sidebar({ mobileOpen, onClose, unreadCount = 0 }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore(s => s.user);

  const activeId = NAV_ITEMS.find(it => location.pathname.startsWith(it.path.replace('/demo', '')))?.id ?? 'dashboard';

  const PLAN_LEAD_LIMIT: Record<string, number> = { Prueba: 200, Starter: 200, Premium: 1000 };
  const plan = 'Premium'; // TODO: from tenant
  const leadsMonth = 1006;
  const limit = PLAN_LEAD_LIMIT[plan] ?? 1000;
  const pct = Math.min(100, Math.round((leadsMonth / limit) * 100));

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <>
      {mobileOpen && (
        <div
          onClick={onClose}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 60 }}
        />
      )}
      <aside
        className="cr-sidebar"
        data-open={mobileOpen}
        style={{
          width: 248, flexShrink: 0,
          background: 'var(--surface)', borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', padding: '16px 14px', gap: 4,
          position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
        }}
      >
        {/* Workspace chip */}
        {/* Workspace chip — shows impersonated tenant if admin is viewing a client */}
        {(() => {
          const imp = useAuthStore(s => s.impersonating);
          const tenantName = imp?.tenantName ?? 'Dr. Imports';
          const initials = tenantName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
          return (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px',
              borderRadius: 'var(--r-md)', border: '1px solid var(--border)',
              background: imp ? 'var(--accent-soft)' : 'var(--surface-2)', marginBottom: 8,
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: 9,
                background: imp ? 'var(--accent)' : '#10B3AC', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 13, flexShrink: 0,
              }}>
                {initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, letterSpacing: '-.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {tenantName}
                </div>
                <div style={{ fontSize: 11, color: imp ? 'var(--accent-2)' : 'var(--text-3)' }}>
                  {imp ? 'Vista admin' : `Plan ${plan}`}
                </div>
              </div>
              <Icon name="chevDown" size={15} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
            </div>
          );
        })()}

        <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.06em', color: 'var(--text-3)', padding: '6px 12px 2px' }}>
          PLATAFORMA
        </div>

        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.id}
            item={item}
            active={activeId === item.id}
            badge={item.id === 'leads' ? unreadCount : undefined}
            onClick={() => {
              if (!item.soon) {
                navigate(item.path);
                onClose();
              }
            }}
          />
        ))}

        <div style={{ flex: 1 }} />

        {/* Usage meter */}
        <div style={{
          padding: 12, borderRadius: 'var(--r-md)',
          background: 'var(--surface-2)', border: '1px solid var(--border)', marginBottom: 8,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 7 }}>
            <span style={{ color: 'var(--text-2)', fontWeight: 600 }}>Leads este mes</span>
            <span style={{ fontWeight: 700 }}>{leadsMonth.toLocaleString('es')} / {limit.toLocaleString('es')}</span>
          </div>
          <div style={{ height: 6, borderRadius: 99, background: 'var(--surface-3)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${pct}%`, borderRadius: 99,
              background: pct >= 100 ? 'var(--red)' : pct >= 85 ? 'linear-gradient(90deg,var(--amber),var(--red))' : 'var(--grad)',
              transition: 'width .6s var(--ease)',
            }} />
          </div>
          <button
            onClick={() => { navigate('/app/account'); onClose(); }}
            style={{
              marginTop: 10, width: '100%', height: 32, borderRadius: 9,
              border: 'none', cursor: 'pointer',
              background: 'var(--grad)', color: '#fff',
              fontSize: 12.5, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            <Icon name="zap" size={14} /> Mejorar plan
          </button>
        </div>

        {/* Profile → Mi cuenta */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => { navigate('/app/account'); onClose(); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: 8, borderRadius: 'var(--r-md)', cursor: 'pointer',
            background: activeId === 'account' ? 'var(--accent-soft)' : 'transparent',
            transition: 'background .15s',
          }}
          onMouseEnter={e => {
            if (activeId !== 'account') (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)';
          }}
          onMouseLeave={e => {
            if (activeId !== 'account') (e.currentTarget as HTMLElement).style.background = 'transparent';
          }}
        >
          <Avatar name={user?.email ?? 'Usuario'} size={34} color="var(--blue)" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 650, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email?.split('@')[0] ?? 'Mi cuenta'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Plan {plan}</div>
          </div>
          <button
            onClick={e => { e.stopPropagation(); handleLogout(); }}
            title="Cerrar sesión"
            style={{
              width: 30, height: 30, borderRadius: 9, border: 'none',
              background: 'transparent', cursor: 'pointer',
              color: 'var(--text-3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Icon name="logout" size={16} />
          </button>
        </div>
      </aside>
    </>
  );
}

// ── Topbar ────────────────────────────────────────────────────────────────────
function Topbar({ title, onMenu }: { title: string; onMenu: () => void }) {
  return (
    <div style={{
      height: 64, display: 'flex', alignItems: 'center', gap: 14,
      padding: '0 24px', borderBottom: '1px solid var(--border)',
      background: 'var(--glass)', backdropFilter: 'blur(12px)',
      position: 'sticky', top: 0, zIndex: 30,
    }}>
      <button
        onClick={onMenu}
        className="cr-burger"
        style={{
          display: 'none', width: 38, height: 38, borderRadius: 10,
          border: '1px solid var(--border)', background: 'var(--surface)',
          cursor: 'pointer', color: 'var(--text)',
          alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Icon name="menu" size={18} />
      </button>

      <h1 style={{ fontSize: 19, fontWeight: 750, letterSpacing: '-.025em', margin: 0, whiteSpace: 'nowrap' }}>
        {title}
      </h1>
      <div style={{ flex: 1 }} />

      {/* Search */}
      <div className="cr-search" style={{
        display: 'flex', alignItems: 'center', gap: 8, height: 38,
        padding: '0 12px', borderRadius: 'var(--r-md)',
        background: 'var(--surface-2)', border: '1px solid var(--border)',
        minWidth: 240, maxWidth: 300, color: 'var(--text-3)',
      }}>
        <Icon name="search" size={17} />
        <input
          placeholder="Buscar leads, emails…"
          style={{
            border: 'none', outline: 'none', background: 'transparent',
            fontSize: 13.5, flex: 1, color: 'var(--text)', minWidth: 0,
          }}
        />
        <span style={{
          fontSize: 11, fontFamily: 'var(--mono)',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 5, padding: '1px 5px',
        }}>
          ⌘K
        </span>
      </div>

      {/* Widget status */}
      <div className="cr-status" style={{
        display: 'flex', alignItems: 'center', gap: 7, height: 38,
        padding: '0 12px', borderRadius: 'var(--r-md)',
        background: 'var(--green-soft)', color: 'var(--green)',
        fontSize: 12.5, fontWeight: 600,
      }}>
        <span style={{ width: 7, height: 7, borderRadius: 99, background: 'var(--green)', boxShadow: '0 0 0 3px var(--green-soft)' }} />
        Widget activo
      </div>

      <NotifBell />
      <ThemeToggle />
    </div>
  );
}

// ── Impersonation banner ──────────────────────────────────────────────────────
function ImpersonationBanner() {
  const impersonating = useAuthStore(s => s.impersonating);
  const stopImpersonation = useAuthStore(s => s.stopImpersonation);
  const navigate = useNavigate();

  if (!impersonating) return null;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '9px 24px',
      background: 'linear-gradient(90deg, var(--accent-soft), transparent)',
      borderBottom: '1px solid var(--accent-line)', flexWrap: 'wrap',
    }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12.5, fontWeight: 650, color: 'var(--accent-2)' }}>
        <Icon name="shield" size={15} /> Modo administrador
      </span>
      <span style={{ fontSize: 13, color: 'var(--text-2)' }}>
        Viendo la cuenta de <b style={{ color: 'var(--text)' }}>{impersonating.tenantName}</b>
      </span>
      <div style={{ flex: 1 }} />
      <button
        onClick={() => { stopImpersonation(); navigate('/admin'); }}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          height: 30, padding: '0 12px', borderRadius: 99,
          border: '1px solid var(--accent-line)', background: 'var(--surface)',
          color: 'var(--accent-2)', fontSize: 12.5, fontWeight: 650, cursor: 'pointer',
        }}
      >
        <Icon name="arrowL" size={14} /> Volver al panel de administrador
      </button>
    </div>
  );
}

// ── AppShell ──────────────────────────────────────────────────────────────────
interface AppShellProps {
  title: string;
  children: React.ReactNode;
  unreadCount?: number;
}

export function AppShell({ title, children, unreadCount = 0 }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <style>{`
        @media (max-width: 1000px) {
          .cr-sidebar {
            position: fixed !important;
            left: 0; top: 0 !important; height: 100vh !important;
            z-index: 61; transform: translateX(-100%);
            transition: transform .28s var(--ease);
            box-shadow: var(--sh-3);
          }
          .cr-sidebar[data-open="true"] { transform: translateX(0); }
          .cr-burger { display: flex !important; }
        }
        @media (max-width: 720px) {
          .cr-search { display: none !important; }
          .cr-status { display: none !important; }
        }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} unreadCount={unreadCount} />

        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <ImpersonationBanner />
          <Topbar title={title} onMenu={() => setMobileOpen(true)} />
          <div style={{ flex: 1, padding: 24, maxWidth: 1240, width: '100%', margin: '0 auto' }}>
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
