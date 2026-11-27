import { Store } from 'lucide-react';
export function Brand({ compact = false }: {
    compact?: boolean;
}) {
    return <div className="brand">
        <div className="brand-mark">
            <Store size={23} strokeWidth={2.2}/>
        </div>
        {!compact && <div>
            <b>Smart<span>POS</span></b>
            <small>Retail workspace</small>
        </div>}
    </div>;
}
