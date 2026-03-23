import { expect, test } from '@playwright/test';
import { configuredBasePath, createRuntimeErrorTracker, expectAtRoute, isLikelyInternalPath } from './helpers';

test('base-path-sensitive links and assets resolve under configured base path', async ({ page, request }) => {
	const runtime = createRuntimeErrorTracker(page);
	const routes = ['/', '/blog/', '/tools/', '/about/'];

	for (const route of routes) {
		const response = await page.goto(route);
		expect(response?.status(), `Expected route ${route} to load`).toBeLessThan(400);
		expectAtRoute(page, route);
	}

	await page.goto('/');

	const hrefValues = await page.locator('a[href]').evaluateAll((anchors) =>
		anchors
			.map((anchor) => anchor.getAttribute('href'))
			.filter((href): href is string => Boolean(href))
	);
	const assetValues = await page
		.locator('img[src], link[href][rel~="icon"], script[src]')
		.evaluateAll((elements) =>
			elements
				.map((element) => {
					if (element instanceof HTMLImageElement || element instanceof HTMLScriptElement) {
						return element.getAttribute('src');
					}
					if (element instanceof HTMLLinkElement) {
						return element.getAttribute('href');
					}
					return null;
				})
				.filter((value): value is string => Boolean(value))
		);

	const internalPaths = [...hrefValues, ...assetValues].filter(isLikelyInternalPath);
	const expectedPrefix = configuredBasePath === '/' ? '/' : configuredBasePath;

	for (const path of internalPaths) {
		expect(path.startsWith(expectedPrefix), `Expected ${path} to start with ${expectedPrefix}`).toBe(true);
	}

	for (const src of [...new Set(assetValues.filter(isLikelyInternalPath).slice(0, 12))]) {
		const assetUrl = new URL(src, page.url()).toString();
		const assetResponse = await request.get(assetUrl);
		expect(assetResponse.status(), `Expected asset ${assetUrl} to resolve`).toBeLessThan(400);
	}

	runtime.assertNoErrors('base-path link and asset checks');
});

