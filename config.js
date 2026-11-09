// Paste your Supabase Project URL and publishable key below.
// These two values are intended for browser use. NEVER put a service_role key here.
window.BIGSALE_CONFIG = {
  SUPABASE_URL: "https://vifoftkriiefdpygxhbz.supabase.co/rest/v1/",
  SUPABASE_PUBLISHABLE_KEY: "sb_publishable_g3_oBfJ2JubNmSy7Wwehtw_VTfuUpEh"
};
window.sb = null;
try {
  if (window.BIGSALE_CONFIG.SUPABASE_URL.startsWith("https://") &&
      window.BIGSALE_CONFIG.SUPABASE_PUBLISHABLE_KEY.startsWith("sb_publishable_")) {
    window.sb = window.supabase.createClient(
      window.BIGSALE_CONFIG.SUPABASE_URL,
      window.BIGSALE_CONFIG.SUPABASE_PUBLISHABLE_KEY
    );
  }
} catch (e) { console.error(e); }
