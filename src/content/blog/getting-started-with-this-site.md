---
title: "Getting Started With This Site"
description: "How this Astro foundation is structured for both publishing and product pages."
pubDate: 2026-03-22
tags: ["astro", "setup", "architecture"]
---

This website is split into two content tracks:

1. **Blog** for long-form writing, analysis, and updates.
2. **Tools** for the products and utilities you build.

Each section uses Astro Content Collections, so entries are validated against a schema.  
That means when we map your Figma UI later, we can focus on presentation without changing your content model.

## Editing workflow

- Add blog posts under `src/content/blog`.
- Add tool profile pages under `src/content/tools`.
- Astro routes are generated from the file names automatically.
