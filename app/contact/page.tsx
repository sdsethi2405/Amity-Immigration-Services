import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Book a consultation with Amity Immigration Services in Bundoora, Melbourne.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <h1 className="font-heading text-4xl font-semibold">Contact</h1>
      {/* TODO(Stage 5): contact-intro, enquiry-form, map-and-details */}
    </div>
  );
}
