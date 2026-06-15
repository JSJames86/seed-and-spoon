// ---------------------------------------------------------------------------
// §9 "recipe-in" entry mode -- pull a recipe's JSON-LD (schema.org Recipe)
// out of a page's HTML, normalize it to { name, recipeIngredient, servings,
// image }, and (server-side) fetch a user-supplied URL to do so.
//
// extractRecipeFromHtml() is pure/network-free: it just regex-extracts
// <script type="application/ld+json"> blocks and looks for a Recipe node.
// fetchAndExtractRecipe() wraps it with SSRF-conscious fetching: only
// http(s), DNS-resolve the hostname (and every redirect hop) and reject
// private/loopback/link-local addresses before connecting, and a per-hop
// timeout.
// ---------------------------------------------------------------------------

import dns from 'node:dns/promises';
import net from 'node:net';

const JSONLD_RE = /<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
const MAX_REDIRECTS = 3;
const FETCH_TIMEOUT_MS = 8000;
const USER_AGENT = 'SeedAndSpoonBot/1.0 (+https://seedandspoon.org)';

// ---------------------------------------------------------------------------
// JSON-LD extraction (pure, network-free)
// ---------------------------------------------------------------------------

function hasRecipeType(node) {
  const type = node?.['@type'];
  const types = Array.isArray(type) ? type : [type];
  return types.includes('Recipe');
}

function findRecipeNode(data) {
  if (!data) return null;
  if (Array.isArray(data)) {
    for (const item of data) {
      const found = findRecipeNode(item);
      if (found) return found;
    }
    return null;
  }
  if (typeof data !== 'object') return null;

  if (hasRecipeType(data)) return data;
  if (Array.isArray(data['@graph'])) return findRecipeNode(data['@graph']);

  return null;
}

function parseServings(recipeYield) {
  if (recipeYield == null) return null;
  const value = Array.isArray(recipeYield) ? recipeYield[0] : recipeYield;
  if (typeof value === 'number') return Math.round(value);
  if (typeof value === 'string') {
    const match = value.match(/(\d+)/);
    if (match) return parseInt(match[1], 10);
  }
  return null;
}

function extractImage(image) {
  if (!image) return null;
  const value = Array.isArray(image) ? image[0] : image;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && typeof value.url === 'string') return value.url;
  return null;
}

function normalizeRecipeNode(node) {
  const name = typeof node.name === 'string' ? node.name.trim() : null;
  const recipeIngredient = Array.isArray(node.recipeIngredient)
    ? node.recipeIngredient.filter(i => typeof i === 'string' && i.trim().length > 0).map(i => i.trim())
    : [];

  if (!name || recipeIngredient.length === 0) return null;

  return {
    name,
    recipeIngredient,
    servings: parseServings(node.recipeYield),
    image: extractImage(node.image),
  };
}

/**
 * Extracts and normalizes a schema.org Recipe from a page's raw HTML.
 * @param {string} html
 * @returns {{name:string, recipeIngredient:string[], servings:number|null, image:string|null}|null}
 */
export function extractRecipeFromHtml(html) {
  if (!html || typeof html !== 'string') return null;

  for (const match of html.matchAll(JSONLD_RE)) {
    const raw = match[1].trim();
    if (!raw) continue;

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      continue; // malformed JSON-LD block -- try the next <script> tag
    }

    const node = findRecipeNode(data);
    if (!node) continue;

    const normalized = normalizeRecipeNode(node);
    if (normalized) return normalized;
  }

  return null;
}

// ---------------------------------------------------------------------------
// SSRF-conscious fetch
// ---------------------------------------------------------------------------

function isPrivateIPv4(ip) {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some(p => Number.isNaN(p))) return true; // malformed -- fail closed
  const [a, b] = parts;
  if (a === 0) return true;                          // 0.0.0.0/8 "this network"
  if (a === 10) return true;                         // 10.0.0.0/8
  if (a === 127) return true;                        // 127.0.0.0/8 loopback
  if (a === 169 && b === 254) return true;           // 169.254.0.0/16 link-local
  if (a === 172 && b >= 16 && b <= 31) return true;   // 172.16.0.0/12
  if (a === 192 && b === 168) return true;           // 192.168.0.0/16
  if (a === 100 && b >= 64 && b <= 127) return true;  // 100.64.0.0/10 shared/CGNAT
  if (a >= 224) return true;                          // multicast + reserved
  return false;
}

function isPrivateIPv6(ip) {
  const normalized = ip.toLowerCase();
  if (normalized === '::1' || normalized === '0:0:0:0:0:0:0:1') return true; // loopback
  if (normalized.startsWith('::ffff:')) {
    return isPrivateIPv4(normalized.slice('::ffff:'.length)); // IPv4-mapped
  }
  const firstGroup = parseInt(normalized.split(':')[0] || '0', 16);
  if (firstGroup >= 0xfe80 && firstGroup <= 0xfebf) return true; // fe80::/10 link-local
  if (firstGroup >= 0xfc00 && firstGroup <= 0xfdff) return true; // fc00::/7 unique local
  return false;
}

function isPrivateIp(ip) {
  const version = net.isIP(ip);
  if (version === 4) return isPrivateIPv4(ip);
  if (version === 6) return isPrivateIPv6(ip);
  return true; // unrecognizable -- fail closed
}

/**
 * Validates a candidate URL (and, transitively, every redirect hop): only
 * http(s), and every DNS-resolved address must be public.
 * @param {string} url
 * @returns {Promise<{parsed: URL}|{error: string}>}
 */
async function validateUrl(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return { error: 'invalid_url' };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { error: 'unsupported_protocol' };
  }

  let addresses;
  try {
    addresses = await dns.lookup(parsed.hostname, { all: true });
  } catch {
    return { error: 'dns_lookup_failed' };
  }

  if (addresses.length === 0 || addresses.some(a => isPrivateIp(a.address))) {
    return { error: 'blocked_address' };
  }

  return { parsed };
}

/**
 * Fetches a user-supplied recipe URL and extracts its schema.org Recipe.
 * Each redirect hop is independently validated (protocol + DNS + private-IP
 * check) before being fetched, capped at MAX_REDIRECTS.
 * @param {string} url
 * @returns {Promise<
 *   {recipe: ReturnType<typeof extractRecipeFromHtml>, sourceUrl: string}
 *   | {error: string, status?: number}
 * >}
 */
export async function fetchAndExtractRecipe(url) {
  let current = url;

  for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects++) {
    const validation = await validateUrl(current);
    if (validation.error) return { error: validation.error };

    let response;
    try {
      response = await fetch(validation.parsed.toString(), {
        headers: { 'User-Agent': USER_AGENT },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        redirect: 'manual',
      });
    } catch {
      return { error: 'fetch_failed' };
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location) return { error: 'fetch_failed', status: response.status };
      current = new URL(location, validation.parsed).toString();
      continue;
    }

    if (!response.ok) {
      return { error: 'fetch_failed', status: response.status };
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('html')) {
      return { error: 'unsupported_content_type' };
    }

    const html = await response.text();
    const recipe = extractRecipeFromHtml(html);
    if (!recipe) return { error: 'no_recipe_found' };

    return { recipe, sourceUrl: validation.parsed.toString() };
  }

  return { error: 'too_many_redirects' };
}
