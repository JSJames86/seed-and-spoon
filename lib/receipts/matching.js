// ---------------------------------------------------------------------------
// Receipt line -> normalized ingredient name matching (Phase 3 §2.4, "the
// hard part"). Two stages:
//
//   1. Deterministic: receipt_ingredient_aliases exact hit, then
//      normalizeIngredient() (the SAME function priceEngine.js reads, per
//      spec §0 -- imported, not reimplemented) checked against a known-name
//      vocabulary built from USDA_BASELINE + ingredient_mappings +
//      price_quotes.
//   2. Model-assisted: whatever's left goes to Haiku in one batched call
//      per receipt against a small fuzzy-matched candidate pool.
//
// Confidence thresholds (spec §2.4):
//   >= 0.85       -> auto_matched
//   0.5 - 0.85    -> needs_confirmation (shown on the review screen)
//   < 0.5         -> unmatched (excluded from price writes, logged)
// ---------------------------------------------------------------------------

import Anthropic from '@anthropic-ai/sdk';
import { normalizeIngredient, findBaseline, USDA_BASELINE } from '@/lib/spoonassist/priceEngine';

const MODEL = 'claude-haiku-4-5-20251001';
const AUTO_MATCH_THRESHOLD = 0.85;
const REVIEW_THRESHOLD = 0.5;
const CANDIDATES_PER_LINE = 12;
const MAX_TOTAL_CANDIDATES = 150;

// Light key-normalization of the RAW receipt line for the alias table --
// NOT a second normalizeIngredient(). See migration comment on
// receipt_ingredient_aliases for the distinction.
export function lightNormalize(rawText) {
  return (rawText || '').toLowerCase().trim().replace(/\s+/g, ' ');
}

function statusForConfidence(confidence) {
  if (confidence >= AUTO_MATCH_THRESHOLD) return 'auto_matched';
  if (confidence >= REVIEW_THRESHOLD) return 'needs_confirmation';
  return 'unmatched';
}

// Distinct known ingredient names this app can already price, pooled from
// every tier priceEngine.js/lib/pricing draw from -- this is the vocabulary
// the deterministic pass checks membership against, and the candidate pool
// the model-assisted pass fuzzy-matches from.
export async function buildKnownVocabulary(supabaseClient) {
  const names = new Set(Object.keys(USDA_BASELINE));

  if (supabaseClient) {
    const [{ data: mappings }, { data: quotes }] = await Promise.all([
      supabaseClient.from('ingredient_mappings').select('normalized_name'),
      supabaseClient.from('price_quotes').select('product_id').limit(2000),
    ]);
    for (const row of mappings ?? []) if (row.normalized_name) names.add(row.normalized_name);
    for (const row of quotes ?? []) if (row.product_id) names.add(row.product_id);
  }

  return names;
}

export async function loadAliasMap(supabaseClient) {
  const map = new Map();
  if (!supabaseClient) return map;
  const { data } = await supabaseClient.from('receipt_ingredient_aliases').select('raw_text_normalized, normalized_name, confidence');
  for (const row of data ?? []) map.set(row.raw_text_normalized, { normalizedName: row.normalized_name, confidence: row.confidence });
  return map;
}

function deterministicMatch(rawText, { aliasMap, vocabulary }) {
  const aliasHit = aliasMap.get(lightNormalize(rawText));
  if (aliasHit) {
    return { normalizedName: aliasHit.normalizedName, confidence: 1, source: 'alias' };
  }

  const normalized = normalizeIngredient(rawText);
  if (normalized === null) {
    // "Free" ingredient text (water, ice, ...) shouldn't occur on a
    // receipt, but if it does there's nothing to price -- treat as unmatched
    // rather than special-casing a $0 receipt line.
    return null;
  }
  if (!normalized) return null;

  if (vocabulary.has(normalized)) {
    return { normalizedName: normalized, confidence: 0.95, source: 'deterministic' };
  }
  // findBaseline() already does the same substring tolerance priceEngine.js
  // uses for recipe ingredients -- reused as-is, not reimplemented.
  if (findBaseline(normalized)) {
    return { normalizedName: normalized, confidence: 0.85, source: 'deterministic' };
  }
  return null;
}

// Cheap token-overlap scoring for the "fuzzy top-K" candidate pool the spec
// asks for (§2.4.2) -- no fuzzy-match dependency in package.json, and a
// receipt has at most a few dozen unmatched lines, so this stays fast.
function tokenize(s) {
  return new Set((s || '').toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length >= 3));
}

function topKCandidates(rawText, vocabulary, k) {
  const queryTokens = tokenize(rawText);
  if (queryTokens.size === 0) return [];
  const scored = [];
  for (const name of vocabulary) {
    const nameTokens = tokenize(name);
    let overlap = 0;
    for (const t of queryTokens) if (nameTokens.has(t)) overlap += 1;
    if (overlap > 0) scored.push({ name, overlap });
  }
  scored.sort((a, b) => b.overlap - a.overlap || a.name.length - b.name.length);
  return scored.slice(0, k).map((s) => s.name);
}

const RECORD_MATCHES_TOOL = {
  name: 'record_matches',
  description: 'Maps each receipt line to the closest candidate ingredient name, or null if none fits.',
  input_schema: {
    type: 'object',
    properties: {
      matches: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            raw_text: { type: 'string' },
            matched_candidate: { type: ['string', 'null'], description: 'One value from the candidate list, or null if nothing is a plausible match.' },
            confidence: { type: 'number', description: '0-1. How confident this raw grocery abbreviation maps to the candidate.' },
          },
          required: ['raw_text', 'matched_candidate', 'confidence'],
        },
      },
    },
    required: ['matches'],
  },
};

function buildMatchPrompt(items) {
  const lines = items.map((it) => `- "${it.rawText}" | candidates: [${it.candidates.map((c) => `"${c}"`).join(', ') || 'none'}]`).join('\n');
  return (
    'Each line below is a grocery receipt abbreviation, followed by candidate ingredient names it might refer ' +
    'to. Call record_matches with your best guess for each -- matched_candidate must be exactly one of that ' +
    'line\'s candidates (verbatim) or null if none plausibly matches. confidence reflects how sure you are, not ' +
    'how good the best available candidate is (e.g. a clear match to a mediocre candidate can still be low ' +
    'confidence).\n\n' + lines
  );
}

async function modelAssistedMatch(unmatchedItems, vocabulary) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || unmatchedItems.length === 0) return new Map();

  const vocabArray = [...vocabulary];
  const withCandidates = unmatchedItems.map((it) => ({
    rawText: it.rawText,
    candidates: topKCandidates(it.rawText, vocabArray, CANDIDATES_PER_LINE),
  }));

  // Cap the total candidate pool sent to the model (spec: "keep the prompt small").
  const seen = new Set();
  for (const it of withCandidates) {
    it.candidates = it.candidates.filter((c) => {
      if (seen.size >= MAX_TOTAL_CANDIDATES) return seen.has(c);
      seen.add(c);
      return true;
    });
  }

  const client = new Anthropic({ apiKey });
  let response;
  try {
    response = await client.messages.create({
      model: MODEL,
      max_tokens: 2048,
      tools: [RECORD_MATCHES_TOOL],
      tool_choice: { type: 'tool', name: 'record_matches' },
      messages: [{ role: 'user', content: buildMatchPrompt(withCandidates) }],
    });
  } catch (err) {
    console.error('[receipts/matching] model-assisted match failed:', err.message);
    return new Map();
  }

  const toolUse = response.content.find((block) => block.type === 'tool_use');
  const matches = toolUse?.input?.matches;
  if (!Array.isArray(matches)) return new Map();

  const result = new Map();
  for (const m of matches) {
    if (!m?.raw_text) continue;
    const candidateSet = withCandidates.find((it) => it.rawText === m.raw_text)?.candidates ?? [];
    if (m.matched_candidate && candidateSet.includes(m.matched_candidate) && Number.isFinite(m.confidence)) {
      result.set(m.raw_text, { normalizedName: m.matched_candidate, confidence: Math.max(0, Math.min(1, m.confidence)), source: 'model' });
    }
  }
  return result;
}

/**
 * @param {{rawText: string}[]} lineItems
 * @param {object} supabaseClient
 * @returns {Promise<Array<{rawText:string, normalizedName:string|null, matchConfidence:number|null, matchSource:string|null, matchStatus:string}>>}
 */
export async function matchLineItems(lineItems, supabaseClient) {
  const [aliasMap, vocabulary] = await Promise.all([
    loadAliasMap(supabaseClient),
    buildKnownVocabulary(supabaseClient),
  ]);

  const deterministicResults = lineItems.map((item) => ({
    rawText: item.rawText,
    match: deterministicMatch(item.rawText, { aliasMap, vocabulary }),
  }));

  const needsModel = deterministicResults.filter((r) => !r.match);
  const modelMatches = await modelAssistedMatch(needsModel.map((r) => ({ rawText: r.rawText })), vocabulary);

  return deterministicResults.map(({ rawText, match }) => {
    const resolved = match ?? modelMatches.get(rawText) ?? null;
    const confidence = resolved?.confidence ?? 0;
    return {
      rawText,
      normalizedName: resolved && confidence >= REVIEW_THRESHOLD ? resolved.normalizedName : null,
      matchConfidence: resolved ? confidence : null,
      matchSource: resolved?.source ?? null,
      matchStatus: statusForConfidence(confidence),
    };
  });
}

// Persist a user-confirmed or auto-accepted mapping so the model never sees
// this exact abbreviation again (spec §2.4: "the system gets cheaper and
// better with every receipt").
export async function persistAlias(supabaseClient, rawText, normalizedName, source = 'model') {
  if (!supabaseClient) return;
  const key = lightNormalize(rawText);
  if (!key || !normalizedName) return;
  const { error } = await supabaseClient
    .from('receipt_ingredient_aliases')
    .upsert({ raw_text_normalized: key, normalized_name: normalizedName, confidence: 1, source }, { onConflict: 'raw_text_normalized' });
  if (error) console.error('[receipts/matching] persistAlias failed:', error.message);
}
