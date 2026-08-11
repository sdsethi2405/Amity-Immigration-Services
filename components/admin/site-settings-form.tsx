"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  updateComplianceFooterAction,
  updateContactDetailsAction,
  updateEnquiryNotifyAction,
  updatePointsTableAction,
  updateSocialLinksAction,
} from "@/actions/site-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ContactDetails, SocialLinks } from "@/lib/db/queries";

type SiteSettingsFormProps = {
  csrfToken: string;
  contact: ContactDetails | null;
  social: SocialLinks | null;
  complianceFooter: string;
  notifyEmail: string;
  pointsTableJson: string;
  resendConfigured: boolean;
};

export function SiteSettingsForm({
  csrfToken,
  contact,
  social,
  complianceFooter,
  notifyEmail,
  pointsTableJson,
  resendConfigured,
}: SiteSettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [phone, setPhone] = useState(contact?.phone ?? "");
  const [email, setEmail] = useState(contact?.email ?? "");
  const [address, setAddress] = useState(contact?.address ?? "");
  const [officeHours, setOfficeHours] = useState(contact?.office_hours ?? "");
  const [facebook, setFacebook] = useState(social?.facebook ?? "");
  const [linkedin, setLinkedin] = useState(social?.linkedin ?? "");
  const [instagram, setInstagram] = useState(social?.instagram ?? "");
  const [footer, setFooter] = useState(complianceFooter);
  const [notify, setNotify] = useState(notifyEmail);
  const [pointsJson, setPointsJson] = useState(pointsTableJson);

  function run(
    label: string,
    action: () => Promise<{ success: true } | { success: false; error: string }>,
  ) {
    startTransition(async () => {
      const result = await action();
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(`${label} saved`);
    });
  }

  return (
    <div className="space-y-10">
      <section className="space-y-4 rounded-xl border border-border p-4">
        <h2 className="font-heading text-xl font-semibold">Contact details</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="hours">Office hours</Label>
            <Input
              id="hours"
              value={officeHours}
              onChange={(e) => setOfficeHours(e.target.value)}
            />
          </div>
        </div>
        <Button
          type="button"
          disabled={isPending}
          onClick={() =>
            run("Contact details", () =>
              updateContactDetailsAction({
                csrfToken,
                phone,
                email,
                address,
                office_hours: officeHours,
              }),
            )
          }
        >
          Save contact details
        </Button>
      </section>

      <section className="space-y-4 rounded-xl border border-border p-4">
        <h2 className="font-heading text-xl font-semibold">Social links</h2>
        <div className="grid gap-3">
          <div className="space-y-2">
            <Label htmlFor="facebook">Facebook URL</Label>
            <Input
              id="facebook"
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn URL</Label>
            <Input
              id="linkedin"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram URL</Label>
            <Input
              id="instagram"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
            />
          </div>
        </div>
        <Button
          type="button"
          disabled={isPending}
          onClick={() =>
            run("Social links", () =>
              updateSocialLinksAction({
                csrfToken,
                facebook,
                linkedin,
                instagram,
              }),
            )
          }
        >
          Save social links
        </Button>
      </section>

      <section className="space-y-4 rounded-xl border border-border p-4">
        <h2 className="font-heading text-xl font-semibold">Compliance footer</h2>
        <Textarea
          rows={4}
          value={footer}
          onChange={(e) => setFooter(e.target.value)}
        />
        <Button
          type="button"
          disabled={isPending}
          onClick={() =>
            run("Compliance footer", () =>
              updateComplianceFooterAction({
                csrfToken,
                compliance_footer: footer,
              }),
            )
          }
        >
          Save compliance footer
        </Button>
      </section>

      <section className="space-y-4 rounded-xl border border-border p-4">
        <h2 className="font-heading text-xl font-semibold">
          Enquiry email notify
        </h2>
        <p className="text-sm text-muted-foreground">
          {resendConfigured
            ? "Resend API key is configured. New enquiries will email this address."
            : "Add RESEND_API_KEY (and optional RESEND_FROM_EMAIL) in Vercel to enable email delivery."}
        </p>
        <div className="space-y-2">
          <Label htmlFor="notify">Notify email</Label>
          <Input
            id="notify"
            type="email"
            value={notify}
            onChange={(e) => setNotify(e.target.value)}
            placeholder="agent@example.com"
          />
        </div>
        <Button
          type="button"
          disabled={isPending}
          onClick={() =>
            run("Enquiry notify", () =>
              updateEnquiryNotifyAction({
                csrfToken,
                notify_email: notify,
              }),
            )
          }
        >
          Save notify email
        </Button>
      </section>

      <section className="space-y-4 rounded-xl border border-border p-4">
        <h2 className="font-heading text-xl font-semibold">Points table</h2>
        <p className="text-sm text-muted-foreground">
          JSON used by the public GSM points calculator. Keep the same key
          structure as the defaults.
        </p>
        <Textarea
          rows={18}
          className="font-mono text-xs"
          value={pointsJson}
          onChange={(e) => setPointsJson(e.target.value)}
        />
        <Button
          type="button"
          disabled={isPending}
          onClick={() =>
            run("Points table", () =>
              updatePointsTableAction({
                csrfToken,
                points_table_json: pointsJson,
              }),
            )
          }
        >
          Save points table
        </Button>
      </section>
    </div>
  );
}
