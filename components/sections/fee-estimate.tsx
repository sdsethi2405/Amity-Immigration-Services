import type { FeeEstimateBand } from "@/lib/db/queries";

type FeeEstimateSectionProps = {
  bands: FeeEstimateBand[];
};

export function FeeEstimateSection({ bands }: FeeEstimateSectionProps) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-12 md:px-6 lg:py-16">
      <h1 className="font-heading text-4xl font-semibold tracking-tight">
        Professional fee estimate
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
        Indicative professional fees for registered migration agent services
        only. Fees vary with complexity and are confirmed in a written costs
        agreement before work begins. These figures are not related to visa
        outcomes and are not Department of Home Affairs charges.
      </p>

      {bands.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          Fee bands are not published yet. Please contact us for an estimate
          tailored to your circumstances.
        </p>
      ) : (
        <ul className="mt-10 divide-y divide-border border-y border-border">
          {bands.map((band) => (
            <li
              key={`${band.label}-${band.amountAud}`}
              className="flex flex-wrap items-baseline justify-between gap-2 py-4"
            >
              <span className="font-medium text-foreground">{band.label}</span>
              <span className="font-mono text-sm text-muted-foreground">
                from A${band.amountAud.toLocaleString("en-AU")}
              </span>
            </li>
          ))}
        </ul>
      )}

      <aside
        className="mt-10 rounded-lg border border-border bg-secondary px-5 py-4 text-sm leading-relaxed text-muted-foreground"
        role="note"
      >
        Amity Immigration Services is a registered migration agent (not a law
        firm). This page provides general fee information only and is not
        migration advice for your case. Always confirm current requirements with
        the Department of Home Affairs and discuss your circumstances with a
        registered migration agent.
      </aside>
    </section>
  );
}
