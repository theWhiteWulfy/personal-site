/**
 * Mock for the `cloudflare:workers` module.
 *
 * Vitest aliases `cloudflare:workers` to this file (see vitest.config.ts)
 * because the real module only exists inside workerd. The real module's
 * `env` is the worker's bindings object; tests seed this mock through
 * `createMockAPIContext` / `setMockCloudflareEnv` and the global setup
 * resets it after every test.
 */

export const env: Record<string, any> = {};

/**
 * Replace the mock bindings wholesale.
 */
export function setMockCloudflareEnv(values: Record<string, any>): void {
  for (const key of Object.keys(env)) delete env[key];
  Object.assign(env, values);
}

/**
 * Remove all mock bindings (used by the global afterEach reset).
 */
export function resetMockCloudflareEnv(): void {
  for (const key of Object.keys(env)) delete env[key];
}
