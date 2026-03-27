// Build collections.json index from whatever leaderboard files exist
// Run this anytime to update the homepage without waiting for full fetch
import { readdirSync, readFileSync, writeFileSync } from "fs";
import { SLUG_TO_YEAR } from "./lib/collections.js";

const DATA_DIR = "./site/data";
const files = readdirSync(`${DATA_DIR}/leaderboards`).filter(f => f.endsWith(".json"));

const collections = files.map(f => {
  const data = JSON.parse(readFileSync(`${DATA_DIR}/leaderboards/${f}`, "utf-8"));
  return {
    slug: data.slug,
    name: data.displayName,
    image: data.image,
    year: SLUG_TO_YEAR[data.slug] || "other",
  };
});

writeFileSync(`${DATA_DIR}/collections.json`, JSON.stringify(collections, null, 2));
console.log(`Built collections.json with ${collections.length} collections`);
