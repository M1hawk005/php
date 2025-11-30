-- Create the threads table
create table public.threads (
  id uuid default gen_random_uuid() primary key,
  title text,
  content text not null,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  bumped_at timestamp with time zone default timezone('utc'::text, now()) not null,
  reply_count integer default 0
);

-- Create the posts (replies) table
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  thread_id uuid references public.threads(id) on delete cascade not null,
  content text not null,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.threads enable row level security;
alter table public.posts enable row level security;

-- Create policies to allow anonymous access (since it's an anonymous forum)
-- Allow anyone to read threads
create policy "Allow public read access on threads"
on public.threads for select
to public
using (true);

-- Allow anyone to create threads
create policy "Allow public insert access on threads"
on public.threads for insert
to public
with check (true);

-- Allow anyone to read posts
create policy "Allow public read access on posts"
on public.posts for select
to public
using (true);

-- Allow anyone to create posts
create policy "Allow public insert access on posts"
on public.posts for insert
to public
with check (true);

-- Create a storage bucket for forum images if it doesn't exist
insert into storage.buckets (id, name, public)
values ('forum-images', 'forum-images', true)
on conflict (id) do nothing;

-- Allow public access to forum images
create policy "Allow public read access on forum images"
on storage.objects for select
to public
using ( bucket_id = 'forum-images' );

-- Allow public upload to forum images
create policy "Allow public insert access on forum images"
on storage.objects for insert
to public
with check ( bucket_id = 'forum-images' );


ALTER TABLE public.threads ADD COLUMN IF NOT EXISTS secret_key text;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS secret_key text;