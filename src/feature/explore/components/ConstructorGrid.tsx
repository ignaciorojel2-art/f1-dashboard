import { CONSTRUCTOR_STANDINGS } from "../model";

export function ConstructorGrid() {
  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="animate-fade-in opacity-0 text-3xl font-bold text-slate-900 mb-2">
          Constructores
        </h2>
        <p className="animate-fade-in opacity-0 text-slate-500 mb-10 delay-200">
          Clasificación por equipos
        </p>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {CONSTRUCTOR_STANDINGS.map((constructor, index) => (
            <div
              key={constructor.id}
              className="animate-fade-in-up opacity-0 group relative overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${0.1 + index * 0.12}s` }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{
                  background: `linear-gradient(90deg, ${constructor.color}, ${constructor.color}80)`,
                }}
              />

              <div className="p-6 pt-8">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-2xl font-extrabold text-slate-200">
                    0{index + 1}
                  </span>
                  <div className="h-16 w-16 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden">
                    <div className="shimmer-bg absolute inset-0 opacity-20" />
                    <span className="text-xs font-bold text-slate-400 text-center leading-tight">
                      {constructor.name.split(" ").map(w => w[0]).join("").slice(0, 3)}
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900">{constructor.name}</h3>
                <p className="text-xs text-slate-400 mb-4">{constructor.nationality}</p>

                <div className="flex items-end justify-between">
                  <div>
                    <span className="block text-3xl font-extrabold text-slate-900">
                      {constructor.points}
                    </span>
                    <span className="text-xs text-slate-400">Puntos</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-xl font-bold text-indigo-500">
                      {constructor.wins}
                    </span>
                    <span className="text-xs text-slate-400">Victorias</span>
                  </div>
                </div>

                <div className="mt-4 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 group-hover:opacity-80"
                    style={{
                      width: `${(constructor.points / CONSTRUCTOR_STANDINGS[0].points) * 100}%`,
                      backgroundColor: constructor.color,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
