// Type imports
import type { ManifestOptions } from "vite-plugin-pwa"
import site from "./site"

/**
 * Defines the configuration for PWA webmanifest.
 */
export const manifest: Partial<ManifestOptions> = {
	name: site.title, 
	short_name: site.shortName, 
	description: site.description,
	theme_color: site.themeColor,
	background_color: site.backgroundColor,
	display: "minimal-ui",
	icons: [
        {
            "src": "/favicons/favicon-72x72.png",
            "type": "image/png",
            "sizes": "72x72",
            "purpose": "any maskable"
          },
          {
            "src": "/favicons/favicon-96x96.png",
            "type": "image/png",
            "sizes": "96x96",
            "purpose": "any maskable"
          },
          {
            "src": "/favicons/favicon-128x128.png",
            "type": "image/png",
            "sizes": "128x128",
            "purpose": "any maskable"
          },
          {
            "src": "/favicons/favicon-144x144.png",
            "type": "image/png",
            "sizes": "144x144",
            "purpose": "any maskable"
          },
          {
            "src": "/favicons/favicon-152x152.png",
            "type": "image/png",
            "sizes": "152x152",
            "purpose": "any maskable"
          },
          {
            "src": "/favicons/favicon-192x192.png",
            "type": "image/png",
            "sizes": "192x192",
            "purpose": "any maskable"
          },
          {
            "src": "/favicons/favicon-384x384.png",
            "type": "image/png",
            "sizes": "384x384",
            "purpose": "any maskable"
          },
          {
            "src": "/favicons/favicon-512x512.png",
            "type": "image/png",
            "sizes": "512x512",
            "purpose": "any maskable"
          }
	]
}