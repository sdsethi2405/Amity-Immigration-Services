"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createMatterAction } from "@/actions/matters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createMatterSchema } from "@/lib/schemas/matters";

type ClientOption = {
  id: string;
  email: string;
  full_name: string;
};

type VisaOption = {
  id: string;
  label: string;
};

type MatterCreateFormProps = {
  csrfToken: string;
  clients: ClientOption[];
  visas: VisaOption[];
};

type FormValues = z.infer<typeof createMatterSchema>;

export function MatterCreateForm({
  csrfToken,
  clients,
  visas,
}: MatterCreateFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mode, setMode] = useState<"new" | "existing">("new");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(createMatterSchema) as never,
    defaultValues: {
      csrfToken,
      title: "",
      status: "open",
      notes: "",
      visa_subclass_id: "",
      enquiry_id: "",
      existing_client_id: "",
      client_email: "",
      client_full_name: "",
      client_password: "",
    },
  });

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const payload =
        mode === "existing"
          ? {
              ...values,
              client_email: "",
              client_full_name: "",
              client_password: "",
            }
          : {
              ...values,
              existing_client_id: "",
            };

      const result = await createMatterAction(payload);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Matter created");
      router.refresh();
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={mode === "new" ? "default" : "outline"}
          onClick={() => {
            setMode("new");
            setValue("existing_client_id", "");
          }}
        >
          New client
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mode === "existing" ? "default" : "outline"}
          onClick={() => setMode("existing")}
        >
          Existing client
        </Button>
      </div>

      {mode === "existing" ? (
        <div className="space-y-2">
          <Label htmlFor="existing_client_id">Client</Label>
          <select
            id="existing_client_id"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
            {...register("existing_client_id")}
          >
            <option value="">Select a client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.full_name} ({client.email})
              </option>
            ))}
          </select>
          {errors.existing_client_id ? (
            <p className="text-sm text-destructive">
              {errors.existing_client_id.message}
            </p>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="client_full_name">Client full name</Label>
            <Input id="client_full_name" {...register("client_full_name")} />
            {errors.client_full_name ? (
              <p className="text-sm text-destructive">
                {errors.client_full_name.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="client_email">Client email</Label>
            <Input
              id="client_email"
              type="email"
              autoComplete="off"
              {...register("client_email")}
            />
            {errors.client_email ? (
              <p className="text-sm text-destructive">
                {errors.client_email.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="client_password">Portal password</Label>
            <Input
              id="client_password"
              type="password"
              autoComplete="new-password"
              {...register("client_password")}
            />
            {errors.client_password ? (
              <p className="text-sm text-destructive">
                {errors.client_password.message}
              </p>
            ) : null}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Matter title</Label>
        <Input id="title" {...register("title")} />
        {errors.title ? (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="visa_subclass_id">Visa subclass (optional)</Label>
          <select
            id="visa_subclass_id"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
            {...register("visa_subclass_id")}
          >
            <option value="">None</option>
            {visas.map((visa) => (
              <option key={visa.id} value={visa.id}>
                {visa.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="enquiry_id">Enquiry ID (optional)</Label>
          <Input
            id="enquiry_id"
            placeholder="UUID from enquiries"
            {...register("enquiry_id")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Internal notes (optional)</Label>
        <Textarea id="notes" rows={3} {...register("notes")} />
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Creating…" : "Create matter"}
      </Button>
    </form>
  );
}
