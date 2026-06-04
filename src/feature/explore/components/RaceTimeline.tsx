import { RECENT_RACES, TEAM_COLORS } from "../model";

export function RaceTimeline() {
  return (
    <section className="py-16 bg-slate-50">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="animate-fade-in opacity-0 text-3xl font-bold text-slate-900 mb-2">
          Línea de Carreras
        </h2>
        <p className="animate-fade-in opacity-0 text-slate-500 mb-12 delay-200">
          Últimos 10 Grandes Premios en orden cronológico inverso
        </p>

        <div className="relative">
          <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-indigo-400 via-indigo-300 to-slate-200" />

          <div className="space-y-8">
            {RECENT_RACES.map((race, index) => {
              const winnerColor = TEAM_COLORS[race.winnerTeam] ?? "#94a3b8";

              return (
                <div
                  key={race.round}
                  className="animate-slide-in-left opacity-0 relative flex gap-6"
                  style={{ animationDelay: `${0.15 + index * 0.1}s` }}
                >
                  <div className="relative z-10 mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-4 border-slate-50 bg-white shadow-sm">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: winnerColor }}
                    />
                  </div>

                  <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">
                        Ronda {race.round}
                      </span>
                      <span className="text-xs text-slate-400">{race.date}</span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900">{race.grandPrix}</h3>
                    <p className="text-sm text-slate-400 mb-3">{race.circuit}</p>

                    <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                        🏆 {race.winner}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                        ⏱️ {race.fastestLap}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
