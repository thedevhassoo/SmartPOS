import { cash } from '../../api';
// Optional feature contribution discovered when the scheduled-offer slice is integrated.
export function OfferPricingSummary({ offer, discount }: {
    offer: string | null;
    discount: number;
}) {
    return <>
        <div>
            <span>Authorized offer discount</span>
            <strong>
                {cash(discount)}
            </strong>
        </div>
        {offer && <p className="offer-notice">Server-authorized offer applied. Eligibility is rechecked at Push.</p>}
    </>;
}
