"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AGE_OPTIONS,
  AUSTRALIAN_EMPLOYMENT_OPTIONS,
  EDUCATION_OPTIONS,
  ENGLISH_OPTIONS,
  NOMINATION_OPTIONS,
  OVERSEAS_EMPLOYMENT_OPTIONS,
  PARTNER_OPTIONS,
  type PointsTable,
} from "@/lib/points-table";

type PointsTableFieldsProps = {
  value: PointsTable;
  onChange: (next: PointsTable) => void;
};

function stripPts(label: string): string {
  return label.replace(/\s*\(\d+\s*pts\)\s*$/i, "").trim();
}

function NumberField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        inputMode="numeric"
        min={0}
        max={200}
        step={1}
        value={Number.isFinite(value) ? value : 0}
        onChange={(event) => {
          const raw = event.target.value;
          if (raw === "") {
            onChange(0);
            return;
          }
          const next = Number.parseInt(raw, 10);
          if (Number.isFinite(next)) onChange(next);
        }}
      />
    </div>
  );
}

function GroupSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3 rounded-lg border border-border/80 bg-muted/20 p-3">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </div>
  );
}

export function PointsTableFields({ value, onChange }: PointsTableFieldsProps) {
  function patch(partial: Partial<PointsTable>) {
    onChange({ ...value, ...partial });
  }

  function patchGroup<K extends keyof PointsTable>(
    key: K,
    groupKey: string,
    points: number,
  ) {
    const group = value[key];
    if (typeof group !== "object" || group === null) return;
    patch({
      [key]: { ...(group as Record<string, number>), [groupKey]: points },
    } as Partial<PointsTable>);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        These numbers appear on the public points calculator. Enter whole
        numbers only. Leave a criterion at 0 if it awards no points.
      </p>

      <GroupSection title="Age">
        {AGE_OPTIONS.map((option) => (
          <NumberField
            key={option.value}
            id={`points-age-${option.value}`}
            label={stripPts(option.label)}
            value={value.age[option.value]}
            onChange={(n) => patchGroup("age", option.value, n)}
          />
        ))}
      </GroupSection>

      <GroupSection title="English">
        {ENGLISH_OPTIONS.map((option) => (
          <NumberField
            key={option.value}
            id={`points-english-${option.value}`}
            label={stripPts(option.label)}
            value={value.english[option.value]}
            onChange={(n) => patchGroup("english", option.value, n)}
          />
        ))}
      </GroupSection>

      <GroupSection title="Overseas employment">
        {OVERSEAS_EMPLOYMENT_OPTIONS.map((option) => (
          <NumberField
            key={option.value}
            id={`points-overseas-${option.value}`}
            label={stripPts(option.label)}
            value={value.overseasEmployment[option.value]}
            onChange={(n) => patchGroup("overseasEmployment", option.value, n)}
          />
        ))}
      </GroupSection>

      <GroupSection title="Australian employment">
        {AUSTRALIAN_EMPLOYMENT_OPTIONS.map((option) => (
          <NumberField
            key={option.value}
            id={`points-aus-emp-${option.value}`}
            label={stripPts(option.label)}
            value={value.australianEmployment[option.value]}
            onChange={(n) =>
              patchGroup("australianEmployment", option.value, n)
            }
          />
        ))}
      </GroupSection>

      <GroupSection title="Education">
        {EDUCATION_OPTIONS.map((option) => (
          <NumberField
            key={option.value}
            id={`points-edu-${option.value}`}
            label={stripPts(option.label)}
            value={value.education[option.value]}
            onChange={(n) => patchGroup("education", option.value, n)}
          />
        ))}
      </GroupSection>

      <GroupSection title="Extra study and skills">
        <NumberField
          id="points-australian-study"
          label="Australian study requirement"
          value={value.australianStudy}
          onChange={(n) => patch({ australianStudy: n })}
        />
        <NumberField
          id="points-specialist-education"
          label="Specialist education"
          value={value.specialistEducation}
          onChange={(n) => patch({ specialistEducation: n })}
        />
        <NumberField
          id="points-community-language"
          label="Credentialed community language"
          value={value.communityLanguage}
          onChange={(n) => patch({ communityLanguage: n })}
        />
        <NumberField
          id="points-professional-year"
          label="Professional year"
          value={value.professionalYear}
          onChange={(n) => patch({ professionalYear: n })}
        />
        <NumberField
          id="points-regional-study"
          label="Regional study"
          value={value.regionalStudy}
          onChange={(n) => patch({ regionalStudy: n })}
        />
      </GroupSection>

      <GroupSection title="Partner">
        {PARTNER_OPTIONS.map((option) => (
          <NumberField
            key={option.value}
            id={`points-partner-${option.value}`}
            label={stripPts(option.label)}
            value={value.partner[option.value]}
            onChange={(n) => patchGroup("partner", option.value, n)}
          />
        ))}
      </GroupSection>

      <GroupSection title="Nomination">
        {NOMINATION_OPTIONS.map((option) => (
          <NumberField
            key={option.value}
            id={`points-nomination-${option.value}`}
            label={stripPts(option.label)}
            value={value.nomination[option.value]}
            onChange={(n) => patchGroup("nomination", option.value, n)}
          />
        ))}
      </GroupSection>

      <GroupSection title="Caps and minimums">
        <NumberField
          id="points-employment-cap"
          label="Employment points cap (overseas + Australian combined)"
          value={value.employmentCap}
          onChange={(n) => patch({ employmentCap: n })}
        />
        <NumberField
          id="points-eoi-minimum"
          label="EOI minimum points"
          value={value.eoiMinimum}
          onChange={(n) => patch({ eoiMinimum: n })}
        />
      </GroupSection>
    </div>
  );
}
