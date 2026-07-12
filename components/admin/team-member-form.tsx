"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  createTeamMemberAction,
  updateTeamMemberAction,
} from "@/actions/team-members";
import { MediaUploader } from "@/components/admin/media-uploader";
import { PublishToggle } from "@/components/admin/publish-toggle";
import { TeamSelect, type TeamOption } from "@/components/admin/team-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { TeamMember } from "@/lib/db/queries";
import {
  teamMemberCreateSchema,
  teamMemberUpdateSchema,
} from "@/lib/schemas/team-members";

type TeamMemberFormProps = {
  mode: "create" | "edit";
  csrfToken: string;
  teams: TeamOption[];
  canPublish: boolean;
  member?: TeamMember;
  defaultTeamId: string;
};

type FormValues = {
  csrfToken: string;
  id?: string;
  name: string;
  role_title: string;
  bio: string;
  photo_url: string;
  sort_order: number;
  is_published: boolean;
  team_id: string;
};

export function TeamMemberForm({
  mode,
  csrfToken,
  teams,
  canPublish,
  member,
  defaultTeamId,
}: TeamMemberFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const schema =
    mode === "create" ? teamMemberCreateSchema : teamMemberUpdateSchema;

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
      ...(mode === "edit" && member ? { id: member.id } : {}),
      name: member?.name ?? "",
      role_title: member?.role_title ?? "",
      bio: member?.bio ?? "",
      photo_url: member?.photo_url ?? "",
      sort_order: member?.sort_order ?? 0,
      is_published: member?.is_published ?? false,
      team_id: member?.team_id ?? defaultTeamId,
    },
  });

  const photoUrl = watch("photo_url");

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const payload = {
        ...values,
        role_title: values.role_title || null,
        bio: values.bio || null,
        photo_url: values.photo_url || null,
        is_published: canPublish ? values.is_published : false,
      };

      if (mode === "create") {
        const result = await createTeamMemberAction(payload);
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        toast.success("Team member created");
        router.push(`/admin/team-members/${result.data?.id}`);
        router.refresh();
        return;
      }

      const result = await updateTeamMemberAction({
        ...payload,
        id: member!.id,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Team member saved");
      router.refresh();
    });
  });

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-3xl space-y-6" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register("name")} />
          {errors.name ? (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="role_title">Role title</Label>
          <Input id="role_title" {...register("role_title")} />
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
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" rows={5} {...register("bio")} />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="photo_url">Photo URL</Label>
          <Input id="photo_url" {...register("photo_url")} />
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt=""
              className="mt-2 size-28 rounded-lg object-cover"
            />
          ) : null}
        </div>

        <div className="sm:col-span-2">
          <MediaUploader
            csrfToken={csrfToken}
            bucket="team-photos"
            label="Upload photo"
            onUploaded={({ publicUrl }) => {
              setValue("photo_url", publicUrl, { shouldDirty: true });
            }}
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

      <div className="flex justify-end border-t border-border pt-4">
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Saving…"
            : mode === "create"
              ? "Create team member"
              : "Save team member"}
        </Button>
      </div>
    </form>
  );
}
