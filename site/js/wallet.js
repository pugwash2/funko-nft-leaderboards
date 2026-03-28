// Wallet lookup - search any wallet across all collections
async function init() {
  App.initNav();
  App.buildFooter();

  const content = document.getElementById("page-content");
  const input = document.getElementById("wallet-input");

  // Check for wallet in hash
  const hashWallet = window.location.hash?.slice(1);
  if (hashWallet) {
    input.value = hashWallet;
    lookup(hashWallet);
  }

  function doSearch() {
    const wallet = input.value.trim().toLowerCase();
    if (wallet) {
      window.location.hash = wallet;
      lookup(wallet);
    }
  }

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") doSearch();
  });

  document.getElementById("wallet-search-btn")?.addEventListener("click", doSearch);

  async function lookup(wallet) {
    content.innerHTML = '<p class="coming-soon">Searching all collections...</p>';

    // Load collections index
    let collections;
    try {
      const res = await fetch("/data/collections.json?t=" + Date.now());
      collections = await res.json();
    } catch {
      content.innerHTML = '<p class="coming-soon">No collection data available yet.</p>';
      return;
    }

    // Search each collection's leaderboard data for this wallet
    const results = [];
    let searched = 0;

    for (const col of collections) {
      try {
        const res = await fetch(`/data/leaderboards/${col.slug}.json`);
        if (!res.ok) continue;
        const data = await res.json();
        const holder = data.holders?.find(h => h.account === wallet);
        if (holder) {
          const rank = data.holders.indexOf(holder) + 1;
          const scored = data.scored?.find(s => s.account === wallet);
          results.push({
            slug: col.slug,
            name: col.name || data.displayName,
            image: data.image,
            assets: holder.assets,
            rank,
            totalHolders: data.holders.length,
            royaltySets: scored?.royalty?.sets || 0,
            royaltyRating: scored?.royalty?.rating || 0,
            masterySets: scored?.mastery?.sets || 0,
          });
        }
      } catch {}
      searched++;
      // Update progress
      if (searched % 5 === 0) {
        content.querySelector(".search-progress")?.remove();
        const prog = document.createElement("p");
        prog.className = "search-progress";
        prog.style.cssText = "color:var(--text-light);font-size:0.85rem;text-align:center;";
        prog.textContent = `Searched ${searched}/${collections.length} collections...`;
        content.appendChild(prog);
      }
    }

    if (results.length === 0) {
      content.innerHTML = `<p class="coming-soon">No holdings found for "${wallet}" in any tracked collection.</p>`;
      return;
    }

    // Sort by asset count descending
    results.sort((a, b) => b.assets - a.assets);
    const totalAssets = results.reduce((s, r) => s + r.assets, 0);

    content.innerHTML = `
      <div class="wallet-summary">
        <h2><a href="${App.profileLink(wallet)}" target="_blank">${wallet}</a></h2>
        <div class="stats-row">
          <div class="stat-card">
            <div class="stat-value">${results.length}</div>
            <div class="stat-label">Collections</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${App.fmt(totalAssets)}</div>
            <div class="stat-label">Total NFTs</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${results.reduce((s, r) => s + r.royaltySets, 0)}</div>
            <div class="stat-label">Royalty Sets</div>
          </div>
        </div>
      </div>

      <div class="table-section">
        <h2>Holdings by Collection</h2>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Collection</th>
                <th data-type="number">Assets</th>
                <th data-type="number">Rank</th>
                <th data-type="number">Royalty Sets</th>
                <th data-type="number">Rating</th>
              </tr>
            </thead>
            <tbody>
              ${results.map(r => `
                <tr>
                  <td>
                    <a href="/leaderboard.html#${r.slug}" style="display:flex;align-items:center;gap:8px;">
                      ${r.image ? `<img src="${App.ipfsUrl(r.image)}" style="width:28px;height:28px;border-radius:6px;object-fit:contain;background:#ede9fe;">` : ""}
                      ${r.name}
                    </a>
                  </td>
                  <td class="number">${App.fmt(r.assets)}</td>
                  <td class="number">#${r.rank} of ${r.totalHolders}</td>
                  <td class="number">${r.royaltySets || "-"}</td>
                  <td class="number">${r.royaltyRating ? App.fmtDec(r.royaltyRating) : "-"}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;

    for (const t of content.querySelectorAll(".data-table")) App.makeSortable(t);
  }
}

init();
