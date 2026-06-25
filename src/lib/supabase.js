import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://alzrmaspikviqevjrwjh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsenJtYXNwaWt2aXFldmpyd2poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMzYwMTUsImV4cCI6MjA5NzkxMjAxNX0.gLf_VVGZaRU_EFJictlDGxy4GSM6hvGoZirnc-GMWpo'
)

export const ADMIN_EMAIL = 'mohammedshafkatsaruwar@gmail.com'
