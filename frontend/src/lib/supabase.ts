import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hewopkgelimedbbcrdfg.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhld29wa2dlbGltZWRiYmNyZGZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwODAyMTUsImV4cCI6MjA2MjY1NjIxNX0.DHclJzmwyaNAzev4Il-DfWhgJXtUfTb94emoFPv5AGU'

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key:', supabaseAnonKey)

export const supabase = createClient(supabaseUrl, supabaseAnonKey)