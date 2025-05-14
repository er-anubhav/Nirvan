import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://hewopkgelimedbbcrdfg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhld29wa2dlbGltZWRiYmNyZGZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwODAyMTUsImV4cCI6MjA2MjY1NjIxNX0.DHclJzmwyaNAzev4Il-DfWhgJXtUfTb94emoFPv5AGU";


export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);