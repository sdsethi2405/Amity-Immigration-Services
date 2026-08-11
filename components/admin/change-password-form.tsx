"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { changePasswordAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  changePasswordSchema,
  type ChangePasswordInput,
} from "@/lib/schemas/auth";

type ChangePasswordFormProps = {
  csrfToken: string;
};

export function ChangePasswordForm({ csrfToken }: ChangePasswordFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      csrfToken,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = handleSubmit((values) => {
    setError(null);
    startTransition(async () => {
      const result = await changePasswordAction({ ...values, csrfToken });
      if (!result.success) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success("Password updated");
      reset({
        csrfToken,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    });
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit(event);
      }}
      className="space-y-4"
      noValidate
    >
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Current password</Label>
        <Input
          id="currentPassword"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(errors.currentPassword)}
          {...register("currentPassword")}
        />
        {errors.currentPassword ? (
          <p className="text-sm text-destructive">
            {errors.currentPassword.message}
          </p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="newPassword">New password</Label>
        <Input
          id="newPassword"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.newPassword)}
          {...register("newPassword")}
        />
        {errors.newPassword ? (
          <p className="text-sm text-destructive">
            {errors.newPassword.message}
          </p>
        ) : null}
        <p className="text-xs text-muted-foreground">
          At least 12 characters. Other sessions will be signed out.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.confirmPassword)}
          {...register("confirmPassword")}
        />
        {errors.confirmPassword ? (
          <p className="text-sm text-destructive">
            {errors.confirmPassword.message}
          </p>
        ) : null}
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}
