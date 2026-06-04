"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  openf1,
  type Meeting,
  type Session,
  type SessionResult,
  type StartingGrid,
  type Position,
  type Interval,
  type Overtake,
  type Pit,
  type Stint,
  type RaceControl,
  type Driver as DriverInfo,
  type Lap,
} from "@/api/openf1";

const YEARS = [2026, 2025, 2024, 2023];

const SESSION_TYPES: Record<string, string> = {
  "Race": "Carrera", "Qualifying": "Clasificación", "Sprint": "Sprint",
  "Sprint Qualifying": "Clasificación Sprint", "Practice 1": "Práctica 1",
  "Practice 2": "Práctica 2", "Practice 3": "Práctica 3",
};

const TYRE_COLORS: Record<string, string> = {
  "SOFT": "#e10600", "MEDIUM": "#fcd700", "HARD": "#ffffff",
  "INTERMEDIATE": "#00a650", "WET": "#0077ff",
};

const FLAG_COLORS: Record<string, string> = {
  "GREEN": "bg-green-500", "YELLOW": "bg-yellow-500", "DOUBLE YELLOW": "bg-yellow-500",
  "BLUE": "bg-blue-500", "RED": "bg-red-500", "CHEQUERED": "bg-zinc-300",
  "BLACK AND WHITE": "bg-zinc-500",
};

const TABS = [
  { key: "results", label: "Resultados" },
  { key: "grid", label: "Parrilla" },
  { key: "positions-chart", label: "Posiciones" },
  { key: "intervals", label: "Gaps" },
  { key: "pits", label: "Pits" },
  { key: "stints", label: "Stints" },
  { key: "overtakes", label: "Adelantamientos" },
  { key: "race-control", label: "Race Control" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function useLoadedTabs() {
  const ref = useRef(new Set<TabKey>());

  function has(tab: TabKey) { return ref.current.has(tab); }
  function add(tab: TabKey) { ref.current.add(tab); return ref.current; }
  function reset(tab: TabKey = "results") {
    ref.current = new Set([tab]);
  }

  return { has, add, reset };
}

export function RaceView() {
  const [year, setYear] = useState(2025);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<string>("");
  const [selectedSession, setSelectedSession] = useState<string>("");
  const [drivers, setDrivers] = useState<Map<number, DriverInfo>>(new Map());
  const [activeTab, setActiveTab] = useState<TabKey>("results");

  const [results, setResults] = useState<SessionResult[]>([]);
  const [grid, setGrid] = useState<StartingGrid[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [intervals, setIntervals] = useState<Interval[]>([]);
  const [overtakes, setOvertakes] = useState<Overtake[]>([]);
  const [pits, setPits] = useState<Pit[]>([]);
  const [stints, setStints] = useState<Stint[]>([]);
  const [raceControl, setRaceControl] = useState<RaceControl[]>([]);
  const [laps, setLaps] = useState<Lap[]>([]);
  const [sessionType, setSessionType] = useState("");

  const loadedTabs = useLoadedTabs();
  const [loadingTab, setLoadingTab] = useState<TabKey | null>(null);
  const [initialLoading, setInitialLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const preloadedRef = useRef(false);

  useEffect(() => {
    setMeetings([]);
    setSelectedMeeting("");
    setSelectedSession("");
    openf1.meetings({ year: String(year) }).then((d) =>
      setMeetings(d.filter((m) => !m.is_cancelled).sort((a, b) => new Date(b.date_start).getTime() - new Date(a.date_start).getTime()))
    );
  }, [year]);

  useEffect(() => {
    if (!selectedMeeting) return;
    openf1.sessions({ meeting_key: selectedMeeting }).then((d) =>
      setSessions(d.sort((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime()))
    );
    setSelectedSession("");
    clearAllData();
  }, [selectedMeeting]);

  function clearAllData() {
    loadedTabs.reset();
    setDrivers(new Map());
    setResults([]); setGrid([]); setPositions([]); setIntervals([]);
    setOvertakes([]); setPits([]); setStints([]); setRaceControl([]);
    setLaps([]); setSessionType("");
    setError(null);
    preloadedRef.current = false;
  }

  const loadCoreData = useCallback(async () => {
    if (!selectedSession) return;
    setInitialLoading(true);
    setError(null);
    clearAllData();
    loadedTabs.reset("results");

    const sk = selectedSession;
    try {
      const [dr, res] = await Promise.all([
        openf1.drivers({ session_key: sk }),
        openf1.sessionResult({ session_key: sk }),
      ]);
      setDrivers(new Map(dr.map((d) => [d.driver_number, d])));
      setResults(res.sort((a, b) => a.position - b.position));

      const sess = sessions.find((s) => String(s.session_key) === sk);
      setSessionType(sess?.session_type ?? "");
    } catch (e) {
      setError("Error al cargar datos. Reintentando...");
    }
    setInitialLoading(false);
  }, [selectedSession]);

  useEffect(() => { loadCoreData(); }, [loadCoreData]);

  const loadGrid = useCallback(async () => {
    if (!selectedSession || loadedTabs.has("grid")) return;
    setLoadingTab("grid");
    try {
      const data = await openf1.startingGrid({ session_key: selectedSession });
      setGrid(data.sort((a, b) => a.position - b.position));
      loadedTabs.add("grid");
    } catch {}
    setLoadingTab(null);
  }, [selectedSession]);

  const loadPositions = useCallback(async () => {
    if (!selectedSession || loadedTabs.has("positions-chart")) return;
    setLoadingTab("positions-chart");
    try {
      const [pos, lp] = await Promise.all([
        openf1.position({ session_key: selectedSession }),
        sessionType === "Race" ? openf1.laps({ session_key: selectedSession }) : Promise.resolve([]),
      ]);
      setPositions(pos);
      if (lp.length) setLaps(lp);
      loadedTabs.add("positions-chart");
    } catch {}
    setLoadingTab(null);
  }, [selectedSession, sessionType]);

  const loadIntervals = useCallback(async () => {
    if (!selectedSession || loadedTabs.has("intervals")) return;
    setLoadingTab("intervals");
    try {
      const data = await openf1.intervals({ session_key: selectedSession });
      setIntervals(data);
      loadedTabs.add("intervals");
    } catch {}
    setLoadingTab(null);
  }, [selectedSession]);

  const loadPits = useCallback(async () => {
    if (!selectedSession || loadedTabs.has("pits")) return;
    setLoadingTab("pits");
    try {
      const data = await openf1.pit({ session_key: selectedSession });
      setPits(data);
      loadedTabs.add("pits");
    } catch {}
    setLoadingTab(null);
  }, [selectedSession]);

  const loadStints = useCallback(async () => {
    if (!selectedSession || loadedTabs.has("stints")) return;
    setLoadingTab("stints");
    try {
      const data = await openf1.stints({ session_key: selectedSession });
      setStints(data.filter((s) => s.compound));
      loadedTabs.add("stints");
    } catch {}
    setLoadingTab(null);
  }, [selectedSession]);

  const loadOvertakes = useCallback(async () => {
    if (!selectedSession || loadedTabs.has("overtakes")) return;
    setLoadingTab("overtakes");
    try {
      const data = await openf1.overtakes({ session_key: selectedSession });
      setOvertakes(data);
      loadedTabs.add("overtakes");
    } catch {}
    setLoadingTab(null);
  }, [selectedSession]);

  const loadRaceControl = useCallback(async () => {
    if (!selectedSession || loadedTabs.has("race-control")) return;
    setLoadingTab("race-control");
    try {
      const data = await openf1.raceControl({ session_key: selectedSession });
      setRaceControl(data);
      loadedTabs.add("race-control");
    } catch {}
    setLoadingTab(null);
  }, [selectedSession]);

  function onTabClick(tab: TabKey) {
    setActiveTab(tab);
    switch (tab) {
      case "grid": loadGrid(); break;
      case "positions-chart": loadPositions(); break;
      case "intervals": loadIntervals(); break;
      case "pits": loadPits(); break;
      case "stints": loadStints(); break;
      case "overtakes": loadOvertakes(); break;
      case "race-control": loadRaceControl(); break;
    }
  }

  useEffect(() => {
    if (!selectedSession || preloadedRef.current) return;
    if (!loadedTabs.has("results")) return;
    preloadedRef.current = true;
  }, [selectedSession]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center gap-4 flex-wrap">
          <h1 className="text-lg font-bold text-f1-red">Análisis de Carrera</h1>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm"
          >
            {YEARS.map((y) => (<option key={y} value={y}>{y}</option>))}
          </select>
          <select
            value={selectedMeeting}
            onChange={(e) => setSelectedMeeting(e.target.value)}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm min-w-[240px]"
          >
            <option value="">Selecciona un GP...</option>
            {meetings.map((m) => (
              <option key={m.meeting_key} value={m.meeting_key}>{m.country_name} — {m.meeting_name}</option>
            ))}
          </select>
          <select
            value={selectedSession}
            onChange={(e) => { setSelectedSession(e.target.value); preloadedRef.current = false; }}
            disabled={!selectedMeeting}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm min-w-[200px] disabled:opacity-40"
          >
            <option value="">Selecciona sesión...</option>
            {sessions.map((s) => (
              <option key={s.session_key} value={s.session_key}>
                {SESSION_TYPES[s.session_type] ?? s.session_name} — {new Date(s.date_start).toLocaleDateString("es-CL", { day: "numeric", month: "short" })}
              </option>
            ))}
          </select>
          {initialLoading && <span className="text-sm text-zinc-500 animate-pulse">Cargando...</span>}
          {error && <span className="text-sm text-amber-500">{error}</span>}
        </div>
        {selectedSession && (
          <nav className="mx-auto max-w-7xl px-6 pb-2 flex gap-1 overflow-x-auto">
            {TABS.map((t) => {
              const isLoading = loadingTab === t.key;
              const isLoaded = loadedTabs.has(t.key);
              return (
                <button
                  key={t.key}
                  onClick={() => onTabClick(t.key)}
                  className={`relative px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    activeTab === t.key ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {t.label}
                  {!isLoaded && !isLoading && activeTab !== t.key && (
                    <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-zinc-600" />
                  )}
                  {isLoading && (
                    <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  )}
                </button>
              );
            })}
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {!selectedSession && <p className="text-zinc-500 text-center mt-20">Selecciona año, GP y sesión para ver los datos.</p>}

        {selectedSession && activeTab === "results" && (
          initialLoading ? <Skeleton rows={10} cols={5} /> :
          <ResultsTable results={results} grid={grid} drivers={drivers} />
        )}
        {selectedSession && activeTab === "grid" && (
          loadingTab === "grid" ? <Skeleton rows={10} cols={3} /> :
          <GridTable grid={grid} drivers={drivers} />
        )}
        {selectedSession && activeTab === "positions-chart" && (
          loadingTab === "positions-chart" ? <Skeleton rows={8} /> :
          <PositionsChart positions={positions} drivers={drivers} laps={laps} sessionType={sessionType} />
        )}
        {selectedSession && activeTab === "intervals" && (
          loadingTab === "intervals" ? <Skeleton rows={8} /> :
          <IntervalsChart intervals={intervals} drivers={drivers} />
        )}
        {selectedSession && activeTab === "pits" && (
          loadingTab === "pits" ? <Skeleton rows={6} /> :
          <PitsSection pits={pits} drivers={drivers} />
        )}
        {selectedSession && activeTab === "stints" && (
          loadingTab === "stints" ? <Skeleton rows={8} /> :
          <StintsSection stints={stints} drivers={drivers} />
        )}
        {selectedSession && activeTab === "overtakes" && (
          loadingTab === "overtakes" ? <Skeleton rows={6} /> :
          <OvertakesSection overtakes={overtakes} drivers={drivers} />
        )}
        {selectedSession && activeTab === "race-control" && (
          loadingTab === "race-control" ? <Skeleton rows={8} /> :
          <RaceControlSection events={raceControl} />
        )}
      </main>
    </div>
  );
}

function Skeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-xl border border-zinc-800 p-6 animate-pulse">
      <div className="h-6 w-48 rounded bg-zinc-800 mb-6" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-4">
            {Array.from({ length: cols }).map((_, c) => (
              <div key={c} className="h-4 rounded bg-zinc-800" style={{ flex: c === 0 ? 1 : c === 1 ? 3 : 2 }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function ResultsTable({ results, grid, drivers }: { results: SessionResult[]; grid: StartingGrid[]; drivers: Map<number, DriverInfo> }) {
  if (!results.length) return <p className="text-zinc-500">No hay resultados disponibles.</p>;
  const gridMap = new Map(grid.map((g) => [g.driver_number, g.position]));

  return (
    <div className="rounded-xl border border-zinc-800 overflow-hidden">
      <div className="grid grid-cols-12 gap-3 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-800 bg-zinc-900">
        <span className="col-span-1">Pos</span><span className="col-span-4">Piloto</span><span className="col-span-3 text-right">Tiempo</span><span className="col-span-2 text-right">Parrilla</span><span className="col-span-2 text-right">Status</span>
      </div>
      {results.map((r) => {
        const d = drivers.get(r.driver_number);
        const gridPos = gridMap.get(r.driver_number);
        const gained = gridPos ? gridPos - r.position : 0;
        const duration = Array.isArray(r.duration) ? r.duration[0] : r.duration;
        return (
          <div key={r.driver_number} className="grid grid-cols-12 gap-3 px-6 py-3 items-center border-b border-zinc-800/50 last:border-0 hover:bg-zinc-900/50">
            <span className="col-span-1 font-mono font-bold">{r.position}</span>
            <span className="col-span-4">
              <span className="font-semibold">{d?.full_name ?? `#${r.driver_number}`}</span>
              <span className="block text-xs text-zinc-500">{d?.team_name}</span>
            </span>
            <span className="col-span-3 text-right font-mono text-sm">{duration != null ? formatTime(duration) : "—"}</span>
            <span className="col-span-2 text-right font-mono text-sm">
              {gridPos ?? "—"}{" "}
              {gained > 0 ? <span className="text-green-400">+{gained}</span> : gained < 0 ? <span className="text-red-400">{gained}</span> : ""}
            </span>
            <span className="col-span-2 text-right text-xs">
              {r.dsq ? <span className="text-red-400">DSQ</span> : r.dnf ? <span className="text-red-400">DNF</span> : r.dns ? <span className="text-yellow-400">DNS</span> : "FINALIZADO"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function GridTable({ grid, drivers }: { grid: StartingGrid[]; drivers: Map<number, DriverInfo> }) {
  if (!grid.length) return (
    <div className="rounded-xl border border-zinc-800 p-8 text-center">
      <p className="text-zinc-500">No hay datos de parrilla de salida para esta sesión.</p>
      <p className="text-zinc-600 text-sm mt-2">La parrilla solo está disponible en sesiones de clasificación (Qualifying).</p>
    </div>
  );
  return (
    <div className="rounded-xl border border-zinc-800 overflow-hidden">
      <div className="grid grid-cols-5 gap-4 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-800 bg-zinc-900">
        <span className="col-span-1">Pos</span><span className="col-span-2">Piloto</span><span className="col-span-1 text-right">Tiempo Q</span><span className="col-span-1 text-right">Dif. Pole</span>
      </div>
      {grid.map((g) => {
        const d = drivers.get(g.driver_number);
        const pole = grid[0]?.lap_duration ?? 0;
        const diff = pole ? g.lap_duration - pole : 0;
        return (
          <div key={g.driver_number} className="grid grid-cols-5 gap-4 px-6 py-3 items-center border-b border-zinc-800/50 last:border-0 hover:bg-zinc-900/50">
            <span className="col-span-1 font-mono font-bold">{g.position}</span>
            <span className="col-span-2">
              <span className="font-semibold">{d?.full_name ?? `#${g.driver_number}`}</span>
              {d?.team_name && <span className="block text-xs text-zinc-500">{d.team_name}</span>}
            </span>
            <span className="col-span-1 text-right font-mono text-sm">{formatTime(g.lap_duration)}</span>
            <span className="col-span-1 text-right font-mono text-sm">
              {g.position === 1 ? <span className="text-purple-400">Pole</span> : diff > 0 ? `+${diff.toFixed(3)}` : "—"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function PositionsChart({ positions, drivers, laps, sessionType }: {
  positions: Position[]; drivers: Map<number, DriverInfo>; laps: Lap[]; sessionType: string;
}) {
  if (!positions.length) return <p className="text-zinc-500">No hay datos de posiciones.</p>;

  const driverNumbers = [...new Set(positions.map((p) => p.driver_number))].slice(0, 20);
  const allDates = [...new Set(positions.map((p) => p.date))].sort();

  const step = Math.max(1, Math.floor(allDates.length / 80));
  const times = allDates.filter((_, i) => i % step === 0);

  const colors = driverNumbers.map((n) => {
    const d = drivers.get(n);
    return d?.team_colour ? `#${d.team_colour}` : "#666";
  });

  const posMap = new Map<string, Map<number, number>>();
  for (const p of positions) {
    if (!posMap.has(p.date)) posMap.set(p.date, new Map());
    posMap.get(p.date)!.set(p.driver_number, p.position);
  }

  const maxPos = Math.max(...positions.map((d) => d.position), 1);

  const lapMap = new Map<string, number>();
  if (laps.length) {
    const lapTimes = new Map<number, string>();
    for (const l of laps) {
      if (!lapTimes.has(l.lap_number) || l.date_start < lapTimes.get(l.lap_number)!) {
        lapTimes.set(l.lap_number, l.date_start);
      }
    }
    for (const [lap, t] of lapTimes) lapMap.set(t, lap);
  }

  const firstDate = new Date(times[0]);
  const lastDate = new Date(times[times.length - 1]);

  const gains = new Map<number, { start: number; end: number }>();
  for (const dn of driverNumbers) {
    const first = positions.filter((p) => p.driver_number === dn).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    if (first.length) gains.set(dn, { start: first[0].position, end: first[first.length - 1].position });
  }

  return (
    <div className="rounded-xl border border-zinc-800 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold">Evolución de Posiciones</h3>
          <p className="text-xs text-zinc-500 mt-1">
            {sessionType === "Race" ? "Posición de cada piloto a lo largo de la carrera" : "Posición de cada piloto durante la sesión"}
            {" — "}{allDates.length} registros de {driverNumbers.length} pilotos
          </p>
        </div>
        <div className="flex flex-wrap gap-3 max-w-md justify-end">
          {driverNumbers.slice(0, 8).map((dn, i) => {
            const g = gains.get(dn);
            const diff = g ? g.start - g.end : 0;
            return (
              <div key={dn} className="flex items-center gap-1.5 text-xs">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: colors[i] }} />
                <span className="text-zinc-300">{drivers.get(dn)?.name_acronym ?? `#${dn}`}</span>
                {g && diff !== 0 && (
                  <span className={diff > 0 ? "text-green-400" : "text-red-400"}>
                    {diff > 0 ? `↑${diff}` : `↓${Math.abs(diff)}`}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <EnhancedSVGChart
        driverNumbers={driverNumbers}
        times={times}
        posMap={posMap}
        maxPos={maxPos}
        colors={colors}
        drivers={drivers}
        lapMap={lapMap}
        firstDate={firstDate}
        lastDate={lastDate}
      />
    </div>
  );
}

function EnhancedSVGChart({
  driverNumbers, times, posMap, maxPos, colors, drivers, lapMap, firstDate, lastDate,
}: {
  driverNumbers: number[];
  times: string[];
  posMap: Map<string, Map<number, number>>;
  maxPos: number;
  colors: string[];
  drivers: Map<number, DriverInfo>;
  lapMap: Map<string, number>;
  firstDate: Date;
  lastDate: Date;
}) {
  const W = 960, H = 520;
  const pad = { t: 20, r: 30, b: 55, l: 55 };
  const cw = W - pad.l - pad.r;
  const ch = H - pad.t - pad.b;

  const totalSec = (lastDate.getTime() - firstDate.getTime()) / 1000;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: "monospace" }}>
      {Array.from({ length: maxPos }, (_, i) => {
        const y = pad.t + (i / maxPos) * ch;
        return (
          <g key={i}>
            <line x1={pad.l} x2={W - pad.r} y1={y} y2={y} stroke="#1f1f26" strokeDasharray="3 6" />
            <text x={pad.l - 8} y={y + 4} textAnchor="end" fontSize={11} fill="#52525b">P{i + 1}</text>
          </g>
        );
      })}

      {times.map((t, ti) => {
        const x = pad.l + (ti / (times.length - 1 || 1)) * cw;
        const lap = lapMap.get(t);
        const isLabel = lap && lap % 5 === 0;
        return (
          <g key={ti}>
            {isLabel && (
              <>
                <line x1={x} x2={x} y1={pad.t} y2={pad.t + ch} stroke="#1f1f26" strokeDasharray="2 8" />
                <text x={x} y={pad.t + ch + 16} textAnchor="middle" fontSize={10} fill="#52525b">V{lap}</text>
              </>
            )}
            {driverNumbers.map((dn, di) => {
              const mp = posMap.get(t);
              if (!mp?.has(dn)) return null;
              const y = pad.t + ((mp.get(dn)! - 1) / (maxPos - 1 || 1)) * ch;
              return <circle key={`${ti}-${di}`} cx={x} cy={y} r={2.8} fill={colors[di]} opacity={0.75} />;
            })}
          </g>
        );
      })}

      {driverNumbers.map((dn, di) => {
        const points = times
          .map((t) => {
            const mp = posMap.get(t);
            if (!mp?.has(dn)) return null;
            const x = pad.l + (times.indexOf(t) / (times.length - 1 || 1)) * cw;
            const y = pad.t + ((mp.get(dn)! - 1) / (maxPos - 1 || 1)) * ch;
            return `${x},${y}`;
          })
          .filter(Boolean)
          .join(" ");
        return points ? (
          <polyline key={`line-${di}`} points={points} fill="none" stroke={colors[di]} strokeWidth={1.5} opacity={0.5} strokeLinejoin="round" />
        ) : null;
      })}

      <text x={pad.l + cw / 2} y={H - 5} textAnchor="middle" fontSize={10} fill="#52525b">
        {lapMap.size > 0 ? "Progresión por vuelta" : `Tiempo: ${firstDate.toLocaleTimeString()} → ${lastDate.toLocaleTimeString()} (${Math.round(totalSec)}s)`}
      </text>
    </svg>
  );
}

function IntervalsChart({ intervals, drivers }: { intervals: Interval[]; drivers: Map<number, DriverInfo> }) {
  if (!intervals.length) return <p className="text-zinc-500">No hay datos de intervalos.</p>;
  const latest = new Map<number, Interval>();
  for (const i of intervals) {
    const existing = latest.get(i.driver_number);
    if (!existing || new Date(i.date) > new Date(existing.date)) latest.set(i.driver_number, i);
  }
  const sorted = [...latest.values()].filter((i) => i.gap_to_leader != null).sort((a, b) => (a.gap_to_leader ?? Infinity) - (b.gap_to_leader ?? Infinity));
  const maxGap = Math.max(...sorted.map((i) => typeof i.gap_to_leader === "number" ? i.gap_to_leader : 0), 1);
  return (
    <div className="rounded-xl border border-zinc-800 p-6">
      <h3 className="text-lg font-bold mb-4">Gap al Líder (último registro)</h3>
      <div className="space-y-2">
        {sorted.map((i) => {
          const d = drivers.get(i.driver_number);
          const color = d?.team_colour ? `#${d.team_colour}` : "#666";
          const gap = typeof i.gap_to_leader === "number" ? i.gap_to_leader : null;
          return (
            <div key={i.driver_number} className="flex items-center gap-3">
              <span className="w-24 text-sm font-semibold truncate">{d?.name_acronym ?? `#${i.driver_number}`}</span>
              <div className="flex-1 h-6 bg-zinc-800 rounded relative overflow-hidden">
                <div className="absolute inset-y-0 left-0 rounded" style={{ width: `${((gap ?? 0) / maxGap) * 100}%`, backgroundColor: color, opacity: 0.5 }} />
              </div>
              <span className="w-20 text-right font-mono text-sm">{gap != null ? `${gap.toFixed(3)}s` : "—"}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PitsSection({ pits, drivers }: { pits: Pit[]; drivers: Map<number, DriverInfo> }) {
  if (!pits.length) return <p className="text-zinc-500">No hay datos de pits.</p>;
  return (
    <div>
      <h3 className="text-lg font-bold mb-4">Paradas en Box ({pits.length})</h3>
      <div className="rounded-xl border border-zinc-800 overflow-hidden">
        <div className="grid grid-cols-4 gap-4 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-800 bg-zinc-900">
          <span>Piloto</span><span>Vuelta</span><span className="text-right">Stop</span><span className="text-right">Carril</span>
        </div>
        {pits.sort((a, b) => a.lap_number - b.lap_number).map((p, i) => {
          const d = drivers.get(p.driver_number);
          return (
            <div key={i} className="grid grid-cols-4 gap-4 px-6 py-2.5 items-center border-b border-zinc-800/50 last:border-0 text-sm">
              <span className="font-semibold">{d?.name_acronym ?? `#${p.driver_number}`}</span>
              <span className="font-mono">{p.lap_number}</span>
              <span className="text-right font-mono">{p.stop_duration ? `${p.stop_duration.toFixed(1)}s` : "—"}</span>
              <span className="text-right font-mono">{p.lane_duration ? `${p.lane_duration.toFixed(1)}s` : "—"}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StintsSection({ stints, drivers }: { stints: Stint[]; drivers: Map<number, DriverInfo> }) {
  if (!stints.length) return <p className="text-zinc-500">No hay datos de stints.</p>;
  const driverNumbers = [...new Set(stints.map((s) => s.driver_number))];
  const maxLap = Math.max(...stints.map((s) => s.lap_end), 1);
  return (
    <div>
      <h3 className="text-lg font-bold mb-4">Estrategia de Neumáticos</h3>
      <div className="space-y-3">
        {driverNumbers.map((dn) => {
          const d = drivers.get(dn);
          const driverStints = stints.filter((s) => s.driver_number === dn);
          return (
            <div key={dn} className="flex items-center gap-3">
              <span className="w-28 text-sm font-semibold truncate">{d?.name_acronym ?? `#${dn}`}</span>
              <div className="flex-1 h-8 bg-zinc-800 rounded relative overflow-hidden flex">
                {driverStints.map((s, i) => {
                  const left = ((s.lap_start - 1) / maxLap) * 100;
                  const width = ((s.lap_end - s.lap_start + 1) / maxLap) * 100;
                  return (
                    <div key={i} className="h-full text-[10px] flex items-center justify-center font-bold text-zinc-900"
                      style={{ marginLeft: i === 0 ? `${left}%` : "0", width: `${width}%`, backgroundColor: TYRE_COLORS[s.compound] ?? "#666" }}>
                      {s.compound.slice(0, 1)}
                    </div>
                  );
                })}
              </div>
              <span className="w-10 text-right font-mono text-xs text-zinc-500">{driverStints.length}</span>
            </div>
          );
        })}
        <div className="flex gap-4 mt-4">
          {Object.entries(TYRE_COLORS).map(([name, color]) => (
            <div key={name} className="flex items-center gap-1.5 text-xs text-zinc-400">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} /> {name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function OvertakesSection({ overtakes, drivers }: { overtakes: Overtake[]; drivers: Map<number, DriverInfo> }) {
  if (!overtakes.length) return <p className="text-zinc-500">No hay datos de adelantamientos.</p>;
  const counter = new Map<number, number>();
  for (const o of overtakes) counter.set(o.overtaking_driver_number, (counter.get(o.overtaking_driver_number) ?? 0) + 1);
  const sorted = [...counter.entries()].sort((a, b) => b[1] - a[1]);
  const maxCount = sorted[0]?.[1] ?? 1;
  return (
    <div>
      <h3 className="text-lg font-bold mb-2">Adelantamientos — Total: {overtakes.length}</h3>
      <div className="space-y-2 mb-6">
        {sorted.slice(0, 10).map(([dn, count]) => {
          const d = drivers.get(dn);
          const color = d?.team_colour ? `#${d.team_colour}` : "#666";
          return (
            <div key={dn} className="flex items-center gap-3">
              <span className="w-24 text-sm font-semibold truncate">{d?.name_acronym ?? `#${dn}`}</span>
              <div className="flex-1 h-5 bg-zinc-800 rounded overflow-hidden">
                <div className="h-full rounded" style={{ width: `${(count / maxCount) * 100}%`, backgroundColor: color, opacity: 0.6 }} />
              </div>
              <span className="w-10 text-right font-mono text-sm">{count}</span>
            </div>
          );
        })}
      </div>
      <div className="rounded-xl border border-zinc-800 overflow-hidden max-h-96 overflow-y-auto">
        <div className="grid grid-cols-4 gap-4 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-800 bg-zinc-900 sticky top-0">
          <span>Adelantó</span><span>Adelantado</span><span>Posición</span><span>Fecha</span>
        </div>
        {overtakes.slice(0, 100).map((o, i) => (
          <div key={i} className="grid grid-cols-4 gap-4 px-6 py-2 text-sm border-b border-zinc-800/50 last:border-0">
            <span className="font-semibold text-green-400">{drivers.get(o.overtaking_driver_number)?.name_acronym ?? `#${o.overtaking_driver_number}`}</span>
            <span>{drivers.get(o.overtaken_driver_number)?.name_acronym ?? `#${o.overtaken_driver_number}`}</span>
            <span className="font-mono">P{o.position}</span>
            <span className="text-xs text-zinc-500 font-mono">{new Date(o.date).toLocaleTimeString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RaceControlSection({ events }: { events: RaceControl[] }) {
  if (!events.length) return <p className="text-zinc-500">No hay eventos de race control.</p>;
  return (
    <div>
      <h3 className="text-lg font-bold mb-4">Race Control ({events.length} eventos)</h3>
      <div className="space-y-2">
        {events.slice(0, 50).map((e, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border border-zinc-800 p-3 text-sm">
            {e.category === "Flag" && e.flag ? (
              <span className={`inline-block w-3 h-3 rounded-full ${FLAG_COLORS[e.flag] ?? "bg-zinc-600"}`} />
            ) : (
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-400 uppercase">{e.category}</span>
            )}
            <span className="flex-1 text-zinc-300">{e.message}</span>
            {e.lap_number && <span className="text-xs text-zinc-500 font-mono">Vuelta {e.lap_number}</span>}
            <span className="text-xs text-zinc-600 font-mono w-16 text-right">{new Date(e.date).toLocaleTimeString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = (seconds % 60).toFixed(3);
  return `${m}:${String(s).padStart(6, "0")}`;
}
