"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { subscribeNewsletterAction } from "@/actions/newsletter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Locale } from "@/lib/i18n/dictionaries";
import {
  newsletterSubscribeSchema,
  type NewsletterSubscribeInput,
} from "@/lib/schemas/newsletter";

type NewsletterFormProps = {
  locale: Locale;
  heading: string;
  blurb: string;
  placeholder: string;
  submitLabel: string;
  successLabel: string;
};

export function NewsletterForm({
  locale,
  heading,
  blurb,
  placeholder,
  submitLabel,
  successLabel,
}: NewsletterFormProps) {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, reset } = useForm<NewsletterSubscribeInput>({
    resolver: zodResolver(newsletterSubscribeSchema) as never,
    defaultValues: {
      email: "",
      locale,
      website: "",
    },
  });

  const onSubmit = handleSubmit((values) => {
    setError(null);
    startTransition(async () => {
      const result = await subscribeNewsletterAction({
        ...values,
        locale,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setDone(true);
      reset({ email: "", locale, website: "" });
    });
  });

  if (done) {
    return (
      <div className="space-y-2" role="status">
        <p className="font-heading text-base font-semibold">{heading}</p>
        <p className="text-sm text-muted-foreground">{successLabel}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3" noValidate>
      <div>
        <p className="font-heading text-base font-semibold">{heading}</p>
        <p className="mt-1 text-sm text-muted-foreground">{blurb}</p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1 space-y-1">
          <Label htmlFor="newsletter-email" className="sr-only">
            Email
          </Label>
          <Input
            id="newsletter-email"
            type="email"
            autoComplete="email"
            placeholder={placeholder}
            {...register("email")}
          />
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "…" : submitLabel}
        </Button>
      </div>
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
        {...register("website")}
      />
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
