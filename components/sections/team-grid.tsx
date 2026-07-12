"use client";

import { motion } from "framer-motion";
import Image from "next/image";

import type { TeamMember } from "@/lib/db/queries";
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";
import { fadeUp, withReducedMotion } from "@/lib/motion";
import { getStoragePublicUrl } from "@/lib/supabase/storage";

type TeamGridSectionProps = {
  members: TeamMember[];
  title?: string;
};

export function TeamGridSection({ members, title }: TeamGridSectionProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const containerVariants = withReducedMotion(
    {
      hidden: {},
      show: {
        transition: { staggerChildren: prefersReducedMotion ? 0 : 0.1 },
      },
    },
    prefersReducedMotion,
  );
  const itemVariants = withReducedMotion(fadeUp, prefersReducedMotion);

  if (members.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-24 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
        {title ? (
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            {title}
          </h2>
        ) : null}

        <motion.ul
          className={title ? "mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3" : "grid gap-8 sm:grid-cols-2 lg:grid-cols-3"}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          {members.map((member) => {
            const photoUrl = getStoragePublicUrl(member.photo_url);

            return (
              <motion.li key={member.id} variants={itemVariants}>
                <article className="group h-full rounded-lg border border-border bg-card p-6">
                  <div className="relative mb-4 aspect-square overflow-hidden rounded-md bg-muted transition-transform duration-300 group-hover:-translate-y-1">
                    {photoUrl ? (
                      <Image
                        src={photoUrl}
                        alt={member.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center font-heading text-3xl text-muted-foreground">
                        {member.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-foreground">
                    {member.name}
                  </h3>
                  {member.role_title ? (
                    <p className="mt-1 text-sm font-medium text-primary">
                      {member.role_title}
                    </p>
                  ) : null}
                  {member.bio ? (
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {member.bio}
                    </p>
                  ) : null}
                </article>
              </motion.li>
            );
          })}
        </motion.ul>
      </div>
    </section>
  );
}
