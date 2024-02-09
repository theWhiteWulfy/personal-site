This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.


## Changes

- Added actions, assets, components, helpers under src.
- added content folder to the root
- added sass, framer-motion, validator and next-pwa
- moved files from gatsby static folder to next public folder
- copied all css files as is to styles, since I was already using css modules
- added sitemapconfig.js in root
- created API call utils and cookie utils in actions
- created api call and cookie use template
- added helpers for dom manipulation, time, local storage, validation  and other reuseable functions
- moved content to /content folder
- moved all components to components folder
