// Live, read-only storefront smoke test. Never submits an order or charges a card.
// Execute with: node scripts/smoke-cart-coupon.mjs (Playwright required).
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const baseURL = (process.env.SITE_URL || 'https://www.vialfoundry.com').replace(/\/$/, '');
await mkdir('qa-artifacts', { recursive: true });

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
try {
  for (const device of [
    { name: 'mobile', width: 390, height: 844 },
    { name: 'desktop', width: 1440, height: 900 },
  ]) {
    const context = await browser.newContext({
      viewport: { width: device.width, height: device.height },
      reducedMotion: 'reduce',
      storageState: { cookies: [], origins: [] },
    });
    const page = await context.newPage();
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));

    try {
      await page.goto(baseURL + '/catalog', { waitUntil: 'domcontentloaded', timeout: 40000 });
      // Exercise the real research-use acknowledgment; do not bypass the gate.
      const researchGate = page.getByRole('dialog', { name: /Research Use Only/i });
      // This gate starts hidden until client hydration; count() immediately after
      // DOMContentLoaded races the first effect. Wait for the real dialog.
      await researchGate.waitFor({ state: 'visible', timeout: 12000 });
      const acknowledgements = researchGate.getByRole('checkbox');
      assert.equal(await acknowledgements.count(), 3, 'Expected three RUO acknowledgments');
      for (let index = 0; index < 3; index++) await acknowledgements.nth(index).check();
      await researchGate.getByRole('button', { name: 'Enter Site' }).click();
      await researchGate.waitFor({ state: 'hidden', timeout: 10000 });
      await page.locator('#catalog-search').waitFor({ timeout: 20000 });
      await page.locator('#catalog-search').fill('AOD-9604');

      const directAdd = page.getByRole('button', { name: /add .*to cart/i }).first();
      if (await directAdd.count()) {
        await directAdd.click();
      } else {
        const options = page.getByRole('button', { name: /view size options/i }).first();
        assert.ok(await options.count(), 'No add-to-cart or view-options action for AOD-9604');
        await options.click();
        const productAdd = page.getByRole('button', { name: /add to cart/i }).first();
        await productAdd.waitFor({ timeout: 12000 });
        await productAdd.click();
      }

      const cartHeading = page.getByRole('heading', { name: /Your Order \(1\)/i });
      await cartHeading.waitFor({ timeout: 10000 });

      // The reported defect was a cart/coupon flicker and spontaneous empty cart.
      // Keep checking it while the prior subtotal-dependent hydration loop would run.
      const promoField = page.getByPlaceholder('Promo or partner code');
      if (await promoField.count()) {
        await promoField.fill('WELCOME10');
        await page.getByRole('button', { name: 'Apply', exact: true }).last().click();
      }
      await page.getByText('WELCOME10', { exact: true }).first().waitFor({ timeout: 15000 });

      for (let n = 0; n < 12; n++) {
        assert.equal(await cartHeading.count(), 1, device.name + ': cart item disappeared during promo apply');
        await page.waitForTimeout(200);
      }

      await page.getByRole('button', { name: /Proceed to Checkout/i }).click();
      await page.waitForURL(/\/checkout/, { timeout: 15000 });
      await page.getByRole('heading', { name: 'Order Summary' }).waitFor({ timeout: 10000 });
      assert.match(await page.locator('body').innerText(), /WELCOME10/i, 'Coupon did not survive checkout transition');

      // Confirm first-order status using a never-before-used QA identity.
      // This validates eligibility only; no order is placed.
      const email = page.locator('input[type="email"]').first();
      await email.fill('vialfoundry-browser-qa-' + device.name + '@example.invalid');
      await email.press('Tab');
      await page.getByText('First-order eligibility confirmed.', { exact: true }).waitFor({ timeout: 12000 });
      assert.match(await page.locator('body').innerText(), /WELCOME10/i);
      assert.equal(pageErrors.length, 0, 'JavaScript errors: ' + pageErrors.join(' | '));

      // Hydration on navigation/reload must not erase the saved cart or coupon.
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.getByRole('heading', { name: 'Order Summary' }).waitFor({ timeout: 12000 });
      assert.match(await page.locator('body').innerText(), /WELCOME10/i, 'Coupon lost after reload');
      assert.match(await page.locator('body').innerText(), /AOD-9604/i, 'Product lost after reload');

      console.log('PASS ' + device.name + ': cart stable, promo applied, checkout verified, reload retains order');
      await page.screenshot({ path: 'qa-artifacts/' + device.name + '-checkout.png', fullPage: true });
    } catch (error) {
      await page.screenshot({ path: 'qa-artifacts/' + device.name + '-failure.png', fullPage: true }).catch(() => {});
      throw new Error(device.name + ' live checkout smoke failure: ' + error.message + '; page errors: ' + pageErrors.join(' | '));
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}
