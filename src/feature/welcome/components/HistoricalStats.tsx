import { HISTORICAL_STATS } from "../model";

export function HistoricalStats() {
  return (
    <section id="history" className="py-16">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-3xl font-bold mb-2">Datos Históricos</h2>
        <p className="text-f1-muted mb-8">La Fórmula 1 en números desde 1950</p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HISTORICAL_STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-f1-border bg-f1-card p-6 hover:border-f1-red/20 transition-colors"
            >
              <span className="text-4xl font-bold bg-gradient-to-r from-f1-red to-red-400 bg-clip-text text-transparent">
                {stat.value}
              </span>
              <h3 className="mt-3 font-semibold">{stat.label}</h3>
              <p className="mt-2 text-sm text-f1-muted leading-relaxed">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
