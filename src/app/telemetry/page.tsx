import { Suspense } from "react";
import { TelemetryView } from "@/feature/telemetry";

export default function TelemetryPage() {
  return (
    <Suspense>
      <TelemetryView />
    </Suspense>
  );
}
