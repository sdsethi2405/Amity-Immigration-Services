import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";

import { deletePostAction } from "@/actions/posts";
import { AdminListTable } from "@/components/admin/admin-list-table";
import { DeleteEntityButton } from "@/components/admin/delete-entity-button";
import { buttonVariants } from "@/components/ui/button";
import { getCsrfTokenForForms } from "@/lib/admin/csrf";
import { ROLE_LEVEL } from "@/lib/auth/constants";
import { getCurrentAdmin } from "@/lib/auth/session";
import { adminListPostsForAdmin } from "@/lib/db/admin-queries";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Posts · Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPostsListPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const [posts, csrfToken] = await Promise.all([
    adminListPostsForAdmin(admin.id),
    getCsrfTokenForForms(),
  ]);
  const canDelete = admin.role.level >= ROLE_LEVEL.EDITOR;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Posts
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create and edit blog posts.
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className={cn(buttonVariants(), "inline-flex")}
        >
          <Plus className="size-4" aria-hidden />
          New post
        </Link>
      </div>

      <AdminListTable
        headers={["Title", "Slug", "Published", ""]}
        isEmpty={posts.length === 0}
        emptyMessage="No posts yet."
      >
        {posts.map((post) => (
          <tr key={post.id} className="hover:bg-muted/30">
            <td className="px-3 py-2.5 font-medium">{post.title}</td>
            <td className="px-3 py-2.5 text-muted-foreground">{post.slug}</td>
            <td className="px-3 py-2.5 text-muted-foreground">
              {post.is_published ? "Yes" : "Draft"}
            </td>
            <td className="px-3 py-2.5">
              <div className="flex items-center justify-end gap-2">
                <Link
                  href={`/admin/posts/${post.id}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Edit
                </Link>
                {canDelete ? (
                  <DeleteEntityButton
                    id={post.id}
                    csrfToken={csrfToken}
                    entityLabel="post"
                    deleteAction={deletePostAction}
                  />
                ) : null}
              </div>
            </td>
          </tr>
        ))}
      </AdminListTable>
    </div>
  );
}
