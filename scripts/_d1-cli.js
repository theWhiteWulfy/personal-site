import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function isLocal() {
    return process.argv.includes('--local');
}

export function getScriptsDir() {
    return __dirname;
}

export function getSqlFiles() {
    const scriptsDir = getScriptsDir();
    return fs.readdirSync(scriptsDir)
        .filter(file => file.endsWith('.sql'))
        .sort()
        .map(file => path.join(scriptsDir, file));
}

export function runWranglerCommand(command, local) {
    const localFlag = local ? '--local' : '--remote';
    const fullCommand = `npx wrangler d1 ${command} ${localFlag}`;
    try {
        const output = execSync(fullCommand, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
        return { success: true, output };
    } catch (error) {
        return { success: false, output: error.stdout, error: error.stderr || error.message };
    }
}

export function executeSqlFile(filePath, local) {
    const relativePath = path.relative(process.cwd(), filePath);
    console.log(`Executing ${relativePath}...`);
    return runWranglerCommand(`execute meteoric --file "${filePath}"`, local);
}

export function queryDatabase(sql, local) {
    const escapedSql = sql.replace(/"/g, '\\"');
    const result = runWranglerCommand(`execute meteoric --command "${escapedSql}" --json`, local);
    
    if (!result.success) {
        return { success: false, error: result.error };
    }

    try {
        // wrangler outputs might contain some non-json logs before the json array, so we try to extract the array
        const output = result.output;
        const jsonStart = output.indexOf('[');
        const jsonEnd = output.lastIndexOf(']');
        if (jsonStart !== -1 && jsonEnd !== -1) {
            const jsonStr = output.slice(jsonStart, jsonEnd + 1);
            const parsed = JSON.parse(jsonStr);
            return { success: true, results: parsed[0]?.results || [] };
        }
        return { success: false, error: 'Failed to parse JSON output' };
    } catch (e) {
        return { success: false, error: 'Failed to parse JSON output: ' + e.message };
    }
}
