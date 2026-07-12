/**
 * GSM (General Skilled Migration) indicative points table.
 * Update values here when the Department of Home Affairs changes criteria.
 */

export const POINTS_TABLE = {
  age: {
    "18-24": 25,
    "25-32": 30,
    "33-39": 25,
    "40-44": 15,
    "45+": 0,
  },
  english: {
    competent: 0,
    proficient: 10,
    superior: 20,
  },
  overseasEmployment: {
    "<3": 0,
    "3-4": 5,
    "5-7": 10,
    "8-10": 15,
  },
  australianEmployment: {
    "<1": 0,
    "1-2": 5,
    "3-4": 10,
    "5-7": 15,
    "8-10": 20,
  },
  /** Combined overseas + Australian skilled employment points cannot exceed this. */
  employmentCap: 20,
  education: {
    none: 0,
    doctorate: 20,
    bachelorOrMasters: 15,
    diplomaOrTrade: 10,
  },
  australianStudy: 5,
  specialistEducation: 10,
  communityLanguage: 5,
  professionalYear: 5,
  regionalStudy: 5,
  partner: {
    none: 0,
    skilledPartner: 10,
    competentEnglish: 5,
    singleOrCitizenPr: 10,
  },
  nomination: {
    none: 0,
    state190: 5,
    regional491: 15,
  },
  /** Current minimum points to submit an Expression of Interest (EOI). */
  eoiMinimum: 65,
} as const;

export type AgeBracket = keyof typeof POINTS_TABLE.age;
export type EnglishLevel = keyof typeof POINTS_TABLE.english;
export type OverseasEmployment = keyof typeof POINTS_TABLE.overseasEmployment;
export type AustralianEmployment = keyof typeof POINTS_TABLE.australianEmployment;
export type EducationLevel = keyof typeof POINTS_TABLE.education;
export type PartnerOption = keyof typeof POINTS_TABLE.partner;
export type NominationOption = keyof typeof POINTS_TABLE.nomination;

export const AGE_OPTIONS: { value: AgeBracket; label: string }[] = [
  { value: "18-24", label: "18–24 years (25 pts)" },
  { value: "25-32", label: "25–32 years (30 pts)" },
  { value: "33-39", label: "33–39 years (25 pts)" },
  { value: "40-44", label: "40–44 years (15 pts)" },
  { value: "45+", label: "45 years or older (0 pts)" },
];

export const ENGLISH_OPTIONS: { value: EnglishLevel; label: string }[] = [
  { value: "competent", label: "Competent English (0 pts)" },
  { value: "proficient", label: "Proficient English (10 pts)" },
  { value: "superior", label: "Superior English (20 pts)" },
];

export const OVERSEAS_EMPLOYMENT_OPTIONS: {
  value: OverseasEmployment;
  label: string;
}[] = [
  { value: "<3", label: "Less than 3 years (0 pts)" },
  { value: "3-4", label: "3–4 years (5 pts)" },
  { value: "5-7", label: "5–7 years (10 pts)" },
  { value: "8-10", label: "8–10 years (15 pts)" },
];

export const AUSTRALIAN_EMPLOYMENT_OPTIONS: {
  value: AustralianEmployment;
  label: string;
}[] = [
  { value: "<1", label: "Less than 1 year (0 pts)" },
  { value: "1-2", label: "1–2 years (5 pts)" },
  { value: "3-4", label: "3–4 years (10 pts)" },
  { value: "5-7", label: "5–7 years (15 pts)" },
  { value: "8-10", label: "8–10 years (20 pts)" },
];

export const EDUCATION_OPTIONS: { value: EducationLevel; label: string }[] = [
  { value: "none", label: "None / not claimed (0 pts)" },
  { value: "doctorate", label: "Doctorate (20 pts)" },
  { value: "bachelorOrMasters", label: "Bachelor or Masters (15 pts)" },
  { value: "diplomaOrTrade", label: "Diploma or trade qualification (10 pts)" },
];

export const PARTNER_OPTIONS: { value: PartnerOption; label: string }[] = [
  { value: "none", label: "None / not claimed (0 pts)" },
  {
    value: "skilledPartner",
    label: "Skilled partner (meets skills assessment & age) (10 pts)",
  },
  {
    value: "competentEnglish",
    label: "Partner with competent English only (5 pts)",
  },
  {
    value: "singleOrCitizenPr",
    label:
      "Single, or partner is an Australian citizen / permanent resident (10 pts)",
  },
];

export const NOMINATION_OPTIONS: { value: NominationOption; label: string }[] = [
  { value: "none", label: "None / not claimed (0 pts)" },
  {
    value: "state190",
    label: "State or territory nomination (subclass 190) (5 pts)",
  },
  {
    value: "regional491",
    label:
      "Regional nomination or eligible family sponsorship (subclass 491) (15 pts)",
  },
];

export const POINTS_DISCLAIMER =
  "This calculator gives an indicative estimate only. Points criteria are set by the Department of Home Affairs and change over time. Verify your score with the official points calculator and seek professional advice before relying on any result.";
