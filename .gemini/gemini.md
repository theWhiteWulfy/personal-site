This project is a personal website built with Astro, a modern static site generator. The content is managed through markdown/MDX files and organized into collections.

**Key Technologies:**
- **Astro:** The core framework for building the site.
- **TypeScript:** For type safety.
- **MDX:** For writing content with components.
- **Cloudflare Pages:** For deployment.

**Project Structure:**
- `src/content/`: Contains the content collections, defined in `src/content/config.ts`. Each sub-directory is a collection (e.g., `articles`, `notes`).
- `src/layouts/`: Defines the overall page structure. `Layout.astro` is the main layout.
- `src/components/`: Reusable Astro components.
- `src/pages/`: Defines the routes for the site.
- `astro.config.mjs`: The main configuration file for Astro.
- `package.json`: Lists the project dependencies and scripts.

**Developer Workflows:**
- **Development:** Run `npm run dev` to start the local development server.
- **Build:** Run `npm run build` to build the site for production.
- **Preview:** Run `npm run preview` to preview the built site locally.
- **Deployment:** The site is deployed to Cloudflare Pages. The configuration is in `wrangler.toml`.

**Content Management:**
- Content is organized into collections, defined in `src/content/config.ts`.
- Each collection has a specific schema, which defines the structure of the content.
- To create a new post, add a new markdown/MDX file to the appropriate collection directory.

**Styling:**
- The site uses a combination of global CSS, CSS modules, and PostCSS.
- Global styles are in `src/styles/global.css`.
- CSS modules are used for component-level styling (e.g., `src/styles/layout.module.css`).
- PostCSS is configured in `postcss.config.cjs`.

**Customization:**
- The site configuration is in `src/config/site.js`.
- The main menu and footer menu are defined in `src/config/site.js`.
- The color scheme and other design tokens are in `src/styles/variables.modules.css`.
