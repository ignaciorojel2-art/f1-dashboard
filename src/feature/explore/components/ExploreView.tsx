import { AnimatedHero } from "./AnimatedHero";
import { StatsCounter } from "./StatsCounter";
import { DriverCarousel } from "./DriverCarousel";
import { ConstructorGrid } from "./ConstructorGrid";
import { RaceTimeline } from "./RaceTimeline";
import { HistorySection } from "./HistorySection";

export function ExploreView() {
  return (
    <div className="min-h-screen bg-white">
      <AnimatedHero />
      <StatsCounter />
      <DriverCarousel />
      <ConstructorGrid />
      <RaceTimeline />
      <HistorySection />

      <footer className="border-t border-slate-100 py-8 bg-white">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-slate-400">
          F1 Explorer — Vista inmersiva del campeonato. Powered by Next.js.
        </div>
      </footer>
    </div>
  );
}
