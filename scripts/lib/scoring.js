// scripts/lib/scoring.js

const ROYALTY_RARITIES = ["Common", "Uncommon", "Rare", "Epic"];
const ALL_RARITIES = ["Common", "Uncommon", "Rare", "Epic", "Legendary", "Grail", "Mythic", "Ultra", "Royalty"];

function getTemplatesByRarity(templates, rarities) {
  return templates.filter(t =>
    rarities.some(r => (t.immutable_data?.rarity || "").toLowerCase() === r.toLowerCase())
  );
}

export function computeSetCompletion(userAssets, templates, rarityFilter) {
  const targetTemplates = rarityFilter
    ? getTemplatesByRarity(templates, rarityFilter)
    : templates.filter(t => t.immutable_data?.rarity);

  if (targetTemplates.length === 0) return { sets: 0, rating: 0, average: 0 };

  const templateIds = new Set(targetTemplates.map(t => t.template_id));

  // Group user assets by template_id, sorted by mint number (lowest first)
  // AtomicHub API returns mint as `template_mint` at asset top level (string)
  const byTemplate = {};
  for (const asset of userAssets) {
    const tid = asset.template?.template_id;
    if (!tid || !templateIds.has(tid)) continue;
    if (!byTemplate[tid]) byTemplate[tid] = [];
    byTemplate[tid].push(parseInt(asset.template_mint || "999999"));
  }

  // Sort each group by mint (ascending)
  for (const tid of Object.keys(byTemplate)) {
    byTemplate[tid].sort((a, b) => a - b);
  }

  // Count complete sets
  let sets = 0;
  while (true) {
    let complete = true;
    for (const tid of templateIds) {
      if (!byTemplate[tid] || byTemplate[tid].length <= sets) {
        complete = false;
        break;
      }
    }
    if (!complete) break;
    sets++;
  }

  if (sets === 0) return { sets: 0, rating: 0, average: 0, lowestMint: 0 };

  // Rating uses the first (lowest mint) complete set
  const firstSetMints = [];
  for (const tid of templateIds) {
    firstSetMints.push(byTemplate[tid][0]);
  }

  const sumOfAssets = firstSetMints.reduce((a, b) => a + b, 0);
  const lowestMintSet = Math.min(...firstSetMints);
  const rating = ((sumOfAssets - lowestMintSet + sets) / sumOfAssets) * 100;
  const average = sumOfAssets / firstSetMints.length;

  return {
    sets,
    rating: Math.round(rating * 1000) / 1000,
    average: Math.round(average * 1000) / 1000,
    lowestMint: lowestMintSet,
  };
}

export function computeRoyaltyScore(userAssets, templates) {
  return computeSetCompletion(userAssets, templates, ROYALTY_RARITIES);
}

export function computeMasteryScore(userAssets, templates) {
  return computeSetCompletion(userAssets, templates, ALL_RARITIES);
}
