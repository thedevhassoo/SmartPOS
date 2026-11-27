import { useState } from 'react';
import { Alert, Button, MenuItem, TextField } from '@mui/material';
import { api } from '../../api';
import { Card, Table, useLoad, Errors, managers, type Page, type Row } from '../../ui';
import type { Job } from './CsvImportPreviewPage';
function Decisions() {
    const jobs = useLoad<Job[]>('imports.list', []);
    const [jobId, setJobId] = useState('');
    const [rowId, setRowId] = useState('');
    const [decision, setDecision] = useState('Replace');
    const [error, setError] = useState('');
    const job = jobs.data.find(x => x.id === jobId);
    const groups = new Map<string, Row[]>();
    for (const row of job?.rows ?? []) {
        if (row.error && row.duplicateChoice !== 'Discard') {
            continue;
        }
        const code = String(row.barcode);
        groups.set(code, [...(groups.get(code) ?? []), row]);
    }
    const duplicates = [...groups.entries()].filter(([, rows]) => rows.length > 1);
    const unresolved = duplicates.some(([, rows]) => rows.some(row => !row.duplicateChoice));
    async function choose(row: Row) {
        try {
            setError('');
            await api('imports.choose', { job: jobId, row: row.id });
            await jobs.refresh();
        }
        catch (e) {
            setError((e as Error).message);
        }
    }
    async function save() {
        try {
            setError('');
            await api('imports.decide', {
                job: jobId, row: rowId, decision
            });
            await jobs.refresh();
        }
        catch (e) {
            setError((e as Error).message);
        }
    }
    return <>
        <Errors message={jobs.error || error}/>
        <Card title="Step 2 of 3 - Resolve rows">
            <TextField
                select
                fullWidth
                size="small"
                label="Import preview"
                value={jobId}
                onChange={e => {
        setJobId(e.target.value);
        setRowId('');
    }}
            >
                {jobs.data.filter(x => !x.cancelled).map(x => <MenuItem key={x.id} value={x.id}>{x.created} | {x.rows.length} rows</MenuItem>)}
            </TextField>
            <p className="muted">Select the retained row from each duplicate group before matching existing products.</p>
        </Card>
        {job && duplicates.map(([barcode, rows]) => <Card title={`Duplicate barcode: ${barcode}`} key={barcode}>
            <Table
                rows={rows}
                columns={['line', 'name', 'price', 'location', 'duplicateChoice']}
                onSelect={row => {
                if (!job.confirmed) {
                    void choose(row);
                }
            }}
            />
            <p className="muted">Select chooses the single retained row. Other duplicate rows will be rejected.</p>
        </Card>)}
        {job && !unresolved && <Card title="Replace or skip existing products">
            <div className="fields">
                <TextField
                    select
                    label="Row"
                    value={rowId}
                    onChange={e => setRowId(e.target.value)}
                    size="small"
                >
                    {job.rows.filter(row => !row.error && row.status !== 'Applied' && row.status !== 'Skipped').map(row => <MenuItem key={String(row.id)} value={String(row.id)}>{String(row.line)} | {String(row.name)}{row.existing ? ' (existing)' : ' (new)'}</MenuItem>)}
                </TextField>
                <TextField
                    select
                    label="Decision"
                    value={decision}
                    onChange={e => setDecision(e.target.value)}
                    size="small"
                >
                    <MenuItem value="Replace">Replace / use row</MenuItem>
                    <MenuItem value="Skip">Skip</MenuItem>
                </TextField>
            </div>
            <Button variant="contained" sx={{ mt: 2 }} disabled={!rowId} onClick={() => void save()}>Save decision</Button>
        </Card>}
        {job && <Card title="Validated import rows">
            <Table rows={job.rows} columns={['line', 'name', 'barcode', 'existing', 'duplicateChoice', 'error', 'decision', 'status']}/>
        </Card>}
    </>;
}
export const page: Page = {
    id: 'import-decisions', title: 'CSV row decisions', roles: managers, component: Decisions
};
