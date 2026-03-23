import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { gotoRoute } from './helpers';

test('a11y smoke scan on core routes', async ({ page }) => {
	const routes = ['/', '/blog/', '/tools/', '/about/'];

	for (const route of routes) {
		const response = await gotoRoute(page, route);
		expect(response?.status(), `Expected route ${route} to load`).toBeLessThan(400);

		const results = await new AxeBuilder({ page }).analyze();
		const criticalViolations = results.violations.filter((violation) => violation.impact === 'critical');

		expect(
			criticalViolations,
			`Critical accessibility violations found on ${route}: ${criticalViolations
				.map((violation) => violation.id)
				.join(', ')}`
		).toEqual([]);
	}
});
