# [Metoric Teachings](https://alokprateek.in) Source Code

This is the source code of Metoric Teachings, a personal blog and portfolio.

## Getting started

1. **Install dependencies**
  
   ```shell
   npm install
   ```

2. **Start developing.**
  
   ```shell
   gatsby develop
   ```

4. **Default structure:**

   ```bash
   .
   ├── public
   |   └──public-files            # => site wide config
   ├── src
   |   ├── content                # => content
   |   ├── components
   |   ├── config
   |   |   └──site.js             # => site wide config
   |   |   └── taxonomy.yml       # => taxonomy content
   |   ├── images
   |   ├── pages
   |   ├── layouts
   |   ├── styles
   |   └── lib
   ├── postcss.config.cjs
   ├── astro.config.mjs
   ```

### Posts and Pages

Posts are all Markdown files and should be placed in `src/content/` and filed under the appropriate category. Pages can be Markdown or `.js` files placed in `src/pages/`.

Front matter available for Markdown files.

|                  | Type     | Description | Example |
| ---------------- | -------- | ----------- | ------- |
| title            | string   | Page title. | `"How I use Jekyll to build sites"` |
| path             | string   | Page permalink. | `/category-name/file-name-slug/` |
| date             | datetime | Published date. | `2020-01-09` |
| last_modified_at | datetime | Updated date. | `2020-01-09T13:52:13-05:00` |
| excerpt          | string   | Page description used a teaser text in listings and SEO purposes. | `"This is a most excellent post about static site generators."` |
| image            | string   | Path to an image (relative to the Markdown file) used as a cover or teaser in listings and SEO purposes. | `../../images/post-image.jpeg` |
| categories       | array    | Categories to classify the post as. | `[articles]` |
| tags             | array    | Tags to classify the post as. | `[web development, GitHub, tutorial]` |
| toc              | boolean  | Display table of contents links. | `true` |
| hide_meta        | boolean  | Hide post meta data from page e.g. (date, read time, etc.) | `true` |
| comments         | boolean  | Display comments. Disabled by default. | `true` |
| comments_locked  | boolean  | Lock a comment threads discussion. | `true` |
| featured         | boolean  | Mark a post post/page as featured. | `true` |

### Markdown content

HTML recipes and such for styling custom bits of content used in Markdown files.

#### Figures

TODO: Migrate into a component. For now HTML in Markdown will suffice.

**Example:**

```html
<figure>
  <img src="../../images/image.jpeg" alt="">
  <figcaption><p>Figure caption goes here.</p></figcaption>
</figure>
```

**Two column rows:**

```html
<figure class="two-column">
  <img src="../../images/image-1.jpeg" alt="">
  <img src="../../images/image-2.jpeg" alt="">
  <figcaption><p>Figure caption goes here.</p></figcaption>
</figure>
```

**Three column rows:**

```html
<figure class="three-column">
  <img src="../../images/image-1.jpeg" alt="">
  <img src="../../images/image-2.jpeg" alt="">
  <img src="../../images/image-3.jpeg" alt="">
  <figcaption><p>Figure caption goes here.</p></figcaption>
</figure>
```

#### Notices

Call-out text via [gatsby-remark-custom-blocks](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-remark-custom-blocks) plugin with Markdown.

TBD

**Example:**

```markdown
[[notice | iOS screen recording]]
| Apple has built this feature directly into iOS allowing you to [capture the screen](https://support.apple.com/en-us/HT207935) directly on device.
```

#### Thumbnail gallery

TODO: Migrate into a component. For now HTML in Markdown will suffice.

**Example:**

```html
<ul class="gallery-thumbnails">
  <li>
    <a href="../../images/thumbnail-1.jpeg">
      <img src="../../images/image-1.jpeg" alt="">
    </a>
  </li>
  ...
</ul>
```

#### Browser frame

Wrap an image with the `.browser-frame` class to give it browser chrome styling.

**Example:**

```html
<div class="browser-frame">
  <img src="../../images/webpage.jpeg" alt="">
</div>
```

#### Button links

Style links to look like a button.

**Example:**

```html
<p>
  <a href="#" class="btn">Link label</a>
</p>
```

## Project Astro-Ascension

Project Astro-Ascension is the branch-isolated, multi-agent workflow for moving this Astro 4.15 site toward Astro 6.2 compatibility while preserving SEO, content, Cloudflare D1 behavior, and core HTML structure.

### Agent Roles

- Codex / GPT-5.5 is the Mechanic: heavy logic, wiring, Astro component changes, and structural updates.
- Claude Opus / Anti-Gravity is the Architect: architecture documentation, structural analysis, and repo evaluation.
- Gemini 3 Pro is the Marathoner: long-session reviews, broad audits, and sustained iterative improvements.
- Jules is the Observer & Maintainer: background maintenance, builds, tests, and site integrity verification.

During the first bootstrap run, all agents follow the Architect baseline: documentation, repository evaluation, and structural analysis only. No migrations, dependency upgrades, UI changes, or runtime logic changes happen until the baseline is reviewed.

### Branch Workflow

- Never commit directly to `main`.
- Use only these branch prefixes: `feature/`, `docs/`, `maintenance/`, and `Content/`.
- Work on a dedicated branch per task.
- Alok reviews and merges branches into `main`.
- Preserve SEO metadata, Cloudflare D1 bindings, and basic HTML structure unless a reviewed task explicitly changes them.
- Treat React components as read-only unless Alok explicitly assigns React work.

### Baseline Guardrails

- During the first-run bootstrap and Milestone 2 audit work, keep changes limited to documentation and task-tracking surfaces such as `docs/`, `README.md`, `ARCHITECTURE.md`, and the root agent task files.
- Do not change runtime Astro components, API handlers, migrations, dependencies, or deployment configuration until the reviewed upgrade plan says that slice is ready.
- Preserve `src/content/config.ts` in its current legacy `defineCollection` shape until the approved Content Layer migration branch exists.
- Preserve the `src/components/Head.astro` transition and analytics contract, especially the `astro:after-swap` listeners and the `window.checkAnalyticsConsent`, `window.trackEngagementEvent`, and `window.trackConversionEvent` globals.
- Preserve Cloudflare D1 invariants: binding `DB`, database name `meteoric`, database id `8380ec22-098e-4814-a56f-48d907425b35`, and `nodejs_compat`.

### Task Tracking

The repository uses five root task files:

- `central_milestones.md` tracks major milestones, why they matter, and how they split across agents.
- `claude_tasks.md` tracks Architect tasks.
- `codex_tasks.md` tracks Mechanic tasks.
- `gemini_tasks.md` tracks Marathoner tasks.
- `jules_tasks.md` tracks Observer & Maintainer tasks.

Granular execution tasks belong in agent-specific files, not in `central_milestones.md`.

### Skills Directory

The root `skills/` directory codifies standard operating procedures for recurring work:

- `documentation.md`
- `content_edition.md`
- `frontend_changes.md`
- `backend_changes.md`
- `database_management.md`
- `deployment.md`
- `test_and_build_verification.md`

For implementation-sensitive Astro 6 work, start from these companion docs:

- `docs/astro_6_2_upgrade_plan.md`
- `docs/astro_6_2_risk_inventory.md`
- `docs/astro_6_2_implementation_audit.md`
- `docs/d1_api_contract.md`

### Astro 6.2 Planning Guardrail

The current project uses Astro `^4.15.12` and legacy-style content collections in `src/content/config.ts`. Astro 6.2 compatibility work must be phased. Do not proactively migrate existing collections to the Astro 5+ loader pattern during baseline setup. First audit breaking changes, document the compatibility path, and preserve current collection behavior until a reviewed migration branch exists.
