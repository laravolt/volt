create table if not exists users (
  id text primary key not null,
  name text,
  email text not null unique,
  phone text,
  avatar text,
  is_verified integer not null default 0,
  is_admin integer not null default 0,
  password text not null,
  created_at integer not null,
  updated_at integer not null
);
