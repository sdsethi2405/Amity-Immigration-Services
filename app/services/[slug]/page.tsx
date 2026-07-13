import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ContentBlockRenderer } from "@/components/shared/content-block-renderer";
import { buttonVariants } from "@/components/ui/button";
import {
  getPublishedServices,
  getServiceBySlug,
} from "@/lib/db/queries";
import { buildBreadcrumbJsonLd } from "@/lib/seo";
import { cn } from "@/lib/utils";

type ServiceDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const services = await getPublishedServices();
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: ServiceDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) {
    return { title: "Service not found" };
  }

  const description =
    service.summary ??
    `${service.title} — registered migration advice from Amity Immigration Services.`;

  return {
    title: service.title,
    description,
    openGraph: {
      title: service.title,
      description,
    },
  };
}

export default async function ServiceDetailPage({
  params,
}: ServiceDetailPageProps) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: service.title, href: `/services/${service.slug}` },
  ]);

  return (
    <>
      <article className="mx-auto max-w-3xl px-4 py-12 md:px-6 lg:py-16">
        <p className="text-sm text-muted-foreground">
          <Link href="/services" className="hover:text-primary">
            Services
          </Link>
          <span aria-hidden className="mx-2">
            /
          </span>
          <span className="text-foreground">{service.title}</span>
        </p>

        <header className="mt-6">
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            {service.title}
          </h1>
          {service.summary ? (
            <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
              {service.summary}
            </p>
          ) : null}
        </header>

        <ContentBlockRenderer blocks={service.body} className="mt-10" />

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-8 sm:flex-row">
          <Link
            href="/contact"
            className={cn(buttonVariants({ size: "lg" }))}
          >
            Book a consultation
          </Link>
          <Link
            href="/services/visa-sub-classes"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            Browse visa sub-classes
          </Link>
        </div>
      </article>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </>
  );
}
