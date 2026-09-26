-- Design Harmony Supabase Database Setup Script
-- Copy and paste this script into your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql) and click RUN.

-- 1. Create Site Content & Settings Table (for live Admin changes sync across all browsers)
CREATE TABLE IF NOT EXISTS public.dh_site_data (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Leads Table (for capturing form inquiries in Supabase)
CREATE TABLE IF NOT EXISTS public.dh_leads (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    name TEXT,
    email TEXT,
    contact TEXT,
    dob TEXT,
    service_type TEXT,
    project_size TEXT,
    project_budget TEXT,
    location TEXT,
    challenges TEXT
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.dh_site_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dh_leads ENABLE ROW LEVEL SECURITY;

-- 4. Create Security Policies for public.dh_site_data
DROP POLICY IF EXISTS "Allow public read access dh_site_data" ON public.dh_site_data;
CREATE POLICY "Allow public read access dh_site_data" 
ON public.dh_site_data FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Allow public insert access dh_site_data" ON public.dh_site_data;
CREATE POLICY "Allow public insert access dh_site_data" 
ON public.dh_site_data FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update access dh_site_data" ON public.dh_site_data;
CREATE POLICY "Allow public update access dh_site_data" 
ON public.dh_site_data FOR UPDATE 
USING (true);

DROP POLICY IF EXISTS "Allow public delete access dh_site_data" ON public.dh_site_data;
CREATE POLICY "Allow public delete access dh_site_data" 
ON public.dh_site_data FOR DELETE 
USING (true);

-- 5. Create Security Policies for public.dh_leads
DROP POLICY IF EXISTS "Allow public insert access dh_leads" ON public.dh_leads;
CREATE POLICY "Allow public insert access dh_leads" 
ON public.dh_leads FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public select access dh_leads" ON public.dh_leads;
CREATE POLICY "Allow public select access dh_leads" 
ON public.dh_leads FOR SELECT 
USING (true);
