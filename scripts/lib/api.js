// scripts/lib/api.js
const BASE = "https://wax.api.atomicassets.io/atomicassets/v1";
const DELAY_MS = 250;

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function apiFetch(path, params = {}) {
  const url = new URL(`${BASE}${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));

  let retries = 3;
  while (retries > 0) {
    const res = await fetch(url.toString());
    if (res.status === 429) {
      console.log(`Rate limited, waiting 2s...`);
      await sleep(2000);
      retries--;
      continue;
    }
    if (!res.ok) throw new Error(`API ${res.status}: ${url}`);
    const json = await res.json();
    await sleep(DELAY_MS);
    return json;
  }
  throw new Error(`Failed after retries: ${path}`);
}

export async function fetchAccounts(collectionName, limit = 200) {
  let all = [];
  let page = 1;
  const pageSize = 100;
  while (all.length < limit) {
    const result = await apiFetch("/accounts", {
      collection_name: collectionName,
      limit: Math.min(pageSize, limit - all.length),
      page,
    });
    all = all.concat(result.data);
    if (result.data.length < pageSize) break;
    page++;
  }
  return all;
}

export async function fetchAllTemplates(collectionName) {
  let all = [];
  let page = 1;
  while (true) {
    const result = await apiFetch("/templates", {
      collection_name: collectionName,
      limit: 100,
      page,
    });
    all = all.concat(result.data);
    if (result.data.length < 100) break;
    page++;
  }
  return all;
}

export async function fetchSchemas(collectionName) {
  const result = await apiFetch("/schemas", { collection_name: collectionName });
  return result.data;
}

export async function fetchAssets(collectionName, owner) {
  let all = [];
  let page = 1;
  while (true) {
    const result = await apiFetch("/assets", {
      collection_name: collectionName,
      owner,
      limit: 100,
      page,
    });
    all = all.concat(result.data);
    if (result.data.length < 100) break;
    page++;
  }
  return all;
}

export async function fetchCollectionMeta(collectionName) {
  const result = await apiFetch(`/collections/${collectionName}`);
  return result.data;
}
