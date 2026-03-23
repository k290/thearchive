import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const projectRoot = process.cwd();
const blogDir = path.join(projectRoot, 'src', 'content', 'blog');
const toolsDir = path.join(projectRoot, 'src', 'content', 'tools');
const toolsIndexPagePath = path.join(projectRoot, 'src', 'pages', 'tools', 'index.astro');

const markdownPattern = /\.(md|mdx)$/i;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const allowedToolStatuses = new Set(['live', 'beta', 'planned', 'archived']);

const listMarkdownFiles = (dir: string): string[] =>
	fs
		.readdirSync(dir)
		.filter((name) => markdownPattern.test(name))
		.map((name) => path.join(dir, name));

const unquote = (value: string): string => value.replace(/^['"]|['"]$/g, '').trim();

const parseFrontmatter = (fileContent: string): Record<string, string> => {
	const match = fileContent.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
	if (!match) {
		throw new Error('Missing frontmatter block');
	}

	const parsed: Record<string, string> = {};
	for (const line of match[1].split(/\r?\n/)) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith('#')) {
			continue;
		}

		const keyValueMatch = trimmed.match(/^([A-Za-z0-9_]+):\s*(.+)$/);
		if (!keyValueMatch) {
			continue;
		}

		parsed[keyValueMatch[1]] = keyValueMatch[2].trim();
	}

	return parsed;
};

const assertValidDate = (value: string, fieldName: string, fileName: string): void => {
	const parsedDate = new Date(unquote(value));
	expect(Number.isNaN(parsedDate.valueOf()), `${fileName} has invalid ${fieldName}`).toBe(false);
};

const assertUrlOrHash = (value: string, fieldName: string, fileName: string): void => {
	const normalized = unquote(value);
	if (normalized === '#') {
		return;
	}

	let valid = true;
	try {
		new URL(normalized);
	} catch {
		valid = false;
	}

	expect(valid, `${fileName} has invalid ${fieldName}: ${normalized}`).toBe(true);
};

describe('content contracts', () => {
	it('blog entries have required frontmatter, valid slugs, and valid publication dates', () => {
		const files = listMarkdownFiles(blogDir);
		expect(files.length).toBeGreaterThan(0);

		const slugs = new Set<string>();

		for (const file of files) {
			const fileName = path.basename(file);
			const slug = fileName.replace(markdownPattern, '');
			const frontmatter = parseFrontmatter(fs.readFileSync(file, 'utf-8'));

			expect(slugPattern.test(slug), `${fileName} has invalid slug format`).toBe(true);
			expect(slugs.has(slug), `${fileName} duplicates slug "${slug}"`).toBe(false);
			slugs.add(slug);

			expect(frontmatter.title, `${fileName} is missing "title"`).toBeTruthy();
			expect(frontmatter.description, `${fileName} is missing "description"`).toBeTruthy();
			expect(frontmatter.pubDate, `${fileName} is missing "pubDate"`).toBeTruthy();
			assertValidDate(frontmatter.pubDate, 'pubDate', fileName);
		}
	});

	it('tool entries have required frontmatter, valid slugs, and valid ordering fields', () => {
		const files = listMarkdownFiles(toolsDir);
		expect(files.length).toBeGreaterThan(0);

		const slugs = new Set<string>();

		for (const file of files) {
			const fileName = path.basename(file);
			const slug = fileName.replace(markdownPattern, '');
			const frontmatter = parseFrontmatter(fs.readFileSync(file, 'utf-8'));

			expect(slugPattern.test(slug), `${fileName} has invalid slug format`).toBe(true);
			expect(slugs.has(slug), `${fileName} duplicates slug "${slug}"`).toBe(false);
			slugs.add(slug);

			expect(frontmatter.title, `${fileName} is missing "title"`).toBeTruthy();
			expect(frontmatter.description, `${fileName} is missing "description"`).toBeTruthy();
			expect(frontmatter.category, `${fileName} is missing "category"`).toBeTruthy();
			expect(frontmatter.publishedDate, `${fileName} is missing "publishedDate"`).toBeTruthy();
			assertValidDate(frontmatter.publishedDate, 'publishedDate', fileName);

			if (frontmatter.status) {
				expect(
					allowedToolStatuses.has(unquote(frontmatter.status)),
					`${fileName} has invalid status "${frontmatter.status}"`
				).toBe(true);
			}

			if (frontmatter.externalUrl) {
				assertUrlOrHash(frontmatter.externalUrl, 'externalUrl', fileName);
			}

			if (frontmatter.repoUrl) {
				assertUrlOrHash(frontmatter.repoUrl, 'repoUrl', fileName);
			}
		}
	});

	it('tools directory order references only existing tool slugs', () => {
		const toolsIndexSource = fs.readFileSync(toolsIndexPagePath, 'utf-8');
		const orderMatch = toolsIndexSource.match(/const\s+figmaDirectoryOrder\s*=\s*\[([\s\S]*?)\];/);
		expect(orderMatch, 'Could not find figmaDirectoryOrder in tools index page').toBeTruthy();

		const orderedSlugs =
			orderMatch?.[1]
				.split('\n')
				.map((line) => line.trim())
				.filter((line) => line.startsWith("'") || line.startsWith('"'))
				.map((line) => line.replace(/['",\s]/g, '')) ?? [];

		const availableSlugs = new Set(listMarkdownFiles(toolsDir).map((file) => path.basename(file).replace(markdownPattern, '')));
		expect(orderedSlugs.length).toBeGreaterThan(0);

		for (const slug of orderedSlugs) {
			expect(availableSlugs.has(slug), `figmaDirectoryOrder contains missing slug "${slug}"`).toBe(true);
		}
	});
});

