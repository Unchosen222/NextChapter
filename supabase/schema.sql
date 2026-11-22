-- ==============================================================================
-- NextChapter E-Learning Platform & Blockchain Credentialing Database Schema
-- Supabase PostgreSQL Setup Script
-- Project URL: https://cfklbhhrmxyjawzaqhyc.supabase.co
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('Student', 'Teacher', 'Admin')),
    wallet_address TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Courses Table
CREATE TABLE IF NOT EXISTS public.courses (
    id TEXT PRIMARY KEY, -- e.g. 'CS-AI-01'
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) DEFAULT 0.00,
    thumbnail_url TEXT,
    skills TEXT[] DEFAULT '{}',
    duration_hours INT DEFAULT 40,
    instructor_name TEXT NOT NULL,
    instructor_wallet TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Lessons Table
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    youtube_url TEXT NOT NULL,
    instruction TEXT,
    order_number INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Enrollments Table
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE,
    purchase_price NUMERIC(10, 2) DEFAULT 0.00,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- 6. Lesson Progress Table
CREATE TABLE IF NOT EXISTS public.lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
    course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT TRUE,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- 7. Certificates Table
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cert_id TEXT UNIQUE NOT NULL, -- e.g. 'NC-2026-AI01'
    course_id TEXT REFERENCES public.courses(id) ON DELETE RESTRICT,
    student_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    student_name TEXT NOT NULL,
    recipient_address TEXT NOT NULL,
    issuer_name TEXT NOT NULL,
    cert_hash TEXT NOT NULL, -- Cryptographic SHA-256 fingerprint
    tx_hash TEXT,
    issue_date TIMESTAMPTZ DEFAULT NOW(),
    is_revoked BOOLEAN DEFAULT FALSE,
    revoke_reason TEXT,
    revoked_at TIMESTAMPTZ,
    pdf_data_url TEXT
);

-- 8. Coupons Table
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    discount_percentage INT NOT NULL CHECK (discount_percentage BETWEEN 1 AND 100),
    is_active BOOLEAN DEFAULT TRUE,
    expiry_date TIMESTAMPTZ
);

-- 9. Seed Initial Data
INSERT INTO public.users (id, name, email, role, wallet_address)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Alexander Vance', 'alex@nextchapter.edu', 'Student', '0x30035Ca790093E941bf4AD0f60056c7Bd7995A10'),
  ('00000000-0000-0000-0000-000000000002', 'Dr. Arisara Thorne', 'teacher@nextchapter.edu', 'Teacher', '0x90F79bf6EB2c4f870365E785982E1f101E93b906'),
  ('00000000-0000-0000-0000-000000000003', 'NextChapter Admin', 'admin@nextchapter.edu', 'Admin', '0x90F79bf6EB2c4f870365E785982E1f101E93b906')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.coupons (code, discount_percentage, is_active)
VALUES
  ('NEXT50', 50, true),
  ('SPU2026', 100, true),
  ('WELCOME20', 20, true)
ON CONFLICT (code) DO NOTHING;
