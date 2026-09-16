/**
 * Cloudflare bindings accessor.
 *
 * Astro v6 (@astrojs/cloudflare v13) removed `Astro.locals.runtime.env`;
 * bindings and secrets are exposed through the `cloudflare:workers` module
 * instead. All server code reads bindings through this shim so call sites
 * stay insulated from adapter changes.
 */
import { env } from 'cloudflare:workers';

export function getEnv(): ENV {
  return env as ENV;
}
