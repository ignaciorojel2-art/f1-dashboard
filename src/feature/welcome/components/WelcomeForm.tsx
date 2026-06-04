import { HeroSection } from "./HeroSection";
import { DriverStandings } from "./DriverStandings";
import { ConstructorStandings } from "./ConstructorStandings";
import { RecentRaces } from "./RecentRaces";
import { HistoricalStats } from "./HistoricalStats";
import { SeasonHistory } from "./SeasonHistory";

export function WelcomeForm() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <DriverStandings />
      <ConstructorStandings />
      <RecentRaces />
      <HistoricalStats />
      <SeasonHistory />

      <footer className="border-t border-f1-border py-8 mt-8">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-f1-muted">
          F1 Dashboard — Datos de la temporada 2025. Powered by Next.js & Tailwind CSS.
        </div>
      </footer>
    </div>
  );
}
