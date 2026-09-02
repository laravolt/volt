create table if not exists password_reset_tokens (
  id integer primary key autoincrement,
  email text not null,
  token text not null unique,
  expires_at integer not null,
  created_at integer not null
);
create index if not exists password_reset_tokens_email_idx on password_reset_tokens (email);
