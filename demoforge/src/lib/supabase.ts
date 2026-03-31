import { createClient } from '@supabase/supabase-js'
import { mockDb } from './mockDb'

const rawUrl = import.meta.env.VITE_SUPABASE_URL || ''
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

const isConfigured = rawUrl.startsWith('https://') && !rawUrl.includes('placeholder') && rawKey.length > 20

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let supabaseClient: any

if (isConfigured) {
  supabaseClient = createClient(rawUrl, rawKey)
} else {
  // Use localStorage mock — fully functional offline
  supabaseClient = mockDb
  console.info('[Demoforge] Running in local mode (no Supabase). Data is stored in localStorage.')
}

export const supabase = supabaseClient
export const isSupabaseConfigured = () => isConfigured
