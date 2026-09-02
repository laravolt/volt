create table if not exists sessions (
  id text primary key not null,
  user_id text,
  data text not null default '[{},{}]',
  expires_at integer not null,
  created_at integer not null,
  updated_at integer not null
);
create index if not exists sessions_user_id_idx on sessions (user_id);
create index if not exists sessions_expires_at_idx on sessions (expires_at);
