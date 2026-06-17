import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Segmented, Button, Sparkline, Avatar, ThemeToggle } from '../../components/ui';
import { logout } from '../../services/auth';

// ── Icons ─────────────────────────────────────────────────────────────────────
function Icon({ name, size = 18, stroke = 2, style }: {
  name: string; size?: number; stroke?: number; style?: React.CSSProperties;
}) {
  const paths: Record<string, string> = {
    building:  'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10',
    card:      'M1 6h22a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zM1 10h22',
    shield:    'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    logout:    'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
    inbox:     'M22 12h-6l-2 3h-4l-2-3H2M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z',
    zap:       'M13 2 3 14h9l-1 8 10-12h-9l1-8z',
    message:   'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
    trend:     'M23 6l-9.5 9.5-5-5L1 18',
    clock:     'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zm0-6v-4l3-3',
    sparkles:  'M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z',
    search:    'M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z',
    plus:      'M12 5v14M5 12h14',
    trash:     'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6',
    check:     'M20 6 9 17l-5-5',
    x:         'M18 6 6 18M6 6l12 12',
    download:  'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
    arrowR:    'M5 12h14M12 5l7 7-7 7',
    eye:       'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zm11 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    menu:      'M3 12h18M3 6h18M3 18h18',
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d={paths[name] || ''} />
    </svg>
  );
}

// ── Constants ─────────────────────────────────────────────────────────────────
const PLAN_PRICE: Record<string, number> = { Prueba: 0, Starter: 10000, Premium: 20000 };
const PLAN_TONE:  Record<string, string> = { Prueba: 'var(--amber)', Starter: 'var(--accent)', Premium: 'var(--violet)' };

const BILL_DATES = ['15 jun 2026','18 jun 2026','22 jun 2026','27 jun 2026','01 jul 2026','05 jul 2026','09 jul 2026'];
const PAY_MONTHS = ['Dic','Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov'];

function fmt(n: number) { return '$' + n.toLocaleString('es'); }

// ── Mock clients ──────────────────────────────────────────────────────────────
interface Client {
  id: string; name: string; initials: string; industry: string; domain: string;
  plan: string; status: 'active' | 'trial' | 'paused';
  widgets: number; leadsMonth: number; leadsTotal: number; unread: number;
  owner: string; email: string; lastActivity: string; installed: string;
  color: string; series: number[];
}

const MOCK_CLIENTS: Client[] = [
  { id:'c1', name:'Dr. Imports',      initials:'DI', industry:'Autopartes · e-commerce', domain:'dr-imports.com',    plan:'Premium', status:'active',  widgets:2, leadsMonth:1006, leadsTotal:8842, unread:18, owner:'Darío Ostan',       email:'drostan@drimports.com.ar',    lastActivity:'hace 2 min',  installed:'mar 2024', color:'#10B3AC', series:[18,22,15,28,19,31,24,38,29,42,35,51,44,58] },
  { id:'c2', name:'NorAutos',          initials:'NA', industry:'Concesionaria',           domain:'norautos.com.ar',   plan:'Starter', status:'active',  widgets:1, leadsMonth:642,  leadsTotal:4120,  unread:7,  owner:'Mariela Soto',       email:'msoto@norautos.com.ar',       lastActivity:'hace 1 h',    installed:'ago 2024', color:'#3E63DD', series:[12,9,14,11,16,13,18,15,20,17,22,19,24,21] },
  { id:'c3', name:'TecnoStore',        initials:'TS', industry:'Electrónica · retail',    domain:'tecnostore.shop',   plan:'Premium', status:'active',  widgets:2, leadsMonth:1840, leadsTotal:15600, unread:41, owner:'Pablo Quinteros',    email:'pquinteros@tecnostore.shop',  lastActivity:'hace 8 min',  installed:'ene 2024', color:'#7C5CFC', series:[42,51,38,62,49,71,55,80,63,91,72,105,84,120] },
  { id:'c4', name:'Bahía Repuestos',   initials:'BR', industry:'Náutica',                 domain:'bahiarepuestos.com', plan:'Prueba', status:'trial',   widgets:1, leadsMonth:88,   leadsTotal:88,    unread:5,  owner:'Lucas Vidal',        email:'lvidal@bahiarepuestos.com',   lastActivity:'hace 3 h',    installed:'jun 2026', color:'#1FA971', series:[0,0,0,0,0,2,4,6,5,8,7,10,9,12] },
  { id:'c5', name:'MaxParts',          initials:'MP', industry:'Mayorista',               domain:'maxparts.com.ar',   plan:'Starter', status:'active',  widgets:1, leadsMonth:530,  leadsTotal:6210,  unread:12, owner:'Inés Robledo',       email:'irobledo@maxparts.com.ar',    lastActivity:'hace 30 min', installed:'nov 2023', color:'#E8930C', series:[10,13,9,16,12,18,14,20,16,22,18,25,20,28] },
  { id:'c6', name:'AutoFleet SA',      initials:'AF', industry:'Flota corporativa',       domain:'autofleet.com.ar',  plan:'Starter', status:'paused',  widgets:1, leadsMonth:0,    leadsTotal:940,   unread:0,  owner:'Roberto Suárez',     email:'rsuarez@autofleet.com.ar',    lastActivity:'hace 6 días', installed:'abr 2024', color:'#E5519A', series:[8,6,9,5,7,4,6,3,5,2,4,1,0,0] },
];

// ── Client status pill ────────────────────────────────────────────────────────
const STATUS_DEF: Record<string, { label: string; color: string; soft: string }> = {
  active: { label: 'Activo',   color: 'var(--green)',  soft: 'var(--green-soft)'  },
  trial:  { label: 'Prueba',   color: 'var(--amber)',  soft: 'var(--amber-soft)'  },
  paused: { label: 'Pausado',  color: 'var(--text-3)', soft: 'var(--surface-3)'   },
};
function ClientStatus({ s }: { s: string }) {
  const c = STATUS_DEF[s] ?? STATUS_DEF.active;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      height: 24, padding: '0 10px', borderRadius: 99,
      background: c.soft, color: c.color, fontSize: 12, fontWeight: 600,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 99, background: c.color }} />
      {c.label}
    </span>
  );
}

// ── Plan badge ────────────────────────────────────────────────────────────────
function PlanBadge({ plan }: { plan: string }) {
  const tone = PLAN_TONE[plan] ?? 'var(--text-3)';
  return (
    <span style={{
      fontSize: 11.5, fontWeight: 700, color: tone,
      background: tone + '1a', padding: '3px 9px', borderRadius: 99,
    }}>
      {plan}
    </span>
  );
}

// ── Admin KPI card ────────────────────────────────────────────────────────────
function AdminKpi({ icon, label, value, delta, tone }: {
  icon: string; label: string; value: string; delta?: number | null; tone: string;
}) {
  return (
    <Card pad={18} hover>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: tone + '1a', color: tone,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name={icon} size={18} />
        </div>
        {delta != null && (
          <span style={{ fontSize: 12, fontWeight: 700, color: delta >= 0 ? 'var(--green)' : 'var(--red)' }}>
            {delta >= 0 ? '+' : ''}{delta}%
          </span>
        )}
      </div>
      <div style={{ fontSize: 27, fontWeight: 800, letterSpacing: '-.03em', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 5, fontWeight: 500 }}>{label}</div>
    </Card>
  );
}

// ── Page header ───────────────────────────────────────────────────────────────
function AdmPageHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <h1 style={{ fontSize: 23, fontWeight: 800, letterSpacing: '-.025em', margin: 0 }}>{title}</h1>
          <span style={{
            fontSize: 10.5, fontWeight: 700, letterSpacing: '.04em',
            color: 'var(--accent-2)', background: 'var(--accent-soft)',
            padding: '2px 8px', borderRadius: 99,
          }}>SUPERADMIN</span>
        </div>
        {subtitle && <div style={{ fontSize: 14, color: 'var(--text-3)', marginTop: 5 }}>{subtitle}</div>}
      </div>
      {right}
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function Modal({ title, sub, onClose, children, width = 470 }: {
  title: string; sub?: string; onClose: () => void; children: React.ReactNode; width?: number;
}) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(3px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: width, maxHeight: '90vh', overflowY: 'auto',
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--r-xl)', boxShadow: 'var(--sh-pop)',
      }}>
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

function AField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 15 }}>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-2)', marginBottom: 7 }}>{label}</div>
      {children}
    </div>
  );
}
function AInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props} style={{
      width: '100%', height: 42, padding: '0 13px', borderRadius: 'var(--r-md)',
      border: '1px solid var(--border)', background: 'var(--surface)',
      fontSize: 14, color: 'var(--text)', outline: 'none',
    }} />
  );
}

const NEW_COLORS = ['#10B3AC','#3E63DD','#7C5CFC','#1FA971','#E8930C','#E5519A','#0EA5E9','#EF6C2E'];
function initialsOf(name: string) {
  return (name || '').trim().split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'CL';
}

// ── New client modal ──────────────────────────────────────────────────────────
function NewClientModal({ onClose, onCreate, index }: {
  onClose: () => void; onCreate: (c: Client) => void; index: number;
}) {
  const [f, setF] = useState({ name: '', domain: '', industry: '', plan: 'Starter', status: 'active' as const, owner: '', email: '' });
  const set = (k: string, v: string) => setF(p => ({ ...p, [k]: v }));
  const color = NEW_COLORS[index % NEW_COLORS.length];
  const ini = initialsOf(f.name) || 'CL';

  function submit() {
    onCreate({
      id: 'c' + Date.now(),
      name: f.name.trim() || 'Nuevo cliente',
      initials: ini, industry: f.industry.trim() || 'Sin categoría',
      domain: f.domain.trim() || 'sitio.com',
      plan: f.plan, status: f.status as Client['status'],
      widgets: 1, leadsMonth: 0, leadsTotal: 0, unread: 0,
      owner: f.owner.trim() || '—', email: f.email.trim(),
      lastActivity: 'recién', installed: 'jun 2026', color,
      series: Array(14).fill(0),
    });
    onClose();
  }

  return (
    <Modal title="Dar de alta un cliente" sub="Creá una cuenta y enviá el código de instalación del widget." onClose={onClose}>
      {/* Preview */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 13, marginBottom: 18,
        padding: '12px 14px', borderRadius: 'var(--r-md)',
        background: 'var(--surface-2)', border: '1px solid var(--border)',
      }}>
        <div style={{
          width: 46, height: 46, borderRadius: 12, background: color, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 16, flexShrink: 0,
        }}>
          {ini}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14.5, fontWeight: 700 }}>{f.name || 'Nombre del cliente'}</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-3)' }}>{f.domain || 'dominio.com'}</div>
        </div>
      </div>

      <AField label="Nombre del negocio">
        <AInput value={f.name} onChange={e => set('name', e.target.value)} placeholder="Ej. Repuestos del Sur" autoFocus />
      </AField>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <AField label="Dominio"><AInput value={f.domain} onChange={e => set('domain', e.target.value)} placeholder="sitio.com" /></AField>
        <AField label="Rubro"><AInput value={f.industry} onChange={e => set('industry', e.target.value)} placeholder="Ej. Autopartes" /></AField>
      </div>
      <AField label="Plan">
        <Segmented value={f.plan} onChange={v => set('plan', v)}
          options={[{ value: 'Prueba', label: 'Prueba' }, { value: 'Starter', label: 'Starter' }, { value: 'Premium', label: 'Premium' }]} />
      </AField>
      <AField label="Estado inicial">
        <Segmented value={f.status} onChange={v => set('status', v)}
          options={[{ value: 'active', label: 'Activo' }, { value: 'trial', label: 'Prueba' }, { value: 'paused', label: 'Pausado' }]} />
      </AField>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <AField label="Responsable"><AInput value={f.owner} onChange={e => set('owner', e.target.value)} placeholder="Nombre y apellido" /></AField>
        <AField label="Email de acceso"><AInput value={f.email} onChange={e => set('email', e.target.value)} placeholder="cliente@email.com" /></AField>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <Button variant="secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>Cancelar</Button>
        <Button style={{ flex: 1, justifyContent: 'center' }} icon={<Icon name="check" size={15} />} onClick={submit}>Crear cliente</Button>
      </div>
    </Modal>
  );
}

// ── Delete client modal ───────────────────────────────────────────────────────
function DeleteClientModal({ client, onClose, onConfirm }: { client: Client; onClose: () => void; onConfirm: () => void }) {
  return (
    <Modal title="Eliminar cliente" onClose={onClose} width={420}>
      <div style={{ display: 'flex', gap: 13, alignItems: 'flex-start', marginBottom: 18 }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--red-soft)', color: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name="trash" size={20} />
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.5 }}>
          Vas a eliminar la cuenta de <b style={{ color: 'var(--text)' }}>{client.name}</b> ({client.domain}). Se desinstalará el widget y se perderá el acceso a sus{' '}
          <b style={{ color: 'var(--text)' }}>{client.leadsTotal.toLocaleString('es')} leads</b>. Esta acción no se puede deshacer.
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <Button variant="secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>Cancelar</Button>
        <Button variant="danger" style={{ flex: 1, justifyContent: 'center' }} icon={<Icon name="trash" size={15} />}
          onClick={() => { onConfirm(); onClose(); }}>Sí, eliminar</Button>
      </div>
    </Modal>
  );
}

// ── Revenue chart ─────────────────────────────────────────────────────────────
function RevenueChart({ series, splitIndex, labels, h = 210 }: {
  series: number[]; splitIndex: number; labels: string[]; h?: number;
}) {
  const w = 720, pad = 12;
  const max = Math.max(...series) * 1.18 || 1;
  const X = (i: number) => pad + (i / (series.length - 1)) * (w - pad * 2);
  const Y = (v: number) => h - 26 - (v / max) * (h - 46);
  const id = 'rv' + Math.random().toString(36).slice(2, 6);

  const actPoints = series.slice(0, splitIndex + 1);
  const proPoints = series.slice(splitIndex);
  const actLine = actPoints.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(' ');
  const proLine  = proPoints.map((v, i) => `${i ? 'L' : 'M'}${X(splitIndex + i).toFixed(1)} ${Y(v).toFixed(1)}`).join(' ');
  const actArea  = actLine + ` L${X(splitIndex).toFixed(1)} ${h - 26} L${X(0).toFixed(1)} ${h - 26} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--accent)" stopOpacity=".22" />
          <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, .25, .5, .75, 1].map((g, i) => (
        <line key={i} x1={pad} x2={w - pad} y1={26 + g * (h - 52)} y2={26 + g * (h - 52)}
          stroke="var(--border)" strokeWidth="1" strokeDasharray="3 5" />
      ))}
      <path d={actArea} fill={`url(#${id})`} />
      <path d={actLine} fill="none" stroke="var(--accent)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d={proLine} fill="none" stroke="var(--accent)" strokeWidth="2.4" strokeDasharray="2 6" strokeLinecap="round" opacity=".75" />
      <line x1={X(splitIndex)} x2={X(splitIndex)} y1="18" y2={h - 26} stroke="var(--text-3)" strokeWidth="1" strokeDasharray="2 4" opacity=".5" />
      <text x={X(splitIndex)} y="12" fontSize="10" fontWeight="700" fill="var(--text-3)" textAnchor="middle">HOY</text>
      <circle cx={X(splitIndex)} cy={Y(series[splitIndex])} r="3.6" fill="var(--accent)" stroke="var(--surface)" strokeWidth="2" />
      {labels.map((l, i) => i % 2 === 0 && (
        <text key={i} x={X(i)} y={h - 8} fontSize="10" fill="var(--text-3)" textAnchor="middle">{l}</text>
      ))}
    </svg>
  );
}

// ── Clients panel ─────────────────────────────────────────────────────────────
function ClientsPanel({ clients, onAdd, onDelete }: {
  clients: Client[];
  onAdd: (c: Client) => void;
  onDelete: (id: string) => void;
}) {
  const [q,         setQ]         = useState('');
  const [filter,    setFilter]    = useState('all');
  const [showAdd,   setShowAdd]   = useState(false);
  const [delClient, setDelClient] = useState<Client | null>(null);

  const total      = clients.length;
  const active     = clients.filter(c => c.status === 'active').length;
  const leadsMonth = clients.reduce((a, c) => a + (c.leadsMonth || 0), 0);
  const widgets    = clients.reduce((a, c) => a + (c.widgets || 0), 0);
  const mrr        = clients.filter(c => c.status === 'active').reduce((a, c) => a + (PLAN_PRICE[c.plan] || 0), 0);

  const list = clients.filter(c =>
    (filter === 'all' || c.status === filter) &&
    (q === '' || c.name.toLowerCase().includes(q.toLowerCase()) || c.domain.includes(q.toLowerCase()))
  );

  return (
    <>
      <AdmPageHeader title="Clientes instalados" subtitle="Gestioná todas las cuentas con MKTRobot instalado." />

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 22 }} className="ad-kpis">
        <AdminKpi icon="building" tone="var(--accent)"  label="Clientes activos"          value={`${active} / ${total}`}            delta={8}    />
        <AdminKpi icon="inbox"    tone="var(--blue)"    label="Leads este mes (global)"    value={leadsMonth.toLocaleString('es')}   delta={12}   />
        <AdminKpi icon="zap"      tone="var(--violet)"  label="MRR"                        value={fmt(mrr)}                          delta={9.8}  />
        <AdminKpi icon="message"  tone="var(--green)"   label="Widgets activos"            value={String(widgets)}                   delta={4}    />
      </div>

      {/* Table */}
      <Card pad={0} style={{ overflow: 'hidden' }}>
        <div style={{
          padding: '16px 20px', display: 'flex', alignItems: 'center',
          gap: 12, flexWrap: 'wrap', borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ fontSize: 16, fontWeight: 750, letterSpacing: '-.02em' }}>Clientes instalados</div>
          <span style={{ fontSize: 12.5, color: 'var(--text-3)' }}>{total} cuentas</span>
          <div style={{ flex: 1 }} />
          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, height: 38, padding: '0 12px',
            borderRadius: 'var(--r-md)', background: 'var(--surface-2)', border: '1px solid var(--border)',
            minWidth: 180, color: 'var(--text-3)',
          }}>
            <Icon name="search" size={16} />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar…"
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, flex: 1, color: 'var(--text)', minWidth: 0 }} />
          </div>
          <Segmented value={filter} onChange={setFilter} options={[
            { value: 'all',    label: 'Todos'    },
            { value: 'active', label: 'Activos'  },
            { value: 'trial',  label: 'Prueba'   },
            { value: 'paused', label: 'Pausados' },
          ]} />
          <Button size="sm" icon={<Icon name="plus" size={14} />} onClick={() => setShowAdd(true)}>
            Nuevo cliente
          </Button>
        </div>

        {/* Column headers */}
        <div className="ad-thead" style={{
          display: 'grid', gridTemplateColumns: '2.2fr 1fr 1fr 1.4fr 168px', gap: 14,
          padding: '11px 20px', borderBottom: '1px solid var(--border)',
          fontSize: 11.5, fontWeight: 700, letterSpacing: '.03em',
          color: 'var(--text-3)', textTransform: 'uppercase',
        }}>
          <span>Cliente</span><span>Plan</span><span>Estado</span><span>Leads / mes</span><span />
        </div>

        {list.length === 0 && (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-3)' }}>
            <Icon name="building" size={28} style={{ opacity: .5 }} />
            <div style={{ fontSize: 14, marginTop: 10 }}>No hay clientes que coincidan.</div>
          </div>
        )}

        {list.map((c, i) => (
          <div key={c.id} className="ad-trow" style={{
            display: 'grid', gridTemplateColumns: '2.2fr 1fr 1fr 1.4fr 168px', gap: 14,
            padding: '14px 20px', borderTop: i ? '1px solid var(--border)' : 'none',
            alignItems: 'center', cursor: 'pointer', transition: 'background .14s',
          }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
          >
            {/* Client */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12, background: c.color, color: '#fff', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15,
              }}>
                {c.initials}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 650, display: 'flex', alignItems: 'center', gap: 7 }}>
                  {c.name}
                  {c.unread > 0 && (
                    <span style={{
                      fontSize: 10.5, fontWeight: 700, color: 'var(--red)',
                      background: 'var(--red-soft)', padding: '1px 7px', borderRadius: 99,
                    }}>
                      {c.unread} sin leer
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {c.domain} · {c.industry}
                </div>
              </div>
            </div>

            {/* Plan */}
            <div className="ad-cell"><PlanBadge plan={c.plan} /></div>

            {/* Status */}
            <div className="ad-cell"><ClientStatus s={c.status} /></div>

            {/* Leads */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{c.leadsMonth.toLocaleString('es')}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{c.lastActivity}</div>
              </div>
              <div className="ad-spark">
                <Sparkline data={c.series} color={c.color} width={72} height={30} />
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
              <Button size="sm" variant="secondary" iconend={<Icon name="arrowR" size={14} />}
                onClick={e => { e.stopPropagation(); }}
              >
                Abrir
              </Button>
              <button onClick={e => { e.stopPropagation(); setDelClient(c); }} style={{
                width: 34, height: 34, borderRadius: 'var(--r-md)',
                border: '1px solid var(--border)', background: 'var(--surface)',
                cursor: 'pointer', color: 'var(--text-3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'color .15s, border-color .15s, background .15s',
              }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = 'var(--red)'; el.style.borderColor = 'var(--red)'; el.style.background = 'var(--red-soft)'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = 'var(--text-3)'; el.style.borderColor = 'var(--border)'; el.style.background = 'var(--surface)'; }}
              >
                <Icon name="trash" size={15} />
              </button>
            </div>
          </div>
        ))}
      </Card>

      {showAdd && <NewClientModal index={clients.length} onClose={() => setShowAdd(false)} onCreate={onAdd} />}
      {delClient && <DeleteClientModal client={delClient} onClose={() => setDelClient(null)} onConfirm={() => onDelete(delClient.id)} />}

      <style>{`
        @media (max-width:1080px) { .ad-kpis { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width:820px)  { .ad-thead { grid-template-columns: 1fr 120px !important; } .ad-trow { grid-template-columns: 1fr 120px !important; } .ad-cell,.ad-spark { display: none !important; } }
      `}</style>
    </>
  );
}

// ── Payments panel ────────────────────────────────────────────────────────────
function PaymentsPanel({ clients }: { clients: Client[] }) {
  const paying = clients.filter(c => c.status === 'active');
  const trials  = clients.filter(c => c.status === 'trial');
  const mrr     = paying.reduce((a, c) => a + (PLAN_PRICE[c.plan] || 0), 0);
  const arr     = mrr * 12;
  const trialPotential = trials.reduce((a, _c) => a + (PLAN_PRICE['Starter'] || 0), 0);
  const cur = mrr || 1;
  const series = [0.55, 0.62, 0.7, 0.78, 0.86, 0.93, 1, 1.07, 1.15, 1.24, 1.33, 1.43].map(f => Math.round(cur * f));
  const splitIndex = 6;

  const planRows = (['Premium', 'Starter'] as const).map(p => {
    const cs = paying.filter(c => c.plan === p);
    return { plan: p, count: cs.length, total: cs.length * PLAN_PRICE[p], tone: p === 'Premium' ? 'var(--violet)' : 'var(--accent)' };
  });
  const maxPlan = Math.max(...planRows.map(r => r.total), 1);

  const upcoming = clients.filter(c => c.status !== 'paused').map((c, i) => ({
    c, amount: PLAN_PRICE[c.plan] || (c.status === 'trial' ? PLAN_PRICE['Starter'] : 0),
    date: BILL_DATES[i % BILL_DATES.length],
    trial: c.status === 'trial',
  }));

  return (
    <>
      <AdmPageHeader
        title="Pagos e ingresos"
        subtitle="Facturación recurrente, ingresos actuales y proyección futura."
        right={
          <div style={{ display: 'flex', gap: 10 }}>
            <Button size="sm" variant="secondary" icon={<Icon name="download" size={14} />}>Exportar</Button>
            <Button size="sm" icon={<Icon name="card" size={14} />}>Cobrar ahora</Button>
          </div>
        }
      />

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 18 }} className="ad-kpis">
        <AdminKpi icon="card"     tone="var(--green)"  label="MRR · ingreso mensual"         value={fmt(mrr)}              delta={9.8}  />
        <AdminKpi icon="trend"    tone="var(--accent)"  label="ARR proyectado (anual)"        value={fmt(arr)}              delta={11.4} />
        <AdminKpi icon="clock"    tone="var(--amber)"   label="Por cobrar · próx. 30 días"    value={fmt(mrr)}              delta={null} />
        <AdminKpi icon="sparkles" tone="var(--violet)"  label="En prueba · ingreso potencial" value={fmt(trialPotential)}   delta={null} />
      </div>

      {/* Revenue chart + by plan */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 16, marginBottom: 16 }} className="ad-grid2">
        <Card pad={20}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div style={{ fontSize: 15.5, fontWeight: 700, letterSpacing: '-.02em' }}>Evolución de ingresos</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 2 }}>Recurrente mensual · real y proyectado</div>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              {[{ w: 14, h: 3, label: 'Real', dash: false }, { w: 14, h: 0, label: 'Proyectado', dash: true }].map((l, i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--text-2)', fontWeight: 600 }}>
                  <span style={{ width: l.w, height: l.h, borderRadius: 2, background: l.dash ? 'none' : 'var(--accent)', borderTop: l.dash ? '2px dashed var(--accent)' : 'none' }} />
                  {l.label}
                </span>
              ))}
            </div>
          </div>
          <RevenueChart series={series} splitIndex={splitIndex} labels={PAY_MONTHS} />
        </Card>

        <Card pad={20}>
          <div style={{ fontSize: 15.5, fontWeight: 700, letterSpacing: '-.02em', marginBottom: 4 }}>MRR por plan</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginBottom: 18 }}>Aporte de cada plan al ingreso</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {planRows.map((r, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 7 }}>
                  <span style={{ color: 'var(--text-2)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ width: 9, height: 9, borderRadius: 3, background: r.tone }} />{r.plan}
                    <span style={{ color: 'var(--text-3)', fontWeight: 500 }}>· {r.count}</span>
                  </span>
                  <span style={{ fontWeight: 700 }}>{fmt(r.total)}</span>
                </div>
                <div style={{ height: 9, borderRadius: 99, background: 'var(--surface-2)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: Math.max(3, (r.total / maxPlan) * 100) + '%', borderRadius: 99, background: r.tone, transition: 'width .6s var(--ease)' }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 600 }}>Total MRR</span>
            <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-.02em' }}>{fmt(mrr)}</span>
          </div>
        </Card>
      </div>

      {/* Upcoming payments */}
      <Card pad={0} style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 15.5, fontWeight: 750, letterSpacing: '-.02em' }}>Próximos cobros</div>
          <span style={{ fontSize: 12.5, color: 'var(--text-3)' }}>{upcoming.length} programados</span>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)' }}>
            {fmt(upcoming.reduce((a, r) => a + r.amount, 0))}{' '}
            <span style={{ color: 'var(--text-3)', fontWeight: 500 }}>este ciclo</span>
          </span>
        </div>
        <div className="pay-thead" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.3fr', gap: 14, padding: '11px 20px', borderBottom: '1px solid var(--border)', fontSize: 11.5, fontWeight: 700, letterSpacing: '.03em', color: 'var(--text-3)', textTransform: 'uppercase' }}>
          <span>Cliente</span><span>Plan</span><span>Monto</span><span>Próximo cobro</span>
        </div>
        {upcoming.map((r, i) => (
          <div key={r.c.id} className="pay-trow" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.3fr', gap: 14, padding: '13px 20px', borderTop: i ? '1px solid var(--border)' : 'none', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: r.c.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                {r.c.initials}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 650, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.c.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }} className="pay-cell">{r.c.domain}</div>
              </div>
            </div>
            <div className="pay-cell"><PlanBadge plan={r.c.plan} /></div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>
              {r.amount ? fmt(r.amount) : '—'}
              <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500 }}>/mes</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 600 }}>{r.date}</span>
              {r.trial
                ? <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--amber)', background: 'var(--amber-soft)', padding: '2px 8px', borderRadius: 99 }}>Fin de prueba</span>
                : <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--green)', background: 'var(--green-soft)', padding: '2px 8px', borderRadius: 99 }}>Al día</span>
              }
            </div>
          </div>
        ))}
      </Card>

      <style>{`
        @media (max-width:1080px) { .ad-grid2 { grid-template-columns: 1fr !important; } }
        @media (max-width:680px)  { .pay-thead { grid-template-columns: 1.5fr 1fr 1fr !important; } .pay-trow { grid-template-columns: 1.5fr 1fr 1fr !important; } .pay-cell { display: none !important; } }
      `}</style>
    </>
  );
}

// ── Admin sidebar ─────────────────────────────────────────────────────────────
function AdminSidebar({ tab, setTab, onLogout, email }: {
  tab: string; setTab: (t: string) => void; onLogout: () => void; email: string;
}) {
  const items = [
    { id: 'clients',  label: 'Clientes', icon: 'building' },
    { id: 'payments', label: 'Pagos',    icon: 'card'     },
  ];

  return (
    <aside className="adm-sidebar" style={{
      width: 240, flexShrink: 0, background: 'var(--surface)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', padding: '16px 14px', gap: 4,
      position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
    }}>
      {/* Brand */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: 10,
        borderRadius: 'var(--r-md)', border: '1px solid var(--border)',
        background: 'var(--surface-2)', marginBottom: 8,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(140deg,#19232A,#0A0D10)',
          color: '#2BD3CB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon name="shield" size={19} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700 }}>MKT Negocios</div>
          <div style={{ fontSize: 11, color: 'var(--accent-2)', fontWeight: 600 }}>Superadmin</div>
        </div>
      </div>

      <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.06em', color: 'var(--text-3)', padding: '6px 12px 2px' }}>
        ADMINISTRACIÓN
      </div>

      {items.map(it => {
        const act = it.id === tab;
        return (
          <button key={it.id} onClick={() => setTab(it.id)} style={{
            display: 'flex', alignItems: 'center', gap: 11, height: 40, padding: '0 12px',
            borderRadius: 'var(--r-md)', border: 'none', cursor: 'pointer', textAlign: 'left', position: 'relative',
            background: act ? 'var(--accent-soft)' : 'transparent',
            color: act ? 'var(--accent-2)' : 'var(--text-2)',
            fontSize: 14, fontWeight: act ? 650 : 500, letterSpacing: '-.01em',
            transition: 'background .15s, color .15s',
          }}
            onMouseEnter={e => { if (!act) { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; (e.currentTarget as HTMLElement).style.color = 'var(--text)'; } }}
            onMouseLeave={e => { if (!act) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-2)'; } }}
          >
            {act && <span style={{ position: 'absolute', left: -2, top: 9, bottom: 9, width: 3, borderRadius: 99, background: 'var(--accent)' }} />}
            <Icon name={it.icon} size={18} />
            <span style={{ flex: 1 }}>{it.label}</span>
          </button>
        );
      })}

      <div style={{ flex: 1 }} />

      {/* Theme toggle */}
      <div style={{ padding: '4px 4px 8px' }}>
        <ThemeToggle />
      </div>

      {/* Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 8, borderRadius: 'var(--r-md)' }}>
        <Avatar name={email} size={34} color="var(--accent)" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 650, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {email.split('@')[0]}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {email}
          </div>
        </div>
        <button onClick={onLogout} title="Cerrar sesión" style={{
          width: 30, height: 30, borderRadius: 9, border: 'none',
          background: 'transparent', cursor: 'pointer', color: 'var(--text-3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'color .15s',
        }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--red)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-3)'}
        >
          <Icon name="logout" size={16} />
        </button>
      </div>
    </aside>
  );
}

// ── Admin page ────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const navigate = useNavigate();
  const [tab,     setTab]     = useState('clients');
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <>
      <style>{`
        @media (max-width: 900px) {
          .adm-sidebar { display: none !important; }
          .adm-mobile-tabs { display: flex !important; }
        }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <AdminSidebar tab={tab} setTab={setTab} onLogout={handleLogout} email="admin@mkt-negocios.com" />

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Mobile tab switcher */}
          <div className="adm-mobile-tabs" style={{ display: 'none', padding: '12px 16px', borderBottom: '1px solid var(--border)', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <Segmented value={tab} onChange={setTab} options={[
              { value: 'clients',  label: 'Clientes', icon: <Icon name="building" size={14} /> },
              { value: 'payments', label: 'Pagos',    icon: <Icon name="card" size={14} /> },
            ]} />
            <ThemeToggle />
          </div>

          <div style={{ padding: 24, maxWidth: 1180, margin: '0 auto' }}>
            {tab === 'clients' ? (
              <ClientsPanel
                clients={clients}
                onAdd={c => setClients(list => [...list, c])}
                onDelete={id => setClients(list => list.filter(c => c.id !== id))}
              />
            ) : (
              <PaymentsPanel clients={clients} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
