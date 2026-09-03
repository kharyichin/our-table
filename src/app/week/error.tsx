"use client";

import { RouteError } from "@/components/ui/RouteError";

export default function ErrorBoundary(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError {...props} title="This Weekly Story did not open" />;
}
