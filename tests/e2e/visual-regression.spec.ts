import { expect, test } from '@playwright/test';
import { createRuntimeErrorTracker, gotoRoute } from './helpers';

const visualRoutes = [
	{ route: '/', snapshot: 'home.png' },
	{ route: '/blog/', snapshot: 'blog-index.png' },
	{ route: '/tools/', snapshot: 'tools-index.png' },
	{ route: '/tools/semantic-weaver/', snapshot: 'tools-semantic-weaver.png' },
	{ route: '/about/', snapshot: 'about.png' }
];

test.describe('visual baselines', () => {
	test.use({ viewport: { width: 1440, height: 1800 } });

	for (const pageSpec of visualRoutes) {
		test(`matches visual baseline for ${pageSpec.route}`, async ({ page }) => {
			const runtime = createRuntimeErrorTracker(page);
			const response = await gotoRoute(page, pageSpec.route);
			expect(response?.status(), `Expected route ${pageSpec.route} to load`).toBeLessThan(400);
			await page.waitForLoadState('networkidle');
			// Use a fixed viewport capture to avoid flaky full-page height differences across environments.
			await expect(page).toHaveScreenshot(pageSpec.snapshot);
			runtime.assertNoErrors(`visual baseline for ${pageSpec.route}`);
		});
	}
});
