-- Rename CMS roles: Editor -> Admin, Contributor -> Staff (keep UUIDs/levels/scopes)
update public.roles set name = 'Admin' where name = 'Editor';
update public.roles set name = 'Staff' where name = 'Contributor';
