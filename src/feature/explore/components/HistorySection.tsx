const HISTORY = [
  { year: 2024, champion: "Max Verstappen", team: "McLaren", races: 24 },
  { year: 2023, champion: "Max Verstappen", team: "Red Bull Racing", races: 22 },
  { year: 2022, champion: "Max Verstappen", team: "Red Bull Racing", races: 22 },
  { year: 2021, champion: "Max Verstappen", team: "Mercedes", races: 22 },
  { year: 2020, champion: "Lewis Hamilton", team: "Mercedes", races: 17 },
];

export function HistorySection() {
  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="animate-fade-in opacity-0 text-3xl font-bold text-slate-900 mb-2">
          Campeones Recientes
        </h2>
        <p className="animate-fade-in opacity-0 text-slate-500 mb-10 delay-200">
          Últimas 5 temporadas
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {HISTORY.map((item, index) => (
            <div
              key={item.year}
              className="animate-fade-in-up opacity-0 group relative rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-lg hover:border-indigo-200 transition-all duration-300"
              style={{ animationDelay: `${0.1 + index * 0.15}s` }}
            >
              <div className="absolute top-4 right-4 flex gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                <div className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              </div>

              <span className="text-5xl font-extrabold text-slate-100 group-hover:text-indigo-100 transition-colors">
                {item.year.toString().slice(2)}
              </span>

              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">👑</span>
                  <div>
                    <span className="block text-sm font-bold text-slate-900">{item.champion}</span>
                    <span className="block text-xs text-slate-400">Campeón</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
                  <span className="text-lg">🏎️</span>
                  <div>
                    <span className="block text-sm text-slate-700">{item.team}</span>
                    <span className="block text-xs text-slate-400">Constructores</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-400">Carreras</span>
                <span className="text-sm font-bold text-indigo-500">{item.races}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
