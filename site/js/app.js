// Shared utilities for all pages

const YEAR_ORDER = ["2025", "2024", "2023", "2022", "2021", "other", "dpk"];
const YEAR_LABELS = {
  "2025": "2025 Collections",
  "2024": "2024 Collections",
  "2023": "2023 Collections",
  "2022": "2022 Collections",
  "2021": "2021 Collections",
  "other": "Other Collections",
  "dpk": "DPK Collections",
};

const SPECIAL_PAGES = [
  { href: "/wallet.html", label: "Wallet Lookup" },
  { href: "/compare.html", label: "Compare Collections" },
  { href: "/hall-of-fame.html", label: "Hall of Fame" },
  { href: "/completionist.html", label: "The Completionist" },
  { href: "/coin-collector.html", label: "Coin Collector" },
  { href: "/royalty-collector.html", label: "Royalty Collector" },
  { href: "/collection-summary.html", label: "Collection Summary" },
  { href: "/useless-stats.html", label: "Useless Stats" },
];

// IPFS image helper
function ipfsUrl(hash) {
  if (!hash) return "";
  if (hash.startsWith("http")) return hash;
  return `https://ipfs.io/ipfs/${hash}`;
}

// Number formatting
function fmt(n) {
  if (typeof n !== "number" || isNaN(n)) return "-";
  return n.toLocaleString();
}

function fmtDec(n, digits = 3) {
  if (typeof n !== "number" || isNaN(n)) return "-";
  return n.toFixed(digits);
}

// Build navigation HTML
function buildNav(collections) {
  const nav = document.getElementById("main-nav");
  if (!nav) return;

  // Group collections by year
  const byYear = {};
  if (collections) {
    for (const c of collections) {
      const year = c.year || "other";
      if (!byYear[year]) byYear[year] = [];
      byYear[year].push(c);
    }
  }

  let linksHtml = "";

  // Year dropdowns
  for (const year of YEAR_ORDER) {
    const cols = byYear[year];
    if (!cols || cols.length === 0) continue;
    const shortLabel = year === "other" ? "Other" : year === "dpk" ? "DPK" : year;
    linksHtml += `<div class="nav-dropdown">
      <a href="#">${shortLabel}</a>
      <div class="nav-dropdown-menu">
        ${cols.map(c => `<a href="/leaderboard.html#${c.slug}">${c.name}</a>`).join("")}
      </div>
    </div>`;
  }

  // Special pages dropdown
  linksHtml += `<div class="nav-dropdown">
    <a href="#">Special</a>
    <div class="nav-dropdown-menu">
      ${SPECIAL_PAGES.map(p => `<a href="${p.href}">${p.label}</a>`).join("")}
    </div>
  </div>`;

  nav.innerHTML = `
    <div class="nav-inner">
      <a href="/" class="nav-logo">Funko <span>NFT</span></a>
      <div class="nav-links" id="nav-links">${linksHtml}</div>
      <button class="theme-toggle" id="theme-toggle" title="Toggle dark mode">&#9790;</button>
      <button class="nav-toggle" id="nav-toggle">&#9776;</button>
    </div>
  `;

  // Mobile toggle
  document.getElementById("nav-toggle")?.addEventListener("click", () => {
    document.getElementById("nav-links")?.classList.toggle("open");
  });

  // Dark mode toggle
  const themeBtn = document.getElementById("theme-toggle");
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) document.documentElement.setAttribute("data-theme", savedTheme);
  if (themeBtn) {
    themeBtn.textContent = document.documentElement.getAttribute("data-theme") === "dark" ? "\u2600" : "\u263E";
    themeBtn.addEventListener("click", () => {
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      const newTheme = isDark ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", newTheme);
      localStorage.setItem("theme", newTheme);
      themeBtn.textContent = newTheme === "dark" ? "\u2600" : "\u263E";
    });
  }

  // Mobile dropdown toggles
  if (window.innerWidth <= 768) {
    for (const dd of nav.querySelectorAll(".nav-dropdown > a")) {
      dd.addEventListener("click", (e) => {
        e.preventDefault();
        dd.parentElement.classList.toggle("open");
      });
    }
  }
}

// Load nav from collections.json
async function initNav() {
  try {
    const res = await fetch("/data/collections.json?t=" + Date.now());
    if (!res.ok) throw new Error("No collections data yet");
    const collections = await res.json();
    buildNav(collections);
  } catch {
    buildNav([]);
  }
}

// Build footer
function buildFooter() {
  const footer = document.getElementById("main-footer");
  if (!footer) return;
  footer.innerHTML = `
    <div class="footer-links">
      <a href="https://wax.atomichub.io" target="_blank">AtomicHub</a>
      <a href="https://www.wax.io" target="_blank">WAX Blockchain</a>
      <a href="https://discord.gg/FTnD8NyxZr" target="_blank">Discord</a>
      <a href="https://nft.eseller.ca" target="_blank">eSeller NFT</a>
      <a href="https://www.popinstock.com" target="_blank">PopInStock</a>
      <a href="https://nft.toyabunga.com" target="_blank">Toyabunga</a>
    </div>
    <p>Funko NFT Leaderboards. Data from AtomicHub API on WAX blockchain.</p>
  `;
}

// Sortable table
function makeSortable(table) {
  const headers = table.querySelectorAll("thead th");
  const tbody = table.querySelector("tbody");
  if (!headers.length || !tbody) return;

  headers.forEach((th, colIdx) => {
    th.addEventListener("click", () => {
      const rows = Array.from(tbody.querySelectorAll("tr"));
      const isDesc = th.classList.contains("sorted-asc");
      const isNumCol = th.dataset.type === "number";

      // Clear other sorted states
      headers.forEach(h => h.classList.remove("sorted-asc", "sorted-desc"));
      th.classList.add(isDesc ? "sorted-desc" : "sorted-asc");

      rows.sort((a, b) => {
        let aVal = a.cells[colIdx]?.textContent?.trim() || "";
        let bVal = b.cells[colIdx]?.textContent?.trim() || "";

        if (isNumCol) {
          aVal = parseFloat(aVal.replace(/,/g, "")) || 0;
          bVal = parseFloat(bVal.replace(/,/g, "")) || 0;
        }

        if (isDesc) return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      });

      for (const row of rows) tbody.appendChild(row);
    });
  });
}

// Rank class
function rankClass(rank) {
  if (rank === 1) return "rank rank-1";
  if (rank === 2) return "rank rank-2";
  if (rank === 3) return "rank rank-3";
  return "rank";
}

// AtomicHub profile link
function profileLink(account) {
  return `https://wax.atomichub.io/profile/wax-mainnet/${account}`;
}

// Wallet lookup link (our site)
function walletLink(account) {
  return `/wallet.html#${account}`;
}

// Account link HTML - shows name, links to our wallet lookup, with AtomicHub as secondary
function accountLink(account) {
  return `<a href="${walletLink(account)}" title="View all holdings">${account}</a> <a href="${profileLink(account)}" target="_blank" class="external-link" title="View on AtomicHub">&#8599;</a>`;
}

// Export for page scripts
window.App = {
  initNav, buildFooter, makeSortable, ipfsUrl, fmt, fmtDec, rankClass, profileLink, walletLink, accountLink,
  YEAR_ORDER, YEAR_LABELS, SPECIAL_PAGES,
};
