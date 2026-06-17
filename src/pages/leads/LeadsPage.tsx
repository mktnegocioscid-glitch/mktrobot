import React, { useState, useRef, useEffect } from 'react';

import { AppShell } from '../../components/AppShell/AppShell';
import { Card, StatusPill, Segmented, Button, Avatar } from '../../components/ui';
import { useLeads, useUpdateLeadStatus, useDeleteLead } from '../../hooks/useLeads';
import type { Lead, LeadStatus } from '../../types';
import { STATUS_COLOR } from '../../types';

// ── Icons ─────────────────────────────────────────────────────────────────────
function Icon({ name, size = 18, stroke = 2, style }: { name: string; size?: number; stroke?: number; style?: React.CSSProperties }) {
  const paths: Record<string, string> = {
    inbox:    'M22 12h-6l-2 3h-4l-2-3H2M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z',
    mail:     'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm18 2-10 7L2 6',
    phone:    'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z',
    message:  'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
    trash:    'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6',
    filter:   'M22 3H2l8 9.46V19l4 2v-8.54L22 3z',
    download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
    list:     'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
    grid2:    'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
    arrowL:   'M19 12H5M12 19l-7-7 7-7',
    chevDown: 'M6 9l6 6 6-6',
    chevLeft: 'M15 18l-6-6 6-6',
    chevRight:'M9 18l6-6-6-6',
    check:    'M20 6 9 17l-5-5',
    x:        'M18 6 6 18M6 6l12 12',
    globe:    'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zm-7-9h14M12 3a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z',
    monitor:  'M20 3H4a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zM8 21h8M12 17v4',
    target:   'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zm0-6a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
    calendar: 'M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM16 2v4M8 2v4M3 10h18',
    search:   'M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z',
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d={paths[name] || ''} />
    </svg>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function waDigits(phone: string) { return (phone || '').replace(/\D/g, ''); }

function waHref(lead: Lead) {
  const first = (lead.name || '').split(' ')[0];
  const msg = `¡Hola ${first}! 👋 Te contactamos de Dr. Imports por tu consulta sobre "${lead.intent}". ¿Cómo podemos ayudarte?`;
  return `https://wa.me/${waDigits(lead.phone)}?text=${encodeURIComponent(msg)}`;
}

function mailHref(lead: Lead) {
  const first = (lead.name || '').split(' ')[0];
  const subject = `Dr. Imports · tu consulta sobre ${lead.intent}`;
  const body = `¡Hola ${first}!\n\nGracias por escribirnos a través de nuestro chat. Recibimos tu consulta sobre "${lead.intent}" y queremos ayudarte.\n\n¿Cuándo te quedaría cómodo coordinar?\n\nSaludos,\nEquipo de Dr. Imports`;
  return `mailto:${lead.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

// ── Contact buttons ───────────────────────────────────────────────────────────
function WaButton({ lead, full }: { lead: Lead; full?: boolean }) {
  return (
    <a href={waHref(lead)} target="_blank" rel="noopener noreferrer"
      onClick={e => e.stopPropagation()}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
        height: 32, padding: '0 13px', borderRadius: 'var(--r-md)',
        background: 'var(--green-soft)', color: 'var(--green)',
        fontSize: 13, fontWeight: 650, cursor: 'pointer',
        width: full ? '100%' : 'auto', textDecoration: 'none',
        transition: 'background .15s',
      }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(31,169,113,.22)'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--green-soft)'}
    >
      <Icon name="phone" size={15} /> WhatsApp
    </a>
  );
}

function MailButton({ lead, full }: { lead: Lead; full?: boolean }) {
  return (
    <a href={mailHref(lead)} onClick={e => e.stopPropagation()}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
        height: 32, padding: '0 13px', borderRadius: 'var(--r-md)',
        background: 'var(--blue-soft)', color: 'var(--blue)',
        fontSize: 13, fontWeight: 650, cursor: 'pointer',
        width: full ? '100%' : 'auto', textDecoration: 'none',
        transition: 'background .15s',
      }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(62,99,221,.22)'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--blue-soft)'}
    >
      <Icon name="mail" size={15} /> Email
    </a>
  );
}

function WaIconButton({ lead }: { lead: Lead }) {
  return (
    <a href={waHref(lead)} target="_blank" rel="noopener noreferrer"
      onClick={e => e.stopPropagation()}
      style={{
        width: 32, height: 32, borderRadius: 'var(--r-md)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--green)', background: 'transparent',
        transition: 'background .15s', textDecoration: 'none',
      }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--green-soft)'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
    >
      <Icon name="phone" size={17} />
    </a>
  );
}

function MailIconButton({ lead }: { lead: Lead }) {
  return (
    <a href={mailHref(lead)} onClick={e => e.stopPropagation()}
      style={{
        width: 32, height: 32, borderRadius: 'var(--r-md)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--blue)', background: 'transparent',
        transition: 'background .15s', textDecoration: 'none',
      }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--blue-soft)'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
    >
      <Icon name="mail" size={17} />
    </a>
  );
}

// ── IconButton ────────────────────────────────────────────────────────────────
function IconBtn({ name, size = 32, onClick, style }: { name: string; size?: number; onClick?: (e: React.MouseEvent) => void; style?: React.CSSProperties }) {
  return (
    <button onClick={onClick} style={{
      width: size, height: size, borderRadius: 'var(--r-md)', border: 'none',
      background: 'transparent', cursor: 'pointer', color: 'var(--text-3)',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      transition: 'background .15s, color .15s', ...style,
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--red-soft)'; (e.currentTarget as HTMLElement).style.color = 'var(--red)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-3)'; }}
    >
      <Icon name={name} size={size * 0.5} />
    </button>
  );
}

// ── Status select dropdown ────────────────────────────────────────────────────
function StatusSelect({ value, onChange }: { value: LeadStatus; onChange: (s: LeadStatus) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 8, width: '100%', height: 38,
        padding: '0 12px', borderRadius: 'var(--r-md)',
        border: '1px solid var(--border)', background: 'var(--surface)',
        cursor: 'pointer', justifyContent: 'space-between',
      }}>
        <StatusPill status={value} />
        <Icon name="chevDown" size={15} style={{ color: 'var(--text-3)' }} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', left: 0, right: 0, top: 44,
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--r-md)', boxShadow: 'var(--sh-3)', zIndex: 20, padding: 5,
        }}>
          {(['unread', 'uncontacted', 'contacted'] as LeadStatus[]).map(s => (
            <button key={s} onClick={() => { onChange(s); setOpen(false); }} style={{
              display: 'flex', width: '100%', padding: 8, border: 'none',
              background: 'transparent', cursor: 'pointer', borderRadius: 8,
              transition: 'background .12s',
            }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
            >
              <StatusPill status={s} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Meta item (profile pane) ──────────────────────────────────────────────────
function MetaItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0' }}>
      <div style={{
        width: 30, height: 30, borderRadius: 8,
        background: 'var(--surface-2)', color: 'var(--text-3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon name={icon} size={15} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{label}</div>
        <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</div>
      </div>
    </div>
  );
}

// ── Conversation bubble ───────────────────────────────────────────────────────
function CRMBubble({ m }: { m: { from: string; t: string; at: string } }) {
  const incoming = m.from === 'user';
  return (
    <div style={{ display: 'flex', flexDirection: incoming ? 'row' : 'row-reverse', gap: 8, alignItems: 'flex-end' }}>
      <div style={{ maxWidth: '74%', display: 'flex', flexDirection: 'column', gap: 3, alignItems: incoming ? 'flex-start' : 'flex-end' }}>
        <div style={{
          padding: '9px 13px', fontSize: 13.5, lineHeight: 1.45,
          borderRadius: incoming ? '14px 14px 14px 4px' : '14px 14px 4px 14px',
          background: incoming ? 'var(--surface-2)' : 'var(--grad)',
          color: incoming ? 'var(--text)' : '#fff',
          border: incoming ? '1px solid var(--border)' : 'none',
          boxShadow: incoming ? 'none' : '0 3px 10px rgba(46,99,180,.22)',
        }}>
          {m.t}
        </div>
        <span style={{ fontSize: 10, color: 'var(--text-3)', padding: '0 3px' }}>{m.at}</span>
      </div>
    </div>
  );
}

// ── Delete confirm dialog ─────────────────────────────────────────────────────
function DeleteDialog({ lead, onClose, onConfirm }: { lead: Lead; onClose: () => void; onConfirm: () => void }) {
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
        width: '100%', maxWidth: 420,
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--r-xl)', boxShadow: 'var(--sh-pop)', padding: 22,
      }}>
        <div style={{ display: 'flex', gap: 13, alignItems: 'flex-start', marginBottom: 18 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: 'var(--red-soft)', color: 'var(--red)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Icon name="trash" size={20} />
          </div>
          <div>
            <div style={{ fontSize: 16.5, fontWeight: 750, letterSpacing: '-.02em', marginBottom: 5 }}>
              Eliminar lead
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.5 }}>
              Vas a eliminar el lead de <b style={{ color: 'var(--text)' }}>{lead.name}</b> y toda su conversación. Esta acción no se puede deshacer.
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="danger" style={{ flex: 1, justifyContent: 'center' }}
            icon={<Icon name="trash" size={15} />}
            onClick={() => { onConfirm(); onClose(); }}
          >
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── 3-pane inbox ──────────────────────────────────────────────────────────────
function LeadInbox({ leads, selectedId, onSelect, onBack, onStatusChange, onDelete }: {
  leads: Lead[];
  selectedId: string;
  onSelect: (id: string) => void;
  onBack: () => void;
  onStatusChange: (id: string, s: LeadStatus) => void;
  onDelete: (lead: Lead) => void;
}) {
  const lead = leads.find(l => l.id === selectedId) ?? leads[0];
  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [selectedId]);

  if (!lead) return null;

  const convo: { from: string; t: string; at: string }[] = Array.isArray(lead.conversation) ? lead.conversation as { from: string; t: string; at: string }[] : [];

  return (
    <div style={{
      display: 'flex', height: 'calc(100vh - 55px - 64px - 48px)', minHeight: 480,
      border: '1px solid var(--border)', borderRadius: 'var(--r-lg)',
      overflow: 'hidden', background: 'var(--surface)',
    }}>
      {/* List pane */}
      <div className="cr-inbox-list" style={{
        width: 280, flexShrink: 0, borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{
          padding: '12px 14px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <button onClick={onBack} style={{
            width: 32, height: 32, borderRadius: 9, border: '1px solid var(--border)',
            background: 'var(--surface)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-2)',
          }}>
            <Icon name="arrowL" size={16} />
          </button>
          <span style={{ fontWeight: 700, fontSize: 14 }}>Bandeja</span>
          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-3)' }}>{leads.length}</span>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {leads.map(l => {
            const act = l.id === (lead?.id);
            return (
              <button key={l.id} onClick={() => onSelect(l.id)} style={{
                display: 'flex', gap: 10, width: '100%', padding: '12px 14px',
                border: 'none', borderBottom: '1px solid var(--border)',
                cursor: 'pointer', textAlign: 'left',
                background: act ? 'var(--accent-soft)' : 'transparent',
                borderLeft: act ? '3px solid var(--accent)' : '3px solid transparent',
                transition: 'background .14s',
              }}
                onMouseEnter={e => { if (!act) (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
                onMouseLeave={e => { if (!act) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <Avatar name={l.name} size={38} color={STATUS_COLOR[l.status]} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 650, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {l.name}
                    </span>
                    <span style={{ fontSize: 10.5, color: 'var(--text-3)', flexShrink: 0 }}>{fmtTime(l.createdAt)}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: '2px 0 5px' }}>
                    {l.snippet}
                  </div>
                  <span style={{ width: 7, height: 7, borderRadius: 99, background: STATUS_COLOR[l.status], display: 'inline-block' }} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Conversation pane */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{
          padding: '11px 18px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <button onClick={onBack} className="cr-inbox-back" style={{
            display: 'none', width: 32, height: 32, borderRadius: 9,
            border: '1px solid var(--border)', background: 'var(--surface)',
            cursor: 'pointer', alignItems: 'center', justifyContent: 'center', color: 'var(--text-2)',
          }}>
            <Icon name="arrowL" size={16} />
          </button>
          <Avatar name={lead.name} size={40} color={STATUS_COLOR[lead.status]} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-.01em' }}>
              {lead.name}
              <span style={{ fontWeight: 500, color: 'var(--text-3)', fontSize: 13 }}> · {lead.email}</span>
            </div>
          </div>
          <WaButton lead={lead} />
          <MailButton lead={lead} />
          <IconBtn name="trash" onClick={() => onDelete(lead)} />
        </div>

        <div ref={threadRef} style={{
          flex: 1, overflowY: 'auto', padding: '20px 18px',
          display: 'flex', flexDirection: 'column', gap: 14,
          backgroundImage: 'radial-gradient(var(--border) .8px, transparent .8px)',
          backgroundSize: '22px 22px',
        }}>
          <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-3)' }}>
            {fmtDate(lead.createdAt)} · iniciada por el bot
          </div>
          {convo.length > 0 ? (
            convo.map((m, i) => <CRMBubble key={i} m={m} />)
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-3)', fontSize: 13 }}>
              No hay mensajes registrados en esta conversación.
            </div>
          )}
          <div style={{
            textAlign: 'center', fontSize: 11, color: 'var(--text-3)',
            marginTop: 4, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
          }}>
            <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            Lead capturado
            <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>
        </div>

        <div style={{
          padding: '14px 16px', borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
        }}>
          <div style={{ flex: 1, minWidth: 140, fontSize: 12.5, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 7, lineHeight: 1.4 }}>
            <Icon name="check" size={15} stroke={2.4} style={{ color: 'var(--green)' }} />
            Lead generado · contactalo directo:
          </div>
          <WaButton lead={lead} />
          <MailButton lead={lead} />
        </div>
      </div>

      {/* Profile pane */}
      <div className="cr-inbox-profile" style={{
        width: 288, flexShrink: 0, borderLeft: '1px solid var(--border)',
        overflowY: 'auto', padding: '20px 18px',
      }}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          textAlign: 'center', gap: 8, paddingBottom: 18, borderBottom: '1px solid var(--border)',
        }}>
          <Avatar name={lead.name} size={64} color={STATUS_COLOR[lead.status]} />
          <div>
            <div style={{ fontSize: 17, fontWeight: 750, letterSpacing: '-.02em' }}>{lead.name}</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-3)' }}>{lead.intent}</div>
          </div>
        </div>

        <div style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.05em', color: 'var(--text-3)', marginBottom: 8 }}>ESTADO</div>
          <StatusSelect value={lead.status} onChange={s => onStatusChange(lead.id, s)} />
          <div style={{ marginTop: 10 }}>
            <Button
              size="sm" variant="secondary"
              style={{ width: '100%', justifyContent: 'center' }}
              icon={<Icon name="check" size={14} />}
              onClick={() => onStatusChange(lead.id, 'contacted')}
            >
              Marcar contactado
            </Button>
          </div>
        </div>

        <div style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.05em', color: 'var(--text-3)', margin: '6px 0 2px' }}>CONTACTO</div>
          <MetaItem icon="mail" label="Email" value={lead.email} />
          <MetaItem icon="phone" label="Teléfono" value={lead.phone} />
        </div>

        <div style={{ padding: '8px 0' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.05em', color: 'var(--text-3)', margin: '6px 0 2px' }}>METADATOS</div>
          <MetaItem icon="target" label="Origen" value={lead.source || '—'} />
          <MetaItem icon="message" label="Intención" value={lead.intent || '—'} />
          <MetaItem icon="calendar" label="Fecha" value={`${fmtDate(lead.createdAt)} · ${fmtTime(lead.createdAt)}`} />
        </div>
      </div>

      <style>{`
        @media (max-width: 1080px) { .cr-inbox-profile { display: none !important; } }
        @media (max-width: 820px)  { .cr-inbox-list { display: none !important; } .cr-inbox-back { display: flex !important; } }
      `}</style>
    </div>
  );
}

// ── Lead card (grid view) ─────────────────────────────────────────────────────
function LeadCard({ lead, onOpen, onDelete }: { lead: Lead; onOpen: () => void; onDelete: () => void }) {
  return (
    <Card pad={0} hover style={{ overflow: 'hidden', cursor: 'pointer' }} onClick={onOpen}>
      <div style={{
        padding: '13px 15px', display: 'flex', alignItems: 'center', gap: 10,
        borderBottom: '1px solid var(--border)',
      }}>
        <StatusPill status={lead.status} />
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-3)' }}>{fmtDate(lead.createdAt)}</span>
        <IconBtn name="trash" size={30}
          onClick={e => { e.stopPropagation(); onDelete(); }}
          style={{ color: 'var(--text-3)' }}
        />
      </div>
      <div style={{ padding: '16px 15px', display: 'flex', gap: 13 }}>
        <Avatar name={lead.name} size={48} color={STATUS_COLOR[lead.status]} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-.01em' }}>{lead.name}</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
            <Icon name="phone" size={13} />{lead.phone}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 5, marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            <Icon name="mail" size={13} />{lead.email}
          </div>
        </div>
      </div>
      <div style={{ padding: '0 15px 14px' }}>
        <div style={{ display: 'flex', gap: 7, alignItems: 'flex-start', padding: '10px 12px', borderRadius: 10, background: 'var(--surface-2)' }}>
          <Icon name="message" size={14} style={{ color: 'var(--accent)', marginTop: 1, flexShrink: 0 }} />
          <span style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.4 }}>{lead.snippet}</span>
        </div>
        {lead.intent && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
            <span style={{
              fontSize: 11.5, fontWeight: 600, color: 'var(--accent-2)',
              background: 'var(--accent-soft)', padding: '3px 10px',
              borderRadius: 'var(--r-pill)',
            }}>
              {lead.intent}
            </span>
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <MailButton lead={lead} full />
          <WaButton lead={lead} full />
        </div>
      </div>
    </Card>
  );
}

// ── Filter tab ────────────────────────────────────────────────────────────────
function FilterTab({ label, count, active, onClick }: {
  id?: string; label: string; count: number; active: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick} style={{
      height: 32, padding: '0 12px', borderRadius: 9, border: 'none', cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
      background: active ? 'var(--accent-soft)' : 'transparent',
      color: active ? 'var(--accent-2)' : 'var(--text-3)',
      transition: 'background .14s, color .14s',
    }}>
      {label}
      <span style={{
        fontSize: 11, fontWeight: 700, padding: '1px 6px', borderRadius: 99,
        background: active ? 'var(--accent)' : 'var(--surface-3)',
        color: active ? '#fff' : 'var(--text-3)',
      }}>
        {count}
      </span>
    </button>
  );
}

// ── Mock data fallback ────────────────────────────────────────────────────────
const MOCK_LEADS: Lead[] = [
  { id: '1', tenantId: 't1', widgetId: 'w1', name: 'Franco Giménez',    email: 'franco.gimenez@gmail.com', phone: '+54 11 2659-8194', status: 'unread',      intent: 'Precios y modelos',       source: 'Sitio web · Home',   snippet: 'precio tiene referencias para ver en stock?', conversation: [{ from: 'bot', t: '¡Hola! 👋 Soy Robi...', at: '14:28' }, { from: 'user', t: 'Precios y modelos', at: '14:29' }, { from: 'bot', t: '¡Genial! ¿Cuál es tu nombre?', at: '14:29' }, { from: 'user', t: 'Franco', at: '14:30' }, { from: 'bot', t: '¿A qué email te enviamos la cotización?', at: '14:30' }, { from: 'user', t: 'franco.gimenez@gmail.com', at: '14:31' }, { from: 'bot', t: 'Dejanos tu WhatsApp 📱', at: '14:31' }, { from: 'user', t: '+54 11 2659-8194', at: '14:32' }], country: 'AR', device: 'mobile', os: 'Android', browser: 'Chrome', createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(), updatedAt: new Date().toISOString() },
  { id: '2', tenantId: 't1', widgetId: 'w1', name: 'Lucía Fernández',   email: 'lucia.fdez@hotmail.com',  phone: '+54 11 5521-3380', status: 'contacted',   intent: 'Hablar con un asesor',    source: 'Sitio web · Landing', snippet: 'perfecto, quedo a la espera del llamado 🙌', conversation: [{ from: 'bot', t: '¡Hola! 👋 Soy Robi...', at: '18:35' }, { from: 'user', t: 'Hablar con un asesor', at: '18:36' }, { from: 'user', t: 'Lucía', at: '18:37' }, { from: 'user', t: 'lucia.fdez@hotmail.com', at: '18:38' }], country: 'AR', device: 'mobile', os: 'iOS', browser: 'Safari', createdAt: new Date(Date.now() - 1000 * 60 * 14).toISOString(), updatedAt: new Date().toISOString() },
  { id: '3', tenantId: 't1', widgetId: 'w1', name: 'Juan Pablo Medina', email: 'juanpablomy@gmail.com',   phone: '+54 11 6256-8070', status: 'uncontacted', intent: 'Precios y modelos',       source: 'Google Ads',          snippet: 'me podrás pasar modelos y precios disponibles?', conversation: [], country: 'US', device: 'desktop', os: 'Windows', browser: 'Chrome', createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), updatedAt: new Date().toISOString() },
  { id: '4', tenantId: 't1', widgetId: 'w1', name: 'Armando Ríos',      email: 'absistemass@gmail.com',   phone: '+54 11 6759-1804', status: 'unread',      intent: 'Disponibilidad de stock', source: 'Sitio web · Home',   snippet: 'me interesa el producto, ¿hacen envíos?', conversation: [], country: 'US', device: 'desktop', os: 'Windows', browser: 'Chrome', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), updatedAt: new Date().toISOString() },
  { id: '5', tenantId: 't1', widgetId: 'w1', name: 'Diego Paz',         email: 'diegopaz.dev@gmail.com',  phone: '+54 11 3398-2240', status: 'contacted',   intent: 'Precios y modelos',       source: 'Instagram',           snippet: 'dale, ya hice la compra. ¡gracias!', conversation: [], country: 'AR', device: 'desktop', os: 'macOS', browser: 'Safari', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), updatedAt: new Date().toISOString() },
];

// ── Leads page ────────────────────────────────────────────────────────────────
type ViewMode = 'table' | 'grid' | 'inbox';
type FilterId = 'all' | LeadStatus;

export default function LeadsPage() {
  const [filter, setFilter]     = useState<FilterId>('all');
  const [view,   setView]       = useState<ViewMode>('table');
  const [openId, setOpenId]     = useState<string | null>(null);
  const [delLead, setDelLead]   = useState<Lead | null>(null);
  const [search, setSearch]     = useState('');

  const { data: leadsData, isLoading } = useLeads({ status: filter === 'all' ? undefined : filter });
  const updateStatus = useUpdateLeadStatus();
  const deleteLead   = useDeleteLead();

  // Use real data or mock fallback
  const allLeads: Lead[] = leadsData?.leads.length ? leadsData.leads : MOCK_LEADS;

  const filtered = allLeads.filter(l => {
    if (search) {
      const q = search.toLowerCase();
      return l.name?.toLowerCase().includes(q) || l.email?.toLowerCase().includes(q) || l.phone?.includes(q);
    }
    return true;
  });

  const countFor = (id: FilterId) => id === 'all' ? allLeads.length : allLeads.filter(l => l.status === id).length;

  function handleStatusChange(id: string, status: LeadStatus) {
    updateStatus.mutate({ id, status });
  }

  function handleDelete(lead: Lead) {
    setDelLead(lead);
  }

  function confirmDelete() {
    if (delLead) {
      deleteLead.mutate(delLead.id);
      if (openId === delLead.id) setOpenId(null);
    }
  }

  // 3-pane inbox mode
  if (openId) {
    return (
      <AppShell title="Leads · Conversación" unreadCount={countFor('unread')}>
        <LeadInbox
          leads={filtered}
          selectedId={openId}
          onSelect={setOpenId}
          onBack={() => setOpenId(null)}
          onStatusChange={handleStatusChange}
          onDelete={lead => setDelLead(lead)}
        />
        {delLead && (
          <DeleteDialog lead={delLead} onClose={() => setDelLead(null)}
            onConfirm={() => { confirmDelete(); setOpenId(null); }}
          />
        )}
      </AppShell>
    );
  }

  return (
    <AppShell title="Leads" unreadCount={countFor('unread')}>

      {/* Filter tabs + actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{
          display: 'flex', gap: 4, padding: 4,
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--r-md)', overflowX: 'auto',
        }}>
          {([
            { id: 'all',          label: 'Todos' },
            { id: 'unread',       label: 'Sin leer' },
            { id: 'uncontacted',  label: 'Sin contactar' },
            { id: 'contacted',    label: 'Contactados' },
          ] as { id: FilterId; label: string }[]).map(f => (
            <FilterTab key={f.id} id={f.id} label={f.label}
              count={countFor(f.id)} active={filter === f.id}
              onClick={() => setFilter(f.id)}
            />
          ))}
        </div>

        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, height: 38,
          padding: '0 12px', borderRadius: 'var(--r-md)',
          background: 'var(--surface)', border: '1px solid var(--border)',
          color: 'var(--text-3)', minWidth: 200,
        }}>
          <Icon name="search" size={16} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar nombre, email…"
            style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, flex: 1, color: 'var(--text)', minWidth: 0 }}
          />
        </div>

        <div style={{ flex: 1 }} />
        <Button size="sm" variant="secondary" icon={<Icon name="download" size={14} />}>Exportar</Button>
        <Segmented
          value={view}
          onChange={v => setView(v as ViewMode)}
          options={[
            { value: 'table', label: '', icon: <Icon name="list" size={15} /> },
            { value: 'grid',  label: '', icon: <Icon name="grid2" size={15} /> },
          ]}
        />
      </div>

      {/* Loading */}
      {isLoading && (
        <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-3)' }}>
          Cargando leads…
        </div>
      )}

      {/* Grid view */}
      {!isLoading && view === 'grid' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filtered.map(l => (
            <LeadCard key={l.id} lead={l}
              onOpen={() => setOpenId(l.id)}
              onDelete={() => handleDelete(l)}
            />
          ))}
        </div>
      )}

      {/* Table view */}
      {!isLoading && view === 'table' && (
        <Card pad={0} style={{ overflow: 'hidden' }}>
          <div className="cr-thead" style={{
            display: 'grid', gridTemplateColumns: '2.4fr 1.4fr 1.3fr 1.1fr 1fr 120px',
            gap: 12, padding: '12px 18px',
            borderBottom: '1px solid var(--border)',
            fontSize: 11.5, fontWeight: 700, letterSpacing: '.03em',
            color: 'var(--text-3)', textTransform: 'uppercase',
          }}>
            <span>Lead</span><span>Teléfono</span><span>Intención</span>
            <span>Estado</span><span>Fecha</span><span />
          </div>

          {filtered.length === 0 && (
            <div style={{ padding: '44px 20px', textAlign: 'center', color: 'var(--text-3)' }}>
              <Icon name="inbox" size={26} style={{ opacity: .5 }} />
              <div style={{ fontSize: 14, marginTop: 10 }}>No hay leads en esta vista.</div>
            </div>
          )}

          {filtered.map((l, i) => (
            <div key={l.id} className="cr-trow"
              onClick={() => setOpenId(l.id)}
              style={{
                display: 'grid', gridTemplateColumns: '2.4fr 1.4fr 1.3fr 1.1fr 1fr 120px',
                gap: 12, padding: '13px 18px',
                borderTop: i ? '1px solid var(--border)' : 'none',
                cursor: 'pointer', alignItems: 'center', transition: 'background .14s',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
            >
              {/* Name + email */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                <Avatar name={l.name} size={40} color={STATUS_COLOR[l.status]} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 650 }}>{l.name}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.email}</div>
                </div>
              </div>
              {/* Phone */}
              <div className="cr-tcell" style={{ fontSize: 13, color: 'var(--text-2)' }}>{l.phone}</div>
              {/* Intent */}
              <div className="cr-tcell">
                {l.intent && (
                  <span style={{
                    fontSize: 12, fontWeight: 600, color: 'var(--accent-2)',
                    background: 'var(--accent-soft)', padding: '3px 9px', borderRadius: 'var(--r-pill)',
                    whiteSpace: 'nowrap',
                  }}>
                    {l.intent}
                  </span>
                )}
              </div>
              {/* Status */}
              <div>
                <StatusPill status={l.status} />
              </div>
              {/* Date */}
              <div className="cr-tcell" style={{ fontSize: 12.5, color: 'var(--text-3)' }}>
                {fmtDate(l.createdAt)}<br />
                <span style={{ fontSize: 11 }}>{fmtTime(l.createdAt)}</span>
              </div>
              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-end' }}>
                <MailIconButton lead={l} />
                <WaIconButton lead={l} />
                <IconBtn name="trash" size={32} onClick={e => { e.stopPropagation(); handleDelete(l); }} />
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Pagination */}
      {!isLoading && filtered.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, fontSize: 13, color: 'var(--text-3)' }}>
          <span>Mostrando {filtered.length} de {allLeads.length} leads</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button style={{ width: 34, height: 34, borderRadius: 'var(--r-md)', border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)' }}>
              <Icon name="chevLeft" size={16} />
            </button>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 'var(--r-md)', background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 700 }}>1</span>
            <button style={{ width: 34, height: 34, borderRadius: 'var(--r-md)', border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)' }}>
              <Icon name="chevRight" size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Delete dialog */}
      {delLead && (
        <DeleteDialog lead={delLead} onClose={() => setDelLead(null)} onConfirm={confirmDelete} />
      )}

      <style>{`
        @media (max-width: 740px) {
          .cr-thead { grid-template-columns: 1fr 120px !important; }
          .cr-trow  { grid-template-columns: 1fr 120px !important; }
          .cr-tcell { display: none !important; }
        }
      `}</style>
    </AppShell>
  );
}
