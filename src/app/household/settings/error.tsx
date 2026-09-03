"use client";

import { RouteError } from "@/components/ui/RouteError";

export default function ErrorBoundary(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError {...props} title="Household settings did not open" />;
}
