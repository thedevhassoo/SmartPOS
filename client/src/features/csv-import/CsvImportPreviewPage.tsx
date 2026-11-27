import { useState } from 'react';
import { Button, TextField, Alert } from '@mui/material';
import { api } from '../../api';
import { Card, Table, useLoad, Errors, managers, type Page, type Row } from '../../ui';
export type Job = {
    id: string;
    created: string;
    confirmed: boolean;
    cancelled?: boolean;
    rows: Row[];
};
function Preview() {
    const [filename, setFilename] = useState('products.csv');
    const [csv, setCsv] = useState(''), [job, setJob] = useState<Job | null>(null), [error, setError] = useState('');
    const jobs = useLoad<Job[]>('imports.list', []);
    return <>
        <Card title="Step 1 of 3 - Upload and validate CSV">
            <p className="muted">Exact header: product_name,barcode,selling_price,storage_location. UTF-8, 5 MB maximum.</p>
            <input
                type="file"
                accept=".csv,text/csv"
                onChange={async (e) => {
            const f = e.target.files?.[0];
            if (f) {
                if (!f.name.toLowerCase().endsWith('.csv')) {
                    setError('Only CSV files are accepted');
                    return;
                }
                setFilename(f.name);
                if (f.size > 5 * 1024 * 1024) {
                    setError('File exceeds 5 MB');
                    return;
                }
                setCsv(await f.text());
            }
        }}
            />
            <TextField
                multiline
                minRows={4}
                fullWidth
                label="CSV content"
                value={csv}
                onChange={e => setCsv(e.target.value)}
                sx={{ my: 2 }}
            />
            <Button variant="contained" onClick={async () => {
            try {
                setError('');
                setJob(await api<Job>('imports.preview', { csv, filename }));
                void jobs.refresh();
            }
            catch (e) {
                setError((e as Error).message);
            }
        }}>Validate preview</Button>
            {error && <Alert severity="error" sx={{ mt: 2 }}>
                {error}
            </Alert>}
        </Card>
        {job && <Card title={`Preview ${job.id}`}>
            <Table rows={job.rows} columns={['line', 'name', 'barcode', 'price', 'location', 'error', 'existing', 'duplicateChoice', 'decision']}/>
            {!job.confirmed && !job.cancelled && <Button color="error" onClick={async () => {
                    try {
                        await api('imports.cancel', { job: job.id });
                        setJob(null);
                        await jobs.refresh();
                    }
                    catch (e) {
                        setError((e as Error).message);
                    }
                }}>Cancel preview</Button>}
        </Card>}
        <Errors message={jobs.error}/>
        <Card title="Saved import previews">
            <Table rows={jobs.data.map(j => ({
        id: j.id, created: j.created, confirmed: j.confirmed, cancelled: j.cancelled ?? false, rows: j.rows.length
    }))}/>
        </Card>
    </>;
}
export const page: Page = {
    id: 'import-preview', title: 'CSV import preview', roles: managers, component: Preview
};
