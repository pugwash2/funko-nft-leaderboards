// Homepage - collection grid
async function init() {
  App.initNav();
  App.buildFooter();

  const grid = document.getElementById("collection-content");
  const searchInput = document.getElementById("search-input");

  let collections = [];
  try {
    const res = await fetch("/data/collections.json?t=" + Date.now());
    if (!res.ok) throw new Error();
    collections = await res.json();
  } catch {
    grid.innerHTML = '<p class="coming-soon">No collection data yet. Run the data fetch script first.</p>';
    return;
  }

  // Stats banner
  const statsEl = document.getElementById("home-stats");
  if (statsEl) {
    // Load summary data for total NFT count
    try {
      const summaryRes = await fetch("/data/special/summary.json");
      if (summaryRes.ok) {
        const summary = await summaryRes.json();
        const totalHolders = new Set();
        let totalCollections = summary.length;
        // Find most recent fetch time
        const latestFetch = summary.reduce((latest, s) => {
          const t = new Date(s.fetchedAt).getTime();
          return t > latest ? t : latest;
        }, 0);
        const lastUpdated = latestFetch ? new Date(latestFetch).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "";

        statsEl.innerHTML = `
          <div class="home-stats-bar">
            <span><strong>${totalCollections}</strong> collections tracked</span>
            ${lastUpdated ? `<span>Last updated: ${lastUpdated}</span>` : ""}
          </div>
        `;
      }
    } catch {}
  }

  // Pre-load rarity data for all collections
  const rarityCache = {};
  async function loadRarityData(slug) {
    if (rarityCache[slug]) return rarityCache[slug];
    try {
      const res = await fetch(`/data/leaderboards/${slug}.json`);
      if (!res.ok) return null;
      const d = await res.json();
      rarityCache[slug] = d.rarityBreakdown || {};
      return rarityCache[slug];
    } catch { return null; }
  }

  const RARITY_ORDER = ["Common","Uncommon","Rare","Epic","Legendary","Grail","Mythic","Ultra","Royalty"];
  const RARITY_COLORS = {
    Common:"#9ca3af", Uncommon:"#10b981", Rare:"#00b4d8", Epic:"#6d28d9",
    Legendary:"#f97316", Grail:"#ef4444", Mythic:"#ec4899", Ultra:"#0891b2", Royalty:"#fbbf24"
  };

  function buildMiniRarityBar(breakdown) {
    if (!breakdown) return "";
    const total = RARITY_ORDER.reduce((s, r) => s + (breakdown[r] || 0), 0);
    if (total === 0) return "";
    const segments = RARITY_ORDER
      .filter(r => breakdown[r])
      .map(r => {
        const pct = ((breakdown[r] / total) * 100).toFixed(1);
        return `<div style="width:${pct}%;background:${RARITY_COLORS[r]}" title="${r}: ${breakdown[r]}"></div>`;
      }).join("");
    return `<div class="mini-rarity-bar">${segments}</div>`;
  }

  function render(filter = "") {
    const lc = filter.toLowerCase();
    const filtered = filter
      ? collections.filter(c => c.name.toLowerCase().includes(lc) || c.slug.toLowerCase().includes(lc))
      : collections;

    // Group by year
    const byYear = {};
    for (const c of filtered) {
      const year = c.year || "other";
      if (!byYear[year]) byYear[year] = [];
      byYear[year].push(c);
    }

    let html = "";
    for (const year of App.YEAR_ORDER) {
      const cols = byYear[year];
      if (!cols || cols.length === 0) continue;
      html += `<div class="year-section">
        <h2>${App.YEAR_LABELS[year] || year}</h2>
        <div class="collection-grid">
          ${cols.map(c => `
            <div class="collection-card" data-slug="${c.slug}">
              <a href="/leaderboard.html#${c.slug}">
                <img src="${App.ipfsUrl(c.image)}" alt="${c.name}" loading="lazy"
                  onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23ede9fe%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2255%22 text-anchor=%22middle%22 fill=%22%237c74a8%22 font-size=%2210%22>No Image</text></svg>'">
                <div class="card-rarity" id="rarity-${c.slug}"></div>
                <div class="card-name">${c.name}</div>
              </a>
            </div>
          `).join("")}
        </div>
      </div>`;
    }

    grid.innerHTML = html || '<p class="coming-soon">No collections match your search.</p>';

    // Load rarity bars async
    for (const c of filtered) {
      loadRarityData(c.slug).then(breakdown => {
        const el = document.getElementById(`rarity-${c.slug}`);
        if (el && breakdown) el.innerHTML = buildMiniRarityBar(breakdown);
      });
    }
  }

  render();

  searchInput?.addEventListener("input", (e) => {
    render(e.target.value);
  });
}

init();
