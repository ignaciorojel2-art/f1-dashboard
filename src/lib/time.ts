export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const ms = s.toFixed(3).split(".")[1];

  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(Math.floor(s)).padStart(2, "0")}.${ms}`;
  }
  return `${m}:${String(Math.floor(s)).padStart(2, "0")}.${ms}`;
}

export function formatGap(seconds: number): string {
  return `+${seconds.toFixed(3)}s`;
}
