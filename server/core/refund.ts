import { type SaleLine, type Refund, fail } from './model.ts';
export type UnitRange = {
    start: number;
    end: number;
};
export const elapsedEligible = (at: string, now: Date) => now.getTime() >= Date.parse(at) && now.getTime() - Date.parse(at) < 168 * 3600000;
// Allocate original units deterministically, releasing ranges on rejection.
// Ranges are half-open offsets into the immutable original sale line.
export function reserveUnits(line: SaleLine, existing: Refund[], quantity: number): UnitRange[] {
    const occupied = existing.filter(r => r.state !== 'Rejected').flatMap(r => r.unitRanges ?? []).sort((a, b) => a.start - b.start);
    let cursor = 0, remaining = quantity;
    const result: UnitRange[] = [];
    const take = (end: number) => {
        const count = Math.min(remaining, Math.max(0, end - cursor));
        if (count) {
            result.push({ start: cursor, end: cursor + count });
            remaining -= count;
        }
    };
    for (const range of occupied) {
        take(range.start);
        cursor = Math.max(cursor, range.end);
        if (!remaining) {
            break;
        }
    }
    if (remaining) {
        take(line.quantity);
    }
    if (quantity < 1 || remaining) {
        fail('Refund quantity exceeds remaining units', 409);
    }
    return result;
}
export function refundLimit(line: SaleLine, existing: Refund[], quantity: number) {
    const ranges = reserveUnits(line, existing, quantity);
    const allocated = ranges.reduce((total, range) => total + Number(BigInt(line.total) * BigInt(range.end) / BigInt(line.quantity) - BigInt(line.total) * BigInt(range.start) / BigInt(line.quantity)), 0);
    const spent = existing.filter(r => r.state !== 'Rejected').reduce((total, r) => total + r.amount, 0);
    return Math.min(allocated, line.total - spent);
}
