import { expect, test } from '@playwright/test';
import { createRuntimeErrorTracker, gotoRoute } from './helpers';

const viewports = [
	{ label: 'desktop', size: { width: 1440, height: 900 } },
	{ label: 'tablet', size: { width: 1024, height: 1366 } },
	{ label: 'mobile', size: { width: 390, height: 844 } }
];

const routeChecks = [
	{ route: '/', selector: '.home-hero__title' },
	{ route: '/blog/', selector: '.blog-feed h1' },
	{ route: '/tools/', selector: '#tools-directory-title' },
	{ route: '/tools/semantic-weaver/', selector: '#sw-title' },
	{ route: '/about/', selector: '#about-title' }
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

const expectNoHorizontalOverflow = async (
	page: import('@playwright/test').Page,
	routeLabel: string,
	viewportLabel: string
) => {
	const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
	const offenders = await page.evaluate(() => {
		const viewportWidth = window.innerWidth;
		return Array.from(document.querySelectorAll('*'))
			.map((element) => {
				const rect = element.getBoundingClientRect();
				return {
					tag: element.tagName.toLowerCase(),
					id: element.id || '',
					className: (element as HTMLElement).className || '',
					left: Math.round(rect.left),
					right: Math.round(rect.right),
					width: Math.round(rect.width)
				};
			})
			.filter((item) => item.right > viewportWidth + 1 || item.left < -1)
			.slice(0, 5);
	});
	const scrollOffenders = await page.evaluate(() =>
		Array.from(document.querySelectorAll('*'))
			.map((element) => {
				const style = window.getComputedStyle(element);
				return {
					tag: element.tagName.toLowerCase(),
					id: element.id || '',
					className: (element as HTMLElement).className || '',
					clientWidth: (element as HTMLElement).clientWidth,
					scrollWidth: (element as HTMLElement).scrollWidth,
					overflowX: style.overflowX
				};
			})
			.filter((item) => item.scrollWidth - item.clientWidth > 1)
			.slice(0, 8)
	);

	expect(
		overflow,
		`Horizontal overflow detected on ${routeLabel} at ${viewportLabel} (${overflow}px). Offenders: ${JSON.stringify(
			offenders
		)}. Scroll offenders: ${JSON.stringify(scrollOffenders)}`
	).toBeLessThanOrEqual(2);
};

test.describe('responsive layout matrix', () => {
	for (const viewport of viewports) {
		test(`core routes are stable at ${viewport.label}`, async ({ page }) => {
			const runtime = createRuntimeErrorTracker(page);
			await page.setViewportSize(viewport.size);

			for (const routeCheck of routeChecks) {
				const response = await gotoRoute(page, routeCheck.route);
				expect(response?.status(), `Expected route ${routeCheck.route} to load`).toBeLessThan(400);
				await expect(page.locator(routeCheck.selector)).toBeVisible();
				await expectNoHorizontalOverflow(page, routeCheck.route, viewport.label);
			}

			const blogListResponse = await gotoRoute(page, '/blog/');
			expect(blogListResponse?.status(), 'Expected /blog/ to load before detail responsive checks').toBeLessThan(400);
			const blogDetailHref = await findFirstBlogDetailHref(page);
			const blogDetailResponse = await page.goto(blogDetailHref);
			expect(blogDetailResponse?.status(), `Expected ${blogDetailHref} to load`).toBeLessThan(400);
			await expect(page.locator('h1').first()).toBeVisible();
			await expectNoHorizontalOverflow(page, 'blog detail sample', viewport.label);

			const toolsListResponse = await gotoRoute(page, '/tools/');
			expect(toolsListResponse?.status(), 'Expected /tools/ to load before detail responsive checks').toBeLessThan(400);
			const toolDetailHref = await findFirstGenericToolDetailHref(page);
			const toolDetailResponse = await page.goto(toolDetailHref);
			expect(toolDetailResponse?.status(), `Expected ${toolDetailHref} to load`).toBeLessThan(400);
			await expect(page.locator('h1').first()).toBeVisible();
			await expectNoHorizontalOverflow(page, 'tools detail sample', viewport.label);

			runtime.assertNoErrors(`responsive matrix at ${viewport.label}`);
		});
	}
});
