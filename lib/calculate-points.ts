import {
  POINTS_TABLE,
  type AgeBracket,
  type AustralianEmployment,
  type EducationLevel,
  type EnglishLevel,
  type NominationOption,
  type OverseasEmployment,
  type PartnerOption,
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
export function calculatePoints(input: PointsCalculatorInput): PointsResult {
  const breakdown: PointsBreakdownItem[] = [];

  const agePoints = POINTS_TABLE.age[input.age];
  breakdown.push({ key: "age", label: "Age", points: agePoints });

  const englishPoints = POINTS_TABLE.english[input.english];
  breakdown.push({
    key: "english",
    label: "English language",
    points: englishPoints,
  });

  const overseasRaw =
    POINTS_TABLE.overseasEmployment[input.overseasEmployment];
  const australianRaw =
    POINTS_TABLE.australianEmployment[input.australianEmployment];
  const employmentUncapped = overseasRaw + australianRaw;
  const employmentPoints = Math.min(
    employmentUncapped,
    POINTS_TABLE.employmentCap,
  );
  breakdown.push({
    key: "employment",
    label: "Skilled employment (overseas + Australia)",
    points: employmentPoints,
    note:
      employmentUncapped > POINTS_TABLE.employmentCap
        ? `Combined ${employmentUncapped} capped at ${POINTS_TABLE.employmentCap}`
        : undefined,
  });

  const educationPoints = POINTS_TABLE.education[input.education];
  breakdown.push({
    key: "education",
    label: "Educational qualification",
    points: educationPoints,
  });

  const australianStudyPoints = input.australianStudy
    ? POINTS_TABLE.australianStudy
    : 0;
  breakdown.push({
    key: "australianStudy",
    label: "Australian study requirement",
    points: australianStudyPoints,
  });

  const specialistPoints = input.specialistEducation
    ? POINTS_TABLE.specialistEducation
    : 0;
  breakdown.push({
    key: "specialistEducation",
    label: "Specialist education qualification (STEM Masters/PhD)",
    points: specialistPoints,
  });

  const communityLanguagePoints = input.communityLanguage
    ? POINTS_TABLE.communityLanguage
    : 0;
  breakdown.push({
    key: "communityLanguage",
    label: "Credentialled community language (NAATI)",
    points: communityLanguagePoints,
  });

  const professionalYearPoints = input.professionalYear
    ? POINTS_TABLE.professionalYear
    : 0;
  breakdown.push({
    key: "professionalYear",
    label: "Professional Year in Australia",
    points: professionalYearPoints,
  });

  const regionalStudyPoints = input.regionalStudy
    ? POINTS_TABLE.regionalStudy
    : 0;
  breakdown.push({
    key: "regionalStudy",
    label: "Study in regional Australia",
    points: regionalStudyPoints,
  });

  // Mutually exclusive partner options — take the highest applicable value.
  const partnerCandidates = [
    POINTS_TABLE.partner[input.partner],
  ];
  const partnerPoints = Math.max(0, ...partnerCandidates);
  breakdown.push({
    key: "partner",
    label: "Partner / relationship status",
    points: partnerPoints,
  });

  // Mutually exclusive nomination options — 190 (5) and 491 (15) cannot both apply.
  const nominationPoints = POINTS_TABLE.nomination[input.nomination];
  breakdown.push({
    key: "nomination",
    label: "Nomination / sponsorship",
    points: nominationPoints,
  });

  const total = breakdown.reduce((sum, item) => sum + item.points, 0);
  const eoiMinimum = POINTS_TABLE.eoiMinimum;

  return {
    total,
    breakdown,
    meetsEoiMinimum: total >= eoiMinimum,
    eoiMinimum,
  };
}
