// Quick fetch - gets holders and templates for ALL collections without scoring
// This populates the homepage and basic leaderboards fast (~30 min)
// Run fetch-all.js separately for detailed scoring (hours)
import { ALL_COLLECTIONS, SLUG_TO_YEAR, collectionKey } from "./lib/collections.js";
import { fetchAccounts, fetchAllTemplates, fetchCollectionMeta, fetchSchemas } from "./lib/api.js";
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs";

const DATA_DIR = "./site/data";
mkdirSync(`${DATA_DIR}/leaderboards`, { recursive: true });
mkdirSync(`${DATA_DIR}/special`, { recursive: true });

const FILTER = process.argv[2] || null;

async function processCollection(col) {
  const key = collectionKey(col);
  const schema = col.schema || null;

  // Skip if we already have scored data for this collection
  const existingPath = `${DATA_DIR}/leaderboards/${key}.json`;
  if (existsSync(existingPath)) {
    try {
      const existing = JSON.parse(readFileSync(existingPath, "utf-8"));
      if (existing.scored?.length > 0 && existing.scored[0]?.royalty?.lowestMint !== undefined) {
        console.log(`Skipping ${key} (already has scored data)`);
        return existing;
      }
    } catch {}
  }

  console.log(`Quick fetch: ${key}${schema ? ` (${schema})` : ""}...`);

  const accounts = await fetchAccounts(col.slug, 200, schema);
  const templates = await fetchAllTemplates(col.slug, schema);
  const schemas = schema ? [{ schema_name: schema, assets: 0 }] : await fetchSchemas(col.slug);
  const meta = await fetchCollectionMeta(col.slug).catch(() => null);

  const leaderboard = accounts.map((a, i) => ({
    rank: i + 1,
    account: a.account,
    assets: parseInt(a.assets),
  }));

  const rarityBreakdown = {};
  for (const t of templates) {
    const rarity = t.immutable_data?.rarity || "Pack";
    rarityBreakdown[rarity] = (rarityBreakdown[rarity] || 0) + 1;
  }

  const packTemplates = templates.filter(t => !t.immutable_data?.rarity || t.immutable_data?.rarity === "Pack");
  const packStats = packTemplates.map(t => ({
    name: t.immutable_data?.name || t.template_id,
    maxSupply: parseInt(t.max_supply) || 0,
    issued: parseInt(t.issued_supply) || 0,
  }));

  const result = {
    slug: key,
    name: col.name,
    baseSlug: col.slug,
    schema,
    displayName: meta?.name || col.name,
    image: meta?.img || null,
    totalTemplates: templates.length,
    totalAssets: schemas.reduce((sum, s) => sum + parseInt(s.assets || 0), 0),
    rarityBreakdown,
    packStats: { packs: packStats, totalIssued: packStats.reduce((s, p) => s + p.issued, 0), totalMax: packStats.reduce((s, p) => s + p.maxSupply, 0) },
    holders: leaderboard,
    scored: [], // No scoring in quick mode
    schemas: schemas.map(s => s.schema_name),
    fetchedAt: new Date().toISOString(),
  };

  writeFileSync(`${DATA_DIR}/leaderboards/${key}.json`, JSON.stringify(result, null, 2));
  console.log(`  Done: ${leaderboard.length} holders, ${templates.length} templates`);
  return result;
}

async function main() {
  const collections = FILTER
    ? ALL_COLLECTIONS.filter(c => collectionKey(c) === FILTER || c.slug === FILTER)
    : ALL_COLLECTIONS;

  console.log(`Quick fetch for ${collections.length} collections (no scoring)...`);
  const allResults = [];

  for (const col of collections) {
    try {
      const result = await processCollection(col);
      if (result) allResults.push(result);
    } catch (err) {
      console.error(`FAILED: ${collectionKey(col)} - ${err.message}`);
    }
  }

  // Build index
  writeFileSync(`${DATA_DIR}/collections.json`, JSON.stringify(
    allResults.map(r => ({
      slug: r.slug,
      name: r.displayName || r.name,
      image: r.image,
      year: SLUG_TO_YEAR[r.slug] || "other",
    })).sort((a, b) => a.name.localeCompare(b.name)),
    null, 2
  ));

  console.log(`Done. ${allResults.length}/${collections.length} collections indexed.`);
}

main().catch(console.error);
