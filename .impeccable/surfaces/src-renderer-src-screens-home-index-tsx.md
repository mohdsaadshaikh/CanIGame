---
version: 1
slug: "src-renderer-src-screens-home-index-tsx"
primary_target: "src/renderer/src/screens/home/index.tsx"
related_targets: ["src/renderer/src/layout/index.tsx","src/renderer/src/components/Sidebar.tsx","src/renderer/src/components/Header.tsx","src/renderer/src/components/GameSearch.tsx"]
---

## Scope

The app shell (title bar, sidebar, command-palette search) and the Home screen. Mode: Operate.
Inherits to every other screen through shared tokens.

## Audience and task

PC hardware enthusiasts and upgraders. The rig is the front door: open the app, see the detected
machine at a glance, then browse games and read them against it. The user said a polished result
would still feel wrong if it looked like a generic dashboard or too plain.

## Constraints

Brand: name CanIGame, orange #ED541B stays the accent. No per-game verdict until the comparison
engine exists, so never imply pass or fail. Electron CSP: fonts self-hosted, images from RAWG only.
The featured-games slider is a pinned user request and stays.

## Direction contract

THESIS: A game launcher where your rig is the player profile. The machine is introduced like a
streamer's profile header (name, stats, artwork), and games are browsed on art-first cards.
Refuses the flat bordered-box tool look (kanban, canvas) the user rejected.

OWN-WORLD: User-pinned references (Elite Gamers Arena dashboard, Streamiq profile), recoloured to
the brand: deep navy ground, tinted navy panels with 12 to 16px corners, orange #ED541B as the one
accent (filled pills with dark ink, outlined active nav, progress), copper for hardware designators.
Barlow for UI, Barlow Condensed heavy caps for headings, titles and stat numbers, Martian Mono only
for designators and keys. Game key art supplies colour: blurred ambient art behind the top of Home.

STORY: The visitor sees their own machine first, stated like a profile with exact numbers, then
browses featured and trending PC games on rich cards knowing what rig they judge them against.

FIRST VIEWPORT: 232px sidebar (group labels, outlined orange active pill, Rig card at the foot) and
56px top bar with search pill and caption buttons. Main: Rig profile header (chip tile, machine name
in condensed caps, CPU, GPU, VRAM and memory stats, Full specs and Rescan, board traces as art),
then the featured slider (art banner with condensed caps title, rating chips, orange View details
pill, five-row list right). Signature move: the rig as a player profile drawn over its own board traces.

FORM: User-pinned direction (reference screenshots), superseding the rolled Silkscreen Board world
while keeping its rig-first concept; original seed key 8c545ce5.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
