import React from 'react';
import { WidgetLauncher } from '../../components/Widget/Widget';
import { ThemeToggle } from '../../components/ui';

// Mock "Dr. Imports" site to showcase the widget in context
function MockHostSite() {
  return (
    <div style={{
      borderRadius: 'var(--r-lg)', overflow: 'hidden',
      border: '1px solid var(--border)',
      background: 'var(--surface)', boxShadow: 'var(--sh-1)',
      minHeight: '80vh', position: 'relative',
    }}>
      {/* Topbar */}
      <div style={{
        height: 60, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 26px',
        borderBottom: '1px solid var(--border)', background: 'var(--surface)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 9,
            background: 'var(--text)', color: 'var(--bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 13,
          }}>DI</div>
          <span style={{ fontWeight: 800, letterSpacing: '-.02em', fontSize: 16 }}>
            Dr. Imports
          </span>
        </div>
        <div style={{ display: 'flex', gap: 26, alignItems: 'center' }}>
          {['Productos', 'Catálogo', 'Envíos', 'Contacto'].map(n => (
            <span key={n} style={{ fontSize: 14, color: 'var(--text-2)', fontWeight: 500 }}>{n}</span>
          ))}
        </div>
      </div>

      {/* Hero */}
      <div style={{ padding: '46px 26px 30px', maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 36, alignItems: 'center' }}>
          <div>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              fontSize: 12.5, fontWeight: 600, color: 'var(--text-2)',
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              padding: '5px 11px', borderRadius: 99,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--green)' }} />
              Importadores oficiales · 12 años
            </span>
            <h1 style={{
              fontSize: 42, lineHeight: 1.08, letterSpacing: '-.03em',
              fontWeight: 800, margin: '18px 0 14px',
            }}>
              Autopartes premium,<br />entregadas en 48 h.
            </h1>
            <p style={{ fontSize: 16, color: 'var(--text-2)', lineHeight: 1.55, margin: '0 0 22px', maxWidth: 440 }}>
              Repuestos originales para tu flota, con asesoría técnica y stock verificado en tiempo real.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button style={{
                height: 46, padding: '0 22px', borderRadius: 'var(--r-md)', border: 'none',
                cursor: 'pointer', fontSize: 15, fontWeight: 600,
                background: 'var(--grad)', color: '#fff',
                boxShadow: '0 2px 8px rgba(46,99,180,.30)',
              }}>
                Ver catálogo →
              </button>
              <button style={{
                height: 46, padding: '0 22px', borderRadius: 'var(--r-md)',
                border: '1px solid var(--border)', cursor: 'pointer',
                fontSize: 15, fontWeight: 600,
                background: 'var(--surface)', color: 'var(--text)',
              }}>
                Cotizar ahora
              </button>
            </div>
            <div style={{ display: 'flex', gap: 26, marginTop: 30 }}>
              {[['12k+', 'Pedidos'], ['98%', 'Satisfacción'], ['48h', 'Entrega']].map(([val, label]) => (
                <div key={label}>
                  <div style={{ fontWeight: 800, fontSize: 22, letterSpacing: '-.02em' }}>{val}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-3)' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Image placeholder */}
          <div style={{
            height: 320, borderRadius: 14, position: 'relative', overflow: 'hidden',
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              position: 'absolute', inset: 0, opacity: .5,
              background: 'repeating-linear-gradient(45deg,transparent,transparent 9px,var(--border) 9px,var(--border) 10px)',
            }} />
            <span style={{ position: 'relative', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-3)' }}>
              [ hero · foto producto 4:3 ]
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WidgetDemoPage() {
  const [lastLead, setLastLead] = React.useState<Record<string, string> | null>(null);

  return (
    <div style={{ minHeight: '100vh', padding: '24px 32px' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 24,
      }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--accent-2)' }}>
            Prioridad #1 · Widget conversacional
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-.025em', margin: '7px 0 6px' }}>
            El chatbot, embebido en el sitio del cliente
          </h2>
          <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.55, margin: 0 }}>
            Botón flotante con animación, quick-replies, indicador "escribiendo…" y captura de leads.
            Abrí el widget abajo a la derecha y conversá.
          </p>
        </div>
        <ThemeToggle />
      </div>

      {/* Mock site */}
      <MockHostSite />

      {/* Lead captured notification */}
      {lastLead && (
        <div style={{
          position: 'fixed', top: 24, right: 24,
          background: 'var(--surface)', border: '1px solid var(--accent-line)',
          borderRadius: 'var(--r-lg)', padding: '14px 18px',
          boxShadow: 'var(--sh-3)', zIndex: 9998,
          display: 'flex', alignItems: 'center', gap: 12,
          animation: 'fadeIn .28s ease both',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'var(--green-soft)', color: 'var(--green)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✓</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text)' }}>
              Lead generado: {lastLead.name}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
              {lastLead.email} · {lastLead.phone}
            </div>
          </div>
          <button
            onClick={() => setLastLead(null)}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-3)', marginLeft: 8 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* The widget */}
      <WidgetLauncher
        defaultOpen={true}
        brand={{ botName: 'Robi', orgName: 'Dr. Imports', tagline: 'Responde al instante' }}
        onLeadGenerated={(lead) => setLastLead(lead as Record<string, string>)}
      />
    </div>
  );
}
