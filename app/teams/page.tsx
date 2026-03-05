import { TEAMS } from "@/lib/tournament";

export default function TeamsPage() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {TEAMS.map((team) => (
        <article key={team.name} className="card flex flex-col gap-3">
          {team.imageUrl ? (
            <img src={team.imageUrl} alt={team.name} className="h-32 w-full rounded-xl border border-red-900/60 object-cover" />
          ) : (
            <div className="h-32 rounded-xl border border-red-900/60 bg-gradient-to-br from-red-950/60 to-black/80" />
          )}
          <div>
            <p className="text-xs uppercase tracking-wider text-red-300">
              {team.region} - Seed {team.seed}
            </p>
            <h2 className="text-xl font-semibold uppercase tracking-wide">{team.name}</h2>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-400">Roster</p>
            <p className="text-sm text-zinc-200">{team.roster.join(", ")}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-400">Accolades</p>
            <ul className="list-disc pl-5 text-sm text-zinc-200">
              {team.accolades.map((acc) => (
                <li key={acc}>{acc}</li>
              ))}
            </ul>
          </div>
        </article>
      ))}
    </div>
  );
}
