import { RECENT_RACES, TEAM_COLORS } from "../model";

export function RecentRaces() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-3xl font-bold mb-2">Últimas Carreras</h2>
        <p className="text-f1-muted mb-8">Resultados de los Grandes Premios más recientes</p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {RECENT_RACES.map((race) => {
            const winnerColor = TEAM_COLORS[race.winnerTeam] ?? "#71717a";

            return (
              <div
                key={race.round}
                className="rounded-xl border border-f1-border bg-f1-card p-5 hover:border-f1-red/20 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-f1-red">
                    Ronda {race.round}
                  </span>
                  <span className="text-xs text-f1-muted">{race.date}</span>
                </div>

                <h3 className="text-lg font-bold mb-1">{race.grandPrix}</h3>
                <p className="text-sm text-f1-muted mb-4">{race.circuit}</p>

                <div className="space-y-2 pt-4 border-t border-f1-border">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: winnerColor }}
                    />
                    <span className="text-sm text-f1-muted">Ganador:</span>
                    <span className="text-sm font-semibold">{race.winner}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full flex-shrink-0 bg-f1-red" />
                    <span className="text-sm text-f1-muted">Vuelta rápida:</span>
                    <span className="text-sm font-semibold">{race.fastestLap}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
