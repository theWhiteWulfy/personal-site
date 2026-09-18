/**
 * Resource allowlist and metadata registry
 *
 * Single source of truth for downloadable resources. Every resource served by
 * /api/serve-resource must be registered here; the object key is the public
 * resource identifier used in forms, tokens and the `resource` query parameter,
 * and `filename` is the R2 object key inside the RESOURCES_BUCKET bucket.
 */

export interface ResourceMeta {
  /** R2 object key inside the RESOURCES_BUCKET bucket */
  filename: string;
  /** Human-readable name (not exposed in responses, used for logs) */
  displayName: string;
  /** MIME type served in the Content-Type header */
  contentType: string;
  /** Maximum download attempts per token */
  maxDownloads: number;
}

export const RESOURCES = {
  'automation-guide': {
    filename: 'automation-guide.pdf',
    displayName: 'Complete Automation Guide',
    contentType: 'application/pdf',
    maxDownloads: 3,
  },
  'whitelabel-checklist': {
    filename: 'whitelabel-checklist.pdf',
    displayName: 'Whitelabel Solutions Checklist',
    contentType: 'application/pdf',
    maxDownloads: 3,
  },
  'ai-integration-playbook': {
    filename: 'ai-integration-playbook.pdf',
    displayName: 'AI Integration Playbook',
    contentType: 'application/pdf',
    maxDownloads: 3,
  },
} as const satisfies Record<string, ResourceMeta>;

/** Union of valid resource identifiers */
export type ResourceId = keyof typeof RESOURCES;

/**
 * Runtime allowlist check for a resource identifier
 */
export function isValidResource(name: string): name is ResourceId {
  return Object.prototype.hasOwnProperty.call(RESOURCES, name);
}
