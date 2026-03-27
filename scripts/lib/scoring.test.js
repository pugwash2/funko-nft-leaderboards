import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { computeSetCompletion, computeRoyaltyScore } from "./scoring.js";

// Mock templates: 3 templates in "Common" + "Rare" rarities
const mockTemplates = [
  { template_id: "1", immutable_data: { rarity: "Common" } },
  { template_id: "2", immutable_data: { rarity: "Common" } },
  { template_id: "3", immutable_data: { rarity: "Rare" } },
];

// Mock assets: user owns all 3 templates with specific mints
const mockAssets = [
  { template: { template_id: "1" }, template_mint: "10" },
  { template: { template_id: "2" }, template_mint: "20" },
  { template: { template_id: "3" }, template_mint: "30" },
];

describe("computeSetCompletion", () => {
  it("returns 1 complete set when user has all templates", () => {
    const result = computeSetCompletion(mockAssets, mockTemplates, ["Common", "Rare"]);
    assert.equal(result.sets, 1);
    assert.ok(result.rating > 0);
    assert.ok(result.average > 0);
  });

  it("returns 0 sets when user is missing a template", () => {
    const partial = mockAssets.slice(0, 2); // missing template 3
    const result = computeSetCompletion(partial, mockTemplates, ["Common", "Rare"]);
    assert.equal(result.sets, 0);
    assert.equal(result.rating, 0);
  });

  it("counts multiple sets from duplicate assets", () => {
    const doubled = [...mockAssets, ...mockAssets.map(a => ({ ...a, template_mint: "50" }))];
    const result = computeSetCompletion(doubled, mockTemplates, ["Common", "Rare"]);
    assert.equal(result.sets, 2);
  });

  it("lower mint numbers produce higher ratings", () => {
    const lowMints = mockAssets.map(a => ({ ...a, template_mint: "1" }));
    const highMints = mockAssets.map(a => ({ ...a, template_mint: "500" }));
    const lowResult = computeSetCompletion(lowMints, mockTemplates, ["Common", "Rare"]);
    const highResult = computeSetCompletion(highMints, mockTemplates, ["Common", "Rare"]);
    assert.ok(lowResult.rating >= highResult.rating);
  });

  it("handles empty assets gracefully", () => {
    const result = computeSetCompletion([], mockTemplates, ["Common", "Rare"]);
    assert.equal(result.sets, 0);
  });
});
