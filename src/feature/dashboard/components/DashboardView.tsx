"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { openf1, type Meeting, type Session, type ChampionshipDriver, type ChampionshipTeam, type Driver as DriverInfo } from "@/api/openf1";
import { sortMeetingsAsc, findNextMeeting } from "@/lib/meetings";

const YEARS = [2026, 2025, 2024, 2023];
const SESSION_TYPES: Record<string, string> = {
  "Race": "Carrera",
  "Qualifying": "Clasificación",
  "Sprint": "Sprint",
  "Sprint Qualifying": "Clasificación Sprint",
  "Practice 1": "Práctica 1",
  "Practice 2": "Práctica 2",
  "Practice 3": "Práctica 3",
};

export function DashboardView() {
  const [year, setYear] = useState(2025);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"calendar" | "drivers" | "teams">("calendar");
  const [driverChamp, setDriverChamp] = useState<(ChampionshipDriver & { driver?: DriverInfo })[]>([]);
  const [teamChamp, setTeamChamp] = useState<ChampionshipTeam[]>([]);

  useEffect(() => {
    setLoading(true);
    setSelectedMeeting(null);
    setSessions([]);
    openf1.meetings({ year: String(year) }).then((data) => {
      const sorted = sortMeetingsAsc(data);
      setMeetings(sorted);
      const next = findNextMeeting(data);
      if (next) setSelectedMeeting(next);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [year]);

  function selectMeeting(meeting: Meeting) {
    setSelectedMeeting(meeting);
    setSessions([]);
    openf1.sessions({ meeting_key: String(meeting.meeting_key) }).then((data) => {
      setSessions(data.sort((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime()));
    });

    const raceSession = sessions.find((s) => s.session_type === "Race");
    if (raceSession) {
      loadChampionships(raceSession.session_key);
    }
  }

  async function loadChampionships(sessionKey: number) {
    const sk = String(sessionKey);
    const [cd, ct, dr] = await Promise.all([
      openf1.championshipDrivers({ session_key: sk }),
      openf1.championshipTeams({ session_key: sk }),
      openf1.drivers({ session_key: sk }),
    ]);
    const driverMap = new Map(dr.map((d) => [d.driver_number, d]));
    setDriverChamp(
      cd
        .sort((a, b) => a.position_current - b.position_current)
        .map((c) => ({ ...c, driver: driverMap.get(c.driver_number) }))
        .slice(0, 10)
    );
    setTeamChamp(
      ct.sort((a, b) => a.position_current - b.position_current).slice(0, 10)
    );
  }

  async function onSessionClick(session: Session) {
    loadChampionships(session.session_key);
    setTab(session.session_type === "Race" ? "drivers" : "calendar");
  }

  const upcoming = meetings.filter((m) => new Date(m.date_end) > new Date());
  const past = meetings.filter((m) => new Date(m.date_end) <= new Date());

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
          <Link href="/explore" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors mr-2">← Volver</Link>
          <h1 className="text-xl font-bold">F1 Dashboard</h1>
          <nav className="flex gap-1">
              {(["calendar", "drivers", "teams"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    tab === t ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {t === "calendar" ? "Calendario" : t === "drivers" ? "Pilotos" : "Constructores"}
                </button>
              ))}
            </nav>
          </div>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm"
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {loading && <p className="text-zinc-500 animate-pulse">Cargando datos...</p>}

        {tab === "calendar" && !loading && (
          <div className="space-y-10">
            {upcoming.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-f1-red mb-4 uppercase tracking-wider text-sm">Próximos</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {upcoming.map((m) => (
                    <MeetingCard key={m.meeting_key} meeting={m} isSelected={selectedMeeting?.meeting_key === m.meeting_key} onClick={() => selectMeeting(m)} />
                  ))}
                </div>
              </section>
            )}

            <section>
              <h2 className="text-lg font-semibold text-zinc-500 mb-4 uppercase tracking-wider text-sm">Historial</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {past.map((m) => (
                  <MeetingCard key={m.meeting_key} meeting={m} isSelected={selectedMeeting?.meeting_key === m.meeting_key} onClick={() => selectMeeting(m)} />
                ))}
              </div>
            </section>

            {selectedMeeting && sessions.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-zinc-300 mb-4">
                  Sesiones — {selectedMeeting.country_name}
                </h2>
                <div className="flex flex-wrap gap-3">
                  {sessions.map((s) => (
                    <button
                      key={s.session_key}
                      onClick={() => onSessionClick(s)}
                      className="rounded-xl border border-zinc-700 bg-zinc-800/50 px-5 py-3 text-left hover:border-f1-red/30 hover:bg-zinc-800 transition-colors"
                    >
                      <span className="block text-sm font-semibold">
                        {SESSION_TYPES[s.session_type] ?? s.session_name}
                      </span>
                      <span className="block text-xs text-zinc-500 mt-1">
                        {new Date(s.date_start).toLocaleDateString("es-CL", { day: "numeric", month: "short" })}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {tab === "drivers" && (
          <ChampionshipTable
            title="Campeonato de Pilotos"
            data={driverChamp.map((c) => ({
              pos: c.position_current,
              name: c.driver?.full_name ?? `Driver #${c.driver_number}`,
              team: c.driver?.team_name ?? "",
              color: c.driver?.team_colour ? `#${c.driver.team_colour}` : "#666",
              headshot: c.driver?.headshot_url ?? "",
              points: c.points_current,
              pointsStart: c.points_start,
            }))}
          />
        )}

        {tab === "teams" && (
          <ChampionshipTable
            title="Campeonato de Constructores"
            data={teamChamp.map((c) => ({
              pos: c.position_current,
              name: c.team_name,
              team: "",
              color: "#666",
              headshot: "",
              points: c.points_current,
              pointsStart: c.points_start,
            }))}
          />
        )}
      </main>
    </div>
  );
}

function MeetingCard({ meeting, isSelected, onClick }: { meeting: Meeting; isSelected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border text-left transition-all ${
        isSelected ? "border-f1-red/50 bg-f1-red/5" : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
      }`}
    >
      <div className="absolute top-3 right-3">
        {meeting.country_flag && (
          <img src={meeting.country_flag} alt="" className="h-5 w-7 rounded object-cover" />
        )}
      </div>
      {meeting.circuit_image && (
        <div className="h-32 overflow-hidden opacity-60">
          <img src={meeting.circuit_image} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-4">
        <span className="text-xs font-medium text-f1-red">
          Ronda {meeting.meeting_key}
        </span>
        <h3 className="mt-1 font-bold text-sm">{meeting.meeting_name}</h3>
        <p className="text-xs text-zinc-500 mt-1">{meeting.circuit_short_name}</p>
        <p className="text-xs text-zinc-600 mt-0.5">
          {new Date(meeting.date_start).toLocaleDateString("es-CL", { day: "numeric", month: "long" })} —{" "}
          {new Date(meeting.date_end).toLocaleDateString("es-CL", { day: "numeric", month: "long" })}
        </p>
      </div>
    </button>
  );
}

function ChampionshipTable({ title, data }: {
  title: string;
  data: { pos: number; name: string; team: string; color: string; headshot: string; points: number; pointsStart: number }[];
}) {
  if (data.length === 0) return <p className="text-zinc-500">Selecciona una sesión de carrera para ver el campeonato.</p>;

  const maxPoints = data[0]?.points ?? 1;

  return (
    <section>
      <h2 className="text-xl font-bold mb-6">{title}</h2>
      <div className="rounded-xl border border-zinc-800 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-800 bg-zinc-900">
          <span className="col-span-1">Pos</span>
          <span className="col-span-2" />
          <span className="col-span-3">Nombre</span>
          <span className="col-span-2">Equipo</span>
          <span className="col-span-2 text-right">Puntos</span>
          <span className="col-span-2 text-right">Dif.</span>
        </div>
        {data.map((row, i) => {
          const diff = row.pointsStart ? row.points - row.pointsStart : 0;
          return (
            <div key={i} className="grid grid-cols-12 gap-4 px-6 py-3 items-center border-b border-zinc-800/50 last:border-0 hover:bg-zinc-900/50 transition-colors relative">
              <div className="absolute inset-y-0 left-0 opacity-5" style={{ width: `${(row.points / maxPoints) * 100}%`, backgroundColor: row.color }} />
              <span className="col-span-1 font-mono font-bold text-zinc-400">#{row.pos}</span>
              <span className="col-span-2 flex justify-center">
                {row.headshot ? (
                  <img src={row.headshot} alt="" className="h-10 w-10 rounded-full object-cover bg-zinc-800" />
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-sm font-bold text-zinc-500">
                    {row.name.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </span>
              <span className="col-span-3 font-semibold">{row.name}</span>
              <span className="col-span-2 text-sm text-zinc-400 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: row.color }} />
                {row.team}
              </span>
              <span className="col-span-2 text-right font-mono font-bold">{row.points}</span>
              <span className={`col-span-2 text-right font-mono text-sm ${diff > 0 ? "text-green-400" : diff < 0 ? "text-red-400" : "text-zinc-500"}`}>
                {diff > 0 ? `+${diff}` : diff < 0 ? `${diff}` : "—"}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
