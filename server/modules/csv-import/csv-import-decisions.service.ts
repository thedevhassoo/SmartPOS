import type { Handler } from '../../core/registry.ts';
import { find, fail } from '../../core/model.ts';
import { duplicateGroups, matchRetainedRows, unresolvedDuplicates } from '../../core/import-planning.ts';
export const importsChoose: Handler = ({ s, body }) => {
    const job = find(s.imports, body.job, 'Import job');
    if (job.cancelled) {
        fail('Import was cancelled');
    }
    if (job.confirmed) {
        fail('Import already confirmed');
    }
    const row = find(job.rows, body.row, 'Row');
    const group = duplicateGroups(job).find(rows => rows.some(item => item.id === row.id));
    if (!group || row.error && row.duplicateChoice !== 'Discard') {
        fail('Select a valid duplicate group row');
    }
    for (const item of group) {
        item.duplicateChoice = item.id === row.id ? 'Keep' : 'Discard';
        item.decision = item.id === row.id ? null : 'Skip';
        item.error = item.id === row.id ? '' : 'Duplicate row not retained';
    }
    for (const item of job.rows) {
        if (!item.error) {
            item.decision = null;
            item.existing = null;
            item.fingerprint = '';
        }
    }
    matchRetainedRows(s, job);
    return job;
};
export const importsDecide: Handler = ({ s, body }) => {
    const job = find(s.imports, body.job, 'Import job');
    if (job.cancelled) {
        fail('Import was cancelled');
    }
    if (unresolvedDuplicates(job).length) {
        fail('Resolve duplicate groups before Replace or Skip');
    }
    const row = find(job.rows, body.row, 'Row');
    if (row.status === 'Applied' || row.status === 'Skipped') {
        fail('Row already processed');
    }
    if (job.confirmed && row.status !== 'Failed') {
        fail('Only failed rows can be reconsidered');
    }
    if (body.decision !== 'Replace' && body.decision !== 'Skip') {
        fail('Choose Replace or Skip');
    }
    if (row.error && body.decision !== 'Skip') {
        fail('Invalid row must be skipped');
    }
    if (row.status === 'Failed' && body.decision === 'Replace' && row.message !== 'Ready for new decision') {
        fail('Refresh the failed row before retry');
    }
    row.decision = body.decision;
    if (row.status === 'Failed') {
        row.status = 'Preview';
        row.message = '';
        row.attempts = 0;
    }
    return job;
};
