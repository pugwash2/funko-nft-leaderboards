// Homepage - collection grid
async function init() {
  App.initNav();
  App.buildFooter();

  const grid = document.getElementById("collection-content");
  const searchInput = document.getElementById("search-input");

  let collections = [];
  try {
    const res = await fetch("/data/collections.json");
    if (!res.ok) throw new Error();
    collections = await res.json();
  } catch {
    grid.innerHTML = '<p class="coming-soon">No collection data yet. Run the data fetch script first.</p>';
    return;
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
            <div class="collection-card">
              <a href="/leaderboard.html#${c.slug}">
                <img src="${App.ipfsUrl(c.image)}" alt="${c.name}" loading="lazy"
                  onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%2322222e%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2255%22 text-anchor=%22middle%22 fill=%22%239090a8%22 font-size=%2212%22>No Image</text></svg>'">
                <div class="card-name">${c.name}</div>
              </a>
            </div>
          `).join("")}
        </div>
      </div>`;
    }

    grid.innerHTML = html || '<p class="coming-soon">No collections match your search.</p>';
  }

  render();

  searchInput?.addEventListener("input", (e) => {
    render(e.target.value);
  });
}

init();
