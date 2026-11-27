import { Banknote, Receipt, RotateCcw, ChartNoAxesCombined, Package } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button, TextField, Alert } from '@mui/material';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { api, cash } from '../../api';
import { Card, Table, managers, type Page, type Row } from '../../ui';
type Report = {
    from: string;
    to: string;
    gross: number;
    count: number;
    refunded: number;
    net: number;
    units: number;
    chart: {
        date: string;
        gross: number;
    }[];
    products: Row[];
};
const pkDay = (d: Date) => new Date(d.getTime() + 5 * 3600000).toISOString().slice(0, 10);
function Dashboard() {
    const [report, setReport] = useState<Report | null>(null), [from, setFrom] = useState(pkDay(new Date(Date.now() - 29 * 86400000))), [to, setTo] = useState(pkDay(new Date())), [error, setError] = useState('');
    async function load(f = from, t = to) {
        try {
            setReport(await api<Report>('reports.summary', { from: f, to: t }));
            setError('');
        }
        catch (e) {
            setError((e as Error).message);
        }
    }
    useEffect(() => {
        void load();
    }, []);
    function preset(days: number) {
        const f = pkDay(new Date(Date.now() - (days - 1) * 86400000)), t = pkDay(new Date());
        setFrom(f);
        setTo(t);
        void load(f, t);
    }
    return <>
        <Card title="Reporting period (PKT)">
            <div className="row">
                <Button onClick={() => preset(1)}>Today</Button>
                <Button onClick={() => preset(7)}>7 days</Button>
                <Button onClick={() => preset(30)}>30 days</Button>
                <Button onClick={() => {
        const t = pkDay(new Date()), f = t.slice(0, 7) + '-01';
        setFrom(f);
        setTo(t);
        void load(f, t);
    }}>This month</Button>
                <TextField
                    type="date"
                    label="From"
                    value={from}
                    onChange={e => setFrom(e.target.value)}
                    size="small"
                    slotProps={{ inputLabel: { shrink: true } }}
                />
                <TextField
                    type="date"
                    label="To"
                    value={to}
                    onChange={e => setTo(e.target.value)}
                    size="small"
                    slotProps={{ inputLabel: { shrink: true } }}
                />
                <Button variant="contained" onClick={() => void load()}>Apply</Button>
            </div>
            {error && <Alert severity="error">
                {error}
            </Alert>}
        </Card>
        {report && <>
            <div className="kpis">
                {[
                {
                    label: 'Gross recorded sales', value: cash(report.gross), Icon: Banknote
                },
                {
                    label: 'Completed sales', value: report.count, Icon: Receipt
                },
                {
                    label: 'Completed refunds', value: cash(report.refunded), Icon: RotateCcw
                },
                {
                    label: 'Net recorded sales', value: cash(report.net), Icon: ChartNoAxesCombined
                },
                {
                    label: 'Units sold', value: report.units, Icon: Package
                }
            ].map(({ label, value, Icon }) => <div className="kpi" key={label}>
                    <div className="kpi-icon">
                        <Icon size={21}/>
                    </div>
                    <span className="muted">
                        {label}
                    </span>
                    <strong>
                        {value}
                    </strong>
                </div>)}
            </div>
            <Card title="Gross recorded sales by day">
                <p className="muted">Actual completed sales in PKR. Draft bills and pending refunds are excluded.</p>
                <div style={{ height: 280 }}>
                    <ResponsiveContainer>
                        <BarChart data={report.chart.map(x => ({ ...x, gross: x.gross / 100 }))}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                            <XAxis dataKey="date"/>
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="gross" fill="#FE9F43" radius={[4, 4, 0, 0]}/>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>
            <Card title="Product performance (recorded gross profit)">
                <Table rows={report.products} columns={['name', 'category', 'units', 'refundedUnits', 'revenue', 'cost', 'profit', 'margin', 'velocity', 'sufficient', 'demand', 'trend']}/>
            </Card>
        </>}
    </>;
}
export const page: Page = {
    id: 'dashboard', title: 'Sales dashboard', roles: managers, component: Dashboard
};
