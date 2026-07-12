-- Public pages content, team-photos storage bucket, and contact details update

-- ---------------------------------------------------------------------------
-- Storage: team photos (public read)
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('team-photos', 'team-photos', true)
on conflict (id) do update set public = excluded.public;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Public read team photos'
  ) then
    create policy "Public read team photos"
      on storage.objects for select
      using (bucket_id = 'team-photos');
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Contact details — full Bundoora address
-- ---------------------------------------------------------------------------

update public.site_settings
set value = '{
  "phone": "+61 3 0000 0000",
  "email": "info@amityimmigration.com.au",
  "address": "59 Settlement Road, Bundoora VIC 3083",
  "office_hours": "Mon–Fri 9:00am–5:00pm"
}'::jsonb,
updated_at = now()
where key = 'contact_details';

-- ---------------------------------------------------------------------------
-- CMS pages: about, services, resources, contact, privacy, terms
-- ---------------------------------------------------------------------------

insert into public.pages (slug, title, blocks, meta_title, meta_description, team_id) values
  (
    'about',
    'About',
    '[
      {"type":"firm-story","title":"Registered migration advice from Bundoora","body":"Amity Immigration Services is a registered migration agent practice based in Bundoora, Melbourne. We help individuals, families, and employers navigate Australian visa pathways with clear, practical guidance."},
      {"type":"team-grid","title":"Our team"},
      {"type":"credentials","title":"Credentials & standards","items":[
        {"title":"Registered Migration Agent","body":"MARN 964861 — registered with the Office of the Migration Agents Registration Authority (MARA)."},
        {"title":"General information only","body":"We provide registered migration advice, not legal representation. This website is general information only."},
        {"title":"Direct agent access","body":"The registered agent you meet is the one who prepares and lodges your application."},
        {"title":"Professional obligations","body":"We follow the MARA Code of Conduct and maintain professional standards in every matter."}
      ]},
      {"type":"cta-band","headline":"Speak with a registered migration agent","body":"Book a consultation to discuss your circumstances and the visa pathways that may suit you."}
    ]'::jsonb,
    'About | Amity Immigration Services',
    'Learn about Amity Immigration Services — a registered migration agent based in Bundoora, Melbourne.',
    'a1000000-0000-4000-8000-000000000001'
  ),
  (
    'services',
    'Services',
    '[
      {"type":"services-intro","title":"Migration services","body":"We advise on skilled, employer-sponsored, family, student, and business visa matters. Each engagement begins with understanding your circumstances and mapping relevant pathways."},
      {"type":"services-list","title":"How we can help"},
      {"type":"visa-streams-callout","title":"Explore visa sub-classes by stream","body":"Browse our directory of Australian visa sub-classes grouped by migration stream — skilled, employer, family, and more."},
      {"type":"cta-band","headline":"Not sure where to start?","body":"Book a consultation and we will help you identify the pathways worth exploring for your situation."}
    ]'::jsonb,
    'Services | Amity Immigration Services',
    'Migration services for skilled, partner, family, and business visa matters.',
    'a1000000-0000-4000-8000-000000000001'
  ),
  (
    'resources',
    'Resources',
    '[
      {"type":"resources-intro","title":"Guides & official resources","body":"Useful guides and links to official Department of Home Affairs resources. Always check the Department website for the most current visa requirements and forms."},
      {"type":"resource-links","title":"Official resources","links":[
        {"label":"Department of Home Affairs","href":"https://immi.homeaffairs.gov.au/","description":"Official Australian visa and citizenship information.","external":true},
        {"label":"Visa listing","href":"https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing","description":"Browse all visa subclasses on the Department website.","external":true},
        {"label":"SkillSelect","href":"https://immi.homeaffairs.gov.au/visas/working-in-australia/skillselect","description":"Expression of Interest system for skilled migration.","external":true},
        {"label":"Visa processing times","href":"https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-processing-times","description":"Current indicative processing time ranges.","external":true}
      ]},
      {"type":"points-calculator-callout","title":"Skilled migration points calculator","body":"Use our indicative points calculator to explore GSM points for skilled visa subclasses. Results are estimates only — speak with a registered migration agent for advice about your circumstances."}
    ]'::jsonb,
    'Resources | Amity Immigration Services',
    'Guides and official Department of Home Affairs resources for Australian visa applicants.',
    'a1000000-0000-4000-8000-000000000001'
  ),
  (
    'contact',
    'Contact',
    '[
      {"type":"contact-intro","title":"Get in touch","body":"Send us an enquiry and we will respond as soon as we can. For consultations, include a brief summary of your visa interest and circumstances."}
    ]'::jsonb,
    'Contact | Amity Immigration Services',
    'Book a consultation with Amity Immigration Services in Bundoora, Melbourne.',
    'a1000000-0000-4000-8000-000000000001'
  ),
  (
    'privacy',
    'Privacy Policy',
    '[
      {"type":"heading","level":2,"text":"Overview"},
      {"type":"richtext","html":"<p>Amity Immigration Services (MARN 964861) respects your privacy. This policy describes how we collect, use, and protect personal information when you use our website or engage our migration services.</p>"},
      {"type":"heading","level":2,"text":"Information we collect"},
      {"type":"richtext","html":"<p>We may collect your name, contact details, visa-related information, and documents you provide for migration advice. Enquiries submitted through this website are stored securely for follow-up.</p>"},
      {"type":"heading","level":2,"text":"How we use your information"},
      {"type":"richtext","html":"<p>We use personal information to respond to enquiries, provide registered migration advice, prepare visa applications, and meet our professional and legal obligations.</p>"},
      {"type":"heading","level":2,"text":"Contact"},
      {"type":"richtext","html":"<p>For privacy enquiries, contact us at info@amityimmigration.com.au or visit our office at 59 Settlement Road, Bundoora VIC 3083.</p>"}
    ]'::jsonb,
    'Privacy Policy | Amity Immigration Services',
    'Privacy policy for Amity Immigration Services.',
    'a1000000-0000-4000-8000-000000000001'
  ),
  (
    'terms',
    'Terms of Use',
    '[
      {"type":"heading","level":2,"text":"General information"},
      {"type":"richtext","html":"<p>This website provides general migration information only. It does not constitute legal advice or create a migration agent–client relationship.</p>"},
      {"type":"heading","level":2,"text":"Registered migration agent"},
      {"type":"richtext","html":"<p>Amity Immigration Services is a registered migration agent (MARN 964861), not a law firm. We do not provide legal representation.</p>"},
      {"type":"heading","level":2,"text":"No outcome promises"},
      {"type":"richtext","html":"<p>We do not promise visa outcomes, processing times, or success rates. Visa decisions are made by the Department of Home Affairs and other authorities.</p>"},
      {"type":"heading","level":2,"text":"Website use"},
      {"type":"richtext","html":"<p>You agree to use this website lawfully and not to misuse enquiry forms or other interactive features.</p>"}
    ]'::jsonb,
    'Terms of Use | Amity Immigration Services',
    'Terms of use for the Amity Immigration Services website.',
    'a1000000-0000-4000-8000-000000000001'
  )
on conflict (slug) do update set
  title = excluded.title,
  blocks = excluded.blocks,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  team_id = excluded.team_id,
  updated_at = now();
