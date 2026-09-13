# Frontend Changes SOP

Use this guide for Astro components, layouts, CSS modules, pages, and UI behavior.

## Scope

- Astro components live in `src/components/`.
- Layouts live in `src/layouts/`.
- Pages live in `src/pages/`.
- Styles live in `src/styles/`.

## Required Practices

- Preserve basic HTML structure and page semantics unless the assigned task explicitly changes them.
- Preserve SEO and schema props flowing into `src/components/Head.astro`.
- Keep React surfaces read-only unless Alok explicitly assigns React work.
- Use existing Astro and CSS module patterns before adding new abstractions.
- Verify with `npm run build`; use browser verification for visual changes.

## Astro 6.x Notes (Current)

- Client routing uses `<ClientRouter />` from `astro:transitions/client` (migrated from `<ViewTransitions />`).
- Client router is isolated in `src/components/ClientRouterShim.astro` — import from there, not directly.
- Post-swap lifecycle events use `onPageSwap()` from `src/lib/page-events.ts` — do not use raw `addEventListener("astro:after-swap")` in new code.
- Dynamic collection routes use `entry.id` (not `entry.slug`) and `renderEntry()` from `src/lib/content-shims.ts`.
- Path aliases: use `@components/`, `@layouts/`, `@lib/`, `@styles/` — never bare `@*` wildcards (breaks Vite 7 dev server).

## Verified Test Gate

After frontend changes:
1. `npm run build` — must pass with 0 errors
2. `npx astro check` — 0 type errors
3. `npm run test:unit` — all 470+ tests must pass
4. `npm run test:regression` — baseline diff must pass
