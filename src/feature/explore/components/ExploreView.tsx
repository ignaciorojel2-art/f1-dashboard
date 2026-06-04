"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { openf1, type Driver, type ChampionshipDriver, type ChampionshipTeam, type SessionResult, type Meeting, type Session } from "@/api/openf1";
import { sortMeetingsAsc } from "@/lib/meetings";
import { formatTime } from "@/lib/time";

const TEAM_COLORS: Record<string, string> = {
  "Red Bull Racing": "#1E41FF", "McLaren": "#FF8000", "Ferrari": "#DC0000",
  "Mercedes": "#00D2BE", "Aston Martin": "#006F62", "Alpine": "#0093CC",
  "Haas F1 Team": "#B6BABD", "RB F1 Team": "#6692FF", "Williams": "#64C4FF",
  "Kick Sauber": "#52E252",
};

const HISTORICAL_STATS = [
  { label: "Grandes Premios", value: 1125, suffix: "+", description: "Carreras disputadas desde 1950" },
  { label: "Campeones", value: 34, suffix: "", description: "Pilotos campeones del mundo" },
  { label: "Escuderías", value: 170, suffix: "+", description: "Equipos en la historia de F1" },
  { label: "Circuitos", value: 77, suffix: "", description: "Trazados distintos en F1" },
];

export function ExploreView() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [champDrivers, setChampDrivers] = useState<ChampionshipDriver[]>([]);
  const [champTeams, setChampTeams] = useState<ChampionshipTeam[]>([]);
  const [raceResults, setRaceResults] = useState<SessionResult[]>([]);
  const [recentRaces, setRecentRaces] = useState<{ meeting: Meeting; sessions: Session[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataYear, setDataYear] = useState(2026);

  useEffect(() => {
    async function load() {
      let year = 2026;
      for (const tryYear of [2026, 2025]) {
        try {
          const [meetings, allSessions] = await Promise.all([
            openf1.meetings({ year: String(tryYear) }),
            openf1.sessions({ year: String(tryYear) }),
          ]);

          const raceSessions = allSessions
            .filter(s => s.session_type === "Race")
            .sort((a, b) => new Date(b.date_start).getTime() - new Date(a.date_start).getTime());

          // Find the most recent race that already happened
          const now = new Date();
          const pastRaces = raceSessions.filter(s => new Date(s.date_end) < now);
          const latestRace = pastRaces[0] ?? raceSessions[0];
          if (!latestRace) throw new Error("no races");
          year = tryYear;

          const sk = String(latestRace.session_key);

          // Fetch championship data sequentially
          const dr = await openf1.drivers({ session_key: sk }).catch(() => [] as Driver[]);
          const cd = await openf1.championshipDrivers({ session_key: sk }).catch(() => [] as ChampionshipDriver[]);
          const ct = await openf1.championshipTeams({ session_key: sk }).catch(() => [] as ChampionshipTeam[]);
          const sr = await openf1.sessionResult({ session_key: sk }).catch(() => [] as SessionResult[]);

          setDrivers(dr);
          setChampDrivers(cd.sort((a, b) => a.position_current - b.position_current).slice(0, 10));
          setChampTeams(ct.sort((a, b) => a.position_current - b.position_current).slice(0, 5));
          setRaceResults(sr.sort((a, b) => a.position - b.position));

          // Group sessions by meeting_key
          const sessionsByMeeting = new Map<number, Session[]>();
          for (const s of allSessions) {
            if (!sessionsByMeeting.has(s.meeting_key)) sessionsByMeeting.set(s.meeting_key, []);
            sessionsByMeeting.get(s.meeting_key)!.push(s);
          }

          // Last 5 past races (deduplicated by meeting, skip cancelled)
          const seenMeetings = new Set<number>();
          const last5Races: typeof pastRaces = [];
          for (const rs of pastRaces) {
            if (seenMeetings.has(rs.meeting_key)) continue;
            const meeting = meetings.find((m) => m.meeting_key === rs.meeting_key);
            if (!meeting || meeting.is_cancelled) continue;
            seenMeetings.add(rs.meeting_key);
            last5Races.push(rs);
            if (last5Races.length === 5) break;
          }
          const recentData = last5Races
            .map((rs) => {
              const meeting = meetings.find((m) => m.meeting_key === rs.meeting_key);
              if (!meeting) return null;
              const sess = sessionsByMeeting.get(rs.meeting_key) ?? [];
              return {
                meeting,
                sessions: sess.sort((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime()),
              };
            })
            .filter(Boolean) as { meeting: Meeting; sessions: Session[] }[];
          setRecentRaces(recentData);
          setDataYear(year);
          break;
        } catch {
          // Try next year
        }
      }
      setLoading(false);
    }
    load();
  }, []);

  const driverMap = new Map(drivers.map((d) => [d.driver_number, d]));

  return (
    <div className="min-h-screen bg-white">
      <NavBar />

      <AnimatedHero year={dataYear} />

      {loading ? (
        <div className="mx-auto max-w-6xl px-6 py-20 space-y-8">
          <SkeletonSection />
          <SkeletonSection />
          <SkeletonSection />
        </div>
      ) : (
        <>
          <StatsCounterSection stats={HISTORICAL_STATS} />
          <DriverCarouselSection champDrivers={champDrivers} driverMap={driverMap} />
          <ConstructorGridSection champTeams={champTeams} />
          <RaceResultsSection results={raceResults} driverMap={driverMap} />
          <RecentRacesSection recentRaces={recentRaces} />
          <HistorySection />
        </>
      )}

      <footer className="border-t border-slate-100 py-8 bg-white">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-slate-400">
          F1 Explorer — Datos en vivo desde OpenF1 API. Powered by Next.js.
        </div>
      </footer>
    </div>
  );
}

function NavBar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between">
        <Link href="/explore" className="text-lg font-extrabold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
          F1 Explorer
        </Link>
        <div className="flex items-center gap-1">
          {[
            { href: "/explore", label: "Explorar" },
            { href: "/dashboard", label: "Calendario" },
            { href: "/race", label: "Carreras" },
            { href: "/telemetry", label: "Telemetría" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

function AnimatedHero({ year }: { year: number }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute bottom-10 right-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-6xl px-6 pt-28 pb-20 text-center">
        <span className="inline-block animate-fade-in opacity-0 rounded-full border border-indigo-400/30 bg-indigo-400/10 px-4 py-1.5 text-sm font-medium text-indigo-300 delay-200">
          Temporada {year}
        </span>
        <h1 className="mt-6 animate-fade-in-up opacity-0 text-5xl font-extrabold tracking-tight text-white sm:text-7xl delay-300">
          <span className="block">F1</span>
          <span className="mt-1 block bg-gradient-to-r from-indigo-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent animate-gradient">
            Explorer
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl animate-fade-in opacity-0 text-lg text-slate-400 delay-500">
          Una visión inmersiva del campeonato mundial. Datos reales desde la OpenF1 API.
        </p>
        <div className="mt-8 flex animate-fade-in-up items-center justify-center gap-3 opacity-0 delay-700">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 text-2xl animate-float">🏎️</span>
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/20 text-2xl animate-float" style={{ animationDelay: "0.5s" }}>🏆</span>
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20 text-2xl animate-float" style={{ animationDelay: "1s" }}>📊</span>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}

function StatsCounterSection({ stats }: { stats: typeof HISTORICAL_STATS }) {
  return (
    <section className="relative -mt-8 pb-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={stat.label} className="animate-fade-in-up opacity-0 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-lg shadow-slate-200/50 backdrop-blur-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300" style={{ animationDelay: `${0.2 + index * 0.15}s` }}>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-slate-900">{stat.value}</span>
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

function DriverCarouselSection({ champDrivers, driverMap }: { champDrivers: ChampionshipDriver[]; driverMap: Map<number, Driver> }) {
  if (!champDrivers.length) return (
    <section className="py-16 bg-gradient-to-b from-white to-slate-50">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Pilotos</h2>
        <p className="text-slate-500">Datos de campeonato no disponibles para esta temporada aún.</p>
      </div>
    </section>
  );
  const maxPoints = champDrivers[0]?.points_current ?? 1;

  return (
    <section className="py-16 bg-gradient-to-b from-white to-slate-50">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="animate-fade-in opacity-0 text-3xl font-bold text-slate-900 mb-2">Pilotos</h2>
        <p className="animate-fade-in opacity-0 text-slate-500 mb-10 delay-200">Top 10 del campeonato — desliza para explorar</p>
        <div className="flex gap-5 overflow-x-auto pb-6 snap-x snap-mandatory">
          {champDrivers.map((cd, index) => {
            const driver = driverMap.get(cd.driver_number);
            const teamColor = driver?.team_colour ? `#${driver.team_colour}` : TEAM_COLORS[driver?.team_name ?? ""] ?? "#94a3b8";

            return (
              <div key={cd.driver_number} className="animate-fade-in-up opacity-0 flex-shrink-0 w-64 snap-start rounded-2xl border border-slate-200 bg-white p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300" style={{ animationDelay: `${0.15 + index * 0.1}s` }}>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-sm font-bold text-slate-400">#{cd.position_current}</span>
                  <div className="h-3 w-3 rounded-full ring-2 ring-indigo-500/20 ring-offset-2 ring-offset-white" style={{ backgroundColor: teamColor }} />
                </div>
                <div className="mb-4 flex justify-center">
                  {driver?.headshot_url ? (
                    <img src={driver.headshot_url} alt={driver.full_name} className="h-24 w-24 rounded-full object-cover bg-slate-100" />
                  ) : (
                    <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                      <span className="text-3xl font-extrabold text-slate-400">{cd.driver_number}</span>
                    </div>
                  )}
                </div>
                <h3 className="text-center text-lg font-bold text-slate-900 truncate">{driver?.full_name ?? `#${cd.driver_number}`}</h3>
                <p className="text-center text-xs text-slate-500 mt-1">{driver?.team_name ?? ""}</p>
                <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                  <div className="text-center"><span className="block text-xl font-bold text-slate-900">{cd.points_current}</span><span className="text-xs text-slate-400">Puntos</span></div>
                  <div className="text-center"><span className="block text-xl font-bold text-indigo-500">{cd.points_current - cd.points_start}</span><span className="text-xs text-slate-400">Ganados</span></div>
                </div>
                <div className="mt-3 w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(cd.points_current / maxPoints) * 100}%`, backgroundColor: teamColor }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ConstructorGridSection({ champTeams }: { champTeams: ChampionshipTeam[] }) {
  if (!champTeams.length) return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Constructores</h2>
        <p className="text-slate-500">Datos de campeonato de constructores no disponibles aún.</p>
      </div>
    </section>
  );
  const maxPoints = champTeams[0]?.points_current ?? 1;

  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="animate-fade-in opacity-0 text-3xl font-bold text-slate-900 mb-2">Constructores</h2>
        <p className="animate-fade-in opacity-0 text-slate-500 mb-10 delay-200">Clasificación por equipos</p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {champTeams.map((ct, index) => {
            const teamColor = TEAM_COLORS[ct.team_name] ?? "#94a3b8";
            return (
              <div key={ct.team_name} className="animate-fade-in-up opacity-0 group relative overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1" style={{ animationDelay: `${0.1 + index * 0.12}s` }}>
                <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: `linear-gradient(90deg, ${teamColor}, ${teamColor}80)` }} />
                <div className="p-6 pt-8">
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-2xl font-extrabold text-slate-200">0{index + 1}</span>
                    <div className="h-16 w-16 rounded-xl bg-slate-100 flex items-center justify-center">
                      <span className="text-xs font-bold text-slate-400 text-center leading-tight">{ct.team_name.split(" ").map(w => w[0]).join("").slice(0, 3)}</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{ct.team_name}</h3>
                  <div className="flex items-end justify-between mt-4">
                    <div><span className="block text-3xl font-extrabold text-slate-900">{ct.points_current}</span><span className="text-xs text-slate-400">Puntos</span></div>
                    <div className="text-right"><span className="block text-xl font-bold text-indigo-500">{ct.points_current - ct.points_start}</span><span className="text-xs text-slate-400">Ganados</span></div>
                  </div>
                  <div className="mt-4 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700 group-hover:opacity-80" style={{ width: `${(ct.points_current / maxPoints) * 100}%`, backgroundColor: teamColor }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function RaceResultsSection({ results, driverMap }: { results: SessionResult[]; driverMap: Map<number, Driver> }) {
  if (!results.length) return (
    <section className="py-16 bg-slate-50">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Última Carrera</h2>
        <p className="text-slate-500">Resultados de carrera no disponibles aún.</p>
      </div>
    </section>
  );
  return (
    <section className="py-16 bg-slate-50">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="animate-fade-in opacity-0 text-3xl font-bold text-slate-900 mb-2">Última Carrera</h2>
        <p className="animate-fade-in opacity-0 text-slate-500 mb-10 delay-200">Top 10 de la carrera más reciente</p>
        <div className="space-y-3">
          {results.slice(0, 10).map((r, i) => {
            const d = driverMap.get(r.driver_number);
            const color = d?.team_colour ? `#${d.team_colour}` : "#94a3b8";
            const duration = Array.isArray(r.duration) ? r.duration[0] : r.duration;
            return (
              <div key={r.driver_number} className="animate-slide-in-left opacity-0 flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300" style={{ animationDelay: `${0.1 + i * 0.08}s` }}>
                <span className="w-8 text-center font-mono text-lg font-bold text-slate-400">{r.position}</span>
                {d?.headshot_url ? (
                  <img src={d.headshot_url} alt={d.full_name} className="h-10 w-10 rounded-full object-cover bg-slate-100 flex-shrink-0" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-slate-500">{r.driver_number}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <span className="block text-sm font-bold text-slate-900 truncate">{d?.full_name ?? `#${r.driver_number}`}</span>
                  <span className="block text-xs text-slate-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: color }} />
                    {d?.team_name ?? ""}
                  </span>
                </div>
                <span className="font-mono text-sm text-slate-600">{duration != null ? formatLapTime(duration) : r.dnf ? "DNF" : "—"}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HistorySection() {
  const seasons = [
    { year: 2024, champion: "Max Verstappen", team: "McLaren", races: 24 },
    { year: 2023, champion: "Max Verstappen", team: "Red Bull Racing", races: 22 },
    { year: 2022, champion: "Max Verstappen", team: "Red Bull Racing", races: 22 },
    { year: 2021, champion: "Max Verstappen", team: "Mercedes", races: 22 },
    { year: 2020, champion: "Lewis Hamilton", team: "Mercedes", races: 17 },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="animate-fade-in opacity-0 text-3xl font-bold text-slate-900 mb-2">Campeones Recientes</h2>
        <p className="animate-fade-in opacity-0 text-slate-500 mb-10 delay-200">Últimas 5 temporadas</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {seasons.map((item, index) => (
            <div key={item.year} className="animate-fade-in-up opacity-0 group relative rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-lg hover:border-indigo-200 transition-all duration-300" style={{ animationDelay: `${0.1 + index * 0.15}s` }}>
              <span className="text-5xl font-extrabold text-slate-100 group-hover:text-indigo-100 transition-colors">{item.year.toString().slice(2)}</span>
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">👑</span>
                  <div><span className="block text-sm font-bold text-slate-900">{item.champion}</span><span className="block text-xs text-slate-400">Campeón</span></div>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
                  <span className="text-lg">🏎️</span>
                  <div><span className="block text-sm text-slate-700">{item.team}</span><span className="block text-xs text-slate-400">Constructores</span></div>
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

function SkeletonSection() {
  return (
    <div className="rounded-2xl border border-slate-200 p-8 animate-pulse">
      <div className="h-7 w-56 rounded bg-slate-200 mb-6" />
      <div className="flex gap-4 overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-shrink-0 w-56 h-72 rounded-xl bg-slate-100" />
        ))}
      </div>
    </div>
  );
}

function RecentRacesSection({ recentRaces }: { recentRaces: { meeting: Meeting; sessions: Session[] }[] }) {
  if (!recentRaces.length) return (
    <section className="py-16 bg-gradient-to-b from-white to-indigo-50/30">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Últimas 5 Carreras</h2>
        <p className="text-slate-500">No hay carreras completadas en esta temporada. Volviendo a 2025.</p>
      </div>
    </section>
  );

  return (
    <section className="py-16 bg-gradient-to-b from-white to-indigo-50/30">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="animate-fade-in opacity-0 text-3xl font-bold text-slate-900 mb-2">Últimas 5 Carreras</h2>
        <p className="animate-fade-in opacity-0 text-slate-500 mb-10 delay-200">Resultados recientes y acceso rápido a análisis</p>

        <div className="flex flex-wrap justify-center gap-6">
          {recentRaces.map(({ meeting, sessions }, raceIdx) => (
            <RaceCard
              key={meeting.meeting_key}
              meeting={meeting}
              sessions={sessions}
              index={raceIdx}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function RaceCard({ meeting, sessions, index }: { meeting: Meeting; sessions: Session[]; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const expandRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<gsap.Context | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  const onEnter = useCallback(() => {
    if (!titleRef.current || !expandRef.current) return;
    gsap.killTweensOf([titleRef.current, expandRef.current]);
    gsap.to(titleRef.current, { y: -8, duration: 0.35, ease: "power2.out", overwrite: true });
    gsap.to(expandRef.current, { height: "auto", duration: 0.4, ease: "power2.out", overwrite: true });
  }, []);

  const onLeave = useCallback(() => {
    if (!titleRef.current || !expandRef.current) return;
    gsap.killTweensOf([titleRef.current, expandRef.current]);
    gsap.to(titleRef.current, { y: 0, duration: 0.3, ease: "power2.in", overwrite: true });
    gsap.to(expandRef.current, { height: 0, duration: 0.3, ease: "power2.in", overwrite: true });
  }, []);

  const onToggle = useCallback(() => {
    const expand = expandRef.current;
    if (!expand) return;
    const isOpen = expand.style.height !== "0px" && expand.style.height !== "";
    if (isOpen) {
      onLeave();
    } else {
      onEnter();
    }
  }, [onEnter, onLeave]);

  useEffect(() => {
    ctxRef.current = gsap.context(() => {});
    return () => ctxRef.current?.revert();
  }, []);

  const raceSession = sessions.find((s) => s.session_type === "Race");

  const SESSION_TYPES: Record<string, string> = {
    "Race": "Carrera", "Qualifying": "Clasificación", "Sprint": "Sprint",
    "Sprint Qualifying": "Clas. Sprint", "Practice 1": "P1",
    "Practice 2": "P2", "Practice 3": "P3",
  };

  return (
    <div
      ref={cardRef}
      className="relative rounded-2xl border border-slate-200 bg-white shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden w-[calc(50%-0.75rem)] xl:w-[calc(33.333%-1rem)]"
      onMouseEnter={!isMobile ? onEnter : undefined}
      onMouseLeave={!isMobile ? onLeave : undefined}
      onClick={isMobile ? onToggle : undefined}
      role="button"
      tabIndex={0}
    >
      <div className="h-44 bg-white p-3 flex items-center justify-center">
        {meeting.circuit_image ? (
          <img
            src={meeting.circuit_image}
            alt={meeting.circuit_short_name}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-slate-100 rounded-lg" />
        )}
      </div>

      <div
        ref={titleRef}
        className="relative z-10 bg-white border-t border-slate-100 px-4 py-2.5 flex items-center gap-2.5"
      >
        {meeting.country_flag && (
          <img src={meeting.country_flag} alt="" className="h-5 rounded shadow-sm flex-shrink-0" />
        )}
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-slate-800 truncate">{meeting.country_name}</h3>
          <span className="text-[11px] text-slate-500 truncate block">
            {meeting.meeting_name.replace(" Grand Prix", " GP")}
          </span>
        </div>
        <span className="text-[10px] text-slate-400 flex-shrink-0">
          {new Date(meeting.date_start).toLocaleDateString("es-CL", { day: "numeric", month: "short" })}
        </span>
      </div>

      <div
        ref={expandRef}
        className="overflow-hidden"
        style={{ height: isMobile ? "auto" : 0 }}
      >
        <div className="px-4 pt-3 pb-4 space-y-3 border-t border-slate-50">
          <div className="flex flex-wrap gap-1.5">
            {sessions.map((s) => (
              <Link
                key={s.session_key}
                href={`/race?meeting=${meeting.meeting_key}&session=${s.session_key}&year=${meeting.year}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
              >
                {SESSION_TYPES[s.session_type] ?? s.session_name}
              </Link>
            ))}
          </div>
          {raceSession && (
            <Link
              href={`/race?meeting=${meeting.meeting_key}&session=${raceSession.session_key}&year=${meeting.year}`}
              onClick={(e) => e.stopPropagation()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:from-indigo-700 hover:to-cyan-700 transition-all"
            >
              Ver detalles completos →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function formatLapTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = (seconds % 60).toFixed(3);
  return `${m}:${String(s).padStart(6, "0")}`;
}
