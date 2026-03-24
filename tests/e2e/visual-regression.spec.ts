import { expect, test } from '@playwright/test';
import { createRuntimeErrorTracker, gotoRoute } from './helpers';

const visualRoutes = [
	{ route: '/', snapshot: 'home.png' },
	{ route: '/blog/', snapshot: 'blog-index.png' },
	{ route: '/tools/', snapshot: 'tools-index.png' },
	{ route: '/tools/semantic-weaver/', snapshot: 'tools-semantic-weaver.png' },
	{ route: '/about/', snapshot: 'about.png' }
];

const findFirstBlogDetailHref = async (page: import('@playwright/test').Page): Promise<string> => {
	const hrefs = await page.locator('.blog-feed a[href]').evaluateAll((anchors) =>
		anchors
			.map((anchor) => anchor.getAttribute('href'))
			.filter((href): href is string => Boolean(href))
	);

	const detailHref = hrefs.find((href) => /\/blog\/[^/]+\/?$/.test(href));
	expect(detailHref, 'Expected at least one blog detail link on /blog/').toBeTruthy();
	return detailHref!;
};

const findFirstGenericToolDetailHref = async (page: import('@playwright/test').Page): Promise<string> => {
	const hrefs = await page.locator('.tools-directory__card-button').evaluateAll((anchors) =>
		anchors
			.map((anchor) => anchor.getAttribute('href'))
			.filter((href): href is string => Boolean(href))
	);

	const genericDetailHref =
		hrefs.find((href) => /\/tools\/[^/]+\/?$/.test(href) && !/\/tools\/semantic-weaver\/?$/.test(href)) ??
		hrefs.find((href) => /\/tools\/[^/]+\/?$/.test(href));
	expect(genericDetailHref, 'Expected at least one non-directory tools detail link on /tools/').toBeTruthy();
	return genericDetailHref!;
};

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

	test('matches visual baseline for a blog detail page', async ({ page }) => {
		const runtime = createRuntimeErrorTracker(page);
		const listingResponse = await gotoRoute(page, '/blog/');
		expect(listingResponse?.status(), 'Expected /blog/ to load before detail visual capture').toBeLessThan(400);
		const detailHref = await findFirstBlogDetailHref(page);

		const detailResponse = await page.goto(detailHref);
		expect(detailResponse?.status(), `Expected ${detailHref} to load`).toBeLessThan(400);
		await page.waitForLoadState('networkidle');
		await expect(page).toHaveScreenshot('blog-detail-sample.png');
		runtime.assertNoErrors('visual baseline for blog detail sample');
	});

	test('matches visual baseline for a generic tools detail page', async ({ page }) => {
		const runtime = createRuntimeErrorTracker(page);
		const listingResponse = await gotoRoute(page, '/tools/');
		expect(listingResponse?.status(), 'Expected /tools/ to load before detail visual capture').toBeLessThan(400);
		const detailHref = await findFirstGenericToolDetailHref(page);

		const detailResponse = await page.goto(detailHref);
		expect(detailResponse?.status(), `Expected ${detailHref} to load`).toBeLessThan(400);
		await page.waitForLoadState('networkidle');
		await expect(page).toHaveScreenshot('tools-detail-generic-sample.png');
		runtime.assertNoErrors('visual baseline for generic tool detail sample');
	});

	test('matches visual baseline for the home psychology figure block', async ({ page }) => {
		const runtime = createRuntimeErrorTracker(page);
		const response = await gotoRoute(page, '/');
		expect(response?.status(), 'Expected / to load for psychology figure capture').toBeLessThan(400);
		await page.waitForLoadState('networkidle');
		await expect(page.locator('.home-psychology__figure')).toHaveScreenshot('home-psychology-figure.png');
		runtime.assertNoErrors('visual baseline for home psychology figure block');
	});

	test('matches visual baseline for tools manifesto image and copy block', async ({ page }) => {
		const runtime = createRuntimeErrorTracker(page);
		const response = await gotoRoute(page, '/tools/');
		expect(response?.status(), 'Expected /tools/ to load for manifesto block capture').toBeLessThan(400);
		await page.waitForLoadState('networkidle');
		await expect(page.locator('.tools-directory__manifesto')).toHaveScreenshot('tools-manifesto-block.png');
		runtime.assertNoErrors('visual baseline for tools manifesto block');
	});
});
