"use client";

import { useState, useEffect, useCallback } from "react";
import {
  openf1,
  type Meeting,
  type Session,
  type Driver as DriverInfo,
  type CarData,
  type Lap,
} from "@/api/openf1";

const SESSION_TYPES: Record<string, string> = {
  "Race": "Carrera", "Qualifying": "Clasificación", "Sprint": "Sprint",
  "Sprint Qualifying": "Clasificación Sprint", "Practice 1": "Práctica 1",
  "Practice 2": "Práctica 2", "Practice 3": "Práctica 3",
};

export function TelemetryView() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [drivers, setDrivers] = useState<DriverInfo[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<string>("");
  const [selectedSession, setSelectedSession] = useState<string>("");
  const [selectedDriver, setSelectedDriver] = useState<string>("");
  const [carData, setCarData] = useState<CarData[]>([]);
  const [laps, setLaps] = useState<Lap[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeMetric, setActiveMetric] = useState<string>("speed");
  const [lapFilter, setLapFilter] = useState<string>("all");

  useEffect(() => {
    openf1.meetings({ year: "2025" }).then((d) =>
      setMeetings(d.filter((m) => !m.is_cancelled).sort((a, b) => new Date(b.date_start).getTime() - new Date(a.date_start).getTime()))
    );
  }, []);

  useEffect(() => {
    if (!selectedMeeting) return;
    openf1.sessions({ meeting_key: selectedMeeting }).then((d) =>
      setSessions(d.sort((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime()))
    );
    setSelectedSession("");
    setSelectedDriver("");
    setDrivers([]);
  }, [selectedMeeting]);

  useEffect(() => {
    if (!selectedSession) return;
    openf1.drivers({ session_key: selectedSession }).then(setDrivers);
    setSelectedDriver("");
  }, [selectedSession]);

  const loadTelemetry = useCallback(async () => {
    if (!selectedSession || !selectedDriver) return;
    setLoading(true);
    const params = { session_key: selectedSession, driver_number: selectedDriver };
    try {
      const [cd, lp] = await Promise.all([
        openf1.carData(params),
        openf1.laps(params),
      ]);
      setCarData(cd);
      setLaps(lp);
    } catch {}
    setLoading(false);
  }, [selectedSession, selectedDriver]);

  useEffect(() => { loadTelemetry(); }, [loadTelemetry]);

  const filteredData = lapFilter === "all" ? carData : carData.filter(() => true);
  const availableLaps = [...new Set(laps.map((l) => l.lap_number))].sort((a, b) => a - b);
  const driverInfo = drivers.find((d) => String(d.driver_number) === selectedDriver);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center gap-3 flex-wrap">
          <h1 className="text-lg font-bold text-cyan-400">Telemetría</h1>
          <select value={selectedMeeting} onChange={(e) => setSelectedMeeting(e.target.value)} className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm min-w-[200px]">
            <option value="">GP...</option>
            {meetings.map((m) => <option key={m.meeting_key} value={m.meeting_key}>{m.country_name} — {m.meeting_name}</option>)}
          </select>
          <select value={selectedSession} onChange={(e) => setSelectedSession(e.target.value)} disabled={!selectedMeeting} className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm min-w-[180px] disabled:opacity-40">
            <option value="">Sesión...</option>
            {sessions.map((s) => <option key={s.session_key} value={s.session_key}>{SESSION_TYPES[s.session_type] ?? s.session_name}</option>)}
          </select>
          <select value={selectedDriver} onChange={(e) => setSelectedDriver(e.target.value)} disabled={!selectedSession} className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm min-w-[200px] disabled:opacity-40">
            <option value="">Piloto...</option>
            {drivers.map((d) => <option key={d.driver_number} value={d.driver_number}>{d.full_name} — {d.team_name}</option>)}
          </select>
          {loading && <span className="text-sm text-zinc-500 animate-pulse">Cargando telemetría...</span>}
        </div>
        {selectedDriver && carData.length > 0 && (
          <nav className="mx-auto max-w-7xl px-6 pb-2 flex gap-1 flex-wrap">
            {["speed", "rpm", "throttle", "brake", "gear", "drs"].map((m) => (
              <button key={m} onClick={() => setActiveMetric(m)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeMetric === m ? "bg-cyan-500/20 text-cyan-400" : "text-zinc-400 hover:text-zinc-200"}`}>
                {m === "speed" ? "Velocidad" : m === "rpm" ? "RPM" : m === "throttle" ? "Acelerador" : m === "brake" ? "Freno" : m === "gear" ? "Marcha" : "DRS"}
              </button>
            ))}
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {!selectedDriver && <p className="text-zinc-500 text-center mt-20">Selecciona GP, sesión y piloto para ver telemetría.</p>}

        {selectedDriver && carData.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 rounded-xl border border-zinc-800 p-4 bg-zinc-900/50">
              {driverInfo?.headshot_url && (
                <img src={driverInfo.headshot_url} alt="" className="h-14 w-14 rounded-full bg-zinc-800" />
              )}
              <div>
                <h2 className="text-xl font-bold">{driverInfo?.full_name ?? `Piloto #${selectedDriver}`}</h2>
                <p className="text-sm text-zinc-400">{driverInfo?.team_name}</p>
              </div>
              <div className="ml-auto grid grid-cols-3 gap-6 text-center">
                <div><span className="block text-2xl font-bold text-cyan-400">{Math.max(...carData.map((d) => d.speed))}</span><span className="text-xs text-zinc-500">Vel. Max km/h</span></div>
                <div><span className="block text-2xl font-bold text-cyan-400">{Math.max(...carData.map((d) => d.rpm))}</span><span className="text-xs text-zinc-500">RPM Max</span></div>
                <div><span className="block text-2xl font-bold text-cyan-400">{carData.length}</span><span className="text-xs text-zinc-500">Muestras</span></div>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 p-6">
              <h3 className="text-lg font-bold mb-4">
                {activeMetric === "speed" ? "Velocidad (km/h)" :
                 activeMetric === "rpm" ? "Revoluciones (RPM)" :
                 activeMetric === "throttle" ? "Acelerador (%)" :
                 activeMetric === "brake" ? "Freno (presionado)" :
                 activeMetric === "gear" ? "Marcha" :
                 "DRS"}
              </h3>
              <TelemetryChart data={carData} metric={activeMetric} color={driverInfo?.team_colour ? `#${driverInfo.team_colour}` : "#06b6d4"} />
            </div>

            {laps.length > 0 && (
              <div className="rounded-xl border border-zinc-800 p-6">
                <h3 className="text-lg font-bold mb-4">Tiempos por Vuelta</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-zinc-500 uppercase border-b border-zinc-800">
                        <th className="text-left py-2 px-3">Vuelta</th>
                        <th className="text-right py-2 px-3">Total</th>
                        <th className="text-right py-2 px-3">Sector 1</th>
                        <th className="text-right py-2 px-3">Sector 2</th>
                        <th className="text-right py-2 px-3">Sector 3</th>
                        <th className="text-right py-2 px-3">Vel. I1</th>
                        <th className="text-right py-2 px-3">Vel. I2</th>
                        <th className="text-right py-2 px-3">Speed Trap</th>
                      </tr>
                    </thead>
                    <tbody>
                      {laps.filter((l) => !l.is_pit_out_lap).slice(0, 30).map((l) => (
                        <tr key={l.lap_number} className="border-b border-zinc-800/50 hover:bg-zinc-900/50">
                          <td className="py-2 px-3 font-mono">{l.lap_number}</td>
                          <td className="py-2 px-3 font-mono text-right">{(l.lap_duration ?? 0).toFixed(3)}s</td>
                          <td className="py-2 px-3 font-mono text-right text-emerald-400">{(l.duration_sector_1 ?? 0).toFixed(3)}</td>
                          <td className="py-2 px-3 font-mono text-right text-blue-400">{(l.duration_sector_2 ?? 0).toFixed(3)}</td>
                          <td className="py-2 px-3 font-mono text-right text-purple-400">{(l.duration_sector_3 ?? 0).toFixed(3)}</td>
                          <td className="py-2 px-3 font-mono text-right">{l.i1_speed}</td>
                          <td className="py-2 px-3 font-mono text-right">{l.i2_speed}</td>
                          <td className="py-2 px-3 font-mono text-right">{l.st_speed}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function TelemetryChart({ data, metric, color }: { data: CarData[]; metric: string; color: string }) {
  const W = 900, H = 300, pad = { t: 20, r: 30, b: 40, l: 60 };
  const cw = W - pad.l - pad.r, ch = H - pad.t - pad.b;

  const step = Math.max(1, Math.floor(data.length / 400));
  const sampled = data.filter((_, i) => i % step === 0 || i === data.length - 1);

  const values = sampled.map((d) => {
    switch (metric) {
      case "speed": return d.speed;
      case "rpm": return d.rpm;
      case "throttle": return d.throttle;
      case "brake": return d.brake;
      case "gear": return d.n_gear;
      case "drs": return d.drs;
      default: return d.speed;
    }
  });

  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  const points = values.map((v, i) => {
    const x = pad.l + (i / (values.length - 1 || 1)) * cw;
    const y = pad.t + ch - ((v - minVal) / range) * ch;
    return `${x},${y}`;
  }).join(" ");

  const yTicks = 5;
  const horizontalLines = Array.from({ length: yTicks + 1 }, (_, i) => {
    const val = minVal + (range / yTicks) * i;
    const y = pad.t + ch - (i / yTicks) * ch;
    return { val, y };
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {horizontalLines.map((h, i) => (
        <g key={i}>
          <line x1={pad.l} x2={W - pad.r} y1={h.y} y2={h.y} stroke="#27272a" strokeDasharray="4 4" />
          <text x={pad.l - 8} y={h.y + 4} textAnchor="end" fontSize={10} fill="#71717a">
            {metric === "gear" ? h.val : Math.round(h.val)}
          </text>
        </g>
      ))}

      <defs>
        <linearGradient id={`grad-${metric}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.4} />
          <stop offset="100%" stopColor={color} stopOpacity={0.02} />
        </linearGradient>
      </defs>

      {points && (
        <polygon
          points={`${pad.l},${pad.t + ch} ${points} ${W - pad.r},${pad.t + ch}`}
          fill={`url(#grad-${metric})`}
        />
      )}
      <polyline points={points} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
    </svg>
  );
}
