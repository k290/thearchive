import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		include: ['tests/unit/**/*.test.{js,mjs,cjs,ts,mts,cts}'],
		environment: 'node',
		globals: true,
		isolate: true,
		passWithNoTests: true
	}
});
