"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Answers = {
  goal: string;
  location: string;
  english: string;
  skilledOccupation: string;
  familyTies: string;
};

const STEPS: Array<{
  key: keyof Answers;
  question: string;
  options: Array<{ value: string; label: string }>;
}> = [
  {
    key: "goal",
    question: "What is your primary goal?",
    options: [
      { value: "work", label: "Work / skilled migration" },
      { value: "study", label: "Study in Australia" },
      { value: "family", label: "Join family / partner" },
      { value: "visit", label: "Visit temporarily" },
      { value: "business", label: "Business / investment" },
    ],
  },
  {
    key: "location",
    question: "Where are you currently based?",
    options: [
      { value: "onshore", label: "In Australia" },
      { value: "offshore", label: "Outside Australia" },
    ],
  },
  {
    key: "english",
    question: "How would you describe your English readiness for visa tests?",
    options: [
      { value: "ready", label: "Ready or already tested" },
      { value: "working", label: "Working toward a score" },
      { value: "unsure", label: "Not sure yet" },
    ],
  },
  {
    key: "skilledOccupation",
    question: "Is your occupation on a skilled occupation list (or likely to be)?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "unsure", label: "Not sure" },
    ],
  },
  {
    key: "familyTies",
    question: "Do you have an Australian citizen or permanent resident partner/family sponsor?",
    options: [
      { value: "partner", label: "Partner / spouse" },
      { value: "other", label: "Other family sponsor" },
      { value: "none", label: "No" },
    ],
  },
];

function suggestPathway(answers: Answers): {
  title: string;
  body: string;
  interest: string;
} {
  if (answers.goal === "family" || answers.familyTies === "partner") {
    return {
      title: "Partner / family pathways to explore",
      body: "Partner and family visas focus on relationship evidence and sponsorship eligibility. Criteria change; a registered migration agent can map which subclass may fit after reviewing your documents.",
      interest: "Partner / family visa",
    };
  }

  if (answers.goal === "study") {
    return {
      title: "Student pathway considerations",
      body: "Student visas centre on genuine temporary entrant criteria, enrolment, and financial capacity. This is general information only — confirm course and visa settings with official sources.",
      interest: "Student visa",
    };
  }

  if (answers.goal === "visit") {
    return {
      title: "Visitor pathway considerations",
      body: "Visitor visas are for short stays. Eligibility depends on purpose of visit and personal circumstances. Always check current Home Affairs guidance.",
      interest: "Visitor visa",
    };
  }

  if (answers.goal === "business") {
    return {
      title: "Business / investment pathways to explore",
      body: "Business and investment visas have specific capital, experience, and nomination requirements. Outcomes are never assured; professional assessment is recommended.",
      interest: "Business / investment visa",
    };
  }

  if (
    answers.goal === "work" &&
    (answers.skilledOccupation === "yes" || answers.english === "ready")
  ) {
    return {
      title: "Skilled / employer pathways to explore",
      body: "Skilled migration often involves points tests, skills assessment, and state or employer nomination. Your location (onshore vs offshore) can affect options. This quiz does not assess eligibility.",
      interest: "Skilled / employer sponsored visa",
    };
  }

  return {
    title: "Several pathways may be relevant",
    body: "Based on your answers, more than one visa stream could be worth discussing. A consultation with a registered migration agent can clarify which options match your circumstances — without promising outcomes.",
    interest: "General migration enquiry",
  };
}

export function VisaQuizForm() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({
    goal: "",
    location: "",
    english: "",
    skilledOccupation: "",
    familyTies: "",
  });
  const [finished, setFinished] = useState(false);

  const current = STEPS[step];
  const suggestion = useMemo(
    () => (finished ? suggestPathway(answers) : null),
    [finished, answers],
  );

  function select(value: string) {
    if (!current) return;
    const next = { ...answers, [current.key]: value };
    setAnswers(next);

    if (step >= STEPS.length - 1) {
      setFinished(true);
      return;
    }
    setStep((s) => s + 1);
  }

  if (finished && suggestion) {
    const contactHref = `/contact?visa_interest=${encodeURIComponent(suggestion.interest)}`;

    return (
      <div className="space-y-6">
        <h2 className="font-heading text-2xl font-semibold">{suggestion.title}</h2>
        <p className="text-base leading-relaxed text-muted-foreground">
          {suggestion.body}
        </p>
        <aside
          className="rounded-lg border border-border bg-secondary px-5 py-4 text-sm leading-relaxed text-muted-foreground"
          role="note"
        >
          This tool provides general information only. It is not a visa
          assessment, not legal advice, and not a prediction of any outcome.
          Amity Immigration Services is a registered migration agent, not a law
          firm. Always verify requirements with the Department of Home Affairs.
        </aside>
        <div className="flex flex-wrap gap-3">
          <Link href={contactHref} className={cn(buttonVariants())}>
            Contact us about this pathway
          </Link>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setFinished(false);
              setStep(0);
              setAnswers({
                goal: "",
                location: "",
                english: "",
                skilledOccupation: "",
                familyTies: "",
              });
            }}
          >
            Start again
          </Button>
        </div>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Step {step + 1} of {STEPS.length}
      </p>
      <fieldset>
        <legend className="font-heading text-2xl font-semibold text-foreground">
          {current.question}
        </legend>
        <div className="mt-4 grid gap-2">
          {current.options.map((option) => (
            <button
              key={option.value}
              type="button"
              className="rounded-lg border border-border px-4 py-3 text-left text-sm font-medium hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => select(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </fieldset>
      {step > 0 ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep((s) => s - 1)}
        >
          Back
        </Button>
      ) : null}
    </div>
  );
}
