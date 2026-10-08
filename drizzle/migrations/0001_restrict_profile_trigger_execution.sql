REVOKE EXECUTE ON FUNCTION public.create_user_profile() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_profile() TO service_role;