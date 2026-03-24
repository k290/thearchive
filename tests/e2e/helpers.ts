import { expect, type Page } from '@playwright/test';

const normalizeBasePath = (rawPath: string): string => {
	if (rawPath === '/') {
		return '/';
	}
	const trimmed = rawPath.replace(/^\/+|\/+$/g, '');
	return `/${trimmed}/`;
};

export const configuredBasePath = normalizeBasePath(process.env.PLAYWRIGHT_BASE_PATH ?? '/');

export const resolveRoute = (route: string): string => {
	if (route === '/') {
		return configuredBasePath;
	}

	const normalizedRoute = route.startsWith('/') ? route.slice(1) : route;
	return `${configuredBasePath}${normalizedRoute}`.replace(/\/{2,}/g, '/');
};

export const gotoRoute = (page: Page, route: string) => page.goto(resolveRoute(route));

export const expectAtRoute = (page: Page, route: string): void => {
	const expectedPath = resolveRoute(route);
	const actualPath = new URL(page.url()).pathname;
	expect(actualPath, `Expected route ${route} to resolve with base path ${configuredBasePath}`).toBe(expectedPath);
};

export const createRuntimeErrorTracker = (page: Page) => {
	const errors: string[] = [];
	const ignoredConsoleErrorPatterns = [
		/Error while running audit's match function: TypeError: Failed to fetch/i,
		/fonts\.googleapis\.com.*blocked by CORS policy/i,
		/Failed to load resource: net::ERR_FAILED/i
	];

	page.on('pageerror', (error) => {
		errors.push(`pageerror: ${error.message}`);
	});

	page.on('console', (message) => {
		if (message.type() === 'error') {
			const text = message.text();
			const shouldIgnore = ignoredConsoleErrorPatterns.some((pattern) => pattern.test(text));
			if (!shouldIgnore) {
				errors.push(`console.error: ${text}`);
			}
		}
	});

	return {
		assertNoErrors(context: string) {
			expect(errors, `Runtime errors detected during ${context}`).toEqual([]);
		}
	};
};

export const isLikelyInternalPath = (value: string): boolean => {
	if (!value || value.startsWith('#')) {
		return false;
	}

	return value.startsWith('/');
};
