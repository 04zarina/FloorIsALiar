-- ==============================================================================
-- File: supabase/verify.sql
-- Project: FloorIsALiar
-- Description: Read-only verification queries to validate database schema,
--              Row Level Security (RLS), policies, constraints, and triggers.
-- NOTE: None of these queries alter or write any data or schema.
-- ==============================================================================


-- ==============================================================================
-- CHECK 1: Table Existence in Public Schema
-- Checks whether expected tables (profiles, game_sessions, achievements) exist.
-- ==============================================================================
SELECT
  expected.table_name,
  CASE
    WHEN t.table_name IS NOT NULL THEN 'EXISTS'
    ELSE 'MISSING'
  END AS status
FROM (
  VALUES
    ('profiles'),
    ('game_sessions'),
    ('achievements')
) AS expected(table_name)
LEFT JOIN information_schema.tables t
  ON t.table_schema = 'public'
 AND t.table_name = expected.table_name
ORDER BY expected.table_name;


-- ==============================================================================
-- CHECK 2: Row Level Security (RLS) Status
-- Checks whether RLS is enabled on all target tables in the public schema.
-- ==============================================================================
SELECT
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'game_sessions', 'achievements')
ORDER BY tablename;


-- ==============================================================================
-- CHECK 3: Active RLS Policies
-- Inspects every policy: table, policy name, command (SELECT, INSERT, etc.),
-- targeted roles, USING clause (qual), and WITH CHECK clause.
-- ==============================================================================
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  roles,
  qual AS using_expression,
  with_check AS with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'game_sessions', 'achievements')
ORDER BY tablename, cmd, policyname;


-- ==============================================================================
-- CHECK 4: Constraints on game_sessions
-- Verifies CHECK constraints (non-negative scores/hits/misses, accuracy 0-100, etc.)
-- ==============================================================================
SELECT
  con.conname AS constraint_name,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE nsp.nspname = 'public'
  AND rel.relname = 'game_sessions'
  AND con.contype = 'c'
ORDER BY con.conname;


-- ==============================================================================
-- CHECK 5: Automatic Profile Creation Trigger on auth.users
-- Verifies the trigger and function that automatically create a profile on signup.
-- ==============================================================================
SELECT
  t.tgname AS trigger_name,
  n.nspname AS target_schema,
  c.relname AS target_table,
  p.proname AS function_name,
  CASE t.tgenabled
    WHEN 'O' THEN 'Enabled'
    WHEN 'D' THEN 'Disabled'
    WHEN 'R' THEN 'Replica only'
    WHEN 'A' THEN 'Always enabled'
    ELSE t.tgenabled::text
  END AS status,
  pg_get_triggerdef(t.oid) AS trigger_definition
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
JOIN pg_proc p ON p.oid = t.tgfoid
WHERE n.nspname = 'auth'
  AND c.relname = 'users'
  AND NOT t.tgisinternal
ORDER BY t.tgname;
