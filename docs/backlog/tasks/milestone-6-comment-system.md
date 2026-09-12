# Milestone 6 — Comment System with Cloudflare D1

**Branch**: `feat/comment-system-d1`  
**Base from**: `complete_astro_v6_migration` (after M5 Astro 7 migration merged)  
**Priority**: 🟡 Post-Astro7 | **Estimated effort**: 2–3 weeks  
**Status**: ⏳ Blocked on Milestone 5 completion + TASK-6A (captcha provider decision)

---

## Architecture Summary (from ADR-003, ADR-004)

- **Backend**: Cloudflare D1 (existing database, already integrated)
- **Rendering**: API endpoints use `prerender = false`; content pages remain static
- **Anti-spam**: Captcha (provider chosen in TASK-6A) + database-backed moderation
- **Moderation**: Admin-key protected endpoints (from M1 pattern)
- **IndieWeb**: `h-cite` microformats, `comments_locked` frontmatter respected
- **Webmentions**: Merged with comment feed in display

---

## Prerequisites

- [ ] Milestone 5 (Astro 7) merged and working
- [ ] **TASK-6A** in `HUMAN_TASKS.md`: Captcha provider chosen and keys stored
- [ ] Admin API key from M1 (TASK-1B) available for moderation endpoints

---

## Git Setup

```bash
git checkout complete_astro_v6_migration  # or new main after M5
git pull
git checkout -b feat/comment-system-d1
```

---

## Sub-Tasks

### 6.1 — Database migration: create comments table
**Commit**: `feat(comments): add D1 migration 006_create_comments_table`  
**Files**: `scripts/006_create_comments_table.sql` (new)

```sql
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  content_id TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('article', 'note', 'work', 'bibliophile', 'saasguide')),
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  author_url TEXT,
  author_ip TEXT,
  content TEXT NOT NULL,
  content_html TEXT,
  approved INTEGER NOT NULL DEFAULT 0,
  spam INTEGER NOT NULL DEFAULT 0,
  spam_score REAL,
  source TEXT NOT NULL DEFAULT 'direct' CHECK (source IN ('direct', 'webmention', 'backfeed')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_comments_content ON comments(content_id, content_type, approved);
CREATE INDEX idx_comments_pending ON comments(approved, spam, created_at);
CREATE INDEX idx_comments_email ON comments(author_email);
```

- [ ] Create the SQL file
- [ ] Run locally: `npm run db:migrate:local`
- [ ] Verify table exists with correct schema

---

### 6.2 — Add comment database helpers to `database.ts`
**Commit**: `feat(comments): add comment query helpers to database utility`  
**Files**: `src/lib/api/database.ts`

- [ ] `getApprovedComments(contentId: string, contentType: string, db: D1Database)`
- [ ] `getPendingComments(db: D1Database)` — admin only
- [ ] `insertComment(data: CommentInsert, db: D1Database): Promise<string>` — returns new comment ID
- [ ] `approveComment(id: string, db: D1Database)`
- [ ] `rejectComment(id: string, db: D1Database)` — sets `spam = 1`
- [ ] `deleteComment(id: string, db: D1Database)`

---

### 6.3 — Build `GET/POST /api/comments` endpoint
**Commit**: `feat(comments): add comments API endpoint`  
**Files**: `src/pages/api/comments.ts` (new)

```ts
export const prerender = false;
```

**GET** — fetch approved comments for a page (public):
```ts
// ?contentId=<id>&contentType=<type>
// Returns: { comments: Comment[] }
```

**POST** — submit a new comment (public, captcha protected):
```ts
// Body: { contentId, contentType, authorName, authorEmail, authorUrl?, content, captchaToken }
// Validates: captcha, input sanitization, rate limiting by IP
// Stores: with approved=0 (pending moderation)
// Returns: 202 Accepted
```

**PUT** — moderate a comment (admin only, requires ADMIN_API_KEY):
```ts
// Body: { id, action: 'approve' | 'reject' | 'delete' }
// Returns: 200 OK
```

- [ ] Implement all three handlers
- [ ] Import `requireAdminAuth` from `@lib/api/auth` for PUT handler
- [ ] Import `sanitize-html` (already in deps) for comment content sanitization
- [ ] Wire captcha verification using provider from TASK-6A
- [ ] Add basic rate limiting by IP (check recent submissions from same IP)

---

### 6.4 — Activate existing `generateCaptcha`/`verifyCaptcha` from `security.ts`
**Commit**: `feat(comments): wire captcha verification into comment submission`  
**Files**: `src/lib/api/security.ts`, `src/pages/api/comments.ts`

- [ ] Update `verifyCaptcha()` in `security.ts` to call the chosen captcha provider's verify endpoint
- [ ] Wire it into the comment POST handler
- [ ] For hCaptcha: `POST https://api.hcaptcha.com/siteverify`
- [ ] For Turnstile: `POST https://challenges.cloudflare.com/turnstile/v0/siteverify`
- [ ] For reCAPTCHA v3: `POST https://www.google.com/recaptcha/api/siteverify`

---

### 6.5 — Build `CommentForm.astro` component
**Commit**: `feat(comments): add comment submission form component`  
**Files**: `src/components/CommentForm.astro` (new)

- [ ] Form fields: `author_name` (required), `author_email` (required, not displayed), `author_url` (optional), `content` (required, min 10 chars)
- [ ] Hidden fields: `contentId`, `contentType`
- [ ] Captcha widget embed (provider-specific)
- [ ] Submit via `fetch()` to `POST /api/comments`
- [ ] Show success state: "Your comment is awaiting moderation"
- [ ] Show error states: captcha fail, validation fail, rate limit
- [ ] Accessible: proper label/input associations, error announcements

---

### 6.6 — Build `CommentList.astro` component
**Commit**: `feat(comments): add comment list display component`  
**Files**: `src/components/CommentList.astro` (new)

- [ ] Fetch from `GET /api/comments?contentId=<id>&contentType=<type>` at render time
- [ ] If `prerender = false` page: live data on each request
- [ ] If static page: build-time fetch (comments won't update without rebuild — acceptable initially)
- [ ] Each comment rendered with `h-cite` microformats:
  ```html
  <li class="h-cite">
    <span class="p-author h-card">
      <a class="p-name u-url" href={author_url}>{author_name}</a>
    </span>
    <time class="dt-published" datetime={created_at}>{formatted_date}</time>
    <div class="e-content">{sanitized_content}</div>
  </li>
  ```
- [ ] Webmention entries (from `WebmentionDisplay`) merged into the same list with source attribution
- [ ] Sort all comments + webmentions chronologically

---

### 6.7 — Build `Comments.astro` wrapper component
**Commit**: `feat(comments): add Comments.astro wrapper combining form and list`  
**Files**: `src/components/Comments.astro` (new)

- [ ] Accepts props: `{ contentId: string; contentType: string; locked?: boolean }`
- [ ] If `locked === true`: show comment list, hide form, show "Comments are closed" notice
- [ ] If `locked === false` or undefined: show both form and list

---

### 6.8 — Integrate into content page layouts
**Commit**: `feat(comments): integrate comment section into content page templates`  
**Files**:
- `src/pages/articles/[...id].astro`
- `src/pages/notes/[...id].astro`
- `src/pages/bibliophilediaries/[...id].astro`
- `src/pages/works/[...id].astro`

For each:
- [ ] Import `Comments` component
- [ ] After content body, conditionally render:
  ```astro
  {post.data.comments && (
    <Comments
      contentId={post.id}
      contentType="article"
      locked={post.data.comments_locked ?? false}
    />
  )}
  ```
- [ ] Verify: posts with `comments: true` show the section; posts with `comments: false` don't

---

### 6.9 — Admin moderation: simple endpoint test
**Commit**: `test(comments): manual moderation flow verified`  
**Files**: `docs/backlog/tasks/milestone-6-comment-system.md` (update results)

- [ ] Submit a test comment via form
- [ ] Verify comment appears in D1 with `approved=0`
- [ ] `PUT /api/comments` with admin key → approve comment
- [ ] Verify comment appears on page
- [ ] `PUT /api/comments` with admin key → reject comment
- [ ] Verify comment is removed from display

---

### 6.10 — Run production D1 migration
**Commit**: `chore(comments): apply comments table migration to production D1`  
**Files**: `scripts/006_create_comments_table.sql`

```bash
npm run db:migrate
```

- [ ] Migration applied to production D1 database
- [ ] Verify via `npm run db:verify`

---

## PR Checklist

Before merging to `complete_astro_v6_migration`:

- [ ] Build passes
- [ ] `GET /api/comments` returns approved comments as JSON
- [ ] `POST /api/comments` stores comment with `approved=0`, captcha verified
- [ ] `PUT /api/comments` (approve/reject/delete) requires admin key
- [ ] Comment form submits and shows "awaiting moderation"
- [ ] Content pages with `comments: true` show comment section
- [ ] Content pages with `comments: false` do NOT show section
- [ ] `comments_locked: true` shows list but hides form
- [ ] h-cite microformats present on each comment
- [ ] Webmentions and direct comments displayed in same feed
- [ ] Production D1 migration applied
- [ ] All 6.x commits on branch `feat/comment-system-d1`
- [ ] PR opened: `feat/comment-system-d1` → `complete_astro_v6_migration`
