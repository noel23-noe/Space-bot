require('dotenv').config();
const { fork } = require('child_process');
const fs = require('fs');
const path = require('path');

const TENANTS_FILE = path.join(__dirname, 'tenants.json');
const WORKER_PATH = path.join(__dirname, 'worker.js');

// tenantId -> { businessName, phoneNumber, status, createdAt }
function loadTenants() {
  try {
    return JSON.parse(fs.readFileSync(TENANTS_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function saveTenants(tenants) {
  fs.writeFileSync(TENANTS_FILE, JSON.stringify(tenants, null, 2));
}

const tenants = loadTenants();
const liveProcesses = new Map(); // tenantId -> child process handle

function startWorker(tenantId) {
  const tenant = tenants[tenantId];
  if (!tenant) {
    console.error(`Unknown tenant: ${tenantId}`);
    return;
  }

  if (liveProcesses.has(tenantId)) {
    console.log(`[manager] ${tenantId} is already running.`);
    return;
  }

  console.log(`[manager] Starting worker for ${tenantId} (${tenant.businessName})...`);

  const child = fork(WORKER_PATH, [], {
    env: {
      ...process.env,
      TENANT_ID: tenantId,
      PHONE_NUMBER: tenant.phoneNumber,
    },
  });

  liveProcesses.set(tenantId, child);
  tenant.status = 'starting';
  saveTenants(tenants);

  child.on('message', (msg) => {
    if (msg.event === 'pairing_code') {
      console.log(`\n📋 Pairing code for ${tenant.businessName} (${tenantId}): ${msg.code}`);
      console.log(`   Send this to the customer to enter on their phone.\n`);
      tenant.lastPairingCode = msg.code;
      tenant.status = 'awaiting_pairing';
    } else if (msg.event === 'connected') {
      console.log(`✅ ${tenant.businessName} (${tenantId}) is now connected.`);
      tenant.status = 'connected';
    } else if (msg.event === 'disconnected') {
      console.log(`⚠️  ${tenant.businessName} (${tenantId}) disconnected.`, msg.loggedOut ? '(logged out)' : '(will retry)');
      tenant.status = msg.loggedOut ? 'logged_out' : 'reconnecting';
    } else if (msg.event === 'fatal_error') {
      console.error(`❌ ${tenant.businessName} (${tenantId}) crashed: ${msg.message}`);
      tenant.status = 'crashed';
    }
    saveTenants(tenants);
  });

  child.on('exit', (code) => {
    console.log(`[manager] Worker for ${tenantId} exited (code ${code}).`);
    liveProcesses.delete(tenantId);
    if (tenants[tenantId] && tenants[tenantId].status !== 'logged_out') {
      tenants[tenantId].status = 'stopped';
      saveTenants(tenants);
    }
  });
}

function stopWorker(tenantId) {
  const child = liveProcesses.get(tenantId);
  if (!child) {
    console.log(`[manager] ${tenantId} is not running.`);
    return;
  }
  child.kill();
  liveProcesses.delete(tenantId);
}

function addTenant(tenantId, businessName, phoneNumber) {
  if (tenants[tenantId]) {
    console.error(`Tenant "${tenantId}" already exists.`);
    return;
  }
  tenants[tenantId] = {
    businessName,
    phoneNumber,
    status: 'created',
    createdAt: new Date().toISOString(),
  };
  saveTenants(tenants);
  console.log(`[manager] Added tenant "${tenantId}" (${businessName}).`);
}

function listTenants() {
  const ids = Object.keys(tenants);
  if (ids.length === 0) {
    console.log('No tenants yet. Add one with: node manager.js add <id> "<business name>" <phone_number>');
    return;
  }
  console.log('\nTenants:');
  for (const id of ids) {
    const t = tenants[id];
    console.log(`  ${id} — ${t.businessName} — ${t.phoneNumber} — status: ${t.status}`);
  }
  console.log('');
}

function startAll() {
  for (const id of Object.keys(tenants)) startWorker(id);
}

// --- Simple CLI ---
const [, , cmd, ...args] = process.argv;

switch (cmd) {
  case 'add': {
    const [tenantId, businessName, phoneNumber] = args;
    if (!tenantId || !businessName || !phoneNumber) {
      console.log('Usage: node manager.js add <tenantId> "<business name>" <phone_number>');
      break;
    }
    addTenant(tenantId, businessName, phoneNumber);
    break;
  }
  case 'start': {
    const tenantId = args[0];
    if (!tenantId) { console.log('Usage: node manager.js start <tenantId>'); break; }
    startWorker(tenantId);
    break;
  }
  case 'stop': {
    const tenantId = args[0];
    if (!tenantId) { console.log('Usage: node manager.js stop <tenantId>'); break; }
    stopWorker(tenantId);
    break;
  }
  case 'start-all':
    startAll();
    break;
  case 'list':
    listTenants();
    break;
  default:
    console.log(`
Space_X Bot manager — usage:

  node manager.js add <tenantId> "<business name>" <phone_number>   Register a new customer
  node manager.js start <tenantId>                                   Start one customer's bot (prints pairing code)
  node manager.js start-all                                          Start every registered customer's bot
  node manager.js stop <tenantId>                                    Stop one customer's bot
  node manager.js list                                                Show all customers and their status
`);
}

// Keep the process alive if we started any workers (so their child processes keep running).
if (['start', 'start-all'].includes(cmd)) {
  process.stdin.resume(); // prevent immediate exit
  process.on('SIGINT', () => {
    console.log('\n[manager] Shutting down all workers...');
    for (const id of liveProcesses.keys()) stopWorker(id);
    process.exit(0);
  });
}
