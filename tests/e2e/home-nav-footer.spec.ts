import { expect, test } from '@playwright/test';
import { createRuntimeErrorTracker, expectAtRoute, gotoRoute } from './helpers';

const headerRoutes = [
	{ label: 'Home', route: '/' },
	{ label: 'Blog', route: '/blog/' },
	{ label: 'Tools', route: '/tools/' },
	{ label: 'About', route: '/about/' }
];

const footerRoutes = [
	{ label: 'Privacy Policy', route: '/privacy/' },
	{ label: 'Terms of Service', route: '/terms/' },
	{ label: 'Contact', route: '/contact/' }
];

test('home renders and top-nav/footer links work', async ({ page }) => {
	const runtime = createRuntimeErrorTracker(page);

	const response = await gotoRoute(page, '/');
	expect(response?.status()).toBeLessThan(400);
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

	for (const link of headerRoutes) {
		await gotoRoute(page, '/');
		await page.getByRole('banner').getByRole('link', { name: link.label }).click();
		expectAtRoute(page, link.route);
		await expect(page.locator('h1').first()).toBeVisible();
	}

	for (const link of footerRoutes) {
		await gotoRoute(page, '/');
		await page.getByRole('contentinfo').getByRole('link', { name: link.label }).click();
		expectAtRoute(page, link.route);
		await expect(page.locator('h1').first()).toBeVisible();
	}

	runtime.assertNoErrors('home/nav/footer flow');
});
