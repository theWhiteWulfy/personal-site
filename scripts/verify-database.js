import { isLocal, queryDatabase } from './_d1-cli.js';

const REQUIRED_TABLES = [
    'resource_downloads',
    'analytics_events',
    'campaigns',
    'campaign_visits',
    'newsletter',
    'leads'
];

function main() {
    const local = isLocal();
    console.log(`Verifying ${local ? 'local' : 'remote'} database schema...\n`);

    const tablesResult = queryDatabase("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE 'd1_%'", local);

    if (!tablesResult.success) {
        console.error('Failed to query tables:', tablesResult.error);
        process.exit(1);
    }

    const existingTables = new Map(tablesResult.results.map(row => [row.name, row.sql]));
    let missingTables = false;

    for (const table of REQUIRED_TABLES) {
        if (existingTables.has(table)) {
            console.log(`[OK] Table: ${table}`);
            console.log(`     Schema: ${existingTables.get(table)}`);
            
            // Print indexes
            const indexResult = queryDatabase(`PRAGMA index_list("${table}")`, local);
            if (indexResult.success && indexResult.results.length > 0) {
                const indexNames = indexResult.results.map(idx => idx.name).join(', ');
                console.log(`     Indexes: ${indexNames}`);
            } else if (indexResult.success) {
                console.log(`     Indexes: (None)`);
            } else {
                console.log(`     Indexes: Failed to fetch - ${indexResult.error}`);
            }
            console.log('');
        } else {
            console.error(`[FAIL] Table: ${table} (MISSING)`);
            missingTables = true;
        }
    }

    if (missingTables) {
        console.error('\nVerification failed: One or more required tables are missing.');
        process.exit(1);
    }

    console.log('\nAll required tables are present. Verification successful.');
    process.exit(0);
}

main();
