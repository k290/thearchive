# Figma Hardening Pass (Stitch -> Figma -> Astro)

This guide maps each hardening-pass item to official Figma documentation, with a short implementation checklist for each.

## 1) Auto layout and resizing behavior

Docs:
- [Guide to auto layout](https://help.figma.com/hc/en-us/articles/360040451373-Explore-auto-layout-properties)
- [Use horizontal and vertical auto layout flows](https://help.figma.com/hc/en-us/articles/31289464393751-Use-the-horizontal-and-vertical-flows-in-auto-layout)
- [Create multi-dimensional auto layout flows](https://help.figma.com/hc/en-us/articles/31441443713047-Create-multi-dimensional-auto-layout-flows)

How to do it:
1. Select major containers (page sections, cards, nav groups) and apply Auto layout (`Shift + A`).
2. Set direction, gap, and padding from the right panel so spacing is rule-driven, not manual.
3. For children, set sizing intentionally (`Hug`, `Fill container`, or `Fixed`) and remove ad-hoc pixel nudges.

## 2) Min/max dimensions and responsive limits

Docs:
- [Guide to auto layout (min/max dimensions)](https://help.figma.com/hc/en-us/articles/360040451373-Explore-auto-layout-properties)
- [Apply constraints to define how layers resize](https://help.figma.com/hc/en-us/articles/360039957734-Apply-constraints-to-define-how-layers-resize)

How to do it:
1. On key containers and media, set `min` and `max` width/height so layouts stop over-expanding or collapsing.
2. Use constraints for layers that are not in Auto layout frames.
3. Resize parent frames at target breakpoints and confirm no clipping, overflow, or awkward whitespace.

## 3) Layout guides and grid discipline

Docs:
- [Create layout guides (grids, columns, rows)](https://help.figma.com/hc/en-us/articles/360040450513-Create-layout-grids-with-grids-columns-and-rows)

How to do it:
1. Add column guides to top-level frames for desktop/tablet/mobile breakpoints.
2. Lock gutter and margin values to your design system spacing rules.
3. Snap section containers to guides so content alignment is consistent across screens.

## 4) Components and variants for repeated UI

Docs:
- [Guide to components in Figma](https://help.figma.com/hc/en-us/articles/360038662654-Guide-to-components-in-Figma)
- [Create and use variants](https://help.figma.com/hc/en-us/articles/360056440594-Create-and-use-variants)
- [Name and organize components](https://help.figma.com/hc/en-us/articles/360038663994-Name-and-organize-components)

How to do it:
1. Convert repeating patterns (buttons, cards, nav items, badges) into components.
2. Model state/size/style differences as variant properties instead of duplicating frames.
3. Use clear naming (slash conventions) so assets are discoverable and predictable in handoff.

## 5) Variables/tokens (color, spacing, type, radii)

Docs:
- [Guide to variables in Figma](https://help.figma.com/hc/en-us/articles/15339657135383-Guide-to-variables-in-Figma)
- [Create and manage variables and collections](https://help.figma.com/hc/en-us/articles/15145852043927-Create-and-manage-variables-and-collections)
- [Apply variables to designs](https://help.figma.com/hc/en-us/articles/15343107263511-Apply-variables-to-designs)
- [Modes for variables](https://help.figma.com/hc/en-us/articles/15343816063383-Modes-for-variables)

How to do it:
1. Define collections for primitives and semantic tokens (for example: `color`, `spacing`, `radius`, `type`).
2. Apply variables to fills, text, spacing, and component properties instead of local one-off values.
3. Add modes (for example desktop/tablet/mobile or light/dark) where the design needs controlled variation.

## 6) Breakpoint QA before implementation handoff

Docs:
- [Frames in Figma Design](https://help.figma.com/hc/en-us/articles/360041539473-Frames-in-Figma-Design)
- [Adjust alignment, rotation, and position](https://help.figma.com/hc/en-us/articles/360039956914-Adjust-alignment-rotation-and-position)

How to do it:
1. Keep explicit frames for breakpoint targets (for example desktop/tablet/mobile) and test each one.
2. Verify alignment, text wrap, media crop, and spacing consistency frame-by-frame.
3. Resolve fidelity issues in Figma first, then export implementation specs to Astro/CSS.

## Stitch Generation Rules (Checklist)

Use these as a prompt contract when generating layouts in Stitch so exported Figma files are easier to harden and implement 1:1.

1. Breakpoints
- Declare exact frame widths (for example desktop/tablet/mobile) and require output for each.

2. Grid and gutters
- Define column count, gutter, and outer margins per breakpoint.
- Require all major containers to align to grid columns.

3. Section/container geometry
- Specify max content width and section padding.
- Call out exact two-column ratios where needed (for example `560/560` with a `64` gap).

4. Component dimensions
- Provide fixed dimensions for cards/media shells that must stay exact.
- Specify which elements are fixed vs fluid.

5. Resizing behavior
- Require Auto layout-ready behavior in generated structure.
- Specify expected `Hug`, `Fill`, or `Fixed` behavior for children.

6. Typography scale
- Define font families, sizes, line heights, letter spacing, and weight per text role.
- Require no ad-hoc one-off text styles.

7. Spacing scale
- Define the spacing token set (for example 4/8/12/16/24/32/48/64).
- Require spacing to use only those values.

8. Image treatment
- Define aspect ratio, crop intent, and focal point per image.
- Prefer centered cover behavior unless the design calls for a specific focal anchor.

9. Reusable UI patterns
- Mark repeaters (buttons, cards, nav rows, badges) for componentization.
- Include expected variant axes (size/state/tone).

10. Token readiness
- Require named color/spacing/type/radius tokens instead of hard-coded values.
- Separate primitive tokens from semantic tokens.

11. Link behavior in examples
- Use `#` for placeholder links so examples stay same-page and non-external.

12. Handoff notes
- Include a short spec block in output with dimensions, spacing, tokens, and variant rules to preserve intent during Astro implementation.
