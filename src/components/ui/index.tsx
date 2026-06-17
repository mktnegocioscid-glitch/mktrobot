import React from 'react';
import type { LeadStatus } from '../../types';
import { STATUS_COLOR, STATUS_SOFT, STATUS_LABEL } from '../../types';

// ── Button ──────────────────────────────────────────────────────────────────
type BtnSize    = 'sm' | 'md' | 'lg';
type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'soft' | 'danger' | 'dark';

const BTN_HEIGHT: Record<BtnSize, number>  = { sm: 32, md: 38, lg: 46 };
const BTN_FONT:   Record<BtnSize, number>  = { sm: 13, md: 13.5, lg: 15 };
const BTN_PAD:    Record<BtnSize, string>  = { sm: '0 12px', md: '0 16px', lg: '0 22px' };

const BTN_STYLE: Record<BtnVariant, React.CSSProperties> = {
  primary:   { background: 'var(--grad)', color: '#fff', boxShadow: '0 2px 8px rgba(46,99,180,.30)' },
  secondary: { background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)' },
  ghost:     { background: 'transparent', color: 'var(--text-2)' },
  soft:      { background: 'var(--accent-soft)', color: 'var(--accent)' },
  danger:    { background: 'var(--red-soft)', color: 'var(--red)' },
  dark:      { background: 'var(--text)', color: 'var(--bg)' },
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: BtnSize;
  variant?: BtnVariant;
  icon?: React.ReactNode;
  iconend?: React.ReactNode;
  loading?: boolean;
}

export function Button({
  size = 'md', variant = 'primary', icon, iconend, loading,
  children, style, disabled, ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        gap: 7, height: BTN_HEIGHT[size], padding: BTN_PAD[size],
        borderRadius: 'var(--r-md)', border: 'none', cursor: 'pointer',
        fontSize: BTN_FONT[size], fontWeight: 600, letterSpacing: '-.01em',
        whiteSpace: 'nowrap', transition: 'all .15s var(--ease)',
        opacity: (disabled || loading) ? .55 : 1,
        ...BTN_STYLE[variant],
        ...style,
      }}
      onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
      {...props}
    >
      {loading ? <TypingDots /> : <>
        {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
        {children}
        {iconend && <span style={{ display: 'flex', alignItems: 'center' }}>{iconend}</span>}
      </>}
    </button>
  );
}

// ── IconButton ───────────────────────────────────────────────────────────────
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  size?: number;
}

export function IconButton({ active, size = 34, children, style, ...props }: IconButtonProps) {
  return (
    <button
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: size, height: size, borderRadius: 'var(--r-md)', border: 'none', cursor: 'pointer',
        background: active ? 'var(--accent-soft)' : 'transparent',
        color: active ? 'var(--accent)' : 'var(--text-3)',
        transition: 'all .15s var(--ease)',
        ...style,
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-3)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = active ? 'var(--accent-soft)' : 'transparent'; }}
      {...props}
    >
      {children}
    </button>
  );
}

// ── StatusPill ───────────────────────────────────────────────────────────────
// ONLY 3 statuses: unread (red) | uncontacted (amber) | contacted (green)
interface StatusPillProps {
  status: LeadStatus;
  style?: React.CSSProperties;
}

export function StatusPill({ status, style }: StatusPillProps) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 10px', borderRadius: 'var(--r-pill)',
      background: STATUS_SOFT[status],
      fontSize: 12.5, fontWeight: 600, color: STATUS_COLOR[status],
      ...style,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: STATUS_COLOR[status], flexShrink: 0,
      }} />
      {STATUS_LABEL[status]}
    </span>
  );
}

// ── Badge ────────────────────────────────────────────────────────────────────
interface BadgeProps {
  count: number;
  style?: React.CSSProperties;
}

export function Badge({ count, style }: BadgeProps) {
  if (count === 0) return null;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      minWidth: 18, height: 18, padding: '0 5px',
      borderRadius: 'var(--r-pill)', background: 'var(--red)',
      color: '#fff', fontSize: 11, fontWeight: 700,
      ...style,
    }}>
      {count > 99 ? '99+' : count}
    </span>
  );
}

// ── Avatar ───────────────────────────────────────────────────────────────────
interface AvatarProps {
  name: string;
  color?: string;
  size?: number;
  style?: React.CSSProperties;
  src?: string;
}

export function Avatar({ name, color = 'var(--accent)', size = 36, src, style }: AvatarProps) {
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: color, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: 700, overflow: 'hidden',
      ...style,
    }}>
      {src ? <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
    </div>
  );
}

// ── LeadAvatar (robot on status-color circle) ─────────────────────────────────
interface LeadAvatarProps {
  status: LeadStatus;
  size?: number;
  robotSrc?: string;
}

export function LeadAvatar({ status, size = 36, robotSrc = '/robot-avatar.png' }: LeadAvatarProps) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: STATUS_COLOR[status],
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', position: 'relative',
    }}>
      <img src={robotSrc} alt="" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
    </div>
  );
}

// ── Switch ────────────────────────────────────────────────────────────────────
interface SwitchProps {
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export function Switch({ checked, onChange, disabled, size = 'md' }: SwitchProps) {
  const w = size === 'md' ? 38 : 28;
  const h = size === 'md' ? 22 : 16;
  const dot = size === 'md' ? 16 : 11;
  const travel = w - h;

  return (
    <button
      role="switch" aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      style={{
        display: 'inline-flex', alignItems: 'center',
        width: w, height: h, borderRadius: 'var(--r-pill)',
        padding: 3, border: 'none', cursor: disabled ? 'default' : 'pointer',
        background: checked ? 'var(--accent)' : 'var(--surface-3)',
        transition: 'background .22s var(--ease)',
        opacity: disabled ? .5 : 1,
        flexShrink: 0,
      }}
    >
      <span style={{
        width: dot, height: dot, borderRadius: '50%', background: '#fff',
        transform: `translateX(${checked ? travel - 6 : 0}px)`,
        transition: 'transform .22s var(--ease)',
        boxShadow: '0 1px 3px rgba(0,0,0,.18)',
      }} />
    </button>
  );
}

// ── Segmented control ────────────────────────────────────────────────────────
interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

interface SegmentedProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (v: T) => void;
}

export function Segmented<T extends string>({ options, value, onChange }: SegmentedProps<T>) {
  return (
    <div style={{
      display: 'inline-flex', padding: 3, gap: 2,
      background: 'var(--surface-2)', border: '1px solid var(--border)',
      borderRadius: 'var(--r-md)',
    }}>
      {options.map(opt => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              height: 30, padding: '0 12px', borderRadius: 9, border: 'none',
              cursor: 'pointer', fontSize: 13, fontWeight: 600,
              background: active ? 'var(--surface)' : 'transparent',
              color: active ? 'var(--text)' : 'var(--text-3)',
              boxShadow: active ? 'var(--sh-1)' : 'none',
              transition: 'all .15s var(--ease)',
            }}
          >
            {opt.icon}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Card ─────────────────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  hover?: boolean;
  pad?: number | string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export function Card({ children, hover, pad = 20, style, onClick }: CardProps) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => hover && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)', padding: pad,
        boxShadow: hovered ? 'var(--sh-2)' : 'var(--sh-1)',
        transition: 'box-shadow .18s var(--ease), transform .18s var(--ease)',
        transform: hovered ? 'translateY(-1px)' : 'none',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Sparkline ─────────────────────────────────────────────────────────────────
interface SparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}

export function Sparkline({ data, color = 'var(--accent)', width = 80, height = 32 }: SparklineProps) {
  if (!data.length) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);

  const points = data.map((v, i) => ({
    x: i * step,
    y: height - ((v - min) / range) * (height - 4) - 2,
  }));

  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const fill = `${d} L ${points[points.length - 1].x} ${height} L 0 ${height} Z`;

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`sg-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fill} fill={`url(#sg-${color})`} />
      <path d={d} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── TypingDots ────────────────────────────────────────────────────────────────
export function TypingDots() {
  return (
    <>
      <style>{`
        @keyframes td-bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
      `}</style>
      <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            width: 5, height: 5, borderRadius: '50%',
            background: 'var(--text-3)',
            animation: `td-bounce .9s ${i * .15}s infinite ease`,
          }} />
        ))}
      </span>
    </>
  );
}

// ── ThemeToggle ───────────────────────────────────────────────────────────────
import { useThemeStore } from '../../store/themeStore';

export function ThemeToggle() {
  const { theme, toggle } = useThemeStore();
  return (
    <button
      onClick={toggle}
      title="Cambiar tema"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        height: 36, padding: '0 6px 0 10px', borderRadius: 'var(--r-pill)',
        cursor: 'pointer', background: 'var(--surface-2)',
        border: '1px solid var(--border)', color: 'var(--text-2)',
        fontSize: 12.5, fontWeight: 600,
      }}
    >
      {theme === 'light' ? '☀️' : '🌙'}
      <span style={{
        width: 30, height: 18, borderRadius: 'var(--r-pill)',
        background: theme === 'dark' ? 'var(--accent)' : 'var(--surface-3)',
        padding: 2, display: 'inline-flex',
      }}>
        <span style={{
          width: 14, height: 14, borderRadius: '50%', background: '#fff',
          transform: `translateX(${theme === 'dark' ? 12 : 0}px)`,
          transition: 'transform .22s var(--ease)',
        }} />
      </span>
    </button>
  );
}

// ── Divider ───────────────────────────────────────────────────────────────────
export function Divider({ style }: { style?: React.CSSProperties }) {
  return <div style={{ height: 1, background: 'var(--border)', ...style }} />;
}
