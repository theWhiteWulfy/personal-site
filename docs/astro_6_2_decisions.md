# Astro 6.2 Decision Log

**Status**: Living document. Maintained by Claude (Architect) throughout Milestone 5.  
**Purpose**: ADR-style log of every architecture decision reviewed and acted on during the Astro 6.2 upgrade. Each entry records the decision context, options considered, the choice made, the branch it landed in, the date, and the outcome. Pre-upgrade decisions requiring Alok's approval are listed in §1 with their current status.  
**Companion**: [`docs/astro_6_2_upgrade_plan.md`](./astro_6_2_upgrade_plan.md) §4 — full options and recommendations for each pre-upgrade decision.

---

## 1. Pre-Upgrade Decisions Pending Alok's Approval

These eight decisions are described in the upgrade plan §4 with options and recommendations. **No Codex branch may act on a pending decision.** Alok must record a choice before the relevant phase begins.

| # | Decision | Relevant Phase | Status | Alok's Choice |
|---|---|---|---|---|
| D-01 | Keep `<ClientRouter />` or remove client-side routing? | Phase 2/3 | ⏳ **Pending** | — |
| D-02 | Accept `@astrojs/cloudflare` v13 in lockstep with Astro 6? | Phase 2 | ⏳ **Pending** | — |
| D-03 | Use `legacy.collectionsBackwardsCompat` through Phase 4, then drop in Phase 5? | Phase 2 | ⏳ **Pending** | — |
| D-04 | `albums` collection loader: `glob(**/*.yaml)` or per-file `file()`? | Phase 5 | ⏳ **Pending** | — |
| D-05 | PWA strategy: keep `vite-plugin-pwa`, swap to `@vite-pwa/astro`, or drop PWA? | Phase 2 | ⏳ **Pending** | — |
| D-06 | CSRF default flip: accept `security.checkOrigin: true` (new Astro 5 default)? | Phase 2 | ⏳ **Pending** | — |
| D-07 | Remove `output: "hybrid"` and rely on default static + per-route `prerender = false`? | Phase 2 | ⏳ **Pending** | — |
| D-08 | Defer cleanup of legacy `staticmanApi` and Gatsby-era references to a separate branch? | Post-upgrade | ⏳ **Pending** | — |

**How to record a decision**: update the row's `Status` to ✅ **Approved** and fill in `Alok's Choice` with the option letter (A, B, C) from the upgrade plan. Then add a full ADR entry in §2.

---

## 2. Decision Log Entries

*No entries yet. Entries are added as each Codex implementation phase completes and Alok reviews.*

---

### Entry template

```
### ADR-NNN: <Decision title>

**Date**: YYYY-MM-DD  
**Branch**: `<branch-name>`  
**Phase**: Phase N  
**Status**: ✅ Implemented | ⚠️ Deferred | ❌ Reversed

**Context**: 1–2 sentences describing the situation that forced this decision.

**Decision**: Which option was chosen and why.

**Consequences**:
- What changed in the codebase.
- Any follow-up tasks created.
- Any risks introduced or mitigated.

**Verification**: What Jules confirmed (build green / tests passing / diff clean).
```

---

## 3. Upgrade Phase Status

Codex updates this section as each phase is started, merged, or abandoned.

| Phase | Branch | Status | Start date | Merge date | Notes |
|---|---|---|---|---|---|
| Phase 1 — Dependency dry-run | `chore/astro-6-2-dry-run` | ⏳ Not started | — | — | Throwaway branch; captures error log only |
| Phase 2 — Version bumps + legacy compat | `chore/astro-6-bump-with-legacy-compat` | ⏳ Not started | — | — | Requires D-01 through D-08 approved |
| Phase 3 — `<ClientRouter />` verification | `chore/astro-6-client-router-verification` | ⏳ Not started | — | — | Requires Phase 2 merged |
| Phase 4 — `entry.slug` / `entry.render()` audit | `chore/astro-6-collection-api-audit` | ⏳ Not started | — | — | Requires Phase 3 merged |
| Phase 5 — Content Layer loader migration | `feat/astro-6-content-layer-loaders` | ⏳ Not started | — | — | Optional; requires Phase 4 merged |

---

## 4. `ARCHITECTURE.md` Update Log

Claude updates `ARCHITECTURE.md` after each Codex phase merges. This section tracks which sections were updated and when.

| Phase | Section(s) updated | Date | Summary of change |
|---|---|---|---|
| — | — | — | *No updates yet. Pre-upgrade state documented in Milestone 1.* |

After Phase 2 merges, the following sections must be updated in `ARCHITECTURE.md`:
- **Runtime Shape**: bump Astro version, adapter version, remove `output: "hybrid"`.
- **Content Collections**: note `legacy.collectionsBackwardsCompat: true` is active.
- **Head Component**: note `<ClientRouter />` is now in use.
- **Dependencies**: update all version numbers.
- **Upgrade Risks**: mark resolved items from the First-Run Findings.

After Phase 4 merges:
- **Collection Usage Patterns**: change `entry.slug → entry.id`, `entry.render() → render(entry)`.
- **RSS Feed**: change link template to `/${item.collection}/${item.id}/`.

After Phase 5 merges:
- **Content Collections**: document Content Layer loader shape; note compat flag removed.
- **First-Run Findings**: close the Astro upgrade risk items.

---

## 5. First-Run Findings Resolution Tracker

Tracks the original eight First-Run Findings from `ARCHITECTURE.md`. Updated after each Codex phase as findings are resolved, transferred, or restated.

| Finding | Original description | Status | Resolution |
|---|---|---|---|
| F-1 | Missing `scripts/migrate-database.js` and `scripts/verify-database.js` | ⏳ Open | Spec documented in `docs/d1_api_contract.md` §5.2. Codex implements when authorized. |
| F-2 | Missing D1 table migrations for `newsletter` and `leads` tables | ⏳ Open | Spec documented in `docs/d1_api_contract.md` §5.1. Codex creates SQL; Jules verifies. |
| F-3 | Empty `src/utils/` directory | ⏳ Open | No action required unless a utility is added during upgrade. |
| F-4 | Legacy Staticman API reference | ⏳ Open | Decision D-08: defer to `chore/legacy-cleanup` branch post-upgrade. |
| F-5 | Empty reCAPTCHA keys | ⏳ Open | No active code paths use them. Defer cleanup to D-08 branch. |
| F-6 | README references `gatsby develop` | ⏳ Open | Defer cleanup to D-08 branch. |
| F-7 | Duplicate taxonomy entries | ⏳ Open | Low priority; no functional impact. Defer to `chore/legacy-cleanup`. |
| F-8 | `PERFORMANCE_CONFIG` lists unused Google Fonts domains | ⏳ Open | Non-functional; `Head.astro` already excludes them. Defer to D-08 branch. |

Additional findings from Milestone 3:

| Finding | Description | Status |
|---|---|---|
| F-9 | Hardcoded signing secret in `serve-resource.ts` | ⏳ Open | Move to Cloudflare Worker secret when authorized. |
| F-10 | No dedicated campaign signups table | ⏳ Open | Tracked in `docs/d1_api_contract.md` §5.3. |
| F-11 | Unauthenticated admin endpoints (campaigns CRUD, download stats, visit records) | ⏳ Open | Authentication strategy needs Alok input before implementation. |

---

## 6. End-of-Upgrade Checklist

When Phase 5 merges, Claude performs these final steps before closing Milestone 5:

- [ ] Verify all 8 pre-upgrade decisions (D-01 through D-08) are recorded as ✅ Implemented or ⚠️ Deferred.
- [ ] Verify all five phase rows in §3 are ✅ Merged (or ⚠️ Deferred for Phase 5).
- [ ] Update `ARCHITECTURE.md` §Runtime Shape with final Astro/adapter/Vite versions.
- [ ] Update `ARCHITECTURE.md` §First-Run Findings to reflect resolved items.
- [ ] Update `central_milestones.md` to mark Milestone 5 complete at milestone granularity only.
- [ ] Confirm `legacy.collectionsBackwardsCompat` is removed from `astro.config.mjs` (Phase 5).
- [ ] Confirm `<ViewTransitions />` import no longer exists anywhere in the codebase.
- [ ] Confirm `entry.slug` does not appear in any `src/pages/` file.
- [ ] Confirm `entry.render()` does not appear in any `src/pages/` file.
