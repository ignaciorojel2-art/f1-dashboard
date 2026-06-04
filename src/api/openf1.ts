const BASE = "https://api.openf1.org/v1";

const TTL: Record<string, number> = {
  meetings: 10 * 60 * 1000,
  sessions: 5 * 60 * 1000,
  drivers: 5 * 60 * 1000,
  car_data: 2 * 60 * 1000,
  laps: 2 * 60 * 1000,
  location: 2 * 60 * 1000,
  position: 2 * 60 * 1000,
  intervals: 2 * 60 * 1000,
  overtakes: 2 * 60 * 1000,
  pit: 2 * 60 * 1000,
  stints: 2 * 60 * 1000,
  race_control: 2 * 60 * 1000,
  session_result: 2 * 60 * 1000,
  starting_grid: 2 * 60 * 1000,
  championship_drivers: 2 * 60 * 1000,
  championship_teams: 2 * 60 * 1000,
  weather: 3 * 60 * 1000,
};

const cache = new Map<string, { data: unknown; timestamp: number }>();
const inFlight = new Map<string, Promise<unknown>>();

function cacheKey(endpoint: string, params: Record<string, string>): string {
  const sorted = Object.keys(params)
    .sort()
    .reduce((acc, k) => {
      acc[k] = params[k];
      return acc;
    }, {} as Record<string, string>);
  return `${endpoint}/${JSON.stringify(sorted)}`;
}

function delay(ms: number, jitterMax: number): Promise<void> {
  const jitter = Math.random() * jitterMax;
  return new Promise((r) => setTimeout(r, ms + jitter));
}

async function fetchApi<T>(endpoint: string, params: Record<string, string> = {}): Promise<T[]> {
  const key = cacheKey(endpoint, params);
  const maxAge = TTL[endpoint] ?? 2 * 60 * 1000;

  // Estrategia 1: Cache hit
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < maxAge) {
    return cached.data as T[];
  }

  // Estrategia 2: Dedup en vuelo
  const flying = inFlight.get(key);
  if (flying) return flying as Promise<T[]>;

  // Estrategia 4: Retry con exponential backoff + jitter
  const doFetch = async (attempt = 0): Promise<T[]> => {
    const url = new URL(`${BASE}/${endpoint}`);
    Object.entries(params).forEach(([k, v]) => {
      if (v) url.searchParams.set(k, v);
    });

    const res = await fetch(url.toString());

    if (res.status === 429 || res.status >= 500) {
      if (attempt < 3) {
        const baseDelay = Math.pow(2, attempt) * 1000;
        const jitterMax = Math.pow(2, attempt) * 500;
        console.warn(`[openf1] Retry ${attempt + 1}/3 para ${endpoint} (${res.status}) en ${(baseDelay / 1000).toFixed(1)}s`);
        await delay(baseDelay, jitterMax);
        return doFetch(attempt + 1);
      }
    }

    if (!res.ok) {
      throw new Error(`${endpoint}: ${res.status} ${res.statusText}`);
    }

    return res.json();
  };

  const promise = doFetch().then((data) => {
    cache.set(key, { data, timestamp: Date.now() });
    inFlight.delete(key);
    return data;
  }).catch((err) => {
    inFlight.delete(key);
    throw err;
  });

  inFlight.set(key, promise);
  return promise;
}

export const openf1 = {
  meetings: (params: Record<string, string> = {}) =>
    fetchApi<Meeting>("meetings", params),

  sessions: (params: Record<string, string> = {}) =>
    fetchApi<Session>("sessions", params),

  drivers: (params: Record<string, string> = {}) =>
    fetchApi<Driver>("drivers", params),

  carData: (params: Record<string, string> = {}) =>
    fetchApi<CarData>("car_data", params),

  laps: (params: Record<string, string> = {}) =>
    fetchApi<Lap>("laps", params),

  location: (params: Record<string, string> = {}) =>
    fetchApi<Location>("location", params),

  position: (params: Record<string, string> = {}) =>
    fetchApi<Position>("position", params),

  intervals: (params: Record<string, string> = {}) =>
    fetchApi<Interval>("intervals", params),

  overtakes: (params: Record<string, string> = {}) =>
    fetchApi<Overtake>("overtakes", params),

  pit: (params: Record<string, string> = {}) =>
    fetchApi<Pit>("pit", params),

  stints: (params: Record<string, string> = {}) =>
    fetchApi<Stint>("stints", params),

  raceControl: (params: Record<string, string> = {}) =>
    fetchApi<RaceControl>("race_control", params),

  sessionResult: (params: Record<string, string> = {}) =>
    fetchApi<SessionResult>("session_result", params),

  startingGrid: (params: Record<string, string> = {}) =>
    fetchApi<StartingGrid>("starting_grid", params),

  championshipDrivers: (params: Record<string, string> = {}) =>
    fetchApi<ChampionshipDriver>("championship_drivers", params),

  championshipTeams: (params: Record<string, string> = {}) =>
    fetchApi<ChampionshipTeam>("championship_teams", params),

  weather: (params: Record<string, string> = {}) =>
    fetchApi<Weather>("weather", params),
};

export interface Meeting {
  meeting_key: number;
  meeting_name: string;
  meeting_official_name: string;
  location: string;
  country_key: number;
  country_code: string;
  country_name: string;
  circuit_key: number;
  circuit_short_name: string;
  circuit_type: string;
  circuit_image: string;
  country_flag: string;
  date_start: string;
  date_end: string;
  gmt_offset: string;
  year: number;
  is_cancelled: boolean;
}

export interface Session {
  session_key: number;
  meeting_key: number;
  session_name: string;
  session_type: string;
  circuit_key: number;
  circuit_short_name: string;
  country_name: string;
  country_code: string;
  date_start: string;
  date_end: string;
  gmt_offset: string;
  year: number;
  is_cancelled: boolean;
}

export interface Driver {
  driver_number: number;
  full_name: string;
  first_name: string;
  last_name: string;
  name_acronym: string;
  broadcast_name: string;
  headshot_url: string;
  team_name: string;
  team_colour: string;
  meeting_key: number;
  session_key: number;
}

export interface CarData {
  brake: number;
  date: string;
  driver_number: number;
  drs: number;
  meeting_key: number;
  n_gear: number;
  rpm: number;
  session_key: number;
  speed: number;
  throttle: number;
}

export interface Lap {
  date_start: string;
  driver_number: number;
  duration_sector_1: number;
  duration_sector_2: number;
  duration_sector_3: number;
  i1_speed: number;
  i2_speed: number;
  is_pit_out_lap: boolean;
  lap_duration: number;
  lap_number: number;
  meeting_key: number;
  segments_sector_1: number[];
  segments_sector_2: number[];
  segments_sector_3: number[];
  session_key: number;
  st_speed: number;
}

export interface Location {
  date: string;
  driver_number: number;
  meeting_key: number;
  session_key: number;
  x: number;
  y: number;
  z: number;
}

export interface Position {
  date: string;
  driver_number: number;
  meeting_key: number;
  position: number;
  session_key: number;
}

export interface Interval {
  date: string;
  driver_number: number;
  gap_to_leader: number | null;
  interval: number | null;
  meeting_key: number;
  session_key: number;
}

export interface Overtake {
  date: string;
  meeting_key: number;
  overtaken_driver_number: number;
  overtaking_driver_number: number;
  position: number;
  session_key: number;
}

export interface Pit {
  date: string;
  driver_number: number;
  lane_duration: number;
  lap_number: number;
  meeting_key: number;
  session_key: number;
  stop_duration: number;
}

export interface Stint {
  compound: string;
  driver_number: number;
  lap_end: number;
  lap_start: number;
  meeting_key: number;
  session_key: number;
  stint_number: number;
  tyre_age_at_start: number;
}

export interface RaceControl {
  category: string;
  date: string;
  driver_number: number | null;
  flag: string | null;
  lap_number: number | null;
  meeting_key: number;
  message: string;
  scope: string | null;
  sector: number | null;
  session_key: number;
}

export interface SessionResult {
  dnf: boolean;
  dns: boolean;
  dsq: boolean;
  driver_number: number;
  duration: number | number[];
  gap_to_leader: number | null;
  number_of_laps: number;
  meeting_key: number;
  position: number;
  session_key: number;
}

export interface StartingGrid {
  position: number;
  driver_number: number;
  lap_duration: number;
  meeting_key: number;
  session_key: number;
}

export interface ChampionshipDriver {
  driver_number: number;
  meeting_key: number;
  points_current: number;
  points_start: number;
  position_current: number;
  position_start: number;
  session_key: number;
}

export interface ChampionshipTeam {
  meeting_key: number;
  points_current: number;
  points_start: number;
  position_current: number;
  position_start: number;
  session_key: number;
  team_name: string;
}

export interface Weather {
  air_temperature: number;
  date: string;
  humidity: number;
  meeting_key: number;
  pressure: number;
  rainfall: number;
  session_key: number;
  track_temperature: number;
  wind_direction: number;
  wind_speed: number;
}
