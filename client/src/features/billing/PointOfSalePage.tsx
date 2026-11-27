import { useEffect, useRef, useState, type ComponentType } from 'react';
import { Alert, Button, Checkbox, Chip, CircularProgress, FormControlLabel, IconButton, InputAdornment, TextField } from '@mui/material';
import { Barcode, CheckCircle2, Minus, Plus, Search, ShoppingCart, Trash2 } from 'lucide-react';
import { api, cash } from '../../api';
import { Card, Table, all, useLoad, type Page, type Row } from '../../ui';
type Product = {
    id: string;
    name: string;
    barcode: string;
    price: number;
    available: number;
    location: string;
};
type Entry = {
    product: string;
    quantity: number;
};
type Quote = {
    lines: Row[];
    subtotal: number;
    discount: number;
    total: number;
    offer: string | null;
};
type Draft = {
    id: string;
    items: Entry[];
    saved: string;
};
type OfferSummaryProps = {
    offer: string | null;
    discount: number;
};
const installedModules = import.meta.glob('./*.tsx');
const hasPush = Object.keys(installedModules).some(path => path.endsWith('/ReceiptsHistoryPage.tsx'));
const summaries = import.meta.glob<{
    OfferPricingSummary?: ComponentType<OfferSummaryProps>;
}>('../offers/*.tsx', { eager: true });
const OfferSummary = Object.values(summaries).find(module => module.OfferPricingSummary)?.OfferPricingSummary;
function Checkout() {
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [found, setFound] = useState<Product[]>([]);
    const [catalog, setCatalog] = useState<Record<string, Product>>({});
    const [entries, setEntries] = useState<Entry[]>([]);
    const [quote, setQuote] = useState<Quote | null>(null);
    const [draft, setDraft] = useState('');
    const [savedSignature, setSavedSignature] = useState('');
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [paid, setPaid] = useState('');
    const [checked, setChecked] = useState(false);
    const [receipt, setReceipt] = useState<Row | null>(null);
    const [busy, setBusy] = useState(false);
    const [quoting, setQuoting] = useState(false);
    const [scanning, setScanning] = useState(0);
    const drafts = useLoad<Draft[]>('drafts.list', []);
    const input = useRef<HTMLInputElement>(null);
    const queue = useRef(Promise.resolve());
    const request = useRef(0);
    const locked = useRef(false);
    const barcodeBuffer = useRef('');
    const signature = JSON.stringify(entries);
    const saved = !!draft && signature === savedSignature;
    function add(product: Product) {
        setCatalog(old => ({ ...old, [product.id]: product }));
        setEntries(old => old.some(x => x.product === product.id) ? old.map(x => x.product === product.id ? { ...x, quantity: x.quantity + 1 } : x) : [...old, { product: product.id, quantity: 1 }]);
        setNotice(`${product.name} added`);
    }
    useEffect(() => {
        const current = ++request.current;
        setChecked(false);
        setQuote(null);
        if (!entries.length) {
            setQuoting(false);
            setPaid('');
            return;
        }
        setQuoting(true);
        api<Quote>('drafts.quote', { items: entries }).then(result => {
            if (request.current === current) {
                setQuote(result);
                setPaid((result.total / 100).toFixed(2));
            }
        }).catch(e => {
            if (request.current === current) {
                setError((e as Error).message);
            }
        }).finally(() => {
            if (request.current === current) {
                setQuoting(false);
            }
        });
    }, [entries]);
    function scan() {
        const value = barcodeBuffer.current.trim();
        if (!value || locked.current) {
            return;
        }
        // Clear synchronously, preventing duplicate handling of the same terminator.
        barcodeBuffer.current = '';
        setCode('');
        setScanning(old => old + 1);
        queue.current = queue.current.then(async () => {
            try {
                setError('');
                const result = await api<Product[]>('products.lookup', { barcode: value });
                if (!result.length) {
                    setError(`Unknown barcode ${value}. Search by product name.`);
                    return;
                }
                add(result[0]);
            }
            catch (e) {
                setError((e as Error).message);
            }
            finally {
                setScanning(old => old - 1);
            }
        });
        input.current?.focus();
    }
    async function save() {
        if (locked.current || scanning || quoting || !quote) {
            return;
        }
        locked.current = true;
        setBusy(true);
        setError('');
        try {
            const result = await api<{
                draft: Draft;
                quote: Quote;
            }>('drafts.save', { id: draft || undefined, items: entries });
            setDraft(result.draft.id);
            setSavedSignature(signature);
            setQuote(result.quote);
            setPaid((result.quote.total / 100).toFixed(2));
            setChecked(false);
            setNotice('Draft saved. Stock has not changed.');
            await drafts.refresh();
        }
        catch (e) {
            setError((e as Error).message);
        }
        finally {
            locked.current = false;
            setBusy(false);
        }
    }
    async function push() {
        if (locked.current || scanning || quoting || !saved || !checked || !quote) {
            return;
        }
        locked.current = true;
        setBusy(true);
        setError('');
        try {
            // Draft ID is a stable logical Push key; retries must carry the same payload.
            const result = await api<Row>('sales.push', {
                draft, key: draft, paid, paymentChecked: checked
            });
            setDraft('');
            setSavedSignature('');
            setEntries([]);
            setQuote(null);
            setReceipt(result);
            setNotice('Sale completed.');
            setChecked(false);
            await drafts.refresh();
        }
        catch (e) {
            setError((e as Error).message + ' If the outcome is uncertain, retry with the same saved bill and payment amount. Do not collect payment again.');
        }
        finally {
            locked.current = false;
            setBusy(false);
        }
    }
    function newDraft() {
        if (entries.length && !saved && !window.confirm('Discard unsaved changes?')) {
            return;
        }
        setDraft('');
        setSavedSignature('');
        setEntries([]);
        setReceipt(null);
        setError('');
        setNotice('');
        setChecked(false);
        input.current?.focus();
    }
    return <>
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
        </Alert>}
        {notice && <Alert
            severity={notice === 'Sale completed.' ? 'success' : 'info'}
            sx={{ mb: 2 }}
            onClose={() => setNotice('')}
        >
            {notice}
        </Alert>}
        <div className="checkout">
            <div>
                <Card title="Find products">
                    <div className="scan-hint">
                        <Barcode size={20}/>
                        <div>
                            <strong>USB barcode scanner ready</strong>
                            <small>Scan into the barcode field or enter the code manually, then press Enter.</small>
                        </div>
                    </div>
                    <form className="row" onSubmit={e => {
        e.preventDefault();
        scan();
    }}>
                        <TextField
                            inputRef={input}
                            autoFocus
                            label="Barcode"
                            value={code}
                            disabled={busy}
                            onChange={e => {
        barcodeBuffer.current = e.target.value;
        setCode(e.target.value);
    }}
                            size="small"
                            sx={{ flex: 1 }}
                            slotProps={{ input: { startAdornment: <InputAdornment position="start">
                                <Barcode size={18}/>
                            </InputAdornment> } }}
                        />
                        <Button variant="contained" type="submit" disabled={busy || !code}>Add barcode</Button>
                    </form>
                    <form
                        className="row"
                        style={{ marginTop: 12 }}
                        onSubmit={async (e) => {
            e.preventDefault();
            try {
                const results = await api<Product[]>('products.lookup', { name });
                setFound(results);
                setError(results.length ? '' : 'No matching products found.');
            }
            catch (e) {
                setError((e as Error).message);
            }
        }}
                    >
                        <TextField
                            label="Product name"
                            size="small"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            sx={{ flex: 1 }}
                            slotProps={{ input: { startAdornment: <InputAdornment position="start">
                                <Search size={17}/>
                            </InputAdornment> } }}
                        />
                        <Button variant="outlined" type="submit" disabled={busy || !name.trim()}>Search</Button>
                    </form>
                    {found.map(product => <div className="product-result" key={product.id}>
                        <div className="product-avatar">
                            <ShoppingCart size={18}/>
                        </div>
                        <div className="product-result-main">
                            <strong>
                                {product.name}
                            </strong>
                            <small>{product.barcode} | {product.location} | {product.available} available</small>
                        </div>
                        <strong>
                            {cash(product.price)}
                        </strong>
                        <Button size="small" disabled={busy} onClick={() => add(product)}>Add</Button>
                    </div>)}
                </Card>
                <Card title="Saved drafts">
                    <Table
                        rows={drafts.data.map(d => ({
        id: d.id, saved: d.saved, items: d.items.length
    }))}
                        columns={['id', 'saved', 'items']}
                        onSelect={row => {
            if (busy || scanning) {
                return;
            }
            if (entries.length && !saved && !window.confirm('Discard unsaved changes?')) {
                return;
            }
            const current = drafts.data.find(d => d.id === row.id);
            if (current) {
                setDraft(current.id);
                setEntries(current.items);
                setSavedSignature(JSON.stringify(current.items));
                setReceipt(null);
            }
        }}
                    />
                </Card>
                {receipt && <Card title="Completed receipt">
                    <div className="receipt-content">
                        <p><CheckCircle2 size={17}/> Sale completed</p>
                        <small>Receipt {String(receipt.id)}</small>
                        <Table rows={(receipt.lines as Row[]) ?? []} columns={['name', 'quantity', 'price', 'total']}/>
                        <h2>
                            {cash(Number(receipt.total))}
                        </h2>
                    </div>
                    <Button variant="outlined" onClick={() => window.print()}>Print receipt</Button>
                </Card>}
            </div>
            <div>
                <Card title="Current bill">
                    <div className="bill-heading">
                        <Chip
                            size="small"
                            label={saved ? 'Saved draft' : 'Draft / not saved'}
                            color={saved ? 'success' : 'default'}
                            variant="outlined"
                        />
                        <span className="muted">{entries.reduce((sum, x) => sum + x.quantity, 0)} units</span>
                    </div>
                    {!entries.length && <div className="table-empty">
                        <ShoppingCart size={32} strokeWidth={1.5}/>
                        <strong>Start a new bill</strong>
                        <span>Scan a product or search by name.</span>
                    </div>}
                    {entries.map(entry => {
            const line = quote?.lines.find(item => item.product === entry.product);
            const product = catalog[entry.product];
            return <div className="bill-line" key={entry.product}>
                        <div className="bill-line-label">
                            <strong>
                                {String(line?.name ?? product?.name ?? 'Loading item')}
                            </strong>
                            <small>
                                {line ? cash(Number(line.price)) : product ? cash(product.price) : 'Calculating'}
                            </small>
                        </div>
                        <div className="quantity-controls">
                            <IconButton
                                size="small"
                                aria-label="Decrease quantity"
                                disabled={busy || entry.quantity <= 1}
                                onClick={() => setEntries(old => old.map(x => x.product === entry.product ? { ...x, quantity: x.quantity - 1 } : x))}
                            >
                                <Minus size={15}/>
                            </IconButton>
                            <span>
                                {entry.quantity}
                            </span>
                            <IconButton
                                size="small"
                                aria-label="Increase quantity"
                                disabled={busy}
                                onClick={() => setEntries(old => old.map(x => x.product === entry.product ? { ...x, quantity: x.quantity + 1 } : x))}
                            >
                                <Plus size={15}/>
                            </IconButton>
                        </div>
                        <strong>
                            {line ? cash(Number(line.subtotal)) : '-'}
                        </strong>
                        <IconButton
                            aria-label="Remove item"
                            size="small"
                            color="error"
                            disabled={busy}
                            onClick={() => setEntries(old => old.filter(x => x.product !== entry.product))}
                        >
                            <Trash2 size={16}/>
                        </IconButton>
                    </div>;
        })}
                    <div className="bill-total">
                        <div>
                            <span>Subtotal</span>
                            <strong>
                                {quote ? cash(quote.subtotal) : cash(0)}
                            </strong>
                        </div>
                        {OfferSummary && quote ? <OfferSummary offer={quote.offer} discount={quote.discount}/> : <div>
                            <span>Offer discount</span>
                            <strong>
                                {quote ? cash(quote.discount) : cash(0)}
                            </strong>
                        </div>}
                        <div className="total-line">
                            <span>Total</span>
                            <strong>
                                {quoting ? 'Calculating...' : cash(quote?.total ?? 0)}
                            </strong>
                        </div>
                    </div>
                    <div className="row">
                        <Button variant="outlined" disabled={busy || scanning > 0} onClick={newDraft}>New draft</Button>
                        <Button
                            variant="contained"
                            sx={{ flex: 1 }}
                            disabled={busy || scanning > 0 || quoting || !quote}
                            onClick={() => void save()}
                        >Save Draft</Button>
                    </div>
                    {scanning > 0 && <p className="muted">Processing {scanning} scan(s)...</p>}
                </Card>
                {hasPush && <Card title="External payment verification">
                    <p className="muted">Collect and check payment outside SmartPOS. Saving does not change stock.</p>
                    <TextField
                        fullWidth
                        label="Externally paid (PKR)"
                        value={paid}
                        disabled={busy || !saved}
                        onChange={e => {
            setPaid(e.target.value);
            setChecked(false);
        }}
                        size="small"
                    />
                    <FormControlLabel control={<Checkbox
                            checked={checked}
                            disabled={!saved || busy}
                            onChange={e => setChecked(e.target.checked)}
                        />} label="External payment received and checked"/>
                    <Button
                        fullWidth
                        variant="contained"
                        disabled={busy || scanning > 0 || quoting || !saved || !checked || !quote}
                        onClick={() => void push()}
                    >
                        {busy ? <CircularProgress size={19} color="inherit"/> : 'Push paid bill'}
                    </Button>
                </Card>}
            </div>
        </div>
    </>;
}
export const page: Page = {
    id: 'pos', title: 'Point of sale', roles: all, component: Checkout
};
