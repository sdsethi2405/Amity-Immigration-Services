"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  createServiceAction,
  updateServiceAction,
} from "@/actions/services";
import { PageBlocksEditor } from "@/components/admin/page-blocks-editor";
import { PublishToggle } from "@/components/admin/publish-toggle";
import { TeamSelect, type TeamOption } from "@/components/admin/team-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Service } from "@/lib/db/queries";
import type { ContentBlockInput } from "@/lib/schemas/content-blocks";
import {
  serviceCreateSchema,
  serviceUpdateSchema,
} from "@/lib/schemas/services";

type ServiceFormProps = {
  mode: "create" | "edit";
  csrfToken: string;
  teams: TeamOption[];
  canPublish: boolean;
  service?: Service;
  defaultTeamId: string;
};

type ServiceFormValues = {
  csrfToken: string;
  id?: string;
  title: string;
  slug: string;
  summary: string;
  body: ContentBlockInput[];
  icon: string;
  sort_order: number;
  is_published: boolean;
  team_id: string;
};

export function ServiceForm({
  mode,
  csrfToken,
  teams,
  canPublish,
  service,
  defaultTeamId,
}: ServiceFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [blocks, setBlocks] = useState<ContentBlockInput[]>(
    (service?.body as ContentBlockInput[] | undefined) ?? [],
  );

  const schema = mode === "create" ? serviceCreateSchema : serviceUpdateSchema;

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<ServiceFormValues>({
    // Create/update schemas differ by optional `id`; cast keeps one form component.
    resolver: zodResolver(schema) as never,
    defaultValues: {
      csrfToken,
      ...(mode === "edit" && service ? { id: service.id } : {}),
      title: service?.title ?? "",
      slug: service?.slug ?? "",
      summary: service?.summary ?? "",
      body: (service?.body as ContentBlockInput[] | undefined) ?? [],
      icon: service?.icon ?? "",
      sort_order: service?.sort_order ?? 0,
      is_published: service?.is_published ?? false,
      team_id: service?.team_id ?? defaultTeamId,
    },
  });

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const payload = {
        ...values,
        summary: values.summary || null,
        icon: values.icon || null,
        body: blocks,
        is_published: canPublish ? values.is_published : false,
      };

      if (mode === "create") {
        const result = await createServiceAction(payload);
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        toast.success("Service created");
        router.push(`/admin/services/${result.data?.id}`);
        router.refresh();
        return;
      }

      const result = await updateServiceAction({
        ...payload,
        id: service!.id,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Service saved");
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
          <Label htmlFor="sort_order">Sort order</Label>
          <Input
            id="sort_order"
            type="number"
            min={0}
            {...register("sort_order")}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="summary">Summary</Label>
          <Textarea id="summary" rows={3} {...register("summary")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="icon">Icon name</Label>
          <Input id="icon" placeholder="e.g. Briefcase" {...register("icon")} />
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
              ? "Create service"
              : "Save service"}
        </Button>
      </div>
    </form>
  );
}
