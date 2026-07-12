import { z } from "zod";

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

const ageValues = Object.keys(POINTS_TABLE.age) as [AgeBracket, ...AgeBracket[]];
const englishValues = Object.keys(POINTS_TABLE.english) as [
  EnglishLevel,
  ...EnglishLevel[],
];
const overseasValues = Object.keys(POINTS_TABLE.overseasEmployment) as [
  OverseasEmployment,
  ...OverseasEmployment[],
];
const australianValues = Object.keys(POINTS_TABLE.australianEmployment) as [
  AustralianEmployment,
  ...AustralianEmployment[],
];
const educationValues = Object.keys(POINTS_TABLE.education) as [
  EducationLevel,
  ...EducationLevel[],
];
const partnerValues = Object.keys(POINTS_TABLE.partner) as [
  PartnerOption,
  ...PartnerOption[],
];
const nominationValues = Object.keys(POINTS_TABLE.nomination) as [
  NominationOption,
  ...NominationOption[],
];

export const pointsCalculatorSchema = z.object({
  age: z.enum(ageValues),
  english: z.enum(englishValues),
  overseasEmployment: z.enum(overseasValues),
  australianEmployment: z.enum(australianValues),
  education: z.enum(educationValues),
  australianStudy: z.boolean(),
  specialistEducation: z.boolean(),
  communityLanguage: z.boolean(),
  professionalYear: z.boolean(),
  regionalStudy: z.boolean(),
  partner: z.enum(partnerValues),
  nomination: z.enum(nominationValues),
});

export type PointsCalculatorFormValues = z.infer<typeof pointsCalculatorSchema>;

export const POINTS_CALCULATOR_DEFAULTS: PointsCalculatorFormValues = {
  age: "25-32",
  english: "competent",
  overseasEmployment: "<3",
  australianEmployment: "<1",
  education: "none",
  australianStudy: false,
  specialistEducation: false,
  communityLanguage: false,
  professionalYear: false,
  regionalStudy: false,
  partner: "none",
  nomination: "none",
};
