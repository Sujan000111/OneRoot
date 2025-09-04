'use strict';

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let supabase = null;

function getClient() {
  if (!supabase) {
    const key = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
    if (!SUPABASE_URL || !key) {
      // eslint-disable-next-line no-console
      console.warn('[Supabase] Missing SUPABASE_URL or key. URL:', !!SUPABASE_URL, 'KEY:', !!key);
    }
    supabase = createClient(SUPABASE_URL, key);
  }
  return supabase;
}

function getConfigStatus() {
  return {
    hasUrl: !!SUPABASE_URL,
    usingServiceRole: !!SUPABASE_SERVICE_ROLE_KEY,
    hasAnon: !!SUPABASE_ANON_KEY,
  };
}

module.exports = { getClient, getConfigStatus };
