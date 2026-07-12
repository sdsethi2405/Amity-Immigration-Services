-- Amity Immigration Services — seed data
-- Head Admin account is created by the Stage 4 CLI script, not here.

-- ---------------------------------------------------------------------------
-- Teams
-- ---------------------------------------------------------------------------

insert into public.teams (id, name, slug) values
  ('a1000000-0000-4000-8000-000000000001', 'General', 'general'),
  ('a1000000-0000-4000-8000-000000000002', 'Skilled & Employer', 'skilled-employer'),
  ('a1000000-0000-4000-8000-000000000003', 'Family & Partner', 'family-partner');

-- ---------------------------------------------------------------------------
-- Roles
-- ---------------------------------------------------------------------------

insert into public.roles (id, name, level, scope) values
  ('b1000000-0000-4000-8000-000000000001', 'Head Admin', 100, 'global'),
  ('b1000000-0000-4000-8000-000000000002', 'Editor', 50, 'team'),
  ('b1000000-0000-4000-8000-000000000003', 'Contributor', 20, 'team');

-- ---------------------------------------------------------------------------
-- Site settings
-- ---------------------------------------------------------------------------

insert into public.site_settings (key, value) values
  (
    'compliance_footer',
    '"Registered Migration Agent MARN 964861 — Amity Immigration Services, Bundoora VIC. This is general migration information only, not legal advice."'::jsonb
  ),
  (
    'contact_details',
    '{
      "phone": "+61 3 0000 0000",
      "email": "info@amityimmigration.com.au",
      "address": "59 Settlement Road, Bundoora VIC 3083",
      "office_hours": "Mon–Fri 9:00am–5:00pm"
    }'::jsonb
  ),
  (
    'social_links',
    '{
      "facebook": null,
      "linkedin": null,
      "instagram": null
    }'::jsonb
  );

-- ---------------------------------------------------------------------------
-- Visa subclasses
-- ---------------------------------------------------------------------------

insert into public.visa_subclasses (
  subclass_number,
  name,
  slug,
  stream,
  visa_type,
  pr_pathway,
  status,
  eligibility_summary,
  processing_context,
  sort_order,
  is_published,
  team_id
) values
  -- Skilled
  (
    '189',
    'Skilled Independent',
    '189-skilled-independent',
    'skilled',
    'permanent',
    true,
    'active',
    'Points-tested permanent visa for skilled workers without employer or family sponsorship.',
    'Competitive points threshold; occupation must be on the relevant skilled occupation list.',
    10,
    true,
    'a1000000-0000-4000-8000-000000000002'
  ),
  (
    '190',
    'Skilled Nominated',
    '190-skilled-nominated',
    'skilled',
    'permanent',
    true,
    'active',
    'Points-tested permanent visa for skilled workers nominated by an Australian state or territory.',
    'State nomination requirements vary; additional points may apply for nomination.',
    20,
    true,
    'a1000000-0000-4000-8000-000000000002'
  ),
  (
    '491',
    'Skilled Work Regional (Provisional)',
    '491-skilled-work-regional',
    'skilled',
    'temporary',
    true,
    'active',
    'Provisional visa for skilled workers nominated by a state or territory or sponsored by an eligible family member to live and work in regional Australia.',
    'May provide a pathway to permanent residence via subclass 191 after meeting regional residence requirements.',
    30,
    true,
    'a1000000-0000-4000-8000-000000000002'
  ),
  (
    '485',
    'Temporary Graduate',
    '485-temporary-graduate',
    'skilled',
    'temporary',
    false,
    'active',
    'Temporary visa for recent graduates of eligible Australian qualifications to live, study, and work in Australia.',
    'Streams include Post-Vocational Education Work, Post-Higher Education Work, and Second Post-Higher Education Work.',
    40,
    true,
    'a1000000-0000-4000-8000-000000000002'
  ),
  (
    '858',
    'National Innovation',
    '858-national-innovation',
    'skilled',
    'permanent',
    true,
    'active',
    'Permanent visa for people with an internationally recognised record of exceptional and outstanding achievement in a profession, sport, the arts, or academia and research.',
    'Highly discretionary; requires demonstrated international standing and ongoing benefit to Australia.',
    50,
    true,
    'a1000000-0000-4000-8000-000000000002'
  ),

  -- Employer
  (
    '186',
    'Employer Nomination Scheme',
    '186-employer-nomination-scheme',
    'employer',
    'permanent',
    true,
    'active',
    'Permanent visa for skilled workers nominated by an approved Australian employer.',
    'Streams include Direct Entry, Temporary Residence Transition, and Labour Agreement.',
    10,
    true,
    'a1000000-0000-4000-8000-000000000002'
  ),
  (
    '494',
    'Skilled Employer Sponsored Regional (Provisional)',
    '494-skilled-employer-sponsored-regional',
    'employer',
    'temporary',
    true,
    'active',
    'Provisional visa for skilled workers sponsored by an employer in regional Australia.',
    'May provide a pathway to permanent residence via subclass 191 after meeting regional work and residence requirements.',
    20,
    true,
    'a1000000-0000-4000-8000-000000000002'
  ),
  (
    '482',
    'Skills in Demand',
    '482-skills-in-demand',
    'employer',
    'temporary',
    false,
    'active',
    'Temporary visa for skilled workers sponsored by an approved employer to fill an approved occupation (formerly Temporary Skill Shortage — TSS).',
    'Replaced the TSS framework with Skills in Demand streams (Specialist, Core, and Labour Agreement). Some TSS holders may transition to permanent pathways via subclass 186.',
    30,
    true,
    'a1000000-0000-4000-8000-000000000002'
  ),
  (
    '400',
    'Temporary Work (Short Stay Specialist)',
    '400-temporary-work-short-stay',
    'employer',
    'temporary',
    false,
    'active',
    'Temporary visa for highly specialised work of a short duration, usually up to six months.',
    'Non-ongoing, highly specialised work that cannot reasonably be undertaken by an Australian worker.',
    40,
    true,
    'a1000000-0000-4000-8000-000000000002'
  ),

  -- Family
  (
    '820/801',
    'Partner (Onshore)',
    '820-801-partner-onshore',
    'family',
    'temporary',
    true,
    'active',
    'Onshore partner visa pathway: subclass 820 (temporary) leading to subclass 801 (permanent) for partners of Australian citizens, permanent residents, or eligible New Zealand citizens.',
    'Two-stage process applied for together; temporary 820 granted first, permanent 801 assessed after eligibility period.',
    10,
    true,
    'a1000000-0000-4000-8000-000000000003'
  ),
  (
    '309/100',
    'Partner (Offshore)',
    '309-100-partner-offshore',
    'family',
    'temporary',
    true,
    'active',
    'Offshore partner visa pathway: subclass 309 (temporary) leading to subclass 100 (permanent) for partners applying from outside Australia.',
    'Two-stage process; applicant must be outside Australia at time of grant for the temporary visa.',
    20,
    true,
    'a1000000-0000-4000-8000-000000000003'
  ),
  (
    '300',
    'Prospective Marriage',
    '300-prospective-marriage',
    'family',
    'temporary',
    false,
    'active',
    'Temporary visa to enter Australia to marry an Australian citizen, permanent resident, or eligible New Zealand citizen.',
    'Valid for nine months from grant; intended applicant must apply for a partner visa before the visa expires.',
    30,
    true,
    'a1000000-0000-4000-8000-000000000003'
  ),
  (
    '143',
    'Contributory Parent',
    '143-contributory-parent',
    'family',
    'permanent',
    true,
    'active',
    'Permanent visa for parents of an Australian citizen, permanent resident, or eligible New Zealand citizen who are prepared to pay a higher visa application charge.',
    'Balance of family test and Assurance of Support requirements apply; queue and processing times vary.',
    40,
    true,
    'a1000000-0000-4000-8000-000000000003'
  ),
  (
    '870',
    'Sponsored Parent (Temporary)',
    '870-sponsored-parent-temporary',
    'family',
    'temporary',
    false,
    'active',
    'Temporary visa allowing parents of Australian citizens, permanent residents, or eligible New Zealand citizens to visit Australia for extended periods.',
    'Up to three or five years per visa; a maximum stay of ten years in total across all Sponsored Parent visas.',
    50,
    true,
    'a1000000-0000-4000-8000-000000000003'
  ),

  -- Student
  (
    '500',
    'Student',
    '500-student',
    'student',
    'temporary',
    false,
    'active',
    'Temporary visa to undertake eligible full-time study at an Australian educational institution.',
    'Genuine Student requirement; must maintain enrolment, OSHC, and visa conditions throughout study.',
    10,
    true,
    'a1000000-0000-4000-8000-000000000001'
  ),
  (
    '590',
    'Student Guardian',
    '590-student-guardian',
    'student',
    'temporary',
    false,
    'active',
    'Temporary visa for parents or guardians to provide care and support for a student visa holder under 18 (or older in exceptional circumstances).',
    'Guardian must maintain accommodation and welfare arrangements for the student.',
    20,
    true,
    'a1000000-0000-4000-8000-000000000001'
  ),

  -- Business
  (
    '188',
    'Business Innovation and Investment (Provisional)',
    '188-business-innovation-investment',
    'business',
    'temporary',
    true,
    'closed',
    'Provisional visa for business owners, investors, and entrepreneurs (streams include Business Innovation, Investor, Significant Investor, and Entrepreneur).',
    'Closed to new applicants; existing holders may be eligible to apply for subclass 888 subject to stream requirements.',
    10,
    true,
    'a1000000-0000-4000-8000-000000000001'
  ),
  (
    '888',
    'Business Innovation and Investment (Permanent)',
    '888-business-innovation-investment-permanent',
    'business',
    'permanent',
    true,
    'active',
    'Permanent stage of the Business Innovation and Investment Program for provisional subclass 188 visa holders who meet stream-specific requirements.',
    'Available to eligible subclass 188 holders who satisfy residence, investment, and business activity thresholds.',
    20,
    true,
    'a1000000-0000-4000-8000-000000000001'
  ),

  -- Visitor
  (
    '600',
    'Visitor',
    '600-visitor',
    'visitor',
    'temporary',
    false,
    'active',
    'Temporary visa for tourism, visiting family, or short non-work purposes.',
    'Streams include Tourist, Sponsored Family, Business Visitor, and Approved Destination Status.',
    10,
    true,
    'a1000000-0000-4000-8000-000000000001'
  ),
  (
    '601',
    'Electronic Travel Authority',
    '601-eta',
    'visitor',
    'temporary',
    false,
    'active',
    'Electronic visa for passport holders from eligible countries to visit Australia for tourism or business visitor activities for up to three months per visit.',
    'Must apply from outside Australia; not available to all nationalities.',
    20,
    true,
    'a1000000-0000-4000-8000-000000000001'
  ),
  (
    '651',
    'eVisitor',
    '651-evisitor',
    'visitor',
    'temporary',
    false,
    'active',
    'Free electronic visa for European passport holders to visit Australia for tourism or business visitor activities.',
    'Must apply from outside Australia; valid for up to three months per visit within the 12-month validity period.',
    30,
    true,
    'a1000000-0000-4000-8000-000000000001'
  ),

  -- Bridging
  (
    '010',
    'Bridging A',
    '010-bridging-a',
    'bridging',
    'temporary',
    false,
    'active',
    'Bridging visa allowing lawful stay in Australia after a substantive visa ceases while a new substantive visa application is being processed.',
    'Granted when an onshore application is made and the applicant meets eligibility criteria; conditions vary.',
    10,
    true,
    'a1000000-0000-4000-8000-000000000001'
  ),
  (
    '050',
    'Bridging E',
    '050-bridging-e',
    'bridging',
    'temporary',
    false,
    'active',
    'Bridging visa for people who are unlawful non-citizens or hold a bridging visa and are making a valid application for a substantive visa.',
    'Work rights and travel conditions depend on individual circumstances and visa grant conditions.',
    20,
    true,
    'a1000000-0000-4000-8000-000000000001'
  );

-- ---------------------------------------------------------------------------
-- Blog posts
-- ---------------------------------------------------------------------------

insert into public.posts (
  title,
  slug,
  excerpt,
  body,
  author_name,
  published_at,
  is_published,
  team_id
) values
  (
    'Understanding the Skills in Demand visa (subclass 482)',
    'understanding-skills-in-demand-482',
    'A plain-language overview of Australia''s employer-sponsored Skills in Demand visa and what it means for skilled workers and sponsoring employers.',
    '[
      {"type": "heading", "level": 2, "text": "What changed from the TSS visa?"},
      {"type": "richtext", "html": "<p>The Skills in Demand visa replaced the Temporary Skill Shortage (TSS) subclass 482 framework. It introduces streamlined streams for specialist, core, and labour agreement occupations.</p>"},
      {"type": "callout", "variant": "info", "text": "This article is general information only. Visa requirements change frequently — speak with a registered migration agent for advice about your circumstances."}
    ]'::jsonb,
    'Amity Immigration Services',
    now() - interval '14 days',
    true,
    'a1000000-0000-4000-8000-000000000002'
  ),
  (
    'Partner visa pathways: onshore vs offshore',
    'partner-visa-pathways-onshore-offshore',
    'Comparing the 820/801 onshore and 309/100 offshore partner visa pathways, including timing, location requirements, and what to prepare.',
    '[
      {"type": "heading", "level": 2, "text": "Two stages, one relationship"},
      {"type": "richtext", "html": "<p>Both onshore and offshore partner visas are two-stage pathways: a temporary visa first, then permanent residence after eligibility is met.</p>"},
      {"type": "heading", "level": 2, "text": "Which pathway applies to you?"},
      {"type": "richtext", "html": "<p>Your location at time of application, relationship evidence, and sponsorship eligibility determine the appropriate pathway. Each case is assessed individually.</p>"}
    ]'::jsonb,
    'Amity Immigration Services',
    now() - interval '7 days',
    true,
    'a1000000-0000-4000-8000-000000000003'
  );

-- ---------------------------------------------------------------------------
-- Team members
-- ---------------------------------------------------------------------------

insert into public.team_members (
  name,
  role_title,
  bio,
  sort_order,
  is_published,
  team_id
) values
  (
    'Registered Migration Agent',
    'Principal Migration Agent (MARN 964861)',
    'Provides registered migration advice across skilled, employer-sponsored, family, and student visa pathways from the Bundoora office.',
    10,
    true,
    'a1000000-0000-4000-8000-000000000001'
  ),
  (
    'Skilled Visa Specialist',
    'Migration Agent — Skilled & Employer',
    'Focuses on points-tested visas, state nomination strategy, and employer sponsorship matters including Skills in Demand visa applications.',
    20,
    true,
    'a1000000-0000-4000-8000-000000000002'
  ),
  (
    'Family Visa Specialist',
    'Migration Agent — Family & Partner',
    'Advises on partner, parent, and other family visa pathways with emphasis on thorough evidence preparation and clear communication.',
    30,
    true,
    'a1000000-0000-4000-8000-000000000003'
  );

-- ---------------------------------------------------------------------------
-- Home page
-- ---------------------------------------------------------------------------

insert into public.pages (slug, title, blocks, meta_title, meta_description, team_id) values
  (
    'home',
    'Home',
    '[
      {"type":"hero","headline":"Clear migration advice from Bundoora to wherever your pathway leads.","subhead":"The registered agent you meet is the one who runs your case—thoughtful support for skilled, partner, employer, and family visa matters across Victoria."},
      {"type":"streams-overview","title":"Explore visa pathways","streams":[
        {"stream":"skilled","label":"Skilled migration","description":"Points-tested and state-nominated pathways for workers and graduates."},
        {"stream":"employer","label":"Employer sponsored","description":"Sponsorship options for employers and skilled workers."},
        {"stream":"family","label":"Family & partner","description":"Partner, parent, and other family visa pathways."},
        {"stream":"student","label":"Student","description":"Study and guardian visas for international students."},
        {"stream":"business","label":"Business & investment","description":"Business innovation and investment migration options."},
        {"stream":"visitor","label":"Visitor","description":"Short-stay visits, tourism, and business visitor activities."}
      ]},
      {"type":"why-amity","title":"Why clients work with Amity","points":[
        {"title":"Registered migration agent","body":"Advice delivered by a registered migration agent (MARN 964861), not legal representation."},
        {"title":"Direct access to your agent","body":"The registered agent you meet is the one who prepares and lodges your application."},
        {"title":"Plain-language guidance","body":"We explain requirements, evidence, and next steps in clear terms—without outcome promises."},
        {"title":"Pathway-focused planning","body":"We map temporary, permanent, and regional options relevant to your circumstances."}
      ]},
      {"type":"featured-services","title":"How we can help"},
      {"type":"latest-insights","title":"Latest insights"},
      {"type":"cta-band","headline":"Ready to talk through your visa options?","body":"Book a consultation to discuss your circumstances and the pathways that may suit you."}
    ]'::jsonb,
    'Amity Immigration Services | Migration Agent Melbourne',
    'Registered migration agent in Bundoora, Melbourne. Skilled, partner, and employer visa assistance across Victoria.',
    'a1000000-0000-4000-8000-000000000001'
  )
on conflict (slug) do update set
  title = excluded.title,
  blocks = excluded.blocks,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  team_id = excluded.team_id,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- Services
-- ---------------------------------------------------------------------------

insert into public.services (title, slug, summary, sort_order, is_published, team_id) values
  (
    'Skilled visa assessment',
    'skilled-visa-assessment',
    'Review eligibility for points-tested and nominated skilled visas.',
    10,
    true,
    'a1000000-0000-4000-8000-000000000002'
  ),
  (
    'Partner & family visas',
    'partner-family-visas',
    'Guidance on partner, parent, and family sponsorship applications.',
    20,
    true,
    'a1000000-0000-4000-8000-000000000003'
  ),
  (
    'Employer sponsorship advice',
    'employer-sponsorship-advice',
    'Support for employers and workers navigating sponsorship obligations.',
    30,
    true,
    'a1000000-0000-4000-8000-000000000002'
  )
on conflict (slug) do update set
  title = excluded.title,
  summary = excluded.summary,
  sort_order = excluded.sort_order,
  is_published = excluded.is_published,
  team_id = excluded.team_id,
  updated_at = now();

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
