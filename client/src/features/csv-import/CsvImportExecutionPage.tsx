import { useState, useEffect } from 'react';
import { Button, TextField, MenuItem, Alert, Checkbox, FormControlLabel } from '@mui/material';
import { api } from '../../api';
import { Card, Table, useLoad, Errors, managers, type Page } from '../../ui';
import type { Job } from './CsvImportPreviewPage';
function Execute() {
    const j = useLoad<Job[]>('imports.list', []);
    const [jobId, setJobId] = useState(''), [confirm, setConfirm] = useState(false), [error, setError] = useState(''), [busy, setBusy] = useState(false);
    const job = j.data.find(x => x.id === jobId);
    useEffect(() => {
        const t = setInterval(() => void j.refresh(), 3000);
        return () => clearInterval(t);
    }, []);
    async function run() {
        if (!job) {
            return;
        }
        setBusy(true);
        setError('');
        try {
            await api('imports.confirm', {
                job: job.id, confirm, resume: true
            });
            await j.refresh();
        }
        catch (e) {
            setError((e as Error).message);
            await j.refresh();
        }
        finally {
            setBusy(false);
        }
    }
    return <>
        <Errors message={j.error}/>
        <Card title="Step 3 of 3 - Confirm and process import">
            <TextField
                select
                fullWidth
                label="Import job"
                value={jobId}
                onChange={e => {
        setJobId(e.target.value);
        setConfirm(false);
    }}
            >
                {j.data.filter(x => !x.cancelled).map(x => <MenuItem key={x.id} value={x.id}>{x.created} | {x.id}</MenuItem>)}
            </TextField>
            <FormControlLabel control={<Checkbox checked={confirm} onChange={e => setConfirm(e.target.checked)}/>} label="I confirm the preview and row decisions"/>
            <Button
                variant="contained"
                disabled={!confirm || !job || busy}
                onClick={() => void run()}
            >
                {busy ? 'Confirming...' : 'Confirm / resume import'}
            </Button>
            {error && <Alert severity="error">
                {error}
            </Alert>}
        </Card>
        {job && <Card title="Durable row outcomes">
            <Table rows={job.rows} columns={['line', 'name', 'barcode', 'decision', 'status', 'outcome', 'attempts', 'message']}/>
            {job.rows.filter(r => r.status === 'Failed').map(r => <Button key={String(r.id)} onClick={async () => {
                    try {
                        await api('imports.refresh', { job: job.id, row: r.id });
                        await j.refresh();
                    }
                    catch (e) {
                        setError((e as Error).message);
                    }
                }}>Refresh conflict row {String(r.line)}</Button>)}
        </Card>}
    </>;
}
export const page: Page = {
    id: 'import-results', title: 'CSV import execution', roles: managers, component: Execute
};
