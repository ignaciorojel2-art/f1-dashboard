import { DRIVER_STANDINGS, TEAM_COLORS } from "../model";

export function DriverStandings() {
  const maxPoints = DRIVER_STANDINGS[0]?.points ?? 1;

  return (
    <section id="standings" className="py-16">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-3xl font-bold mb-2">Campeonato de Pilotos</h2>
        <p className="text-f1-muted mb-8">Clasificación actual de la temporada 2025</p>

        <div className="rounded-xl border border-f1-border bg-f1-card overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-f1-muted border-b border-f1-border">
            <span className="col-span-1">Pos</span>
            <span className="col-span-4">Piloto</span>
            <span className="col-span-3">Equipo</span>
            <span className="col-span-2 text-right">Puntos</span>
            <span className="col-span-2 text-right">Victorias</span>
          </div>

          {DRIVER_STANDINGS.map((driver, index) => {
            const barWidth = (driver.points / maxPoints) * 100;
            const teamColor = TEAM_COLORS[driver.team] ?? "#71717a";

            return (
              <div
                key={driver.id}
                className="grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-f1-border/50 last:border-0 hover:bg-white/[0.02] transition-colors relative"
              >
                <div
                  className="absolute inset-y-0 left-0 opacity-5"
                  style={{ width: `${barWidth}%`, backgroundColor: teamColor }}
                />
                <span className="col-span-1 text-lg font-bold">{index + 1}</span>
                <div className="col-span-4 flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-f1-border text-sm font-bold">
                    {driver.number}
                  </span>
                  <div>
                    <span className="block font-semibold">{driver.name}</span>
                    <span className="text-xs text-f1-muted">{driver.nationality}</span>
                  </div>
                </div>
                <div className="col-span-3 flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: teamColor }}
                  />
                  <span className="text-sm text-f1-muted">{driver.team}</span>
                </div>
                <span className="col-span-2 text-right font-mono font-bold">{driver.points}</span>
                <span className="col-span-2 text-right font-mono">{driver.wins}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
