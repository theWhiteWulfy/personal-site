/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />


type D1Database = import("@cloudflare/workers-types").D1Database;
type R2Bucket = import("@cloudflare/workers-types").R2Bucket;
type ENV = {
    DB: D1Database;
    RESOURCES_BUCKET: R2Bucket;
    RESOURCE_SIGNING_SECRET?: string;
    ADMIN_API_KEY?: string;
};

// use a default runtime configuration (advanced mode).
type Runtime = import("@astrojs/cloudflare").Runtime<ENV>;
declare namespace App {
    interface Locals extends Runtime { }
}
