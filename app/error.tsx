"use client";

import Link from "next/link";
import { useEffect } from "react";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
        Something went wrong
      </p>
      <h1 className="mt-3 font-heading text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
        We could not load this page
      </h1>
      <p className="mt-4 max-w-md text-base text-muted-foreground">
        An unexpected error occurred. You can try again, or return to the home
        page.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
