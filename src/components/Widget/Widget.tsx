import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Question, ConvoMessage } from '../../types';
import { TypingDots } from '../ui';

// ── Mock questions (replace with API fetch in production) ────────────────────
const DEFAULT_QUESTIONS: Question[] = [
  { id: 'q1', kind: 'message',  label: 'Saludo',    sortOrder: 0, enabled: true,
    prompt: '¡Hola! 👋 Soy Robi, el asistente de Dr. Imports. ¿En qué puedo ayudarte hoy?' },
  { id: 'q2', kind: 'choice',   label: '¿Qué buscás?', sortOrder: 1, enabled: true,
    prompt: '¿Sobre qué te gustaría consultar?',
    options: ['Precios y modelos', 'Disponibilidad de stock', 'Soporte técnico', 'Hablar con un asesor'] },
  { id: 'q3', kind: 'capture',  label: 'Nombre',    sortOrder: 2, enabled: true, field: 'name',
    prompt: '¡Genial! ¿Cuál es tu nombre?' },
  { id: 'q4', kind: 'capture',  label: 'Email',     sortOrder: 3, enabled: true, field: 'email',
    prompt: '¿A qué email te enviamos la cotización?' },
  { id: 'q5', kind: 'capture',  label: 'WhatsApp',  sortOrder: 4, enabled: true, field: 'phone',
    prompt: 'Dejanos tu WhatsApp para coordinar más rápido 📱' },
];

// ── Config ───────────────────────────────────────────────────────────────────
export interface WidgetBrand {
  botName: string;
  orgName: string;
  tagline: string;
  accentColor?: string;
}

const DEFAULT_BRAND: WidgetBrand = {
  botName: 'Robi',
  orgName: 'Dr. Imports',
  tagline: 'Responde al instante',
};

// ── Icons (inline SVG subset needed by widget) ────────────────────────────────
function Icon({ name, size = 18, stroke = 2 }: { name: string; size?: number; stroke?: number }) {
  const paths: Record<string, string> = {
    send:    'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z',
    x:       'M18 6 6 18M6 6l12 12',
    refresh: 'M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8',
    chevDown:'M6 9l6 6 6-6',
    message: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
    check:   'M20 6 9 17l-5-5',
    shield:  'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    bot:     'M12 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm0 0v2M8 9h8a4 4 0 0 1 4 4v2a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-2a4 4 0 0 1 4-4zm-1 6h.01M17 15h.01',
    user:    'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    mail:    'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm18 2-10 7L2 6',
    phone:   'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z',
    target:  'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zm0-14a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4z',
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[name] || ''} />
    </svg>
  );
}

// ── BotAvatar ─────────────────────────────────────────────────────────────────
function BotAvatar({ size = 34, pulse = false }: { size?: number; pulse?: boolean }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0, position: 'relative',
      background: 'linear-gradient(140deg,#19232A,#0B0E11)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.07)',
    }}>
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 'inherit',
        background: 'conic-gradient(from 130deg, transparent, rgba(43,211,203,.6), transparent 60%)',
      }} />
      <Icon name="bot" size={size * 0.56} stroke={2.1} />
      <span style={{ position: 'absolute', inset: 0, borderRadius: 'inherit',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2BD3CB' }}>
        <Icon name="bot" size={size * 0.56} stroke={2.1} />
      </span>
      {pulse && (
        <span style={{
          position: 'absolute', right: -1, bottom: -1,
          width: size * 0.28, height: size * 0.28, borderRadius: '50%',
          background: 'var(--green)', border: '2px solid #0A0D10',
        }} />
      )}
    </div>
  );
}

// ── Bubble ────────────────────────────────────────────────────────────────────
function Bubble({ m }: { m: ConvoMessage }) {
  const isBot = m.from === 'bot';
  return (
    <div style={{
      display: 'flex', gap: 8, alignItems: 'flex-end',
      flexDirection: isBot ? 'row' : 'row-reverse',
    }}>
      {isBot ? <BotAvatar size={26} /> : <div style={{ width: 26 }} />}
      <div style={{
        maxWidth: '78%', display: 'flex', flexDirection: 'column', gap: 4,
        alignItems: isBot ? 'flex-start' : 'flex-end',
      }}>
        <div style={{
          padding: '10px 13px', fontSize: 14, lineHeight: 1.45, letterSpacing: '-.01em',
          borderRadius: isBot ? '16px 16px 16px 5px' : '16px 16px 5px 16px',
          background: isBot ? 'var(--surface-2)' : 'linear-gradient(135deg,#3A75C8,#234E94)',
          color: isBot ? 'var(--text)' : '#fff',
          boxShadow: isBot ? 'none' : '0 4px 14px rgba(46,99,180,.28)',
          border: isBot ? '1px solid var(--border)' : 'none',
          whiteSpace: 'pre-wrap',
        }}>
          {m.t}
        </div>
        {m.at && (
          <span style={{ fontSize: 10.5, color: 'var(--text-3)', padding: '0 4px' }}>
            {m.at}
          </span>
        )}
      </div>
    </div>
  );
}

// ── LeadSuccessCard ───────────────────────────────────────────────────────────
interface LeadData { name?: string; email?: string; phone?: string; intent?: string; }

function LeadSuccessCard({ lead, orgName }: { lead: LeadData; orgName: string }) {
  const rows: [string, string, string | undefined][] = [
    ['target', 'Interés',  lead.intent],
    ['user',   'Nombre',   lead.name],
    ['mail',   'Email',    lead.email],
    ['phone',  'WhatsApp', lead.phone],
  ];

  return (
    <div style={{
      margin: '4px 0 0', borderRadius: 16, overflow: 'hidden',
      border: '1px solid var(--accent-line)', boxShadow: 'var(--sh-2)',
    }}>
      <div style={{
        padding: '13px 15px',
        background: 'linear-gradient(135deg,#3A75C8,#234E94)',
        color: '#fff', display: 'flex', alignItems: 'center', gap: 11,
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: 'rgba(255,255,255,.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon name="check" size={19} stroke={3} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14.5, letterSpacing: '-.01em' }}>
            ¡Lead generado!
          </div>
          <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.85)' }}>
            Completaste todas las preguntas.
          </div>
        </div>
      </div>

      <div style={{
        padding: '12px 14px', background: 'var(--surface)',
        display: 'flex', flexDirection: 'column', gap: 9,
      }}>
        {rows.filter(r => r[2]).map(([icon, label, value], i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{
              width: 26, height: 26, borderRadius: 7, background: 'var(--surface-2)',
              color: 'var(--text-3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Icon name={icon} size={14} />
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-3)', width: 58, flexShrink: 0 }}>
              {label}
            </span>
            <span style={{
              fontSize: 13, fontWeight: 600, color: 'var(--text)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {value}
            </span>
          </div>
        ))}

        <div style={{
          marginTop: 3, paddingTop: 10, borderTop: '1px dashed var(--border)',
          fontSize: 11.5, color: 'var(--accent-2)',
          display: 'flex', alignItems: 'center', gap: 6,
          fontWeight: 600, lineHeight: 1.4,
        }}>
          <Icon name="shield" size={13} />
          Registrado en el panel de {orgName}. Un asesor te contactará.
        </div>
      </div>
    </div>
  );
}

// ── ChatWidget ────────────────────────────────────────────────────────────────
interface ChatWidgetProps {
  open: boolean;
  onClose: () => void;
  questions?: Question[];
  brand?: Partial<WidgetBrand>;
  onLeadGenerated?: (lead: LeadData) => void;
}

export function ChatWidget({
  open,
  onClose,
  questions = DEFAULT_QUESTIONS,
  brand = DEFAULT_BRAND,
  onLeadGenerated,
}: ChatWidgetProps) {
  const config: WidgetBrand = { ...DEFAULT_BRAND, ...brand };
  const flow = questions.filter(q => q.enabled).sort((a, b) => a.sortOrder - b.sortOrder);

  const [msgs, setMsgs]     = useState<ConvoMessage[]>([]);
  const [step, setStep]     = useState(-1);
  const [typing, setTyping] = useState(false);
  const [chips, setChips]   = useState<string[] | null>(null);
  const [input, setInput]   = useState('');
  const [lead, setLead]     = useState<LeadData>({});
  const [done, setDone]     = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const timers    = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const scrollDown = useCallback(() => {
    const el = scrollRef.current;
    if (el) requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
  }, []);

  useEffect(scrollDown, [msgs, typing, chips, scrollDown]);

  const nowTime = () => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const pushBot = useCallback((text: string, delay = 600) => {
    setTyping(true);
    scrollDown();
    const t = setTimeout(() => {
      setTyping(false);
      setMsgs(m => [...m, { from: 'bot', t: text, at: nowTime() }]);
    }, delay);
    timers.current.push(t);
  }, [scrollDown]);

  const runStep = useCallback((i: number, currentLead?: LeadData) => {
    const q = flow[i];
    if (!q) {
      setDone(true);
      return;
    }
    pushBot(q.prompt, 700);

    if (q.kind === 'choice') {
      const t = setTimeout(() => setChips(q.options ?? []), 700 + 520);
      timers.current.push(t);
    } else if (q.kind === 'message') {
      const t = setTimeout(() => {
        const next = i + 1;
        setStep(next);
        runStep(next, currentLead);
      }, 700 + 520 + 450);
      timers.current.push(t);
    }
  }, [flow, pushBot]); // eslint-disable-line react-hooks/exhaustive-deps

  const start = useCallback(() => {
    if (step >= 0) return;
    setStep(0);
    const t = setTimeout(() => runStep(0), 350);
    timers.current.push(t);
  }, [step, runStep]);

  useEffect(() => {
    if (open && step === -1) {
      const t = setTimeout(start, 500);
      timers.current.push(t);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const advance = useCallback((userText: string) => {
    const q = flow[step];
    setChips(null);
    setMsgs(m => [...m, { from: 'user', t: userText, at: nowTime() }]);

    let updatedLead = { ...lead };
    if (q?.field) updatedLead = { ...updatedLead, [q.field]: userText };
    else if (q?.kind === 'choice') updatedLead = { ...updatedLead, intent: userText };
    setLead(updatedLead);

    const next = step + 1;
    setStep(next);

    // Check if this was the last step
    const isLast = next >= flow.length;
    if (isLast) {
      // Trigger lead generated callback after a short delay
      setTimeout(() => onLeadGenerated?.(updatedLead), 300);
    }

    const t = setTimeout(() => runStep(next, updatedLead), 480);
    timers.current.push(t);
  }, [flow, step, lead, runStep, onLeadGenerated]);

  const submitInput = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || typing) return;
    advance(input.trim());
    setInput('');
  };

  const reset = () => {
    clearTimers();
    setMsgs([]); setStep(-1); setTyping(false);
    setChips(null); setLead({}); setDone(false);
    const t = setTimeout(() => {
      setStep(0);
      const t2 = setTimeout(() => runStep(0), 350);
      timers.current.push(t2);
    }, 200);
    timers.current.push(t);
  };

  const progress = done ? 100 : Math.min(99, Math.round((Math.max(step, 0) / flow.length) * 100));

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .widget-msg { animation: fadeInUp .22s var(--ease) both; }
        .widget-window {
          transform-origin: bottom right;
          transition: transform .42s cubic-bezier(.16,1,.3,1), opacity .3s cubic-bezier(.22,.61,.36,1);
        }
      `}</style>

      <div
        className="widget-window"
        style={{
          width: 380, height: 600, maxHeight: '82vh',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--r-2xl)', boxShadow: 'var(--sh-pop)',
          transform: open ? 'scale(1) translateY(0)' : 'scale(.86) translateY(16px)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
        }}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div style={{
          padding: '14px 14px 16px',
          background: 'linear-gradient(150deg,#13191E 0%,#0A0D10 100%)',
          position: 'relative', color: '#fff',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(420px 120px at 80% -20%, rgba(43,211,203,.32), transparent 70%)',
          }} />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 11 }}>
            <BotAvatar size={42} pulse />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontWeight: 700, fontSize: 15.5, letterSpacing: '-.02em' }}>
                  {config.botName}
                </span>
                <span style={{
                  fontSize: 11, fontWeight: 600, color: '#2BD3CB',
                  background: 'rgba(43,211,203,.14)', padding: '1px 7px', borderRadius: 99,
                }}>
                  online
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.62)', marginTop: 1 }}>
                {config.orgName} · {config.tagline}
              </div>
            </div>

            <button onClick={reset} title="Reiniciar" style={{
              width: 30, height: 30, borderRadius: 9, border: 'none', cursor: 'pointer',
              background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="refresh" size={15} />
            </button>
            <button onClick={onClose} title="Cerrar" style={{
              width: 30, height: 30, borderRadius: 9, border: 'none', cursor: 'pointer',
              background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.85)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="chevDown" size={18} />
            </button>
          </div>

          {/* Progress bar — no text, thin bar only */}
          <div style={{
            position: 'relative', marginTop: 13, height: 3,
            borderRadius: 99, background: 'rgba(255,255,255,.1)', overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', width: `${progress}%`,
              background: 'linear-gradient(90deg,#2BD3CB,#11A39C)',
              borderRadius: 99, transition: 'width .5s cubic-bezier(.22,.61,.36,1)',
            }} />
          </div>
        </div>

        {/* ── Messages ──────────────────────────────────────────────────── */}
        <div
          ref={scrollRef}
          style={{
            flex: 1, overflowY: 'auto', padding: '16px 14px',
            display: 'flex', flexDirection: 'column', gap: 12,
            background: 'var(--surface)',
            backgroundImage: 'radial-gradient(var(--border) .8px, transparent .8px)',
            backgroundSize: '22px 22px',
          }}
        >
          <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-3)', margin: '2px 0 4px' }}>
            Hoy · {config.orgName}
          </div>

          {msgs.map((m, i) => (
            <div key={i} className="widget-msg">
              <Bubble m={m} />
            </div>
          ))}

          {typing && (
            <div className="widget-msg" style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <BotAvatar size={26} />
              <div style={{
                padding: '12px 14px',
                borderRadius: '16px 16px 16px 5px',
                background: 'var(--surface-2)', border: '1px solid var(--border)',
              }}>
                <TypingDots />
              </div>
            </div>
          )}

          {chips && !done && (
            <div className="widget-msg" style={{
              display: 'flex', flexWrap: 'wrap', gap: 8, paddingLeft: 34, marginTop: 2,
            }}>
              {chips.map((c, i) => (
                <button
                  key={i}
                  onClick={() => advance(c)}
                  style={{
                    padding: '9px 14px', borderRadius: 99, fontSize: 13,
                    fontWeight: 600, cursor: 'pointer',
                    background: 'var(--surface)',
                    border: '1.5px solid var(--accent-line)',
                    color: 'var(--accent-2)',
                    transition: 'all .16s cubic-bezier(.22,.61,.36,1)',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'var(--accent-soft)';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'var(--surface)';
                    (e.currentTarget as HTMLElement).style.transform = 'none';
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          {done && (
            <div className="widget-msg">
              <LeadSuccessCard lead={lead} orgName={config.orgName} />
            </div>
          )}
        </div>

        {/* ── Input ─────────────────────────────────────────────────────── */}
        <form onSubmit={submitInput} style={{
          padding: '12px 12px 10px',
          borderTop: '1px solid var(--border)',
          background: 'var(--surface)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: 'var(--r-pill)', padding: '5px 6px 5px 14px',
            transition: 'border-color .2s',
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={
                done    ? 'Conversación finalizada ✓' :
                typing  ? `${config.botName} está escribiendo…` :
                          'Escribí tu mensaje…'
              }
              disabled={typing || !!chips || done}
              style={{
                flex: 1, border: 'none', outline: 'none',
                background: 'transparent', fontSize: 14,
                color: 'var(--text)', minWidth: 0,
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || typing || done}
              style={{
                width: 36, height: 36, borderRadius: 99, border: 'none',
                flexShrink: 0,
                cursor: input.trim() && !typing && !done ? 'pointer' : 'default',
                background: input.trim() && !done
                  ? 'linear-gradient(135deg,#3A75C8,#234E94)'
                  : 'var(--surface-3)',
                color: input.trim() && !done ? '#fff' : 'var(--text-3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all .2s',
                boxShadow: input.trim() && !done ? '0 4px 12px rgba(46,99,180,.32)' : 'none',
              }}
            >
              <Icon name="send" size={17} stroke={2.2} />
            </button>
          </div>

          <div style={{
            textAlign: 'center', marginTop: 8, fontSize: 10.5,
            color: 'var(--text-3)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', gap: 5,
          }}>
            <Icon name="bot" size={12} />
            con tecnología de{' '}
            <b style={{ color: 'var(--text-2)' }}>MKTRobot</b>
          </div>
        </form>
      </div>
    </>
  );
}

// ── WidgetLauncher (floating button + widget) ─────────────────────────────────
interface WidgetLauncherProps {
  defaultOpen?: boolean;
  questions?: Question[];
  brand?: Partial<WidgetBrand>;
  unreadCount?: number;
  onLeadGenerated?: (lead: LeadData) => void;
}

export function WidgetLauncher({
  defaultOpen = false,
  questions,
  brand,
  unreadCount = 1,
  onLeadGenerated,
}: WidgetLauncherProps) {
  const [open, setOpen]     = useState(defaultOpen);
  const [bumped, setBumped] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setBumped(true), 1400);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        @keyframes crRing {
          0%   { transform: scale(1);    opacity: .6; }
          100% { transform: scale(1.35); opacity: 0;  }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
        .tooltip-bump { animation: fadeIn .28s cubic-bezier(.22,.61,.36,1) both; }
      `}</style>

      <div style={{
        position: 'fixed', right: 24, bottom: 24, zIndex: 9999,
        display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 14,
      }}>
        {/* Widget window */}
        <ChatWidget
          open={open}
          onClose={() => setOpen(false)}
          questions={questions}
          brand={brand}
          onLeadGenerated={onLeadGenerated}
        />

        {/* Tooltip bubble */}
        {!open && bumped && (
          <div className="tooltip-bump" style={{
            maxWidth: 230, background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '16px 16px 4px 16px',
            padding: '11px 13px', boxShadow: 'var(--sh-3)',
            fontSize: 13, lineHeight: 1.4, color: 'var(--text)',
            position: 'relative',
          }}>
            <button
              onClick={() => setBumped(false)}
              style={{
                position: 'absolute', top: 6, right: 6,
                border: 'none', background: 'transparent',
                cursor: 'pointer', color: 'var(--text-3)', padding: 2,
              }}
            >
              <Icon name="x" size={13} />
            </button>
            👋 ¿Buscás precios o stock?{' '}
            <b>Escribime</b>, te respondo al toque.
          </div>
        )}

        {/* Launcher button */}
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            width: 62, height: 62, borderRadius: '50%', border: 'none',
            cursor: 'pointer', position: 'relative',
            background: 'linear-gradient(140deg,#19232A,#0A0D10)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 12px 30px rgba(8,30,33,.4), inset 0 0 0 1px rgba(255,255,255,.06)',
            transition: 'transform .3s cubic-bezier(.16,1,.3,1)',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.06)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
        >
          {/* Conic glow */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: 'conic-gradient(from 130deg, transparent, rgba(43,211,203,.6), transparent 60%)',
          }} />

          {/* Icon */}
          <div style={{
            position: 'relative', color: '#2BD3CB',
            transition: 'transform .35s cubic-bezier(.16,1,.3,1)',
            transform: open ? 'rotate(-90deg)' : 'none',
          }}>
            <Icon name={open ? 'chevDown' : 'message'} size={26} stroke={2.1} />
          </div>

          {/* Unread badge */}
          {!open && unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: 2, right: 4,
              width: 16, height: 16, borderRadius: 99,
              background: 'var(--red)', color: '#fff',
              fontSize: 10, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid #0A0D10',
            }}>
              {unreadCount}
            </span>
          )}

          {/* Pulsing ring */}
          {!open && (
            <span style={{
              position: 'absolute', inset: -3, borderRadius: '50%',
              border: '2px solid rgba(43,211,203,.4)',
              animation: 'crRing 2.4s cubic-bezier(.16,1,.3,1) infinite',
            }} />
          )}
        </button>
      </div>
    </>
  );
}
