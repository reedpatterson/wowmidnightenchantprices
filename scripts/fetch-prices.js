require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { ENCHANTING_ITEMS } = require("./items");
const config = require("../config.json");

const REGION = config.region;
const REALMS = config.realms;
const API_BASE = `https://${REGION}.api.blizzard.com`;
const DYNAMIC_NS = `dynamic-${REGION}`;
const STATIC_NS = `static-${REGION}`;
const ITEM_IDS_PATH = path.join(__dirname, "../data/item-ids.json");
const PRICES_DIR = path.join(__dirname, "../data/prices");

// ── Auth ──────────────────────────────────────────────────────────────────────

async function getToken() {
  const { BNET_CLIENT_ID, BNET_CLIENT_SECRET } = process.env;
  if (!BNET_CLIENT_ID || !BNET_CLIENT_SECRET) {
    throw new Error("Missing BNET_CLIENT_ID or BNET_CLIENT_SECRET in environment.");
  }
  const credentials = Buffer.from(`${BNET_CLIENT_ID}:${BNET_CLIENT_SECRET}`).toString("base64");
  const res = await fetch("https://oauth.battle.net/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`Token request failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.access_token;
}

// ── Realm lookup ──────────────────────────────────────────────────────────────

async function getConnectedRealmId(token, realmSlug) {
  const url = `${API_BASE}/data/wow/search/connected-realm?namespace=${DYNAMIC_NS}&realms.slug=${realmSlug}&_pageSize=1`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Realm search failed for "${realmSlug}": ${res.status}`);
  const data = await res.json();
  if (!data.results || data.results.length === 0) {
    throw new Error(`Realm not found: "${realmSlug}". Check the slug in config.json.`);
  }
  const href = data.results[0].key.href;
  const match = href.match(/connected-realm\/(\d+)/);
  if (!match) throw new Error(`Could not parse connected realm ID from: ${href}`);
  return match[1];
}

// ── Item ID resolution ────────────────────────────────────────────────────────

async function searchItemByName(token, name) {
  const url = `${API_BASE}/data/wow/search/item?namespace=${STATIC_NS}&locale=en_US&name.en_US=${encodeURIComponent(name)}&_pageSize=20`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.results || [];
}

async function resolveItemIds(token) {
  let cached = {};
  if (fs.existsSync(ITEM_IDS_PATH)) {
    cached = JSON.parse(fs.readFileSync(ITEM_IDS_PATH, "utf8"));
  }

  const slugsToResolve = new Set();
  for (const item of ENCHANTING_ITEMS) {
    if (!(item.recipeSlug in cached)) slugsToResolve.add(item.recipeSlug);
    if (!(item.enchantSlug in cached)) slugsToResolve.add(item.enchantSlug);
  }

  if (slugsToResolve.size === 0) {
    console.log("All item IDs already cached.");
    return cached;
  }

  console.log(`Resolving ${slugsToResolve.size} item name(s) via Blizzard API...`);
  for (const slug of slugsToResolve) {
    const results = await searchItemByName(token, slug);
    // Prefer exact name match
    const match = results.find((r) => r.data?.name?.en_US === slug);
    if (match) {
      cached[slug] = match.data.id;
      console.log(`  [OK] "${slug}" => ${match.data.id}`);
    } else {
      cached[slug] = null;
      console.warn(`  [NOT FOUND] "${slug}" — set the ID manually in data/item-ids.json`);
    }
  }

  fs.mkdirSync(path.dirname(ITEM_IDS_PATH), { recursive: true });
  fs.writeFileSync(ITEM_IDS_PATH, JSON.stringify(cached, null, 2));
  return cached;
}

// ── Auction house ─────────────────────────────────────────────────────────────

async function fetchAuctions(token, connectedRealmId) {
  // Regular AH (non-stackable items like enchant scrolls and recipes)
  const ahUrl = `${API_BASE}/data/wow/connected-realm/${connectedRealmId}/auctions?namespace=${DYNAMIC_NS}`;
  const ahRes = await fetch(ahUrl, { headers: { Authorization: `Bearer ${token}` } });
  if (!ahRes.ok) throw new Error(`AH fetch failed: ${ahRes.status}`);
  const ahData = await ahRes.json();

  // Commodity AH (stackable crafting materials — may include some enchant items)
  const commUrl = `${API_BASE}/data/wow/auctions/commodities?namespace=${DYNAMIC_NS}`;
  const commRes = await fetch(commUrl, { headers: { Authorization: `Bearer ${token}` } });
  const commData = commRes.ok ? await commRes.json() : { auctions: [] };

  return [...(ahData.auctions || []), ...(commData.auctions || [])];
}

function getLowestPrice(auctions, itemId) {
  if (!itemId) return null;
  const relevant = auctions.filter((a) => a.item?.id === itemId || a.id === itemId);
  if (relevant.length === 0) return null;
  const prices = relevant
    .map((a) => a.buyout || a.unit_price || 0)
    .filter((p) => p > 0);
  return prices.length > 0 ? Math.min(...prices) : null;
}

// ── Formatting ────────────────────────────────────────────────────────────────

function copperToGold(copper) {
  if (copper === null || copper === undefined) return null;
  return {
    gold: Math.floor(copper / 10000),
    silver: Math.floor((copper % 10000) / 100),
    copper: copper % 100,
    total: copper,
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Authenticating with Battle.net...");
  const token = await getToken();
  console.log("Token acquired.\n");

  const itemIds = await resolveItemIds(token);
  console.log();

  fs.mkdirSync(PRICES_DIR, { recursive: true });

  for (const realmSlug of REALMS) {
    console.log(`Fetching auctions for "${realmSlug}"...`);
    const realmId = await getConnectedRealmId(token, realmSlug);
    const auctions = await fetchAuctions(token, realmId);
    console.log(`  ${auctions.length} total auctions.`);

    const items = ENCHANTING_ITEMS.map((item) => {
      const recipeId = itemIds[item.recipeSlug] ?? null;
      const enchantId = itemIds[item.enchantSlug] ?? null;
      const recipePrice = copperToGold(getLowestPrice(auctions, recipeId));
      const enchantPrice = copperToGold(getLowestPrice(auctions, enchantId));
      return {
        category: item.category,
        name: item.name,
        recipe: { name: item.recipeSlug, itemId: recipeId, price: recipePrice },
        enchant: { name: item.enchantSlug, itemId: enchantId, price: enchantPrice },
      };
    });

    const output = {
      realm: realmSlug,
      region: REGION,
      lastUpdated: new Date().toISOString(),
      items,
    };

    const outPath = path.join(PRICES_DIR, `${realmSlug}.json`);
    fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
    console.log(`  Wrote ${outPath}\n`);
  }

  console.log("Done!");
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
