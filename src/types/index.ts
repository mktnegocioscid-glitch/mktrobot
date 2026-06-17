// ============================================================
//  MKTRobot — Domain Types
//  Source: design_handoff_mktrobot/README.md
// ============================================================

// ── Auth ────────────────────────────────────────────────────
export type Role = 'superadmin' | 'client';

export interface User {
  id: string;
  email: string;
  role: Role;
  tenantId: string | null;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
}

// ── Tenant (Client) ─────────────────────────────────────────
export type Plan   = 'Prueba' | 'Starter' | 'Premium';
export type TenantStatus = 'active' | 'trial' | 'paused';

export interface Tenant {
  id: string;
  name: string;
  initials: string;
  industry: string;
  domain: string;
  plan: Plan;
  status: TenantStatus;
  widgets: number;
  leadsMonth: number;
  leadsTotal: number;
  unread: number;
  owner: string;
  email: string;
  installed: string;
  lastActivity: string;
  color: string;
  series: number[];
}

// ── Widget ──────────────────────────────────────────────────
export type WidgetStatus = 'active' | 'paused';
export type WidgetPosition = 'bottom-right' | 'bottom-left';

export interface WidgetConfig {
  questions: Question[];
  accentColor: string;
  botName: string;
  greeting: string;
  position: WidgetPosition;
}

export interface Widget {
  id: string;
  tenantId: string;
  name: string;
  site: string;
  status: WidgetStatus;
  config: WidgetConfig;
  leadsCount: number;
  createdAt: string;
}

// ── Question (conversational flow) ──────────────────────────
export type QuestionKind = 'message' | 'choice' | 'capture';
export type CaptureField = 'name' | 'email' | 'phone';

export interface Question {
  id: string;
  kind: QuestionKind;
  label: string;
  prompt: string;
  enabled: boolean;
  options?: string[];       // if kind === 'choice'
  field?: CaptureField;     // if kind === 'capture'
  sortOrder: number;
}

// ── Lead ────────────────────────────────────────────────────
export type LeadStatus = 'unread' | 'uncontacted' | 'contacted';

export interface ConvoMessage {
  from: 'bot' | 'user';
  t: string;
  at: string;
  chips?: string[];
}

export interface Lead {
  id: string;
  tenantId: string;
  widgetId: string;
  name: string;
  email: string;
  phone: string;
  status: LeadStatus;
  intent: string;
  source: string;
  snippet: string;
  conversation: ConvoMessage[];
  // Internal metadata — stored but NOT shown in UI
  country: string;
  device: string;
  os: string;
  browser: string;
  createdAt: string;
  updatedAt: string;
}

// ── Metrics ─────────────────────────────────────────────────
export interface MetricsTotals {
  total: number;
  unread: number;
  uncontacted: number;
  contacted: number;
  won: number;
}

export interface MetricsSeries {
  leads: number[];
  unread: number[];
  contacted: number[];
}

export interface MetricsBySource {
  label: string;
  value: number;
  color: string;
}

export interface FunnelStep {
  label: string;
  value: number;
  pct: number;
}

export interface Metrics {
  totals: MetricsTotals;
  deltas: Record<keyof MetricsTotals, number>;
  series: MetricsSeries;
  bySource: MetricsBySource[];
  funnel: FunnelStep[];
  hours: number[];
  topIntents: MetricsBySource[];
}

// ── Plans ───────────────────────────────────────────────────
export const PLAN_LEAD_LIMIT: Record<Plan, number> = {
  Prueba: 200,
  Starter: 200,
  Premium: 1000,
};

export const PLAN_PRICE_ARS: Record<Plan, number> = {
  Prueba: 0,
  Starter: 10000,
  Premium: 20000,
};

export const PLAN_WIDGET_LIMIT: Record<Plan, number> = {
  Prueba: 1,
  Starter: 1,
  Premium: 2,
};

export const PLAN_TONE: Record<Plan, string> = {
  Prueba: 'amber',
  Starter: 'accent',
  Premium: 'violet',
};

// ── Lead status colors ──────────────────────────────────────
export const STATUS_COLOR: Record<LeadStatus, string> = {
  unread:      'var(--red)',
  uncontacted: 'var(--amber)',
  contacted:   'var(--green)',
};

export const STATUS_SOFT: Record<LeadStatus, string> = {
  unread:      'var(--red-soft)',
  uncontacted: 'var(--amber-soft)',
  contacted:   'var(--green-soft)',
};

export const STATUS_LABEL: Record<LeadStatus, string> = {
  unread:      'Sin leer',
  uncontacted: 'Sin contactar',
  contacted:   'Contactado',
};
