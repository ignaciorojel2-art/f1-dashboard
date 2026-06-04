import { Suspense } from "react";
import { RaceView } from "@/feature/race";

export default function RacePage() {
  return (
    <Suspense>
      <RaceView />
    </Suspense>
  );
}
