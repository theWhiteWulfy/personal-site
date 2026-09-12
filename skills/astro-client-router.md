# Astro Client Router SOP

Use this guide when working with client-side navigation, page transitions, and post-swap event lifecycle in Astro 6.

## Overview

The site uses `<ClientRouter />` from `astro:transitions/client` (replaced `<ViewTransitions />` from Astro 4). The router is isolated in `src/components/ClientRouterShim.astro` to prevent import churn if the API changes again.

## Using the Client Router

### In layouts

```astro
---
// src/layouts/Layout.astro
import ClientRouterShim from "@components/ClientRouterShim.astro";
---
<head>
  <ClientRouterShim />
</head>
```

Do not import `<ClientRouter />` directly in layouts or pages — always use the shim.

### Page swap lifecycle

Use `onPageSwap()` from `src/lib/page-events.ts` to register callbacks after navigation:

```typescript
import { onPageSwap } from "@lib/page-events";

// Register once — automatically re-runs after every client navigation
const unsubscribe = onPageSwap(() => {
  // Re-attach event listeners, re-initialize UI components, etc.
  initCopyCodeButtons();
  rebindAnalyticsTracking();
});

// To unsubscribe (e.g. on component teardown):
unsubscribe();
```

### Raw event (avoid in new code)

```typescript
// Avoid — use onPageSwap() instead
document.addEventListener("astro:after-swap", () => { ... });
```

## Event Lifecycle Order

On each client navigation:
1. `astro:before-preparation` — navigation starts
2. `astro:after-preparation` — new page content fetched
3. `astro:before-swap` — DOM swap about to happen
4. `astro:after-swap` — DOM swapped, old page gone ← **this is where onPageSwap fires**
5. `astro:page-load` — new page fully loaded

## Currently Registered Swap Handlers (7 systems)

| System | Location | Registered via |
|---|---|---|
| Analytics consent | `src/components/Head.astro` | `onPageSwap` |
| Analytics tracking | `src/components/Head.astro` | `onPageSwap` |
| UTM tracking | `src/components/Head.astro` | `onPageSwap` |
| Copy-code buttons | `src/components/Head.astro` | `onPageSwap` |
| Campaign CTA | `src/components/Head.astro` | `onPageSwap` |
| Campaign hero | `src/components/Head.astro` | `onPageSwap` |
| Resource form | `src/components/Head.astro` | `onPageSwap` |

## Rules

- Always use `onPageSwap()` for new post-navigation registration — not raw `astro:after-swap`.
- Never import `<ClientRouter />` outside `ClientRouterShim.astro`.
- Verify all 7 swap handlers still fire after any change to `Head.astro` or page-events lifecycle.

## Verification

```shell
npm run test:unit    # Tests include page-events-adversarial and page-events-ssr suites
npm run build        # Check for type errors in shim imports
```
