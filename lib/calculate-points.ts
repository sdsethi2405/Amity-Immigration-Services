import {
  POINTS_TABLE,
  type AgeBracket,
  type AustralianEmployment,
  type EducationLevel,
  type EnglishLevel,
  type NominationOption,
  type OverseasEmployment,
  type PartnerOption,
  type PointsTable,
} from "@/lib/points-table";

export type PointsCalculatorInput = {
  age: AgeBracket;
  english: EnglishLevel;
  overseasEmployment: OverseasEmployment;
  australianEmployment: AustralianEmployment;
  education: EducationLevel;
  australianStudy: boolean;
  specialistEducation: boolean;
  communityLanguage: boolean;
  professionalYear: boolean;
  regionalStudy: boolean;
  partner: PartnerOption;
  nomination: NominationOption;
};

export type PointsBreakdownItem = {
  key: string;
  label: string;
  points: number;
  note?: string;
};

export type PointsResult = {
  total: number;
  breakdown: PointsBreakdownItem[];
  meetsEoiMinimum: boolean;
  eoiMinimum: number;
};

/**
 * Pure GSM points scorer.
 *
 * Examples (inline unit-test style):
 *
 * // Employment cap: overseas 15 + Australian 20 = 35 → capped at 20
 * // calculatePoints({ ..., overseasEmployment: "8-10", australianEmployment: "8-10", ... }).breakdown
 * //   finds employment.points === 20
 *
 * // Partner mutually exclusive: skilled (10) beats competent English (5)
 * // If partner were somehow dual-flagged, scoring takes Math.max of applicable values.
 * // With partner: "skilledPartner" → 10
 *
 * // Nomination mutually exclusive: regional 491 (15) vs state 190 (5) — only one applies
 * // nomination: "regional491" → 15; nomination: "state190" → 5
 *
 * // Full profile hand-check:
 * // age 25-32 (30) + superior English (20) + employment capped (20) + bachelor (15)
 * // + Australian study (5) + specialist (10) + NAATI (5) + Pro Year (5) + regional study (5)
 * // + skilled partner (10) + 491 nomination (15) = 140
 */
export function calculatePoints(
  input: PointsCalculatorInput,
  table: PointsTable = POINTS_TABLE,
): PointsResult {
  const breakdown: PointsBreakdownItem[] = [];

  const agePoints = table.age[input.age];
  breakdown.push({ key: "age", label: "Age", points: agePoints });

  const englishPoints = table.english[input.english];
  breakdown.push({
    key: "english",
    label: "English language",
    points: englishPoints,
  });

  const overseasRaw = table.overseasEmployment[input.overseasEmployment];
  const australianRaw = table.australianEmployment[input.australianEmployment];
  const employmentUncapped = overseasRaw + australianRaw;
  const employmentPoints = Math.min(employmentUncapped, table.employmentCap);
  breakdown.push({
    key: "employment",
    label: "Skilled employment (overseas + Australia)",
    points: employmentPoints,
    note:
      employmentUncapped > table.employmentCap
        ? `Combined ${employmentUncapped} capped at ${table.employmentCap}`
        : undefined,
  });

  const educationPoints = table.education[input.education];
  breakdown.push({
    key: "education",
    label: "Educational qualification",
    points: educationPoints,
  });

  const australianStudyPoints = input.australianStudy
    ? table.australianStudy
    : 0;
  breakdown.push({
    key: "australianStudy",
    label: "Australian study requirement",
    points: australianStudyPoints,
  });

  const specialistPoints = input.specialistEducation
    ? table.specialistEducation
    : 0;
  breakdown.push({
    key: "specialistEducation",
    label: "Specialist education qualification (STEM Masters/PhD)",
    points: specialistPoints,
  });

  const communityLanguagePoints = input.communityLanguage
    ? table.communityLanguage
    : 0;
  breakdown.push({
    key: "communityLanguage",
    label: "Credentialled community language (NAATI)",
    points: communityLanguagePoints,
  });

  const professionalYearPoints = input.professionalYear
    ? table.professionalYear
    : 0;
  breakdown.push({
    key: "professionalYear",
    label: "Professional Year in Australia",
    points: professionalYearPoints,
  });

  const regionalStudyPoints = input.regionalStudy ? table.regionalStudy : 0;
  breakdown.push({
    key: "regionalStudy",
    label: "Study in regional Australia",
    points: regionalStudyPoints,
  });

  // Mutually exclusive partner options — take the highest applicable value.
  const partnerCandidates = [table.partner[input.partner]];
  const partnerPoints = Math.max(0, ...partnerCandidates);
  breakdown.push({
    key: "partner",
    label: "Partner / relationship status",
    points: partnerPoints,
  });

  // Mutually exclusive nomination options — 190 (5) and 491 (15) cannot both apply.
  const nominationPoints = table.nomination[input.nomination];
  breakdown.push({
    key: "nomination",
    label: "Nomination / sponsorship",
    points: nominationPoints,
  });

  const total = breakdown.reduce((sum, item) => sum + item.points, 0);
  const eoiMinimum = table.eoiMinimum;

  return {
    total,
    breakdown,
    meetsEoiMinimum: total >= eoiMinimum,
    eoiMinimum,
  };
}
