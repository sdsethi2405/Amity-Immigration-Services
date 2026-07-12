import type { VisaStatus, VisaStream } from "@/lib/db/queries";

const STREAM_LABELS: Record<VisaStream, string> = {
  skilled: "Skilled Migration",
  employer: "Employer Sponsored",
  family: "Family",
  student: "Student/Graduate",
  business: "Business/Investment",
  visitor: "Visitor",
  humanitarian: "Humanitarian",
  bridging: "Bridging",
  other: "Other",
};

const STREAM_ORDER: VisaStream[] = [
  "skilled",
  "employer",
  "family",
  "student",
  "business",
  "visitor",
  "humanitarian",
  "bridging",
  "other",
];

const STATUS_LABELS: Record<Exclude<VisaStatus, "active">, string> = {
  closing: "Closing",
  closed: "Closed",
  replaced: "Replaced",
};

export function getStatusRibbonLabel(
  status: VisaStatus,
): string | null {
  if (status === "active") return null;
  return STATUS_LABELS[status];
}

export function isVisaStream(value: string | undefined | null): value is VisaStream {
  return Boolean(value && value in STREAM_LABELS);
}

export type VisaSubclassNavItem = {
  slug: string;
  name: string;
  subclassNumber: string;
};

export type VisaStreamNavGroup = {
  stream: VisaStream;
  label: string;
  subclasses: VisaSubclassNavItem[];
};

export function getStreamLabel(stream: VisaStream): string {
  return STREAM_LABELS[stream];
}

export { STREAM_ORDER };
