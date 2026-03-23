import { expect, test } from '@playwright/test';
import { createRuntimeErrorTracker } from './helpers';

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

test.describe('responsive layout matrix', () => {
	for (const viewport of viewports) {
		test(`core routes are stable at ${viewport.label}`, async ({ page }) => {
			const runtime = createRuntimeErrorTracker(page);
			await page.setViewportSize(viewport.size);

			for (const routeCheck of routeChecks) {
				const response = await page.goto(routeCheck.route);
				expect(response?.status(), `Expected route ${routeCheck.route} to load`).toBeLessThan(400);
				await expect(page.locator(routeCheck.selector)).toBeVisible();

				const overflow = await page.evaluate(
					() => document.documentElement.scrollWidth - window.innerWidth
				);
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
					`Horizontal overflow detected on ${routeCheck.route} at ${viewport.label} (${overflow}px). Offenders: ${JSON.stringify(
						offenders
					)}. Scroll offenders: ${JSON.stringify(scrollOffenders)}`
				).toBeLessThanOrEqual(2);
			}

			runtime.assertNoErrors(`responsive matrix at ${viewport.label}`);
		});
	}
});
