import { expect, test } from '@playwright/test';
import { createRuntimeErrorTracker, gotoRoute } from './helpers';

test('blog list entries navigate to detail pages without runtime errors', async ({ page }) => {
	const runtime = createRuntimeErrorTracker(page);

	const response = await gotoRoute(page, '/blog/');
	expect(response?.status()).toBeLessThan(400);

	const detailLinks = await page.locator('.blog-feed a[href]').evaluateAll((anchors) => {
		const hrefs = anchors
			.map((anchor) => anchor.getAttribute('href'))
			.filter((href): href is string => Boolean(href));
		const detailRoutes = hrefs.filter((href) => /\/blog\/[^/]+\/?$/.test(href));
		return [...new Set(detailRoutes)];
	});

	expect(detailLinks.length).toBeGreaterThan(0);

	for (const href of detailLinks) {
		const detailResponse = await page.goto(href);
		expect(detailResponse?.status(), `Expected ${href} to load`).toBeLessThan(400);
		await expect(page.locator('article, .article-detail').first()).toBeVisible();
		await expect(page.locator('h1').first()).toBeVisible();
	}

	runtime.assertNoErrors('blog listing to detail navigation');
});
