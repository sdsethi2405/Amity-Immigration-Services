"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { createPostAction, updatePostAction } from "@/actions/posts";
import { MediaUploader } from "@/components/admin/media-uploader";
import { PageBlocksEditor } from "@/components/admin/page-blocks-editor";
import { PublishToggle } from "@/components/admin/publish-toggle";
import { TeamSelect, type TeamOption } from "@/components/admin/team-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Post } from "@/lib/db/queries";
import type { ContentBlockInput } from "@/lib/schemas/content-blocks";
import {
  postCreateSchema,
  postUpdateSchema,
} from "@/lib/schemas/posts";

type PostFormProps = {
  mode: "create" | "edit";
  csrfToken: string;
  teams: TeamOption[];
  canPublish: boolean;
  post?: Post;
  defaultTeamId: string;
};

type FormValues = {
  csrfToken: string;
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  body: ContentBlockInput[];
  cover_url: string;
  author_name: string;
  published_at: string | null;
  is_published: boolean;
  team_id: string;
};

function toDatetimeLocalValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromDatetimeLocalValue(value: string): string | null {
  if (!value.trim()) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export function PostForm({
  mode,
  csrfToken,
  teams,
  canPublish,
  post,
  defaultTeamId,
}: PostFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [blocks, setBlocks] = useState<ContentBlockInput[]>(
    (post?.body as ContentBlockInput[] | undefined) ?? [],
  );
  const [publishedLocal, setPublishedLocal] = useState(
    toDatetimeLocalValue(post?.published_at),
  );

  const schema = mode === "create" ? postCreateSchema : postUpdateSchema;

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: {
      csrfToken,
      ...(mode === "edit" && post ? { id: post.id } : {}),
      title: post?.title ?? "",
      slug: post?.slug ?? "",
      excerpt: post?.excerpt ?? "",
      body: (post?.body as ContentBlockInput[] | undefined) ?? [],
      cover_url: post?.cover_url ?? "",
      author_name: post?.author_name ?? "",
      published_at: post?.published_at ?? null,
      is_published: post?.is_published ?? false,
      team_id: post?.team_id ?? defaultTeamId,
    },
  });

  const coverUrl = watch("cover_url");

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const publishedAt = fromDatetimeLocalValue(publishedLocal);

      const payload = {
        ...values,
        excerpt: values.excerpt || null,
        cover_url: values.cover_url || null,
        author_name: values.author_name || null,
        published_at: publishedAt,
        body: blocks,
        is_published: canPublish ? values.is_published : false,
      };

      if (mode === "create") {
        const result = await createPostAction(payload);
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        toast.success("Post created");
        router.push(`/admin/posts/${result.data?.id}`);
        router.refresh();
        return;
      }

      const result = await updatePostAction({
        ...payload,
        id: post!.id,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Post saved");
      router.refresh();
    });
  });

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-3xl space-y-6" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" {...register("title")} />
          {errors.title ? (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" {...register("slug")} />
          {errors.slug ? (
            <p className="text-sm text-destructive">{errors.slug.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="author_name">Author</Label>
          <Input id="author_name" {...register("author_name")} />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="excerpt">Excerpt</Label>
          <Textarea id="excerpt" rows={3} {...register("excerpt")} />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="cover_url">Cover URL</Label>
          <Input id="cover_url" {...register("cover_url")} />
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverUrl}
              alt=""
              className="mt-2 h-32 w-full max-w-md rounded-lg object-cover"
            />
          ) : null}
        </div>

        <div className="sm:col-span-2">
          <MediaUploader
            csrfToken={csrfToken}
            bucket="blog-covers"
            label="Upload cover image"
            onUploaded={({ publicUrl }) => {
              setValue("cover_url", publicUrl, { shouldDirty: true });
            }}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="published_at">Published at</Label>
          <Input
            id="published_at"
            type="datetime-local"
            value={publishedLocal}
            onChange={(event) => setPublishedLocal(event.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Optional. Leave blank to set automatically when publishing.
          </p>
        </div>

        <Controller
          name="team_id"
          control={control}
          render={({ field }) => (
            <TeamSelect
              teams={teams}
              value={field.value}
              onChange={field.onChange}
              error={errors.team_id?.message}
            />
          )}
        />
      </div>

      <Controller
        name="is_published"
        control={control}
        render={({ field }) => (
          <PublishToggle
            checked={field.value}
            onCheckedChange={field.onChange}
            canPublish={canPublish}
          />
        )}
      />

      <PageBlocksEditor
        initialBlocks={blocks}
        onChange={(next) => {
          setBlocks(next);
          setValue("body", next, { shouldDirty: true });
        }}
      />

      <div className="flex justify-end border-t border-border pt-4">
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Saving…"
            : mode === "create"
              ? "Create post"
              : "Save post"}
        </Button>
      </div>
    </form>
  );
}
