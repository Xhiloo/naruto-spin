import { useState, useRef, useCallback, useEffect } from "react";

// ═══════════════════════════════════════════════════════
//  UTILITIES
// ═══════════════════════════════════════════════════════
const shuffle = arr => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Weight by rarity — Legendary = very rare, Common = frequent
const WEIGHT = { Legendary: 1, Rare: 3, Uncommon: 7, Common: 15 };
const weightOf = item => WEIGHT[item.rarity] || WEIGHT.Common;

// Weighted random → returns index in `items`
const weightedPick = items => {
  const total = items.reduce((s, it) => s + weightOf(it), 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weightOf(items[i]);
    if (r <= 0) return i;
  }
  return items.length - 1;
};

// ═══════════════════════════════════════════════════════
//  PALETTE
// ═══════════════════════════════════════════════════════
const PAL = [
  "#c0392b","#2471a3","#ca6f1e","#1e8449","#6c3483",
  "#7e5109","#d68910","#0e8075","#1a7a4a","#a93226",
  "#5d6d7e","#b7950b","#117a65","#884ea0","#1a5276",
  "#922b21","#154360","#0b5345","#4d5656","#6c0a0a",
];

// ═══════════════════════════════════════════════════════
//  LORE DATA
// ═══════════════════════════════════════════════════════
const CLANS = [
  { name:"Uchiha",   rarity:"Legendary", color:"#8b0000", glow:"#ff2200" },
  { name:"Hyuga",    rarity:"Rare",      color:"#1a3a6b", glow:"#5dade2" },
  { name:"Uzumaki",  rarity:"Rare",      color:"#8b4000", glow:"#ff8c00" },
  { name:"Nara",     rarity:"Uncommon",  color:"#0a4a1e", glow:"#2ecc71" },
  { name:"Aburame",  rarity:"Uncommon",  color:"#2d0066", glow:"#9b59b6" },
  { name:"Inuzuka",  rarity:"Uncommon",  color:"#4a2000", glow:"#e67e22" },
  { name:"Akimichi", rarity:"Uncommon",  color:"#7a4800", glow:"#f39c12" },
  { name:"Yamanaka", rarity:"Uncommon",  color:"#004a44", glow:"#1abc9c" },
  { name:"Senju",    rarity:"Legendary", color:"#0a4a1e", glow:"#00ff88" },
  { name:"Sarutobi", rarity:"Rare",      color:"#6b0000", glow:"#e74c3c" },
  { name:"Kaguya",   rarity:"Legendary", color:"#1c2426", glow:"#bdc3c7" },
  { name:"Namikaze", rarity:"Legendary", color:"#6b5400", glow:"#f1c40f" },
];

const CLAN_DATA = {
  Uchiha:{
    trait:[
      {l:"Sharingan · 1-Tomoe",       r:"Common"},
      {l:"Sharingan · 2-Tomoe",       r:"Common"},
      {l:"Sharingan · 3-Tomoe",       r:"Uncommon"},
      {l:"Mangekyo Sharingan",        r:"Rare"},
      {l:"Eternal Mangekyo Sharingan",r:"Legendary"},
      {l:"Rinnegan (Cross-bloodline)",r:"Legendary"},
    ],
    villages:["Konohagakure 🍃"],
    natures:[{l:"Fire Release",r:"Common"},{l:"Lightning Release",r:"Common"},{l:"Yin Release",r:"Uncommon"},{l:"Yang Release",r:"Uncommon"}],
    jutsuTypes:[{l:"Ninjutsu",r:"Common"},{l:"Genjutsu",r:"Uncommon"},{l:"Bukijutsu",r:"Uncommon"},{l:"Taijutsu",r:"Common"}],
    jutsu:{
      Ninjutsu:[{l:"Great Fireball",r:"Common"},{l:"Phoenix Flower",r:"Common"},{l:"Amaterasu",r:"Rare"},{l:"Susanoo",r:"Rare"},{l:"Izanagi",r:"Legendary"},{l:"Izanami",r:"Legendary"},{l:"Kagutsuchi",r:"Rare"}],
      Genjutsu:[{l:"Tsukuyomi",r:"Rare"},{l:"Sharingan Illusion",r:"Common"},{l:"Kotoamatsukami",r:"Legendary"},{l:"Izanami Loop",r:"Legendary"}],
      Bukijutsu:[{l:"Kusanagi Sword Style",r:"Rare"},{l:"Fuma Shuriken Barrage",r:"Common"},{l:"Twin Katana Assault",r:"Uncommon"},{l:"Chakra-Infused Blades",r:"Uncommon"}],
      Taijutsu:[{l:"Sharingan Counter-Style",r:"Uncommon"},{l:"Uchiha Interceptor",r:"Common"}],
    },
    weapons:[{l:"Katana",r:"Common"},{l:"Kusanagi Sword",r:"Rare"},{l:"Fuma Shuriken",r:"Common"},{l:"Chakra Shuriken",r:"Uncommon"}],
    bonus:[{l:"None",r:"Common"},{l:"None",r:"Common"},{l:"None",r:"Common"},{l:"Curse Mark Stage 2",r:"Rare"},{l:"Perfect Susanoo",r:"Legendary"},{l:"Six Paths Power (trace)",r:"Legendary"}],
    combatStyles:[{l:"Long-range Ninjutsu Barrage",r:"Common"},{l:"Sharingan Copy-Counter",r:"Uncommon"},{l:"Kenjutsu Assault",r:"Uncommon"},{l:"Genjutsu Total Control",r:"Rare"}],
  },
  Hyuga:{
    trait:[
      {l:"Byakugan · Awakened",       r:"Common"},
      {l:"Byakugan · Mastered",       r:"Uncommon"},
      {l:"Byakugan · Full 359°",      r:"Rare"},
      {l:"Tenseigan (Ultra-rare)",    r:"Legendary"},
      {l:"Branch Seal Removed & Free",r:"Uncommon"},
    ],
    villages:["Konohagakure 🍃"],
    natures:[{l:"Fire Release",r:"Common"},{l:"Earth Release",r:"Common"},{l:"Water Release",r:"Common"}],
    jutsuTypes:[{l:"Taijutsu",r:"Common"},{l:"Ninjutsu",r:"Uncommon"}],
    jutsu:{
      Taijutsu:[{l:"Gentle Fist",r:"Common"},{l:"8 Trigrams: 64 Palms",r:"Uncommon"},{l:"8 Trigrams: 128 Palms",r:"Rare"},{l:"Revolving Heaven",r:"Rare"},{l:"Air Palm",r:"Common"},{l:"Vacuum Palm",r:"Uncommon"},{l:"Twin Lion Fists",r:"Rare"}],
      Ninjutsu:[{l:"Mountain Crusher",r:"Rare"},{l:"Gentle Step Twin Lion Fists",r:"Rare"},{l:"Chakra-Enhanced Fist",r:"Uncommon"}],
    },
    weapons:[{l:"Bo Staff",r:"Common"},{l:"Twin Blades",r:"Uncommon"},{l:"Bare hands",r:"Common"},{l:"Short Tantō",r:"Common"}],
    bonus:[{l:"None",r:"Common"},{l:"None",r:"Common"},{l:"Main Branch Heir",r:"Uncommon"},{l:"Branch Family Rebellion",r:"Uncommon"},{l:"Tenseigan Chakra Mode",r:"Legendary"}],
    combatStyles:[{l:"Chakra Point Disruption",r:"Common"},{l:"Defensive Counter",r:"Common"},{l:"Eight Trigrams Lockdown",r:"Uncommon"}],
  },
  Uzumaki:{
    trait:[
      {l:"Vast Chakra Reserves",     r:"Common"},
      {l:"Longevity & Vitality",     r:"Uncommon"},
      {l:"Fuinjutsu Mastery",        r:"Uncommon"},
      {l:"Healing Factor",           r:"Rare"},
      {l:"Adamantine Sealing Chains",r:"Rare"},
      {l:"Jinchuriki · Nine-Tails",  r:"Legendary"},
    ],
    villages:["Konohagakure 🍃","Uzushiogakure (Ruins)"],
    natures:[{l:"Wind Release",r:"Common"},{l:"Fire Release",r:"Common"},{l:"Water Release",r:"Common"},{l:"Yang Release",r:"Uncommon"}],
    jutsuTypes:[{l:"Fuinjutsu",r:"Uncommon"},{l:"Ninjutsu",r:"Common"},{l:"Taijutsu",r:"Common"}],
    jutsu:{
      Fuinjutsu:[{l:"Four Symbols Seal",r:"Uncommon"},{l:"Dead Demon Consuming Seal",r:"Legendary"},{l:"Adamantine Chains",r:"Rare"},{l:"Tailed Beast Seal",r:"Rare"},{l:"Eight Trigrams Seal",r:"Uncommon"}],
      Ninjutsu:[{l:"Rasengan",r:"Common"},{l:"Rasenshuriken",r:"Rare"},{l:"Shadow Clone Jutsu",r:"Common"},{l:"Tailed Beast Bomb",r:"Legendary"},{l:"Wind Release Rasengan",r:"Uncommon"}],
      Taijutsu:[{l:"Uzumaki Barrage",r:"Common"},{l:"Nine-Tails Cloak Punch",r:"Rare"},{l:"Sage Mode Combo Strike",r:"Legendary"}],
    },
    weapons:[{l:"Sealing Scroll",r:"Common"},{l:"Chakra Chains",r:"Rare"},{l:"Kunai",r:"Common"},{l:"Truth-Seeking Ball (trace)",r:"Legendary"}],
    bonus:[{l:"None",r:"Common"},{l:"None",r:"Common"},{l:"Nine-Tails Chakra Mode",r:"Rare"},{l:"Kurama Link Mode",r:"Legendary"},{l:"Sage of Six Paths Mode",r:"Legendary"},{l:"Kurama Full Form",r:"Legendary"}],
    combatStyles:[{l:"Brute Force + Mass Clones",r:"Common"},{l:"Sealing Specialist",r:"Uncommon"},{l:"Sage Art Combat",r:"Rare"},{l:"Bijuu Augmented Assault",r:"Legendary"}],
  },
  Nara:{
    trait:[
      {l:"Shadow Possession",          r:"Common"},
      {l:"Shadow Neck Bind",           r:"Common"},
      {l:"Shadow Sewing",              r:"Uncommon"},
      {l:"Shadow Imitation Shuriken",  r:"Uncommon"},
      {l:"Shadow Dragon Extended",     r:"Rare"},
    ],
    villages:["Konohagakure 🍃"],
    natures:[{l:"Yin Release",r:"Common"},{l:"Earth Release",r:"Common"},{l:"Wind Release",r:"Common"}],
    jutsuTypes:[{l:"Ninjutsu",r:"Common"},{l:"Taijutsu",r:"Common"}],
    jutsu:{
      Ninjutsu:[{l:"Shadow Possession",r:"Common"},{l:"Shadow Neck Bind",r:"Common"},{l:"Shadow Sewing",r:"Uncommon"},{l:"Shadow Imitation Shuriken",r:"Uncommon"},{l:"Shadow Dragon Jutsu",r:"Rare"}],
      Taijutsu:[{l:"Strategic Positional",r:"Common"},{l:"Shadow-Assisted Ambush",r:"Uncommon"}],
    },
    weapons:[{l:"Deer-horn Blades",r:"Common"},{l:"Shadow Shuriken",r:"Common"},{l:"Kunai",r:"Common"}],
    bonus:[{l:"None",r:"Common"},{l:"None",r:"Common"},{l:"IQ 200+ Genius",r:"Rare"},{l:"Shadow Dragon Full Body",r:"Legendary"},{l:"Yin-Yang Integration",r:"Legendary"}],
    combatStyles:[{l:"Long-range Trapping",r:"Common"},{l:"IQ Battle Prediction",r:"Uncommon"},{l:"Shadow Paralysis + Ally Strike",r:"Uncommon"}],
  },
  Aburame:{
    trait:[
      {l:"Kikaichu Swarm (basic)",   r:"Common"},
      {l:"Parasitic Giant Insects",  r:"Uncommon"},
      {l:"Nano-Insect Colony",       r:"Rare"},
      {l:"Poison Beetle Variant",    r:"Rare"},
      {l:"Centipede Armor Form",     r:"Legendary"},
    ],
    villages:["Konohagakure 🍃"],
    natures:[{l:"Earth Release",r:"Common"},{l:"Yang Release",r:"Common"},{l:"Water Release",r:"Uncommon"}],
    jutsuTypes:[{l:"Ninjutsu",r:"Common"},{l:"Taijutsu",r:"Common"}],
    jutsu:{
      Ninjutsu:[{l:"Insect Clone",r:"Common"},{l:"Insect Jar",r:"Common"},{l:"Insect Sphere",r:"Uncommon"},{l:"Insect Cocoon (Secret)",r:"Rare"},{l:"Insect Jamming",r:"Uncommon"},{l:"Insect Wall",r:"Uncommon"}],
      Taijutsu:[{l:"Insect-Augmented Strikes",r:"Common"},{l:"Kikaichu Barrage",r:"Common"}],
    },
    weapons:[{l:"Insects (living weapon)",r:"Common"},{l:"Kunai",r:"Common"}],
    bonus:[{l:"None",r:"Common"},{l:"None",r:"Common"},{l:"Queen Beetle Bond",r:"Rare"},{l:"Nano-insect Chakra Drain",r:"Rare"},{l:"Full Insect Armor",r:"Legendary"}],
    combatStyles:[{l:"Swarm Suppression",r:"Common"},{l:"Chakra Drain + Ambush",r:"Uncommon"},{l:"Insect Sensory Net",r:"Uncommon"}],
  },
  Inuzuka:{
    trait:[
      {l:"Ninken Partnership x1",      r:"Common"},
      {l:"Ninken Pack (Triple)",        r:"Uncommon"},
      {l:"Beast Transformation (half)", r:"Uncommon"},
      {l:"Fang Passing Fang",           r:"Rare"},
      {l:"Enhanced Tracking Scent",     r:"Common"},
    ],
    villages:["Konohagakure 🍃"],
    natures:[{l:"Earth Release",r:"Common"},{l:"Yang Release",r:"Common"},{l:"Fire Release",r:"Common"}],
    jutsuTypes:[{l:"Taijutsu",r:"Common"},{l:"Ninjutsu",r:"Common"}],
    jutsu:{
      Taijutsu:[{l:"Fang Passing Fang",r:"Uncommon"},{l:"Man-Beast Combo",r:"Common"},{l:"Four Legs Technique",r:"Common"},{l:"Dynamic Marking",r:"Common"},{l:"Wolf Fang Over Fang",r:"Rare"}],
      Ninjutsu:[{l:"Beast Human Clone",r:"Common"},{l:"Fang Rotating Fang",r:"Uncommon"},{l:"Super Fang Wolf Fang",r:"Rare"}],
    },
    weapons:[{l:"Claws",r:"Common"},{l:"Ninken",r:"Common"},{l:"Fangs",r:"Common"},{l:"Kunai",r:"Common"}],
    bonus:[{l:"None",r:"Common"},{l:"None",r:"Common"},{l:"Full Beast Transformation",r:"Rare"},{l:"Triple Ninken Pack",r:"Uncommon"},{l:"Alpha Pack Leader",r:"Rare"}],
    combatStyles:[{l:"High-Speed Rush Assault",r:"Common"},{l:"Track & Ambush",r:"Common"},{l:"Beast+Human Combo Strike",r:"Uncommon"}],
  },
  Akimichi:{
    trait:[
      {l:"Multi-Size Technique",     r:"Common"},
      {l:"Butterfly Mode (Partial)", r:"Uncommon"},
      {l:"Butterfly Mode (Full)",    r:"Rare"},
      {l:"Calorie-Chakra Mastery",   r:"Uncommon"},
      {l:"Spiked Human Boulder",     r:"Uncommon"},
    ],
    villages:["Konohagakure 🍃"],
    natures:[{l:"Yang Release",r:"Common"},{l:"Fire Release",r:"Common"},{l:"Earth Release",r:"Common"}],
    jutsuTypes:[{l:"Taijutsu",r:"Common"},{l:"Ninjutsu",r:"Common"}],
    jutsu:{
      Taijutsu:[{l:"Multi-Size Technique",r:"Common"},{l:"Butterfly Bullet Bombing",r:"Rare"},{l:"Spiked Human Boulder",r:"Uncommon"},{l:"Partial Multi-Size",r:"Common"}],
      Ninjutsu:[{l:"Calorie Control",r:"Uncommon"},{l:"Meat Tank",r:"Common"},{l:"Mega Palm Thrust",r:"Uncommon"},{l:"Butterfly Chop",r:"Rare"}],
    },
    weapons:[{l:"Giant Butterfly Sword",r:"Rare"},{l:"Expandable Fists",r:"Common"}],
    bonus:[{l:"None",r:"Common"},{l:"None",r:"Common"},{l:"Full Butterfly Mode",r:"Rare"},{l:"Three Colour Pills Mastery",r:"Rare"},{l:"Super Expansion Jutsu",r:"Legendary"}],
    combatStyles:[{l:"Brute Force Expansion",r:"Common"},{l:"Butterfly Mode Blitz",r:"Rare"},{l:"Defensive Tank",r:"Common"}],
  },
  Yamanaka:{
    trait:[
      {l:"Mind Transfer Jutsu",      r:"Common"},
      {l:"Mind Destruction",         r:"Uncommon"},
      {l:"Telepathy Network",        r:"Rare"},
      {l:"Mind Puppet Switch",       r:"Rare"},
      {l:"Long-Range Sensory",       r:"Uncommon"},
    ],
    villages:["Konohagakure 🍃"],
    natures:[{l:"Yin Release",r:"Common"},{l:"Water Release",r:"Common"},{l:"Wind Release",r:"Common"}],
    jutsuTypes:[{l:"Ninjutsu",r:"Common"},{l:"Genjutsu",r:"Uncommon"}],
    jutsu:{
      Ninjutsu:[{l:"Mind Transfer Jutsu",r:"Common"},{l:"Mind Body Switch",r:"Common"},{l:"Mind Disturbance Dance",r:"Uncommon"},{l:"Sensing Transmission",r:"Uncommon"},{l:"Mind Body Disturbance",r:"Rare"}],
      Genjutsu:[{l:"Mind Puppet Cursed Seal",r:"Rare"},{l:"Mass Genjutsu via Network",r:"Legendary"}],
    },
    weapons:[{l:"None (range spec)",r:"Common"},{l:"Kunai",r:"Common"},{l:"Telepathy Scroll",r:"Uncommon"}],
    bonus:[{l:"None",r:"Common"},{l:"None",r:"Common"},{l:"Multi-target Mind Link",r:"Rare"},{l:"20-person Mind Network",r:"Legendary"},{l:"Ino-Shika-Cho Formation",r:"Rare"}],
    combatStyles:[{l:"Mind Control Specialist",r:"Common"},{l:"Sensory Network Hub",r:"Uncommon"},{l:"Long-range Puppet Control",r:"Uncommon"}],
  },
  Senju:{
    trait:[
      {l:"Wood Release · Basic",          r:"Uncommon"},
      {l:"Wood Release · Advanced",       r:"Rare"},
      {l:"Vast Chakra (Hashirama-level)", r:"Legendary"},
      {l:"Life Force Healing Aura",       r:"Rare"},
      {l:"Tailed Beast Suppression",      r:"Legendary"},
    ],
    villages:["Konohagakure 🍃"],
    natures:[{l:"Earth Release",r:"Common"},{l:"Water Release",r:"Common"},{l:"Wood Release",r:"Rare"},{l:"Fire Release",r:"Common"}],
    jutsuTypes:[{l:"Ninjutsu",r:"Common"},{l:"Taijutsu",r:"Common"},{l:"Fuinjutsu",r:"Uncommon"}],
    jutsu:{
      Ninjutsu:[{l:"Wood Dragon",r:"Rare"},{l:"Wood Golem",r:"Rare"},{l:"Wood Clone",r:"Uncommon"},{l:"True Thousand Hands",r:"Legendary"},{l:"Wood Expulsion Wave",r:"Uncommon"},{l:"Dancing Lemon Forest",r:"Uncommon"}],
      Taijutsu:[{l:"Senju Brute Force",r:"Common"}],
      Fuinjutsu:[{l:"Tailed Beast Wood Seal",r:"Legendary"},{l:"Four Symbols Seal",r:"Rare"}],
    },
    weapons:[{l:"Wood Constructs",r:"Common"},{l:"Giant Wooden Fist",r:"Uncommon"},{l:"Kunai",r:"Common"}],
    bonus:[{l:"None",r:"Common"},{l:"Sage Mode",r:"Rare"},{l:"Tailed Beast Suppression Aura",r:"Legendary"},{l:"God of Shinobi Title",r:"Legendary"},{l:"None",r:"Common"}],
    combatStyles:[{l:"Battlefield Domination",r:"Uncommon"},{l:"Massive AoE Jutsu",r:"Rare"},{l:"Tailed Beast Sealing",r:"Legendary"}],
  },
  Sarutobi:{
    trait:[
      {l:"Fire Release Mastery",   r:"Common"},
      {l:"100+ Jutsu Known",       r:"Uncommon"},
      {l:"Monkey King Contract",   r:"Rare"},
      {l:"Enma Staff Master",      r:"Rare"},
      {l:"Professor Title",        r:"Legendary"},
    ],
    villages:["Konohagakure 🍃"],
    natures:[{l:"Fire Release",r:"Common"},{l:"Earth Release",r:"Common"},{l:"Wind Release",r:"Common"},{l:"Water Release",r:"Uncommon"},{l:"Lightning Release",r:"Uncommon"}],
    jutsuTypes:[{l:"Ninjutsu",r:"Common"},{l:"Taijutsu",r:"Common"},{l:"Fuinjutsu",r:"Uncommon"},{l:"Genjutsu",r:"Uncommon"}],
    jutsu:{
      Ninjutsu:[{l:"Ash Pile Burning",r:"Common"},{l:"Shuriken Shadow Clone",r:"Uncommon"},{l:"Monkey Summoning",r:"Rare"},{l:"Earth Style Wall",r:"Common"},{l:"Five Element Seal",r:"Uncommon"}],
      Taijutsu:[{l:"Enma Staff Combat",r:"Rare"}],
      Fuinjutsu:[{l:"Reaper Death Seal",r:"Legendary"},{l:"Dead Demon Consuming Seal",r:"Legendary"}],
      Genjutsu:[{l:"Barrier-level Genjutsu",r:"Rare"}],
    },
    weapons:[{l:"Enma (Monkey King Staff)",r:"Rare"},{l:"Kunai",r:"Common"},{l:"Shuriken",r:"Common"},{l:"Smoke Bomb",r:"Common"}],
    bonus:[{l:"None",r:"Common"},{l:"None",r:"Common"},{l:"All 5 Natures Mastered",r:"Legendary"},{l:"Reaper Seal Mastery",r:"Legendary"},{l:"Monkey King Alliance",r:"Rare"}],
    combatStyles:[{l:"All-Round Master",r:"Uncommon"},{l:"Fire & Earth Dominator",r:"Common"},{l:"Sealing Grandmaster",r:"Rare"}],
  },
  Kaguya:{
    trait:[
      {l:"Shikotsumyaku · Basic",       r:"Uncommon"},
      {l:"Dance of the Camellia",        r:"Common"},
      {l:"Dance of the Seedling Fern",   r:"Uncommon"},
      {l:"Ten-Finger Drilling Bullets",  r:"Rare"},
      {l:"Diamond Bone Armor",           r:"Legendary"},
      {l:"Spine Whip",                   r:"Rare"},
    ],
    villages:["Kirigakure 🌊"],
    natures:[{l:"Earth Release",r:"Common"},{l:"Water Release",r:"Common"}],
    jutsuTypes:[{l:"Taijutsu",r:"Common"},{l:"Ninjutsu",r:"Uncommon"}],
    jutsu:{
      Taijutsu:[{l:"Dance of the Camellia",r:"Common"},{l:"Dance of the Larch",r:"Uncommon"},{l:"Dance of Clematis",r:"Rare"},{l:"Seedling Fern Full Bloom",r:"Legendary"},{l:"Bone Bullet Barrage",r:"Common"}],
      Ninjutsu:[{l:"Bone Blade Emergence",r:"Uncommon"},{l:"Skeletal Armor Form",r:"Rare"},{l:"Rib Cage Fortress",r:"Rare"}],
    },
    weapons:[{l:"Bone Swords",r:"Common"},{l:"Bone Bullets",r:"Common"},{l:"Spine Whip",r:"Rare"},{l:"Rib Cage Armor",r:"Rare"}],
    bonus:[{l:"None",r:"Common"},{l:"None",r:"Common"},{l:"Curse Mark Stage 2",r:"Rare"},{l:"Diamond-Hard Bones",r:"Rare"},{l:"Last Kaguya Awakening",r:"Legendary"}],
    combatStyles:[{l:"Bone Blade Frenzy",r:"Common"},{l:"Mid-range Drill Strike",r:"Uncommon"},{l:"Bone Armor Defense",r:"Uncommon"}],
  },
  Namikaze:{
    trait:[
      {l:"Flying Thunder God (Basic)",   r:"Uncommon"},
      {l:"Flying Thunder God (Mastery)", r:"Rare"},
      {l:"Space-Time Formula Sealing",   r:"Legendary"},
      {l:"Yellow Flash Reflexes",        r:"Rare"},
      {l:"Rasengan Inventor Lineage",    r:"Rare"},
    ],
    villages:["Konohagakure 🍃"],
    natures:[{l:"Wind Release",r:"Common"},{l:"Lightning Release",r:"Common"},{l:"Fire Release",r:"Common"}],
    jutsuTypes:[{l:"Ninjutsu",r:"Common"},{l:"Fuinjutsu",r:"Uncommon"},{l:"Taijutsu",r:"Common"}],
    jutsu:{
      Ninjutsu:[{l:"Rasengan",r:"Common"},{l:"Ultra-Big Ball Rasengan",r:"Rare"},{l:"FTG Slash",r:"Rare"},{l:"Wind Release Rasengan",r:"Uncommon"}],
      Fuinjutsu:[{l:"Flying Thunder God Technique",r:"Legendary"},{l:"Four Red Yang Formation",r:"Legendary"},{l:"Tri-Pronged Kunai Mark",r:"Rare"},{l:"Contract Seal",r:"Uncommon"}],
      Taijutsu:[{l:"Sage Mode Speed Combo",r:"Legendary"},{l:"FTG Ambush Taijutsu",r:"Rare"}],
    },
    weapons:[{l:"Tri-Pronged Kunai",r:"Rare"},{l:"Rasengan (formed)",r:"Common"},{l:"Kunai",r:"Common"}],
    bonus:[{l:"None",r:"Common"},{l:"None",r:"Common"},{l:"Toad Sage Mode",r:"Rare"},{l:"Space-Time Mastery",r:"Legendary"},{l:"Fourth Hokage Legacy Aura",r:"Legendary"}],
    combatStyles:[{l:"Space-Time Teleport Assault",r:"Legendary"},{l:"Rasengan Blitz",r:"Common"},{l:"Sage Mode Precision",r:"Rare"}],
  },
};

// Flat pool builders
const flat = arr => arr.map(x => typeof x === "string" ? {l:x, r:"Common"} : x);

const VILLAGE_POOL = [
  {l:"Konohagakure 🍃", r:"Common",   color:"#145a32"},
  {l:"Sunagakure 🏜️",   r:"Common",   color:"#7e5109"},
  {l:"Kirigakure 🌊",   r:"Common",   color:"#0e6655"},
  {l:"Iwagakure ⛰️",    r:"Common",   color:"#4d5656"},
  {l:"Kumogakure ⚡",   r:"Common",   color:"#6c3483"},
];

const SPEEDS = [
  {l:"Sluggish",            sub:"Below avg shinobi",          r:"Common",   color:"#4d5656"},
  {l:"Average",             sub:"Standard movement",          r:"Common",   color:"#2471a3"},
  {l:"Fast",                sub:"Noticeably swifter",         r:"Uncommon", color:"#1e8449"},
  {l:"High-Speed",          sub:"Blur to most eyes",          r:"Uncommon", color:"#884ea0"},
  {l:"Lightning Speed",     sub:"Barely trackable",           r:"Rare",     color:"#b7950b"},
  {l:"Teleportation-Tier",  sub:"Imperceptible in motion",    r:"Legendary",color:"#c0392b"},
];

const INTELLIGENCES = [
  {l:"Berserker",             sub:"Pure instinct, zero logic",  r:"Common",   color:"#922b21"},
  {l:"Below Average",         sub:"Needs guidance in combat",   r:"Common",   color:"#4d5656"},
  {l:"Average",               sub:"Standard tactical read",     r:"Common",   color:"#2471a3"},
  {l:"Tactical",              sub:"Plans 3-5 moves ahead",      r:"Uncommon", color:"#1e8449"},
  {l:"Genius",                sub:"Rival to Shikamaru in IQ",   r:"Rare",     color:"#884ea0"},
  {l:"Omniscient Strategist", sub:"Reads battlefield like text",r:"Legendary",color:"#b7950b"},
];

const STRENGTHS = [
  {l:"Frail",         sub:"Physical combat is liability", r:"Common",   color:"#4d5656"},
  {l:"Average",       sub:"Standard capability",          r:"Common",   color:"#2471a3"},
  {l:"Strong",        sub:"Above-average raw power",      r:"Uncommon", color:"#1e8449"},
  {l:"Superhuman",    sub:"Cracks stone barehanded",      r:"Rare",     color:"#884ea0"},
  {l:"Monster Tier",  sub:"Tsunade / Might Guy level",    r:"Legendary",color:"#c0392b"},
];

const CHAKRA_RESERVE = [
  {l:"Minimal",     sub:"Drains fast under pressure", r:"Common",   color:"#4d5656"},
  {l:"Average",     sub:"Standard pool",              r:"Common",   color:"#2471a3"},
  {l:"High",        sub:"Sustains extended combat",   r:"Uncommon", color:"#1e8449"},
  {l:"Vast",        sub:"Sannin-level reserves",      r:"Rare",     color:"#884ea0"},
  {l:"Bijuu-Tier",  sub:"Essentially limitless",      r:"Legendary",color:"#c0392b"},
];

const PERSONALITIES = [
  {l:"Hothead",            sub:"Rush in first, think never",      r:"Common",   color:"#a93226"},
  {l:"Calm & Collected",   sub:"Unshakeable under pressure",      r:"Uncommon", color:"#1a5276"},
  {l:"Cold Calculating",   sub:"Every move is a chess play",      r:"Uncommon", color:"#0b5345"},
  {l:"Loyal to Death",     sub:"Would die for their comrades",    r:"Common",   color:"#1e8449"},
  {l:"Lone Wolf",          sub:"Trusts nobody, fights alone",     r:"Common",   color:"#4d5656"},
  {l:"Charismatic Leader", sub:"Born to command others",          r:"Uncommon", color:"#7e5109"},
  {l:"Stoic",              sub:"Emotion is a tactical weakness",  r:"Uncommon", color:"#2c3e50"},
  {l:"Playful Trickster",  sub:"Hides genius behind a grin",     r:"Common",   color:"#d68910"},
  {l:"Revenge-Driven",     sub:"Past scars fuel every strike",   r:"Common",   color:"#6c0a0a"},
  {l:"Destined Idealist",  sub:"Will change the shinobi world",  r:"Rare",     color:"#154360"},
];

const SUMMONS = [
  {l:"Toads · Mount Myoboku",   sub:"Sage Arts capable",       r:"Rare",     color:"#1e8449"},
  {l:"Snakes · Ryuchi Cave",    sub:"Venomous & fast",         r:"Rare",     color:"#1a5276"},
  {l:"Slugs · Shikkotsu",       sub:"Medical support",         r:"Rare",     color:"#6c3483"},
  {l:"Dogs · Inuzuka Bond",     sub:"Tracking & combat",       r:"Uncommon", color:"#7e5109"},
  {l:"Eagles / Hawks",          sub:"Aerial recon & strike",   r:"Uncommon", color:"#4d5656"},
  {l:"Monkeys · Sarutobi",      sub:"Enma staff form",         r:"Rare",     color:"#a93226"},
  {l:"Weasels",                 sub:"Blade-wielding",          r:"Uncommon", color:"#5d6d7e"},
  {l:"Bears",                   sub:"Brute force support",     r:"Uncommon", color:"#7f8c8d"},
  {l:"No Contract (Yet)",       sub:"Unbound summon path",     r:"Common",   color:"#1a1a2e"},
  {l:"No Contract (Yet)",       sub:"Unbound summon path",     r:"Common",   color:"#1a1a2e"},
  {l:"No Contract (Yet)",       sub:"Unbound summon path",     r:"Common",   color:"#1a1a2e"},
];

const TAILED_BEASTS = [
  {l:"Shukaku · One-Tail",    sub:"Sand Control / Immortal Sleep",r:"Rare",     color:"#d4ac0d"},
  {l:"Matatabi · Two-Tails",  sub:"Blue Fire / Cat Form",         r:"Rare",     color:"#1abc9c"},
  {l:"Isobu · Three-Tails",   sub:"Water Mastery / Shell Armor",  r:"Rare",     color:"#2980b9"},
  {l:"Son Goku · Four-Tails", sub:"Lava Release / Raw Power",     r:"Rare",     color:"#e74c3c"},
  {l:"Kokuo · Five-Tails",    sub:"Boil Release / Hybrid Form",   r:"Rare",     color:"#8e44ad"},
  {l:"Saiken · Six-Tails",    sub:"Acid Slime / Water Release",   r:"Rare",     color:"#16a085"},
  {l:"Chomei · Seven-Tails",  sub:"Flight / Wing Shield",         r:"Rare",     color:"#27ae60"},
  {l:"Gyuki · Eight-Tails",   sub:"Lightning & Ink / Octopus",    r:"Rare",     color:"#2c3e50"},
  {l:"Kurama · Nine-Tails",   sub:"Massive Chakra / Bijuu Bomb",  r:"Legendary",color:"#c0392b"},
  {l:"No Tailed Beast",       sub:"Unbound — free shinobi",       r:"Common",   color:"#1a1a2e"},
  {l:"No Tailed Beast",       sub:"Unbound — free shinobi",       r:"Common",   color:"#1a1a2e"},
  {l:"No Tailed Beast",       sub:"Unbound — free shinobi",       r:"Common",   color:"#1a1a2e"},
  {l:"No Tailed Beast",       sub:"Unbound — free shinobi",       r:"Common",   color:"#1a1a2e"},
];

const HIDDEN_POTENTIALS = [
  {l:"None — As rolled, as lived",            r:"Common",   color:"#1a1a2e"},
  {l:"None — As rolled, as lived",            r:"Common",   color:"#1a1a2e"},
  {l:"None — As rolled, as lived",            r:"Common",   color:"#1a1a2e"},
  {l:"None — As rolled, as lived",            r:"Common",   color:"#1a1a2e"},
  {l:"Dormant Kekkei Genkai (stress-trigger)",r:"Rare",     color:"#8e44ad"},
  {l:"Suppressed Otsutsuki Bloodline",        r:"Legendary",color:"#c0392b"},
  {l:"Sage Body Candidate",                   r:"Rare",     color:"#27ae60"},
  {l:"Perfect Chakra Control (medical-grade)",r:"Uncommon", color:"#2980b9"},
  {l:"Battle Instinct Awakening",             r:"Uncommon", color:"#e67e22"},
  {l:"Cursed Seal Latent Form (ancient)",     r:"Rare",     color:"#6c3483"},
  {l:"Six Paths Chakra Remnant",              r:"Legendary",color:"#f1c40f"},
];

const RIVAL_TYPES = [
  {l:"Clan member who surpassed you",       r:"Common",   color:"#c0392b"},
  {l:"Enemy village shinobi, equal rank",  r:"Common",   color:"#8e44ad"},
  {l:"Your own sensei, testing your limits",r:"Uncommon", color:"#1e8449"},
  {l:"Missing-nin with a shared past",      r:"Uncommon", color:"#4d5656"},
  {l:"A legend you seek to surpass",        r:"Uncommon", color:"#b7950b"},
  {l:"Akatsuki member targeting your power",r:"Rare",     color:"#2c3e50"},
  {l:"Childhood friend on the wrong path",  r:"Common",   color:"#2471a3"},
  {l:"A Sannin's top disciple",             r:"Rare",     color:"#884ea0"},
  {l:"No rival — YOU are the threat feared",r:"Rare",     color:"#c0392b"},
];

const STATUSES = [
  {l:"No Special Status",           r:"Common",   color:"#1a1a2e"},
  {l:"No Special Status",           r:"Common",   color:"#1a1a2e"},
  {l:"No Special Status",           r:"Common",   color:"#1a1a2e"},
  {l:"Medical Ninja Specialist",    r:"Uncommon", color:"#27ae60"},
  {l:"ANBU Black Ops Operative",    r:"Uncommon", color:"#2c3e50"},
  {l:"Curse Mark Bearer",           r:"Rare",     color:"#6c3483"},
  {l:"Seven Swordsman of the Mist", r:"Rare",     color:"#1abc9c"},
  {l:"Akatsuki Member",             r:"Rare",     color:"#c0392b"},
  {l:"Sage Mode Practitioner",      r:"Rare",     color:"#27ae60"},
  {l:"Jinchuriki (Tailed Beast)",   r:"Rare",     color:"#e74c3c"},
  {l:"Kage Candidate",              r:"Rare",     color:"#b7950b"},
  {l:"Six Paths Power (trace)",     r:"Legendary",color:"#f1c40f"},
];

const RANKS = [
  {l:"Academy Student", r:"Common",   color:"#4d5656"},
  {l:"Genin",           r:"Common",   color:"#2471a3"},
  {l:"Chunin",          r:"Uncommon", color:"#1e8449"},
  {l:"Tokubetsu Jonin", r:"Uncommon", color:"#d68910"},
  {l:"Jonin",           r:"Rare",     color:"#c0392b"},
  {l:"ANBU",            r:"Rare",     color:"#6c3483"},
  {l:"Kage",            r:"Legendary",color:"#b7950b"},
];

// ═══════════════════════════════════════════════════════
//  COMBO TITLES
// ═══════════════════════════════════════════════════════
const detectCombo = r => {
  if (r.clan==="Uchiha" && (r.trait||"").includes("Eternal") && (r.bonus||"").includes("Perfect Susanoo"))
    return {title:"「 GOD OF THE UCHIHA 」", color:"#ff3300", glow:"#ff000055"};
  if (r.clan==="Uzumaki" && (r.tailedBeast||"").includes("Kurama") && (r.bonus||"").includes("Kurama Link Mode"))
    return {title:"「 CHILD OF PROPHECY 」", color:"#ff8c00", glow:"#ff6b2b55"};
  if (r.clan==="Namikaze" && r.rank==="Kage")
    return {title:"「 YELLOW FLASH REBORN 」", color:"#f1c40f", glow:"#f1c40f55"};
  if (r.clan==="Senju" && (r.bonus||"").includes("God of Shinobi Title"))
    return {title:"「 GOD OF SHINOBI 」", color:"#00ff88", glow:"#00ff8855"};
  if (r.clan==="Kaguya" && (r.bonus||"").includes("Last Kaguya Awakening"))
    return {title:"「 LAST OF THE KAGUYA 」", color:"#bdc3c7", glow:"#bdc3c755"};
  if (r.speed==="Teleportation-Tier" && r.rank==="Kage")
    return {title:"「 UNTOUCHABLE KAGE 」", color:"#f1c40f", glow:"#f1c40f55"};
  if (r.intelligence==="Omniscient Strategist" && r.clan==="Nara")
    return {title:"「 SHADOW SOVEREIGN 」", color:"#2ecc71", glow:"#2ecc7155"};
  if ((r.hiddenPotential||"").includes("Six Paths"))
    return {title:"「 SON OF THE SAGE 」", color:"#f1c40f", glow:"#f1c40f88"};
  if (r.rank==="Kage" && r.intelligence==="Genius")
    return {title:"「 VISIONARY KAGE 」", color:"#b7950b", glow:"#b7950b55"};
  if ((r.hiddenPotential||"").includes("Otsutsuki"))
    return {title:"「 DESCENDENT OF GODS 」", color:"#9b59b6", glow:"#9b59b666"};
  return null;
};

// ═══════════════════════════════════════════════════════
//  STAGE BUILDER  (items use {l, r, color?, sub?})
// ═══════════════════════════════════════════════════════
const buildStages = r => {
  const cd = CLAN_DATA[r.clan];
  return [
    {id:"clan",           label:"CLAN",              emoji:"🏯",
     pool: CLANS.map(c=>({l:c.name, r:c.rarity, color:c.color, glow:c.glow}))},
    {id:"trait",          label:"CLAN TRAIT",         emoji:"👁️",
     pool: cd?.trait || [{l:"Unknown Trait",r:"Common"}]},
    {id:"village",        label:"VILLAGE",            emoji:"🏘️",
     pool: (cd?.villages?.length ? VILLAGE_POOL.filter(v=>cd.villages.some(vv=>v.l.startsWith(vv.slice(0,5)))) : VILLAGE_POOL)},
    {id:"chakraNature",   label:"CHAKRA NATURE",      emoji:"🔥",
     pool: cd?.natures || [{l:"Fire Release",r:"Common"},{l:"Wind Release",r:"Common"},{l:"Lightning Release",r:"Common"},{l:"Earth Release",r:"Common"},{l:"Water Release",r:"Common"}]},
    {id:"jutsuType",      label:"JUTSU TYPE",          emoji:"✋",
     pool: cd?.jutsuTypes || [{l:"Ninjutsu",r:"Common"},{l:"Taijutsu",r:"Common"},{l:"Genjutsu",r:"Uncommon"}]},
    {id:"jutsu",          label:"SIGNATURE JUTSU",    emoji:"⚡",
     pool: (cd?.jutsu?.[r.jutsuType] || [{l:"Kunai Barrage",r:"Common"},{l:"Shadow Clone",r:"Common"},{l:"Water Dragon",r:"Uncommon"},{l:"Rasengan",r:"Rare"}])},
    {id:"weapon",         label:"WEAPON / TOOL",       emoji:"⚔️",
     pool: cd?.weapons || [{l:"Kunai",r:"Common"},{l:"Shuriken",r:"Common"},{l:"Sword",r:"Uncommon"},{l:"Scroll",r:"Common"}]},
    {id:"bonus",          label:"BONUS POWER",         emoji:"💫",
     pool: cd?.bonus || [{l:"None",r:"Common"},{l:"None",r:"Common"},{l:"Sage Mode",r:"Rare"},{l:"Curse Mark",r:"Rare"}]},
    {id:"combatStyle",    label:"COMBAT STYLE",        emoji:"🥷",
     pool: cd?.combatStyles || [{l:"Balanced Assault",r:"Common"},{l:"Long-range Ninjutsu",r:"Common"},{l:"Close-range Taijutsu",r:"Common"}]},
    {id:"speed",          label:"SPEED TIER",          emoji:"💨", pool: SPEEDS},
    {id:"intelligence",   label:"INTELLIGENCE",        emoji:"🧠", pool: INTELLIGENCES},
    {id:"strength",       label:"STRENGTH",            emoji:"💪", pool: STRENGTHS},
    {id:"chakraReserves", label:"CHAKRA RESERVES",     emoji:"✨", pool: CHAKRA_RESERVE},
    {id:"personality",    label:"PERSONALITY",         emoji:"🎭", pool: PERSONALITIES},
    {id:"summon",         label:"SUMMON CONTRACT",     emoji:"📜", pool: SUMMONS},
    {id:"tailedBeast",    label:"TAILED BEAST",        emoji:"🔮", pool: TAILED_BEASTS},
    {id:"hiddenPotential",label:"HIDDEN POTENTIAL",    emoji:"🌑", pool: HIDDEN_POTENTIALS},
    {id:"rivalType",      label:"RIVAL / NEMESIS",     emoji:"🗡️", pool: RIVAL_TYPES},
    {id:"status",         label:"SPECIAL STATUS",      emoji:"🌟", pool: STATUSES},
    {id:"rank",           label:"SHINOBI RANK",        emoji:"🎖️", pool: RANKS},
  ];
};

// ═══════════════════════════════════════════════════════
//  COLORS from pool item
// ═══════════════════════════════════════════════════════
const itemColor = (item, fallbackIdx) => {
  if (item.color) return item.color;
  return PAL[fallbackIdx % PAL.length];
};

// ═══════════════════════════════════════════════════════
//  SVG SPIN WHEEL
//  KEY FIX: pointer tip at y=26 (=cy-R=150-124).
//  Segment i CENTER sits at angle (i+0.5)*seg from top.
//  To land center of displayIdx at top:
//    additionalRot = (360 - ((displayIdx+0.5)*seg + prevRot%360) % 360) % 360
// ═══════════════════════════════════════════════════════
function SpinWheel({ displayItems, rotation, duration }) {
  const N = displayItems.length;
  if (!N) return null;
  const seg = 360 / N, cx = 150, cy = 150, R = 124, Ri = 24;
  const toR = d => (d - 90) * Math.PI / 180;

  const segPath = i => {
    const a1 = i * seg, a2 = (i + 1) * seg;
    const x1 = cx + R * Math.cos(toR(a1)), y1 = cy + R * Math.sin(toR(a1));
    const x2 = cx + R * Math.cos(toR(a2)), y2 = cy + R * Math.sin(toR(a2));
    return `M${cx} ${cy}L${x1} ${y1}A${R} ${R} 0 ${a2 - a1 > 180 ? 1 : 0} 1 ${x2} ${y2}Z`;
  };

  // Separator line between segments
  const sepLine = i => {
    const a = i * seg, rad = toR(a);
    return { x1: cx, y1: cy, x2: cx + R * Math.cos(rad), y2: cy + R * Math.sin(rad) };
  };

  const textPos = i => {
    const m = (i + 0.5) * seg, tr = R * 0.63;
    return { x: cx + tr * Math.cos(toR(m)), y: cy + tr * Math.sin(toR(m)), rot: m };
  };

  const clip = (s, n = 11) => s.length > n ? s.slice(0, n - 1) + "…" : s;

  return (
    <svg viewBox="0 0 300 300" width="100%" style={{ maxWidth: 310, display: "block", margin: "0 auto" }}>
      <defs>
        <radialGradient id="cg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff6b2b" />
          <stop offset="100%" stopColor="#5a0800" />
        </radialGradient>
        <filter id="pf" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="tf">
          <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#000" floodOpacity="0.9" />
        </filter>
      </defs>

      {/* Outer rings */}
      <circle cx={cx} cy={cy} r={R + 14} fill="none" stroke="#ff6b2b" strokeWidth="1" opacity=".18" />
      <circle cx={cx} cy={cy} r={R + 9}  fill="none" stroke="#ff6b2b" strokeWidth="0.6" opacity=".1" />
      {/* Tick marks at each segment boundary */}
      {Array.from({ length: N }).map((_, i) => {
        const a = (i / N) * 360 - 90, rad = a * Math.PI / 180;
        return <line key={i}
          x1={cx + (R + 4) * Math.cos(rad)} y1={cy + (R + 4) * Math.sin(rad)}
          x2={cx + (R + 11) * Math.cos(rad)} y2={cy + (R + 11) * Math.sin(rad)}
          stroke="#ff6b2b" strokeWidth="1.5" opacity=".5" />;
      })}

      {/* Spinning group */}
      <g transform={`rotate(${rotation},${cx},${cy})`}
        style={{ transition: duration ? `transform ${duration}s cubic-bezier(0.05,0.75,0.25,1)` : "none" }}>

        {displayItems.map((item, i) => {
          const t = textPos(i);
          const words = clip(item.l || "?").split(" ");
          const half = Math.ceil(words.length / 2);
          const lines = [words.slice(0, half).join(" "), words.slice(half).join(" ")].filter(Boolean);
          const col = itemColor(item, i);
          return (
            <g key={i}>
              {/* Segment fill */}
              <path d={segPath(i)} fill={col} />
              {/* Lighter top edge for depth */}
              <path d={segPath(i)} fill="none" stroke="#ffffff12" strokeWidth="1" />
              {/* Separator line */}
              {(() => { const sl = sepLine(i); return <line x1={sl.x1} y1={sl.y1} x2={sl.x2} y2={sl.y2} stroke="#060606" strokeWidth="2.5" />; })()}
              {/* Label */}
              <g transform={`rotate(${t.rot},${t.x},${t.y})`} filter="url(#tf)">
                {lines.map((ln, li) => (
                  <text key={li} x={t.x} y={t.y + (li - (lines.length - 1) / 2) * 9}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize={N > 12 ? "7" : "8.5"} fill="#fff" fontWeight="800"
                    fontFamily="'Courier New',monospace">
                    {ln}
                  </text>
                ))}
              </g>
            </g>
          );
        })}

        {/* Center hub */}
        <circle cx={cx} cy={cy} r={Ri + 7} fill="#060606" stroke="#ff6b2b" strokeWidth="1.5" />
        <circle cx={cx} cy={cy} r={Ri}     fill="url(#cg)" />
        <text x={cx} y={cy + 1.5} textAnchor="middle" dominantBaseline="middle"
          fontSize="15" fill="#fff" fontWeight="900" fontFamily="monospace">忍</text>
      </g>

      {/* ═══ POINTER — tip exactly at wheel edge y=26 (150-124=26) ═══ */}
      {/* Outer glow */}
      <polygon points={`${cx},26 ${cx - 14},5 ${cx + 14},5`} fill="#ff6b2b" filter="url(#pf)" opacity=".7" />
      {/* Main pointer */}
      <polygon points={`${cx},26 ${cx - 11},6 ${cx + 11},6`} fill="#ff6b2b" />
      {/* Inner highlight */}
      <polygon points={`${cx},22 ${cx - 7},8 ${cx + 7},8`} fill="#ff9966" opacity=".5" />
      {/* White edge */}
      <polygon points={`${cx},26 ${cx - 11},6 ${cx + 11},6`} fill="none" stroke="#ffffffaa" strokeWidth="0.8" />
      {/* Stem */}
      <rect x={cx - 2} y="0" width="4" height="6" fill="#ff6b2b" rx="2" opacity=".6" />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════
//  BACKSTORY via Claude API
// ═══════════════════════════════════════════════════════
async function fetchBackstory(results) {
  const summary = Object.entries(results)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.REACT_APP_GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 500,
      messages: [{
        role: "user",
        content: `Kamu adalah penulis lore Naruto kelas dunia. Tulis kisah latar belakang (backstory) seorang shinobi dalam Bahasa Indonesia yang gelap, mendalam, dan imersif — sepanjang 350 hingga 400 kata — berdasarkan stats berikut:\n\n${summary}\n\nStruktur cerita WAJIB mencakup:\n\n1. ASAL-USUL: Ceritakan desa asalnya, bagaimana suasana klan dan keluarganya saat ia kecil, serta bagaimana lingkungan membentuk kepribadiannya.\n\n2. LUKA MASA KECIL: Satu peristiwa traumatis atau momen paling menentukan di masa kecilnya yang mengubah segalanya — bisa kehilangan, pengkhianatan, atau kejadian tragis. Ceritakan dengan detail emosional yang kuat.\n\n3. KEBANGKITAN KEKUATAN: Bagaimana ia pertama kali menemukan atau membangkitkan kemampuan klannya. Dalam situasi apa, dengan perasaan seperti apa.\n\n4. JALAN NINJA: Filosofi bertarungnya, apa yang ia perjuangkan, siapa yang ia lindungi atau benci, dan bagaimana ia memandang dunia shinobi.\n\n5. BAYANGAN MASA DEPAN: Akhiri dengan SATU kalimat ramalan atau kalimat gelap yang terasa seperti firasat tentang takdir yang menantinya.\n\nAturan penulisan:\n- Gunakan Bahasa Indonesia yang kaya, sastrawi, dan dramatis\n- DILARANG pakai kalimat klise seperti "ia lahir sebagai pejuang" atau "ia berlatih keras"\n- Sebutkan nama tempat spesifik di dunia Naruto\n- Buat karakter ini terasa nyata, bukan seperti template\n- Tulis dalam format prosa mengalir, bukan poin-poin\n- Jangan gunakan judul atau header, langsung cerita,Buatkan Backstory dalam bahasa Indonesia`
      }]
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("Empty response from API");
  return text;
}

// ═══════════════════════════════════════════════════════
//  PENJELASAN per item via Groq
// ═══════════════════════════════════════════════════════
async function fetchExplanation(label, value) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.REACT_APP_GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 180,
      messages: [{
        role: "user",
        content: `Kamu adalah pakar lore Naruto. Jelaskan "${value}" (kategori: ${label}) dalam 2-3 kalimat singkat dalam Bahasa Indonesia yang menarik dan informatif. Jelaskan apa itu, kelebihannya, dan siapa yang terkenal memilikinya di dunia Naruto. Jangan pakai bullet point, langsung paragraf singkat saja.`
      }]
    })
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("Kosong");
  return text;
}

// ═══════════════════════════════════════════════════════
//  STAT ROW dengan tombol penjelasan
// ═══════════════════════════════════════════════════════
function StatRow({ s, v, idx }) {
  const [open,    setOpen]    = useState(false);
  const [text,    setText]    = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const toggle = async () => {
    if (open) { setOpen(false); return; }
    setOpen(true);
    if (text) return; // sudah di-cache, tidak perlu fetch lagi
    setLoading(true); setError("");
    try {
      const t = await fetchExplanation(s.label, v);
      setText(t);
    } catch (e) {
      setError("Gagal memuat penjelasan.");
    }
    setLoading(false);
  };

  return (
    <div className="cr" style={{ animationDelay: `${idx * 0.03}s` }}>
      {/* Baris utama */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "#0d0d0d", borderRadius: open ? "8px 8px 0 0" : 8,
        padding: "9px 14px", border: "1px solid #141414",
        borderBottom: open ? "1px solid #1e1e1e" : "1px solid #141414", gap: 12
      }}>
        <span style={{ color: "#3a3a3a", fontSize: 9, letterSpacing: 2, minWidth: 140, flexShrink: 0 }}>
          {s.emoji}  {s.label}
        </span>
        <span style={{ color: "#ff6b2b", fontWeight: 700, fontSize: 11, textAlign: "right", flex: 1 }}>{v}</span>
        {/* Tombol info */}
        <button onClick={toggle} title="Lihat penjelasan" style={{
          background: open ? "#ff6b2b22" : "none",
          border: `1px solid ${open ? "#ff6b2b66" : "#2a2a2a"}`,
          color: open ? "#ff6b2b" : "#3a3a3a", borderRadius: 6,
          width: 22, height: 22, cursor: "pointer", fontSize: 11,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, transition: "all .2s", fontFamily: "monospace"
        }}>ℹ</button>
      </div>

      {/* Panel penjelasan */}
      {open && (
        <div style={{
          background: "#0a0a0a", border: "1px solid #141414", borderTop: "none",
          borderRadius: "0 0 8px 8px", padding: "10px 14px",
          animation: "fadeUp .25s ease"
        }}>
          {loading && (
            <div style={{ fontSize: 10, color: "#444", letterSpacing: 2, animation: "blink 1s ease infinite" }}>
              ⏳  Memuat penjelasan...
            </div>
          )}
          {error && <div style={{ fontSize: 10, color: "#c0392b" }}>⚠ {error}</div>}
          {text && (
            <p style={{
              margin: 0, fontSize: 11.5, lineHeight: 1.85,
              color: "#a09890", fontFamily: "Georgia, serif"
            }}>{text}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  RESULT CARD
// ═══════════════════════════════════════════════════════
function ResultCard({ results, onReset }) {
  const [backstory, setBackstory]   = useState("");
  const [bsLoading, setBsLoading]   = useState(false);
  const [bsError,   setBsError]     = useState("");
  const combo  = detectCombo(results);
  const stages = buildStages(results);
  const clanInfo = CLANS.find(c => c.name === results.clan);

  const genBackstory = async () => {
    setBsLoading(true); setBsError(""); setBackstory("");
    try {
      const s = await fetchBackstory(results);
      setBackstory(s);
    } catch (e) {
      setBsError(e.message);
    }
    setBsLoading(false);
  };

  const copySheet = () => {
    const lines = stages.map(s => results[s.id] ? `${s.emoji} ${s.label}: ${results[s.id]}` : "").filter(Boolean).join("\n");
    navigator.clipboard.writeText(`⚡ NARUTO CHARACTER BUILD ⚡\n\n${lines}${combo ? "\n\n🔥 TITLE: " + combo.title : ""}${backstory ? "\n\n📖 BACKSTORY:\n" + backstory : ""}`);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#060606", fontFamily: "'Courier New',monospace", color: "#eee",
      backgroundImage: `radial-gradient(ellipse at 50% 0%, ${clanInfo?.glow || "#ff6b2b"}22 0%, #060606 55%)` }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmerT{0%,100%{background-position:200% center}50%{background-position:0% center}}
        @keyframes blink{0%,100%{opacity:.4}50%{opacity:1}}
        .cr{animation:fadeUp .3s ease both}
      `}</style>
      <div style={{ maxWidth: 620, margin: "0 auto", padding: "20px 16px 80px" }}>

        {/* Title */}
        <div style={{ textAlign: "center", padding: "28px 0 20px" }}>
          <div style={{ fontSize: 10, color: "#333", letterSpacing: 4, marginBottom: 8 }}>NARUTO CHAIN SPIN  ·  RESULT</div>
          <h1 style={{
            margin: 0, fontSize: 24, letterSpacing: 5, fontWeight: 900,
            background: `linear-gradient(90deg,${clanInfo?.glow||"#ff6b2b"},#f1c40f,${clanInfo?.glow||"#ff6b2b"})`,
            backgroundSize: "300%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            animation: "shimmerT 4s ease infinite"
          }}>CHARACTER BUILD</h1>
          {combo && (
            <div style={{
              marginTop: 14, padding: "11px 20px",
              border: `1px solid ${combo.color}`, borderRadius: 8,
              boxShadow: `0 0 28px ${combo.glow}, inset 0 0 20px ${combo.glow}`,
              fontSize: 13, fontWeight: 900, letterSpacing: 3, color: combo.color,
              animation: "fadeUp .6s ease"
            }}>{combo.title}</div>
          )}
        </div>

        {/* Stats grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {stages.map((s, idx) => {
            const v = results[s.id]; if (!v) return null;
            return <StatRow key={s.id} s={s} v={v} idx={idx} />;
          })}
        </div>

        {/* Backstory */}
        {backstory && (
          <div style={{ marginTop: 22, padding: "18px 20px", background: "#0c0c0c",
            border: "1px solid #ff6b2b33", borderRadius: 12, animation: "fadeUp .5s ease" }}>
            <div style={{ fontSize: 9, color: "#ff6b2b", letterSpacing: 3, marginBottom: 12 }}>📖  SHINOBI RECORD  ·  CLASSIFIED</div>
            <p style={{ margin: 0, fontSize: 12.5, lineHeight: 2, color: "#c0b9b0", fontFamily: "Georgia,serif", whiteSpace: "pre-wrap" }}>
              {backstory}
            </p>
          </div>
        )}
        {bsError && (
          <div style={{ marginTop: 14, padding: "12px 16px", background: "#180000",
            border: "1px solid #c0392b44", borderRadius: 8, fontSize: 10, color: "#c0392b" }}>
            ⚠ API ERROR: {bsError}
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
          {!backstory && (
            <button onClick={genBackstory} disabled={bsLoading} style={{
              background: bsLoading ? "#0d0d0d" : `linear-gradient(135deg,${clanInfo?.color||"#1a0600"},#0d0600)`,
              border: `1px solid ${bsLoading ? "#222" : "#ff6b2b66"}`,
              color: bsLoading ? "#333" : "#ff6b2b",
              borderRadius: 10, padding: "14px", fontSize: 11, fontWeight: 700,
              cursor: bsLoading ? "not-allowed" : "pointer", letterSpacing: 2,
              fontFamily: "monospace", transition: "all .2s"
            }}>
              {bsLoading
                ? <span style={{ animation: "blink 1s ease infinite", display: "inline-block" }}>⏳  CONSULTING THE ARCHIVES…</span>
                : "📖  GENERATE BACKSTORY  (AI-Powered)"}
            </button>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={copySheet} style={{
              flex: 1, background: "#0d0d0d", border: "1px solid #1e1e1e",
              color: "#555", borderRadius: 10, padding: "12px", fontSize: 10,
              cursor: "pointer", letterSpacing: 2, fontFamily: "monospace"
            }}>📋  COPY SHEET</button>
            <button onClick={onReset} style={{
              flex: 1, background: "linear-gradient(135deg,#6b0000,#3a0000)",
              border: "none", color: "#fff", borderRadius: 10, padding: "12px",
              fontSize: 12, fontWeight: 900, cursor: "pointer", letterSpacing: 2, fontFamily: "monospace",
              boxShadow: "0 4px 20px #c0392b33"
            }}>🔄  NEW SHINOBI</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  RARITY FLASH
// ═══════════════════════════════════════════════════════
const FLASH_BG = {
  Legendary: "radial-gradient(circle at center,#f1c40f55 0%,transparent 60%)",
  Rare:       "radial-gradient(circle at center,#9b59b644 0%,transparent 60%)",
  Uncommon:   "radial-gradient(circle at center,#27ae6033 0%,transparent 60%)",
};

// ═══════════════════════════════════════════════════════
//  MAIN APP
// ═══════════════════════════════════════════════════════
const KANJI = "忍力火水木土金風雷影鬼神術刃";

export default function App() {
  const [results,     setResults]     = useState({});
  const [stageIdx,    setStageIdx]    = useState(0);
  const [rotation,    setRotation]    = useState(0);
  const [duration,    setDuration]    = useState(null);
  const [spinning,    setSpinning]    = useState(false);
  const [winner,      setWinner]      = useState(null);     // the picked item obj
  const [displayItems,setDisplayItems]= useState([]);       // shuffled for wheel
  const [flash,       setFlash]       = useState(null);
  const [showResult,  setShowResult]  = useState(false);
  const rotRef   = useRef(0);
  const timerRef = useRef(null);

  const stages = buildStages(results);
  const stage  = stages[stageIdx];

  // Shuffle display items when stage changes
  useEffect(() => {
    if (!stage) return;
    setDisplayItems(shuffle(stage.pool));
    setWinner(null);
    setRotation(0);
    rotRef.current = 0;
    setDuration(null);
  }, [stageIdx, results.clan, results.jutsuType]);

  // Global CSS
  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = `
      @keyframes flashFade{0%{opacity:1}100%{opacity:0}}
      @keyframes pulseGlow{0%,100%{opacity:.5}50%{opacity:1}}
      @keyframes floatK{0%{transform:translateY(0) rotate(0deg);opacity:.05}100%{transform:translateY(-110vh) rotate(25deg);opacity:0}}
      @keyframes winIn{0%{opacity:0;transform:scale(.9) translateY(5px)}60%{transform:scale(1.03)}100%{opacity:1;transform:scale(1) translateY(0)}}
      ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#ff6b2b33;border-radius:4px}
    `;
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  // ─── SPIN  ──────────────────────────────────────────────
  // FORMULA (proven correct):
  //   Pointer is at TOP = 0° from center.
  //   Segment i CENTER sits at (i+0.5)*segAngle when rotation=0.
  //   After rotating R clockwise, segment center is at (i+0.5)*segAngle + R (mod 360).
  //   We want it = 0 ⟹  R = -(i+0.5)*segAngle (mod 360).
  //   But wheel already has prevRot, so:
  //     newRot = prevRot + additional
  //     (displayIdx+0.5)*seg + prevRot + additional ≡ 0  (mod 360)
  //     additional = (360 - ((displayIdx+0.5)*seg + prevRot%360) % 360) % 360
  const doSpin = useCallback(() => {
    if (spinning || !displayItems.length) return;
    setSpinning(true);
    setWinner(null);

    // 1. Weighted pick from ORIGINAL pool
    const pickedIdx  = weightedPick(stage.pool);
    const pickedItem = stage.pool[pickedIdx];

    // 2. Find where that item is in the SHUFFLED display
    const displayIdx = displayItems.findIndex(d => d.l === pickedItem.l);
    const safeIdx    = displayIdx >= 0 ? displayIdx : 0;

    const N        = displayItems.length;
    const seg      = 360 / N;
    const prevMod  = rotRef.current % 360;
    const centerAt = (safeIdx + 0.5) * seg;
    const additional = (360 - ((centerAt + prevMod) % 360)) % 360;
    const fullSpins  = 6 + Math.floor(Math.random() * 4);
    const finalRot   = rotRef.current + fullSpins * 360 + additional;
    const dur        = 4 + Math.random() * 1.5;

    rotRef.current = finalRot;
    setRotation(finalRot);
    setDuration(dur);

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setSpinning(false);
      setDuration(null);
      setWinner(pickedItem);
      if (pickedItem.r && pickedItem.r !== "Common") {
        setFlash(pickedItem.r);
        setTimeout(() => setFlash(null), 1200);
      }
    }, (dur + 0.2) * 1000);
  }, [spinning, displayItems, stage]);

  const confirmNext = () => {
    if (!winner) return;
    const newR = { ...results, [stage.id]: winner.l };
    setResults(newR);
    if (stageIdx < stages.length - 1) {
      setStageIdx(i => i + 1);
    } else {
      setShowResult(true);
    }
  };

  const reset = () => {
    clearTimeout(timerRef.current);
    setResults({}); setStageIdx(0); setRotation(0); rotRef.current = 0;
    setWinner(null); setDuration(null); setSpinning(false); setShowResult(false); setFlash(null);
  };

  if (showResult) return <ResultCard results={results} onReset={reset} />;

  const pct      = (stageIdx / stages.length) * 100;
  const clanInfo = CLANS.find(c => c.name === results.clan);
  const clanGlow = clanInfo?.glow || "#ff6b2b";
  const combo    = detectCombo({ ...results, [stage.id]: winner?.l });

  const RARITY_BADGE = { Legendary: ["#f1c40f","#3a2900"], Rare: ["#9b59b6","#2d0e50"], Uncommon: ["#27ae60","#082a12"] };

  return (
    <div style={{ minHeight: "100vh", background: "#060606", fontFamily: "'Courier New',monospace",
      color: "#eee", backgroundImage: `radial-gradient(ellipse at 50% -10%, ${clanGlow}22 0%, #060606 55%)` }}>

      {/* Floating kanji */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
        {Array.from({ length: 11 }).map((_, i) => (
          <span key={i} style={{
            position: "absolute", left: `${4 + i * 9}%`, bottom: `-${50 + i * 20}px`,
            fontSize: `${14 + i * 5}px`, color: "#ff4400", fontWeight: 900,
            animation: `floatK ${14 + i * 4}s ${i * 2}s linear infinite`
          }}>{KANJI[i % KANJI.length]}</span>
        ))}
      </div>

      {/* Rarity flash overlay */}
      {flash && (
        <div style={{
          position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999,
          background: FLASH_BG[flash] || "transparent",
          animation: "flashFade 1.2s ease-out forwards"
        }} />
      )}

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* Top bar */}
        <div style={{
          background: "#070707cc", backdropFilter: "blur(10px)",
          borderBottom: "1px solid #ff6b2b1a", padding: "10px 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, zIndex: 10
        }}>
          <div>
            <div style={{ fontSize: 13, color: "#ff6b2b", fontWeight: 900, letterSpacing: 3 }}>忍  NARUTO CHAIN SPIN</div>
            <div style={{ fontSize: 8, color: "#2a2a2a", letterSpacing: 2 }}>SHINOBI GENERATOR  ·  20 STAGES  ·  WEIGHTED RARITY</div>
          </div>
          <button onClick={reset} style={{
            background: "none", border: "1px solid #181818", color: "#2e2e2e",
            padding: "5px 10px", borderRadius: 6, cursor: "pointer", fontSize: 9, fontFamily: "monospace"
          }}>RESET</button>
        </div>

        {/* Progress bar */}
        <div style={{ background: "#080808", height: 3 }}>
          <div style={{
            background: `linear-gradient(90deg,${clanGlow},#c0392b)`,
            height: "100%", width: `${pct}%`, transition: "width .6s ease",
            boxShadow: `0 0 8px ${clanGlow}55`
          }} />
        </div>

        <div style={{ maxWidth: 490, margin: "0 auto", padding: "16px 16px 100px" }}>

          {/* Stage info */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ background: "#0d0d0d", border: `1px solid ${clanGlow}22`, borderRadius: 20,
              padding: "4px 12px", fontSize: 9, color: `${clanGlow}66`, letterSpacing: 2 }}>
              STAGE {stageIdx + 1} / {stages.length}
            </div>
            <div style={{ fontSize: 9, color: "#1e1e1e", letterSpacing: 1 }}>
              {"█".repeat(Math.round(pct / 10))}{"░".repeat(10 - Math.round(pct / 10))}
            </div>
          </div>

          {/* Stage title */}
          <div style={{
            textAlign: "center", marginBottom: 20, fontSize: 20, fontWeight: 900,
            letterSpacing: 5, color: "#ff6b2b", textShadow: "0 0 30px #ff6b2b33",
            animation: winner ? "none" : "pulseGlow 2.5s ease infinite"
          }}>
            {stage.emoji}  {stage.label}
          </div>

          {/* Wheel */}
          <div style={{
            position: "relative", maxWidth: 330, margin: "0 auto 20px",
            padding: 10, borderRadius: "50%",
            background: "radial-gradient(circle,#180400 0%,#070707 78%)",
            boxShadow: winner
              ? `0 0 60px ${clanGlow}55, 0 0 120px ${clanGlow}18, inset 0 0 30px #0009`
              : "inset 0 0 20px #0007",
            transition: "box-shadow .7s ease"
          }}>
            <SpinWheel displayItems={displayItems} rotation={rotation} duration={duration} />
          </div>

          {/* Result box */}
          <div style={{ minHeight: 76, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
            {winner ? (() => {
              const bc = RARITY_BADGE[winner.r];
              return (
                <div style={{
                  width: "100%", padding: "14px 20px",
                  background: `linear-gradient(135deg,${itemColor(winner,0)}22,#0d0d0d)`,
                  border: `1px solid ${itemColor(winner,0)}`,
                  borderRadius: 12, textAlign: "center",
                  boxShadow: `0 0 35px ${itemColor(winner,0)}44`,
                  animation: "winIn .45s ease"
                }}>
                  <div style={{ fontSize: 8, color: "#555", letterSpacing: 3, marginBottom: 6 }}>✦  YOU GOT  ✦</div>
                  <div style={{
                    fontSize: 16, fontWeight: 900, letterSpacing: 1,
                    color: itemColor(winner, 0),
                    textShadow: `0 0 20px ${itemColor(winner,0)}88`
                  }}>
                    {stage.emoji}  {winner.l}
                  </div>
                  {winner.sub && (
                    <div style={{ fontSize: 9, color: "#555", marginTop: 5, letterSpacing: 1 }}>{winner.sub}</div>
                  )}
                  {bc && (
                    <span style={{
                      display: "inline-block", marginTop: 8, padding: "3px 12px",
                      background: bc[1], borderRadius: 4, fontSize: 8,
                      letterSpacing: 3, fontWeight: 900, color: bc[0],
                      border: `1px solid ${bc[0]}44`
                    }}>{winner.r.toUpperCase()}</span>
                  )}
                </div>
              );
            })() : (
              <div style={{
                color: "#1c1c1c", fontSize: 12, letterSpacing: 3,
                animation: spinning ? "pulseGlow 1s ease infinite" : "none"
              }}>
                {spinning ? "🌀  SPINNING…" : "◈  SPIN THE WHEEL"}
              </div>
            )}
          </div>

          {/* Combo preview */}
          {combo && winner && (
            <div style={{
              textAlign: "center", marginBottom: 16, padding: "9px",
              border: `1px solid ${combo.color}`, borderRadius: 8,
              fontSize: 11, fontWeight: 900, letterSpacing: 2, color: combo.color,
              boxShadow: `0 0 20px ${combo.glow}`, animation: "pulseGlow 2s ease infinite"
            }}>{combo.title}</div>
          )}

          {/* Buttons */}
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button onClick={doSpin} disabled={spinning} style={{
              background: spinning ? "#0d0d0d" : "linear-gradient(135deg,#b03020,#6a0000)",
              color: spinning ? "#2a2a2a" : "#fff",
              border: "none", borderRadius: 10, padding: "14px 32px",
              fontSize: 13, fontWeight: 900, cursor: spinning ? "not-allowed" : "pointer",
              letterSpacing: 3, fontFamily: "monospace",
              boxShadow: spinning ? "none" : "0 4px 28px #c0392b44",
              transition: "all .2s", minWidth: 140
            }}>
              {spinning ? "SPINNING…" : winner ? "↺  RE-SPIN" : "⚡  SPIN"}
            </button>
            {winner && !spinning && (
              <button onClick={confirmNext} style={{
                background: "linear-gradient(135deg,#0a4a1e,#051505)",
                color: "#2ecc71", border: "1px solid #1e8449",
                borderRadius: 10, padding: "14px 26px", fontSize: 12,
                fontWeight: 900, cursor: "pointer", letterSpacing: 2,
                fontFamily: "monospace", boxShadow: "0 4px 22px #1e844933"
              }}>
                {stageIdx < stages.length - 1 ? "NEXT  ›" : "FINISH  ✓"}
              </button>
            )}
          </div>

          {/* Chain results */}
          {Object.keys(results).length > 0 && (
            <div style={{ marginTop: 28 }}>
              <div style={{ fontSize: 8, color: "#1a1a1a", letterSpacing: 4, marginBottom: 8, textAlign: "center" }}>
                ─────  CHAIN  ─────
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {stages.slice(0, stageIdx).map(s => {
                  const v = results[s.id]; if (!v) return null;
                  return (
                    <div key={s.id} style={{
                      display: "flex", justifyContent: "space-between",
                      background: "#0a0a0a", borderRadius: 6,
                      padding: "6px 12px", border: "1px solid #0f0f0f", fontSize: 10, gap: 10
                    }}>
                      <span style={{ color: "#272727" }}>{s.emoji} {s.label}</span>
                      <span style={{ color: "#666", fontWeight: 700, textAlign: "right" }}>{v}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
