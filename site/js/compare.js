// Compare up to 3 collections side by side
const RARITY_ORDER = ["Common","Uncommon","Rare","Epic","Legendary","Grail","Mythic","Ultra","Royalty"];
const RARITY_COLORS = {
  Common:"#9ca3af", Uncommon:"#10b981", Rare:"#00b4d8", Epic:"#6d28d9",
  Legendary:"#f97316", Grail:"#ef4444", Mythic:"#ec4899", Ultra:"#0891b2", Royalty:"#fbbf24"
};
const COMPARE_COLORS = ["#6d28d9", "#ec4899", "#f97316"];

async function init() {
  App.initNav();
  App.buildFooter();
  const content = document.getElementById("page-content");

  let collections;
  try {
    const res = await fetch("/data/collections.json");
    collections = await res.json();
  } catch {
    content.innerHTML = '<p class="coming-soon">No collection data available yet.</p>';
    return;
  }

  // Build selector UI
  content.innerHTML = `
    <div class="compare-selectors">
      ${[0,1,2].map(i => `
        <div class="compare-slot">
          <select class="compare-select" id="select-${i}">
            <option value="">Choose collection ${i + 1}${i === 0 ? "" : " (optional)"}...</option>
            ${collections.map(c => `<option value="${c.slug}">${c.name}</option>`).join("")}
          </select>
        </div>
      `).join("")}
      <button class="expand-btn" id="compare-btn" style="max-width:200px;">Compare</button>
    </div>
    <div id="compare-results"></div>
  `;

  document.getElementById("compare-btn").addEventListener("click", runComparison);

  async function runComparison() {
    const slugs = [0,1,2].map(i => document.getElementById(`select-${i}`).value).filter(Boolean);
    if (slugs.length < 2) {
      document.getElementById("compare-results").innerHTML = '<p class="coming-soon">Pick at least 2 collections to compare.</p>';
      return;
    }

    const results = document.getElementById("compare-results");
    results.innerHTML = '<p class="coming-soon">Loading...</p>';

    const data = [];
    for (const slug of slugs) {
      try {
        const res = await fetch(`/data/leaderboards/${slug}.json`);
        data.push(await res.json());
      } catch {
        results.innerHTML = `<p class="coming-soon">Could not load data for ${slug}.</p>`;
        return;
      }
    }

    // Stats comparison
    let html = `
      <div class="table-section" style="margin-top:2rem;">
        <h2>Overview</h2>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Metric</th>
                ${data.map((d, i) => `<th style="color:${COMPARE_COLORS[i]}">${d.displayName}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              <tr><td>Total Assets</td>${data.map(d => `<td class="number">${App.fmt(d.totalAssets)}</td>`).join("")}</tr>
              <tr><td>Templates</td>${data.map(d => `<td class="number">${App.fmt(d.totalTemplates)}</td>`).join("")}</tr>
              <tr><td>Holders Tracked</td>${data.map(d => `<td class="number">${App.fmt(d.holders?.length || 0)}</td>`).join("")}</tr>
              <tr><td>Schemas</td>${data.map(d => `<td>${(d.schemas || []).join(", ")}</td>`).join("")}</tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Rarity comparison chart
    html += `
      <div class="table-section">
        <h2>Rarity Distribution</h2>
        <div style="max-width:700px;"><canvas id="rarity-chart"></canvas></div>
      </div>
    `;

    // Holder overlap
    const holderSets = data.map(d => new Set(d.holders?.map(h => h.account) || []));
    if (data.length === 2) {
      const overlap = [...holderSets[0]].filter(h => holderSets[1].has(h)).length;
      const only0 = holderSets[0].size - overlap;
      const only1 = holderSets[1].size - overlap;
      html += `
        <div class="table-section">
          <h2>Holder Overlap</h2>
          <div class="stats-row">
            <div class="stat-card" style="border-left-color:${COMPARE_COLORS[0]}">
              <div class="stat-value">${only0}</div>
              <div class="stat-label">Only ${data[0].displayName}</div>
            </div>
            <div class="stat-card" style="border-left-color:var(--funko-green)">
              <div class="stat-value">${overlap}</div>
              <div class="stat-label">Both</div>
            </div>
            <div class="stat-card" style="border-left-color:${COMPARE_COLORS[1]}">
              <div class="stat-value">${only1}</div>
              <div class="stat-label">Only ${data[1].displayName}</div>
            </div>
          </div>
        </div>
      `;
    } else if (data.length === 3) {
      const allThree = [...holderSets[0]].filter(h => holderSets[1].has(h) && holderSets[2].has(h)).length;
      html += `
        <div class="table-section">
          <h2>Holder Overlap</h2>
          <div class="stats-row">
            ${data.map((d, i) => `
              <div class="stat-card" style="border-left-color:${COMPARE_COLORS[i]}">
                <div class="stat-value">${holderSets[i].size}</div>
                <div class="stat-label">${d.displayName} holders</div>
              </div>
            `).join("")}
            <div class="stat-card" style="border-left-color:var(--funko-green)">
              <div class="stat-value">${allThree}</div>
              <div class="stat-label">All three</div>
            </div>
          </div>
        </div>
      `;
    }

    results.innerHTML = html;

    // Render rarity chart
    const ctx = document.getElementById("rarity-chart").getContext("2d");
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: RARITY_ORDER,
        datasets: data.map((d, i) => ({
          label: d.displayName,
          data: RARITY_ORDER.map(r => d.rarityBreakdown?.[r] || 0),
          backgroundColor: COMPARE_COLORS[i] + "cc",
          borderColor: COMPARE_COLORS[i],
          borderWidth: 1,
        })),
      },
      options: {
        responsive: true,
        plugins: { legend: { position: "top" } },
        scales: {
          y: { beginAtZero: true, title: { display: true, text: "Templates" } },
        },
      },
    });

    for (const t of results.querySelectorAll(".data-table")) App.makeSortable(t);
  }
}

init();
