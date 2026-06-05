// Unified signup storage (beta + waitlist) on Netlify Blobs.
//
// Netlify Blobs is zero-config on Netlify (the adapter wires it when SSR is on).
// Outside Netlify (plain `astro dev`), getStore() throws, so we fall back to a
// per-process in-memory store — enough to click through the UI locally; real
// persistence only happens on the deployed branch / `netlify dev`.

import { getStore } from '@netlify/blobs';

export type SignupType = 'beta' | 'waitlist';

export interface PassEntry {
  operatorName: string;
  tierName: string;
  parkCount?: string;
}

export interface Signup {
  id: string;
  type: SignupType;
  email: string;
  createdAt: number; // epoch ms
  // Beta-only fields:
  name?: string;
  passes?: PassEntry[];
  iphone?: string;
  ios?: string;
  cadence?: string;
  testflight?: string;
  why?: string;
  source?: string;
}

export interface Settings {
  /** Email me on each new beta application. */
  betaEmails: boolean;
  /** Email me on each new waitlist signup. */
  waitlistEmails: boolean;
}

const DEFAULT_SETTINGS: Settings = { betaEmails: true, waitlistEmails: true };

// ---------- store accessor with dev fallback ----------

interface MinimalStore {
  setJSON(key: string, value: unknown): Promise<void>;
  get(key: string, opts?: { type: 'json' }): Promise<unknown>;
  delete(key: string): Promise<void>;
  list(): Promise<{ blobs: { key: string }[] }>;
}

const memory = new Map<string, Map<string, unknown>>();
function memStore(name: string): MinimalStore {
  if (!memory.has(name)) memory.set(name, new Map());
  const m = memory.get(name)!;
  return {
    async setJSON(key, value) { m.set(key, value); },
    async get(key) { return m.has(key) ? m.get(key) : null; },
    async delete(key) { m.delete(key); },
    async list() { return { blobs: [...m.keys()].map((key) => ({ key })) }; },
  };
}

function store(name: string): MinimalStore {
  try {
    return getStore(name) as unknown as MinimalStore;
  } catch {
    return memStore(name);
  }
}

const SIGNUPS = 'signups';
const META = 'signups-meta';
const SETTINGS_KEY = 'settings';

// ---------- signups ----------

export async function addSignup(record: Omit<Signup, 'id' | 'createdAt'> & { createdAt: number }): Promise<Signup> {
  // Sortable, collision-resistant id: time-prefixed so list() is roughly ordered.
  const id = `${record.createdAt}-${Math.random().toString(36).slice(2, 8)}`;
  const full: Signup = { ...record, id };
  await store(SIGNUPS).setJSON(id, full);
  return full;
}

export async function listSignups(type?: SignupType): Promise<Signup[]> {
  const s = store(SIGNUPS);
  const { blobs } = await s.list();
  const records = await Promise.all(
    blobs.map((b) => s.get(b.key, { type: 'json' }) as Promise<Signup | null>),
  );
  const all = records.filter((r): r is Signup => !!r);
  const filtered = type ? all.filter((r) => r.type === type) : all;
  return filtered.sort((a, b) => b.createdAt - a.createdAt); // newest first
}

// ---------- settings (email toggles) ----------

export async function getSettings(): Promise<Settings> {
  const raw = (await store(META).get(SETTINGS_KEY, { type: 'json' })) as Partial<Settings> | null;
  return { ...DEFAULT_SETTINGS, ...(raw || {}) };
}

export async function setSettings(next: Partial<Settings>): Promise<Settings> {
  const merged = { ...(await getSettings()), ...next };
  await store(META).setJSON(SETTINGS_KEY, merged);
  return merged;
}
