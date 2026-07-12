"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { updatePageAction } from "@/actions/pages";
import { PageBlocksEditor } from "@/components/admin/page-blocks-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Page } from "@/lib/db/queries";
import type { ContentBlockInput } from "@/lib/schemas/content-blocks";
import {
  pageUpdateSchema,
  type PageUpdateInput,
} from "@/lib/schemas/pages";

type PageFormProps = {
  page: Page;
  csrfToken: string;
};

export function PageForm({ page, csrfToken }: PageFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [blocks, setBlocks] = useState<ContentBlockInput[]>(
    page.blocks as ContentBlockInput[],
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PageUpdateInput>({
    resolver: zodResolver(pageUpdateSchema) as never,
    defaultValues: {
      csrfToken,
      id: page.id,
      title: page.title,
      meta_title: page.meta_title ?? "",
      meta_description: page.meta_description ?? "",
      blocks: page.blocks as ContentBlockInput[],
    },
  });

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const result = await updatePageAction({
        ...values,
        meta_title: values.meta_title || null,
        meta_description: values.meta_description || null,
        blocks,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Page saved");
      router.refresh();
    });
  });

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-3xl space-y-6" noValidate>
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          aria-invalid={Boolean(errors.title)}
          {...register("title")}
        />
        {errors.title ? (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" value={page.slug} disabled readOnly />
        <p className="text-xs text-muted-foreground">
          Slugs are fixed for seeded pages.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="meta_title">Meta title</Label>
        <Input id="meta_title" {...register("meta_title")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="meta_description">Meta description</Label>
        <Textarea
          id="meta_description"
          rows={3}
          {...register("meta_description")}
        />
      </div>

      <PageBlocksEditor
        initialBlocks={blocks}
        onChange={(next) => {
          setBlocks(next);
          setValue("blocks", next, { shouldDirty: true });
        }}
      />

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : "Save page"}
        </Button>
      </div>
    </form>
  );
}
