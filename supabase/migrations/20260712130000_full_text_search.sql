-- Full-text search across published services, visa subclasses, and posts

alter table public.services
  add column if not exists search_vector tsvector
  generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A')
    || setweight(to_tsvector('english', coalesce(summary, '')), 'B')
  ) stored;

alter table public.visa_subclasses
  add column if not exists search_vector tsvector
  generated always as (
    setweight(to_tsvector('english', coalesce(subclass_number, '')), 'A')
    || setweight(to_tsvector('english', coalesce(name, '')), 'A')
    || setweight(to_tsvector('english', coalesce(eligibility_summary, '')), 'B')
  ) stored;

alter table public.posts
  add column if not exists search_vector tsvector
  generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A')
    || setweight(to_tsvector('english', coalesce(excerpt, '')), 'B')
  ) stored;

create index if not exists services_search_vector_idx
  on public.services using gin (search_vector);

create index if not exists visa_subclasses_search_vector_idx
  on public.visa_subclasses using gin (search_vector);

create index if not exists posts_search_vector_idx
  on public.posts using gin (search_vector);

create or replace function public.search_content(p_query text)
returns table (
  result_type text,
  title text,
  slug text,
  snippet text,
  rank real
)
language sql
stable
security invoker
set search_path = public
as $$
  with q as (
    select websearch_to_tsquery('english', trim(both from p_query)) as query
  )
  select
    results.result_type,
    results.title,
    results.slug,
    results.snippet,
    results.rank
  from (
    select
      'service'::text as result_type,
      s.title as title,
      s.slug as slug,
      ts_headline(
        'english',
        coalesce(nullif(s.summary, ''), s.title),
        q.query,
        'MaxWords=24, MinWords=5, MaxFragments=1, FragmentDelimiter= … '
      ) as snippet,
      ts_rank(s.search_vector, q.query) as rank
    from public.services s
    cross join q
    where s.is_published = true
      and q.query <> ''::tsquery
      and s.search_vector @@ q.query

    union all

    select
      'visa_subclass'::text as result_type,
      (v.subclass_number || ' — ' || v.name) as title,
      v.slug as slug,
      ts_headline(
        'english',
        coalesce(nullif(v.eligibility_summary, ''), v.name),
        q.query,
        'MaxWords=24, MinWords=5, MaxFragments=1, FragmentDelimiter= … '
      ) as snippet,
      ts_rank(v.search_vector, q.query) as rank
    from public.visa_subclasses v
    cross join q
    where v.is_published = true
      and q.query <> ''::tsquery
      and v.search_vector @@ q.query

    union all

    select
      'post'::text as result_type,
      p.title as title,
      p.slug as slug,
      ts_headline(
        'english',
        coalesce(nullif(p.excerpt, ''), p.title),
        q.query,
        'MaxWords=24, MinWords=5, MaxFragments=1, FragmentDelimiter= … '
      ) as snippet,
      ts_rank(p.search_vector, q.query) as rank
    from public.posts p
    cross join q
    where p.is_published = true
      and q.query <> ''::tsquery
      and p.search_vector @@ q.query
  ) results
  where length(trim(both from coalesce(p_query, ''))) > 0
  order by results.rank desc, results.title asc
  limit 30;
$$;

grant execute on function public.search_content(text) to anon, authenticated;
