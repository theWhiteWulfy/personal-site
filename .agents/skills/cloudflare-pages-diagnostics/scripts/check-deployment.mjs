#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';

const configFile = path.join(
  process.env.USERPROFILE || process.env.HOME,
  'AppData', 'Roaming', 'xdg.config', '.wrangler', 'config', 'default.toml'
);

if (!fs.existsSync(configFile)) {
  console.error(`Wrangler config not found at: ${configFile}`);
  process.exit(1);
}

const content = fs.readFileSync(configFile, 'utf8');
const match = content.match(/oauth_token\s*=\s*"([^"]+)"/);
if (!match) {
  console.error('No oauth_token found in default.toml');
  process.exit(1);
}
const token = match[1];
const accountId = 'e40e4ff5055e9ab9bceec75e853fb29c';
const projectName = 'meteoricteachings';

function apiRequest(method, endpoint, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = https.request('https://api.cloudflare.com/client/v4' + endpoint, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'wrangler/custom',
        ...(payload ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } : {})
      }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode === 401) {
            console.error('API Error [401]: Authentication error. The Wrangler OAuth token may be expired. Run "npx wrangler whoami" to refresh it.');
          } else if (res.statusCode >= 400 || !parsed.success) {
            console.error(`API Error [${res.statusCode}]:`, parsed.errors || parsed);
          }
          resolve(parsed);
        } catch {
          resolve(data);
        }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'status';

  if (command === 'status' || command === 'info') {
    const project = await apiRequest('GET', `/accounts/${accountId}/pages/projects/${projectName}`);
    console.log('Project:', projectName);
    console.log('Build config:', project.result?.build_config);
    console.log('Preview branch includes:', project.result?.source?.config?.preview_branch_includes || project.result?.preview_branch_includes);
    console.log('Canonical deployment:', project.result?.canonical_deployment?.id);

    const deps = await apiRequest('GET', `/accounts/${accountId}/pages/projects/${projectName}/deployments`);
    console.log('\nRecent Deployments:');
    deps.result?.slice(0, 8).forEach(d => {
      const skipReason = d.deployment_trigger?.metadata?.skip_reason ? ` skip_reason="${d.deployment_trigger.metadata.skip_reason}"` : '';
      const stages = Object.entries(d.stages || {})
        .filter(([, s]) => s.status === 'active' || s.status === 'failure')
        .map(([name, s]) => `${name}:${s.status}`)
        .join(', ');
      const stageStr = stages ? ` [${stages}]` : '';
      console.log(`- ${d.id} [${d.environment}] branch=${d.deployment_trigger?.metadata?.branch || 'n/a'} status=${d.latest_stage?.status}${skipReason}${stageStr} (${d.created_on})`);
    });
  } else if (command === 'logs') {
    const depId = args[1];
    if (!depId) {
      console.error('Usage: node check-deployment.mjs logs <deploymentId>');
      process.exit(1);
    }
    const logs = await apiRequest('GET', `/accounts/${accountId}/pages/projects/${projectName}/deployments/${depId}/history/logs`);
    const lines = logs.result?.data?.map(l => l.line) || [];
    console.log(lines.join('\n'));
  } else if (command === 'retry') {
    const depId = args[1];
    if (!depId) {
      console.error('Usage: node check-deployment.mjs retry <deploymentId>');
      process.exit(1);
    }
    const res = await apiRequest('POST', `/accounts/${accountId}/pages/projects/${projectName}/deployments/${depId}/retry`);
    console.log('Retry triggered:', res.result?.id);
  } else if (command === 'cancel') {
    const depId = args[1];
    if (!depId) {
      console.error('Usage: node check-deployment.mjs cancel <deploymentId>');
      process.exit(1);
    }
    const res = await apiRequest('POST', `/accounts/${accountId}/pages/projects/${projectName}/deployments/${depId}/cancel`);
    console.log('Cancellation result:', res.result || res);
  } else {
    console.log('Usage: node check-deployment.mjs [status|logs <id>|retry <id>|cancel <id>]');
  }
}

main().catch(console.error);
