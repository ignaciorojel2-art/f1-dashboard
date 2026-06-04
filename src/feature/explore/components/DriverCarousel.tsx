import { DRIVER_STANDINGS, TEAM_COLORS } from "../model";

export function DriverCarousel() {
  return (
    <section className="py-16 bg-gradient-to-b from-white to-slate-50">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="animate-fade-in opacity-0 text-3xl font-bold text-slate-900 mb-2">
          Pilotos
        </h2>
        <p className="animate-fade-in opacity-0 text-slate-500 mb-10 delay-200">
          Top 10 del campeonato — desliza para explorar
        </p>

        <div className="flex gap-5 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide">
          {DRIVER_STANDINGS.map((driver, index) => {
            const teamColor = TEAM_COLORS[driver.team] ?? "#94a3b8";

            return (
              <div
                key={driver.id}
                className="animate-fade-in-up opacity-0 flex-shrink-0 w-64 snap-start rounded-2xl border border-slate-200 bg-white p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                style={{ animationDelay: `${0.15 + index * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-5">
                  <span className="text-sm font-bold text-slate-400">
                    #{index + 1}
                  </span>
                  <div
                    className="h-3 w-3 rounded-full ring-2 ring-indigo-500/20 ring-offset-2 ring-offset-white"
                    style={{ backgroundColor: teamColor }}
                  />
                </div>

                <div className="mb-4 flex justify-center">
                  <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 shimmer-bg opacity-30" />
                    <span className="relative text-3xl font-extrabold text-slate-400">
                      {driver.number}
                    </span>
                  </div>
                </div>

                <h3 className="text-center text-lg font-bold text-slate-900 truncate">
                  {driver.name}
                </h3>
                <p className="text-center text-xs text-slate-500 mt-1">
                  {driver.team}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                  <div className="text-center">
                    <span className="block text-xl font-bold text-slate-900">{driver.points}</span>
                    <span className="text-xs text-slate-400">Puntos</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-xl font-bold text-indigo-500">{driver.wins}</span>
                    <span className="text-xs text-slate-400">Victorias</span>
                  </div>
                </div>

                <div className="mt-3 w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${(driver.points / DRIVER_STANDINGS[0].points) * 100}%`,
                      backgroundColor: teamColor,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
