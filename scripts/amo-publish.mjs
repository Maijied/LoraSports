#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════
 * LORAPOK WORLDCUP 26 — AMO Publish Script
 * Automates full Firefox Add-on submission via AMO API v5
 *
 * Steps:
 *  1  Generate JWT auth token (no external deps, uses Node crypto)
 *  2  Upload XPI to AMO
 *  3  Poll until upload is validated
 *  4  Check if addon already exists (first run vs update)
 *  5a Create new addon with all metadata + version (first run)
 *  5b Update existing addon metadata + create new version (updates)
 *  6  Update privacy policy
 *  7  Report result with AMO links
 * ═══════════════════════════════════════════════════════════════════
 */

import crypto    from 'node:crypto';
import fs        from 'node:fs';
import path      from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.resolve(__dirname, '..');

// ── Config ────────────────────────────────────────────────────────
const AMO_BASE    = 'https://addons.mozilla.org/api/v5';
const API_KEY     = process.env.AMO_API_KEY;
const API_SECRET  = process.env.AMO_API_SECRET;
const XPI_PATH    = process.env.XPI_PATH || path.join(ROOT, 'artifacts', 'extension.zip');
const LISTING     = JSON.parse(fs.readFileSync(path.join(ROOT, 'amo-listing.json'), 'utf8'));
const GUID        = LISTING.guid;
const POLL_MS     = 5_000;   // 5 s between status polls
const POLL_MAX    = 60;      // max 5 min total wait

// ── Colour helpers ────────────────────────────────────────────────
const c = {
  green:  s => `\x1b[32m${s}\x1b[0m`,
  cyan:   s => `\x1b[36m${s}\x1b[0m`,
  yellow: s => `\x1b[33m${s}\x1b[0m`,
  red:    s => `\x1b[31m${s}\x1b[0m`,
  bold:   s => `\x1b[1m${s}\x1b[0m`,
  dim:    s => `\x1b[2m${s}\x1b[0m`,
};

function log(icon, msg)  { console.log(`${icon}  ${msg}`); }
function ok(msg)         { log(c.green('✔'), c.green(msg)); }
function info(msg)       { log(c.cyan('ℹ'), msg); }
function warn(msg)       { log(c.yellow('⚠'), c.yellow(msg)); }
function step(n, msg)    { console.log(`\n${c.bold(c.cyan(`STEP ${n}`))}  ${c.bold(msg)}`); }
function fail(msg)       { log(c.red('✖'), c.red(msg)); process.exit(1); }

// ── JWT (HS256, pure Node crypto — no npm deps) ───────────────────
function makeJWT() {
  if (!API_KEY || !API_SECRET) fail('AMO_API_KEY and AMO_API_SECRET must be set.');
  const now = Math.floor(Date.now() / 1000);
  const hdr = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const pld = Buffer.from(JSON.stringify({
    iss: API_KEY,
    jti: crypto.randomUUID(),
    iat: now,
    exp: now + 300,          // 5-min expiry is plenty
  })).toString('base64url');
  const sig = crypto.createHmac('sha256', API_SECRET)
    .update(`${hdr}.${pld}`).digest('base64url');
  return `${hdr}.${pld}.${sig}`;
}

// ── AMO fetch wrapper ─────────────────────────────────────────────
async function amo(method, endpoint, body, extraHeaders = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${AMO_BASE}${endpoint}`;
  const isFormData = body instanceof FormData;

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `JWT ${makeJWT()}`,
      ...(isFormData ? {} : body ? { 'Content-Type': 'application/json' } : {}),
      ...extraHeaders,
    },
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });

  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { _raw: text }; }

  if (!res.ok) {
    console.error(c.red(`AMO ${method} ${endpoint} → ${res.status}`));
    console.error(c.dim(JSON.stringify(json, null, 2).slice(0, 800)));
    throw new Error(`AMO API error ${res.status} on ${method} ${endpoint}`);
  }
  return json;
}

// ── STEP 2: Upload XPI ────────────────────────────────────────────
async function uploadXPI() {
  step(2, 'Uploading XPI to AMO');

  if (!fs.existsSync(XPI_PATH)) fail(`XPI not found at: ${XPI_PATH}`);
  info(`File: ${XPI_PATH} (${(fs.statSync(XPI_PATH).size / 1024).toFixed(1)} KB)`);

  const form = new FormData();
  form.append('upload', new Blob([fs.readFileSync(XPI_PATH)], { type: 'application/zip' }),
    path.basename(XPI_PATH));
  form.append('channel', 'listed');

  const res = await amo('POST', '/addons/upload/', form);
  ok(`Upload received — UUID: ${res.uuid}`);
  return res.uuid;
}

// ── STEP 3: Poll upload validation ───────────────────────────────
async function waitForValidation(uuid) {
  step(3, 'Waiting for upload validation');

  for (let i = 0; i < POLL_MAX; i++) {
    const res = await amo('GET', `/addons/upload/${uuid}/`);
    const { processed, valid, validation_results } = res;

    if (!processed) {
      process.stdout.write(c.dim(`  polling… (${i + 1}/${POLL_MAX})\r`));
      await new Promise(r => setTimeout(r, POLL_MS));
      continue;
    }

    if (!valid) {
      console.error('\n', JSON.stringify(validation_results, null, 2));
      fail('Upload failed validation. Fix the errors above and retry.');
    }

    ok('Upload validated successfully.');
    return;
  }
  fail('Validation timed out after 5 minutes.');
}

// ── STEP 4: Check if addon already exists ────────────────────────
async function addonExists() {
  step(4, `Checking if addon ${GUID} already exists on AMO`);
  try {
    await amo('GET', `/addons/addon/${encodeURIComponent(GUID)}/`);
    info('Addon already exists — will add a new version.');
    return true;
  } catch (e) {
    if (e.message.includes('404')) {
      info('Addon not found — will create a new listing.');
      return false;
    }
    throw e;
  }
}

// ── STEP 5a: Create new addon ────────────────────────────────────
async function createAddon(uploadUUID) {
  step('5a', 'Creating new addon listing with full metadata');

  const body = {
    // Core identity
    default_locale:  LISTING.default_locale,
    // Listing fields
    name:            LISTING.name,
    summary:         LISTING.summary,
    description:     LISTING.description,
    homepage:        LISTING.homepage,
    support_url:     LISTING.support_url,
    support_email:   LISTING.support_email,
    categories:      LISTING.categories,
    is_experimental: LISTING.is_experimental,
    requires_payment:LISTING.requires_payment,
    ...(LISTING.contributions_url ? { contributions_url: LISTING.contributions_url } : {}),
    // Version
    version: {
      upload:         uploadUUID,
      license:        LISTING.version.license,
      release_notes:  LISTING.version.release_notes,
      approval_notes: LISTING.version.approval_notes,
      compatibility:  { firefox: { min: '91.0' } },
    },
  };

  const res = await amo('POST', '/addons/addon/', body);
  ok(`Addon created! ID: ${res.id}, slug: ${res.slug}`);
  return res;
}

// ── STEP 5b: Add version to existing addon ───────────────────────
async function addVersion(uploadUUID) {
  step('5b', 'Adding new version to existing addon');

  // First update the listing metadata
  info('Updating listing metadata…');
  await amo('PATCH', `/addons/addon/${encodeURIComponent(GUID)}/`, {
    name:            LISTING.name,
    summary:         LISTING.summary,
    description:     LISTING.description,
    homepage:        LISTING.homepage,
    support_url:     LISTING.support_url,
    support_email:   LISTING.support_email,
    categories:      LISTING.categories,
    default_locale:  LISTING.default_locale,
    is_experimental: LISTING.is_experimental,
    requires_payment:LISTING.requires_payment,
    ...(LISTING.contributions_url ? { contributions_url: LISTING.contributions_url } : {}),
  });
  ok('Listing metadata updated.');

  // Then create the new version
  info('Creating new version…');
  const res = await amo('POST', `/addons/addon/${encodeURIComponent(GUID)}/versions/`, {
    upload:         uploadUUID,
    license:        LISTING.version.license,
    release_notes:  LISTING.version.release_notes,
    approval_notes: LISTING.version.approval_notes,
    compatibility:  { firefox: { min: '91.0' } },
  });
  ok(`Version ${res.version} submitted for review. ID: ${res.id}`);
  return res;
}

// ── STEP 6: Privacy policy ────────────────────────────────────────
async function updatePrivacyPolicy() {
  step(6, 'Updating privacy policy');
  try {
    await amo('PATCH', `/addons/addon/${encodeURIComponent(GUID)}/eula_policy/`, {
      privacy_policy: LISTING.privacy_policy,
    });
    ok('Privacy policy updated.');
  } catch (e) {
    warn(`Privacy policy update failed (non-fatal): ${e.message}`);
  }
}

// ── STEP 7: Tags (separate endpoint) ─────────────────────────────
async function updateTags() {
  step(7, 'Applying tags');
  // AMO tags are set via PATCH on the addon itself if the field is available
  // Attempt it silently — not all accounts have tag-write access
  try {
    await amo('PATCH', `/addons/addon/${encodeURIComponent(GUID)}/`, {
      tags: LISTING.tags,
    });
    ok(`Tags set: ${LISTING.tags.join(', ')}`);
  } catch {
    warn('Tag update skipped (requires reviewer permission on AMO).');
    info(`Add manually at: https://addons.mozilla.org/en-US/developers/addon/${LISTING.slug}/edit`);
  }
}

// ── Main ──────────────────────────────────────────────────────────
async function main() {
  console.log(`\n${c.bold('◈ LORAPOK WORLDCUP 26 — AMO PUBLISH')}`);
  console.log(c.dim('═'.repeat(48)));
  console.log(c.dim(`GUID   : ${GUID}`));
  console.log(c.dim(`Channel: listed`));
  console.log(c.dim(`File   : ${path.basename(XPI_PATH)}\n`));

  step(1, 'Auth check');
  if (!API_KEY || !API_SECRET) fail('Set AMO_API_KEY and AMO_API_SECRET as environment variables.');
  ok(`API key loaded: ${API_KEY.slice(0, 12)}…`);

  const uploadUUID = await uploadXPI();
  await waitForValidation(uploadUUID);

  const exists = await addonExists();
  let addonRes;
  if (!exists) {
    addonRes = await createAddon(uploadUUID);
  } else {
    addonRes = await addVersion(uploadUUID);
  }

  await updatePrivacyPolicy();
  await updateTags();

  // ── Done ──────────────────────────────────────────────────────
  console.log(`\n${c.green(c.bold('✔ ALL DONE'))}\n`);
  console.log(c.cyan('🔗 Developer Hub:'));
  console.log(`   https://addons.mozilla.org/en-US/developers/addon/${LISTING.slug}/`);
  console.log(c.cyan('🔗 Public listing (once approved):'));
  console.log(`   https://addons.mozilla.org/en-US/firefox/addon/${LISTING.slug}/`);
  console.log(c.cyan('🔗 Version queue:'));
  console.log(`   https://addons.mozilla.org/en-US/developers/addon/${LISTING.slug}/versions\n`);
  console.log(c.dim('Mozilla reviewers will typically approve listed extensions within 1–7 days.'));
  console.log(c.dim('Watch your registered AMO email for review notifications.\n'));
}

main().catch(e => {
  console.error(c.red(`\n✖ Fatal: ${e.message}`));
  process.exit(1);
});
