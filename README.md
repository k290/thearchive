# My Website (Astro)

This project is set up to host both:

- blog posts
- tool pages for products/utilities you build

The current UI is a clean placeholder foundation that can be swapped to your Figma design system later.

## Project structure

```text
src/
├── content/
│   ├── blog/
│   └── tools/
├── content.config.ts
├── layouts/
│   └── Layout.astro
├── pages/
│   ├── index.astro
│   ├── blog/
│   │   ├── index.astro
│   │   └── [...slug].astro
│   └── tools/
│       ├── index.astro
│       └── [...slug].astro
└── styles/
    └── site.css
```

## Content model

### Blog entries

Add markdown files to `src/content/blog`.

Required frontmatter:

- `title`
- `description`
- `pubDate`

Optional:

- `updatedDate`
- `draft`
- `tags`

### Tool entries

Add markdown files to `src/content/tools`.

Required frontmatter:

- `title`
- `description`
- `category`
- `publishedDate`

Optional:

- `updatedDate`
- `status` (`live`, `beta`, `planned`, `archived`)
- `featured`
- `externalUrl`
- `repoUrl`
- `tags`

## Commands

- `npm install` install dependencies
- `npm run dev` start local development server
- `npm run check` run Astro type and `.astro` checks
- `npm run test:unit` run Vitest unit/contract tests
- `npm run test:e2e` run Playwright end-to-end tests
- `npm run test:e2e:visual` run visual regression tests
- `npm run test:e2e:update-snapshots` update visual baselines intentionally
- `npm run test:e2e:responsive` run responsive layout matrix tests
- `npm run build` build static site into `dist/`
- `npm run preview` preview production build locally

## CI and Branch Protection

- Main CI workflow file: `.github/workflows/ci.yml`
- Required check to enforce in GitHub branch protection: `quality` (job name)

### Snapshot Discipline

When UI changes are intentional:

1. Run `npm run test:e2e:update-snapshots`
2. Review image diffs in `tests/e2e/__screenshots__/`
3. Commit updated snapshots in the same PR
4. Confirm `npm run test:e2e:visual` passes
