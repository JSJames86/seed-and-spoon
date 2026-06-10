-- Pin search_path = '' on all remaining functions flagged by
-- function_search_path_mutable. Three needed reference qualification:
--   - generate_receipt_number: uuid_generate_v4() lives in `extensions`
--   - food_resources_set_location: PostGIS functions/types live in `extensions`
--   - allow_initial_ed_bootstrap: role_assignments/roles live in `public`
-- owns_profile previously had a no-op `set search_path = '';` body statement
-- (doesn't set proconfig); replaced with the proper function-level clause.

create or replace function public.food_resources_set_search_tsv()
 returns trigger
 language plpgsql
 set search_path = ''
as $function$
begin
  new.search_tsv := to_tsvector('english', coalesce(new.name,'') || ' ' || coalesce(new.organization_name,'') || ' ' || coalesce(array_to_string(new.services, ' '), ''));
  return new;
end;
$function$;

create or replace function public.owns_profile(profile_uuid uuid)
 returns boolean
 language sql
 security definer
 set search_path = ''
as $function$
  select (profile_uuid = (select auth.uid()));
$function$;

create or replace function public.notify_channel_members()
 returns trigger
 language plpgsql
 security definer
 set search_path = ''
as $function$
declare
  member_id uuid;
  channel_name text;
begin
  select name into channel_name from public.channels where id = new.channel_id;

  for member_id in
    select cm.member_id
    from public.channel_members cm
    where cm.channel_id = new.channel_id
      and cm.member_id != new.sender_id
  loop
    insert into public.notifications (user_id, type, title, body, href)
    values (
      member_id,
      'message.new',
      new.username || ' posted in #' || coalesce(channel_name, 'channel'),
      left(new.content, 80),
      '/messages'
    );
  end loop;

  if new.sender_id != '836fc70f-1fd5-4d61-9250-a806cb92593d' then
    if not exists (
      select 1 from public.channel_members
      where channel_id = new.channel_id
      and member_id = '836fc70f-1fd5-4d61-9250-a806cb92593d'
    ) then
      insert into public.notifications (user_id, type, title, body, href)
      values (
        '836fc70f-1fd5-4d61-9250-a806cb92593d',
        'message.new',
        new.username || ' posted in #' || coalesce(channel_name, 'channel'),
        left(new.content, 80),
        '/messages'
      );
    end if;
  end if;

  return new;
end;
$function$;

create or replace function public.set_affiliates_updated_at()
 returns trigger
 language plpgsql
 set search_path = ''
as $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

create or replace function public.set_updated_at()
 returns trigger
 language plpgsql
 set search_path = ''
as $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

create or replace function public.generate_receipt_number()
 returns trigger
 language plpgsql
 security definer
 set search_path = ''
as $function$
begin
  if new.receipt_number is null or new.receipt_number = '' then
    if new.id is null then
      new.id := extensions.uuid_generate_v4();
    end if;
    new.receipt_number := 'RCT-' || to_char(new.donated_at at time zone 'UTC', 'YYYY') || '-' || lpad(right(new.id::text,8), 8, '0');
  end if;
  return new;
end;
$function$;

create or replace function public.set_posts_updated_at()
 returns trigger
 language plpgsql
 set search_path = ''
as $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

create or replace function public.audit_trigger_fn()
 returns trigger
 language plpgsql
 security definer
 set search_path = ''
as $function$
declare
  v_severity text := 'info';
begin
  insert into public.audit_log (
    actor_id,
    actor_email,
    actor_roles,
    table_name,
    record_id,
    changed_columns,
    old_data,
    new_data,
    severity,
    created_at
  )
  values (
    auth.uid(),
    current_setting('request.jwt.claims', true)::jsonb->>'email',
    array(
      select jsonb_array_elements_text(
        coalesce(
          current_setting('request.jwt.claims', true)::jsonb->'roles',
          '[]'::jsonb
        )
      )
    ),
    tg_table_name,
    coalesce(new.id, old.id),
    case
      when tg_op = 'UPDATE' then array(
        select key
        from jsonb_each(to_jsonb(new))
        where to_jsonb(new)->key is distinct from to_jsonb(old)->key
      )
      else null
    end,
    to_jsonb(old),
    to_jsonb(new),
    v_severity,
    now()
  );

  return coalesce(new, old);
end;
$function$;

create or replace function public.allow_initial_ed_bootstrap()
 returns boolean
 language sql
 set search_path = ''
as $function$
  select not exists (
    select 1
    from public.role_assignments ra
    join public.roles r on r.id = ra.role_id
    where r.name in ('admin', 'executive_director')
  );
$function$;

create or replace function public.food_resources_set_location()
 returns trigger
 language plpgsql
 set search_path = ''
as $function$
begin
  new.location := extensions.ST_SetSRID(extensions.ST_MakePoint(new.longitude::double precision, new.latitude::double precision), 4326)::extensions.geography;
  return new;
end;
$function$;

create or replace function public.handle_new_user()
 returns trigger
 language plpgsql
 security definer
 set search_path = ''
as $function$
begin
  insert into public.profiles (id, role) values (new.id, 'user')
  on conflict (id) do nothing;
  return new;
exception when others then
  raise log 'handle_new_user error for %: %', new.id, sqlerrm;
  return new;
end;
$function$;
