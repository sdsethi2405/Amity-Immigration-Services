import type { ContactDetails } from "@/lib/db/queries";

type MapAndDetailsSectionProps = {
  contact: ContactDetails | null;
};

const DEFAULT_ADDRESS = "59 Settlement Road, Bundoora VIC 3083";

export function MapAndDetailsSection({ contact }: MapAndDetailsSectionProps) {
  const address = contact?.address ?? DEFAULT_ADDRESS;
  const phone = contact?.phone;
  const email = contact?.email;
  const officeHours = contact?.office_hours;
  const mapEmbedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

  if (!address && !phone && !email && !officeHours) {
    return null;
  }

  return (
    <section className="border-t border-border bg-secondary py-16 md:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-2 md:px-6 lg:px-8">
        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground md:text-3xl">
            Visit our office
          </h2>
          <address className="mt-6 space-y-3 text-sm not-italic text-muted-foreground md:text-base">
            {address ? <p>{address}</p> : null}
            {phone ? (
              <p>
                <span className="text-foreground">Phone:</span>{" "}
                <a href={`tel:${phone.replace(/\s/g, "")}`} className="hover:text-primary">
                  {phone}
                </a>
              </p>
            ) : null}
            {email ? (
              <p>
                <span className="text-foreground">Email:</span>{" "}
                <a href={`mailto:${email}`} className="hover:text-primary">
                  {email}
                </a>
              </p>
            ) : null}
            {officeHours ? (
              <p>
                <span className="text-foreground">Hours:</span> {officeHours}
              </p>
            ) : null}
          </address>
        </div>

        <div className="overflow-hidden rounded-lg border border-border">
          <iframe
            title="Amity Immigration Services office location"
            src={mapEmbedSrc}
            className="aspect-square w-full md:aspect-video"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}
