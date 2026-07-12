"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { calculatePoints } from "@/lib/calculate-points";
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";
import {
  AGE_OPTIONS,
  AUSTRALIAN_EMPLOYMENT_OPTIONS,
  EDUCATION_OPTIONS,
  ENGLISH_OPTIONS,
  NOMINATION_OPTIONS,
  OVERSEAS_EMPLOYMENT_OPTIONS,
  PARTNER_OPTIONS,
  POINTS_DISCLAIMER,
} from "@/lib/points-table";
import {
  POINTS_CALCULATOR_DEFAULTS,
  pointsCalculatorSchema,
  type PointsCalculatorFormValues,
} from "@/lib/schemas/points-calculator";
import { cn } from "@/lib/utils";

type CategoryPanelProps = {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
};

function CategoryPanel({ title, open, onToggle, children }: CategoryPanelProps) {
  const panelId = useId();
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 py-4 text-left"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <span className="font-heading text-lg font-semibold text-foreground">
          {title}
        </span>
        <ChevronDown
          className={cn(
            "size-5 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={panelId}
            key="content"
            initial={
              prefersReducedMotion
                ? false
                : { height: 0, opacity: 0 }
            }
            animate={{ height: "auto", opacity: 1 }}
            exit={
              prefersReducedMotion
                ? undefined
                : { height: 0, opacity: 0 }
            }
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { duration: 0.2, ease: "easeOut" }
            }
            className="overflow-hidden"
          >
            <div className="space-y-4 pb-5">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function SelectField({
  id,
  label,
  error,
  children,
  ...props
}: React.ComponentProps<"select"> & {
  label: string;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <select
        id={id}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
        {...props}
      >
        {children}
      </select>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

function CheckboxField({
  id,
  label,
  ...props
}: React.ComponentProps<"input"> & { label: string }) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-3 rounded-md border border-border px-3 py-3 text-sm hover:bg-secondary"
    >
      <input
        id={id}
        type="checkbox"
        className="mt-0.5 size-4 accent-primary"
        {...props}
      />
      <span className="text-foreground">{label}</span>
    </label>
  );
}

function AnimatedTotal({ value }: { value: number }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const motionValue = useMotionValue(value);
  const spring = useSpring(motionValue, { stiffness: 120, damping: 20 });
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplay(value);
      motionValue.set(value);
      return;
    }
    motionValue.set(value);
  }, [value, prefersReducedMotion, motionValue]);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const unsubscribe = spring.on("change", (latest) => {
      setDisplay(Math.round(latest));
    });
    return unsubscribe;
  }, [spring, prefersReducedMotion]);

  return (
    <span className="font-heading text-5xl font-semibold tabular-nums text-foreground md:text-6xl">
      {display}
    </span>
  );
}

function Disclaimer() {
  return (
    <aside
      className="rounded-lg border border-border bg-secondary px-4 py-3 text-sm leading-relaxed text-muted-foreground"
      role="note"
    >
      {POINTS_DISCLAIMER}
    </aside>
  );
}

export function PointsCalculatorSection() {
  const [openPanels, setOpenPanels] = useState({
    personal: true,
    employment: true,
    education: false,
    other: false,
    partner: false,
    nomination: false,
  });

  const {
    register,
    control,
    formState: { errors },
  } = useForm<PointsCalculatorFormValues>({
    resolver: zodResolver(pointsCalculatorSchema),
    defaultValues: POINTS_CALCULATOR_DEFAULTS,
    mode: "onChange",
  });

  const values = useWatch({ control }) as PointsCalculatorFormValues;
  const result = calculatePoints(values);

  function togglePanel(key: keyof typeof openPanels) {
    setOpenPanels((current) => ({ ...current, [key]: !current[key] }));
  }

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
        <header className="max-w-3xl">
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            Points calculator
          </h1>
          <p className="mt-4 text-base text-muted-foreground md:text-lg">
            An indicative estimate of General Skilled Migration points for
            subclasses such as 189, 190, and 491. Adjust each category to see
            your live total and breakdown.
          </p>
        </header>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <form
            className="rounded-lg border border-border bg-card px-4 md:px-6"
            noValidate
            onSubmit={(event) => event.preventDefault()}
          >
            <CategoryPanel
              title="Age & English"
              open={openPanels.personal}
              onToggle={() => togglePanel("personal")}
            >
              <SelectField
                id="age"
                label="Age"
                error={errors.age?.message}
                {...register("age")}
              >
                {AGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </SelectField>

              <SelectField
                id="english"
                label="English language ability"
                error={errors.english?.message}
                {...register("english")}
              >
                {ENGLISH_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </SelectField>
            </CategoryPanel>

            <CategoryPanel
              title="Skilled employment"
              open={openPanels.employment}
              onToggle={() => togglePanel("employment")}
            >
              <p className="text-sm text-muted-foreground">
                Overseas and Australian skilled employment points are combined
                and capped at 20.
              </p>
              <SelectField
                id="overseasEmployment"
                label="Skilled employment outside Australia (last 10 years)"
                error={errors.overseasEmployment?.message}
                {...register("overseasEmployment")}
              >
                {OVERSEAS_EMPLOYMENT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </SelectField>
              <SelectField
                id="australianEmployment"
                label="Skilled employment in Australia (last 10 years)"
                error={errors.australianEmployment?.message}
                {...register("australianEmployment")}
              >
                {AUSTRALIAN_EMPLOYMENT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </SelectField>
            </CategoryPanel>

            <CategoryPanel
              title="Education"
              open={openPanels.education}
              onToggle={() => togglePanel("education")}
            >
              <SelectField
                id="education"
                label="Highest relevant educational qualification"
                error={errors.education?.message}
                {...register("education")}
              >
                {EDUCATION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </SelectField>
              <CheckboxField
                id="australianStudy"
                label="Australian study requirement met (+5)"
                {...register("australianStudy")}
              />
              <CheckboxField
                id="specialistEducation"
                label="Specialist education qualification — STEM Masters/PhD (+10)"
                {...register("specialistEducation")}
              />
              <CheckboxField
                id="regionalStudy"
                label="Study in regional Australia (+5)"
                {...register("regionalStudy")}
              />
            </CategoryPanel>

            <CategoryPanel
              title="Other points"
              open={openPanels.other}
              onToggle={() => togglePanel("other")}
            >
              <CheckboxField
                id="communityLanguage"
                label="Credentialled community language / NAATI (+5)"
                {...register("communityLanguage")}
              />
              <CheckboxField
                id="professionalYear"
                label="Professional Year in Australia (+5)"
                {...register("professionalYear")}
              />
            </CategoryPanel>

            <CategoryPanel
              title="Partner"
              open={openPanels.partner}
              onToggle={() => togglePanel("partner")}
            >
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium text-foreground">
                  Partner status (choose one)
                </legend>
                {PARTNER_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className="flex cursor-pointer items-start gap-3 rounded-md border border-border px-3 py-3 text-sm hover:bg-secondary"
                  >
                    <input
                      type="radio"
                      value={option.value}
                      className="mt-0.5 size-4 accent-primary"
                      {...register("partner")}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </fieldset>
            </CategoryPanel>

            <CategoryPanel
              title="Nomination"
              open={openPanels.nomination}
              onToggle={() => togglePanel("nomination")}
            >
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium text-foreground">
                  Nomination or sponsorship (choose one)
                </legend>
                {NOMINATION_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className="flex cursor-pointer items-start gap-3 rounded-md border border-border px-3 py-3 text-sm hover:bg-secondary"
                  >
                    <input
                      type="radio"
                      value={option.value}
                      className="mt-0.5 size-4 accent-primary"
                      {...register("nomination")}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </fieldset>
            </CategoryPanel>
          </form>

          <div className="space-y-4 lg:sticky lg:top-24">
            <Disclaimer />

            <div
              className="rounded-lg border border-border bg-card p-6"
              aria-live="polite"
            >
              <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
                Indicative total
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <AnimatedTotal value={result.total} />
                <span className="text-sm text-muted-foreground">points</span>
              </div>

              <p className="mt-4 text-sm text-muted-foreground">
                {result.meetsEoiMinimum
                  ? `Meets the current minimum (${result.eoiMinimum} points) to submit an Expression of Interest (EOI). This does not mean you are eligible for a visa invitation or grant.`
                  : `Below the current minimum (${result.eoiMinimum} points) to submit an Expression of Interest (EOI).`}
              </p>

              <h2 className="mt-8 font-heading text-lg font-semibold text-foreground">
                Breakdown
              </h2>
              <ul className="mt-3 divide-y divide-border border-t border-border">
                {result.breakdown.map((item) => (
                  <li
                    key={item.key}
                    className="flex items-start justify-between gap-4 py-3 text-sm"
                  >
                    <div>
                      <p className="text-foreground">{item.label}</p>
                      {item.note ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {item.note}
                        </p>
                      ) : null}
                    </div>
                    <span className="shrink-0 font-medium tabular-nums text-foreground">
                      {item.points}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <Disclaimer />
          </div>
        </div>
      </div>
    </section>
  );
}
