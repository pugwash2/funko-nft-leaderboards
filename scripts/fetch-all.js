// scripts/fetch-all.js
import { ALL_COLLECTIONS, COLLECTIONS, SLUG_TO_YEAR } from "./lib/collections.js";
import { fetchAccounts, fetchAllTemplates, fetchAssets, fetchCollectionMeta, fetchSchemas } from "./lib/api.js";
import { computeRoyaltyScore, computeMasteryScore } from "./lib/scoring.js";
import { writeFileSync, mkdirSync } from "fs";

// Data lives inside site/ so Vercel can serve it
const DATA_DIR = "./site/data";
const TOP_SCORED = 20;

mkdirSync(`${DATA_DIR}/leaderboards`, { recursive: true });
mkdirSync(`${DATA_DIR}/special`, { recursive: true });

// Allow filtering to a single collection for testing: node scripts/fetch-all.js potter.funko
const FILTER = process.argv[2] || null;

async function processCollection(col) {
  console.log(`Processing ${col.slug}...`);

  // Sequential calls to respect rate limiting
  const accounts = await fetchAccounts(col.slug, 200);
  const templates = await fetchAllTemplates(col.slug);
  const schemas = await fetchSchemas(col.slug);
  const meta = await fetchCollectionMeta(col.slug).catch(() => null);

  // Basic leaderboard (all holders with asset counts)
  const leaderboard = accounts.map((a, i) => ({
    rank: i + 1,
    account: a.account,
    assets: parseInt(a.assets),
  }));

  // Detailed scoring for top N
  const scored = [];
  for (const entry of leaderboard.slice(0, TOP_SCORED)) {
    try {
      const assets = await fetchAssets(col.slug, entry.account);
      const royalty = computeRoyaltyScore(assets, templates);
      const mastery = computeMasteryScore(assets, templates);
      scored.push({ ...entry, royalty, mastery });
    } catch (err) {
      console.error(`  Failed scoring ${entry.account}: ${err.message}`);
      scored.push({ ...entry, royalty: { sets: 0, rating: 0, average: 0 }, mastery: { sets: 0, rating: 0, average: 0 } });
    }
  }

  // Template rarity breakdown for useless stats
  const rarityBreakdown = {};
  for (const t of templates) {
    const rarity = t.immutable_data?.rarity || "Pack";
    rarityBreakdown[rarity] = (rarityBreakdown[rarity] || 0) + 1;
  }

  // Pack stats: how many packs exist vs how many are still unopened
  const packTemplates = templates.filter(t => !t.immutable_data?.rarity || t.immutable_data?.rarity === "Pack");
  const packStats = packTemplates.map(t => ({
    name: t.immutable_data?.name || t.template_id,
    maxSupply: parseInt(t.max_supply) || 0,
    issued: parseInt(t.issued_supply) || 0,
  }));
  const totalPacksIssued = packStats.reduce((s, p) => s + p.issued, 0);
  const totalPacksMax = packStats.reduce((s, p) => s + p.maxSupply, 0);

  const result = {
    slug: col.slug,
    name: col.name,
    displayName: meta?.name || col.name,
    image: meta?.img || null,
    totalTemplates: templates.length,
    totalAssets: schemas.reduce((sum, s) => sum + parseInt(s.assets || 0), 0),
    rarityBreakdown,
    packStats: { packs: packStats, totalIssued: totalPacksIssued, totalMax: totalPacksMax },
    holders: leaderboard,
    scored,
    schemas: schemas.map(s => s.schema_name),
    fetchedAt: new Date().toISOString(),
  };

  writeFileSync(`${DATA_DIR}/leaderboards/${col.slug}.json`, JSON.stringify(result, null, 2));
  console.log(`  Done: ${leaderboard.length} holders, ${scored.length} scored, ${templates.length} templates`);
  return result;
}

async function buildSpecialPages(allResults) {
  // Hall of Fame: top royalty/mastery ratings across ALL collections
  const hallEntries = [];
  for (const r of allResults) {
    for (const s of r.scored) {
      if (s.royalty.sets > 0) {
        hallEntries.push({
          collection: r.slug,
          collectionName: r.displayName,
          account: s.account,
          royaltyRating: s.royalty.rating,
          royaltyAverage: s.royalty.average,
          royaltySets: s.royalty.sets,
          masteryRating: s.mastery.rating,
          masteryAverage: s.mastery.average,
          masterySets: s.mastery.sets,
        });
      }
    }
  }
  hallEntries.sort((a, b) => b.royaltyRating - a.royaltyRating);
  writeFileSync(`${DATA_DIR}/special/hall-of-fame.json`, JSON.stringify(hallEntries.slice(0, 200), null, 2));

  // Completionist: who owns NFTs across the most collections
  const ownerCollections = {};
  for (const r of allResults) {
    for (const h of r.holders) {
      if (!ownerCollections[h.account]) ownerCollections[h.account] = { collections: 0, totalAssets: 0, royaltySets: 0 };
      ownerCollections[h.account].collections++;
      ownerCollections[h.account].totalAssets += h.assets;
    }
  }
  for (const r of allResults) {
    for (const s of r.scored) {
      if (ownerCollections[s.account]) {
        ownerCollections[s.account].royaltySets += s.royalty.sets;
      }
    }
  }
  const completionists = Object.entries(ownerCollections)
    .map(([account, data]) => ({ account, ...data }))
    .sort((a, b) => b.collections - a.collections)
    .slice(0, 200);
  writeFileSync(`${DATA_DIR}/special/completionist.json`, JSON.stringify(completionists, null, 2));

  // Useless Stats: collection metadata table
  const stats = allResults.map(r => ({
    slug: r.slug,
    name: r.displayName,
    totalTemplates: r.totalTemplates,
    totalAssets: r.totalAssets,
    rarityBreakdown: r.rarityBreakdown,
    schemas: r.schemas,
    fetchedAt: r.fetchedAt,
  }));
  writeFileSync(`${DATA_DIR}/special/useless-stats.json`, JSON.stringify(stats, null, 2));

  // Collection Summary
  const summary = allResults.map(r => ({
    slug: r.slug,
    name: r.displayName,
    image: r.image,
    year: SLUG_TO_YEAR[r.slug] || "other",
    topHolder: r.scored[0]?.account || r.holders[0]?.account || "N/A",
    topRoyaltySets: r.scored[0]?.royalty?.sets || 0,
    topRoyaltyRating: r.scored[0]?.royalty?.rating || 0,
    totalHolders: r.holders.length,
    fetchedAt: r.fetchedAt,
  }));
  writeFileSync(`${DATA_DIR}/special/summary.json`, JSON.stringify(summary, null, 2));

  // Coin Collector + Royalty Collector: deferred until schema IDs identified
  writeFileSync(`${DATA_DIR}/special/coin-collector.json`, JSON.stringify({ status: "coming_soon", message: "Coin schema IDs need identification" }, null, 2));
  writeFileSync(`${DATA_DIR}/special/royalty-collector.json`, JSON.stringify({ status: "coming_soon", message: "Royalty template IDs need identification" }, null, 2));
}

async function main() {
  const collections = FILTER
    ? ALL_COLLECTIONS.filter(c => c.slug === FILTER)
    : ALL_COLLECTIONS;

  console.log(`Fetching data for ${collections.length} collections...`);
  const allResults = [];

  for (const col of collections) {
    try {
      const result = await processCollection(col);
      allResults.push(result);
    } catch (err) {
      console.error(`FAILED: ${col.slug} - ${err.message}`);
    }
  }

  console.log("Building special pages...");
  await buildSpecialPages(allResults);

  // Master collection index
  writeFileSync(`${DATA_DIR}/collections.json`, JSON.stringify(
    allResults.map(r => ({
      slug: r.slug,
      name: r.displayName,
      image: r.image,
      year: SLUG_TO_YEAR[r.slug] || "other",
    })),
    null, 2
  ));

  console.log(`Done. ${allResults.length}/${collections.length} collections processed.`);
}

main().catch(console.error);
