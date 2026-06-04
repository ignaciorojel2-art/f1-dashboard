export interface Driver {
  id: string;
  name: string;
  team: string;
  nationality: string;
  points: number;
  wins: number;
  podiums: number;
  number: number;
}

export interface Constructor {
  id: string;
  name: string;
  nationality: string;
  points: number;
  wins: number;
  color: string;
}

export interface RaceResult {
  round: number;
  grandPrix: string;
  circuit: string;
  date: string;
  winner: string;
  winnerTeam: string;
  fastestLap: string;
}

export interface HistoricalStat {
  label: string;
  value: number;
  suffix: string;
  description: string;
}
