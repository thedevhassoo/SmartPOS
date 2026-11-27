-- SmartPOS relational schema. Monetary values are integer PKR minor units.
CREATE SCHEMA IF NOT EXISTS smartpos;
CREATE TABLE smartpos.transaction_lock (id integer PRIMARY KEY CHECK (id = 1));
INSERT INTO smartpos.transaction_lock (id) VALUES (1);

CREATE TABLE smartpos.users (
    "id" text primary key,
    "name" text not null,
    "username" text not null unique,
    "password" text not null,
    "role" text not null check ("role" in ('Owner','Manager','Cashier')),
    "active" boolean not null
);

CREATE TABLE smartpos.locations (
    "id" text primary key,
    "name" text not null
);

CREATE TABLE smartpos.products (
    "id" text primary key,
    "name" text not null,
    "barcode" text not null unique,
    "price" bigint not null check ("price" >= 0),
    "category" text not null,
    "location" text references smartpos.locations(id),
    "threshold" integer not null check ("threshold" >= 0),
    "created" timestamptz not null,
    "expiryWarningDays" integer CHECK ("expiryWarningDays" BETWEEN 0 AND 365)
);

CREATE TABLE smartpos.sessions (
    "id" text primary key,
    "user" text not null references smartpos.users(id),
    "expires" timestamptz not null
);

CREATE TABLE smartpos.batches (
    "id" text primary key,
    "product" text not null references smartpos.products(id),
    "quantity" integer not null check ("quantity" >= 0),
    "cost" bigint check ("cost" >= 0),
    "expiry" date,
    "received" timestamptz not null,
    "blocked" boolean not null
);

CREATE TABLE smartpos.offers (
    "id" text primary key,
    "name" text not null,
    "kind" text not null check ("kind" in ('percent','fixed')),
    "value" bigint not null check ("value" > 0),
    "start" timestamptz not null,
    "end" timestamptz not null,
    "cancelled" boolean not null,
    CHECK ("start" < "end"),
    CHECK ("kind" <> 'percent' OR "value" <= 10000),
    EXCLUDE USING gist (tstzrange("start", "end", '[)') WITH &&) WHERE (NOT "cancelled")
);

CREATE TABLE smartpos.drafts (
    "id" text primary key,
    "owner" text not null references smartpos.users(id),
    "saved" timestamptz not null,
    "completed" text
);

CREATE TABLE smartpos.draft_items (
    "id" text primary key,
    "parent" text not null references smartpos.drafts(id),
    "position" integer not null check ("position" >= 0),
    "product" text not null references smartpos.products(id),
    "quantity" integer not null check ("quantity" > 0),
    UNIQUE ("parent", "product")
);

CREATE TABLE smartpos.sales (
    "id" text primary key,
    "draft" text not null unique references smartpos.drafts(id),
    "owner" text not null references smartpos.users(id),
    "key" text not null unique,
    "fingerprint" text not null,
    "at" timestamptz not null,
    "subtotal" bigint not null check ("subtotal" >= 0),
    "discount" bigint not null check ("discount" >= 0),
    "total" bigint not null check ("total" >= 0),
    "offer" text references smartpos.offers(id),
    "offerSnapshot" jsonb,
    CHECK ("total" = "subtotal" - "discount")
);

CREATE TABLE smartpos.sale_lines (
    "id" text primary key,
    "parent" text not null references smartpos.sales(id),
    "position" integer not null,
    "product" text not null references smartpos.products(id),
    "quantity" integer not null check ("quantity" > 0),
    "name" text not null,
    "barcode" text not null,
    "price" bigint not null check ("price" >= 0),
    "subtotal" bigint not null,
    "discount" bigint not null,
    "total" bigint not null,
    UNIQUE ("parent", "product"),
    CHECK ("total" = "subtotal" - "discount")
);

CREATE TABLE smartpos.sale_allocations (
    "id" text primary key,
    "parent" text not null references smartpos.sale_lines(id),
    "position" integer not null,
    "batch" text not null references smartpos.batches(id),
    "quantity" integer not null check ("quantity" > 0),
    "cost" bigint check ("cost" >= 0),
    "expiry" date,
    UNIQUE ("parent", "position")
);

CREATE TABLE smartpos.refunds (
    "id" text primary key,
    "sale" text not null references smartpos.sales(id),
    "line" text not null references smartpos.products(id),
    "quantity" integer not null check ("quantity" > 0),
    "amount" bigint not null check ("amount" >= 0),
    "requestedAmount" bigint not null check ("requestedAmount" >= 0),
    "state" text not null check ("state" in ('Pending','Approved','Rejected','Refunded')),
    "requested" timestamptz not null,
    "by" text not null references smartpos.users(id),
    "confirmed" timestamptz,
    "reference" text not null,
    "issue" text not null,
    "inspection" text,
    "disposition" text check ("disposition" in ('Resellable','Non-resellable')),
    "restocked" integer not null check ("restocked" >= 0),
    "returnCost" bigint,
    "disposedAt" timestamptz,
    "reason" text,
    "unitRanges" jsonb,
    CHECK ("amount" <= "requestedAmount"),
    CHECK ("restocked" <= "quantity")
);

CREATE TABLE smartpos.imports (
    "id" text primary key,
    "owner" text not null references smartpos.users(id),
    "confirmed" boolean not null,
    "cancelled" boolean,
    "created" timestamptz not null
);

CREATE TABLE smartpos.import_rows (
    "id" text primary key,
    "parent" text not null references smartpos.imports(id),
    "position" integer not null,
    "line" integer not null,
    "name" text not null,
    "barcode" text not null,
    "price" bigint not null,
    "location" text not null,
    "error" text not null,
    "decision" text check ("decision" in ('Replace','Skip')),
    "existing" text,
    "fingerprint" text not null,
    "status" text not null check ("status" in ('Preview','Applied','Skipped','Failed')),
    "message" text not null,
    "locationFingerprint" text,
    "duplicateChoice" text CHECK ("duplicateChoice" IN ('Keep', 'Discard')),
    "attempts" integer CHECK ("attempts" >= 0),
    "outcome" text,
    UNIQUE ("parent", "position")
);

CREATE TABLE smartpos.audit (
    "id" text primary key,
    "actor" text not null references smartpos.users(id),
    "action" text not null,
    "at" timestamptz not null,
    "detail" jsonb not null,
    "archivedAt" timestamptz
);

CREATE UNIQUE INDEX locations_normalized_name ON smartpos.locations (lower(regexp_replace(trim(name), '[[:space:]-]+', ' ', 'g')));
CREATE INDEX products_name_idx ON smartpos.products (lower(name));
CREATE INDEX products_location_idx ON smartpos.products (location);
CREATE INDEX batches_product_expiry_idx ON smartpos.batches (product, expiry);
CREATE INDEX sessions_user_idx ON smartpos.sessions ("user");
CREATE INDEX sales_at_idx ON smartpos.sales ("at");
CREATE INDEX refunds_sale_line_idx ON smartpos.refunds (sale, line);
CREATE INDEX refunds_confirmed_idx ON smartpos.refunds (confirmed);
CREATE INDEX import_rows_status_idx ON smartpos.import_rows (parent, status);
CREATE INDEX audit_at_idx ON smartpos.audit ("at");
