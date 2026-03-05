// lib/tournament.ts
// ✅ Updated to connect your local images from /public/teams/*
// ✅ Also fixes "Team EnVyUs (Ghosts)" key mismatch (your seed uses "Team EnVy (Ghosts)")
// ✅ Keeps your current seeds/rosters/accolades as provided

export type Region = "EAST" | "WEST" | "SOUTH" | "MIDWEST";

export type Team = {
  name: string;
  region: Region;
  seed: number;
  imageUrl?: string | null;
  roster: string[];
  accolades: string[];
};

export type MatchRound = "R32" | "R16" | "R8" | "FF" | "CHIP";

export type SourceRef =
  | { type: "seed"; region: Region; seed: number }
  | { type: "match"; matchId: string };

export type MatchDef = {
  id: string;
  round: MatchRound;
  region?: Region;
  sources: [SourceRef, SourceRef];
};

export type PicksMap = Record<string, string>;

export type MatchIdParts = {
  region: Region;
  round: "R32" | "R16" | "R8";
  index: number;
};

export const LOCK_TIMESTAMP_ISO = "2026-03-17T04:00:00.000Z";

export const REGIONS: Region[] = ["EAST", "WEST", "SOUTH", "MIDWEST"];

export const REGION_SEEDS: Record<Region, Array<{ seed: number; name: string }>> = {
  EAST: [
    { seed: 1, name: "OpTic Gaming (BO3-IW)" },
    { seed: 2, name: "Atlanta FaZe (Cold War)" },
    { seed: 3, name: "Dallas Empire (MW 2019)" },
    { seed: 4, name: "New York Subliners (MWII)" },
    { seed: 5, name: "Denial eSports (Advanced Warfare)" },
    { seed: 6, name: "Team Kaliber (Ghosts)" },
    { seed: 7, name: "London Royal Ravens (MW 2019)" },
    { seed: 8, name: "OpTic Gaming (BO1)" }
  ],
  WEST: [
    { seed: 1, name: "compLexity Gaming (BO2-Ghosts)" },
    { seed: 2, name: "eUnited (Black Ops 4)" },
    { seed: 3, name: "Los Angeles Thieves (Vanguard)" },
    { seed: 4, name: "Toronto Ultra (Cold War)" },
    { seed: 5, name: "FaZe Clan (BO3)" },
    { seed: 6, name: "Rise Nation (WWII)" },
    { seed: 7, name: "Seattle Surge (Vanguard)" },
    { seed: 8, name: "Strictly Business (BO2)" }
  ],
  SOUTH: [
    { seed: 1, name: "Fariko Impact (Black Ops 2)" },
    { seed: 2, name: "OpTic Gaming (MW3)" },
    { seed: 3, name: "EnVyUs (Black Ops 3)" },
    { seed: 4, name: "100 Thieves (Black Ops 4)" },
    { seed: 5, name: "Evil Geniuses (WWII)" },
    { seed: 6, name: "Chicago Huntsmen (MW 2019)" },
    { seed: 7, name: "Florida Mutineers (MW 2019)" },
    { seed: 8, name: "Mindfreak (BO3)" }
  ],
  MIDWEST: [
    { seed: 1, name: "OpTic Texas (BO6)" },
    { seed: 2, name: "Gen.G (Black Ops 4)" },
    { seed: 3, name: "Splyce (Infinite Warfare)" },
    { seed: 4, name: "Team EnVy (Ghosts)" },
    { seed: 5, name: "Cloud9 (BO3)" },
    { seed: 6, name: "LAT (BO6)" },
    { seed: 7, name: "Renegades (BO4)" },
    { seed: 8, name: "OpTic Texas (MWII)" }
  ]
};

const CHAMPS_ACCOLADES: Record<string, string> = {
  "Fariko Impact (Black Ops 2)": "2013 Champs winners",
  "Denial eSports (Advanced Warfare)": "2015 Champs winners",
  "EnVyUs (Black Ops 3)": "2016 Champs winners",
  "OpTic Gaming (BO3-IW)": "2017 Champs winners",
  "Evil Geniuses (WWII)": "2018 Champs winners",
  "eUnited (Black Ops 4)": "2019 Champs winners",
  "Dallas Empire (MW 2019)": "2020 Champs winners",
  "Atlanta FaZe (Cold War)": "2021 Champs winners",
  "Los Angeles Thieves (Vanguard)": "2022 Champs winners",
  "New York Subliners (MWII)": "2023 Champs winners",
  "OpTic Texas (BO6)": "BO6 Champs winners",
  "OpTic Texas (MWII)": "MWII Champs winners"
};

const ROSTER_MAP: Record<string, string[]> = {
  "OpTic Gaming (BO3-IW)": ["Scump", "FormaL", "Crimsix", "Karma"],
  "Atlanta FaZe (Cold War)": ["Simp", "aBeZy", "Cellium", "Arcitys"],
  "Dallas Empire (MW 2019)": ["Crimsix", "Clayster", "Shotzzy", "Huke"],
  "New York Subliners (MWII)": ["HyDra", "Kismet", "Skyz", "Sib"],
  "Denial eSports (Advanced Warfare)": ["Clayster", "Attach", "Replays", "Enable"],
  "Team Kaliber (Ghosts)": ["Sharp", "Theory", "Goonjar", "Enable"],
  "London Royal Ravens (MW 2019)": ["Wuskin", "Skrapz", "Dylan", "Rated"],
  "OpTic Gaming (BO1)": ["Scump", "BigT", "Merk", "Rambo"],

  "compLexity Gaming (BO2-Ghosts)": ["Crimsix", "Aches", "TeeP", "Clayster"],
  "eUnited (Black Ops 4)": ["Simp", "aBeZy", "Arcitys", "Clayster"],
  "Los Angeles Thieves (Vanguard)": ["Octane", "Kenny", "Envoy", "Drazah"],
  "Toronto Ultra (Cold War)": ["Cammy", "CleanX", "Bance", "Insight"],
  "FaZe Clan (BO3)": ["Zoomaa", "Attach", "Enable", "Clayster"],
  "Rise Nation (WWII)": ["Slasher", "Gunless", "TJHaLy", "Loony"],
  "Seattle Surge (Vanguard)": ["Pred", "Sib", "Accuracy", "Mack"],
  "Strictly Business (BO2)": ["Aches", "TeeP", "Rambo", "Merk"],

  "Fariko Impact (Black Ops 2)": ["Killa", "Karma", "Parasite", "MiRx"],
  "OpTic Gaming (MW3)": ["Scump", "BigT", "Merk", "Nadeshot"],
  "EnVyUs (Black Ops 3)": ["Slasher", "John", "Apathy", "Classic"],
  "100 Thieves (Black Ops 4)": ["Octane", "Kenny", "Slasher", "Enable"],
  "Evil Geniuses (WWII)": ["Aches", "Assault", "Silly", "Apathy"],
  "Chicago Huntsmen (MW 2019)": ["Scump", "FormaL", "Envoy", "Arcitys"],
  "Florida Mutineers (MW 2019)": ["Skyz", "Owakening", "Havok", "Frosty"],
  "Mindfreak (BO3)": ["Shockz", "Fighta", "Denz", "Swifty"],

  "OpTic Texas (MWII)": ["Shotzzy", "Dashy", "Kenny", "Pred"],
  "Gen.G (Black Ops 4)": ["MajorManiak", "Envoy", "Nagafen", "Maux"],
  "Splyce (Infinite Warfare)": ["Zer0", "Bance", "Jurd", "MadCat"],
  // ✅ FIX: key matches REGION_SEEDS exactly
  "Team EnVy (Ghosts)": ["Merk", "Nameless", "JKap", "FormaL"],
  "Cloud9 (BO3)": ["Aches", "Assault", "Lacefield", "Xotic"],
  "LAT (BO6)": ["Hydra", "Scrap", "Ghosty", "Envoy"],
  "Renegades (BO4)": ["Dylan", "Zed", "Rated", "Skrapz"],

  // ✅ NEW roster requested
  "OpTic Texas (BO6)": ["Shotzzy", "Huke", "Dashy", "Mercules"],

  // Kept for reference; no longer seeded in MIDWEST
  "OpTic Gaming (Advanced Warfare)": ["Scump", "FormaL", "Crimsix", "Karma"]
};

/**
 * ✅ LOCAL IMAGE MAP
 * Put these files in: /public/teams/<filename>
 * Then the URL is: /teams/<filename>
 *
 * Your screenshot shows mixed formats (.jpg/.webp/.avif, and one .png for strictly-business)
 * If ANY filename differs, update the value here to match exactly.
 */
const IMAGE_MAP: Record<string, string> = {
  "100 Thieves (Black Ops 4)": "/teams/100-thieves-black-ops-4.webp",
  "Atlanta FaZe (Cold War)": "/teams/atlanta-faze-cold-war.jpg",
  "Chicago Huntsmen (MW 2019)": "/teams/chicago-huntsmen-mw2019.jpg",
  "Cloud9 (BO3)": "/teams/cloud9-bo3.jpg",
  "compLexity Gaming (BO2-Ghosts)": "/teams/complexity-gaming-bo2-ghosts.avif",
  "Dallas Empire (MW 2019)": "/teams/dallas-empire-mw-2019.jpg",
  "Denial eSports (Advanced Warfare)": "/teams/denial-esports-advanced-warfare.avif",
  "EnVyUs (Black Ops 3)": "/teams/envyus-black-ops-3.jpg",
  "eUnited (Black Ops 4)": "/teams/eunited-b04.jpg",
  "Evil Geniuses (WWII)": "/teams/evil-geniuses-wwll.webp",
  "Fariko Impact (Black Ops 2)": "/teams/fariko-impact-black-ops-2.webp",
  "FaZe Clan (BO3)": "/teams/faze-clan-bo3.jpg",
  "Florida Mutineers (MW 2019)": "/teams/florida-mutineers-mw2019.jpg",
  "Gen.G (Black Ops 4)": "/teams/gen.g-black-ops-4.webp",
  "LAT (BO6)": "/teams/lat-bo6.jpg",
  "London Royal Ravens (MW 2019)": "/teams/london-royal-ravens-mw-2019.avif",
  "Los Angeles Thieves (Vanguard)": "/teams/los-angeles-thieves-vanguard.jpg",
  "Mindfreak (BO3)": "/teams/mindfreak-bo3.webp",
  "New York Subliners (MWII)": "/teams/new-york-subliners-mwii.jpg",
  "OpTic Gaming (BO1)": "/teams/optic-gaming-bo1.jpg",
  "OpTic Gaming (BO3-IW)": "/teams/optic-gaming-bo3-iw.avif",
  "OpTic Gaming (MW3)": "/teams/optic-gaming-mw3.jpg",
  "OpTic Texas (BO6)": "/teams/optic-texas-bo6.jpg",
  "OpTic Texas (MWII)": "/teams/optic-texas-mwii.jpg",
  "Renegades (BO4)": "/teams/renegades-bo4.webp",
  "Rise Nation (WWII)": "/teams/rise-nation-wwll.jpg",
  "Seattle Surge (Vanguard)": "/teams/seattle-surge-vanguard.jpg",
  "Splyce (Infinite Warfare)": "/teams/splyce-infinite-warfae.jpg",
  "Strictly Business (BO2)": "/teams/strictly-business-bo2.png",
  "Team EnVy (Ghosts)": "/teams/team-envyus-ghosts.jpg",
  "Team Kaliber (Ghosts)": "/teams/team-kaliber-ghosts.jpg",
  "Toronto Ultra (Cold War)": "/teams/toronto-ultra-cold-war.jpg"
};

export const TEAMS: Team[] = REGIONS.flatMap((region) =>
  REGION_SEEDS[region].map(({ seed, name }) => ({
    name,
    region,
    seed,
    imageUrl: IMAGE_MAP[name] ?? null,
    roster: ROSTER_MAP[name] ?? [],
    accolades: [CHAMPS_ACCOLADES[name] ?? "Major champions / contenders"]
  }))
);

function pair(left: SourceRef, right: SourceRef): [SourceRef, SourceRef] {
  return [left, right];
}

export function buildMatchId(region: Region, round: "R32" | "R16" | "R8", index: number): string {
  return `${region}-${round}-${index}`;
}

export function parseMatchId(matchId: string): MatchIdParts | null {
  const match = matchId.match(/^(EAST|WEST|SOUTH|MIDWEST)-(R32|R16|R8)-([1-9][0-9]*)$/);
  if (!match) {
    return null;
  }
  return {
    region: match[1] as Region,
    round: match[2] as "R32" | "R16" | "R8",
    index: Number(match[3])
  };
}

export const MATCHES: MatchDef[] = [
  ...REGIONS.flatMap((region) => [
    {
      id: buildMatchId(region, "R32", 1),
      round: "R32" as const,
      region,
      sources: pair({ type: "seed", region, seed: 1 }, { type: "seed", region, seed: 8 })
    },
    {
      id: buildMatchId(region, "R32", 2),
      round: "R32" as const,
      region,
      sources: pair({ type: "seed", region, seed: 4 }, { type: "seed", region, seed: 5 })
    },
    {
      id: buildMatchId(region, "R32", 3),
      round: "R32" as const,
      region,
      sources: pair({ type: "seed", region, seed: 3 }, { type: "seed", region, seed: 6 })
    },
    {
      id: buildMatchId(region, "R32", 4),
      round: "R32" as const,
      region,
      sources: pair({ type: "seed", region, seed: 2 }, { type: "seed", region, seed: 7 })
    },
    {
      id: buildMatchId(region, "R16", 1),
      round: "R16" as const,
      region,
      sources: pair(
        { type: "match", matchId: buildMatchId(region, "R32", 1) },
        { type: "match", matchId: buildMatchId(region, "R32", 2) }
      )
    },
    {
      id: buildMatchId(region, "R16", 2),
      round: "R16" as const,
      region,
      sources: pair(
        { type: "match", matchId: buildMatchId(region, "R32", 3) },
        { type: "match", matchId: buildMatchId(region, "R32", 4) }
      )
    },
    {
      id: buildMatchId(region, "R8", 1),
      round: "R8" as const,
      region,
      sources: pair(
        { type: "match", matchId: buildMatchId(region, "R16", 1) },
        { type: "match", matchId: buildMatchId(region, "R16", 2) }
      )
    }
  ]),
  {
    id: "FF-1",
    round: "FF",
    sources: pair({ type: "match", matchId: "EAST-R8-1" }, { type: "match", matchId: "WEST-R8-1" })
  },
  {
    id: "FF-2",
    round: "FF",
    sources: pair({ type: "match", matchId: "SOUTH-R8-1" }, { type: "match", matchId: "MIDWEST-R8-1" })
  },
  {
    id: "CHIP",
    round: "CHIP",
    sources: pair({ type: "match", matchId: "FF-1" }, { type: "match", matchId: "FF-2" })
  }
];

export const MATCH_IDS = MATCHES.map((m) => m.id);

export function generateInitialBracketStructure(): Record<string, null> {
  return Object.fromEntries(MATCH_IDS.map((matchId) => [matchId, null]));
}

const matchesById = new Map(MATCHES.map((m) => [m.id, m]));
const teamsBySeed = new Map(TEAMS.map((t) => [`${t.region}-${t.seed}`, t.name]));

const childrenByMatchId = MATCHES.reduce<Record<string, string[]>>((acc, match) => {
  for (const source of match.sources) {
    if (source.type === "match") {
      const list = acc[source.matchId] ?? [];
      list.push(match.id);
      acc[source.matchId] = list;
    }
  }
  return acc;
}, {});

export function isLocked(nowMs: number = Date.now()): boolean {
  return nowMs >= new Date(LOCK_TIMESTAMP_ISO).getTime();
}

export function getMatchById(matchId: string): MatchDef | undefined {
  return matchesById.get(matchId);
}

function resolveSource(source: SourceRef, picks: PicksMap): string | null {
  if (source.type === "seed") {
    return teamsBySeed.get(`${source.region}-${source.seed}`) ?? null;
  }
  return picks[source.matchId] ?? null;
}

export function getMatchOptions(matchId: string, picks: PicksMap): [string | null, string | null] {
  const match = getMatchById(matchId);
  if (!match) {
    return [null, null];
  }
  return [resolveSource(match.sources[0], picks), resolveSource(match.sources[1], picks)];
}

export function applyPickWithCascade(picks: PicksMap, matchId: string, winnerName: string): PicksMap {
  const next: PicksMap = { ...picks, [matchId]: winnerName };
  const queue: string[] = [...(childrenByMatchId[matchId] ?? [])];

  while (queue.length > 0) {
    const currentId = queue.shift();
    if (!currentId) continue;

    const currentPick = next[currentId];
    if (!currentPick) {
      queue.push(...(childrenByMatchId[currentId] ?? []));
      continue;
    }

    const [left, right] = getMatchOptions(currentId, next);
    if (currentPick !== left && currentPick !== right) {
      delete next[currentId];
      queue.push(...(childrenByMatchId[currentId] ?? []));
    }
  }

  return next;
}

export function calculateAccuracy(
  picks: PicksMap,
  results: Record<string, string>
): { correct: number; decided: number; percentage: number } {
  let correct = 0;
  let decided = 0;

  for (const [matchId, winnerName] of Object.entries(results)) {
    if (!winnerName) continue;
    decided += 1;
    if (picks[matchId] === winnerName) correct += 1;
  }

  return {
    correct,
    decided,
    percentage: decided === 0 ? 0 : (correct / decided) * 100
  };
}

export function getRegionMatches(region: Region): MatchDef[] {
  return MATCHES.filter((match) => match.region === region);
}