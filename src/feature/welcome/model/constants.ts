import type { Driver, Constructor, RaceResult, HistoricalStat, SeasonData } from "./types";

export const DRIVER_STANDINGS: Driver[] = [
  { id: "1", name: "Max Verstappen", team: "Red Bull Racing", nationality: "NED", points: 395, wins: 13, podiums: 17, number: 1, imageUrl: "/images/drivers/verstappen.png" },
  { id: "2", name: "Lando Norris", team: "McLaren", nationality: "GBR", points: 292, wins: 4, podiums: 13, number: 4, imageUrl: "/images/drivers/norris.png" },
  { id: "3", name: "Charles Leclerc", team: "Ferrari", nationality: "MON", points: 274, wins: 3, podiums: 11, number: 16, imageUrl: "/images/drivers/leclerc.png" },
  { id: "4", name: "Oscar Piastri", team: "McLaren", nationality: "AUS", points: 248, wins: 2, podiums: 9, number: 81, imageUrl: "/images/drivers/piastri.png" },
  { id: "5", name: "Carlos Sainz", team: "Ferrari", nationality: "ESP", points: 225, wins: 2, podiums: 7, number: 55, imageUrl: "/images/drivers/sainz.png" },
  { id: "6", name: "Lewis Hamilton", team: "Mercedes", nationality: "GBR", points: 203, wins: 2, podiums: 5, number: 44, imageUrl: "/images/drivers/hamilton.png" },
  { id: "7", name: "George Russell", team: "Mercedes", nationality: "GBR", points: 194, wins: 1, podiums: 5, number: 63, imageUrl: "/images/drivers/russell.png" },
  { id: "8", name: "Sergio Pérez", team: "Red Bull Racing", nationality: "MEX", points: 172, wins: 0, podiums: 4, number: 11, imageUrl: "/images/drivers/perez.png" },
];

export const CONSTRUCTOR_STANDINGS: Constructor[] = [
  { id: "1", name: "McLaren", nationality: "GBR", points: 540, wins: 6, color: "#FF8000" },
  { id: "2", name: "Ferrari", nationality: "ITA", points: 499, wins: 5, color: "#DC0000" },
  { id: "3", name: "Red Bull Racing", nationality: "AUT", points: 475, wins: 7, color: "#1E41FF" },
  { id: "4", name: "Mercedes", nationality: "GER", points: 368, wins: 3, color: "#00D2BE" },
  { id: "5", name: "Aston Martin", nationality: "GBR", points: 84, wins: 0, color: "#006F62" },
];

export const RECENT_RACES: RaceResult[] = [
  { round: 20, grandPrix: "São Paulo", circuit: "Interlagos", date: "2025-11-02", winner: "Max Verstappen", winnerTeam: "Red Bull Racing", fastestLap: "Max Verstappen" },
  { round: 19, grandPrix: "Mexico City", circuit: "Autódromo Hnos. Rodríguez", date: "2025-10-26", winner: "Carlos Sainz", winnerTeam: "Ferrari", fastestLap: "Charles Leclerc" },
  { round: 18, grandPrix: "United States", circuit: "Circuit of the Americas", date: "2025-10-19", winner: "Charles Leclerc", winnerTeam: "Ferrari", fastestLap: "Lando Norris" },
  { round: 17, grandPrix: "Singapore", circuit: "Marina Bay", date: "2025-10-05", winner: "Lando Norris", winnerTeam: "McLaren", fastestLap: "Lando Norris" },
  { round: 16, grandPrix: "Azerbaijan", circuit: "Baku City Circuit", date: "2025-09-21", winner: "Oscar Piastri", winnerTeam: "McLaren", fastestLap: "Oscar Piastri" },
  { round: 15, grandPrix: "Italy", circuit: "Monza", date: "2025-09-07", winner: "Charles Leclerc", winnerTeam: "Ferrari", fastestLap: "Charles Leclerc" },
];

export const HISTORICAL_STATS: HistoricalStat[] = [
  { label: "Grandes Premios", value: "1,125+", description: "Carreras disputadas en la historia de la Fórmula 1 desde 1950." },
  { label: "Pilotos Campeones", value: "34", description: "Distintos pilotos han ganado al menos un campeonato mundial." },
  { label: "Escuderías", value: "170+", description: "Equipos han competido en la F1 a lo largo de su historia." },
  { label: "Circuitos", value: "77", description: "Trazados diferentes han albergado al menos un Gran Premio de F1." },
];

export const SEASON_HISTORY: SeasonData[] = [
  { year: 2024, driversChampion: "Max Verstappen", constructorsChampion: "McLaren", totalRaces: 24 },
  { year: 2023, driversChampion: "Max Verstappen", constructorsChampion: "Red Bull Racing", totalRaces: 22 },
  { year: 2022, driversChampion: "Max Verstappen", constructorsChampion: "Red Bull Racing", totalRaces: 22 },
  { year: 2021, driversChampion: "Max Verstappen", constructorsChampion: "Mercedes", totalRaces: 22 },
  { year: 2020, driversChampion: "Lewis Hamilton", constructorsChampion: "Mercedes", totalRaces: 17 },
];

export const TEAM_COLORS: Record<string, string> = {
  "Red Bull Racing": "#1E41FF",
  "McLaren": "#FF8000",
  "Ferrari": "#DC0000",
  "Mercedes": "#00D2BE",
  "Aston Martin": "#006F62",
};
