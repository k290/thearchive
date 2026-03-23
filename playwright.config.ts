import { defineConfig, devices } from '@playwright/test';

const isCI = Boolean(process.env.CI);
const normalizedBasePath = (() => {
	const basePath = process.env.PLAYWRIGHT_BASE_PATH ?? '/';
	if (basePath === '/') {
		return '/';
	}
	const trimmed = basePath.replace(/^\/+|\/+$/g, '');
	return `/${trimmed}/`;
})();
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:4321${normalizedBasePath}`;

export default defineConfig({
	testDir: './tests/e2e',
	snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}{ext}',
	fullyParallel: false,
	forbidOnly: isCI,
	retries: isCI ? 2 : 0,
	workers: isCI ? 1 : undefined,
	reporter: isCI ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],
	expect: {
		toHaveScreenshot: {
			animations: 'disabled',
			caret: 'hide',
			// CI chromium rasterization differs from local machines by ~2-3% on a few pages.
			// Keep local strict; allow a narrow CI cushion above observed max drift.
			maxDiffPixelRatio: isCI ? 0.035 : 0.015
		}
	},
	use: {
		baseURL,
		trace: 'on-first-retry',
		screenshot: 'only-on-failure',
		video: 'retain-on-failure'
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		}
	],
	webServer: {
		command: 'npm run dev -- --host 127.0.0.1 --port 4321',
		url: baseURL,
		reuseExistingServer: !isCI,
		env: {
			...process.env,
			BASE: normalizedBasePath
		},
		timeout: 120000
	}
});
