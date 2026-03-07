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
const RECIPE_MATERIALS_PATH = path.join(__dirname, "../data/recipe-materials.json");
const ITEM_ICONS_PATH = path.join(__dirname, "../data/item-icons.json");
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
  return (await res.json()).access_token;
}

// ── Generic API helper ────────────────────────────────────────────────────────

async function bnetGet(token, endpoint) {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`API error ${res.status}: ${url}`);
  return res.json();
}

// ── Item ID resolution ────────────────────────────────────────────────────────

async function searchItemByName(token, name) {
  const url = `${API_BASE}/data/wow/search/item?namespace=${STATIC_NS}&locale=en_US&name.en_US=${encodeURIComponent(name)}&_pageSize=20`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) return [];
  return (await res.json()).results || [];
}

async function resolveItemIds(token) {
  let cached = {};
  if (fs.existsSync(ITEM_IDS_PATH)) {
    cached = JSON.parse(fs.readFileSync(ITEM_IDS_PATH, "utf8"));
  }

  const slugsToResolve = new Set();
  for (const item of ENCHANTING_ITEMS) {
    if (!(item.recipeSlug in cached)) slugsToResolve.add(item.recipeSlug);
    // Re-resolve enchant slugs if the R2 quality sentinel is absent
    if (!(item.enchantSlug in cached) || !(item.enchantSlug + "|r2" in cached)) {
      slugsToResolve.add(item.enchantSlug);
    }
  }

  if (slugsToResolve.size > 0) {
    console.log(`Resolving ${slugsToResolve.size} item name(s) via Blizzard API...`);
    for (const slug of slugsToResolve) {
      const isFormula = slug.startsWith("Formula:");
      const results = await searchItemByName(token, slug);
      const matches = results
        .filter((r) => r.data?.name?.en_US === slug)
        .sort((a, b) => (a.data.quality?.id ?? 0) - (b.data.quality?.id ?? 0));

      if (matches.length > 0) {
        cached[slug] = matches[0].data.id;
        console.log(`  [OK] "${slug}" => ${matches[0].data.id}`);
        if (!isFormula) {
          cached[slug + "|r2"] = matches[1]?.data.id ?? null;
          if (matches[1]) console.log(`  [OK] "${slug}|r2" => ${matches[1].data.id}`);
        }
      } else {
        cached[slug] = null;
        if (!isFormula) cached[slug + "|r2"] = null;
        console.warn(`  [NOT FOUND] "${slug}" — set ID manually in data/item-ids.json`);
      }
    }
    fs.mkdirSync(path.dirname(ITEM_IDS_PATH), { recursive: true });
    fs.writeFileSync(ITEM_IDS_PATH, JSON.stringify(cached, null, 2));
  } else {
    console.log("All item IDs already cached.");
  }

  return cached;
}

// ── Recipe material discovery ─────────────────────────────────────────────────
// Fetches reagent requirements for each enchanting recipe from the Blizzard
// Professions API. Results are cached in data/recipe-materials.json.
// Key: crafted enchant item ID (string) => array of { name, itemId, qty }

async function discoverRecipeMaterials(token, items, itemIds) {
  let cached = {};
  if (fs.existsSync(RECIPE_MATERIALS_PATH)) {
    cached = JSON.parse(fs.readFileSync(RECIPE_MATERIALS_PATH, "utf8"));
  }

  // Re-discover any enchant whose materials are absent or empty.
  const itemsToDiscover = items.filter((item) => {
    const enchantId = itemIds[item.enchantSlug] ?? null;
    if (enchantId === null) return false;
    const entry = cached[String(enchantId)];
    return !Array.isArray(entry) || entry.length === 0;
  });

  if (itemsToDiscover.length === 0) {
    console.log("Recipe materials already cached.");
    return cached;
  }

  // Build a lookup: recipe name => enchant item ID, for the items we need
  const nameToEnchantId = {};
  for (const item of itemsToDiscover) {
    const enchantId = itemIds[item.enchantSlug] ?? null;
    if (enchantId !== null) nameToEnchantId[item.name] = enchantId;
  }

  console.log(`Discovering materials for ${itemsToDiscover.length} enchant(s) via Professions API...`);

  // Enchanting profession ID = 333; Midnight Enchanting skill tier ID = 2909
  console.log("  Fetching Midnight Enchanting skill tier (profession 333, tier 2909)...");
  const tierDetail = await bnetGet(
    token,
    `/data/wow/profession/333/skill-tier/2909?namespace=${STATIC_NS}&locale=en_US`
  );

  // For each recipe, check if its name matches one of our enchants, then fetch reagents
  let fetched = 0;
  for (const category of tierDetail.categories || []) {
    for (const recipeStub of category.recipes || []) {
      const enchantId = nameToEnchantId[recipeStub.name];
      if (enchantId === undefined) continue; // not one we care about

      let recipeDetail;
      try {
        recipeDetail = await bnetGet(
          token,
          `/data/wow/recipe/${recipeStub.id}?namespace=${STATIC_NS}&locale=en_US`
        );
      } catch {
        console.warn(`  [ERROR] Could not fetch recipe ${recipeStub.id} ("${recipeStub.name}")`);
        cached[String(enchantId)] = [];
        continue;
      }

      const reagents = (recipeDetail.reagents || []).map((r) => ({
        name: r.reagent.name,
        itemId: r.reagent.id,
        qty: r.quantity,
      }));

      cached[String(enchantId)] = reagents;

      if (reagents.length > 0) {
        console.log(`  [OK] "${recipeStub.name}": ${reagents.map((r) => `${r.qty}x ${r.name}`).join(", ")}`);
        fetched++;
      } else {
        console.warn(`  [EMPTY] "${recipeStub.name}" has no reagents in API`);
      }

      delete nameToEnchantId[recipeStub.name]; // mark as found
    }
  }

  // Anything still in nameToEnchantId wasn't matched by name in the skill tier
  for (const [name, enchantId] of Object.entries(nameToEnchantId)) {
    if (!Array.isArray(cached[String(enchantId)]) || cached[String(enchantId)].length === 0) {
      cached[String(enchantId)] = [];
      console.warn(`  [NOT FOUND] No recipe matched for "${name}" in Midnight Enchanting skill tier.`);
    }
  }

  console.log(`  Found materials for ${fetched}/${itemsToDiscover.length} enchants.`);
  fs.mkdirSync(path.dirname(RECIPE_MATERIALS_PATH), { recursive: true });
  fs.writeFileSync(RECIPE_MATERIALS_PATH, JSON.stringify(cached, null, 2));

  return cached;
}

// ── Item icon resolution ──────────────────────────────────────────────────────
// Fetches CDN icon URLs for a set of item IDs. Cached in data/item-icons.json.
// Key: item ID (string) => icon URL string or null

async function resolveItemIcons(token, itemIds) {
  let cached = {};
  if (fs.existsSync(ITEM_ICONS_PATH)) {
    cached = JSON.parse(fs.readFileSync(ITEM_ICONS_PATH, "utf8"));
  }

  const toFetch = itemIds.filter((id) => !(String(id) in cached));
  if (toFetch.length === 0) {
    console.log("Item icons already cached.");
    return cached;
  }

  console.log(`Resolving ${toFetch.length} item icon(s)...`);
  for (const id of toFetch) {
    try {
      const data = await bnetGet(token, `/data/wow/media/item/${id}?namespace=${STATIC_NS}`);
      cached[String(id)] = data.assets?.find((a) => a.key === "icon")?.value ?? null;
    } catch {
      cached[String(id)] = null;
    }
  }

  fs.mkdirSync(path.dirname(ITEM_ICONS_PATH), { recursive: true });
  fs.writeFileSync(ITEM_ICONS_PATH, JSON.stringify(cached, null, 2));
  console.log("  Done.");
  return cached;
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

// ── Auction house ─────────────────────────────────────────────────────────────

async function fetchAuctions(token, connectedRealmId) {
  const [ahRes, commRes] = await Promise.all([
    fetch(`${API_BASE}/data/wow/connected-realm/${connectedRealmId}/auctions?namespace=${DYNAMIC_NS}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
    fetch(`${API_BASE}/data/wow/auctions/commodities?namespace=${DYNAMIC_NS}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  ]);
  const ahData = ahRes.ok ? await ahRes.json() : { auctions: [] };
  const commData = commRes.ok ? await commRes.json() : { auctions: [] };
  return [...(ahData.auctions || []), ...(commData.auctions || [])];
}

function getLowestPrice(auctions, itemId) {
  if (!itemId) return null;
  const relevant = auctions.filter((a) => a.item?.id === itemId);
  const prices = relevant.map((a) => a.buyout || a.unit_price || 0).filter((p) => p > 0);
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

  const recipeMaterials = await discoverRecipeMaterials(token, ENCHANTING_ITEMS, itemIds);
  console.log();

  const materialItemIds = new Set();
  for (const mats of Object.values(recipeMaterials)) {
    if (Array.isArray(mats)) for (const m of mats) if (m.itemId) materialItemIds.add(m.itemId);
  }
  const itemIcons = await resolveItemIcons(token, [...materialItemIds]);
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
      const enchantIdR2 = itemIds[item.enchantSlug + "|r2"] ?? null;
      const recipePrice = copperToGold(getLowestPrice(auctions, recipeId));
      const enchantPrice = copperToGold(getLowestPrice(auctions, enchantId));
      const enchantPriceR2 = copperToGold(getLowestPrice(auctions, enchantIdR2));

      // Materials and cost per craft
      const rawMats = enchantId ? recipeMaterials[String(enchantId)] : null;
      const matList = Array.isArray(rawMats) ? rawMats : [];
      const materials = matList.map((mat) => {
        const unitPrice = copperToGold(getLowestPrice(auctions, mat.itemId));
        const totalCost = unitPrice ? copperToGold(unitPrice.total * mat.qty) : null;
        const icon = itemIcons[String(mat.itemId)] ?? null;
        return { name: mat.name, itemId: mat.itemId, qty: mat.qty, unitPrice, totalCost, icon };
      });

      const materialCostTotal = materials.every((m) => m.totalCost !== null)
        ? copperToGold(materials.reduce((sum, m) => sum + m.totalCost.total, 0))
        : null;

      // Profit per craft = enchant sell price - material cost
      const profitPerCraft =
        enchantPrice && materialCostTotal
          ? copperToGold(enchantPrice.total - materialCostTotal.total)
          : null;

      // Break-even = how many crafts to recoup the formula cost
      const breakEven =
        recipePrice && profitPerCraft && profitPerCraft.total > 0
          ? Math.ceil(recipePrice.total / profitPerCraft.total)
          : null;

      return {
        category: item.category,
        name: item.name,
        recipe: { name: item.recipeSlug, itemId: recipeId, price: recipePrice },
        enchant: { name: item.enchantSlug, itemId: enchantId, price: enchantPrice, itemIdR2: enchantIdR2, priceR2: enchantPriceR2 },
        materials,
        materialCostTotal,
        profitPerCraft,
        breakEven,
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
