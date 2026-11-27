import { useState } from 'react';
import { Button, Alert } from '@mui/material';
import { api } from '../../api';
import { Card, Errors, useLoad, managers, type Page, type Row } from '../../ui';
function Insights() {
    const s = useLoad<Row[]>('ai.recommendations', []);
    const [message, setMessage] = useState('');
    return <>
        <Errors message={s.error}/>
        <Card title="Local explained recommendations">
            <p className="muted">Advisory statistical forecast. No automated ordering or inventory changes. Review recommendations before accepting a threshold.</p>
            <Button onClick={() => void s.refresh()}>Refresh insights</Button>
            {message && <Alert severity="info">
                {message}
            </Alert>}
        </Card>
        {s.data.map(r => <Card title={String(r.name)} key={String(r.product)}>
            <p>
                {String(r.reason)}
            </p>
            <p className="muted">{String(r.start)} to {String(r.end)} | Net units: {String(r.units)} | Daily velocity: {Number(r.velocity).toFixed(2)} | Available: {String(r.stock)}</p>
            <p>Suggested threshold: {r.suggestion === null ? 'Insufficient Data' : String(r.suggestion)}</p>
            <p>
                {String(r.attention)}
            </p>
            <p className="muted">
                {String(r.uncertainty)}
            </p>
            {r.suggestion !== null && <Button variant="contained" onClick={async () => {
                    if (!window.confirm('Apply this suggested threshold?')) {
                        return;
                    }
                    try {
                        await api('ai.accept', {
                            product: r.product, threshold: r.suggestion, confirm: true
                        });
                        setMessage('Threshold updated.');
                        await s.refresh();
                    }
                    catch (e) {
                        setMessage((e as Error).message);
                    }
                }}>Accept threshold</Button>}
        </Card>)}
    </>;
}
export const page: Page = {
    id: 'insights', title: 'AI insights', roles: managers, component: Insights
};
