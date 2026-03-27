// Build collections.json index from whatever leaderboard files exist
// Uses registry names (with S1/S2) over API display names
import { readdirSync, readFileSync, writeFileSync } from "fs";
import { ALL_COLLECTIONS, SLUG_TO_YEAR, collectionKey } from "./lib/collections.js";

const DATA_DIR = "./site/data";
const files = readdirSync(`${DATA_DIR}/leaderboards`).filter(f => f.endsWith(".json"));

// Build a lookup from registry for preferred names
const registryNames = {};
for (const col of ALL_COLLECTIONS) {
  registryNames[collectionKey(col)] = col.name;
}

const collections = files.map(f => {
  const data = JSON.parse(readFileSync(`${DATA_DIR}/leaderboards/${f}`, "utf-8"));
  const key = data.slug;
  return {
    slug: key,
    name: registryNames[key] || data.displayName || data.name,
    apiName: data.displayName,
    image: data.image,
    year: SLUG_TO_YEAR[key] || "other",
  };
});

writeFileSync(`${DATA_DIR}/collections.json`, JSON.stringify(collections, null, 2));
console.log(`Built collections.json with ${collections.length} collections`);
