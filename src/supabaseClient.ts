import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jgippiziieycqwyhzqnl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnaXBwaXppaWV5Y3F3eWh6cW5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MDkzMTAsImV4cCI6MjA2OTA4NTMxMH0.w91XWaMaJdqS6mI3bay1W83cvbjT2NpZLufLYauUzDg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 