import { randomUUID, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
export type Role = 'Owner' | 'Manager' | 'Cashier';
export type User = {
    id: string;
    name: string;
    username: string;
    password: string;
    role: Role;
    active: boolean;
};
export type Product = {
    id: string;
    name: string;
    barcode: string;
    price: number;
    category: string;
    location: string | null;
    threshold: number;
    expiryWarningDays?: number;
    created: string;
};
export type Batch = {
    id: string;
    product: string;
    quantity: number;
    cost: number | null;
    expiry: string | null;
    received: string;
    blocked: boolean;
};
export type Location = {
    id: string;
    name: string;
};
export type Item = {
    product: string;
    quantity: number;
};
export type Offer = {
    id: string;
    name: string;
    kind: 'percent' | 'fixed';
    value: number;
    start: string;
    end: string;
    cancelled: boolean;
};
export type QuoteLine = Item & {
    name: string;
    barcode: string;
    price: number;
    subtotal: number;
    discount: number;
    total: number;
};
export type Allocation = {
    batch: string;
    quantity: number;
    cost: number | null;
    expiry: string | null;
};
export type SaleLine = QuoteLine & {
    allocations: Allocation[];
};
export type Draft = {
    id: string;
    owner: string;
    items: Item[];
    saved: string;
    completed: string | null;
};
export type Sale = {
    id: string;
    draft: string;
    owner: string;
    key: string;
    fingerprint: string;
    at: string;
    subtotal: number;
    discount: number;
    total: number;
    offer: string | null;
    offerSnapshot?: Offer | null;
    lines: SaleLine[];
};
export type Refund = {
    id: string;
    sale: string;
    line: string;
    quantity: number;
    amount: number;
    requestedAmount: number;
    state: 'Pending' | 'Approved' | 'Rejected' | 'Refunded';
    requested: string;
    by: string;
    confirmed: string | null;
    reference: string;
    issue: string;
    inspection: string | null;
    disposition: 'Resellable' | 'Non-resellable' | null;
    restocked: number;
    returnCost: number | null;
    disposedAt?: string;
    reason?: string;
    unitRanges?: {
        start: number;
        end: number;
    }[];
};
export type ImportRow = {
    id: string;
    line: number;
    name: string;
    barcode: string;
    price: number;
    location: string;
    error: string;
    decision: 'Replace' | 'Skip' | null;
    existing: string | null;
    fingerprint: string;
    status: 'Preview' | 'Applied' | 'Skipped' | 'Failed';
    message: string;
    duplicateChoice?: 'Keep' | 'Discard' | null;
    locationFingerprint?: string | null;
    attempts?: number;
    outcome?: string | null;
};
export type ImportJob = {
    id: string;
    owner: string;
    confirmed: boolean;
    cancelled?: boolean;
    rows: ImportRow[];
    created: string;
};
export type Audit = {
    id: string;
    actor: string;
    action: string;
    at: string;
    detail: unknown;
    archivedAt?: string;
};
export type Session = {
    id: string;
    user: string;
    expires: string;
};
export type State = {
    users: User[];
    sessions: Session[];
    products: Product[];
    locations: Location[];
    batches: Batch[];
    drafts: Draft[];
    offers: Offer[];
    sales: Sale[];
    refunds: Refund[];
    imports: ImportJob[];
    audit: Audit[];
};
export const collections = ['users', 'sessions', 'products', 'locations', 'batches', 'drafts', 'offers', 'sales', 'refunds', 'imports', 'audit'] as const;
export function empty(): State {
    return {
        users: [], sessions: [], products: [], locations: [], batches: [], drafts: [], offers: [], sales: [], refunds: [], imports: [], audit: []
    };
}
export const id = () => randomUUID();
export class Fault extends Error {
    status: number;
    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}
export function fail(message: string, status = 400): never {
    throw new Fault(status, message);
}
export function obj(v: unknown): Record<string, unknown> {
    if (!v || typeof v !== 'object' || Array.isArray(v)) {
        fail('Expected an object');
    }
    return v as Record<string, unknown>;
}
export function str(v: unknown, label: string, max = 200): string {
    if (typeof v !== 'string' || !v.trim() || v.trim().length > max) {
        fail(`${label} is required (max ${max})`);
    }
    return v.trim();
}
export function opt(v: unknown, max = 200): string {
    return v === undefined || v === null || v === '' ? '' : str(v, 'Value', max);
}
export function integer(v: unknown, label: string, min = 0, max = 1000000): number {
    if ((typeof v !== 'number' && typeof v !== 'string') || String(v).trim() === '') {
        fail(`Invalid ${label}`);
    }
    const n = Number(v);
    if (!Number.isSafeInteger(n) || n < min || n > max) {
        fail(`Invalid ${label}`);
    }
    return n;
}
export function money(v: unknown): number {
    if (typeof v !== 'string' && typeof v !== 'number') {
        fail('Invalid PKR amount');
    }
    const s = String(v);
    if (!/^\d{1,9}(\.\d{1,2})?$/.test(s)) {
        fail('Invalid PKR amount (up to two decimals)');
    }
    const [a, b = ''] = s.split('.');
    return Number(a) * 100 + Number(b.padEnd(2, '0'));
}
export function find<T extends {
    id: string;
}>(arr: T[], v: unknown, label: string): T {
    const x = arr.find(a => a.id === v);
    if (!x) {
        fail(`${label} not found`, 404);
    }
    return x;
}
export const stamp = (n: Date) => n.toISOString();
export const day = (n: Date) => new Date(n.getTime() + 5 * 3600000).toISOString().slice(0, 10);
export function date(v: unknown): string {
    const s = str(v, 'Date', 10);
    if (!/^\d{4}-\d\d-\d\d$/.test(s) || !Number.isFinite(Date.parse(s)) || new Date(s).toISOString().slice(0, 10) !== s) {
        fail('Invalid calendar date');
    }
    return s;
}
export function instant(v: unknown): string {
    const s = str(v, 'Timestamp', 40);
    const iso = /^\d{4}-\d\d-\d\dT\d\d:\d\d(:\d\d(\.\d{1,3})?)?$/;
    const raw = iso.test(s) ? s + '+05:00' : s;
    const n = Date.parse(raw);
    if (!Number.isFinite(n)) {
        fail('Invalid timestamp');
    }
    return new Date(n).toISOString();
}
let passwordCodec: {
    hash: (v: string) => string;
    verify: (v: string, hash: string) => boolean;
} | undefined;
export function setPasswordCodec(codec: NonNullable<typeof passwordCodec>) {
    passwordCodec = codec;
}
export function password(v: unknown): string {
    const s = str(v, 'Password', 128);
    if (s.length < 10) {
        fail('Password must have at least 10 characters');
    }
    if (Buffer.byteLength(s, 'utf8') > 72) {
        fail('Password must not exceed 72 UTF-8 bytes');
    }
    if (passwordCodec) {
        return passwordCodec.hash(s);
    }
    const salt = randomBytes(16).toString('hex');
    return salt + ':' + scryptSync(s, salt, 64).toString('hex');
}
export function matches(v: unknown, stored: string): boolean {
    if (typeof v !== 'string' || Buffer.byteLength(v, 'utf8') > 72) {
        return false;
    }
    if (passwordCodec && stored.startsWith('$2')) {
        return passwordCodec.verify(v, stored);
    }
    const [salt, hash] = stored.split(':');
    if (!salt || !hash) {
        return false;
    }
    const b = Buffer.from(hash, 'hex');
    const a = scryptSync(v, salt, 64);
    return a.length === b.length && timingSafeEqual(a, b);
}
export const publicUser = (u: User) => ({
    id: u.id, name: u.name, username: u.username, role: u.role, active: u.active
});
export function audit(s: State, u: User, action: string, detail: unknown, n: Date) {
    s.audit.push({
        id: id(), actor: u.id, action, detail: structuredClone(detail), at: stamp(n)
    });
}
export function available(s: State, p: string, n: Date) {
    return s.batches.filter(b => b.product === p && !b.blocked && (!b.expiry || b.expiry >= day(n))).reduce((a, b) => a + b.quantity, 0);
}
export function recorded(s: State, p: string) {
    return s.batches.filter(b => b.product === p).reduce((a, b) => a + b.quantity, 0);
}
export function take(s: State, p: string, q: number, n: Date): Allocation[] {
    if (available(s, p, n) < q) {
        fail('Insufficient Available Stock', 409);
    }
    const out: Allocation[] = [];
    for (const b of s.batches.filter(b => b.product === p && b.quantity > 0 && !b.blocked && (!b.expiry || b.expiry >= day(n))).sort((a, b) => (a.expiry || '9999').localeCompare(b.expiry || '9999') || a.received.localeCompare(b.received) || a.id.localeCompare(b.id))) {
        const use = Math.min(q, b.quantity);
        if (use) {
            b.quantity -= use;
            q -= use;
            out.push({
                batch: b.id, quantity: use, cost: b.cost, expiry: b.expiry
            });
        }
        if (!q) {
            break;
        }
    }
    return out;
}
export function items(v: unknown): Item[] {
    if (!Array.isArray(v) || !v.length || v.length > 500) {
        fail('Provide 1 to 500 items');
    }
    const out: Item[] = [];
    for (const raw of v) {
        const a = obj(raw);
        const product = str(a.product, 'Product');
        const quantity = integer(a.quantity, 'Quantity', 1, 100000);
        const old = out.find(x => x.product === product);
        if (old) {
            old.quantity += quantity;
            if (old.quantity > 100000) {
                fail('Quantity too large');
            }
        }
        else {
            out.push({ product, quantity });
        }
    }
    return out;
}
export function normalized(s: string) {
    return s.trim().toLowerCase().replace(/[\s-]+/g, ' ');
}
export function fingerprint(p: Product | undefined) {
    return p ? JSON.stringify([p.name, p.barcode, p.price, p.category, p.location]) : '';
}
