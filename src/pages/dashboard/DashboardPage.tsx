import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/AppShell/AppShell';
import { Card, Sparkline, StatusPill, Segmented, Button, Avatar } from '../../components/ui';
import { useMetrics } from '../../hooks/useMetrics';
import { useLeads } from '../../hooks/useLeads';

// ── Icons ─────────────────────────────────────────────────────────────────────
function Icon({ name, size = 18, stroke = 2, style }: { name: string; size?: number; stroke?: number; style?: React.CSSProperties }) {
  const paths: Record<string, string> = {
    inbox:      'M22 12h-6l-2 3h-4l-2-3H2M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z',
    message:    'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
    clock:      'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zm0-6v-4l3-3',
    checkcheck: 'M18 6 7 17l-5-5M22 6l-11.5 11',
    trend:      'M23 6l-9.5 9.5-5-5L1 18',
    download:   'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
    calendar:   'M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM16 2v4M8 2v4M3 10h18',
    zap:        'M13 2 3 14h9l-1 8 10-12h-9l1-8z',
    arrowR:     'M5 12h14M12 5l7 7-7 7',
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d={paths[name] || ''} />
    </svg>
  );
}

// ── Area chart ────────────────────────────────────────────────────────────────
interface Series { data: number[]; color: string }
function AreaChart({ series, labels, h = 210 }: { series: Series[]; labels?: string[]; h?: number }) {
  const w = 720, pad = 8;
  const all = series.flatMap(s => s.data);
  const max = Math.max(...all) * 1.12 || 1;
  const X = (i: number) => pad + (i / (series[0].data.length - 1)) * (w - pad * 2);
  const Y = (v: number) => h - 24 - (v / max) * (h - 40);
  const id = 'ac' + Math.random().toString(36).slice(2, 6);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}>
      <defs>
        {series.map((s, si) => (
          <linearGradient key={si} id={id + si} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={s.color} stopOpacity={si === 0 ? .22 : .12} />
            <stop offset="1" stopColor={s.color} stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>
      {[0, .25, .5, .75, 1].map((g, i) => (
        <line key={i} x1={pad} x2={w - pad} y1={24 + g * (h - 48)} y2={24 + g * (h - 48)}
          stroke="var(--border)" strokeWidth="1" strokeDasharray="3 5" />
      ))}
      {series.map((s, si) => {
        const d = s.data.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(' ');
        const area = d + ` L${X(s.data.length - 1)} ${h - 24} L${X(0)} ${h - 24} Z`;
        return (
          <g key={si}>
            <path d={area} fill={`url(#${id + si})`} />
            <path d={d} fill="none" stroke={s.color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={X(s.data.length - 1)} cy={Y(s.data[s.data.length - 1])} r="3.5"
              fill={s.color} stroke="var(--surface)" strokeWidth="2" />
          </g>
        );
      })}
      {labels?.map((l, i) => i % 2 === 0 && (
        <text key={i} x={X(i)} y={h - 6} fontSize="10" fill="var(--text-3)" textAnchor="middle">{l}</text>
      ))}
    </svg>
  );
}

// ── Donut chart ───────────────────────────────────────────────────────────────
function Donut({ data, size = 168, thickness = 26 }: {
  data: { label: string; value: number; color: string }[];
  size?: number; thickness?: number;
}) {
  const total = data.reduce((a, b) => a + b.value, 0);
  const r = (size - thickness) / 2;
  const C = 2 * Math.PI * r;
  let off = 0;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={thickness} />
        {data.map((d, i) => {
          const len = (d.value / total) * C;
          const el = (
            <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none"
              stroke={d.color} strokeWidth={thickness}
              strokeDasharray={`${len} ${C - len}`}
              strokeDashoffset={-off} strokeLinecap="round"
              style={{ transition: 'stroke-dasharray .6s var(--ease)' }} />
          );
          off += len;
          return el;
        })}
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.03em' }}>{total.toLocaleString('es')}</div>
        <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>leads</div>
      </div>
    </div>
  );
}

// ── Mini bars ─────────────────────────────────────────────────────────────────
function MiniBars({ data, h = 58, color = 'var(--accent)' }: { data: number[]; h?: number; color?: string }) {
  const max = Math.max(...data) || 1;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: h }}>
      {data.map((v, i) => (
        <div key={i} style={{
          flex: 1, height: `${(v / max) * 100}%`, minHeight: 2, borderRadius: 2,
          background: i >= data.length - 3 ? color : 'var(--surface-3)',
          transition: 'height .4s var(--ease)',
        }} />
      ))}
    </div>
  );
}

// ── Delta badge ───────────────────────────────────────────────────────────────
function Delta({ v }: { v: number }) {
  const up = v >= 0;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 700, color: up ? 'var(--green)' : 'var(--red)' }}>
      <Icon name="trend" size={13} style={{ transform: up ? 'none' : 'scaleY(-1)' }} />
      {up ? '+' : ''}{v}%
    </span>
  );
}

// ── KPI card (3 variants) ─────────────────────────────────────────────────────
interface KpiDef { key: string; label: string; icon: string; tone: string; fmt: (v: number) => string }
interface KpiCardProps { def: KpiDef; value: number; delta: number; spark: number[]; variant: string }

function KpiCard({ def, value, delta, spark, variant }: KpiCardProps) {
  if (variant === 'gradient') {
    return (
      <Card pad={18} hover style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${def.tone}22, transparent 60%)` }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: def.tone + '22', color: def.tone, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={def.icon} size={19} />
            </div>
            <Delta v={delta} />
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-.03em', lineHeight: 1 }}>{def.fmt(value)}</div>
          <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 5, fontWeight: 500 }}>{def.label}</div>
          <div style={{ marginTop: 12 }}><Sparkline data={spark} color={def.tone} width={200} height={30} /></div>
        </div>
      </Card>
    );
  }
  if (variant === 'bold') {
    return (
      <Card pad={0} hover style={{ overflow: 'hidden' }}>
        <div style={{ height: 5, background: def.tone }} />
        <div style={{ padding: '18px 18px 16px' }}>
          <div style={{ fontSize: 12.5, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.03em' }}>{def.label}</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, margin: '8px 0 4px' }}>
            <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-.04em', lineHeight: .9, color: def.tone }}>{def.fmt(value)}</div>
            <Delta v={delta} />
          </div>
          <div style={{ marginTop: 10 }}><MiniBars data={spark} color={def.tone} h={40} /></div>
        </div>
      </Card>
    );
  }
  // minimal (default)
  return (
    <Card pad={18} hover>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
        <div style={{ width: 30, height: 30, borderRadius: 9, background: def.tone + '22', color: def.tone, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={def.icon} size={16} />
        </div>
        <span style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 600 }}>{def.label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 29, fontWeight: 800, letterSpacing: '-.03em', lineHeight: 1 }}>{def.fmt(value)}</div>
          <div style={{ marginTop: 6 }}>
            <Delta v={delta} /> <span style={{ fontSize: 11.5, color: 'var(--text-3)' }}>vs mes ant.</span>
          </div>
        </div>
        <Sparkline data={spark} color={def.tone} width={92} height={40} />
      </div>
    </Card>
  );
}

// ── Section header ────────────────────────────────────────────────────────────
function SectionHead({ title, sub, right }: { title: string; sub?: string; right?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, gap: 12 }}>
      <div>
        <div style={{ fontSize: 15.5, fontWeight: 700, letterSpacing: '-.02em' }}>{title}</div>
        {sub && <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 2 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

// ── KPI definitions ───────────────────────────────────────────────────────────
const KPI_DEFS: KpiDef[] = [
  { key: 'total',       label: 'Leads totales',  icon: 'inbox',      tone: 'var(--accent)', fmt: v => v.toLocaleString('es') },
  { key: 'unread',      label: 'Sin leer',        icon: 'message',    tone: 'var(--red)',    fmt: v => String(v) },
  { key: 'uncontacted', label: 'Sin contactar',   icon: 'clock',      tone: 'var(--amber)',  fmt: v => String(v) },
  { key: 'contacted',   label: 'Contactados',     icon: 'checkcheck', tone: 'var(--green)',  fmt: v => String(v) },
];

// ── Static mock data (replaced by real data when available) ───────────────────
const MOCK_SERIES = {
  leads:     [18, 22, 15, 28, 19, 31, 24, 38, 29, 42, 35, 51, 44, 58],
  contacted: [8,  12, 9,  14, 11, 18, 14, 22, 17, 24, 20, 30, 25, 34],
  unread:    [4,  6,  3,  8,  5,  9,  6,  10, 7,  12, 9,  14, 10, 18],
};
const MOCK_BY_SOURCE = [
  { label: 'Sitio web · Home',   value: 42, color: 'var(--accent)' },
  { label: 'Google Ads',         value: 28, color: 'var(--blue)' },
  { label: 'Instagram',          value: 16, color: 'var(--violet)' },
  { label: 'WhatsApp directo',   value: 9,  color: 'var(--green)' },
  { label: 'Otros',              value: 5,  color: 'var(--amber)' },
];
const MOCK_FUNNEL = [
  { label: 'Conversaciones iniciadas', value: 1240, pct: 100 },
  { label: 'Datos capturados',         value: 1006, pct: 81 },
  { label: 'Contactados',              value: 712,  pct: 57 },
  { label: 'Convertidos',              value: 284,  pct: 23 },
];
const MOCK_INTENTS = [
  { label: 'Precios y modelos',      value: 44, color: 'var(--accent)' },
  { label: 'Disponibilidad de stock',value: 28, color: 'var(--blue)' },
  { label: 'Hablar con un asesor',   value: 18, color: 'var(--violet)' },
  { label: 'Soporte técnico',        value: 10, color: 'var(--amber)' },
];
const MOCK_HOURS = [2,1,1,0,1,2,5,9,14,18,22,19,16,21,28,32,30,26,20,16,12,9,6,4];
const CHART_LABELS = ['', '', '', '', '', '', '', '', '', '', '', '', 'Hoy', ''];

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const navigate = useNavigate();
  // const user = useAuthStore(s => s.user);
  const [variant, setVariant] = useState<'minimal' | 'gradient' | 'bold'>('minimal');
  const [range, setRange]     = useState('14d');

  const { data: metrics } = useMetrics();
  const { data: leadsData } = useLeads({ pageSize: 4 });

  // Use real data if available, fall back to mock
  const totals = metrics
    ? { total: metrics.total, unread: metrics.unread, uncontacted: metrics.uncontacted, contacted: metrics.contacted }
    : { total: 1006, unread: 18, uncontacted: 47, contacted: 941 };

  const deltas = { total: 12, unread: -8, uncontacted: -14, contacted: 18 };
  const seriesLeads     = metrics?.series.map(s => s.count) ?? MOCK_SERIES.leads;
  const seriesContacted = MOCK_SERIES.contacted;
  const seriesUnread    = MOCK_SERIES.unread;

  const bySource = MOCK_BY_SOURCE;
  const sourceTotal = bySource.reduce((a, b) => a + b.value, 0);
  const recentLeads = leadsData?.leads.slice(0, 4) ?? [];

  const peakHour = MOCK_HOURS.indexOf(Math.max(...MOCK_HOURS));

  return (
    <AppShell title="Dashboard" unreadCount={totals.unread}>
      {/* Sub-header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 14, color: 'var(--text-2)' }}>
          Hola 👋 esto pasó en <b style={{ color: 'var(--text)' }}>dr-imports.com</b> esta quincena.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Segmented
            value={variant}
            onChange={v => setVariant(v as typeof variant)}
            options={[
              { value: 'minimal',  label: 'Minimal'  },
              { value: 'gradient', label: 'Gradient' },
              { value: 'bold',     label: 'Bold'     },
            ]}
          />
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7, height: 34, padding: '0 12px',
            borderRadius: 'var(--r-md)', border: '1px solid var(--border)',
            background: 'var(--surface)', fontSize: 13, fontWeight: 600, color: 'var(--text-2)',
          }}>
            <Icon name="calendar" size={15} /> 28 may – 10 jun
          </div>
          <Button size="sm" variant="secondary" icon={<Icon name="download" size={14} />}>
            Exportar
          </Button>
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }} className="cr-kpis">
        {KPI_DEFS.map(def => (
          <KpiCard
            key={def.key}
            def={def}
            value={totals[def.key as keyof typeof totals]}
            delta={deltas[def.key as keyof typeof deltas]}
            spark={def.key === 'total' ? seriesLeads : def.key === 'contacted' ? seriesContacted : seriesUnread}
            variant={variant}
          />
        ))}
      </div>

      {/* Row: area chart + donut */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 16, marginTop: 16 }} className="cr-grid2">
        <Card pad={20}>
          <SectionHead
            title="Leads capturados"
            sub="Conversaciones que dejaron datos · últimos 14 días"
            right={
              <Segmented
                value={range}
                onChange={setRange}
                options={[{ value: '7d', label: '7d' }, { value: '14d', label: '14d' }, { value: '30d', label: '30d' }]}
              />
            }
          />
          <div style={{ display: 'flex', gap: 18, marginBottom: 6 }}>
            {[{ color: 'var(--accent)', label: 'Total leads' }, { color: 'var(--green)', label: 'Contactados' }].map((l, _i) => (
              <span key={_i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--text-2)', fontWeight: 600 }}>
                <span style={{ width: 9, height: 9, borderRadius: 3, background: l.color }} />
                {l.label}
              </span>
            ))}
          </div>
          <AreaChart labels={CHART_LABELS} series={[
            { data: seriesLeads,     color: 'var(--accent)' },
            { data: seriesContacted, color: 'var(--green)' },
          ]} />
        </Card>

        <Card pad={20}>
          <SectionHead title="Por fuente" sub="De dónde llegan los leads" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <Donut data={bySource} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11, flex: 1, minWidth: 0 }}>
              {bySource.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 3, background: d.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: 'var(--text-2)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{Math.round((d.value / sourceTotal) * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Row: funnel + intents + hours */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr 1fr', gap: 16, marginTop: 16 }} className="cr-grid3">
        {/* Funnel */}
        <Card pad={20}>
          <SectionHead title="Embudo de conversión" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {MOCK_FUNNEL.map((f, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-2)', fontWeight: 500 }}>{f.label}</span>
                  <span style={{ fontWeight: 700 }}>
                    {f.value.toLocaleString('es')} <span style={{ color: 'var(--text-3)', fontWeight: 500 }}>· {f.pct}%</span>
                  </span>
                </div>
                <div style={{ height: 9, borderRadius: 99, background: 'var(--surface-2)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: f.pct + '%', borderRadius: 99,
                    background: `linear-gradient(90deg, var(--accent), ${['var(--accent)', 'var(--blue)', 'var(--violet)', 'var(--green)'][i]})`,
                    transition: 'width .6s var(--ease)',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top intents */}
        <Card pad={20}>
          <SectionHead title="Intención más frecuente" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {MOCK_INTENTS.map((t, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-2)', fontWeight: 500 }}>{t.label}</span>
                  <span style={{ fontWeight: 700 }}>{t.value}%</span>
                </div>
                <div style={{ height: 7, borderRadius: 99, background: 'var(--surface-2)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: t.value + '%', borderRadius: 99, background: t.color, transition: 'width .6s var(--ease)' }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Activity by hour */}
        <Card pad={20}>
          <SectionHead title="Actividad por hora" sub="Hora local · promedio" />
          <div style={{ height: 96, display: 'flex', alignItems: 'flex-end', gap: 2, marginTop: 8 }}>
            {MOCK_HOURS.map((v, i) => {
              const max = Math.max(...MOCK_HOURS);
              const peak = v === max;
              return (
                <div key={i} title={`${i}:00`} style={{
                  flex: 1, height: `${(v / max) * 100}%`, minHeight: 3,
                  borderRadius: '3px 3px 0 0',
                  background: peak ? 'var(--accent)' : 'var(--surface-3)',
                  transition: 'height .4s var(--ease)',
                }} />
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: 'var(--text-3)', marginTop: 7 }}>
            <span>00h</span><span>06h</span><span>12h</span><span>18h</span><span>23h</span>
          </div>
          <div style={{
            marginTop: 12, padding: '10px 12px', borderRadius: 10,
            background: 'var(--accent-soft)', fontSize: 12.5, color: 'var(--accent-2)',
            fontWeight: 600, display: 'flex', alignItems: 'center', gap: 7,
          }}>
            <Icon name="zap" size={15} /> Pico de leads entre {peakHour}h y {peakHour + 2}h
          </div>
        </Card>
      </div>

      {/* Recent leads */}
      <Card pad={0} style={{ marginTop: 16, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 15.5, fontWeight: 700, letterSpacing: '-.02em' }}>Leads recientes</div>
          <Button
            size="sm" variant="ghost"
            iconend={<Icon name="arrowR" size={15} />}
            onClick={() => navigate('/app/leads')}
          >
            Ver todos
          </Button>
        </div>

        {recentLeads.length === 0 ? (
          // Fallback mock rows when no real data yet
          [
            { id: '1', name: 'Franco Giménez',   status: 'unread',      intent: 'Precios y modelos',        snippet: 'precio tiene referencias para ver en stock?', createdAt: 'hace 2 min' },
            { id: '2', name: 'Lucía Fernández',  status: 'contacted',   intent: 'Hablar con un asesor',     snippet: 'perfecto, quedo a la espera del llamado 🙌', createdAt: 'hace 14 min' },
            { id: '3', name: 'Juan Pablo Medina',status: 'uncontacted', intent: 'Precios y modelos',        snippet: 'me podrás pasar modelos y precios disponibles?', createdAt: 'hace 1 h' },
            { id: '4', name: 'Armando Ríos',     status: 'unread',      intent: 'Disponibilidad de stock',  snippet: 'me interesa el producto, ¿hacen envíos?', createdAt: 'hace 3 h' },
          ].map((l, _i) => (
            <div key={l.id} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '13px 20px',
              borderTop: '1px solid var(--border)', cursor: 'pointer',
              transition: 'background .14s',
            }}
              onClick={() => navigate('/app/leads')}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <Avatar name={l.name} size={38} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 650 }}>{l.name}</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 360 }}>{l.snippet}</div>
              </div>
              <span className="cr-hide-sm" style={{ fontSize: 12.5, color: 'var(--text-3)' }}>{l.intent}</span>
              <StatusPill status={l.status as 'unread' | 'uncontacted' | 'contacted'} />
              <span className="cr-hide-sm" style={{ fontSize: 12.5, color: 'var(--text-3)', width: 78, textAlign: 'right' }}>{l.createdAt}</span>
            </div>
          ))
        ) : (
          recentLeads.map(l => (
            <div key={l.id} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '13px 20px',
              borderTop: '1px solid var(--border)', cursor: 'pointer', transition: 'background .14s',
            }}
              onClick={() => navigate(`/app/leads/${l.id}`)}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <Avatar name={l.name} size={38} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 650 }}>{l.name}</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 360 }}>{l.snippet}</div>
              </div>
              <span className="cr-hide-sm" style={{ fontSize: 12.5, color: 'var(--text-3)' }}>{l.intent}</span>
              <StatusPill status={l.status} />
              <span className="cr-hide-sm" style={{ fontSize: 12.5, color: 'var(--text-3)', width: 78, textAlign: 'right' }}>
                {new Date(l.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
              </span>
            </div>
          ))
        )}
      </Card>

      <style>{`
        @media (max-width: 1080px) { .cr-kpis { grid-template-columns: repeat(2,1fr) !important; } .cr-grid3 { grid-template-columns: 1fr !important; } }
        @media (max-width: 920px)  { .cr-grid2 { grid-template-columns: 1fr !important; } }
        @media (max-width: 600px)  { .cr-kpis { grid-template-columns: 1fr !important; } .cr-hide-sm { display: none !important; } }
      `}</style>
    </AppShell>
  );
}
