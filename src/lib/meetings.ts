import type { Meeting } from "@/api/openf1";

export function sortMeetingsAsc(meetings: Meeting[]): Meeting[] {
  return meetings
    .filter((m) => !m.is_cancelled)
    .sort((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime());
}

export function findNextMeeting(meetings: Meeting[]): Meeting | null {
  const sorted = sortMeetingsAsc(meetings);
  const now = Date.now();
  const upcoming = sorted.find((m) => new Date(m.date_end).getTime() > now);
  if (upcoming) return upcoming;
  if (sorted.length > 0) return sorted[sorted.length - 1];
  return null;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CL", { day: "numeric", month: "short" });
}
