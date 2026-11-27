import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';
// Run against a disposable initialized database only.
test('owner registers stock and uses keyboard scanner simulation', async ({ page }) => {
    test.skip(!process.env.E2E_OWNER_PASSWORD, 'Set E2E_OWNER_PASSWORD for a disposable DB');
    await page.goto('/');
    await page.getByLabel('Username').fill(process.env.E2E_OWNER_USERNAME ?? 'owner');
    await page.getByLabel('Password', { exact: true }).fill(process.env.E2E_OWNER_PASSWORD!);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.getByRole('link', { name: 'Point of sale' }).waitFor();
    const barcode = '000' + randomUUID().replace(/-/g, '');
    const name = 'E2E-' + barcode.slice(-8);
    const make = await page.request.post('/api/products.save', { headers: { 'X-SmartPOS': '1' }, data: {
            name, barcode, price: '10', category: 'Testing'
        } });
    expect(make.ok()).toBeTruthy();
    const p = await make.json();
    const batch = await page.request.post('/api/stock.receive', { headers: { 'X-SmartPOS': '1' }, data: {
            product: p.id, quantity: 5, cost: '4'
        } });
    expect(batch.ok()).toBeTruthy();
    await page.getByRole('link', { name: 'Point of sale' }).click();
    await page.getByLabel('Barcode', { exact: true }).fill(barcode);
    await page.getByLabel('Barcode', { exact: true }).press('Enter');
    await expect(page.getByText(name, { exact: true }).first()).toBeVisible();
    await page.getByLabel('Barcode', { exact: true }).fill(barcode);
    await page.getByLabel('Barcode', { exact: true }).press('Enter');
    await expect(page.locator('.total-line strong')).toContainText('20.00');
    await page.getByRole('button', { name: 'Save Draft' }).click();
    await expect(page.getByText('Draft saved. Stock has not changed.')).toBeVisible();
    await page.getByLabel('External payment received and checked').check();
    await page.getByRole('button', { name: 'Push paid bill' }).click();
    await expect(page.getByText('Sale completed.')).toBeVisible();
});
