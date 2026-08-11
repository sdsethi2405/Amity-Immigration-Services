type GoogleReviewsEmbedProps = {
  embedUrl: string;
};

export function GoogleReviewsEmbed({ embedUrl }: GoogleReviewsEmbedProps) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-12 md:px-6">
      <h2 className="font-heading text-2xl font-semibold tracking-tight">
        Client reviews
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Reviews hosted by Google. Individual experiences vary.
      </p>
      <div className="mt-6 overflow-hidden rounded-lg border border-border">
        <iframe
          title="Google reviews"
          src={embedUrl}
          className="h-[480px] w-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </section>
  );
}
