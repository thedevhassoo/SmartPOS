# Canonical feature files

Each slice includes its route registration, feature service, UI component and domain test.

| Slice | Server route and service (same basename) | Client | Test |
|---|---|---|---|
| S01 | `server/modules/identity/authentication.routes.ts`, `.service.ts` | `client/src/features/identity/LoginPage.tsx` | `server/tests/authentication.test.ts` |
| S02 | `server/modules/identity/staff-accounts.routes.ts`, `.service.ts` | `client/src/features/identity/StaffAccountsPage.tsx` | `server/tests/staff-accounts.test.ts` |
| S03 | `server/modules/catalog/product-catalog.routes.ts`, `.service.ts` | `client/src/features/catalog/ProductCatalogPage.tsx` | `server/tests/product-catalog.test.ts` |
| S04 | `server/modules/inventory/inventory-batches.routes.ts`, `.service.ts` | `client/src/features/inventory/InventoryBatchesPage.tsx` | `server/tests/inventory-batches.test.ts` |
| S05 | `server/modules/locations/storage-locations.routes.ts`, `.service.ts` | `client/src/features/locations/StorageLocationsPage.tsx` | `server/tests/storage-locations.test.ts` |
| S06 | `server/modules/locations/location-management.routes.ts`, `.service.ts` | `client/src/features/locations/LocationManagementPage.tsx` | `server/tests/location-management.test.ts` |
| S07 | `server/modules/csv-import/csv-import-preview.routes.ts`, `.service.ts` | `client/src/features/csv-import/CsvImportPreviewPage.tsx` | `server/tests/csv-import-preview.test.ts` |
| S08 | `server/modules/csv-import/csv-import-decisions.routes.ts`, `.service.ts` | `client/src/features/csv-import/CsvImportDecisionsPage.tsx` | `server/tests/csv-import-decisions.test.ts` |
| S09 | `server/modules/billing/draft-billing.routes.ts`, `.service.ts` | `client/src/features/billing/PointOfSalePage.tsx` | `server/tests/draft-billing.test.ts` |
| S10 | `server/modules/inventory/stock-reconciliation.routes.ts`, `.service.ts` | `client/src/features/inventory/StockReconciliationPage.tsx` | `server/tests/stock-reconciliation.test.ts` |
| S11 | `server/modules/offers/scheduled-offers.routes.ts`, `.service.ts` | `client/src/features/offers/ScheduledOffersPage.tsx` | `server/tests/scheduled-offers.test.ts` |
| S12 | `server/modules/offers/offer-pricing.routes.ts`, `.service.ts` | `client/src/features/offers/OfferPricingSummary.tsx` | `server/tests/offer-pricing.test.ts` |
| S13 | `server/modules/billing/sale-completion.routes.ts`, `.service.ts` | `client/src/features/billing/ReceiptsHistoryPage.tsx` | `server/tests/sale-completion.test.ts` |
| S14 | `server/modules/csv-import/csv-import-execution.routes.ts`, `.service.ts` | `client/src/features/csv-import/CsvImportExecutionPage.tsx` | `server/tests/csv-import-execution.test.ts` |
| S15 | `server/modules/refunds/refund-requests.routes.ts`, `.service.ts` | `client/src/features/refunds/RefundRequestsPage.tsx` | `server/tests/refund-requests.test.ts` |
| S16 | `server/modules/reporting/sales-reporting.routes.ts`, `.service.ts` | `client/src/features/reporting/SalesDashboardPage.tsx` | `server/tests/sales-reporting.test.ts` |
| S17 | `server/modules/refunds/refund-management.routes.ts`, `.service.ts` | `client/src/features/refunds/RefundManagementPage.tsx` | `server/tests/refund-management.test.ts` |
| S18 | `server/modules/refunds/return-inspection.routes.ts`, `.service.ts` | `client/src/features/refunds/ReturnInspectionPage.tsx` | `server/tests/return-inspection.test.ts` |
| S19 | `server/modules/reporting/stock-alerts.routes.ts`, `.service.ts` | `client/src/features/reporting/StockAlertsPage.tsx` | `server/tests/stock-alerts.test.ts` |
| S20 | `server/modules/insights/ai-recommendations.routes.ts`, `.service.ts` | `client/src/features/insights/AiRecommendationsPage.tsx` | `server/tests/ai-recommendations.test.ts` |
