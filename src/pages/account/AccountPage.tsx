import React from 'react';
import { AppShell } from '../../components/AppShell/AppShell';
import { Button } from '../../components/ui';

// ── Icons ─────────────────────────────────────────────────────────────────────
function Icon({ name, size = 18, stroke = 2, style }: {
  name: string; size?: number; stroke?: number; style?: React.CSSProperties;
}) {
  const paths: Record<string, string> = {
    wallet:   'M21 12V7H5a2 2 0 0 1 0-4h14v4M21 12v5H5a2 2 0 0 0 0 4h14v-4M21 12H5',
    zap:      'M13 2 3 14h9l-1 8 10-12h-9l1-8z',
    clock:    'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zm0-6v-4l3-3',
    refresh:  'M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8',
    card:     'M1 10h22M1 6h22a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z',
    check:    'M20 6 9 17l-5-5',
    download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
    plus:     'M12 5v14M5 12h14',
    trash:    'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6',
    edit:     'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
    building: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10',
    globe:    'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zm-7-9h14M12 3a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z',
    user:     'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    mail:     'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm18 2-10 7L2 6',
    calendar: 'M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM16 2v4M8 2v4M3 10h18',
    layers:   'M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    inbox:    'M22 12h-6l-2 3h-4l-2-3H2M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z',
    chart:    'M18 20V10M12 20V4M6 20v-6',
    phone:    'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z',
    users:    'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
    shield:   'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    mp:       'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 4h3a3 3 0 0 1 0 6h-3V6zm0 8h3a3 3 0 0 1 0 6h-3v-6z',
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d={paths[name] || ''} />
    </svg>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const PLAN_PRICE:        Record<string, number> = { Prueba: 0, Starter: 10000, Premium: 20000 };
const PLAN_LEAD_LIMIT:   Record<string, number> = { Prueba: 200, Starter: 200, Premium: 1000 };
const PLAN_WIDGET_LIMIT: Record<string, number> = { Prueba: 1, Starter: 1, Premium: 2 };

function fmt(n: number) { return '$' + Number(n).toLocaleString('es'); }

// ── Sub-components ────────────────────────────────────────────────────────────
function AccCard({ children, pad = 20, style }: { children: React.ReactNode; pad?: number; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--r-lg)', padding: pad, boxShadow: 'var(--sh-1)', ...style,
    }}>
      {children}
    </div>
  );
}

function AccHead({ title, sub, right }: { title: string; sub?: string; right?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
      <div>
        <div style={{ fontSize: 15.5, fontWeight: 700, letterSpacing: '-.02em' }}>{title}</div>
        {sub && <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 2 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

function UsageBar({ label, used, limit, unit }: { label: string; used: number; limit: number; unit: string }) {
  const pct = Math.min(100, Math.round((used / limit) * 100));
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7 }}>
        <span style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 13 }}>
          <b style={{ color: pct >= 100 ? 'var(--red)' : 'var(--text)' }}>{used.toLocaleString('es')}</b>
          {' '}<span style={{ color: 'var(--text-3)' }}>/ {limit.toLocaleString('es')} {unit}</span>
        </span>
      </div>
      <div style={{ height: 8, borderRadius: 99, background: 'var(--surface-2)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`, borderRadius: 99,
          background: pct >= 100 ? 'var(--red)' : pct >= 85 ? 'linear-gradient(90deg,var(--amber),var(--red))' : 'var(--grad)',
          transition: 'width .6s var(--ease)',
        }} />
      </div>
      {pct >= 100 && <div style={{ fontSize: 11.5, color: 'var(--red)', marginTop: 5, fontWeight: 600 }}>Alcanzaste el límite de tu plan</div>}
      {pct >= 85 && pct < 100 && <div style={{ fontSize: 11.5, color: 'var(--amber)', marginTop: 5, fontWeight: 600 }}>Estás cerca del límite</div>}
    </div>
  );
}

function PayMethodRow({ icon, brand, detail, badge, onRemove }: {
  icon: string; brand: string; detail: string; badge?: string; onRemove?: () => void;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
      borderRadius: 'var(--r-md)', border: '1px solid var(--border)', background: 'var(--surface-2)',
    }}>
      <div style={{
        width: 42, height: 30, borderRadius: 7,
        background: 'var(--surface)', border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--text-2)',
      }}>
        <Icon name={icon} size={17} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 650, display: 'flex', alignItems: 'center', gap: 8 }}>
          {brand}
          {badge && (
            <span style={{
              fontSize: 10.5, fontWeight: 700, color: 'var(--green)',
              background: 'var(--green-soft)', padding: '1px 7px', borderRadius: 99,
            }}>
              {badge}
            </span>
          )}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{detail}</div>
      </div>
      {onRemove && (
        <button onClick={onRemove} style={{
          width: 30, height: 30, borderRadius: 'var(--r-md)', border: 'none',
          background: 'transparent', cursor: 'pointer', color: 'var(--text-3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'color .15s, background .15s',
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--red)'; (e.currentTarget as HTMLElement).style.background = 'var(--red-soft)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-3)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >
          <Icon name="trash" size={15} />
        </button>
      )}
    </div>
  );
}

// ── Account data (mock) ───────────────────────────────────────────────────────
const MOCK_ACCOUNT = {
  name:      'Dr. Imports',
  initials:  'DI',
  plan:      'Premium' as string,
  domain:    'dr-imports.com',
  owner:     'Darío Ostan',
  email:     'drostan@drimports.com.ar',
  leadsMonth: 1006,
  widgets:   2,
  installed: 'mar 2024',
  color:     '#10B3AC',
};

// ── Account page ──────────────────────────────────────────────────────────────
export default function AccountPage() {
  
  const c = MOCK_ACCOUNT;

  const plan       = c.plan;
  const isTrial    = plan === 'Prueba';
  const price      = PLAN_PRICE[plan]      ?? 0;
  const leadLimit  = PLAN_LEAD_LIMIT[plan]  ?? 200;
  const wLimit     = PLAN_WIDGET_LIMIT[plan] ?? 1;
  const renewal    = isTrial ? '25 jun 2026' : '01 jul 2026';
  const trialDays  = 14;

  const invoices = isTrial ? [] : [
    { date: '01 jun 2026', amount: price, status: 'paid' },
    { date: '01 may 2026', amount: price, status: 'paid' },
    { date: '01 abr 2026', amount: price, status: 'paid' },
  ];

  const planFeatures: [string, string][] = [
    ['layers',  `${wLimit} widget${wLimit > 1 ? 's' : ''} incluido${wLimit > 1 ? 's' : ''}`],
    ['inbox',   `Hasta ${leadLimit.toLocaleString('es')} leads / mes`],
    ['chart',   'CRM + analytics completo'],
    ['phone',   'Integraciones WhatsApp y email'],
    plan === 'Premium' ? ['users', 'Múltiples usuarios'] : ['mail', 'Soporte por email'],
  ];

  const accountRows: [string, string, string][] = [
    ['building', 'Empresa',         c.name],
    ['globe',    'Sitio web',       c.domain],
    ['user',     'Responsable',     c.owner],
    ['mail',     'Email',           c.email],
    ['calendar', 'Cliente desde',   c.installed],
  ];

  return (
    <AppShell title="Mi cuenta">

      {/* ── Plan hero ─────────────────────────────────────────────────────── */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        borderRadius: 'var(--r-xl)', padding: '22px 24px', marginBottom: 18,
        background: 'linear-gradient(150deg,#13191E,#0A0D10)', color: '#fff',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(520px 200px at 88% -30%, ${c.color}50, transparent 64%)`,
        }} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          <div style={{
            width: 50, height: 50, borderRadius: 13,
            background: 'rgba(255,255,255,.08)', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="wallet" size={24} />
          </div>

          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-.02em', whiteSpace: 'nowrap' }}>
                Plan {plan}
              </span>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 99,
                background: isTrial ? 'rgba(245,181,68,.18)' : 'rgba(43,211,203,.16)',
                color: isTrial ? '#F5B544' : '#2BD3CB',
              }}>
                {isTrial ? `PRUEBA · ${trialDays} DÍAS` : 'ACTIVO'}
              </span>
            </div>
            <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,.62)', marginTop: 5 }}>
              {isTrial ? (
                <>Tu prueba gratuita vence el <b style={{ color: '#fff' }}>{renewal}</b> · faltan {trialDays} días</>
              ) : (
                <>{fmt(price)} ARS / mes · próxima renovación el <b style={{ color: '#fff' }}>{renewal}</b></>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            {plan !== 'Premium' && (
              <Button icon={<Icon name="zap" size={16} />}>
                {isTrial ? 'Activar plan' : 'Mejorar plan'}
              </Button>
            )}
            {plan === 'Premium' && (
              <Button variant="secondary" style={{ background: 'rgba(255,255,255,.08)', color: '#fff', borderColor: 'rgba(255,255,255,.18)' }}>
                Cambiar plan
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── Trial warning banner ───────────────────────────────────────────── */}
      {isTrial && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px',
          borderRadius: 'var(--r-md)', marginBottom: 18,
          background: 'var(--amber-soft)', border: '1px solid rgba(232,147,12,.3)',
        }}>
          <Icon name="clock" size={18} style={{ color: 'var(--amber)', flexShrink: 0 }} />
          <div style={{ flex: 1, fontSize: 13, color: 'var(--text-2)', lineHeight: 1.4 }}>
            Tu período de prueba termina en <b style={{ color: 'var(--text)' }}>{trialDays} días</b>.
            Activá un plan para que tu widget siga funcionando sin interrupciones.
          </div>
          <Button size="sm">Activar plan</Button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 16 }} className="acc-grid">

        {/* ── LEFT COLUMN ─────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Usage */}
          <AccCard>
            <AccHead title="Disponibilidad y uso" sub="Consumo del ciclo actual" />
            <UsageBar
              label="Leads capturados este mes"
              used={c.leadsMonth} limit={leadLimit} unit="leads"
            />
            <UsageBar
              label="Widgets activos"
              used={Math.min(c.widgets, wLimit)} limit={wLimit}
              unit={wLimit > 1 ? 'widgets' : 'widget'}
            />
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5,
              color: 'var(--text-3)', marginTop: 4, paddingTop: 14, borderTop: '1px solid var(--border)',
            }}>
              <Icon name="refresh" size={14} /> El uso se reinicia el {renewal}.
            </div>
          </AccCard>

          {/* Payment methods */}
          <AccCard>
            <AccHead
              title="Formas de pago" sub="Medios asociados a tu cuenta"
              right={
                <Button size="sm" variant="secondary" icon={<Icon name="plus" size={14} />}>
                  Agregar
                </Button>
              }
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <PayMethodRow
                icon="card"
                brand="Visa •••• 4242"
                detail="Vence 08/27 · titular Dr. Imports SA"
                badge="Principal"
                onRemove={() => {}}
              />
              <PayMethodRow
                icon="mp"
                brand="Mercado Pago"
                detail="drostan@drimports.com.ar"
              />
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontSize: 12, color: 'var(--text-3)', marginTop: 14,
            }}>
              <Icon name="shield" size={14} style={{ color: 'var(--green)' }} />
              Pagos protegidos y encriptados. También aceptamos transferencia bancaria.
            </div>
          </AccCard>

          {/* Invoice history */}
          <AccCard pad={0} style={{ overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px' }}>
              <AccHead title="Historial de pagos" />
            </div>
            <div className="acc-ihead" style={{
              display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 80px', gap: 12,
              padding: '10px 20px',
              borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
              fontSize: 11.5, fontWeight: 700, letterSpacing: '.03em',
              color: 'var(--text-3)', textTransform: 'uppercase',
            }}>
              <span>Fecha</span><span>Monto</span><span>Estado</span><span />
            </div>

            {invoices.length === 0 ? (
              <div style={{ padding: '28px 20px', textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
                Todavía no hay pagos. Tu primer cobro será al activar un plan.
              </div>
            ) : invoices.map((inv, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 80px', gap: 12,
                padding: '13px 20px', borderTop: i ? '1px solid var(--border)' : 'none',
                alignItems: 'center',
              }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{inv.date}</span>
                <span style={{ fontSize: 13 }}>{fmt(inv.amount)}</span>
                <span>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    fontSize: 12, fontWeight: 600, color: 'var(--green)',
                    background: 'var(--green-soft)', padding: '2px 9px', borderRadius: 99,
                  }}>
                    <Icon name="check" size={12} stroke={3} /> Pagado
                  </span>
                </span>
                <button style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  fontSize: 12.5, fontWeight: 600, color: 'var(--accent-2)',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                }}>
                  <Icon name="download" size={14} /> PDF
                </button>
              </div>
            ))}
          </AccCard>
        </div>

        {/* ── RIGHT COLUMN ────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Plan summary */}
          <AccCard>
            <AccHead title="Resumen del plan" />
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-.03em', lineHeight: 1 }}>
                {isTrial ? 'Gratis' : fmt(price)}
              </span>
              <span style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 4 }}>
                {isTrial ? '14 días' : 'ARS / mes'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginTop: 16 }}>
              {planFeatures.map(([_icon, label], i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 13.5, color: 'var(--text-2)' }}>
                  <span style={{
                    width: 20, height: 20, borderRadius: 99,
                    background: 'var(--accent-soft)', color: 'var(--accent-2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Icon name="check" size={12} stroke={3} />
                  </span>
                  {label}
                </div>
              ))}
            </div>

            {plan !== 'Premium' && (
              <Button
                style={{ width: '100%', justifyContent: 'center', marginTop: 18 }}
                icon={<Icon name="zap" size={15} />}
              >
                {isTrial ? 'Activar plan' : 'Mejorar a Premium'}
              </Button>
            )}
          </AccCard>

          {/* Account data */}
          <AccCard>
            <AccHead
              title="Datos de la cuenta"
              right={
                <button style={{
                  width: 32, height: 32, borderRadius: 'var(--r-md)',
                  border: '1px solid var(--border)', background: 'var(--surface)',
                  cursor: 'pointer', color: 'var(--text-3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'color .15s, background .15s',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--accent)'; (e.currentTarget as HTMLElement).style.background = 'var(--accent-soft)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-3)'; (e.currentTarget as HTMLElement).style.background = 'var(--surface)'; }}
                >
                  <Icon name="edit" size={15} />
                </button>
              }
            />
            {accountRows.map(([icon, label, value], i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 11, padding: '9px 0',
                borderTop: i ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: 'var(--surface-2)', color: 'var(--text-3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon name={icon} size={15} />
                </div>
                <span style={{ fontSize: 12.5, color: 'var(--text-3)', width: 96, flexShrink: 0 }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {value}
                </span>
              </div>
            ))}
          </AccCard>

          {/* Subscription / danger zone */}
          <AccCard>
            <AccHead title="Suscripción" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              <Button
                variant="secondary"
                icon={<Icon name="download" size={15} />}
                style={{ width: '100%', justifyContent: 'flex-start' }}
              >
                Descargar facturas
              </Button>
              <button style={{
                width: '100%', height: 38, padding: '0 16px',
                borderRadius: 'var(--r-md)', border: 'none',
                background: 'transparent', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: 13.5, fontWeight: 600, color: 'var(--red)',
                transition: 'background .15s',
              }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--red-soft)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              >
                Cancelar suscripción
              </button>
            </div>
          </AccCard>
        </div>
      </div>

      <style>{`
        @media (max-width: 920px) { .acc-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 560px) { .acc-ihead { display: none !important; } }
      `}</style>
    </AppShell>
  );
}
