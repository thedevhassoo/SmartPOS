import type { Handler } from '../../core/registry.ts';
import { type ImportRow, str, money, id, stamp, fail, find, audit } from '../../core/model.ts';
import { parseCsv } from '../../core/csv.ts';
import { matchRetainedRows } from '../../core/import-planning.ts';
export const importsList: Handler = ({ s }) => s.imports;
export const importsPreview: Handler = ({ s, u, body, n }) => {
    if (body.filename !== undefined && !str(body.filename, 'Filename', 255).toLowerCase().endsWith('.csv')) {
        fail('Only .csv files are accepted');
    }
    if (typeof body.csv !== 'string') {
        fail('CSV text required');
    }
    const [header, ...rows] = parseCsv(body.csv);
    if (JSON.stringify(header) !== JSON.stringify(['product_name', 'barcode', 'selling_price', 'storage_location'])) {
        fail('Invalid CSV header');
    }
    if (!rows.length) {
        fail('CSV must contain a data row');
    }
    const staged = rows.map((row, i): ImportRow => {
        let error = '', price = 0;
        try {
            if (row.length < 3 || row.length > 4) {
                fail('Expected three required fields and an optional location');
            }
            str(row[0], 'Name');
            str(row[1], 'Barcode', 128);
            price = money(row[2]);
            if ((row[3] ?? '').length > 200) {
                fail('Location too long');
            }
        }
        catch (e) {
            error = (e as Error).message;
        }
        return {
            id: id(), line: i + 2, name: (row[0] ?? '').trim(), barcode: (row[1] ?? '').trim(), price, location: (row[3] ?? '').trim(), error, decision: error ? 'Skip' : null, existing: null, fingerprint: '', status: 'Preview', message: '', duplicateChoice: null, attempts: 0, outcome: null
        };
    });
    const job = {
        id: id(), owner: u.id, confirmed: false, rows: staged, created: stamp(n)
    };
    matchRetainedRows(s, job);
    s.imports.push(job);
    return job;
};
export const importsCancel: Handler = ({ s, u, body, n }) => {
    const job = find(s.imports, body.job, 'Import job');
    if (job.confirmed) {
        fail('Confirmed imports cannot be cancelled');
    }
    job.cancelled = true;
    audit(s, u, 'import.cancel', { job: job.id }, n);
    return job;
};
