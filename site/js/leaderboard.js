// Leaderboard page - single collection view

// System accounts that hold unopened packs, not real collectors
const SYSTEM_ACCOUNTS = ["premint.nft", "mint.droppp", "premint1.nft", "premint2.nft"];

// Pie chart color palette
const PIE_COLORS = [
  "#6d28d9","#ec4899","#f97316","#10b981","#00b4d8","#fbbf24",
  "#ef4444","#8b5cf6","#14b8a6","#f59e0b","#06b6d4","#d946ef",
  "#22c55e","#e11d48","#0ea5e9","#a855f7","#84cc16","#fb923c",
  "#2dd4bf","#f43f5e",
];

async function init() {
  App.initNav();
  App.buildFooter();

  const content = document.getElementById("leaderboard-content");

  const pathParts = window.location.pathname.split("/");
  const lastPath = pathParts[pathParts.length - 1] || pathParts[pathParts.length - 2];
  const hash = window.location.hash?.slice(1);
  const slug = hash || (lastPath !== "leaderboard" && lastPath !== "leaderboard.html" ? lastPath : null);

  if (!slug) {
    content.innerHTML = '<p class="coming-soon">No collection specified.</p>';
    return;
  }

  let data;
  try {
    const res = await fetch(`/data/leaderboards/${slug}.json`);
    if (!res.ok) throw new Error();
    data = await res.json();
  } catch {
    content.innerHTML = `<p class="coming-soon">No data available for "${slug}" yet.</p>`;
    return;
  }

  document.title = `${data.displayName} - Funko NFT Leaderboards`;

  // Build rarity bar
  const rarities = data.rarityBreakdown || {};
  const totalTemplates = Object.values(rarities).reduce((a, b) => a + b, 0) || 1;
  const rarityOrder = ["Common", "Uncommon", "Rare", "Epic", "Legendary", "Grail", "Mythic", "Ultra", "Royalty", "Pack"];
  const rarityBarHtml = rarityOrder
    .filter(r => rarities[r])
    .map(r => {
      const pct = ((rarities[r] / totalTemplates) * 100).toFixed(1);
      const cls = `rarity-${r.toLowerCase()}`;
      return `<div class="${cls}" style="width:${pct}%" title="${r}: ${rarities[r]}">${pct > 5 ? rarities[r] : ""}</div>`;
    }).join("");

  const rarityLegendHtml = rarityOrder
    .filter(r => rarities[r])
    .map(r => `<span><span class="dot rarity-${r.toLowerCase()}"></span>${r}: ${rarities[r]}</span>`)
    .join("");

  let html = `
    <div class="collection-header">
      ${data.image ? `<img src="${App.ipfsUrl(data.image)}" alt="${data.displayName}">` : ""}
      <div>
        <h1>${data.displayName}</h1>
        <div class="collection-meta">
          <span>${App.fmt(data.totalAssets)} total assets</span>
          <span>${App.fmt(data.totalTemplates)} templates</span>
          <span>${App.fmt(data.holders?.length || 0)} holders tracked</span>
        </div>
      </div>
    </div>

    <div class="table-section">
      <h2>Rarity Breakdown</h2>
      <div class="rarity-bar">${rarityBarHtml}</div>
      <div class="rarity-legend">${rarityLegendHtml}</div>
    </div>

    ${buildPackStats(data.packStats)}
  `;

  // Royalty Set Ratings table (exclude system accounts)
  const scoredWithRoyalty = (data.scored || []).filter(s => s.royalty?.sets > 0 && !SYSTEM_ACCOUNTS.includes(s.account));
  if (scoredWithRoyalty.length > 0) {
    scoredWithRoyalty.sort((a, b) => b.royalty.rating - a.royalty.rating);
    html += buildScoredTable("Royalty Set Ratings", scoredWithRoyalty, "royalty");
  }

  // Mastery Set Ratings table (exclude system accounts)
  const scoredWithMastery = (data.scored || []).filter(s => s.mastery?.sets > 0 && !SYSTEM_ACCOUNTS.includes(s.account));
  if (scoredWithMastery.length > 0) {
    scoredWithMastery.sort((a, b) => b.mastery.rating - a.mastery.rating);
    html += buildScoredTable("Mastery Set Ratings", scoredWithMastery, "mastery");
  }

  // Top Holders - pie chart + table with system account toggle
  html += `
    <div class="table-section">
      <h2>Top Holders</h2>
      <label class="toggle-label">
        <input type="checkbox" id="hide-system" checked>
        <span>Hide system accounts (mint.droppp, premint.nft)</span>
      </label>
      <div class="holders-layout">
        <div class="chart-container">
          <canvas id="holders-chart"></canvas>
        </div>
        <div class="table-wrap">
          <table class="data-table" id="holders-table">
            <thead>
              <tr>
                <th data-type="number">Rank</th>
                <th>Account</th>
                <th data-type="number">Assets</th>
              </tr>
            </thead>
            <tbody id="holders-tbody"></tbody>
          </table>
          <div id="holders-expand"></div>
        </div>
      </div>
    </div>
  `;

  if (data.fetchedAt) {
    html += `<p style="color:var(--text-light);font-size:0.8rem;margin-top:1rem;">Data fetched: ${new Date(data.fetchedAt).toLocaleString()}</p>`;
  }

  content.innerHTML = html;

  // Make scored tables sortable
  for (const table of content.querySelectorAll(".data-table")) {
    App.makeSortable(table);
  }

  // Holders chart + table with toggle
  const allHolders = data.holders || [];
  let chart = null;
  let showAll = false;

  function renderHolders(hideSystem) {
    const holders = hideSystem
      ? allHolders.filter(h => !SYSTEM_ACCOUNTS.includes(h.account))
      : allHolders;

    // Table - show 15 by default, expand with button
    const visible = showAll ? holders : holders.slice(0, 15);
    const tbody = document.getElementById("holders-tbody");
    tbody.innerHTML = visible.map((h, i) => `
      <tr>
        <td class="${App.rankClass(i + 1)}">${i + 1}</td>
        <td class="account"><a href="${App.profileLink(h.account)}" target="_blank">${h.account}</a></td>
        <td class="number">${App.fmt(h.assets)}</td>
      </tr>
    `).join("");

    // Show all / collapse button
    const btnContainer = document.getElementById("holders-expand");
    if (holders.length > 15) {
      btnContainer.innerHTML = `<button class="expand-btn" id="toggle-all">${showAll ? "Show top 15" : `Show all ${holders.length} holders`}</button>`;
      document.getElementById("toggle-all").addEventListener("click", () => {
        showAll = !showAll;
        renderHolders(document.getElementById("hide-system").checked);
      });
    } else {
      btnContainer.innerHTML = "";
    }

    // Pie chart - top 15 + "Others"
    const top = holders.slice(0, 15);
    const othersTotal = holders.slice(15).reduce((sum, h) => sum + h.assets, 0);
    const labels = top.map(h => h.account);
    const values = top.map(h => h.assets);
    const colors = top.map((_, i) => PIE_COLORS[i % PIE_COLORS.length]);

    if (othersTotal > 0) {
      labels.push(`Others (${holders.length - 15})`);
      values.push(othersTotal);
      colors.push("#d1d5db");
    }

    if (chart) chart.destroy();
    const ctx = document.getElementById("holders-chart").getContext("2d");
    chart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: "#fff",
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: function(ctx) {
                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                const pct = ((ctx.parsed / total) * 100).toFixed(1);
                return `${ctx.label}: ${ctx.parsed.toLocaleString()} (${pct}%)`;
              }
            }
          }
        },
        cutout: "40%",
        onClick: (evt, elements) => {
          if (!elements.length) return;
          const idx = elements[0].index;
          const rows = document.querySelectorAll("#holders-tbody tr");
          // Remove previous highlights
          rows.forEach(r => r.classList.remove("highlighted"));
          if (idx < rows.length) {
            // Expand table if needed to show the clicked row
            if (!showAll && idx >= 15) {
              showAll = true;
              renderHolders(document.getElementById("hide-system").checked);
              return;
            }
            rows[idx]?.classList.add("highlighted");
            rows[idx]?.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        },
      }
    });
  }

  renderHolders(true);

  document.getElementById("hide-system").addEventListener("change", (e) => {
    renderHolders(e.target.checked);
  });
}

function buildPackStats(packStats) {
  if (!packStats || !packStats.packs || packStats.packs.length === 0) return "";

  const { packs, totalIssued, totalMax } = packStats;
  const openedPct = totalMax > 0 ? ((1 - totalIssued / totalMax) * 100).toFixed(1) : 0;

  return `
    <div class="table-section">
      <h2>Pack Opening Tracker</h2>
      <div class="pack-progress-wrap">
        <div class="pack-progress-bar">
          <div class="pack-progress-fill" style="width:${openedPct}%"></div>
        </div>
        <div class="pack-progress-label">${openedPct}% opened (${App.fmt(totalMax - totalIssued)} of ${App.fmt(totalMax)} packs)</div>
      </div>
      ${packs.length > 1 ? `
        <div class="table-wrap" style="margin-top:0.75rem;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Pack</th>
                <th data-type="number">Max Supply</th>
                <th data-type="number">Remaining</th>
                <th data-type="number">Opened %</th>
              </tr>
            </thead>
            <tbody>
              ${packs.map(p => {
                const pct = p.maxSupply > 0 ? ((1 - p.issued / p.maxSupply) * 100).toFixed(1) : 0;
                return `<tr>
                  <td>${p.name}</td>
                  <td class="number">${App.fmt(p.maxSupply)}</td>
                  <td class="number">${App.fmt(p.issued)}</td>
                  <td class="number">${pct}%</td>
                </tr>`;
              }).join("")}
            </tbody>
          </table>
        </div>
      ` : ""}
    </div>
  `;
}

function buildScoredTable(title, entries, scoreKey) {
  const hasLowestMint = entries.some(s => s[scoreKey].lowestMint);
  return `
    <div class="table-section">
      <h2>${title}</h2>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th data-type="number">Rank</th>
              <th>Account</th>
              <th data-type="number">Sets</th>
              ${hasLowestMint ? '<th data-type="number">Lowest Mint</th>' : ""}
              <th data-type="number">Avg Mint</th>
              <th data-type="number">Rating</th>
            </tr>
          </thead>
          <tbody>
            ${entries.map((s, i) => `
              <tr>
                <td class="${App.rankClass(i + 1)}">${i + 1}</td>
                <td class="account"><a href="${App.profileLink(s.account)}" target="_blank">${s.account}</a></td>
                <td class="number">${s[scoreKey].sets}</td>
                ${hasLowestMint ? `<td class="number mint-highlight">#${App.fmt(s[scoreKey].lowestMint)}</td>` : ""}
                <td class="number">${App.fmtDec(s[scoreKey].average)}</td>
                <td class="number">${App.fmtDec(s[scoreKey].rating)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

init();
