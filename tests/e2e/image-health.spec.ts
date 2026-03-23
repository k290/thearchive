import { expect, test } from '@playwright/test';
import { createRuntimeErrorTracker, isLikelyInternalPath } from './helpers';

test('no broken images on primary routes', async ({ page, request }) => {
	const runtime = createRuntimeErrorTracker(page);
	const primaryRoutes = ['/', '/blog/', '/tools/', '/about/'];
	const imageSources = new Set<string>();

	for (const route of primaryRoutes) {
		const response = await page.goto(route);
		expect(response?.status(), `Expected route ${route} to load`).toBeLessThan(400);

		const routeImageSources = await page.locator('img[src]').evaluateAll((images) =>
			images
				.map((image) => image.getAttribute('src'))
				.filter((src): src is string => Boolean(src))
		);

		for (const src of routeImageSources) {
			if (!src.startsWith('data:')) {
				imageSources.add(src);
			}
		}
	}

	expect(imageSources.size).toBeGreaterThan(0);

	for (const src of imageSources) {
		if (!isLikelyInternalPath(src)) {
			continue;
		}
		const imageUrl = new URL(src, page.url()).toString();
		const imageResponse = await request.get(imageUrl);
		expect(imageResponse.status(), `Expected image ${imageUrl} to resolve`).toBeLessThan(400);
	}

	runtime.assertNoErrors('image health checks');
});

