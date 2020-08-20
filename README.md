# [Metoric Teachings](https://alokprateek.in) Source Code

This is the source code of Metoric Teachings, a personal blog and portfolio built
with [Gatsby](https://www.gatsbyjs.org/), [Travis CI](https://travis-ci.org/),  and [Netlify](https://www.netlify.com/).

[![Netlify Status](https://api.netlify.com/api/v1/badges/e57b82b2-6e03-4991-9235-65db79341a3d/deploy-status)](https://app.netlify.com/sites/thewhitewulfy/deploys)

## Getting started

1. **Install dependencies**
  
   ```shell
   yarn install
   ```

2. **Add `.env` file to the root with your GitHub API token.**

   ```env
   GITHUB_API_TOKEN=yourPersonalGitHubApiToken
   ```

   **Note:** do not commit this file. Builds will fail with a `TypeError: Cannot read property 'match' of undefined` since GitHub repo listing on `/pages/works.js` can't resolve the GraphQL query.

3. **Start developing.**
  
   ```shell
   gatsby develop
   ```

   **Note:** When developing on Windows prepend all Gatsby commands with `dotenv` to load environment variables. e.g. `dotenv gatsby build`

4. **Default structure:**

   ```bash
   .
   ├── config
   |   └──site.js             # => site wide config
   ├── src
   |   ├── comments           # => comments content
   |   ├── components
   |   ├── data
   |   |   └── taxonomy.yml   # => taxonomy content
   |   ├── images
   |   ├── pages
   |   ├── posts
   |   ├── styles
   |   ├── templates
   |   └── html.js
   ├── .travis.yml
   ├── gatsby-browser.js
   ├── gatsby-config.js
   ├── gatsby.node.js
   └── staticman.yml
   ```

### Posts and Pages

Posts are all Markdown files and should be placed in `src/posts/` and filed under the appropriate category. Pages can be Markdown or `.js` files placed in `src/pages/`.

```bash
.
├── src
|   ├── posts
|   |   ├── category-name-1
|   |   |   └── filename-slug.md
|   |   ├── category-name-2
|   |   |   └── another-filename-slug.md
```

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

### Taxonomy Data File

`src/data/taxonomy.yml` file contains key/value pairs for all categories and tags used across the site. This file is useful for adding custom content to be used on category and tag pages.

|         | Type   | Description                                   |
| ------- | ------ | --------------------------------------------- |
| id      | string | Value used in `tags` and `categories` arrays. |
| name    | string | Display name.                                 |
| excerpt | string | Plain text description.                       |
| html    | string | HTML description.                             |

**Example:**

```yaml
- id: work
  name: Works
  excerpt: A selection of things I’ve designed, illustrated, and developed.
  html: |
    <p>A selection of things I’ve designed, illustrated, and developed.</p>
```

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

---

## License

Copyright (c) 2004-2020 Alok Prateek

Metoric Teachings incorporates photographs from [Unsplash](https://unsplash.com).
