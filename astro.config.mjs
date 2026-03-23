// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
const site = process.env.SITE;
const base = process.env.BASE ?? '/';

export default defineConfig({
	...(site ? { site } : {}),
	base
});
