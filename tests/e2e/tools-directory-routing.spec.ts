import { expect, test } from '@playwright/test';
import { createRuntimeErrorTracker } from './helpers';

test('tools directory cards navigate to valid detail pages', async ({ page }) => {
	const runtime = createRuntimeErrorTracker(page);

	const response = await page.goto('/tools/');
	expect(response?.status()).toBeLessThan(400);

	const cardLinks = await page.locator('.tools-directory__card-button').evaluateAll((anchors) => {
		const hrefs = anchors
			.map((anchor) => anchor.getAttribute('href'))
			.filter((href): href is string => Boolean(href));
		return [...new Set(hrefs)];
	});

	expect(cardLinks.length).toBeGreaterThanOrEqual(6);

	for (const href of cardLinks) {
		const detailResponse = await page.goto(href);
		expect(detailResponse?.status(), `Expected ${href} to load`).toBeLessThan(400);
		await expect(page.locator('h1').first()).toBeVisible();
	}

	runtime.assertNoErrors('tools directory detail navigation');
});

