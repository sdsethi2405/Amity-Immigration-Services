"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  updateComplianceFooterAction,
  updateContactDetailsAction,
  updateEnquiryNotifyAction,
  updateEnquiryTemplatesAction,
  updateFeeEstimateBandsAction,
  updateGoogleReviewsEmbedAction,
  updatePointsTableAction,
  updateSlackWebhookAction,
  updateSocialLinksAction,
  updateWhatsappAction,
} from "@/actions/site-settings";
import { PointsTableFields } from "@/components/admin/points-table-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ContactDetails, FeeEstimateBand, SocialLinks } from "@/lib/db/queries";
import {
  parsePointsTable,
  POINTS_TABLE,
  type PointsTable,
} from "@/lib/points-table";

export type EnquiryTemplateRow = {
  id: string;
  name: string;
  body: string;
};

type SiteSettingsFormProps = {
  csrfToken: string;
  contact: ContactDetails | null;
  social: SocialLinks | null;
  complianceFooter: string;
  notifyEmail: string;
  pointsTable: PointsTable;
  resendConfigured: boolean;
  enquiryTemplates: EnquiryTemplateRow[];
  slackWebhookUrl: string;
  whatsappE164: string;
  feeEstimateBands: FeeEstimateBand[];
  googleReviewsEmbedUrl: string;
};

function newTemplateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `tpl-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function SiteSettingsForm({
  csrfToken,
  contact,
  social,
  complianceFooter,
  notifyEmail,
  pointsTable,
  resendConfigured,
  enquiryTemplates,
  slackWebhookUrl,
  whatsappE164,
  feeEstimateBands,
  googleReviewsEmbedUrl,
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
  const [points, setPoints] = useState<PointsTable>(
    () => parsePointsTable(pointsTable) ?? { ...POINTS_TABLE },
  );
  const [templates, setTemplates] = useState<EnquiryTemplateRow[]>(
    enquiryTemplates,
  );
  const [slackUrl, setSlackUrl] = useState(slackWebhookUrl);
  const [whatsapp, setWhatsapp] = useState(whatsappE164);
  const [feeBands, setFeeBands] = useState<FeeEstimateBand[]>(feeEstimateBands);
  const [reviewsUrl, setReviewsUrl] = useState(googleReviewsEmbedUrl);

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
        <h2 className="font-heading text-xl font-semibold">Slack webhook</h2>
        <p className="text-sm text-muted-foreground">
          Optional incoming webhook URL. New enquiries post a plain-text summary when set.
        </p>
        <div className="space-y-2">
          <Label htmlFor="slack-webhook">Webhook URL</Label>
          <Input
            id="slack-webhook"
            type="url"
            value={slackUrl}
            onChange={(e) => setSlackUrl(e.target.value)}
            placeholder="https://hooks.slack.com/services/…"
          />
        </div>
        <Button
          type="button"
          disabled={isPending}
          onClick={() =>
            run("Slack webhook", () =>
              updateSlackWebhookAction({
                csrfToken,
                slack_webhook_url: slackUrl,
              }),
            )
          }
        >
          Save Slack webhook
        </Button>
      </section>

      <section className="space-y-4 rounded-xl border border-border p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-heading text-xl font-semibold">
            Enquiry note templates
          </h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending || templates.length >= 20}
            onClick={() =>
              setTemplates((current) => [
                ...current,
                { id: newTemplateId(), name: "", body: "" },
              ])
            }
          >
            Add template
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Up to 20 named snippets for inserting into enquiry notes.
        </p>
        <div className="space-y-4">
          {templates.length === 0 ? (
            <p className="text-sm text-muted-foreground">No templates yet.</p>
          ) : (
            templates.map((template, index) => (
              <div
                key={template.id}
                className="space-y-3 rounded-lg border border-border p-3"
              >
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <div className="min-w-0 flex-1 space-y-2">
                    <Label htmlFor={`template-name-${template.id}`}>
                      Template name
                    </Label>
                    <Input
                      id={`template-name-${template.id}`}
                      value={template.name}
                      onChange={(e) =>
                        setTemplates((current) =>
                          current.map((row, i) =>
                            i === index
                              ? { ...row, name: e.target.value }
                              : row,
                          ),
                        )
                      }
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() =>
                      setTemplates((current) =>
                        current.filter((_, i) => i !== index),
                      )
                    }
                  >
                    Remove
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`template-body-${template.id}`}>
                    Template body
                  </Label>
                  <Textarea
                    id={`template-body-${template.id}`}
                    rows={3}
                    value={template.body}
                    onChange={(e) =>
                      setTemplates((current) =>
                        current.map((row, i) =>
                          i === index
                            ? { ...row, body: e.target.value }
                            : row,
                        ),
                      )
                    }
                  />
                </div>
              </div>
            ))
          )}
        </div>
        <Button
          type="button"
          disabled={isPending}
          onClick={() =>
            run("Enquiry templates", () =>
              updateEnquiryTemplatesAction({
                csrfToken,
                templates,
              }),
            )
          }
        >
          Save enquiry templates
        </Button>
      </section>

      <section className="space-y-4 rounded-xl border border-border p-4">
        <h2 className="font-heading text-xl font-semibold">Points table</h2>
        <PointsTableFields value={points} onChange={setPoints} />
        <Button
          type="button"
          disabled={isPending}
          onClick={() =>
            run("Points table", () =>
              updatePointsTableAction({
                csrfToken,
                points_table: points,
              }),
            )
          }
        >
          Save points table
        </Button>
      </section>

      <section className="space-y-4 rounded-xl border border-border p-4">
        <h2 className="font-heading text-xl font-semibold">WhatsApp</h2>
        <div className="space-y-2">
          <Label htmlFor="whatsapp_e164">WhatsApp number (E.164)</Label>
          <Input
            id="whatsapp_e164"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="+61400000000"
          />
          <p className="text-xs text-muted-foreground">
            Shown as a floating “Chat on WhatsApp” link when set.
          </p>
        </div>
        <Button
          type="button"
          disabled={isPending}
          onClick={() =>
            run("WhatsApp number", () =>
              updateWhatsappAction({
                csrfToken,
                whatsapp_e164: whatsapp,
              }),
            )
          }
        >
          Save WhatsApp number
        </Button>
      </section>

      <section className="space-y-4 rounded-xl border border-border p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-heading text-xl font-semibold">
            Fee estimate bands
          </h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setFeeBands((current) => [
                ...current,
                { label: "", amountAud: 0 },
              ])
            }
          >
            Add band
          </Button>
        </div>
        {feeBands.length === 0 ? (
          <p className="text-sm text-muted-foreground">No fee bands yet.</p>
        ) : (
          feeBands.map((band, index) => (
            <div
              key={`fee-${index}`}
              className="grid gap-3 rounded-lg border border-border p-3 sm:grid-cols-[1fr_8rem_auto]"
            >
              <div className="space-y-2">
                <Label htmlFor={`fee-label-${index}`}>Label</Label>
                <Input
                  id={`fee-label-${index}`}
                  value={band.label}
                  onChange={(e) =>
                    setFeeBands((current) =>
                      current.map((row, i) =>
                        i === index ? { ...row, label: e.target.value } : row,
                      ),
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`fee-amount-${index}`}>Amount (AUD)</Label>
                <Input
                  id={`fee-amount-${index}`}
                  type="number"
                  min={0}
                  step={1}
                  value={band.amountAud}
                  onChange={(e) =>
                    setFeeBands((current) =>
                      current.map((row, i) =>
                        i === index
                          ? {
                              ...row,
                              amountAud: Number(e.target.value) || 0,
                            }
                          : row,
                      ),
                    )
                  }
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="self-end"
                onClick={() =>
                  setFeeBands((current) =>
                    current.filter((_, i) => i !== index),
                  )
                }
              >
                Remove
              </Button>
            </div>
          ))
        )}
        <Button
          type="button"
          disabled={isPending}
          onClick={() =>
            run("Fee estimate bands", () =>
              updateFeeEstimateBandsAction({
                csrfToken,
                bands: feeBands,
              }),
            )
          }
        >
          Save fee bands
        </Button>
      </section>

      <section className="space-y-4 rounded-xl border border-border p-4">
        <h2 className="font-heading text-xl font-semibold">Google reviews</h2>
        <div className="space-y-2">
          <Label htmlFor="google_reviews_embed_url">Embed URL</Label>
          <Input
            id="google_reviews_embed_url"
            value={reviewsUrl}
            onChange={(e) => setReviewsUrl(e.target.value)}
            placeholder="https://…"
          />
        </div>
        <Button
          type="button"
          disabled={isPending}
          onClick={() =>
            run("Google reviews embed", () =>
              updateGoogleReviewsEmbedAction({
                csrfToken,
                google_reviews_embed_url: reviewsUrl,
              }),
            )
          }
        >
          Save Google reviews URL
        </Button>
      </section>
    </div>
  );
}
