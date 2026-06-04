import { CONSTRUCTOR_STANDINGS } from "../model";

export function ConstructorStandings() {
  const maxPoints = CONSTRUCTOR_STANDINGS[0]?.points ?? 1;

  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-3xl font-bold mb-2">Campeonato de Constructores</h2>
        <p className="text-f1-muted mb-8">Clasificación por equipos de la temporada 2025</p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {CONSTRUCTOR_STANDINGS.map((constructor, index) => (
            <div
              key={constructor.id}
              className="rounded-xl border border-f1-border bg-f1-card p-6 hover:border-f1-red/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-bold text-f1-muted/30">0{index + 1}</span>
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: constructor.color }}
                />
              </div>
              <h3 className="text-lg font-bold">{constructor.name}</h3>
              <p className="text-sm text-f1-muted mb-4">{constructor.nationality}</p>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-f1-muted">Puntos</span>
                    <span className="font-mono font-bold">{constructor.points}</span>
                  </div>
                  <div className="h-2 rounded-full bg-f1-border overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(constructor.points / maxPoints) * 100}%`,
                        backgroundColor: constructor.color,
                      }}
                    />
                  </div>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-f1-muted">Victorias</span>
                  <span className="font-mono font-bold">{constructor.wins}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
