// All enchanting recipes in WoW: Midnight
// recipeSlug: exact in-game name of the formula/recipe item sold on AH
// enchantSlug: exact in-game name of the crafted item sold on AH
// Item IDs are resolved at runtime via the Blizzard item search API
// and cached in data/item-ids.json. If a name doesn't resolve, set the
// ID manually in data/item-ids.json using the item ID from wowhead.

const ENCHANTING_ITEMS = [
  // ── Rods ────────────────────────────────────────────────────────────────
  {
    category: "Rods",
    name: "Refulgent Copper Rod",
    recipeSlug: "Formula: Refulgent Copper Rod",
    enchantSlug: "Refulgent Copper Rod",
  },
  {
    category: "Rods",
    name: "Runed Refulgent Copper Rod",
    recipeSlug: "Formula: Runed Refulgent Copper Rod",
    enchantSlug: "Runed Refulgent Copper Rod",
  },
  {
    category: "Rods",
    name: "Runed Brilliant Silver Rod",
    recipeSlug: "Formula: Runed Brilliant Silver Rod",
    enchantSlug: "Runed Brilliant Silver Rod",
  },
  {
    category: "Rods",
    name: "Runed Dazzling Thorium Rod",
    recipeSlug: "Formula: Runed Dazzling Thorium Rod",
    enchantSlug: "Runed Dazzling Thorium Rod",
  },

  // ── Wands ────────────────────────────────────────────────────────────────
  {
    category: "Wands",
    name: "Magister's Grand Focus",
    recipeSlug: "Formula: Magister's Grand Focus",
    enchantSlug: "Magister's Grand Focus",
  },
  {
    category: "Wands",
    name: "Thalassian Spellweaver's Wand",
    recipeSlug: "Formula: Thalassian Spellweaver's Wand",
    enchantSlug: "Thalassian Spellweaver's Wand",
  },

  // ── Consumables (Mana Oils) ──────────────────────────────────────────────
  {
    category: "Consumables",
    name: "Oil of Dawn",
    recipeSlug: "Formula: Oil of Dawn",
    enchantSlug: "Oil of Dawn",
  },
  {
    category: "Consumables",
    name: "Thalassian Phoenix Oil",
    recipeSlug: "Formula: Thalassian Phoenix Oil",
    enchantSlug: "Thalassian Phoenix Oil",
  },

  // ── Boots ────────────────────────────────────────────────────────────────
  {
    category: "Boots",
    name: "Enchant Boots - Farstrider's Hunt",
    recipeSlug: "Formula: Enchant Boots - Farstrider's Hunt",
    enchantSlug: "Enchant Boots - Farstrider's Hunt",
  },
  {
    category: "Boots",
    name: "Enchant Boots - Lynx's Dexterity",
    recipeSlug: "Formula: Enchant Boots - Lynx's Dexterity",
    enchantSlug: "Enchant Boots - Lynx's Dexterity",
  },
  {
    category: "Boots",
    name: "Enchant Boots - Shaladrassil's Roots",
    recipeSlug: "Formula: Enchant Boots - Shaladrassil's Roots",
    enchantSlug: "Enchant Boots - Shaladrassil's Roots",
  },

  // ── Chest ────────────────────────────────────────────────────────────────
  {
    category: "Chest",
    name: "Enchant Chest - Mark of Nalorakk",
    recipeSlug: "Formula: Enchant Chest - Mark of Nalorakk",
    enchantSlug: "Enchant Chest - Mark of Nalorakk",
  },
  {
    category: "Chest",
    name: "Enchant Chest - Mark of the Magister",
    recipeSlug: "Formula: Enchant Chest - Mark of the Magister",
    enchantSlug: "Enchant Chest - Mark of the Magister",
  },
  {
    category: "Chest",
    name: "Enchant Chest - Mark of the Rootwarden",
    recipeSlug: "Formula: Enchant Chest - Mark of the Rootwarden",
    enchantSlug: "Enchant Chest - Mark of the Rootwarden",
  },
  {
    category: "Chest",
    name: "Enchant Chest - Mark of the Worldsoul",
    recipeSlug: "Formula: Enchant Chest - Mark of the Worldsoul",
    enchantSlug: "Enchant Chest - Mark of the Worldsoul",
  },

  // ── Helm ─────────────────────────────────────────────────────────────────
  {
    category: "Helm",
    name: "Enchant Helm - Blessing of Speed",
    recipeSlug: "Formula: Enchant Helm - Blessing of Speed",
    enchantSlug: "Enchant Helm - Blessing of Speed",
  },
  {
    category: "Helm",
    name: "Enchant Helm - Empowered Blessing of Speed",
    recipeSlug: "Formula: Enchant Helm - Empowered Blessing of Speed",
    enchantSlug: "Enchant Helm - Empowered Blessing of Speed",
  },
  {
    category: "Helm",
    name: "Enchant Helm - Hex of Leeching",
    recipeSlug: "Formula: Enchant Helm - Hex of Leeching",
    enchantSlug: "Enchant Helm - Hex of Leeching",
  },
  {
    category: "Helm",
    name: "Enchant Helm - Empowered Hex of Leeching",
    recipeSlug: "Formula: Enchant Helm - Empowered Hex of Leeching",
    enchantSlug: "Enchant Helm - Empowered Hex of Leeching",
  },
  {
    category: "Helm",
    name: "Enchant Helm - Rune of Avoidance",
    recipeSlug: "Formula: Enchant Helm - Rune of Avoidance",
    enchantSlug: "Enchant Helm - Rune of Avoidance",
  },
  {
    category: "Helm",
    name: "Enchant Helm - Empowered Rune of Avoidance",
    recipeSlug: "Formula: Enchant Helm - Empowered Rune of Avoidance",
    enchantSlug: "Enchant Helm - Empowered Rune of Avoidance",
  },

  // ── Ring ─────────────────────────────────────────────────────────────────
  {
    category: "Ring",
    name: "Enchant Ring - Amani Mastery",
    recipeSlug: "Formula: Enchant Ring - Amani Mastery",
    enchantSlug: "Enchant Ring - Amani Mastery",
  },
  {
    category: "Ring",
    name: "Enchant Ring - Eyes of the Eagle",
    recipeSlug: "Formula: Enchant Ring - Eyes of the Eagle",
    enchantSlug: "Enchant Ring - Eyes of the Eagle",
  },
  {
    category: "Ring",
    name: "Enchant Ring - Nature's Fury",
    recipeSlug: "Formula: Enchant Ring - Nature's Fury",
    enchantSlug: "Enchant Ring - Nature's Fury",
  },
  {
    category: "Ring",
    name: "Enchant Ring - Nature's Wrath",
    recipeSlug: "Formula: Enchant Ring - Nature's Wrath",
    enchantSlug: "Enchant Ring - Nature's Wrath",
  },
  {
    category: "Ring",
    name: "Enchant Ring - Silvermoon's Alacrity",
    recipeSlug: "Formula: Enchant Ring - Silvermoon's Alacrity",
    enchantSlug: "Enchant Ring - Silvermoon's Alacrity",
  },
  {
    category: "Ring",
    name: "Enchant Ring - Silvermoon's Tenacity",
    recipeSlug: "Formula: Enchant Ring - Silvermoon's Tenacity",
    enchantSlug: "Enchant Ring - Silvermoon's Tenacity",
  },
  {
    category: "Ring",
    name: "Enchant Ring - Thalassian Versatility",
    recipeSlug: "Formula: Enchant Ring - Thalassian Versatility",
    enchantSlug: "Enchant Ring - Thalassian Versatility",
  },
  {
    category: "Ring",
    name: "Enchant Ring - Zul'jin's Mastery",
    recipeSlug: "Formula: Enchant Ring - Zul'jin's Mastery",
    enchantSlug: "Enchant Ring - Zul'jin's Mastery",
  },

  // ── Shoulders ────────────────────────────────────────────────────────────
  {
    category: "Shoulders",
    name: "Enchant Shoulders - Akil'zon's Swiftness",
    recipeSlug: "Formula: Enchant Shoulders - Akil'zon's Swiftness",
    enchantSlug: "Enchant Shoulders - Akil'zon's Swiftness",
  },
  {
    category: "Shoulders",
    name: "Enchant Shoulders - Amirdrassil's Grace",
    recipeSlug: "Formula: Enchant Shoulders - Amirdrassil's Grace",
    enchantSlug: "Enchant Shoulders - Amirdrassil's Grace",
  },
  {
    category: "Shoulders",
    name: "Enchant Shoulders - Flight of the Eagle",
    recipeSlug: "Formula: Enchant Shoulders - Flight of the Eagle",
    enchantSlug: "Enchant Shoulders - Flight of the Eagle",
  },
  {
    category: "Shoulders",
    name: "Enchant Shoulders - Nature's Grace",
    recipeSlug: "Formula: Enchant Shoulders - Nature's Grace",
    enchantSlug: "Enchant Shoulders - Nature's Grace",
  },
  {
    category: "Shoulders",
    name: "Enchant Shoulders - Silvermoon's Mending",
    recipeSlug: "Formula: Enchant Shoulders - Silvermoon's Mending",
    enchantSlug: "Enchant Shoulders - Silvermoon's Mending",
  },
  {
    category: "Shoulders",
    name: "Enchant Shoulders - Thalassian Recovery",
    recipeSlug: "Formula: Enchant Shoulders - Thalassian Recovery",
    enchantSlug: "Enchant Shoulders - Thalassian Recovery",
  },

  // ── Weapon ───────────────────────────────────────────────────────────────
  {
    category: "Weapon",
    name: "Enchant Weapon - Acuity of the Ren'dorei",
    recipeSlug: "Formula: Enchant Weapon - Acuity of the Ren'dorei",
    enchantSlug: "Enchant Weapon - Acuity of the Ren'dorei",
  },
  {
    category: "Weapon",
    name: "Enchant Weapon - Arcane Mastery",
    recipeSlug: "Formula: Enchant Weapon - Arcane Mastery",
    enchantSlug: "Enchant Weapon - Arcane Mastery",
  },
  {
    category: "Weapon",
    name: "Enchant Weapon - Berserker's Rage",
    recipeSlug: "Formula: Enchant Weapon - Berserker's Rage",
    enchantSlug: "Enchant Weapon - Berserker's Rage",
  },
  {
    category: "Weapon",
    name: "Enchant Weapon - Flames of the Sin'dorei",
    recipeSlug: "Formula: Enchant Weapon - Flames of the Sin'dorei",
    enchantSlug: "Enchant Weapon - Flames of the Sin'dorei",
  },
  {
    category: "Weapon",
    name: "Enchant Weapon - Jan'alai's Precision",
    recipeSlug: "Formula: Enchant Weapon - Jan'alai's Precision",
    enchantSlug: "Enchant Weapon - Jan'alai's Precision",
  },
  {
    category: "Weapon",
    name: "Enchant Weapon - Strength of Halazzi",
    recipeSlug: "Formula: Enchant Weapon - Strength of Halazzi",
    enchantSlug: "Enchant Weapon - Strength of Halazzi",
  },
  {
    category: "Weapon",
    name: "Enchant Weapon - Worldsoul Aegis",
    recipeSlug: "Formula: Enchant Weapon - Worldsoul Aegis",
    enchantSlug: "Enchant Weapon - Worldsoul Aegis",
  },
  {
    category: "Weapon",
    name: "Enchant Weapon - Worldsoul Cradle",
    recipeSlug: "Formula: Enchant Weapon - Worldsoul Cradle",
    enchantSlug: "Enchant Weapon - Worldsoul Cradle",
  },
  {
    category: "Weapon",
    name: "Enchant Weapon - Worldsoul Tenacity",
    recipeSlug: "Formula: Enchant Weapon - Worldsoul Tenacity",
    enchantSlug: "Enchant Weapon - Worldsoul Tenacity",
  },

  // ── Tool ─────────────────────────────────────────────────────────────────
  {
    category: "Tool",
    name: "Enchant Tool - Amani Perception",
    recipeSlug: "Formula: Enchant Tool - Amani Perception",
    enchantSlug: "Enchant Tool - Amani Perception",
  },
  {
    category: "Tool",
    name: "Enchant Tool - Amani Resourcefulness",
    recipeSlug: "Formula: Enchant Tool - Amani Resourcefulness",
    enchantSlug: "Enchant Tool - Amani Resourcefulness",
  },
  {
    category: "Tool",
    name: "Enchant Tool - Haranir Finesse",
    recipeSlug: "Formula: Enchant Tool - Haranir Finesse",
    enchantSlug: "Enchant Tool - Haranir Finesse",
  },
  {
    category: "Tool",
    name: "Enchant Tool - Haranir Multicrafting",
    recipeSlug: "Formula: Enchant Tool - Haranir Multicrafting",
    enchantSlug: "Enchant Tool - Haranir Multicrafting",
  },
  {
    category: "Tool",
    name: "Enchant Tool - Ren'dorei Ingenuity",
    recipeSlug: "Formula: Enchant Tool - Ren'dorei Ingenuity",
    enchantSlug: "Enchant Tool - Ren'dorei Ingenuity",
  },
  {
    category: "Tool",
    name: "Enchant Tool - Sin'dorei Deftness",
    recipeSlug: "Formula: Enchant Tool - Sin'dorei Deftness",
    enchantSlug: "Enchant Tool - Sin'dorei Deftness",
  },

  // ── Cosmetics ────────────────────────────────────────────────────────────
  {
    category: "Cosmetics",
    name: "Illusory Adornment - Blooming Light",
    recipeSlug: "Formula: Illusory Adornment - Blooming Light",
    enchantSlug: "Illusory Adornment - Blooming Light",
  },
  {
    category: "Cosmetics",
    name: "Illusory Adornment - Voidtouched",
    recipeSlug: "Formula: Illusory Adornment - Voidtouched",
    enchantSlug: "Illusory Adornment - Voidtouched",
  },
];

module.exports = { ENCHANTING_ITEMS };
