export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-f1-red/20 via-f1-dark to-background pt-24 pb-16">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-f1-red/10 via-transparent to-transparent" />
      <div className="relative mx-auto max-w-6xl px-6 text-center">
        <span className="inline-block rounded-full border border-f1-red/30 bg-f1-red/10 px-4 py-1.5 text-sm font-medium text-f1-red mb-6">
          Fórmula 1 Dashboard
        </span>
        <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
          Vive la velocidad
          <span className="mt-2 block bg-gradient-to-r from-f1-red to-red-400 bg-clip-text text-transparent">
            de la Fórmula 1
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-f1-muted">
          Explora estadísticas en tiempo real, clasificaciones de pilotos y constructores,
          resultados históricos y datos carrera por carrera del campeonato mundial.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <a
            href="#standings"
            className="rounded-lg bg-f1-red px-6 py-3 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
          >
            Ver clasificaciones
          </a>
          <a
            href="#history"
            className="rounded-lg border border-f1-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-f1-card transition-colors"
          >
            Historial
          </a>
        </div>
      </div>
    </section>
  );
}
