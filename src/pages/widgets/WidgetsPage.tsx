import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/AppShell/AppShell';
import { Card, Segmented, Button } from '../../components/ui';

// ── Icons ─────────────────────────────────────────────────────────────────────
function Icon({ name, size = 18, stroke = 2, style }: {
  name: string; size?: number; stroke?: number; style?: React.CSSProperties;
}) {
  const paths: Record<string, string> = {
    message:  'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
    layers:   'M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    plus:     'M12 5v14M5 12h14',
    edit:     'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
    trash:    'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6',
    globe:    'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zm-7-9h14M12 3a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z',
    arrowUR:  'M7 17L17 7M7 7h10v10',
    check:    'M20 6 9 17l-5-5',
    x:        'M18 6 6 18M6 6l12 12',
    zap:      'M13 2 3 14h9l-1 8 10-12h-9l1-8z',
    copy:     'M20 9H11a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2zM5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 0 2 2v1',
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d={paths[name] || ''} />
    </svg>
  );
}

// ── Constants ─────────────────────────────────────────────────────────────────
const PLAN_WIDGET_LIMIT: Record<string, number> = { Prueba: 1, Starter: 1, Premium: 2 };

const WG_COLORS = [
  { name: 'Teal',    c: '#10B3AC', c2: '#0C928C' },
  { name: 'Azul',    c: '#3E63DD', c2: '#2D49B8' },
  { name: 'Violeta', c: '#7C5CFC', c2: '#6342E0' },
  { name: 'Verde',   c: '#1FA971', c2: '#178A5C' },
  { name: 'Naranja', c: '#E8930C', c2: '#C2790A' },
];

// ── Types ─────────────────────────────────────────────────────────────────────
interface WidgetItem {
  id: string;
  name: string;
  site: string;
  url: string;
  color: string;
  position: 'bottom-right' | 'bottom-left';
  status: 'active' | 'paused';
  leads: number;
  created: string;
  key: string;
}

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_WIDGETS: WidgetItem[] = [
  {
    id: 'b0000001-0000-0000-0000-000000000001',
    name: 'Widget Principal',
    site: 'dr-imports.com',
    url: 'https://dr-imports.com',
    color: '#10B3AC',
    position: 'bottom-right',
    status: 'active',
    leads: 612,
    created: 'mar 2024',
    key: 'mkt_live_d3f8a1c9b2',
  },
  {
    id: 'b0000002-0000-0000-0000-000000000002',
    name: 'Landing de Ofertas',
    site: 'ofertas.dr-imports.com',
    url: 'https://ofertas.dr-imports.com',
    color: '#3E63DD',
    position: 'bottom-left',
    status: 'active',
    leads: 394,
    created: 'ago 2024',
    key: 'mkt_live_77ac0e54fb',
  },
];

// ── Widget glyph preview ──────────────────────────────────────────────────────
function WidgetGlyph({ color, position, size = 120 }: { color: string; position: string; size?: number }) {
  const isRight = position.includes('right');
  return (
    <div style={{
      position: 'relative', height: size, borderRadius: 'var(--r-md)', overflow: 'hidden',
      background: 'var(--surface-2)', border: '1px solid var(--border)',
      backgroundImage: 'radial-gradient(var(--border) .7px, transparent .7px)',
      backgroundSize: '14px 14px',
    }}>
      <div style={{
        position: 'absolute', bottom: 12, [isRight ? 'right' : 'left']: 12,
        width: 38, height: 38, borderRadius: '50%',
        background: 'linear-gradient(140deg,#19232A,#0A0D10)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 6px 16px rgba(8,30,33,.35)',
      }}>
        <Icon name="message" size={18} style={{ color }} />
      </div>
    </div>
  );
}

// ── Modal shell ───────────────────────────────────────────────────────────────
function Modal({ title, sub, onClose, children, width = 460 }: {
  title: string; sub?: string; onClose: () => void;
  children: React.ReactNode; width?: number;
}) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: width, maxHeight: '90vh', overflowY: 'auto',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--r-xl)', boxShadow: 'var(--sh-pop)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '18px 22px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
          position: 'sticky', top: 0, background: 'var(--surface)',
        }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 750, letterSpacing: '-.02em' }}>{title}</div>
            {sub && <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 3 }}>{sub}</div>}
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 9, border: '1px solid var(--border)',
            background: 'var(--surface)', cursor: 'pointer', color: 'var(--text-3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Icon name="x" size={16} />
          </button>
        </div>
        <div style={{ padding: '20px 22px' }}>{children}</div>
      </div>
    </div>
  );
}

function WgLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-2)', marginBottom: 7 }}>{children}</div>;
}
function WgInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props} style={{
      width: '100%', height: 42, padding: '0 13px', borderRadius: 'var(--r-md)',
      border: '1px solid var(--border)', background: 'var(--surface)',
      fontSize: 14, color: 'var(--text)', outline: 'none', ...props.style,
    }} />
  );
}

// ── New widget modal ──────────────────────────────────────────────────────────
function NewWidgetModal({ onClose, onCreate, atLimit, plan, limit, onUpgrade }: {
  onClose: () => void; onCreate: (w: WidgetItem) => void;
  atLimit: boolean; plan: string; limit: number; onUpgrade: () => void;
}) {
  const [f, setF] = useState({
    name: '', site: '',
    color: WG_COLORS[0],
    position: 'bottom-right' as 'bottom-right' | 'bottom-left',
  });
  const set = (k: string, v: unknown) => setF(p => ({ ...p, [k]: v }));

  function cleanSite(s: string) { return s.trim().replace(/^https?:\/\//, '').replace(/\/$/, ''); }

  function submit() {
    const site = cleanSite(f.site) || 'sitio.com';
    onCreate({
      id: 'w' + Date.now(),
      name: f.name.trim() || 'Nuevo widget',
      site, url: 'https://' + site,
      color: f.color.c, position: f.position,
      status: 'active', leads: 0, created: 'jun 2026',
      key: 'mkt_live_' + Math.random().toString(36).slice(2, 12),
    });
    onClose();
  }

  if (atLimit) {
    return (
      <Modal
        title="Límite de widgets alcanzado"
        sub={`Tu plan ${plan} permite ${limit} widget${limit > 1 ? 's' : ''}.`}
        onClose={onClose} width={430}
      >
        <div style={{ display: 'flex', gap: 13, alignItems: 'flex-start', marginBottom: 18 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: 'var(--amber-soft)', color: 'var(--amber)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Icon name="zap" size={20} />
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.5 }}>
            Ya estás usando los <b style={{ color: 'var(--text)' }}>{limit} widget{limit > 1 ? 's' : ''}</b> incluidos en tu plan {plan}.{' '}
            {plan === 'Premium'
              ? 'Eliminá uno para crear otro.'
              : <>Mejorá a <b style={{ color: 'var(--text)' }}>Premium</b> para tener hasta 2 widgets, o eliminá uno existente.</>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>Entendido</Button>
          {plan !== 'Premium' && (
            <Button style={{ flex: 1, justifyContent: 'center' }} icon={<Icon name="zap" size={15} />} onClick={onUpgrade}>
              Mejorar plan
            </Button>
          )}
        </div>
      </Modal>
    );
  }

  return (
    <Modal title="Crear widget" sub="Cada widget se instala en un sitio web." onClose={onClose}>
      <div style={{ marginBottom: 16 }}>
        <WgLabel>Nombre del widget</WgLabel>
        <WgInput
          value={f.name} onChange={e => set('name', e.target.value)}
          placeholder="Ej. Widget Home" autoFocus
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <WgLabel>Sitio web asociado</WgLabel>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 0,
          border: '1px solid var(--border)', borderRadius: 'var(--r-md)',
          overflow: 'hidden', background: 'var(--surface)',
        }}>
          <span style={{
            padding: '0 11px', height: 42, display: 'flex', alignItems: 'center',
            fontSize: 13, color: 'var(--text-3)',
            background: 'var(--surface-2)', borderRight: '1px solid var(--border)',
            fontFamily: 'var(--mono)',
          }}>
            https://
          </span>
          <input
            value={f.site} onChange={e => set('site', e.target.value)}
            placeholder="www.tusitio.com"
            style={{
              flex: 1, height: 42, padding: '0 12px', border: 'none',
              outline: 'none', background: 'transparent', fontSize: 14, color: 'var(--text)',
            }}
          />
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <WgLabel>Color de acento</WgLabel>
        <div style={{ display: 'flex', gap: 10 }}>
          {WG_COLORS.map(col => (
            <button key={col.name} onClick={() => set('color', col)} title={col.name} style={{
              width: 36, height: 36, borderRadius: 10, cursor: 'pointer',
              background: `linear-gradient(135deg,${col.c},${col.c2})`,
              border: f.color.name === col.name ? '2px solid var(--text)' : '2px solid transparent',
              boxShadow: f.color.name === col.name
                ? `0 0 0 3px var(--surface), 0 0 0 4px ${col.c}`
                : 'var(--sh-1)',
              transition: 'all .15s',
            }} />
          ))}
        </div>
      </div>

      {/* Preview */}
      <div style={{ marginBottom: 16 }}>
        <WgLabel>Vista previa</WgLabel>
        <WidgetGlyph color={f.color.c} position={f.position} size={80} />
      </div>

      <div style={{ marginBottom: 20 }}>
        <WgLabel>Posición</WgLabel>
        <Segmented
          value={f.position} onChange={v => set('position', v)}
          options={[
            { value: 'bottom-left',  label: 'Inferior izq.' },
            { value: 'bottom-right', label: 'Inferior der.' },
          ]}
        />
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <Button variant="secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>Cancelar</Button>
        <Button style={{ flex: 1, justifyContent: 'center' }} icon={<Icon name="check" size={15} />} onClick={submit}>
          Crear widget
        </Button>
      </div>
    </Modal>
  );
}

// ── Delete widget modal ───────────────────────────────────────────────────────
function DeleteWidgetModal({ widget, onClose, onConfirm }: {
  widget: WidgetItem; onClose: () => void; onConfirm: () => void;
}) {
  return (
    <Modal title="Eliminar widget" onClose={onClose} width={420}>
      <div style={{ display: 'flex', gap: 13, alignItems: 'flex-start', marginBottom: 18 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12,
          background: 'var(--red-soft)', color: 'var(--red)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon name="trash" size={20} />
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.5 }}>
          Vas a eliminar <b style={{ color: 'var(--text)' }}>{widget.name}</b> de{' '}
          <b style={{ color: 'var(--text)' }}>{widget.site}</b>. El widget dejará de funcionar en ese sitio y se perderá su configuración.{' '}
          <span style={{ color: 'var(--green)' }}>Los leads ya capturados se conservan.</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <Button variant="secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>Cancelar</Button>
        <Button variant="danger" style={{ flex: 1, justifyContent: 'center' }}
          icon={<Icon name="trash" size={15} />}
          onClick={() => { onConfirm(); onClose(); }}
        >
          Sí, eliminar
        </Button>
      </div>
    </Modal>
  );
}

// ── Copy key button ───────────────────────────────────────────────────────────
function CopyKey({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  function copy(e: React.MouseEvent) {
    e.stopPropagation();
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
  return (
    <button onClick={copy} title="Copiar widget ID" style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontSize: 11.5, fontFamily: 'var(--mono)', color: copied ? 'var(--green)' : 'var(--text-3)',
      background: 'var(--surface)', border: '1px solid var(--border)',
      padding: '3px 9px', borderRadius: 7, cursor: 'pointer',
      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 170,
      transition: 'color .15s, border-color .15s',
    }}>
      <Icon name={copied ? 'check' : 'copy'} size={12} />
      {copied ? '¡Copiado!' : value}
    </button>
  );
}

// ── Widget card ───────────────────────────────────────────────────────────────
function WidgetCard({ w, onEdit, onDelete, onToggle }: {
  w: WidgetItem;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  const isActive = w.status === 'active';

  return (
    <Card pad={0} style={{ overflow: 'hidden' }}>
      <div style={{ padding: 16, display: 'flex', gap: 14 }}>
        {/* Glyph */}
        <div style={{ width: 120, flexShrink: 0 }}>
          <WidgetGlyph color={w.color} position={w.position} />
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 11, height: 11, borderRadius: 4, background: w.color, flexShrink: 0 }} />
            <span style={{
              fontSize: 15.5, fontWeight: 700, letterSpacing: '-.02em',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {w.name}
            </span>
            {/* Status pill */}
            <span style={{
              marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5,
              height: 22, padding: '0 9px', borderRadius: 99, fontSize: 11.5, fontWeight: 600, flexShrink: 0,
              background: isActive ? 'var(--green-soft)' : 'var(--surface-3)',
              color: isActive ? 'var(--green)' : 'var(--text-3)',
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: 99,
                background: isActive ? 'var(--green)' : 'var(--text-3)',
              }} />
              {isActive ? 'Activo' : 'Pausado'}
            </span>
          </div>

          {/* Site link */}
          <a
            href={w.url} target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 13, color: 'var(--text-2)', marginTop: 6, width: 'fit-content', textDecoration: 'none',
              transition: 'color .14s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--accent)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-2)'}
          >
            <Icon name="globe" size={14} style={{ color: 'var(--text-3)' }} />
            {w.site}
            <Icon name="arrowUR" size={12} style={{ color: 'var(--text-3)' }} />
          </a>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 20, marginTop: 'auto', paddingTop: 14 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-.02em' }}>
                {w.leads.toLocaleString('es')}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>leads captados</div>
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-.02em' }}>
                {w.position.includes('right') ? 'Der.' : 'Izq.'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>posición</div>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 3 }}>{w.created}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>creado</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div style={{
        padding: '11px 16px', borderTop: '1px solid var(--border)',
        background: 'var(--surface-2)', display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <CopyKey value={w.key} />
        <div style={{ flex: 1 }} />
        <Button size="sm" variant="ghost" onClick={onToggle} style={{ color: isActive ? 'var(--amber)' : 'var(--green)' }}>
          {isActive ? 'Pausar' : 'Activar'}
        </Button>
        <Button size="sm" variant="secondary" icon={<Icon name="edit" size={14} />} onClick={onEdit}>
          Editar
        </Button>
        <button onClick={onDelete} style={{
          width: 34, height: 34, borderRadius: 'var(--r-md)',
          border: '1px solid var(--border)', background: 'var(--surface)',
          cursor: 'pointer', color: 'var(--text-3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'color .15s, border-color .15s, background .15s',
        }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.color = 'var(--red)';
            el.style.borderColor = 'var(--red)';
            el.style.background = 'var(--red-soft)';
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.color = 'var(--text-3)';
            el.style.borderColor = 'var(--border)';
            el.style.background = 'var(--surface)';
          }}
        >
          <Icon name="trash" size={16} />
        </button>
      </div>
    </Card>
  );
}

// ── Widgets page ──────────────────────────────────────────────────────────────
export default function WidgetsPage() {
  const navigate = useNavigate();

  const plan  = 'Premium';
  const limit = PLAN_WIDGET_LIMIT[plan] ?? 1;

  const [widgets,  setWidgets]  = useState<WidgetItem[]>(MOCK_WIDGETS);
  const [showNew,  setShowNew]  = useState(false);
  const [delWidget, setDelWidget] = useState<WidgetItem | null>(null);

  const atLimit = widgets.length >= limit;

  const create = (w: WidgetItem) => setWidgets(list => [...list, w]);
  const remove = (id: string)    => setWidgets(list => list.filter(w => w.id !== id));
  const toggle = (id: string)    => setWidgets(list =>
    list.map(w => w.id === id ? { ...w, status: w.status === 'active' ? 'paused' : 'active' } : w)
  );

  return (
    <AppShell title="Widgets">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 14, color: 'var(--text-2)' }}>
            Gestioná los widgets instalados en tus sitios web.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, height: 30, padding: '0 12px',
              borderRadius: 99, background: 'var(--surface-2)', border: '1px solid var(--border)',
            }}>
              <Icon name="layers" size={14} style={{ color: 'var(--accent-2)' }} />
              <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-2)' }}>
                {widgets.length} / {limit} widgets
              </span>
            </div>
            <span style={{ fontSize: 12.5, color: 'var(--text-3)' }}>Plan {plan}</span>
          </div>
        </div>
        <Button icon={<Icon name="plus" size={16} />} onClick={() => setShowNew(true)}>
          Crear widget
        </Button>
      </div>

      {/* Plan limit banner */}
      {atLimit && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px',
          borderRadius: 'var(--r-md)', marginBottom: 16,
          background: 'var(--amber-soft)', border: '1px solid rgba(232,147,12,.3)',
        }}>
          <Icon name="zap" size={18} style={{ color: 'var(--amber)', flexShrink: 0 }} />
          <div style={{ flex: 1, fontSize: 13, color: 'var(--text-2)', lineHeight: 1.4 }}>
            Usaste los <b style={{ color: 'var(--text)' }}>{limit} widget{limit > 1 ? 's' : ''}</b> de tu plan {plan}.
            {plan !== 'Premium' && (
              <> Mejorá a <b style={{ color: 'var(--text)' }}>Premium</b> para tener hasta 2 widgets.</>
            )}
          </div>
          {plan !== 'Premium' && (
            <Button size="sm" onClick={() => navigate('/app/account')}>Mejorar plan</Button>
          )}
        </div>
      )}

      {/* Widget grid */}
      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 16 }}
        className="wg-grid"
      >
        {widgets.map(w => (
          <WidgetCard
            key={w.id} w={w}
            onEdit={() => navigate(`/app/builder/${w.id}`)}
            onDelete={() => setDelWidget(w)}
            onToggle={() => toggle(w.id)}
          />
        ))}

        {/* Add new slot */}
        {!atLimit && (
          <button
            onClick={() => setShowNew(true)}
            style={{
              minHeight: 200, borderRadius: 'var(--r-lg)',
              border: '1.5px dashed var(--border-2)',
              background: 'transparent', cursor: 'pointer',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 10,
              color: 'var(--text-3)', transition: 'border-color .15s, color .15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)';
              (e.currentTarget as HTMLElement).style.color = 'var(--accent-2)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-2)';
              (e.currentTarget as HTMLElement).style.color = 'var(--text-3)';
            }}
          >
            <div style={{
              width: 46, height: 46, borderRadius: 13,
              background: 'var(--accent-soft)', color: 'var(--accent-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="plus" size={22} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Crear nuevo widget</span>
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Asocialo a un sitio web</span>
          </button>
        )}
      </div>

      {/* Modals */}
      {showNew && (
        <NewWidgetModal
          atLimit={atLimit} plan={plan} limit={limit}
          onUpgrade={() => { setShowNew(false); navigate('/app/account'); }}
          onClose={() => setShowNew(false)}
          onCreate={create}
        />
      )}
      {delWidget && (
        <DeleteWidgetModal
          widget={delWidget}
          onClose={() => setDelWidget(null)}
          onConfirm={() => remove(delWidget.id)}
        />
      )}

      <style>{`@media (max-width: 560px) { .wg-grid { grid-template-columns: 1fr !important; } }`}</style>
    </AppShell>
  );
}
