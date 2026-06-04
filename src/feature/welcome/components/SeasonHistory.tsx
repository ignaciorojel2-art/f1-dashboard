import { SEASON_HISTORY } from "../model";

export function SeasonHistory() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-3xl font-bold mb-2">Historial de Temporadas</h2>
        <p className="text-f1-muted mb-8">Campeones de las últimas temporadas</p>

        <div className="rounded-xl border border-f1-border bg-f1-card overflow-hidden">
          <div className="grid grid-cols-4 gap-4 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-f1-muted border-b border-f1-border">
            <span>Temporada</span>
            <span>Campeón Pilotos</span>
            <span>Campeón Constructores</span>
            <span className="text-right">Carreras</span>
          </div>

          {SEASON_HISTORY.map((season) => (
            <div
              key={season.year}
              className="grid grid-cols-4 gap-4 px-6 py-4 items-center border-b border-f1-border/50 last:border-0 hover:bg-white/[0.02] transition-colors"
            >
              <span className="font-mono text-lg font-bold text-f1-red">{season.year}</span>
              <span className="font-semibold">{season.driversChampion}</span>
              <span className="text-f1-muted">{season.constructorsChampion}</span>
              <span className="text-right font-mono">{season.totalRaces}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
