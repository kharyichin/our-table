"use client";

import { useEffect } from "react";
import { Button, LinkButton } from "@/components/ui/Button";
import { LineIcon } from "@/components/ui/LineIcon";

export function RouteError({
  error,
  reset,
  title = "This chapter did not open",
}: {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center px-4 py-10 lg:px-10">
      <section className="paper-card w-full px-6 py-12 text-center sm:px-12">
        <div className="empty-state-mark mx-auto">
          <LineIcon name="plate" className="h-8 w-8" />
        </div>
        <p className="journal-kicker mt-5">Something went wrong</p>
        <h1 className="font-display mt-2 text-3xl text-ink sm:text-4xl">{title}</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-ink-soft">
          Your household data is still safe. Try opening the page again, or return home and continue from there.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Button type="button" onClick={reset}>Try again</Button>
          <LinkButton href="/home" variant="secondary">Return home</LinkButton>
        </div>
      </section>
    </div>
  );
}
