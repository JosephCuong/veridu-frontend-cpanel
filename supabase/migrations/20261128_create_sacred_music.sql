-- VERIDU Sacred Music (Thánh Nhạc) Phase 1 Schema
CREATE TABLE IF NOT EXISTS public.sacred_music (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  title_en TEXT,
  composer TEXT NOT NULL DEFAULT 'Ban Thánh Nhạc VERIDU',
  lyricist TEXT,
  liturgical_season TEXT NOT NULL DEFAULT 'Thường Niên',
  mass_part TEXT NOT NULL DEFAULT 'Đáp Ca',
  liturgical_year TEXT DEFAULT 'Chung',
  psalm_number INTEGER,
  musical_key TEXT,
  voicing TEXT DEFAULT 'Đơn ca / Cộng đoàn',
  youtube_url TEXT,
  karaoke_youtube_url TEXT,
  audio_url TEXT,
  pdf_url TEXT,
  pdf_drive_id TEXT,
  thumbnail_url TEXT,
  scripture_ref TEXT,
  scripture_book_slug TEXT,
  scripture_chapter INTEGER,
  related_post_slug TEXT,
  lyrics TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'published',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  views INTEGER NOT NULL DEFAULT 0,
  downloads INTEGER NOT NULL DEFAULT 0,
  author_id UUID DEFAULT 'eef94645-01fb-471f-9b10-cdd3fea35143',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sacred_music_status_created ON public.sacred_music (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sacred_music_season ON public.sacred_music (liturgical_season);
CREATE INDEX IF NOT EXISTS idx_sacred_music_mass_part ON public.sacred_music (mass_part);
CREATE INDEX IF NOT EXISTS idx_sacred_music_psalm ON public.sacred_music (psalm_number);

ALTER TABLE public.sacred_music ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'sacred_music' AND policyname = 'Public Read Sacred Music') THEN
    CREATE POLICY "Public Read Sacred Music" ON public.sacred_music FOR SELECT USING (status = 'published' OR (SELECT is_admin()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'sacred_music' AND policyname = 'Admin Insert Sacred Music') THEN
    CREATE POLICY "Admin Insert Sacred Music" ON public.sacred_music FOR INSERT WITH CHECK ((SELECT is_admin()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'sacred_music' AND policyname = 'Admin Update Sacred Music') THEN
    CREATE POLICY "Admin Update Sacred Music" ON public.sacred_music FOR UPDATE USING ((SELECT is_admin())) WITH CHECK ((SELECT is_admin()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'sacred_music' AND policyname = 'Admin Delete Sacred Music') THEN
    CREATE POLICY "Admin Delete Sacred Music" ON public.sacred_music FOR DELETE USING ((SELECT is_admin()));
  END IF;
END $$;
