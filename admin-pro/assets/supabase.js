// ═══════════════════════════════════════════════════════════════
// Supabase Client — HELP! Confort Back-Office
// ═══════════════════════════════════════════════════════════════

const SUPABASE_URL = 'https://btcbjwqiivhpwoszomhg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Zyd4jmm3_qOcTjFdN8pnBw_sOybyyB2';

// Charge la librairie Supabase JS depuis CDN
const supabaseLoader = new Promise((resolve, reject) => {
  if (window.supabase) return resolve(window.supabase);
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
  script.onload = () => resolve(window.supabase);
  script.onerror = reject;
  document.head.appendChild(script);
});

window.HCSupabase = {
  client: null,
  ready: false,

  async init() {
    if (this.client) return this.client;
    const supabase = await supabaseLoader;
    this.client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        storage: window.localStorage,
        storageKey: 'hc-admin-auth'
      }
    });
    this.ready = true;
    return this.client;
  },

  async getUser() {
    const c = await this.init();
    const { data: { user } } = await c.auth.getUser();
    return user;
  },

  async signIn(email, password) {
    const c = await this.init();
    const { data, error } = await c.auth.signInWithPassword({ email, password });
    return { data, error };
  },

  async signOut() {
    const c = await this.init();
    await c.auth.signOut();
  },

  STORAGE_URL: `${SUPABASE_URL}/storage/v1/object/public`,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,

  // Helper : retourne le header Authorization avec le JWT user (pour appeler les Edge Functions)
  async authHeaders() {
    const c = await this.init();
    const { data: { session } } = await c.auth.getSession();
    return {
      'Authorization': 'Bearer ' + (session?.access_token || SUPABASE_ANON_KEY),
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY
    };
  },

  fnUrl(name) { return `${SUPABASE_URL}/functions/v1/${name}`; }
};
