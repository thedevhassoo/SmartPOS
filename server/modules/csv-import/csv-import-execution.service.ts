import type { Handler } from '../../core/registry.ts';
import { find, fail, fingerprint, id, stamp, audit } from '../../core/model.ts';
import { matchingLocation, matchCatalog, unresolvedDuplicates } from '../../core/import-planning.ts';
export const importsConfirm: Handler = ({ s, u, body, n }) => {
    const job = find(s.imports, body.job, 'Import job');
    if (job.cancelled) {
        fail('Import was cancelled');
    }
    if (body.confirm !== true) {
        fail('Explicit confirmation required');
    }
    if (!job.confirmed) {
        if (unresolvedDuplicates(job).length) {
            fail('Resolve duplicate groups before confirmation');
        }
        for (const row of job.rows) {
            if (!row.error && row.existing && !row.decision) {
                fail(`Resolve row ${row.line} before confirming`);
            }
        }
        job.confirmed = true;
        audit(s, u, 'import.confirm', { job: job.id }, n);
    }
    const initiating = s.users.find(user => user.id === job.owner && user.active && user.role !== 'Cashier');
    if (!initiating) {
        if (body.resume !== true) {
            fail('Import paused: originating user lost authorization; authorized resumption required', 409);
        }
        job.owner = u.id;
        audit(s, u, 'import.resume', { job: job.id }, n);
    }
    const row = job.rows.find(item => item.id === body.row);
    if (!row) {
        return job;
    }
    if (row.status === 'Applied' || row.status === 'Skipped') {
        return job;
    }
    if (row.status === 'Failed') {
        fail('Refresh and resolve failed row before retry', 409);
    }
    row.attempts = (row.attempts ?? 0) + 1;
    if (row.decision === 'Skip' || row.error) {
        row.status = 'Skipped';
        row.outcome = row.error ? 'Rejected' : 'Skipped';
        row.message = row.error || 'Skipped by user';
        return job;
    }
    const product = s.products.find(p => p.barcode === row.barcode);
    const existingLocation = matchingLocation(s, row.location);
    if (fingerprint(product) !== row.fingerprint || row.locationFingerprint && existingLocation?.id !== row.locationFingerprint) {
        row.status = 'Failed';
        row.message = 'Catalog or location changed; refresh row before retry';
        return job;
    }
    if (product && row.decision !== 'Replace') {
        fail('Existing product requires Replace or Skip');
    }
    let location = existingLocation;
    if (row.location && !location) {
        location = { id: id(), name: row.location };
        s.locations.push(location);
    }
    const before = product ? { ...product } : null;
    if (product) {
        Object.assign(product, {
            name: row.name, price: row.price, location: location?.id ?? null
        });
    }
    else {
        s.products.push({
            id: id(), name: row.name, barcode: row.barcode, price: row.price, category: 'Uncategorized', location: location?.id ?? null, threshold: 0, expiryWarningDays: 30, created: stamp(n)
        });
    }
    row.status = 'Applied';
    row.outcome = product ? 'Replaced' : 'Registered';
    row.message = '';
    audit(s, u, 'import.apply', {
        job: job.id, row: row.id, barcode: row.barcode, before, after: s.products.find(p => p.barcode === row.barcode)
    }, n);
    return job;
};
export const importsRefresh: Handler = ({ s, body }) => {
    const job = find(s.imports, body.job, 'Import job');
    if (job.cancelled) {
        fail('Import was cancelled');
    }
    const row = find(job.rows, body.row, 'Row');
    if (row.status !== 'Failed') {
        fail('Only failed row may be refreshed');
    }
    matchCatalog(s, row);
    row.decision = null;
    row.message = 'Ready for new decision';
    return job;
};
