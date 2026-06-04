export function AnimatedHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute bottom-10 right-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-2xl animate-pulse" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 pt-28 pb-20 text-center">
        <span className="inline-block animate-fade-in opacity-0 rounded-full border border-indigo-400/30 bg-indigo-400/10 px-4 py-1.5 text-sm font-medium text-indigo-300 delay-200">
          Temporada 2025
        </span>

        <h1 className="mt-6 animate-fade-in-up opacity-0 text-5xl font-extrabold tracking-tight text-white sm:text-7xl delay-300">
          <span className="block">F1</span>
          <span className="mt-1 block bg-gradient-to-r from-indigo-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent animate-gradient">
            Explorer
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl animate-fade-in opacity-0 text-lg text-slate-400 delay-500">
          Una visión inmersiva del campeonato mundial. Animaciones, tarjetas
          interactivas y datos en tiempo real.
        </p>

        <div className="mt-8 flex animate-fade-in-up items-center justify-center gap-3 opacity-0 delay-700">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 text-2xl animate-float">
            🏎️
          </span>
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/20 text-2xl animate-float" style={{ animationDelay: "0.5s" }}>
            🏆
          </span>
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20 text-2xl animate-float" style={{ animationDelay: "1s" }}>
            📊
          </span>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}
