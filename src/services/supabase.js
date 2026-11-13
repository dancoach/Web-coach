import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(
  'https://lfbgbfkpppotcuyaikdn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmYmdiZmtwcHBvdGN1eWFpa2RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzOTA1MDgsImV4cCI6MjA5Njk2NjUwOH0.WVbK_X0fa3Ksk6lScwUItU_sJC3M2-h8S-pbvBioP8g'
);
