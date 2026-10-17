# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

(Electron desktop app; the UI is a web renderer. Windows is the primary development target;
macOS and Linux builds are configured in `electron-builder.yml`.)

## Users

PC hardware enthusiasts and upgraders. They know their components and use CanIGame to see how
their machine stacks up against the games they want, and to work out which part is the bottleneck
when planning an upgrade.

## Product Purpose

CanIGame detects the user's real PC hardware and compares it with each game's system requirements
from the RAWG database, so the user gets a clear answer before buying or upgrading. Success: for any
game, the user can tell at a glance whether their rig runs it, and which component holds it back
when it doesn't.

## Positioning

- **Reads real hardware locally.** CPU, GPU, RAM and OS are detected on-device via
  `systeminformation`, with no browser plugin and no typing in specs by hand.
- **Launcher-quality browsing.** Discovering games should feel like a real game launcher or store,
  not a utility form.
- **A clear verdict per game.** Each game's headline answer is whether it runs on this machine.

## Operating Context

- Desktop app with a frameless window and custom title bar; the window can be resized down to 800×600.
- Game data (catalogue, artwork, descriptions, PC requirements) comes from the RAWG API through the
  main process. RAWG stores PC requirements as free text (minimum / recommended).
- Hardware scans are cached locally and refreshed on demand from the About PC screen.

## Capabilities and Constraints

- Built today: hardware detection (About PC), home page with featured carousel and curated rows,
  Explore with infinite scroll and grid/list views, game details with parsed PC requirements,
  live game search (Ctrl/⌘+K), theme switching (dark / light / follow system).
- **Not built yet:** the per-game verdict itself (requirements parser and comparison engine),
  bottleneck identification, wishlist persistence, filters. The UI must not display a verdict it
  cannot compute.
- Technical: Electron security invariants (sandboxed renderer, strict CSP, images only from
  `media.rawg.io`) are binding; see CLAUDE.md.
- Open decision: how verdicts are scored (benchmark source for CPU/GPU comparison).

## Brand Commitments

- Name: **CanIGame**.
- Brand colour: **orange, `#ED541B`**, which must remain the accent.
- Everything else (logo, typography, layout, imagery) is explicitly open for redesign.

## Evidence on Hand

- Live RAWG data: game artwork, genres, ratings, Metacritic scores, release dates, PC requirements.
- The user's own detected hardware.
- No testimonials, user counts, benchmarks or press exist. Do not fabricate any.

## Product Principles

1. **The verdict is the product.** Every surface should lead toward "will it run, and what limits
   it", and browsing serves that question.
2. **Speak to people who know hardware.** Show real model names and numbers; don't dumb specs down
   into vague tiers.
3. **Trust the machine, not the user's memory.** Prefer detected facts over manual input.
4. **Honest about gaps.** When RAWG lacks requirements or a comparison can't be made, say so plainly.
