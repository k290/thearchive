import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		draft: z.boolean().default(false),
		tags: z.array(z.string()).default([])
	})
});

const tools = defineCollection({
	loader: glob({ base: './src/content/tools', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		category: z.string(),
		publishedDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		status: z.enum(['live', 'beta', 'planned', 'archived']).default('planned'),
		version: z.string().optional(),
		icon: z.string().optional(),
		featured: z.boolean().default(false),
		externalUrl: z.union([z.string().url(), z.literal('#')]).optional(),
		repoUrl: z.string().url().optional(),
		tags: z.array(z.string()).default([])
	})
});

export const collections = { blog, tools };
