import React, { useState, useCallback } from 'react';
import { AppShell } from '../../components/AppShell/AppShell';
import { Card, Switch, Segmented, Button } from '../../components/ui';
import type { Question, QuestionKind, CaptureField, WidgetPosition } from '../../types';

// ── Icons ─────────────────────────────────────────────────────────────────────
function Icon({ name, size = 18, stroke = 2, style }: {
  name: string; size?: number; stroke?: number; style?: React.CSSProperties;
}) {
  const paths: Record<string, string> = {
    message:   'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
    list:      'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
    user:      'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    grip:      'M9 6h.01M9 12h.01M9 18h.01M15 6h.01M15 12h.01M15 18h.01',
    edit:      'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
    chevUp:    'M18 15l-6-6-6 6',
    trash:     'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6',
    plus:      'M12 5v14M5 12h14',
    check:     'M20 6 9 17l-5-5',
    layers:    'M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    palette:   'M12 22a10 10 0 0 1 0-20c5.52 0 10 4.03 10 9a6 6 0 0 1-6 6h-1.77a1 1 0 0 0-.97 1.26 1 1 0 0 1-.97 1.26H12zm0-16a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
    bot:       'M12 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 4v2M8 9h8a4 4 0 0 1 4 4v2a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-2a4 4 0 0 1 4-4zm-1 6h.01M17 15h.01',
    send:      'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z',
    eye:       'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zm11 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    copy:      'M20 9H11a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2zM5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 0 2 2v1',
    mail:      'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm18 2-10 7L2 6',
    link:      'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
    image:     'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12',
    globe:     'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zm-7-9h14M12 3a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z',
    sparkles:  'M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z',
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d={paths[name] || ''} />
    </svg>
  );
}

// ── Constants ─────────────────────────────────────────────────────────────────
const Q_TYPES = {
  message: { label: 'Mensaje', icon: 'message', tone: 'var(--blue)' },
  choice:  { label: 'Opciones', icon: 'list',    tone: 'var(--violet)' },
  capture: { label: 'Captura',  icon: 'user',    tone: 'var(--green)' },
} as const;

const FIELD_LABEL: Record<string, string> = {
  name: 'Nombre', email: 'Email', phone: 'Teléfono / WhatsApp',
};

const ACCENTS = [
  { name: 'Teal',     c: '#10B3AC', c2: '#0C928C' },
  { name: 'Azul',     c: '#3E63DD', c2: '#2D49B8' },
  { name: 'Violeta',  c: '#7C5CFC', c2: '#6342E0' },
  { name: 'Verde',    c: '#1FA971', c2: '#178A5C' },
  { name: 'Naranja',  c: '#E8930C', c2: '#C2790A' },
  { name: 'Rosa',     c: '#E5519A', c2: '#C93E82' },
];

type Accent = typeof ACCENTS[0];

// ── Default questions ─────────────────────────────────────────────────────────
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

// ── Field helpers ─────────────────────────────────────────────────────────────
function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 7 }}>{children}</div>;
}

function TextField({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{
        width: '100%', height: 40, padding: '0 13px', borderRadius: 'var(--r-md)',
        border: '1px solid var(--border)', background: 'var(--surface)',
        fontSize: 13.5, color: 'var(--text)', outline: 'none',
      }}
    />
  );
}

// ── Question row ──────────────────────────────────────────────────────────────
interface QuestionRowProps {
  q: Question;
  editing: boolean;
  onEditToggle: () => void;
  onToggle: () => void;
  onDelete: () => void;
  onChange: (patch: Partial<Question>) => void;
  onKind: (k: QuestionKind) => void;
  onAddOpt: () => void;
  onUpdOpt: (i: number, v: string) => void;
  onDelOpt: (i: number) => void;
  dragging: boolean;
  over: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dragHandlers: Record<string, (e?: any) => void>;
}

function QuestionRow({
  q, editing, onEditToggle, onToggle, onDelete, onChange, onKind,
  onAddOpt, onUpdOpt, onDelOpt, dragging, over, dragHandlers,
}: QuestionRowProps) {
  const tdef = Q_TYPES[q.kind] ?? Q_TYPES.message;
  const ta: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: 'var(--r-md)',
    border: '1px solid var(--border)', background: 'var(--surface)',
    fontSize: 13.5, color: 'var(--text)', outline: 'none',
    resize: 'vertical', lineHeight: 1.5, fontFamily: 'inherit',
  };

  return (
    <div
      draggable={!editing}
      {...(editing ? {} : dragHandlers)}
      style={{
        borderRadius: 'var(--r-md)',
        background: editing ? 'var(--surface-2)' : 'var(--surface)',
        border: `1px solid ${over ? 'var(--accent)' : editing ? 'var(--accent-line)' : 'var(--border)'}`,
        boxShadow: dragging ? 'var(--sh-3)' : editing ? 'var(--sh-2)' : 'var(--sh-1)',
        opacity: dragging ? .5 : 1,
        transition: 'border-color .15s, box-shadow .15s, opacity .15s',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, cursor: editing ? 'default' : 'grab' }}>
        <div style={{ color: 'var(--text-3)', display: 'flex', flexShrink: 0 }}>
          <Icon name="grip" size={18} />
        </div>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: tdef.tone + '1a', color: tdef.tone,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon name={tdef.icon} size={16} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13.5, fontWeight: 650, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {q.label}
            </span>
            {q.field && (
              <span style={{
                fontSize: 11, fontWeight: 700, color: 'var(--green)',
                background: 'var(--green-soft)', padding: '2px 7px', borderRadius: 99,
              }}>
                {FIELD_LABEL[q.field]}
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>
            {q.prompt}
          </div>
        </div>
        <span className="qr-type" style={{
          fontSize: 11, fontWeight: 600, color: tdef.tone,
          background: tdef.tone + '14', padding: '3px 8px', borderRadius: 6, flexShrink: 0,
        }}>
          {tdef.label}
        </span>
        <button
          onClick={onEditToggle}
          style={{
            width: 32, height: 32, borderRadius: 'var(--r-md)', border: 'none',
            background: editing ? 'var(--accent-soft)' : 'transparent',
            color: editing ? 'var(--accent)' : 'var(--text-3)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Icon name={editing ? 'chevUp' : 'edit'} size={16} />
        </button>
        <Switch checked={q.enabled} onChange={onToggle} size="sm" />
        <button
          onClick={onDelete}
          style={{
            width: 30, height: 30, borderRadius: 'var(--r-md)', border: 'none',
            background: 'transparent', color: 'var(--text-3)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'color .15s, background .15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--red)'; (e.currentTarget as HTMLElement).style.background = 'var(--red-soft)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-3)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >
          <Icon name="trash" size={15} />
        </button>
      </div>

      {/* Inline editor */}
      {editing && (
        <div style={{ padding: '2px 14px 16px', display: 'flex', flexDirection: 'column', gap: 15 }}>
          {/* Kind selector */}
          <div>
            <FieldLabel>Tipo de paso</FieldLabel>
            <Segmented
              value={q.kind} onChange={v => onKind(v as QuestionKind)}
              options={[
                { value: 'message', label: 'Mensaje', icon: <Icon name="message" size={14} /> },
                { value: 'choice',  label: 'Opciones', icon: <Icon name="list" size={14} /> },
                { value: 'capture', label: 'Captura',  icon: <Icon name="user" size={14} /> },
              ]}
            />
          </div>

          {/* Label */}
          <div>
            <FieldLabel>Etiqueta (nombre interno del paso)</FieldLabel>
            <TextField value={q.label} onChange={v => onChange({ label: v })} placeholder="Ej. Pregunta de presupuesto" />
          </div>

          {/* Prompt */}
          <div>
            <FieldLabel>{q.kind === 'message' ? 'Mensaje que envía el bot' : 'Pregunta que hace el bot'}</FieldLabel>
            <textarea
              value={q.prompt} onChange={e => onChange({ prompt: e.target.value })}
              rows={2} style={ta} placeholder="Escribí lo que dirá el bot…"
            />
          </div>

          {/* Capture field */}
          {q.kind === 'capture' && (
            <div>
              <FieldLabel>Dato a capturar</FieldLabel>
              <Segmented
                value={q.field ?? 'name'} onChange={v => onChange({ field: v as CaptureField })}
                options={[
                  { value: 'name',  label: 'Nombre' },
                  { value: 'email', label: 'Email' },
                  { value: 'phone', label: 'Teléfono' },
                ]}
              />
            </div>
          )}

          {/* Choice options */}
          {q.kind === 'choice' && (
            <div>
              <FieldLabel>Opciones de respuesta (botones rápidos)</FieldLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(q.options ?? []).map((o, oi) => (
                  <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      width: 22, height: 22, borderRadius: 7, background: 'var(--surface-3)',
                      color: 'var(--text-3)', fontSize: 11, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      {oi + 1}
                    </span>
                    <input
                      value={o} onChange={e => onUpdOpt(oi, e.target.value)}
                      placeholder={`Opción ${oi + 1}`}
                      style={{
                        flex: 1, height: 38, padding: '0 12px', borderRadius: 'var(--r-md)',
                        border: '1px solid var(--border)', background: 'var(--surface)',
                        fontSize: 13.5, color: 'var(--text)', outline: 'none',
                      }}
                    />
                    {(q.options ?? []).length > 1 && (
                      <button
                        onClick={() => onDelOpt(oi)}
                        style={{
                          width: 34, height: 34, borderRadius: 'var(--r-md)',
                          border: '1px solid var(--border)', background: 'var(--surface)',
                          cursor: 'pointer', color: 'var(--text-3)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--red)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--red)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-3)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
                      >
                        <Icon name="trash" size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button onClick={onAddOpt} style={{
                marginTop: 10, height: 36, padding: '0 13px', borderRadius: 'var(--r-md)',
                border: '1.5px dashed var(--border-2)', background: 'var(--surface)',
                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7,
                fontSize: 12.5, fontWeight: 600, color: 'var(--text-2)',
              }}>
                <Icon name="plus" size={14} /> Agregar opción
              </button>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button size="sm" icon={<Icon name="check" size={14} />} onClick={onEditToggle}>
              Listo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Live preview ──────────────────────────────────────────────────────────────
function LivePreview({ accent, botName, greeting, questions }: {
  accent: Accent; botName: string; greeting: string; questions: Question[];
}) {
  const grad = `linear-gradient(135deg, ${accent.c}, ${accent.c2})`;
  const firstChoice = questions.find(q => q.enabled && q.kind === 'choice');

  return (
    <div style={{
      position: 'relative', minHeight: 460,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 0',
    }}>
      <div style={{ width: 300, maxWidth: '100%' }}>
        {/* Preview label */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
          fontSize: 11.5, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '.04em',
        }}>
          <Icon name="eye" size={13} /> VISTA PREVIA EN VIVO
        </div>

        <div style={{
          borderRadius: 22, overflow: 'hidden',
          background: 'var(--surface)', border: '1px solid var(--border)',
          boxShadow: 'var(--sh-pop)',
        }}>
          {/* Header */}
          <div style={{
            padding: '13px 14px', background: 'linear-gradient(150deg,#13191E,#0A0D10)',
            color: '#fff', display: 'flex', alignItems: 'center', gap: 10, position: 'relative',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: `radial-gradient(300px 90px at 80% -20%, ${accent.c}55, transparent 70%)`,
            }} />
            <div style={{
              width: 36, height: 36, borderRadius: '50%', background: '#13191E',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.08)',
              flexShrink: 0,
            }}>
              <Icon name="bot" size={20} style={{ color: accent.c }} />
            </div>
            <div style={{ position: 'relative' }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{botName || 'Robi'}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: 99, background: accent.c }} />
                online
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            padding: 14, display: 'flex', flexDirection: 'column', gap: 9, minHeight: 150,
            background: 'var(--surface)',
            backgroundImage: 'radial-gradient(var(--border) .7px, transparent .7px)',
            backgroundSize: '20px 20px',
          }}>
            {/* Greeting bubble */}
            <div style={{
              alignSelf: 'flex-start', maxWidth: '85%',
              padding: '9px 12px', borderRadius: '13px 13px 13px 4px',
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              fontSize: 12.5, lineHeight: 1.4,
            }}>
              {greeting || '¡Hola! 👋 ¿En qué puedo ayudarte?'}
            </div>

            {/* Choice chips */}
            {firstChoice && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 2 }}>
                {(firstChoice.options ?? []).slice(0, 3).map((o, i) => (
                  <span key={i} style={{
                    padding: '7px 11px', borderRadius: 99, fontSize: 11.5, fontWeight: 600,
                    border: `1.5px solid ${accent.c}`, color: accent.c2,
                    background: 'var(--surface)',
                  }}>
                    {o}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Input bar */}
          <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              borderRadius: 99, padding: '5px 6px 5px 13px',
            }}>
              <span style={{ flex: 1, fontSize: 12.5, color: 'var(--text-3)' }}>Escribí tu mensaje…</span>
              <span style={{
                width: 30, height: 30, borderRadius: 99, background: grad,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Icon name="send" size={14} style={{ color: '#fff' }} />
              </span>
            </div>
          </div>
        </div>

        {/* Flow steps */}
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {questions.filter(q => q.enabled).map((q, i) => {
            const tdef = Q_TYPES[q.kind];
            return (
              <div key={q.id} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 10px', borderRadius: 9,
                background: i === 0 ? 'var(--accent-soft)' : 'transparent',
                border: `1px solid ${i === 0 ? 'var(--accent-line)' : 'transparent'}`,
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 6,
                  background: tdef.tone + '1a', color: tdef.tone,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon name={tdef.icon} size={12} />
                </div>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-2)', flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {q.label}
                </span>
                <span style={{ fontSize: 10, color: tdef.tone, background: tdef.tone + '14', padding: '2px 6px', borderRadius: 5, fontWeight: 600, flexShrink: 0 }}>
                  {tdef.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Install code ──────────────────────────────────────────────────────────────
function InstallCode({ accent, position, widgetId, site }: {
  accent: Accent; position: WidgetPosition; widgetId: string; site: string;
}) {
  const [copied, setCopied] = useState(false);

  const snippet = `<!-- MKTRobot · ${site} -->
<script
  src="https://cdn.mktrobot.com/widget.js"
  data-widget-id="${widgetId}"
  data-color="${accent.c}"
  data-position="${position}"
  async></script>`;

  function copy() {
    navigator.clipboard.writeText(snippet).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  const lines = [
    { type: 'comment', text: `<!-- MKTRobot · ${site} -->` },
    { type: 'tag',     text: '<script' },
    { type: 'attr',    key: '  src', val: 'https://cdn.mktrobot.com/widget.js' },
    { type: 'attr',    key: '  data-widget-id', val: widgetId },
    { type: 'attr',    key: '  data-color', val: accent.c },
    { type: 'attr',    key: '  data-position', val: position },
    { type: 'tag',     text: '  async></script>' },
  ];

  return (
    <Card pad={18}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 6 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: 'var(--accent-soft)', color: 'var(--accent-2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="copy" size={16} />
        </div>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text)' }}>Código de instalación</span>
      </div>
      <p style={{ fontSize: 12.5, color: 'var(--text-3)', margin: '0 0 12px', lineHeight: 1.5 }}>
        Pegá este código antes de{' '}
        <code style={{ fontFamily: 'var(--mono)', background: 'var(--surface-2)', padding: '1px 5px', borderRadius: 5, fontSize: 11.5 }}>
          &lt;/body&gt;
        </code>{' '}
        en tu sitio. El widget aparecerá con tu color y posición.
      </p>

      <div style={{ position: 'relative', borderRadius: 'var(--r-md)', overflow: 'hidden', border: '1px solid var(--border)', background: '#0B0F12' }}>
        <button onClick={copy} style={{
          position: 'absolute', top: 9, right: 9, zIndex: 2,
          height: 30, padding: '0 11px', borderRadius: 8, cursor: 'pointer',
          border: `1px solid ${copied ? 'transparent' : 'rgba(255,255,255,.16)'}`,
          background: copied ? 'var(--grad)' : 'rgba(255,255,255,.08)',
          color: '#fff', fontSize: 12, fontWeight: 600,
          display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'all .15s',
        }}>
          <Icon name={copied ? 'check' : 'copy'} size={13} />
          {copied ? '¡Copiado!' : 'Copiar'}
        </button>

        <pre style={{ margin: 0, padding: '14px 16px', fontFamily: 'var(--mono)', fontSize: 12, lineHeight: 1.7, color: '#9DABB2', overflowX: 'auto' }}>
          {lines.map((l, i) => {
            if (l.type === 'comment') return <div key={i} style={{ color: '#5A6B73' }}>{l.text}</div>;
            if (l.type === 'tag')    return <div key={i}><span style={{ color: '#7AA0FF' }}>{l.text}</span></div>;
            return (
              <div key={i}>
                <span style={{ color: '#22C9C1' }}>{l.key}</span>
                <span style={{ color: '#5A6B73' }}>=</span>
                <span style={{ color: '#E8B339' }}>"{l.val}"</span>
              </div>
            );
          })}
        </pre>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <Button size="sm" variant="secondary" icon={<Icon name="mail" size={14} />} style={{ flex: 1, justifyContent: 'center' }}>
          Enviar a mi equipo
        </Button>
        <Button size="sm" variant="secondary" icon={<Icon name="link" size={14} />} style={{ flex: 1, justifyContent: 'center' }}>
          Ver guías (WordPress, Shopify…)
        </Button>
      </div>
    </Card>
  );
}

// ── Builder editor ────────────────────────────────────────────────────────────
interface WidgetConfig {
  id: string;
  name: string;
  site: string;
  color: string;
  position: WidgetPosition;
}

function BuilderEditor({ widget }: { widget: WidgetConfig }) {
  const [tab,       setTab]       = useState<'questions' | 'appearance'>('questions');
  const [questions, setQuestions] = useState<Question[]>(() => DEFAULT_QUESTIONS.map(q => ({ ...q })));
  const [accent,    setAccent]    = useState<Accent>(() => ACCENTS.find(a => a.c === widget.color) ?? ACCENTS[0]);
  const [botName,   setBotName]   = useState('Robi');
  const [greeting,  setGreeting]  = useState('¡Hola! 👋 Soy Robi, el asistente de Dr. Imports. ¿En qué puedo ayudarte hoy?');
  const [position,  setPosition]  = useState<WidgetPosition>(widget.position ?? 'bottom-right');
  const [drag,      setDrag]      = useState<{ from: number | null; over: number | null }>({ from: null, over: null });
  const [editId,    setEditId]    = useState<string | null>(null);
  const [saved,     setSaved]     = useState(false);

  // Question mutations
  const toggle  = (i: number) => setQuestions(qs => qs.map((q, j) => j === i ? { ...q, enabled: !q.enabled } : q));
  const del     = (i: number) => setQuestions(qs => { if (qs[i]?.id === editId) setEditId(null); return qs.filter((_, j) => j !== i); });
  const updateQ = (i: number, patch: Partial<Question>) => setQuestions(qs => qs.map((q, j) => j === i ? { ...q, ...patch } : q));

  const setKind = (i: number, kind: QuestionKind) => setQuestions(qs => qs.map((q, j) => {
    if (j !== i) return q;
    const n = { ...q, kind };
    if (kind === 'choice') { (n as Question).options = q.options?.length ? q.options : ['Opción 1', 'Opción 2']; delete (n as Question).field; }
    else if (kind === 'capture') { (n as Question).field = q.field ?? 'name'; delete (n as Question).options; }
    else { delete (n as Question).options; delete (n as Question).field; }
    return n;
  }));

  const addOption = (i: number)          => setQuestions(qs => qs.map((q, j) => j === i ? { ...q, options: [...(q.options ?? []), 'Nueva opción'] } : q));
  const updOption = (i: number, oi: number, val: string) => setQuestions(qs => qs.map((q, j) => j === i ? { ...q, options: (q.options ?? []).map((o, k) => k === oi ? val : o) } : q));
  const delOption = (i: number, oi: number)              => setQuestions(qs => qs.map((q, j) => j === i ? { ...q, options: (q.options ?? []).filter((_, k) => k !== oi) } : q));

  function addQ(kind: QuestionKind) {
    const id = 'q' + Date.now();
    const nq: Question = {
      id, kind, sortOrder: questions.length,
      label:   kind === 'choice' ? 'Nueva pregunta' : kind === 'capture' ? 'Nuevo dato' : 'Nuevo mensaje',
      prompt:  kind === 'choice' ? '¿Sobre qué querés consultar?' : kind === 'capture' ? '¿Cuál es tu dato?' : 'Escribí tu mensaje aquí…',
      options: kind === 'choice' ? ['Opción 1', 'Opción 2'] : undefined,
      field:   kind === 'capture' ? 'name' : undefined,
      enabled: true,
    };
    setQuestions(qs => [...qs, nq]);
    setEditId(id);
  }

  // Drag handlers
  const onDragStart = useCallback((i: number) => () => setDrag({ from: i, over: i }), []);
  const onDragOver  = useCallback((i: number) => (e: React.DragEvent) => { e.preventDefault(); setDrag(d => d.over === i ? d : { ...d, over: i }); }, []);
  const onDrop      = useCallback(() => () => {
    setDrag(d => {
      if (d.from == null || d.over == null || d.from === d.over) return { from: null, over: null };
      setQuestions(qs => { const arr = [...qs]; const [m] = arr.splice(d.from!, 1); arr.splice(d.over!, 0, m); return arr; });
      return { from: null, over: null };
    });
  }, []);
  const onDragEnd   = useCallback(() => () => setDrag({ from: null, over: null }), []);

  const liveGreeting = questions.find(q => q.kind === 'message' && q.enabled)?.prompt ?? greeting;

  async function handleSave() {
    // TODO: call saveQuestions(widget.id, questions) + updateWidget
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const ADD_BTN: React.CSSProperties = {
    height: 40, padding: '0 14px', borderRadius: 'var(--r-md)',
    border: '1.5px dashed var(--border-2)', background: 'var(--surface)',
    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7,
    fontSize: 13, fontWeight: 600, color: 'var(--text-2)', transition: 'border-color .15s, background .15s',
  };

  return (
    <>
      {/* Sub-header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 14, color: 'var(--text-2)' }}>
          Editá el flujo y la apariencia de <b style={{ color: 'var(--text)' }}>{widget.name}</b>
          {' · '}<span style={{ color: 'var(--text-3)' }}>{widget.site}</span>
          . Cambios reflejados en la <b style={{ color: 'var(--text)' }}>vista previa</b>.
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button size="sm" variant="secondary" icon={<Icon name="eye" size={14} />}>Probar</Button>
          <Button size="sm" icon={<Icon name="check" size={14} />} onClick={handleSave}>
            {saved ? '¡Publicado!' : 'Publicar cambios'}
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 18, alignItems: 'start' }} className="cr-builder">
        {/* Config column */}
        <div>
          <div style={{ marginBottom: 14 }}>
            <Segmented
              value={tab} onChange={v => setTab(v as typeof tab)}
              options={[
                { value: 'questions',  label: 'Preguntas',  icon: <Icon name="layers" size={14} /> },
                { value: 'appearance', label: 'Apariencia', icon: <Icon name="palette" size={14} /> },
              ]}
            />
          </div>

          {/* QUESTIONS TAB */}
          {tab === 'questions' && (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {questions.map((q, i) => (
                  <QuestionRow
                    key={q.id} q={q}
                    editing={editId === q.id}
                    onEditToggle={() => setEditId(editId === q.id ? null : q.id)}
                    onToggle={() => toggle(i)} onDelete={() => del(i)}
                    onChange={patch => updateQ(i, patch)} onKind={k => setKind(i, k)}
                    onAddOpt={() => addOption(i)}
                    onUpdOpt={(oi, v) => updOption(i, oi, v)}
                    onDelOpt={oi => delOption(i, oi)}
                    dragging={drag.from === i}
                    over={drag.over === i && drag.from != null && drag.from !== i}
                    dragHandlers={{
                      onDragStart: onDragStart(i),
                      onDragOver:  onDragOver(i),
                      onDrop:      onDrop(),
                      onDragEnd:   onDragEnd(),
                    }}
                  />
                ))}
              </div>

              {/* Add question buttons */}
              <div style={{ display: 'flex', gap: 9, marginTop: 14, flexWrap: 'wrap' }} className="cr-addq-row">
                <button onClick={() => addQ('message')} style={ADD_BTN}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--blue)'; (e.currentTarget as HTMLElement).style.color = 'var(--blue)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-2)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-2)'; }}
                >
                  <Icon name="plus" size={15} /> Mensaje
                </button>
                <button onClick={() => addQ('choice')} style={ADD_BTN}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--violet)'; (e.currentTarget as HTMLElement).style.color = 'var(--violet)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-2)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-2)'; }}
                >
                  <Icon name="list" size={15} /> Opciones
                </button>
                <button onClick={() => addQ('capture')} style={ADD_BTN}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--green)'; (e.currentTarget as HTMLElement).style.color = 'var(--green)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-2)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-2)'; }}
                >
                  <Icon name="user" size={15} /> Captura de dato
                </button>
              </div>

              <div style={{
                marginTop: 16, padding: '12px 14px', borderRadius: 'var(--r-md)',
                background: 'var(--accent-soft)',
                display: 'flex', gap: 9, alignItems: 'center',
                fontSize: 12.5, color: 'var(--accent-2)',
              }}>
                <Icon name="sparkles" size={16} />
                Arrastrá las tarjetas para reordenar el flujo. Desactivá un paso con el switch.
              </div>
            </div>
          )}

          {/* APPEARANCE TAB */}
          {tab === 'appearance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <InstallCode accent={accent} position={position} widgetId={widget.id} site={widget.site} />

              {/* Accent colors */}
              <Card pad={18}>
                <FieldLabel>Color de acento</FieldLabel>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {ACCENTS.map(a => (
                    <button
                      key={a.name} onClick={() => setAccent(a)} title={a.name}
                      style={{
                        width: 38, height: 38, borderRadius: 11, cursor: 'pointer',
                        background: `linear-gradient(135deg,${a.c},${a.c2})`,
                        border: accent.name === a.name ? '2px solid var(--text)' : '2px solid transparent',
                        boxShadow: accent.name === a.name
                          ? `0 0 0 3px var(--surface), 0 0 0 5px ${a.c}`
                          : 'var(--sh-1)',
                        transition: 'all .15s',
                      }}
                    />
                  ))}
                </div>
              </Card>

              {/* Avatar upload */}
              <Card pad={18}>
                <FieldLabel>Avatar / logo del bot</FieldLabel>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <div style={{
                    width: 62, height: 62, borderRadius: '50%',
                    background: 'linear-gradient(140deg,#19232A,#0A0D10)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Icon name="bot" size={28} style={{ color: accent.c }} />
                  </div>
                  <div style={{
                    flex: 1, border: '1.5px dashed var(--border-2)', borderRadius: 'var(--r-md)',
                    padding: 16, textAlign: 'center', cursor: 'pointer', background: 'var(--surface-2)',
                    transition: 'border-color .15s',
                  }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-2)'}
                  >
                    <Icon name="image" size={20} style={{ color: 'var(--text-3)' }} />
                    <div style={{ fontSize: 12.5, color: 'var(--text-2)', fontWeight: 600, marginTop: 4 }}>
                      Arrastrá una imagen o{' '}
                      <span style={{ color: 'var(--accent-2)' }}>subí un archivo</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>PNG, JPG o SVG · máx 2MB</div>
                  </div>
                </div>
              </Card>

              {/* Bot name, greeting, position */}
              <Card pad={18}>
                <div style={{ marginBottom: 16 }}>
                  <FieldLabel>Nombre del bot</FieldLabel>
                  <TextField value={botName} onChange={setBotName} placeholder="Robi" />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <FieldLabel>Mensaje de bienvenida</FieldLabel>
                  <textarea
                    value={greeting} onChange={e => setGreeting(e.target.value)} rows={3}
                    style={{
                      width: '100%', padding: '10px 13px', borderRadius: 'var(--r-md)',
                      border: '1px solid var(--border)', background: 'var(--surface)',
                      fontSize: 13.5, color: 'var(--text)', outline: 'none',
                      resize: 'vertical', lineHeight: 1.5, fontFamily: 'inherit',
                    }}
                  />
                </div>
                <div>
                  <FieldLabel>Posición en pantalla</FieldLabel>
                  <Segmented
                    value={position} onChange={v => setPosition(v as WidgetPosition)}
                    options={[
                      { value: 'bottom-left',  label: 'Inferior izq.' },
                      { value: 'bottom-right', label: 'Inferior der.' },
                    ]}
                  />
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Preview column (sticky) */}
        <div style={{ position: 'sticky', top: 88 }} className="cr-preview-col">
          <LivePreview
            accent={accent} botName={botName}
            greeting={tab === 'appearance' ? greeting : liveGreeting}
            questions={questions}
          />
        </div>
      </div>

      <style>{`
        @media (max-width: 980px) {
          .cr-builder { grid-template-columns: 1fr !important; }
          .cr-preview-col { position: static !important; margin-top: 8px; }
        }
        @media (max-width: 520px) { .cr-addq-row button { flex: 1; justify-content: center; } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </>
  );
}

// ── Builder page ──────────────────────────────────────────────────────────────
const DEMO_WIDGET: WidgetConfig = {
  id:       'b0000001-0000-0000-0000-000000000001',
  name:     'Widget principal',
  site:     'https://dr-imports.com',
  color:    '#10B3AC',
  position: 'bottom-right',
};

export default function BuilderPage() {
  return (
    <AppShell title="Constructor del chatbot">
      <BuilderEditor widget={DEMO_WIDGET} />
    </AppShell>
  );
}
