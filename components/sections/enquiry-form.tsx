"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { submitEnquiry } from "@/actions/enquiries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";
import { fadeIn, withReducedMotion } from "@/lib/motion";
import { enquirySchema, type EnquiryInput } from "@/lib/schemas/enquiry";

export function EnquiryFormSection() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const prefersReducedMotion = usePrefersReducedMotion();
  const statusVariants = withReducedMotion(fadeIn, prefersReducedMotion);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EnquiryInput>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      visa_interest: "",
      message: "",
      source_page: "/contact",
    },
  });

  const onSubmit = handleSubmit((values) => {
    setServerError(null);

    startTransition(async () => {
      const result = await submitEnquiry(values);

      if (result.success) {
        setSubmitted(true);
        reset();
        return;
      }

      setServerError(result.error);
    });
  });

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-2xl px-4 md:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial="hidden"
              animate="show"
              exit="hidden"
              variants={statusVariants}
              className="rounded-lg border border-border bg-card px-6 py-8 text-center"
              role="status"
            >
              <h2 className="font-heading text-2xl font-semibold text-foreground">
                Thank you for your enquiry
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                We have received your message and will respond as soon as we can.
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={(event) => {
                event.preventDefault();
                void onSubmit(event);
              }}
              className="space-y-6 rounded-lg border border-border bg-card p-6 md:p-8"
              noValidate
            >
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" autoComplete="name" {...register("name")} />
                {errors.name ? (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register("email")}
                />
                {errors.email ? (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  {...register("phone")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="visa_interest">Visa interest (optional)</Label>
                <Input id="visa_interest" {...register("visa_interest")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  rows={5}
                  {...register("message")}
                />
                {errors.message ? (
                  <p className="text-sm text-destructive">
                    {errors.message.message}
                  </p>
                ) : null}
              </div>

              {serverError ? (
                <motion.p
                  initial="hidden"
                  animate="show"
                  variants={statusVariants}
                  className="text-sm text-destructive"
                  role="alert"
                >
                  {serverError}
                </motion.p>
              ) : null}

              <Button type="submit" disabled={isPending} className="w-full md:w-auto">
                {isPending ? "Sending…" : "Send enquiry"}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
