// Quick smoke test - fetches minimal data to verify pipeline works
import { fetchAccounts, fetchAllTemplates, fetchSchemas, fetchCollectionMeta } from "./lib/api.js";
import { computeRoyaltyScore, computeMasteryScore } from "./lib/scoring.js";
import { fetchAssets } from "./lib/api.js";

const slug = "potter.funko";
console.log(`Fetching ${slug}...`);

const accounts = await fetchAccounts(slug, 5);
console.log(`Got ${accounts.length} holders`);

const templates = await fetchAllTemplates(slug);
console.log(`Got ${templates.length} templates`);

const schemas = await fetchSchemas(slug);
console.log(`Got ${schemas.length} schemas`);

const meta = await fetchCollectionMeta(slug);
console.log(`Collection name: ${meta.name}`);

// Score just the top holder
const topHolder = accounts[1]; // skip mint.droppp (index 0), it's the minting contract
console.log(`\nScoring ${topHolder.account} (${topHolder.assets} assets)...`);
const assets = await fetchAssets(slug, topHolder.account, 200);
console.log(`Fetched ${assets.length} assets`);

const royalty = computeRoyaltyScore(assets, templates);
const mastery = computeMasteryScore(assets, templates);
console.log(`Royalty: ${royalty.sets} sets, rating ${royalty.rating}`);
console.log(`Mastery: ${mastery.sets} sets, rating ${mastery.rating}`);
console.log("\nPipeline works!");
