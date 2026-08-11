import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ContentBlockRenderer } from "@/components/shared/content-block-renderer";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentAdmin } from "@/lib/auth/session";
import { adminGetPostById } from "@/lib/db/admin-queries";
import { getStoragePublicUrl } from "@/lib/supabase/storage";
import { cn } from "@/lib/utils";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Preview post · Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPreviewPostPage({ params }: PageProps) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const { id } = await params;
  const post = await adminGetPostById(id);
  if (!post) notFound();

  const coverUrl = getStoragePublicUrl(post.cover_url);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-border bg-muted/40 px-4 py-3">
        <div>
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Admin preview
          </p>
          <p className="text-sm text-muted-foreground">
            {post.is_published ? "Published" : "Unpublished"} · /blog/{post.slug}
          </p>
        </div>
        <Link
          href={`/admin/posts/${post.id}`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Back to edit
        </Link>
      </div>

      <article>
        <header>
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            {post.title}
          </h1>
          {post.excerpt ? (
            <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
              {post.excerpt}
            </p>
          ) : null}
          {post.author_name ? (
            <p className="mt-2 text-sm text-muted-foreground">
              {post.author_name}
            </p>
          ) : null}
        </header>
        {coverUrl ? (
          <img
            src={coverUrl}
            alt=""
            className="mt-8 w-full rounded-xl border border-border object-cover"
          />
        ) : null}
        <ContentBlockRenderer blocks={post.body} className="mt-10" />
      </article>
    </div>
  );
}
