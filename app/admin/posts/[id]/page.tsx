import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { PostForm } from "@/components/admin/post-form";
import { getCsrfTokenForForms } from "@/lib/admin/csrf";
import {
  getScopedTeamsForAdmin,
  teamsToOptions,
} from "@/lib/admin/teams";
import { ROLE_LEVEL } from "@/lib/auth/constants";
import { getCurrentAdmin } from "@/lib/auth/session";
import { adminGetPostById } from "@/lib/db/admin-queries";
import { getAccessibleScopes } from "@/lib/db/queries";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Edit post · Admin",
  robots: { index: false, follow: false },
};

export default async function AdminEditPostPage({ params }: PageProps) {
  const { id } = await params;
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const post = await adminGetPostById(id);
  if (!post) notFound();

  const scopes = await getAccessibleScopes(admin.id);
  if (!post.team_id || !scopes.includes(post.team_id)) {
    notFound();
  }

  const [csrfToken, teams] = await Promise.all([
    getCsrfTokenForForms(),
    getScopedTeamsForAdmin(admin.id),
  ]);

  return (
    <div className="space-y-6">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/admin/posts"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Posts
        </Link>
        <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight">
          Edit post
        </h1>
      </div>

      <PostForm
        mode="edit"
        post={post}
        csrfToken={csrfToken}
        teams={teamsToOptions(teams)}
        canPublish={admin.role.level >= ROLE_LEVEL.EDITOR}
        defaultTeamId={post.team_id}
      />
    </div>
  );
}
