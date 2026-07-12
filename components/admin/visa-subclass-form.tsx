"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  createVisaSubclassAction,
  updateVisaSubclassAction,
} from "@/actions/visa-subclasses";
import { PageBlocksEditor } from "@/components/admin/page-blocks-editor";
import { PublishToggle } from "@/components/admin/publish-toggle";
import { TeamSelect, type TeamOption } from "@/components/admin/team-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { VisaSubclass } from "@/lib/db/queries";
import type { ContentBlockInput } from "@/lib/schemas/content-blocks";
import {
  visaSubclassCreateSchema,
  visaSubclassUpdateSchema,
} from "@/lib/schemas/visa-subclasses";

const STREAMS = [
  "skilled",
  "employer",
  "family",
  "student",
  "business",
  "visitor",
  "humanitarian",
  "bridging",
  "other",
] as const;

const STATUSES = ["active", "closing", "closed", "replaced"] as const;

type VisaSubclassFormProps = {
  mode: "create" | "edit";
  csrfToken: string;
  teams: TeamOption[];
  canPublish: boolean;
  visa?: VisaSubclass;
  defaultTeamId: string;
};

type FormValues = {
  csrfToken: string;
  id?: string;
  subclass_number: string;
  name: string;
  slug: string;
  stream: (typeof STREAMS)[number];
  visa_type: "temporary" | "permanent";
  pr_pathway: boolean;
  status: (typeof STATUSES)[number];
  eligibility_summary: string;
  body: ContentBlockInput[];
  processing_context: string;
  sort_order: number;
  is_published: boolean;
  team_id: string;
};

export function VisaSubclassForm({
  mode,
  csrfToken,
  teams,
  canPublish,
  visa,
  defaultTeamId,
}: VisaSubclassFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [blocks, setBlocks] = useState<ContentBlockInput[]>(
    (visa?.body as ContentBlockInput[] | undefined) ?? [],
  );

  const schema =
    mode === "create" ? visaSubclassCreateSchema : visaSubclassUpdateSchema;

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: {
      csrfToken,
      ...(mode === "edit" && visa ? { id: visa.id } : {}),
      subclass_number: visa?.subclass_number ?? "",
      name: visa?.name ?? "",
      slug: visa?.slug ?? "",
      stream: visa?.stream ?? "skilled",
      visa_type: visa?.visa_type ?? "temporary",
      pr_pathway: visa?.pr_pathway ?? false,
      status: visa?.status ?? "active",
      eligibility_summary: visa?.eligibility_summary ?? "",
      body: (visa?.body as ContentBlockInput[] | undefined) ?? [],
      processing_context: visa?.processing_context ?? "",
      sort_order: visa?.sort_order ?? 0,
      is_published: visa?.is_published ?? false,
      team_id: visa?.team_id ?? defaultTeamId,
    },
  });

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const payload = {
        ...values,
        eligibility_summary: values.eligibility_summary || null,
        processing_context: values.processing_context || null,
        body: blocks,
        is_published: canPublish ? values.is_published : false,
      };

      if (mode === "create") {
        const result = await createVisaSubclassAction(payload);
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        toast.success("Visa subclass created");
        router.push(`/admin/visa-subclasses/${result.data?.id}`);
        router.refresh();
        return;
      }

      const result = await updateVisaSubclassAction({
        ...payload,
        id: visa!.id,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Visa subclass saved");
      router.refresh();
    });
  });

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-3xl space-y-6" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="subclass_number">Subclass number</Label>
          <Input id="subclass_number" {...register("subclass_number")} />
          {errors.subclass_number ? (
            <p className="text-sm text-destructive">
              {errors.subclass_number.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" {...register("slug")} />
          {errors.slug ? (
            <p className="text-sm text-destructive">{errors.slug.message}</p>
          ) : null}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register("name")} />
          {errors.name ? (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="stream">Stream</Label>
          <select
            id="stream"
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            {...register("stream")}
          >
            {STREAMS.map((stream) => (
              <option key={stream} value={stream}>
                {stream}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="visa_type">Visa type</Label>
          <select
            id="visa_type"
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            {...register("visa_type")}
          >
            <option value="temporary">Temporary</option>
            <option value="permanent">Permanent</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            {...register("status")}
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
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

        <div className="flex items-center gap-2 sm:col-span-2">
          <input
            id="pr_pathway"
            type="checkbox"
            className="size-4 rounded border-input accent-primary"
            {...register("pr_pathway")}
          />
          <Label htmlFor="pr_pathway">PR pathway</Label>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="eligibility_summary">Eligibility summary</Label>
          <Textarea
            id="eligibility_summary"
            rows={4}
            {...register("eligibility_summary")}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="processing_context">Processing context</Label>
          <Textarea
            id="processing_context"
            rows={3}
            {...register("processing_context")}
          />
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
              ? "Create visa subclass"
              : "Save visa subclass"}
        </Button>
      </div>
    </form>
  );
}
