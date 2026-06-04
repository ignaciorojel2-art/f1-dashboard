import { HISTORICAL_STATS } from "../model";

export function StatsCounter() {
  return (
    <section className="relative -mt-8 pb-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HISTORICAL_STATS.map((stat, index) => (
            <div
              key={stat.label}
              className="animate-fade-in-up opacity-0 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-lg shadow-slate-200/50 backdrop-blur-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              style={{ animationDelay: `${0.2 + index * 0.15}s` }}
            >
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-slate-900 animate-count-up" style={{ animationDelay: `${0.5 + index * 0.1}s` }}>
                  {stat.value}
                </span>
                <span className="text-2xl font-bold text-indigo-500">{stat.suffix}</span>
              </div>
              <h3 className="mt-2 font-semibold text-slate-800">{stat.label}</h3>
              <p className="mt-1 text-sm text-slate-500">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
