-- audit_trigger() body has no object references, so search_path = '' is a safe drop-in
create or replace function public.audit_trigger()
 returns trigger
 language plpgsql
 set search_path = ''
as $function$
begin
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$function$;
