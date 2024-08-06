/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />


type D1Database = import("@cloudflare/workers-types").D1Database;
type ENV = {
    DB: D1Database;
};

// use a default runtime configuration (advanced mode).
type Runtime = import("@astrojs/cloudflare").Runtime<ENV>;
declare namespace App {
    interface Locals extends Runtime { }
}
