ALTER TABLE public.games
ALTER COLUMN grade_level TYPE text
USING grade_level::text;
