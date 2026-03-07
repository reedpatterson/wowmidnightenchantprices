require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { PROFESSION_GROUPS } = require("./items");
const config = require("../config.json");

const REGION = config.region;
const REALMS = config.realms;
const API_BASE = `https://${REGION}.api.blizzard.com`;
const DYNAMIC_NS = `dynamic-${REGION}`;
const STATIC_NS = `static-${REGION}`;
const ITEM_IDS_PATH = path.join(__dirname, "../data/item-ids.json");
const RECIPE_MATERIALS_PATH = path.join(__dirname, "../data/recipe-materials.json");
const RECIPE_DETAILS_PATH = path.join(__dirname, "../data/recipe-details.json");
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

async function resolveItemIds(token, items) {
  let cached = {};
  if (fs.existsSync(ITEM_IDS_PATH)) {
    cached = JSON.parse(fs.readFileSync(ITEM_IDS_PATH, "utf8"));
  }

  const slugsToResolve = new Set();
  for (const item of items) {
    if (!(item.recipeSlug in cached)) slugsToResolve.add(item.recipeSlug);
    // Re-resolve craft slugs if the R2 quality sentinel is absent
    if (!(item.craftSlug in cached) || !(item.craftSlug + "|r2" in cached)) {
      slugsToResolve.add(item.craftSlug);
    }
  }

  if (slugsToResolve.size > 0) {
    console.log(`Resolving ${slugsToResolve.size} item name(s) via Blizzard API...`);
    for (const slug of slugsToResolve) {
      // Recipe items (Formula:/Recipe:/Design: etc.) are single-quality; crafted items may have R2
      const isRecipe = /^(Formula|Recipe|Design|Technique|Schematic|Plans|Pattern):/.test(slug);
      const results = await searchItemByName(token, slug);
      const matches = results
        .filter((r) => r.data?.name?.en_US === slug)
        .sort((a, b) => (a.data.quality?.id ?? 0) - (b.data.quality?.id ?? 0));

      if (matches.length > 0) {
        cached[slug] = matches[0].data.id;
        console.log(`  [OK] "${slug}" => ${matches[0].data.id}`);
        if (!isRecipe) {
          cached[slug + "|r2"] = matches[1]?.data.id ?? null;
          if (matches[1]) console.log(`  [OK] "${slug}|r2" => ${matches[1].data.id}`);
        }
      } else {
        cached[slug] = null;
        if (!isRecipe) cached[slug + "|r2"] = null;
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

// ── Auto-discovery ────────────────────────────────────────────────────────────
// Fetches ALL recipes from a profession's latest skill tier via the Blizzard
// Professions API and returns them as a structured items array. Recipe details
// (crafted item ID + reagents) are cached in data/recipe-details.json so they
// are only fetched once. The reagents are also written into recipe-materials.json
// so subsequent runs skip the discoverRecipeMaterials step for these professions.

async function buildAutoDiscoverItems(token, professionId, label, recipePrefix) {
  let detailsCache = {};
  if (fs.existsSync(RECIPE_DETAILS_PATH)) {
    detailsCache = JSON.parse(fs.readFileSync(RECIPE_DETAILS_PATH, "utf8"));
  }

  console.log(`Auto-discovering ${label} recipes...`);

  const profDetail = await bnetGet(
    token,
    `/data/wow/profession/${professionId}?namespace=${STATIC_NS}&locale=en_US`
  );
  const skillTiers = profDetail.skill_tiers || [];
  if (skillTiers.length === 0) {
    console.warn(`  No skill tiers found for ${label}. Skipping.`);
    return [];
  }
  const latestTier = skillTiers[skillTiers.length - 1];
  console.log(`  Skill tier: "${latestTier.name}" (id: ${latestTier.id})`);

  // Append locale so recipe stub names come back as strings, not localized objects
  const tierUrl = latestTier.key.href + (latestTier.key.href.includes("?") ? "&" : "?") + "locale=en_US";
  const tierDetail = await bnetGet(token, tierUrl);

  const items = [];
  let newDetails = 0;

  for (const cat of tierDetail.categories || []) {
    // Category name may also be a localized object if locale wasn't applied at this level
    const catName = typeof cat.name === "object" ? (cat.name.en_US ?? cat.name) : cat.name;

    for (const recipeStub of cat.recipes || []) {
      const recipeIdStr = String(recipeStub.id);
      const stubName = typeof recipeStub.name === "object" ? (recipeStub.name.en_US ?? String(recipeStub.name)) : recipeStub.name;

      if (!(recipeIdStr in detailsCache)) {
        try {
          const detail = await bnetGet(
            token,
            `/data/wow/recipe/${recipeStub.id}?namespace=${STATIC_NS}&locale=en_US`
          );
          const reagents = (detail.reagents || []).map((r) => ({
            name: r.reagent.name,
            itemId: r.reagent.id,
            qty: r.quantity,
          }));
          // Filter by reagents: utility recipes (Recraft Equipment, etc.) have none
          if (reagents.length > 0) {
            detailsCache[recipeIdStr] = {
              category: catName,
              // crafted_item may be absent for enchanting scrolls; fall back to recipe stub name
              craftedItemName: detail.crafted_item?.name ?? stubName,
              reagents,
            };
          } else {
            detailsCache[recipeIdStr] = null;
          }
        } catch {
          console.warn(`  [ERROR] Could not fetch recipe ${recipeStub.id} ("${stubName}") — will retry next run`);
          // Don't cache failures so transient errors are retried on the next run
        }
        newDetails++;
      }

      const entry = detailsCache[recipeIdStr];
      if (!entry) continue;

      const craftSlug = entry.craftedItemName;
      // Carry reagents on the item so main() can populate recipeMaterials after resolveItemIds
      items.push({
        profession: label,
        category: entry.category,
        name: entry.craftedItemName,
        recipeSlug: `${recipePrefix}: ${entry.craftedItemName}`,
        craftSlug,
        _reagents: entry.reagents,
      });
    }
  }

  if (newDetails > 0) {
    fs.mkdirSync(path.join(__dirname, "../data"), { recursive: true });
    fs.writeFileSync(RECIPE_DETAILS_PATH, JSON.stringify(detailsCache, null, 2));
    console.log(`  Fetched ${newDetails} new recipe detail(s).`);
  } else {
    console.log(`  All recipe details already cached.`);
  }

  console.log(`  Found ${items.length} ${label} recipe(s) with reagents.`);
  return items;
}

// ── Recipe material discovery ─────────────────────────────────────────────────
// Fetches reagent requirements for each crafted item via the Blizzard Professions
// API. Results are cached in data/recipe-materials.json.
// Key: crafted item ID (string) => array of { name, itemId, qty }
// Call once per profession group; the cache is shared across all professions.

async function discoverRecipeMaterials(token, items, itemIds, professionId, label) {
  let cached = {};
  if (fs.existsSync(RECIPE_MATERIALS_PATH)) {
    cached = JSON.parse(fs.readFileSync(RECIPE_MATERIALS_PATH, "utf8"));
  }

  // Re-discover any item whose materials are absent or empty.
  const itemsToDiscover = items.filter((item) => {
    const craftId = itemIds[item.craftSlug] ?? null;
    if (craftId === null) return false;
    const entry = cached[String(craftId)];
    return !Array.isArray(entry) || entry.length === 0;
  });

  if (itemsToDiscover.length === 0) {
    console.log(`  ${label} materials already cached.`);
    return cached;
  }

  // Build a lookup: recipe name => craft item ID, for items we need to discover
  const nameToCraftId = {};
  for (const item of itemsToDiscover) {
    const craftId = itemIds[item.craftSlug] ?? null;
    if (craftId !== null) nameToCraftId[item.name] = craftId;
  }

  console.log(`Discovering materials for ${itemsToDiscover.length} ${label} item(s)...`);

  // Dynamically find the latest skill tier for this profession
  const profDetail = await bnetGet(
    token,
    `/data/wow/profession/${professionId}?namespace=${STATIC_NS}&locale=en_US`
  );
  const skillTiers = profDetail.skill_tiers || [];
  if (skillTiers.length === 0) throw new Error(`No skill tiers found for profession ${professionId} (${label}).`);
  const latestTier = skillTiers[skillTiers.length - 1];
  console.log(`  Skill tier: "${latestTier.name}" (id: ${latestTier.id})`);

  const tierHref = latestTier.key?.href;
  if (!tierHref) throw new Error(`No href for skill tier "${latestTier.name}"`);
  const tierDetail = await bnetGet(token, tierHref);

  // For each recipe in the tier, check if it matches one of our items, then fetch reagents
  let fetched = 0;
  for (const category of tierDetail.categories || []) {
    for (const recipeStub of category.recipes || []) {
      const craftId = nameToCraftId[recipeStub.name];
      if (craftId === undefined) continue;

      let recipeDetail;
      try {
        recipeDetail = await bnetGet(
          token,
          `/data/wow/recipe/${recipeStub.id}?namespace=${STATIC_NS}&locale=en_US`
        );
      } catch {
        console.warn(`  [ERROR] Could not fetch recipe ${recipeStub.id} ("${recipeStub.name}")`);
        cached[String(craftId)] = [];
        continue;
      }

      const reagents = (recipeDetail.reagents || []).map((r) => ({
        name: r.reagent.name,
        itemId: r.reagent.id,
        qty: r.quantity,
      }));

      cached[String(craftId)] = reagents;

      if (reagents.length > 0) {
        console.log(`  [OK] "${recipeStub.name}": ${reagents.map((r) => `${r.qty}x ${r.name}`).join(", ")}`);
        fetched++;
      } else {
        console.warn(`  [EMPTY] "${recipeStub.name}" has no reagents in API`);
      }

      delete nameToCraftId[recipeStub.name];
    }
  }

  // Anything still in nameToCraftId wasn't matched in the skill tier
  for (const [name, craftId] of Object.entries(nameToCraftId)) {
    if (!Array.isArray(cached[String(craftId)]) || cached[String(craftId)].length === 0) {
      cached[String(craftId)] = [];
      console.warn(`  [NOT FOUND] No recipe matched for "${name}" in "${latestTier.name}"`);
    }
  }

  console.log(`  Found materials for ${fetched}/${itemsToDiscover.length} items.`);
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

function getMarketData(auctions, itemId) {
  if (!itemId) return { price: null, available: 0 };
  const relevant = auctions.filter((a) => a.item?.id === itemId);
  const prices = relevant.map((a) => a.buyout || a.unit_price || 0).filter((p) => p > 0);
  return {
    price: prices.length > 0 ? Math.min(...prices) : null,
    available: relevant.reduce((sum, a) => sum + (a.quantity || 1), 0),
  };
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

  // Auto-discover items for Alchemy, Jewelcrafting, etc.
  const discoveredItems = [];
  for (const group of PROFESSION_GROUPS) {
    if (!group.autoDiscover) continue;
    const found = await buildAutoDiscoverItems(token, group.professionId, group.label, group.recipePrefix);
    discoveredItems.push(...found);
    console.log();
  }

  // Combine manual items (non-autoDiscover groups only, tagged with profession) + discovered items
  // If all groups are autoDiscover, taggedManualItems is empty and allItems = discoveredItems
  const taggedManualItems = PROFESSION_GROUPS
    .filter((g) => !g.autoDiscover)
    .flatMap((g) => g.items.map((item) => ({ ...item, profession: g.label })));
  const allItems = [...taggedManualItems, ...discoveredItems];

  const itemIds = await resolveItemIds(token, allItems);
  console.log();

  // Load existing materials cache, then build on top of it
  let recipeMaterials = {};
  if (fs.existsSync(RECIPE_MATERIALS_PATH)) {
    recipeMaterials = JSON.parse(fs.readFileSync(RECIPE_MATERIALS_PATH, "utf8"));
  }

  // Discover materials for manual profession groups via the profession API
  for (const { professionId, label, items, autoDiscover } of PROFESSION_GROUPS) {
    if (autoDiscover || items.length === 0) continue;
    Object.assign(recipeMaterials, await discoverRecipeMaterials(token, items, itemIds, professionId, label));
    console.log();
  }

  // Populate materials for auto-discovered items using resolved item IDs
  for (const item of discoveredItems) {
    const craftId = itemIds[item.craftSlug] ?? null;
    if (craftId !== null) {
      const key = String(craftId);
      if (!Array.isArray(recipeMaterials[key]) || recipeMaterials[key].length === 0) {
        recipeMaterials[key] = item._reagents;
      }
    }
  }

  fs.mkdirSync(path.join(__dirname, "../data"), { recursive: true });
  fs.writeFileSync(RECIPE_MATERIALS_PATH, JSON.stringify(recipeMaterials, null, 2));

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

    const items = allItems.map((item) => {
      const recipeId  = itemIds[item.recipeSlug] ?? null;
      const craftId   = itemIds[item.craftSlug] ?? null;
      const craftIdR2 = itemIds[item.craftSlug + "|r2"] ?? null;

      const recipeMarket  = getMarketData(auctions, recipeId);
      const craftMarket   = getMarketData(auctions, craftId);
      const craftMarketR2 = getMarketData(auctions, craftIdR2);

      const recipePrice  = copperToGold(recipeMarket.price);
      const craftPrice   = copperToGold(craftMarket.price);
      const craftPriceR2 = copperToGold(craftMarketR2.price);

      // Materials and cost per craft
      const rawMats = craftId ? recipeMaterials[String(craftId)] : null;
      const matList = Array.isArray(rawMats) ? rawMats : [];
      const materials = matList.map((mat) => {
        const unitPrice = copperToGold(getMarketData(auctions, mat.itemId).price);
        const totalCost = unitPrice ? copperToGold(unitPrice.total * mat.qty) : null;
        const icon = itemIcons[String(mat.itemId)] ?? null;
        return { name: mat.name, itemId: mat.itemId, qty: mat.qty, unitPrice, totalCost, icon };
      });

      const materialCostTotal = materials.every((m) => m.totalCost !== null)
        ? copperToGold(materials.reduce((sum, m) => sum + m.totalCost.total, 0))
        : null;

      // Profit per craft = craft sell price (after 5% AH cut) - material cost
      const profitPerCraft =
        craftPrice && materialCostTotal
          ? copperToGold(Math.round(craftPrice.total * 0.95) - materialCostTotal.total)
          : null;

      // Break-even = how many crafts to recoup the recipe cost
      const breakEven =
        recipePrice && profitPerCraft && profitPerCraft.total > 0
          ? Math.ceil(recipePrice.total / profitPerCraft.total)
          : null;

      return {
        profession: item.profession,
        category: item.category,
        name: item.name,
        recipe: { name: item.recipeSlug, itemId: recipeId, price: recipePrice, available: recipeMarket.available },
        craft: {
          name: item.craftSlug,
          itemId: craftId,
          price: craftPrice,
          available: craftMarket.available,
          itemIdR2: craftIdR2,
          priceR2: craftPriceR2,
          availableR2: craftMarketR2.available,
        },
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
