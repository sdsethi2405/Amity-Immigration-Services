import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
        404
      </p>
      <h1 className="mt-3 font-heading text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
        Page not found
      </h1>
      <p className="mt-4 max-w-md text-base text-muted-foreground">
        The page you are looking for does not exist or may have moved.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Back to home
      </Link>
    </main>
  );
}
