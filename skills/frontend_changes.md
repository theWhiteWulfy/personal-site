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

## Astro 6.2 Notes

- Plan the future `<ViewTransitions />` to `<ClientRouter />` change separately from the documentation bootstrap.
- Do not combine visual refactors with framework upgrade work unless the branch is explicitly scoped that way.
