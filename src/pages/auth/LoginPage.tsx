import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login } from '../../services/auth';
import { Button } from '../../components/ui';
import { ThemeToggle } from '../../components/ui';

// ── Inline icons (no extra dep) ──────────────────────────────────────────────
function Icon({ name, size = 18, stroke = 2, style }: { name: string; size?: number; stroke?: number; style?: React.CSSProperties }) {
  const paths: Record<string, string> = {
    mail:      'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm18 2-10 7L2 6',
    shield:    'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    eye:       'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zm11 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    eyeOff:    'M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22',
    check:     'M20 6 9 17l-5-5',
    building:  'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10',
    arrowR:    'M5 12h14M12 5l7 7-7 7',
    sparkles:  'M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z',
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d={paths[name] || ''} />
    </svg>
  );
}

// ── Logo component ────────────────────────────────────────────────────────────
function Logo({ height = 48 }: { height?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, height }}>
      {/* Bot icon mark */}
      <div style={{
        width: height, height,
        borderRadius: height * 0.28,
        background: 'linear-gradient(140deg,#19232A,#080B0F)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.08)',
        flexShrink: 0,
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'conic-gradient(from 130deg, transparent, rgba(43,211,203,.55), transparent 58%)',
        }} />
        <svg width={height * 0.58} height={height * 0.58} viewBox="0 0 24 24" fill="none"
          stroke="#2BD3CB" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round"
          style={{ position: 'relative' }}>
          <path d="M12 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 4v2M8 9h8a4 4 0 0 1 4 4v2a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-2a4 4 0 0 1 4-4zm-1 6h.01M17 15h.01" />
        </svg>
      </div>
      {/* Wordmark */}
      <div>
        <div style={{
          fontSize: height * 0.54, fontWeight: 800, letterSpacing: '-.03em',
          lineHeight: 1, color: '#fff',
        }}>
          MKT<span style={{ color: '#2BD3CB' }}>Robot</span>
        </div>
        <div style={{ fontSize: height * 0.22, color: 'rgba(255,255,255,.5)', letterSpacing: '.01em', fontWeight: 500 }}>
          plataforma de leads
        </div>
      </div>
    </div>
  );
}

// ── LoginField ────────────────────────────────────────────────────────────────
interface LoginFieldProps {
  icon: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  right?: React.ReactNode;
}

function LoginField({ icon, type = 'text', placeholder, value, onChange, right }: LoginFieldProps) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      height: 46, padding: '0 14px',
      borderRadius: 'var(--r-md)',
      background: 'var(--surface)',
      border: `1.5px solid ${focus ? 'var(--accent)' : 'var(--border)'}`,
      boxShadow: focus ? '0 0 0 3px var(--accent-soft)' : 'none',
      transition: 'border-color .15s, box-shadow .15s',
    }}>
      <Icon name={icon} size={17} style={{ color: focus ? 'var(--accent-2)' : 'var(--text-3)', flexShrink: 0 }} />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          flex: 1, border: 'none', outline: 'none',
          background: 'transparent', fontSize: 14,
          color: 'var(--text)', minWidth: 0,
        }}
      />
      {right}
    </div>
  );
}

// ── Mock clients for the avatar strip ────────────────────────────────────────
const STRIP_CLIENTS = [
  { initials: 'DI', color: '#10B3AC' },
  { initials: 'NA', color: '#3E63DD' },
  { initials: 'TS', color: '#7C5CFC' },
  { initials: 'BR', color: '#1FA971' },
];

const DEMO_CREDS = {
  client: { email: 'cliente@dr-imports.com', password: 'demo1234' },
  admin:  { email: 'admin@mkt-negocios.com', password: 'admin1234' },
};

// ── LoginPage ──────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  const [tab,     setTab]     = useState<'client' | 'admin'>('client');
  const [email,   setEmail]   = useState(DEMO_CREDS.client.email);
  const [pass,    setPass]    = useState('demo1234');
  const [show,    setShow]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  function switchTab(t: 'client' | 'admin') {
    setTab(t);
    setEmail(DEMO_CREDS[t].email);
    setPass(t === 'admin' ? 'admin1234' : 'demo1234');
    setError('');
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login(email, pass);
      const dest = from || (user.role === 'superadmin' ? '/admin' : '/app/dashboard');
      navigate(dest, { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .login-form-in { animation: fadeUp .34s cubic-bezier(.22,.61,.36,1) both; }
        @media (max-width: 840px) { .lg-brand { display: none !important; } .lg-wrap { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* Top bar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 55, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px',
        background: 'rgba(8,11,15,.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,.06)',
      }}>
        <Logo height={30} />
        <ThemeToggle />
      </div>

      <div
        className="lg-wrap"
        style={{
          minHeight: '100vh', paddingTop: 55,
          display: 'grid', gridTemplateColumns: '1.05fr 1fr',
        }}
      >
        {/* ── Brand panel ──────────────────────────────────────────────────── */}
        <div
          className="lg-brand"
          style={{
            position: 'relative', overflow: 'hidden',
            background: 'linear-gradient(160deg,#13191E 0%,#080B0D 100%)',
            color: '#fff',
            display: 'flex', flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '46px 48px',
            minHeight: 'calc(100vh - 55px)',
          }}
        >
          {/* Glow */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(700px 360px at 78% 8%, rgba(43,211,203,.26), transparent 62%)',
          }} />
          <div style={{
            position: 'absolute', width: 340, height: 340, right: -80, bottom: -90,
            borderRadius: '50%',
            background: 'conic-gradient(from 130deg, transparent, rgba(43,211,203,.32), transparent 60%)',
            filter: 'blur(8px)',
          }} />

          {/* Logo */}
          <div style={{ position: 'relative' }}>
            <Logo height={52} />
          </div>

          {/* Copy */}
          <div style={{ position: 'relative', maxWidth: 420 }}>
            <div style={{
              fontSize: 13, fontWeight: 700, letterSpacing: '.04em',
              color: '#2BD3CB', marginBottom: 16, textTransform: 'uppercase',
            }}>
              Plataforma de captación de leads
            </div>
            <h1 style={{
              fontSize: 36, lineHeight: 1.12, letterSpacing: '-.03em',
              fontWeight: 800, margin: '0 0 18px',
            }}>
              Tus visitas,<br />convertidas en clientes.
            </h1>
            <p style={{
              fontSize: 15.5, lineHeight: 1.6,
              color: 'rgba(255,255,255,.7)', margin: '0 0 26px',
            }}>
              Gestioná tus chatbots, conversaciones y leads desde un único panel — simple, rápido y en tiempo real.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {['Captura conversacional 24/7', 'CRM con historial completo', 'Analytics y embudo de conversión'].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, fontSize: 14.5 }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: 99,
                    background: 'rgba(43,211,203,.16)', color: '#2BD3CB',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Icon name="check" size={13} stroke={3} />
                  </span>
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* Client strip */}
          <div style={{
            position: 'relative', display: 'flex', alignItems: 'center',
            gap: 11, fontSize: 13, color: 'rgba(255,255,255,.55)',
          }}>
            <div style={{ display: 'flex' }}>
              {STRIP_CLIENTS.map((c, i) => (
                <div key={i} style={{
                  width: 30, height: 30, borderRadius: 99,
                  background: c.color, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700,
                  marginLeft: i ? -9 : 0,
                  border: '2px solid #0C1013',
                }}>
                  {c.initials}
                </div>
              ))}
            </div>
            +200 negocios captan más con MKTRobot
          </div>
        </div>

        {/* ── Form panel ───────────────────────────────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '40px 28px', background: 'var(--bg)',
        }}>
          <div className="login-form-in" style={{ width: '100%', maxWidth: 380 }}>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 25, fontWeight: 800, letterSpacing: '-.025em', margin: '0 0 6px' }}>
                Iniciar sesión
              </h2>
              <p style={{ fontSize: 14, color: 'var(--text-3)', margin: 0 }}>
                Ingresá a tu cuenta de MKTRobot.
              </p>
            </div>

            {/* Role selector */}
            <div style={{
              display: 'flex', gap: 6, padding: 5,
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              borderRadius: 'var(--r-md)', marginBottom: 18,
            }}>
              {([
                { v: 'client', l: 'Cliente',         icon: 'building' },
                { v: 'admin',  l: 'Administrador',   icon: 'shield'   },
              ] as const).map(o => {
                const act = tab === o.v;
                return (
                  <button
                    key={o.v}
                    onClick={() => switchTab(o.v)}
                    style={{
                      flex: 1, height: 36, borderRadius: 9,
                      border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                      fontSize: 13, fontWeight: 650,
                      background: act ? 'var(--surface)' : 'transparent',
                      color: act ? 'var(--text)' : 'var(--text-3)',
                      boxShadow: act ? 'var(--sh-1)' : 'none',
                      transition: 'all .15s',
                    }}
                  >
                    <Icon name={o.icon} size={15} />
                    {o.l}
                  </button>
                );
              })}
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-2)', marginBottom: 7 }}>
                  Email
                </div>
                <LoginField
                  icon="mail"
                  value={email}
                  onChange={setEmail}
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-2)' }}>
                    Contraseña
                  </span>
                  <span style={{ fontSize: 12.5, color: 'var(--accent-2)', fontWeight: 600, cursor: 'pointer' }}>
                    ¿Olvidaste tu contraseña?
                  </span>
                </div>
                <LoginField
                  icon="shield"
                  type={show ? 'text' : 'password'}
                  value={pass}
                  onChange={setPass}
                  placeholder="••••••••"
                  right={
                    <button
                      type="button"
                      onClick={() => setShow(s => !s)}
                      style={{
                        border: 'none', background: 'transparent',
                        cursor: 'pointer', color: 'var(--text-3)',
                        padding: 2, display: 'flex', flexShrink: 0,
                      }}
                    >
                      <Icon name={show ? 'eyeOff' : 'eye'} size={16} />
                    </button>
                  }
                />
              </div>

              {/* Remember me */}
              <label style={{
                display: 'flex', alignItems: 'center', gap: 9,
                fontSize: 13, color: 'var(--text-2)', cursor: 'pointer', userSelect: 'none',
              }}>
                <span style={{
                  width: 18, height: 18, borderRadius: 6,
                  border: '1.5px solid var(--accent)', background: 'var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon name="check" size={12} stroke={3} style={{ color: '#fff' }} />
                </span>
                Mantener sesión iniciada
              </label>

              {/* Error */}
              {error && (
                <div style={{
                  padding: '10px 13px', borderRadius: 'var(--r-md)',
                  background: 'var(--red-soft)', color: 'var(--red)',
                  fontSize: 13, fontWeight: 500,
                }}>
                  {error}
                </div>
              )}

              {/* Submit */}
              <Button
                size="lg"
                type="submit"
                loading={loading}
                iconend={<Icon name="arrowR" size={18} />}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Ingresar como {tab === 'admin' ? 'administrador' : 'cliente'}
              </Button>
            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0' }}>
              <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ fontSize: 12, color: 'var(--text-3)' }}>o continuá con</span>
              <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>

            {/* Social buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="secondary" style={{ flex: 1, justifyContent: 'center' }}>
                Google
              </Button>
              <Button variant="secondary" style={{ flex: 1, justifyContent: 'center' }}>
                Microsoft
              </Button>
            </div>

            {/* Demo hint */}
            <div style={{
              marginTop: 22, padding: '11px 13px',
              borderRadius: 'var(--r-md)',
              background: 'var(--accent-soft)',
              fontSize: 12.5, color: 'var(--accent-2)',
              display: 'flex', gap: 8, alignItems: 'flex-start',
              lineHeight: 1.45,
            }}>
              <Icon name="sparkles" size={15} style={{ marginTop: 1, flexShrink: 0 }} />
              <span>
                <b>Demo:</b> elegí "Cliente" para entrar al CRM de Dr. Imports, o "Administrador" para ver todas las cuentas instaladas.
              </span>
            </div>

            <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13.5, color: 'var(--text-3)' }}>
              ¿No tenés cuenta?{' '}
              <span
                style={{ color: 'var(--accent-2)', fontWeight: 650, cursor: 'pointer' }}
                onClick={() => navigate('/')}
              >
                Probá gratis
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
