"use client";

type Entry = {
  rank: number;
  userId?: string;
  username: string;
  handle: string;
  correct: number;
  decided: number;
  accuracy: number;
  champion: string | null;
  championCorrect: boolean;
  finalFourCorrect: number;
  submittedAt?: string;
  updatedAt: string;
  isMe?: boolean;
};

type LeaderboardResponse = {
  entries: Entry[];
  me: Entry | null;
};

export function LeaderboardClient({ initial }: { initial: LeaderboardResponse }) {
  const data = initial;

  return (
    <div className="space-y-4">
      {data.me && (
        <section className="card border-red-500/60">
          <p className="text-xs uppercase tracking-wider text-red-300">My Entry</p>
          <p className="text-xl font-semibold">{data.me.handle}</p>
          <p className="text-sm text-zinc-300">
            {data.me.correct}/{data.me.decided} ({data.me.accuracy.toFixed(1)}%) — Champion:{" "}
            {data.me.champion ?? "TBD"}
          </p>
        </section>
      )}

      <section className="card overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-red-900/70 text-red-300">
              <th className="px-2 py-2">Rank</th>
              <th className="px-2 py-2">User</th>
              <th className="px-2 py-2">Correct/Decided</th>
              <th className="px-2 py-2">Accuracy</th>
              <th className="px-2 py-2">Champion Pick</th>
              <th className="px-2 py-2">Tiebreak</th>
              <th className="px-2 py-2">Updated</th>
            </tr>
          </thead>
          <tbody>
            {data.entries.map((entry) => (
              <tr key={`${entry.handle}-${entry.rank}`} className={entry.isMe ? "bg-red-950/40" : ""}>
                <td className="px-2 py-2">{entry.rank}</td>
                <td className="px-2 py-2">{entry.handle}</td>
                <td className="px-2 py-2">
                  {entry.correct}/{entry.decided}
                </td>
                <td className="px-2 py-2">{entry.accuracy.toFixed(1)}%</td>
                <td className="px-2 py-2">{entry.champion ?? "TBD"}</td>
                <td className="px-2 py-2">
                  Champion {entry.championCorrect ? "✓" : "—"} | FF {entry.finalFourCorrect}
                </td>
                <td className="px-2 py-2">
                  {entry.updatedAt ? new Date(entry.updatedAt).toLocaleString() : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card text-sm text-zinc-300">
        <p className="font-semibold text-red-300">Tiebreak Rules</p>
        <p>1. Champion correct</p>
        <p>2. Final Four correct count</p>
        <p>3. Earlier submission timestamp</p>
      </section>
    </div>
  );
}
