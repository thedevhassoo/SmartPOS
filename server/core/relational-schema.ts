// Static persistence metadata. SQL identifiers originate only from this file.
export const schema = {
    "users": {
        "id": "text",
        "name": "text",
        "username": "text",
        "password": "text",
        "role": "text",
        "active": "boolean"
    },
    "locations": {
        "id": "text",
        "name": "text"
    },
    "products": {
        "id": "text",
        "name": "text",
        "barcode": "text",
        "price": "number",
        "category": "text",
        "location": "text",
        "threshold": "number",
        "created": "timestamp",
        "expiryWarningDays": "number"
    },
    "sessions": {
        "id": "text",
        "user": "text",
        "expires": "timestamp"
    },
    "batches": {
        "id": "text",
        "product": "text",
        "quantity": "number",
        "cost": "number",
        "expiry": "date",
        "received": "timestamp",
        "blocked": "boolean"
    },
    "offers": {
        "id": "text",
        "name": "text",
        "kind": "text",
        "value": "number",
        "start": "timestamp",
        "end": "timestamp",
        "cancelled": "boolean"
    },
    "drafts": {
        "id": "text",
        "owner": "text",
        "saved": "timestamp",
        "completed": "text"
    },
    "draft_items": {
        "id": "text",
        "parent": "text",
        "position": "number",
        "product": "text",
        "quantity": "number"
    },
    "sales": {
        "id": "text",
        "draft": "text",
        "owner": "text",
        "key": "text",
        "fingerprint": "text",
        "at": "timestamp",
        "subtotal": "number",
        "discount": "number",
        "total": "number",
        "offer": "text",
        "offerSnapshot": "json"
    },
    "sale_lines": {
        "id": "text",
        "parent": "text",
        "position": "number",
        "product": "text",
        "quantity": "number",
        "name": "text",
        "barcode": "text",
        "price": "number",
        "subtotal": "number",
        "discount": "number",
        "total": "number"
    },
    "sale_allocations": {
        "id": "text",
        "parent": "text",
        "position": "number",
        "batch": "text",
        "quantity": "number",
        "cost": "number",
        "expiry": "date"
    },
    "refunds": {
        "id": "text",
        "sale": "text",
        "line": "text",
        "quantity": "number",
        "amount": "number",
        "requestedAmount": "number",
        "state": "text",
        "requested": "timestamp",
        "by": "text",
        "confirmed": "timestamp",
        "reference": "text",
        "issue": "text",
        "inspection": "text",
        "disposition": "text",
        "restocked": "number",
        "returnCost": "number",
        "disposedAt": "timestamp",
        "reason": "text",
        "unitRanges": "json"
    },
    "imports": {
        "id": "text",
        "owner": "text",
        "confirmed": "boolean",
        "cancelled": "boolean",
        "created": "timestamp"
    },
    "import_rows": {
        "id": "text",
        "parent": "text",
        "position": "number",
        "line": "number",
        "name": "text",
        "barcode": "text",
        "price": "number",
        "location": "text",
        "error": "text",
        "decision": "text",
        "existing": "text",
        "fingerprint": "text",
        "status": "text",
        "message": "text",
        "locationFingerprint": "text",
        "duplicateChoice": "text",
        "attempts": "number",
        "outcome": "text"
    },
    "audit": {
        "id": "text",
        "actor": "text",
        "action": "text",
        "at": "timestamp",
        "detail": "json",
        "archivedAt": "timestamp"
    }
} as const;
export type TableName = keyof typeof schema;
export const tableOrder = Object.keys(schema) as TableName[];
