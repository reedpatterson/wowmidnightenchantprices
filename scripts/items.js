// All enchanting recipes in WoW: Midnight
// recipeSlug: exact in-game name of the formula/recipe item sold on AH
// craftSlug: exact in-game name of the crafted item sold on AH
// Item IDs are resolved at runtime via the Blizzard item search API
// and cached in data/item-ids.json. If a name doesn't resolve, set the
// ID manually in data/item-ids.json using the item ID from wowhead.

const ENCHANTING_ITEMS = [
  // ── Rods ────────────────────────────────────────────────────────────────
  {
    category: "Rods",
    name: "Refulgent Copper Rod",
    recipeSlug: "Formula: Refulgent Copper Rod",
    craftSlug: "Refulgent Copper Rod",
  },
  {
    category: "Rods",
    name: "Runed Refulgent Copper Rod",
    recipeSlug: "Formula: Runed Refulgent Copper Rod",
    craftSlug: "Runed Refulgent Copper Rod",
  },
  {
    category: "Rods",
    name: "Runed Brilliant Silver Rod",
    recipeSlug: "Formula: Runed Brilliant Silver Rod",
    craftSlug: "Runed Brilliant Silver Rod",
  },
  {
    category: "Rods",
    name: "Runed Dazzling Thorium Rod",
    recipeSlug: "Formula: Runed Dazzling Thorium Rod",
    craftSlug: "Runed Dazzling Thorium Rod",
  },

  // ── Wands ────────────────────────────────────────────────────────────────
  {
    category: "Wands",
    name: "Magister's Grand Focus",
    recipeSlug: "Formula: Magister's Grand Focus",
    craftSlug: "Magister's Grand Focus",
  },
  {
    category: "Wands",
    name: "Thalassian Spellweaver's Wand",
    recipeSlug: "Formula: Thalassian Spellweaver's Wand",
    craftSlug: "Thalassian Spellweaver's Wand",
  },

  // ── Consumables (Mana Oils) ──────────────────────────────────────────────
  {
    category: "Consumables",
    name: "Oil of Dawn",
    recipeSlug: "Formula: Oil of Dawn",
    craftSlug: "Oil of Dawn",
  },
  {
    category: "Consumables",
    name: "Thalassian Phoenix Oil",
    recipeSlug: "Formula: Thalassian Phoenix Oil",
    craftSlug: "Thalassian Phoenix Oil",
  },

  // ── Boots ────────────────────────────────────────────────────────────────
  {
    category: "Boots",
    name: "Enchant Boots - Farstrider's Hunt",
    recipeSlug: "Formula: Enchant Boots - Farstrider's Hunt",
    craftSlug: "Enchant Boots - Farstrider's Hunt",
  },
  {
    category: "Boots",
    name: "Enchant Boots - Lynx's Dexterity",
    recipeSlug: "Formula: Enchant Boots - Lynx's Dexterity",
    craftSlug: "Enchant Boots - Lynx's Dexterity",
  },
  {
    category: "Boots",
    name: "Enchant Boots - Shaladrassil's Roots",
    recipeSlug: "Formula: Enchant Boots - Shaladrassil's Roots",
    craftSlug: "Enchant Boots - Shaladrassil's Roots",
  },

  // ── Chest ────────────────────────────────────────────────────────────────
  {
    category: "Chest",
    name: "Enchant Chest - Mark of Nalorakk",
    recipeSlug: "Formula: Enchant Chest - Mark of Nalorakk",
    craftSlug: "Enchant Chest - Mark of Nalorakk",
  },
  {
    category: "Chest",
    name: "Enchant Chest - Mark of the Magister",
    recipeSlug: "Formula: Enchant Chest - Mark of the Magister",
    craftSlug: "Enchant Chest - Mark of the Magister",
  },
  {
    category: "Chest",
    name: "Enchant Chest - Mark of the Rootwarden",
    recipeSlug: "Formula: Enchant Chest - Mark of the Rootwarden",
    craftSlug: "Enchant Chest - Mark of the Rootwarden",
  },
  {
    category: "Chest",
    name: "Enchant Chest - Mark of the Worldsoul",
    recipeSlug: "Formula: Enchant Chest - Mark of the Worldsoul",
    craftSlug: "Enchant Chest - Mark of the Worldsoul",
  },

  // ── Helm ─────────────────────────────────────────────────────────────────
  {
    category: "Helm",
    name: "Enchant Helm - Blessing of Speed",
    recipeSlug: "Formula: Enchant Helm - Blessing of Speed",
    craftSlug: "Enchant Helm - Blessing of Speed",
  },
  {
    category: "Helm",
    name: "Enchant Helm - Empowered Blessing of Speed",
    recipeSlug: "Formula: Enchant Helm - Empowered Blessing of Speed",
    craftSlug: "Enchant Helm - Empowered Blessing of Speed",
  },
  {
    category: "Helm",
    name: "Enchant Helm - Hex of Leeching",
    recipeSlug: "Formula: Enchant Helm - Hex of Leeching",
    craftSlug: "Enchant Helm - Hex of Leeching",
  },
  {
    category: "Helm",
    name: "Enchant Helm - Empowered Hex of Leeching",
    recipeSlug: "Formula: Enchant Helm - Empowered Hex of Leeching",
    craftSlug: "Enchant Helm - Empowered Hex of Leeching",
  },
  {
    category: "Helm",
    name: "Enchant Helm - Rune of Avoidance",
    recipeSlug: "Formula: Enchant Helm - Rune of Avoidance",
    craftSlug: "Enchant Helm - Rune of Avoidance",
  },
  {
    category: "Helm",
    name: "Enchant Helm - Empowered Rune of Avoidance",
    recipeSlug: "Formula: Enchant Helm - Empowered Rune of Avoidance",
    craftSlug: "Enchant Helm - Empowered Rune of Avoidance",
  },

  // ── Ring ─────────────────────────────────────────────────────────────────
  {
    category: "Ring",
    name: "Enchant Ring - Amani Mastery",
    recipeSlug: "Formula: Enchant Ring - Amani Mastery",
    craftSlug: "Enchant Ring - Amani Mastery",
  },
  {
    category: "Ring",
    name: "Enchant Ring - Eyes of the Eagle",
    recipeSlug: "Formula: Enchant Ring - Eyes of the Eagle",
    craftSlug: "Enchant Ring - Eyes of the Eagle",
  },
  {
    category: "Ring",
    name: "Enchant Ring - Nature's Fury",
    recipeSlug: "Formula: Enchant Ring - Nature's Fury",
    craftSlug: "Enchant Ring - Nature's Fury",
  },
  {
    category: "Ring",
    name: "Enchant Ring - Nature's Wrath",
    recipeSlug: "Formula: Enchant Ring - Nature's Wrath",
    craftSlug: "Enchant Ring - Nature's Wrath",
  },
  {
    category: "Ring",
    name: "Enchant Ring - Silvermoon's Alacrity",
    recipeSlug: "Formula: Enchant Ring - Silvermoon's Alacrity",
    craftSlug: "Enchant Ring - Silvermoon's Alacrity",
  },
  {
    category: "Ring",
    name: "Enchant Ring - Silvermoon's Tenacity",
    recipeSlug: "Formula: Enchant Ring - Silvermoon's Tenacity",
    craftSlug: "Enchant Ring - Silvermoon's Tenacity",
  },
  {
    category: "Ring",
    name: "Enchant Ring - Thalassian Versatility",
    recipeSlug: "Formula: Enchant Ring - Thalassian Versatility",
    craftSlug: "Enchant Ring - Thalassian Versatility",
  },
  {
    category: "Ring",
    name: "Enchant Ring - Zul'jin's Mastery",
    recipeSlug: "Formula: Enchant Ring - Zul'jin's Mastery",
    craftSlug: "Enchant Ring - Zul'jin's Mastery",
  },

  // ── Shoulders ────────────────────────────────────────────────────────────
  {
    category: "Shoulders",
    name: "Enchant Shoulders - Akil'zon's Swiftness",
    recipeSlug: "Formula: Enchant Shoulders - Akil'zon's Swiftness",
    craftSlug: "Enchant Shoulders - Akil'zon's Swiftness",
  },
  {
    category: "Shoulders",
    name: "Enchant Shoulders - Amirdrassil's Grace",
    recipeSlug: "Formula: Enchant Shoulders - Amirdrassil's Grace",
    craftSlug: "Enchant Shoulders - Amirdrassil's Grace",
  },
  {
    category: "Shoulders",
    name: "Enchant Shoulders - Flight of the Eagle",
    recipeSlug: "Formula: Enchant Shoulders - Flight of the Eagle",
    craftSlug: "Enchant Shoulders - Flight of the Eagle",
  },
  {
    category: "Shoulders",
    name: "Enchant Shoulders - Nature's Grace",
    recipeSlug: "Formula: Enchant Shoulders - Nature's Grace",
    craftSlug: "Enchant Shoulders - Nature's Grace",
  },
  {
    category: "Shoulders",
    name: "Enchant Shoulders - Silvermoon's Mending",
    recipeSlug: "Formula: Enchant Shoulders - Silvermoon's Mending",
    craftSlug: "Enchant Shoulders - Silvermoon's Mending",
  },
  {
    category: "Shoulders",
    name: "Enchant Shoulders - Thalassian Recovery",
    recipeSlug: "Formula: Enchant Shoulders - Thalassian Recovery",
    craftSlug: "Enchant Shoulders - Thalassian Recovery",
  },

  // ── Weapon ───────────────────────────────────────────────────────────────
  {
    category: "Weapon",
    name: "Enchant Weapon - Acuity of the Ren'dorei",
    recipeSlug: "Formula: Enchant Weapon - Acuity of the Ren'dorei",
    craftSlug: "Enchant Weapon - Acuity of the Ren'dorei",
  },
  {
    category: "Weapon",
    name: "Enchant Weapon - Arcane Mastery",
    recipeSlug: "Formula: Enchant Weapon - Arcane Mastery",
    craftSlug: "Enchant Weapon - Arcane Mastery",
  },
  {
    category: "Weapon",
    name: "Enchant Weapon - Berserker's Rage",
    recipeSlug: "Formula: Enchant Weapon - Berserker's Rage",
    craftSlug: "Enchant Weapon - Berserker's Rage",
  },
  {
    category: "Weapon",
    name: "Enchant Weapon - Flames of the Sin'dorei",
    recipeSlug: "Formula: Enchant Weapon - Flames of the Sin'dorei",
    craftSlug: "Enchant Weapon - Flames of the Sin'dorei",
  },
  {
    category: "Weapon",
    name: "Enchant Weapon - Jan'alai's Precision",
    recipeSlug: "Formula: Enchant Weapon - Jan'alai's Precision",
    craftSlug: "Enchant Weapon - Jan'alai's Precision",
  },
  {
    category: "Weapon",
    name: "Enchant Weapon - Strength of Halazzi",
    recipeSlug: "Formula: Enchant Weapon - Strength of Halazzi",
    craftSlug: "Enchant Weapon - Strength of Halazzi",
  },
  {
    category: "Weapon",
    name: "Enchant Weapon - Worldsoul Aegis",
    recipeSlug: "Formula: Enchant Weapon - Worldsoul Aegis",
    craftSlug: "Enchant Weapon - Worldsoul Aegis",
  },
  {
    category: "Weapon",
    name: "Enchant Weapon - Worldsoul Cradle",
    recipeSlug: "Formula: Enchant Weapon - Worldsoul Cradle",
    craftSlug: "Enchant Weapon - Worldsoul Cradle",
  },
  {
    category: "Weapon",
    name: "Enchant Weapon - Worldsoul Tenacity",
    recipeSlug: "Formula: Enchant Weapon - Worldsoul Tenacity",
    craftSlug: "Enchant Weapon - Worldsoul Tenacity",
  },

  // ── Tool ─────────────────────────────────────────────────────────────────
  {
    category: "Tool",
    name: "Enchant Tool - Amani Perception",
    recipeSlug: "Formula: Enchant Tool - Amani Perception",
    craftSlug: "Enchant Tool - Amani Perception",
  },
  {
    category: "Tool",
    name: "Enchant Tool - Amani Resourcefulness",
    recipeSlug: "Formula: Enchant Tool - Amani Resourcefulness",
    craftSlug: "Enchant Tool - Amani Resourcefulness",
  },
  {
    category: "Tool",
    name: "Enchant Tool - Haranir Finesse",
    recipeSlug: "Formula: Enchant Tool - Haranir Finesse",
    craftSlug: "Enchant Tool - Haranir Finesse",
  },
  {
    category: "Tool",
    name: "Enchant Tool - Haranir Multicrafting",
    recipeSlug: "Formula: Enchant Tool - Haranir Multicrafting",
    craftSlug: "Enchant Tool - Haranir Multicrafting",
  },
  {
    category: "Tool",
    name: "Enchant Tool - Ren'dorei Ingenuity",
    recipeSlug: "Formula: Enchant Tool - Ren'dorei Ingenuity",
    craftSlug: "Enchant Tool - Ren'dorei Ingenuity",
  },
  {
    category: "Tool",
    name: "Enchant Tool - Sin'dorei Deftness",
    recipeSlug: "Formula: Enchant Tool - Sin'dorei Deftness",
    craftSlug: "Enchant Tool - Sin'dorei Deftness",
  },

  // ── Cosmetics ────────────────────────────────────────────────────────────
  {
    category: "Cosmetics",
    name: "Illusory Adornment - Blooming Light",
    recipeSlug: "Formula: Illusory Adornment - Blooming Light",
    craftSlug: "Illusory Adornment - Blooming Light",
  },
  {
    category: "Cosmetics",
    name: "Illusory Adornment - Voidtouched",
    recipeSlug: "Formula: Illusory Adornment - Voidtouched",
    craftSlug: "Illusory Adornment - Voidtouched",
  },
];

// ── Alchemy ───────────────────────────────────────────────────────────────────
// recipeSlug format: "Recipe: <item name>"
// craftSlug: exact in-game name of the crafted item sold on AH

const ALCHEMY_ITEMS = [
  // Add Midnight Alchemy items here, e.g.:
  // {
  //   category: "Potions",
  //   name: "Potion of Example",
  //   recipeSlug: "Recipe: Potion of Example",
  //   craftSlug: "Potion of Example",
  // },
];

// ── Jewelcrafting ─────────────────────────────────────────────────────────────
// recipeSlug format: "Design: <item name>"
// craftSlug: exact in-game name of the crafted item sold on AH

const JEWELCRAFTING_ITEMS = [
  // Add Midnight Jewelcrafting items here, e.g.:
  // {
  //   category: "Gems",
  //   name: "Example Gem",
  //   recipeSlug: "Design: Example Gem",
  //   craftSlug: "Example Gem",
  // },
];

// ── Profession groups ─────────────────────────────────────────────────────────
// professionId: Blizzard Game Data API profession ID
// The latest skill tier is discovered dynamically at runtime.

const PROFESSION_GROUPS = [
  { professionId: 333, label: "Enchanting",    items: ENCHANTING_ITEMS,    recipePrefix: "Formula", autoDiscover: true },
  { professionId: 171, label: "Alchemy",       items: ALCHEMY_ITEMS,       recipePrefix: "Recipe",  autoDiscover: true },
  { professionId: 755, label: "Jewelcrafting", items: JEWELCRAFTING_ITEMS, recipePrefix: "Design",  autoDiscover: true },
];

const ALL_ITEMS = [...ENCHANTING_ITEMS, ...ALCHEMY_ITEMS, ...JEWELCRAFTING_ITEMS];

module.exports = { ENCHANTING_ITEMS, ALCHEMY_ITEMS, JEWELCRAFTING_ITEMS, PROFESSION_GROUPS, ALL_ITEMS };
