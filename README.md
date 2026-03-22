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
- `npm run build` build static site into `dist/`
- `npm run preview` preview production build locally
