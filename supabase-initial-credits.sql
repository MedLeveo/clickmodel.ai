-- =============================================
-- TRIGGER: Give 5 Initial Credits to New Users
-- =============================================
-- This trigger automatically creates a user_credits record
-- with 5 monthly credits when a new user signs up

CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Insert initial credits for new user
    INSERT INTO public.user_credits (
        user_id,
        monthly_credits,
        bonus_credits,
        total_credits_used,
        subscription_tier,
        renewal_date
    ) VALUES (
        NEW.id,
        5,  -- 5 créditos iniciais
        0,  -- Sem bônus inicialmente
        0,  -- Nenhum crédito usado ainda
        'free',  -- Plano gratuito
        NOW() + INTERVAL '30 days'  -- Renovação em 30 dias
    );

    RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created_credits ON auth.users;

-- Create trigger that fires when a new user is created
CREATE TRIGGER on_auth_user_created_credits
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_credits();

-- =============================================
-- GRANT PERMISSIONS
-- =============================================

GRANT EXECUTE ON FUNCTION public.handle_new_user_credits() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user_credits() TO service_role;
