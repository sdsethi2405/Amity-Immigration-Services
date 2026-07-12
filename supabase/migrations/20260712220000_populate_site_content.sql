-- Populate / enrich public CMS content (does NOT modify visa_subclasses).
-- Safe to re-run: uses upserts and targeted updates.

-- ---------------------------------------------------------------------------
-- Site settings
-- ---------------------------------------------------------------------------
update public.site_settings
set value = jsonb_build_object(
  'phone', '+61 3 9467 4400',
  'email', 'info@amityimmigration.com.au',
  'address', '59 Settlement Road, Bundoora VIC 3083',
  'office_hours', 'Mon-Fri 9:00am-5:00pm (consultations by appointment)'
)
where key = 'contact_details';

update public.site_settings
set value = jsonb_build_object(
  'facebook', 'https://www.facebook.com/amityimmigration',
  'linkedin', 'https://www.linkedin.com/company/amity-immigration-services',
  'instagram', 'https://www.instagram.com/amityimmigration'
)
where key = 'social_links';

update public.site_settings
set value = to_jsonb(
  'Registered Migration Agent MARN 964861 - Amity Immigration Services, 59 Settlement Road, Bundoora VIC 3083. Website content is general migration information only and is not legal advice.'::text
)
where key = 'compliance_footer';

-- ---------------------------------------------------------------------------
-- Team members
-- ---------------------------------------------------------------------------
update public.team_members
set
  name = 'Amity Sethi',
  role_title = 'Principal Migration Agent (MARN 964861)',
  bio = 'Registered migration agent based in Bundoora. Advises individuals, families, and employers on skilled, employer-sponsored, partner, student, and business visa pathways. Oversees each matter from first consultation through lodgement.',
  is_published = true,
  sort_order = 10,
  team_id = 'a1000000-0000-4000-8000-000000000001'
where name = 'Registered Migration Agent';

update public.team_members
set
  name = 'Priya Nair',
  role_title = 'Migration Consultant - Skilled & Employer',
  bio = 'Supports points-tested skilled visas, state nomination preparation, and employer sponsorship matters including Skills in Demand (subclass 482) and ENS pathways. Focuses on evidence checklists and clear next steps.',
  is_published = true,
  sort_order = 20,
  team_id = 'a1000000-0000-4000-8000-000000000002'
where name = 'Skilled Visa Specialist';

update public.team_members
set
  name = 'Daniel Rossi',
  role_title = 'Migration Consultant - Family & Partner',
  bio = 'Assists with partner, parent, and other family visa preparations. Helps clients organise relationship and sponsorship evidence and understand onshore and offshore pathway differences.',
  is_published = true,
  sort_order = 30,
  team_id = 'a1000000-0000-4000-8000-000000000003'
where name = 'Family Visa Specialist';

-- ---------------------------------------------------------------------------
-- Enrich existing services
-- ---------------------------------------------------------------------------
update public.services
set
  summary = 'A structured review of your skilled migration options, including points, occupation lists, and nomination pathways.',
  body = '[
    {"type":"heading","level":2,"text":"What this service covers"},
    {"type":"richtext","html":"<p>We review your education, work experience, English language results, and age against current skilled migration frameworks. You receive a written summary of pathways that may be relevant to your circumstances.</p>"},
    {"type":"heading","level":2,"text":"Typical next steps"},
    {"type":"richtext","html":"<p>After the assessment we outline documents to gather, skills assessment bodies to contact where relevant, and whether an Expression of Interest or state nomination enquiry is worth exploring.</p>"},
    {"type":"callout","text":"General information: Assessments are advisory. Visa decisions remain with the Department of Home Affairs.","variant":"info"}
  ]'::jsonb,
  icon = 'clipboard-check',
  is_published = true,
  sort_order = 10,
  team_id = 'a1000000-0000-4000-8000-000000000002'
where slug = 'skilled-visa-assessment';

update public.services
set
  summary = 'Guidance on partner and family visa pathways, evidence preparation, and onshore vs offshore options.',
  body = '[
    {"type":"heading","level":2,"text":"What this service covers"},
    {"type":"richtext","html":"<p>We explain partner, prospective marriage, and selected family visa pathways, and help you understand the evidence typically required for relationship and sponsorship criteria.</p>"},
    {"type":"heading","level":2,"text":"How we work with you"},
    {"type":"richtext","html":"<p>Consultations cover eligibility considerations, document checklists, and lodgement sequencing. We prepare and lodge applications when you engage us as your registered migration agent.</p>"},
    {"type":"callout","text":"Important: Family visa criteria change. Always confirm current requirements with a registered agent and the Department website.","variant":"info"}
  ]'::jsonb,
  icon = 'heart',
  is_published = true,
  sort_order = 20,
  team_id = 'a1000000-0000-4000-8000-000000000003'
where slug = 'partner-family-visas';

update public.services
set
  summary = 'Advice for businesses and sponsored workers on nomination, sponsorship, and Skills in Demand visas.',
  body = '[
    {"type":"heading","level":2,"text":"What this service covers"},
    {"type":"richtext","html":"<p>We advise employers and prospective nominees on sponsorship obligations, nomination requirements, and temporary and permanent employer-sponsored visa options.</p>"},
    {"type":"heading","level":2,"text":"Who it suits"},
    {"type":"richtext","html":"<p>Growing businesses hiring overseas talent, and skilled workers exploring employer-backed pathways including subclass 482 and permanent employer nomination options.</p>"},
    {"type":"callout","text":"Compliance focus: Sponsorship carries ongoing obligations. We help you understand what those duties involve before you commit.","variant":"info"}
  ]'::jsonb,
  icon = 'briefcase',
  is_published = true,
  sort_order = 30,
  team_id = 'a1000000-0000-4000-8000-000000000002'
where slug = 'employer-sponsorship-advice';

insert into public.services (title, slug, summary, body, icon, sort_order, is_published, team_id)
values
(
  'Student visa assistance',
  'student-visa-assistance',
  'Support for subclass 500 student visas, Genuine Student requirements, and related family applications.',
  '[{"type":"heading","level":2,"text":"What this service covers"},{"type":"richtext","html":"<p>We help prospective students understand visa criteria, Genuine Student considerations, financial evidence, and Overseas Student Health Cover requirements.</p>"},{"type":"richtext","html":"<p>Where relevant we also discuss pathways after study, including temporary graduate and skilled options.</p>"},{"type":"callout","text":"Course choice: Course selection and education provider decisions sit with you and your education agent. We focus on the visa application.","variant":"info"}]'::jsonb,
  'graduation-cap', 40, true, 'a1000000-0000-4000-8000-000000000001'
),
(
  'Business & investment migration',
  'business-investment-migration',
  'Orientation to business innovation and investment visa streams for eligible entrepreneurs and investors.',
  '[{"type":"heading","level":2,"text":"What this service covers"},{"type":"richtext","html":"<p>We outline business and investment migration streams, nomination contexts where they apply, and the types of evidence typically reviewed for business background and investment capacity.</p>"},{"type":"callout","text":"Complex matters: Business migration often involves financial and corporate documents. Early organisation of records saves time later.","variant":"info"}]'::jsonb,
  'building-2', 50, true, 'a1000000-0000-4000-8000-000000000001'
),
(
  'Visitor & temporary stay',
  'visitor-temporary-stay',
  'Advice on visitor visas and short-stay options for tourism, family visits, and business visitor activities.',
  '[{"type":"heading","level":2,"text":"What this service covers"},{"type":"richtext","html":"<p>We help you choose an appropriate visitor stream, prepare supporting documents, and understand conditions that apply during your stay.</p>"},{"type":"callout","text":"Stay within conditions: Visitor visas have strict work and study limits. We explain those conditions before you travel.","variant":"info"}]'::jsonb,
  'plane', 60, true, 'a1000000-0000-4000-8000-000000000001'
),
(
  'Citizenship preparation',
  'citizenship-preparation',
  'Guidance on Australian citizenship by conferral, including residence requirements and application preparation.',
  '[{"type":"heading","level":2,"text":"What this service covers"},{"type":"richtext","html":"<p>We review residence and presence calculations, identity documents, and character considerations ahead of a citizenship by conferral application.</p>"},{"type":"callout","text":"Decision maker: Citizenship decisions are made by the Department. We help you prepare a complete application.","variant":"info"}]'::jsonb,
  'flag', 70, true, 'a1000000-0000-4000-8000-000000000001'
),
(
  'Visa refusal review support',
  'visa-refusal-review-support',
  'A careful review of refusal reasons and discussion of review or re-application options where available.',
  '[{"type":"heading","level":2,"text":"What this service covers"},{"type":"richtext","html":"<p>We examine the refusal decision record, identify the grounds relied on, and discuss whether merits review, a fresh application, or another pathway may be appropriate.</p>"},{"type":"callout","text":"Time limits: Review periods can be short. Contact us promptly after a refusal so options can be assessed in time.","variant":"info"}]'::jsonb,
  'scale', 80, true, 'a1000000-0000-4000-8000-000000000001'
)
on conflict (slug) do update set
  title = excluded.title,
  summary = excluded.summary,
  body = excluded.body,
  icon = excluded.icon,
  sort_order = excluded.sort_order,
  is_published = excluded.is_published,
  team_id = excluded.team_id,
  updated_at = now();

delete from public.posts where slug = 'acl-verification-post';

insert into public.posts (title, slug, excerpt, body, author_name, published_at, is_published, team_id)
values
(
  'State nomination: how to prepare before you submit an EOI',
  'state-nomination-prepare-before-eoi',
  'A practical checklist for gathering documents and researching state nomination criteria before you lodge a SkillSelect EOI.',
  '[{"type":"heading","level":2,"text":"Why preparation matters"},{"type":"richtext","html":"<p>State and territory nomination programs change regularly. Preparing your skills assessment, English results, and employment evidence early helps you respond when a nomination window opens.</p>"},{"type":"heading","level":2,"text":"What to organise first"},{"type":"richtext","html":"<ul><li>Skills assessment outcome (or application in progress)</li><li>Valid English test results where required</li><li>Employment references that match your nominated occupation</li><li>Notes on which states list your occupation</li></ul>"},{"type":"callout","text":"No outcome promises: Nomination and invitation rounds are competitive and managed by government authorities. Past patterns do not predict future results.","variant":"info"}]'::jsonb,
  'Amity Immigration Services', '2026-05-12T00:00:00Z', true, 'a1000000-0000-4000-8000-000000000002'
),
(
  'Genuine Student requirement: what applicants should expect',
  'genuine-student-requirement-overview',
  'An overview of how the Genuine Student criterion is assessed and the kinds of evidence commonly discussed in student visa matters.',
  '[{"type":"heading","level":2,"text":"What Genuine Student means"},{"type":"richtext","html":"<p>Student visa applicants need to show they genuinely intend to study in Australia. Decision makers look at course choice, study history, financial capacity, and ties to home country among other factors.</p>"},{"type":"heading","level":2,"text":"How we help"},{"type":"richtext","html":"<p>We help you present a coherent statement and supporting documents. Course selection remains your decision with your education provider.</p>"},{"type":"callout","text":"Check official guidance: Always confirm current Genuine Student guidance on the Department of Home Affairs website.","variant":"info"}]'::jsonb,
  'Amity Immigration Services', '2026-04-08T00:00:00Z', true, 'a1000000-0000-4000-8000-000000000001'
),
(
  'Employer sponsorship: obligations at a glance',
  'employer-sponsorship-obligations-overview',
  'A plain-language overview of common sponsorship duties for Australian employers considering overseas recruitment.',
  '[{"type":"heading","level":2,"text":"Sponsorship is an ongoing role"},{"type":"richtext","html":"<p>Approved sponsors take on monitoring, record-keeping, and employment condition responsibilities. Understanding those duties before lodging helps avoid compliance issues later.</p>"},{"type":"heading","level":2,"text":"Talk through fit early"},{"type":"richtext","html":"<p>We discuss whether a temporary Skills in Demand pathway or a permanent nomination option is more suitable for the role and the business.</p>"},{"type":"callout","text":"Not legal advice: This article is general migration information for employers. It is not employment law advice.","variant":"info"}]'::jsonb,
  'Amity Immigration Services', '2026-03-18T00:00:00Z', true, 'a1000000-0000-4000-8000-000000000002'
),
(
  'Document checklists: reducing delays before lodgement',
  'document-checklists-before-lodgement',
  'How organised evidence packs help registered migration agents prepare complete visa applications.',
  '[{"type":"heading","level":2,"text":"Start with identity and civil documents"},{"type":"richtext","html":"<p>Passports, birth certificates, and relationship documents should be current and consistently named across forms. Certified translations are often required for non-English documents.</p>"},{"type":"heading","level":2,"text":"Match claims to evidence"},{"type":"richtext","html":"<p>Employment claims, study history, and English results should line up with the forms you lodge. Gaps and inconsistencies are a common source of Department requests for more information.</p>"},{"type":"callout","text":"We tailor checklists: Generic lists are a starting point. Your agent will refine the checklist to your visa subclass and personal circumstances.","variant":"info"}]'::jsonb,
  'Amity Immigration Services', '2026-02-25T00:00:00Z', true, 'a1000000-0000-4000-8000-000000000001'
),
(
  'How to prepare for a partner visa interview',
  'prepare-partner-visa-interview',
  'Practical tips for organising relationship evidence and answering questions clearly if an interview is requested.',
  '[{"type":"heading","level":2,"text":"Start with a clear timeline"},{"type":"richtext","html":"<p>Build a shared timeline of when you met, when the relationship became exclusive, periods of cohabitation, and major milestones. Consistent dates across forms and statements reduce follow-up questions.</p>"},{"type":"heading","level":2,"text":"Organise evidence by theme"},{"type":"richtext","html":"<p>Group documents under financial aspects, household aspects, social aspects, and nature of commitment. Quality and relevance matter more than volume.</p>"},{"type":"callout","text":"Honesty first: Answer questions truthfully. Inconsistencies that look like concealment can harm an application more than an imperfect record.","variant":"info"}]'::jsonb,
  'Amity Immigration Services', '2026-03-01T00:00:00Z', true, 'a1000000-0000-4000-8000-000000000003'
),
(
  'Understanding invitation rounds for skilled visas',
  'understanding-invitation-rounds',
  'A plain-language look at how invitation rounds work for points-tested skilled visas ? and what they do not tell you.',
  '[{"type":"heading","level":2,"text":"What an invitation means"},{"type":"richtext","html":"<p>An invitation to apply is not a visa grant. It means you may lodge a visa application within a set period if you still meet the criteria you claimed in your Expression of Interest.</p>"},{"type":"heading","level":2,"text":"Points are only part of the picture"},{"type":"richtext","html":"<p>Occupation ceilings, state nomination priorities, and your overall competitiveness in the pool all influence outcomes. A high points score improves standing but does not create a right to an invitation.</p>"},{"type":"callout","text":"Keep claims current: If your circumstances change after you submit an EOI, update your profile so any later application matches what you claimed.","variant":"info"}]'::jsonb,
  'Amity Immigration Services', '2026-04-12T00:00:00Z', true, 'a1000000-0000-4000-8000-000000000002'
),
(
  'Documents to gather before a student visa lodgement',
  'documents-before-student-visa',
  'A checklist-style overview of evidence commonly reviewed for subclass 500 applications.',
  '[{"type":"heading","level":2,"text":"Core identity and enrolment"},{"type":"richtext","html":"<p>Expect to provide a valid passport, Confirmation of Enrolment (or offer where appropriate), and Overseas Student Health Cover evidence that covers the proposed stay.</p>"},{"type":"heading","level":2,"text":"Genuine Student and financial capacity"},{"type":"richtext","html":"<p>Prepare statements that explain your study plans, ties to home country, and how you will meet tuition and living costs. Financial evidence should match the story you tell in your application.</p>"},{"type":"callout","text":"Education vs visa: Your education agent advises on courses. We focus on the visa criteria and supporting documents.","variant":"info"}]'::jsonb,
  'Amity Immigration Services', '2026-05-20T00:00:00Z', true, 'a1000000-0000-4000-8000-000000000001'
),
(
  'What to do after a visa refusal',
  'after-a-visa-refusal',
  'First steps after receiving a refusal: read the decision carefully, note deadlines, and get advice before you act.',
  '[{"type":"heading","level":2,"text":"Read the decision record"},{"type":"richtext","html":"<p>Identify which criteria were not met and whether the decision maker raised credibility, documentation, or eligibility issues. Those details shape whether review or a fresh application makes sense.</p>"},{"type":"heading","level":2,"text":"Check time limits early"},{"type":"richtext","html":"<p>Merits review and some other options have strict lodgement windows. Missing a deadline can close a pathway even when the underlying case has merit.</p>"},{"type":"callout","text":"Do not guess: Avoid lodging a new application or review without understanding why the earlier decision failed.","variant":"info"}]'::jsonb,
  'Amity Immigration Services', '2026-06-15T00:00:00Z', true, 'a1000000-0000-4000-8000-000000000001'
)
on conflict (slug) do update set
  title = excluded.title,
  excerpt = excluded.excerpt,
  body = excluded.body,
  author_name = excluded.author_name,
  published_at = excluded.published_at,
  is_published = excluded.is_published,
  team_id = excluded.team_id,
  updated_at = now();

update public.pages
set
  blocks = '[
    {"type":"firm-story","title":"Registered migration advice from Bundoora","body":"Amity Immigration Services is a registered migration agent practice based in Bundoora, Melbourne (MARN 964861). We help individuals, families, and employers navigate Australian visa pathways with clear, practical guidance. The registered agent you meet is the one who prepares and lodges your application."},
    {"type":"team-grid","title":"Our team"},
    {"type":"credentials","title":"Credentials & standards","items":[
      {"title":"Registered Migration Agent","body":"MARN 964861 - registered with the Office of the Migration Agents Registration Authority (MARA)."},
      {"title":"General information only","body":"We provide registered migration advice, not legal representation. This website is general information only."},
      {"title":"Direct agent access","body":"The registered agent you meet is the one who prepares and lodges your application."},
      {"title":"Professional obligations","body":"We follow the MARA Code of Conduct and maintain professional standards in every matter."},
      {"title":"Local Melbourne practice","body":"Consultations are available from our Bundoora office, with appointments arranged around your schedule."},
      {"title":"Pathway-focused advice","body":"We map temporary, permanent, and regional options relevant to your circumstances - without outcome promises."}
    ]},
    {"type":"cta-band","headline":"Speak with a registered migration agent","body":"Book a consultation to discuss your circumstances and the visa pathways that may suit you."}
  ]'::jsonb,
  meta_description = 'Meet the Amity Immigration Services team in Bundoora - registered migration agent MARN 964861.',
  updated_at = now()
where slug = 'about';

update public.pages
set
  blocks = '[
    {"type":"resources-intro","title":"Guides & official resources","body":"Useful guides and links to official Department of Home Affairs resources. Always check the Department website for the most current visa requirements and forms."},
    {"type":"resource-links","title":"Official resources","links":[
      {"label":"Department of Home Affairs","href":"https://immi.homeaffairs.gov.au/","description":"Official Australian visa and citizenship information.","external":true},
      {"label":"Visa listing","href":"https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing","description":"Browse all visa subclasses on the Department website.","external":true},
      {"label":"SkillSelect","href":"https://immi.homeaffairs.gov.au/visas/working-in-australia/skillselect","description":"Expression of Interest system for skilled migration.","external":true},
      {"label":"Visa processing times","href":"https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-processing-times","description":"Current indicative processing time ranges published by the Department.","external":true},
      {"label":"MARA - find a registered agent","href":"https://www.mara.gov.au/","description":"Confirm a migration agent registration on the MARA register.","external":true},
      {"label":"ImmiAccount","href":"https://online.immi.gov.au/lusc/login","description":"Department portal for lodging and managing many visa applications.","external":true}
    ]},
    {"type":"resource-links","title":"On this website","links":[
      {"label":"Visa sub-class directory","href":"/services/visa-sub-classes","description":"Browse published subclasses by migration stream.","external":false},
      {"label":"Points calculator","href":"/services/points-calculator","description":"Indicative GSM points estimate for skilled visas.","external":false},
      {"label":"Insights","href":"/blog","description":"Articles on skilled, partner, student, and employer pathways.","external":false},
      {"label":"Book a consultation","href":"/contact","description":"Send an enquiry to the Bundoora office.","external":false}
    ]},
    {"type":"points-calculator-callout","title":"Skilled migration points calculator","body":"Use our indicative points calculator to explore GSM points for skilled visa subclasses. Results are estimates only - speak with a registered migration agent for advice about your circumstances."}
  ]'::jsonb,
  updated_at = now()
where slug = 'resources';

update public.pages
set
  blocks = '[
    {"type":"services-intro","title":"Migration services","body":"We advise on skilled, employer-sponsored, family, student, business, and visitor visa matters. Each engagement begins with understanding your circumstances and mapping relevant pathways."},
    {"type":"services-list","title":"How we can help"},
    {"type":"visa-streams-callout","title":"Explore visa sub-classes by stream","body":"Browse our directory of Australian visa sub-classes grouped by migration stream - skilled, employer, family, student, business, visitor, and more."},
    {"type":"cta-band","headline":"Not sure where to start?","body":"Book a consultation and we will help you identify the pathways worth exploring for your situation."}
  ]'::jsonb,
  updated_at = now()
where slug = 'services';

update public.pages
set
  blocks = '[
    {"type":"contact-intro","title":"Get in touch","body":"Send us an enquiry and we will respond as soon as we can. For consultations, include a brief summary of your visa interest, current location (onshore or offshore), and any upcoming deadlines."}
  ]'::jsonb,
  updated_at = now()
where slug = 'contact';

update public.pages
set
  blocks = '[
    {"type":"heading","level":2,"text":"Overview"},
    {"type":"richtext","html":"<p>Amity Immigration Services (MARN 964861) respects your privacy. This policy describes how we collect, use, and protect personal information when you use our website or engage our migration services.</p>"},
    {"type":"heading","level":2,"text":"Information we collect"},
    {"type":"richtext","html":"<p>We may collect your name, contact details, visa-related information, identity documents, and other material you provide for migration advice. Enquiries submitted through this website are stored securely for follow-up.</p>"},
    {"type":"heading","level":2,"text":"How we use your information"},
    {"type":"richtext","html":"<p>We use personal information to respond to enquiries, provide registered migration advice, prepare visa applications, communicate with the Department of Home Affairs where authorised, and meet our professional and legal obligations.</p>"},
    {"type":"heading","level":2,"text":"Disclosure"},
    {"type":"richtext","html":"<p>We may disclose information to the Department of Home Affairs, skills assessment authorities, translators, and other service providers where needed to deliver your matter, or where required by law.</p>"},
    {"type":"heading","level":2,"text":"Storage and security"},
    {"type":"richtext","html":"<p>We take reasonable steps to protect personal information from misuse, interference, and unauthorised access. Digital records are stored in systems with access controls appropriate to a migration practice.</p>"},
    {"type":"heading","level":2,"text":"Access and correction"},
    {"type":"richtext","html":"<p>You may request access to the personal information we hold about you, or ask us to correct it, subject to legal exceptions.</p>"},
    {"type":"heading","level":2,"text":"Contact"},
    {"type":"richtext","html":"<p>For privacy enquiries, contact us at info@amityimmigration.com.au or visit our office at 59 Settlement Road, Bundoora VIC 3083.</p>"}
  ]'::jsonb,
  updated_at = now()
where slug = 'privacy';

update public.pages
set
  blocks = '[
    {"type":"heading","level":2,"text":"General information"},
    {"type":"richtext","html":"<p>This website provides general migration information only. It does not constitute legal advice or create a migration agent-client relationship until you engage us in writing.</p>"},
    {"type":"heading","level":2,"text":"Registered migration agent"},
    {"type":"richtext","html":"<p>Amity Immigration Services is a registered migration agent (MARN 964861), not a law firm. We do not provide legal representation or court advocacy.</p>"},
    {"type":"heading","level":2,"text":"No outcome promises"},
    {"type":"richtext","html":"<p>We do not promise visa outcomes, processing times, or success rates. Visa and citizenship decisions are made by the Department of Home Affairs and other authorities.</p>"},
    {"type":"heading","level":2,"text":"Accuracy of information"},
    {"type":"richtext","html":"<p>Migration law and policy change. We aim to keep website content current, but you should confirm requirements with a registered agent and official Department sources before acting.</p>"},
    {"type":"heading","level":2,"text":"Website use"},
    {"type":"richtext","html":"<p>You agree to use this website lawfully and not to misuse enquiry forms or other interactive features. We may suspend access where misuse is detected.</p>"},
    {"type":"heading","level":2,"text":"Third-party links"},
    {"type":"richtext","html":"<p>Links to the Department of Home Affairs and other sites are provided for convenience. We are not responsible for the content or availability of external websites.</p>"},
    {"type":"heading","level":2,"text":"Contact"},
    {"type":"richtext","html":"<p>Questions about these terms: info@amityimmigration.com.au - 59 Settlement Road, Bundoora VIC 3083.</p>"}
  ]'::jsonb,
  updated_at = now()
where slug = 'terms';

update public.pages
set
  meta_title = 'Amity Immigration Services | Registered Migration Agent Bundoora',
  meta_description = 'Registered migration agent (MARN 964861) in Bundoora, Melbourne. Skilled, partner, employer, student, and business visa assistance across Victoria.',
  updated_at = now()
where slug = 'home';
