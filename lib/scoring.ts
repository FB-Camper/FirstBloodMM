import { calculateAccuracy, type PicksMap } from "@/lib/tournament";

export type LeaderboardEntry = {
  userId: string;
  username: string;
  handle: string;
  picks: PicksMap;
  champion: string | null;
  submittedAt: string;
  updatedAt: string;
  correct: number;
  decided: number;
  accuracy: number;
  championCorrect: boolean;
  finalFourCorrect: number;
};

export function scoreEntry(
  user: { id: string; username: string },
  bracket: {
    handle: string | null;
    picks_json: PicksMap;
    champion: string | null;
    submitted_at: string | null;
    updated_at: string;
  },
  results: Record<string, string>
): LeaderboardEntry {
  const picks = bracket.picks_json ?? {};
  const { correct, decided, percentage } = calculateAccuracy(picks, results);

  const chipResult = results.CHIP;
  const ff1Result = results["FF-1"];
  const ff2Result = results["FF-2"];

  const championCorrect = Boolean(chipResult && picks.CHIP === chipResult);
  const finalFourCorrect = Number(Boolean(ff1Result && picks["FF-1"] === ff1Result)) + Number(Boolean(ff2Result && picks["FF-2"] === ff2Result));

  return {
    userId: user.id,
    username: user.username,
    handle: bracket.handle ?? `@${user.username}`,
    picks,
    champion: bracket.champion,
    submittedAt: bracket.submitted_at ?? bracket.updated_at,
    updatedAt: bracket.updated_at,
    correct,
    decided,
    accuracy: percentage,
    championCorrect,
    finalFourCorrect
  };
}
