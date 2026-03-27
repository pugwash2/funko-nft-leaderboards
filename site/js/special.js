// Special pages logic

// Hall of Fame
async function initHallOfFame() {
  App.initNav();
  App.buildFooter();
  const content = document.getElementById("page-content");

  let data;
  try {
    const res = await fetch("/data/special/hall-of-fame.json");
    if (!res.ok) throw new Error();
    data = await res.json();
  } catch {
    content.innerHTML = '<p class="coming-soon">No data available yet.</p>';
    return;
  }

  // Split into royalty and mastery tables
  const royalty = [...data].sort((a, b) => b.royaltyRating - a.royaltyRating);
  const mastery = [...data].filter(d => d.masterySets > 0).sort((a, b) => b.masteryRating - a.masteryRating);

  content.innerHTML = `
    ${buildHallTable("Royalty Set Ratings", royalty, "royalty")}
    ${mastery.length > 0 ? buildHallTable("Mastery Set Ratings", mastery, "mastery") : ""}
  `;

  for (const t of content.querySelectorAll(".data-table")) App.makeSortable(t);
}

function buildHallTable(title, entries, type) {
  const ratingKey = type === "royalty" ? "royaltyRating" : "masteryRating";
  const avgKey = type === "royalty" ? "royaltyAverage" : "masteryAverage";
  const setsKey = type === "royalty" ? "royaltySets" : "masterySets";

  return `
    <div class="table-section">
      <h2>${title}</h2>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th data-type="number">Rank</th>
              <th>Collection</th>
              <th>Account</th>
              <th data-type="number">Sets</th>
              <th data-type="number">Average</th>
              <th data-type="number">Rating</th>
            </tr>
          </thead>
          <tbody>
            ${entries.map((e, i) => `
              <tr>
                <td class="${App.rankClass(i + 1)}">${i + 1}</td>
                <td><a href="/leaderboard.html#${e.collection}">${e.collectionName}</a></td>
                <td class="account"><a href="${App.profileLink(e.account)}" target="_blank">${e.account}</a></td>
                <td class="number">${e[setsKey]}</td>
                <td class="number">${App.fmtDec(e[avgKey])}</td>
                <td class="number">${App.fmtDec(e[ratingKey])}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// Completionist
async function initCompletionist() {
  App.initNav();
  App.buildFooter();
  const content = document.getElementById("page-content");

  let data;
  try {
    const res = await fetch("/data/special/completionist.json");
    if (!res.ok) throw new Error();
    data = await res.json();
  } catch {
    content.innerHTML = '<p class="coming-soon">No data available yet.</p>';
    return;
  }

  content.innerHTML = `
    <div class="table-section">
      <h2>Completionist Rankings</h2>
      <p style="color:var(--text-secondary);margin-bottom:1rem;">Collectors who own NFTs across the most collections.</p>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th data-type="number">Rank</th>
              <th>Account</th>
              <th data-type="number">Collections</th>
              <th data-type="number">Total Assets</th>
              <th data-type="number">Royalty Sets</th>
            </tr>
          </thead>
          <tbody>
            ${data.map((e, i) => `
              <tr>
                <td class="${App.rankClass(i + 1)}">${i + 1}</td>
                <td class="account"><a href="${App.profileLink(e.account)}" target="_blank">${e.account}</a></td>
                <td class="number">${e.collections}</td>
                <td class="number">${App.fmt(e.totalAssets)}</td>
                <td class="number">${e.royaltySets}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;

  for (const t of content.querySelectorAll(".data-table")) App.makeSortable(t);
}

// Collection Summary
async function initSummary() {
  App.initNav();
  App.buildFooter();
  const content = document.getElementById("page-content");

  let data;
  try {
    const res = await fetch("/data/special/summary.json");
    if (!res.ok) throw new Error();
    data = await res.json();
  } catch {
    content.innerHTML = '<p class="coming-soon">No data available yet.</p>';
    return;
  }

  content.innerHTML = `
    <div class="table-section">
      <h2>All Collections</h2>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Collection</th>
              <th>Year</th>
              <th>Top Holder</th>
              <th data-type="number">Top Rating</th>
              <th data-type="number">Holders Tracked</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(e => `
              <tr>
                <td><a href="/leaderboard.html#${e.slug}">${e.name}</a></td>
                <td>${e.year || "-"}</td>
                <td class="account"><a href="${App.profileLink(e.topHolder)}" target="_blank">${e.topHolder}</a></td>
                <td class="number">${App.fmtDec(e.topRoyaltyRating)}</td>
                <td class="number">${e.totalHolders}</td>
                <td style="color:var(--text-muted)">${e.fetchedAt ? new Date(e.fetchedAt).toLocaleDateString() : "-"}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;

  for (const t of content.querySelectorAll(".data-table")) App.makeSortable(t);
}

// Useless Stats
async function initUselessStats() {
  App.initNav();
  App.buildFooter();
  const content = document.getElementById("page-content");

  let data;
  try {
    const res = await fetch("/data/special/useless-stats.json");
    if (!res.ok) throw new Error();
    data = await res.json();
  } catch {
    content.innerHTML = '<p class="coming-soon">No data available yet.</p>';
    return;
  }

  // Build rarity columns dynamically from all collections
  const allRarities = new Set();
  for (const c of data) {
    for (const r of Object.keys(c.rarityBreakdown || {})) allRarities.add(r);
  }
  const rarityList = ["Common", "Uncommon", "Rare", "Epic", "Legendary", "Grail", "Mythic", "Ultra", "Royalty", "Pack"]
    .filter(r => allRarities.has(r));

  content.innerHTML = `
    <div class="table-section">
      <h2>Collection Stats</h2>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Collection</th>
              <th data-type="number">Templates</th>
              <th data-type="number">Total Assets</th>
              ${rarityList.map(r => `<th data-type="number">${r}</th>`).join("")}
              <th>Schemas</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(c => `
              <tr>
                <td><a href="/leaderboard.html#${c.slug}">${c.name}</a></td>
                <td class="number">${App.fmt(c.totalTemplates)}</td>
                <td class="number">${App.fmt(c.totalAssets)}</td>
                ${rarityList.map(r => `<td class="number">${c.rarityBreakdown?.[r] || "-"}</td>`).join("")}
                <td style="color:var(--text-muted)">${(c.schemas || []).join(", ")}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;

  for (const t of content.querySelectorAll(".data-table")) App.makeSortable(t);
}

// Coin Collector / Royalty Collector (placeholder)
async function initComingSoon(title) {
  App.initNav();
  App.buildFooter();
  const content = document.getElementById("page-content");
  content.innerHTML = `
    <div class="coming-soon">
      <h2 style="margin-bottom:0.5rem;">${title}</h2>
      <p>This page is coming soon. We need to identify the specific coin/royalty template IDs before we can build these leaderboards.</p>
    </div>
  `;
}

// Export for pages
window.SpecialPages = {
  initHallOfFame,
  initCompletionist,
  initSummary,
  initUselessStats,
  initComingSoon,
};
