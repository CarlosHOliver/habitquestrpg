import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pyytmavaurldksqirgme.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5eXRtYXZhdXJsZGtzcWlyZ21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwOTM4MDksImV4cCI6MjA3MDY2OTgwOX0._7A2C1xpWXcWnqaRM2R89_YL-sSVAuxaVK1mPNNAdSc'

export const supabase = createClient(supabaseUrl, supabaseKey)
