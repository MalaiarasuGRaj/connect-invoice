import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cewykdqvmxrculddufmr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNld3lrZHF2bXhyY3VsZGR1Zm1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NDQ5NDcsImV4cCI6MjA4ODAyMDk0N30.0PBk6g95U9bmgFSBCKUTTE11-YyxthoZ_4gRhKrAa5A';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
