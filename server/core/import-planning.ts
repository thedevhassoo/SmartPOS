import { fingerprint, normalized, type ImportJob, type ImportRow, type State } from './model.ts';
export function matchingLocation(state: State, name: string) {
    return name ? state.locations.find(location => normalized(location.name) === normalized(name)) : undefined;
}
export function duplicateGroups(job: ImportJob): ImportRow[][] {
    const groups = new Map<string, ImportRow[]>();
    for (const row of job.rows) {
        if (row.error && row.duplicateChoice !== 'Discard') {
            continue;
        }
        const group = groups.get(row.barcode) ?? [];
        group.push(row);
        groups.set(row.barcode, group);
    }
    return [...groups.values()].filter(group => group.length > 1);
}
export function unresolvedDuplicates(job: ImportJob) {
    return duplicateGroups(job).filter(group => group.filter(row => row.duplicateChoice === 'Keep').length !== 1 || group.some(row => !row.duplicateChoice));
}
export function matchCatalog(state: State, row: ImportRow) {
    const product = state.products.find(p => p.barcode === row.barcode);
    row.existing = product?.id ?? null;
    row.fingerprint = fingerprint(product);
    row.locationFingerprint = matchingLocation(state, row.location)?.id ?? null;
}
export function matchRetainedRows(state: State, job: ImportJob) {
    if (unresolvedDuplicates(job).length) {
        return;
    }
    for (const row of job.rows) {
        if (!row.error && row.duplicateChoice !== 'Discard') {
            matchCatalog(state, row);
        }
    }
}
