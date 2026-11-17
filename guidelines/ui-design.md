# SmartPOS — UI design brief (proposed for approval)
Reference: https://dreamspos.dreamstechnologies.com/retail-pos/html/index.html
Use the reference's retail admin layout, orange accent, clean white cards, neutral backgrounds, compact sidebar, charts and tables as visual inspiration. Create original React components; do not copy proprietary HTML/CSS, logos, photos or paid assets. The reference page's content was inspected but its stylesheet could not be retrieved here; confirm the exact default light theme via browser DevTools computed styles if accessible. These are proposed starter tokens, not verified extracted CSS:

| Token | Hex | Use |
|---|---|---|
| Accent | #FE9F43 | Orange emphasis, active states, chart series |
| Accent strong | #C65D10 | Accessible link/text and emphasis |
| Heading | #092C4C | Dark navy headings and primary text |
| Body text | #344054 | Body |
| Muted | #667085 | Secondary labels |
| Background | #F8F9FA | Workspace |
| Surface | #FFFFFF | Cards/sidebar/header |
| Border | #E6E9EE | Dividers and outlines |
| Success | #28A745 | Positive status (use darker text for contrast) |
| Warning | #F59E0B | Low stock/expiry soon |
| Error | #DC2626 | Destructive/expired/error |
| Info | #0EA5E9 | Secondary charts/information |

Use dark text on light orange if required for WCAG AA; no color-only state indication. Font: local/system sans or locally bundled licensed Inter; 14px body, 12–13px labels, 24–28px page headings, 26–32px KPI. 8px spacing scale; 8–12px radius; light borders, very subtle shadows; no gradients, decorative glassmorphism, oversized headings or gratuitous motion. Use a shared MUI theme and Tailwind token mapping; MUI for forms/dialogs/data widgets, Tailwind for layout. Use Lucide consistently (18–20px); Framer Motion only restrained 120–200ms transitions and respect reduced motion. No internet/CDN needed at runtime. Keyboard and visible focus, accessible forms, readable contrast. Desktop-first at 1366×768 and 1920×1080, usable tablet; responsive tables and navigation.

## Application shell
Fixed/collapsible white sidebar ~240–256px with original SmartPOS wordmark; header ~60–64px with breadcrumb/page title, authorized search/shortcuts, alerts when supported, role/name and logout. Main area light gray, 24px gutters. Navigation grouped by Overview, POS, Inventory (Products, Batches, Locations, CSV Import, Stock Adjustments), Sales (Draft Bills, Completed Sales, Offers, Refunds/Returns), Reports/AI Insights and Staff. Render only approved role-accessible and implemented routes. Cashier defaults to POS; no analytics, owner-only staff management or protected API access. Do not create decorative nonfunctional menu items.

## Dashboard (S16, later S17–S20)
Owner/Manager: welcome/title, date range selector (approved periods only), quick links to POS/stock where allowed. Candidate layout only, subject to approved PRD metrics: up to four KPI cards (recorded sales amount, completed sale count, units sold, approved net-sales/refund or stock metric). Only use a metric if approved as part of FR-08/09/07. Sales trend, top-selling products, recent Completed Sales table and profitability/Insufficient Data may be displayed only if supported by the PRD and approved interpretation. Omit unapproved widgets entirely. Add low-stock/expiry panel in S19 and explained recommendation cards in S20; refund-aware figures in S17/S18 after approved formula. Use orange as primary series, muted navy/teal as secondary. Never use sample template's figures, invent growth, include Draft Bills in completed sales, add unrelated supplier/customer/payroll modules, or display false zero when metric is unavailable. No-sales period shows zero recorded sales. Charts must have labels/tooltips, date-range consistency and readable empty/error/loading states. Currency PKR subject to approved monetary policy. No dummy chart data in production. 

## POS screen (S03 lookup, S09 Draft Bill, S12 offers, S13 Push)
Optimized full-width desktop workspace, product search/scanner input with barcode icon, name fallback, search result/list with barcode/name/price/available stock and location only where implemented. Two-column layout (~60/40): product selection left; sticky Draft Bill right with line item, qty +/- or edit, unit price, remove, subtotal, authorized discount and total. Explicit Save Draft; later Push only after external payment checked (no online payment integration). Use orange primary action, clear secondary action, concise errors. After scan focus returns to designated input when safe; do not steal focus from forms/dialogs/quantity editors. Screen states: unknown barcode, out-of-stock, server/network error, empty bill, saving, successful receipt. Do not auto-create unknown products or auto-Push. Product images optional, no dependency on external images.

## Other pages
Login: centered clean form, logo, email/username according to PRD, password visibility, inline errors. Catalog/locations/batches/staff: title + search/filter + authorized Add action, compact data table, validated drawer/dialog/forms and confirm destructive actions. CSV: stepper Upload → Preview → Replace/Skip → Confirm → Results (only implemented steps enabled), row-level errors and retry summary. Offers: table with upcoming/active/ended status calculated from approved interval; clear date/time and overlap feedback. Refunds/returns: searchable completed sale, eligible line selection, reasons, decision history and disposition; status badges with text; no simulated payment. Alerts: priority/status, recorded vs available stock/expiry, action links as permitted. AI: concise recommendation, evidence, limitation/insufficient data and advisory label; never auto-purchase. Use shared PageHeader, DataTable, StatusChip, ConfirmDialog, EmptyState, ErrorState, LoadingState and currency/date formatting. Each slice owns its UI/API/data/tests, shared shell changes must be coordinated.
