# CanIGame design contract: "Overclock"

Fortnite's loudness on Valorant's discipline. The type is loud and the motion has a bit of
bounce; the geometry is sharp, the layout is ordered, and there is only one accent. Game art
supplies the colour, and the UI frames it.

References: Valorant's site and client (zero radius, -6° skewed CTAs, accent top stripe on
featured cards, hairlines instead of shadows, tracked mono labels), and Fortnite's lobby and Item
Shop (heavy italic condensed caps, full-bleed art cards with the name riding the art, pop on hover).
Neither game's branding, fonts or imagery is copied.

## Tokens (`src/renderer/src/lib/theme.ts`, `assets/css/main.css`)

| Token                             | Value                                                           | Use                                                 |
| --------------------------------- | --------------------------------------------------------------- | --------------------------------------------------- |
| `--cig-display`                   | Barlow Condensed 800/900 **italic**, uppercase                  | Titles, stats, buttons, nav                         |
| body                              | Poppins 400-600, 15px                                           | Prose, descriptions                                 |
| `--mantine-font-family-monospace` | Martian Mono, uppercase, tracked 0.14-0.2em                     | Labels, meta, designators                           |
| radius                            | 0 on surfaces, 2px on small controls, 4px max (tooltips, menus) | Never round panels                                  |
| `--cig-cut`, `--cig-cut-sm`       | 14px / 8px chamfer                                              | Top-right + bottom-left corners of panels and tiles |
| `--cig-skew`                      | -8deg                                                           | Primary buttons, chips, segments, active nav plate  |
| accent                            | `--cig-accent-gradient` (amber → orange → ember)                | Never a flat orange fill                            |
| `--cig-hairline`                  | white at 8%                                                     | Borders; no blurred drop shadows on UI              |
| `--cig-pop`                       | `cubic-bezier(0.34, 1.56, 0.64, 1)` 220ms                       | Hover lift and scale (the Fortnite bounce)          |
| `--cig-ease`                      | `cubic-bezier(0.65, 0, 0.35, 1)` 180ms                          | Colour, opacity, stripes (the Valorant snap)        |

## Rules

1. **Shape.** Panels and tiles are square with a chamfer cut on two opposite corners
   (`.cig-cut`). Buttons, chips and segment controls are parallelograms (`skewX(var(--cig-skew))`)
   with the label counter-skewed so text stays upright.
2. **Type is the loud part.** Display text is Barlow Condensed italic in caps, set big with tight
   leading (0.88-0.95). Labels are small tracked mono caps. Body stays mixed case and calm.
3. **One accent.** Orange appears as the gradient, a 2px gradient stripe, or a gradient glow.
   Data tones (review %) are the only other colours, and they are small.
4. **Featured means a stripe.** Hover or selection draws a 2px gradient stripe along the top
   edge (it wipes in from the left) and an inset hairline ring in orange. No outer glows.
5. **Motion.** Hover: lift 4-6px and scale up to 1.03 with `--cig-pop`. Reveals: 24px translate +
   fade, 420ms. Everything collapses to opacity-only under `prefers-reduced-motion`.
6. **No web-app tells.** No pills, no boxed icon tiles behind icons, no borders on sidebar items,
   no rounded cards, no heading bars. Icons are bare line icons in orange or text colour.
7. **Focus stays visible.** `clip-path` clips outlines, so clipped surfaces get their focus ring
   from an inset shadow or a wrapper, never a bare `outline` on the clipped element.

8. **Chunky keys (Fortnite).** Filled primary buttons sit on a solid ember base (`0 4px 0`):
   hover raises the face, press pushes it down onto the base. Hard offsets only, never blur.
9. **Rarity (Fortnite shop).** A "Legendary" game (`isLegendary`: 90%+ positive, 1,000+
   reviews) gets a warm plate, a permanent top stripe, an ember ring and a skewed "Legendary"
   tag on its art. It stays in the orange family, and the tag means it never relies on colour alone.

## Rejected

Neon outer glows, gradient text, multi-colour palettes, pill shapes, glassmorphism blur on
controls, rounded-2xl cards, decorative eyebrow labels over every heading.
