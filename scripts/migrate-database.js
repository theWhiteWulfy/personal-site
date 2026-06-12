import { isLocal, getSqlFiles, executeSqlFile } from './_d1-cli.js';

function main() {
    const local = isLocal();
    const files = getSqlFiles();

    if (files.length === 0) {
        console.log('No SQL files found to migrate.');
        process.exit(0);
    }

    console.log(`Starting migrations against ${local ? 'local' : 'remote'} database...`);

    for (const file of files) {
        const result = executeSqlFile(file, local);
        if (!result.success) {
            console.error(`\nMigration failed on ${file}!`);
            console.error('Error details:');
            console.error(result.error);
            process.exit(1);
        }
        console.log(`Successfully migrated ${file}`);
    }

    console.log('\nAll migrations completed successfully.');
    process.exit(0);
}

main();
