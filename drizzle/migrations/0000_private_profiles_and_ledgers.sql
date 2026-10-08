CREATE TABLE public.profiles (
 id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 display_name text NOT NULL DEFAULT '',
 avatar_url text,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE FUNCTION public.create_user_profile() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 INSERT INTO public.profiles(id, display_name, avatar_url) VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''), NEW.raw_user_meta_data->>'avatar_url');
 RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.create_user_profile() FROM PUBLIC;
CREATE TRIGGER create_profile_on_signup AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.create_user_profile();
INSERT INTO public.profiles(id, display_name, avatar_url) SELECT id, COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', ''), raw_user_meta_data->>'avatar_url' FROM auth.users ON CONFLICT DO NOTHING;
CREATE TABLE public.ledger_entries (
 user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 ledger_key text NOT NULL CHECK (ledger_key IN ('ledger:fedwatch', 'ledger:dxy-exy')),
 record_date date NOT NULL,
 data jsonb NOT NULL CHECK (jsonb_typeof(data) = 'object'),
 PRIMARY KEY(user_id, ledger_key, record_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ledger_entries TO authenticated;
GRANT ALL ON public.ledger_entries TO service_role;
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own ledger" ON public.ledger_entries FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Insert own ledger" ON public.ledger_entries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Update own ledger" ON public.ledger_entries FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Delete own ledger" ON public.ledger_entries FOR DELETE TO authenticated USING (auth.uid() = user_id);