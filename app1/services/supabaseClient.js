// Cliente de Supabase para el frontend
// Las credenciales se configuran en index.html como window.SUPABASE_URL y window.SUPABASE_ANON_KEY

let supabaseClient = null;

export function initSupabase() {
  if (typeof window.supabase === 'undefined' && typeof supabase === 'undefined') {
    console.warn('Supabase no está disponible. Asegúrate de incluir el script en index.html');
    return null;
  }

  const SUPABASE_URL = window.SUPABASE_URL;
  const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY;
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('⚠️ SUPABASE_URL o SUPABASE_ANON_KEY no están configurados en index.html');
    return null;
  }
  
  const supabaseLib = window.supabase || (typeof supabase !== 'undefined' ? supabase : null);
  if (!supabaseLib || !supabaseLib.createClient) {
    console.warn('⚠️ Supabase createClient no está disponible');
    return null;
  }
  
  supabaseClient = supabaseLib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return supabaseClient;
}

export function getSupabaseClient() {
  if (!supabaseClient) {
    return initSupabase();
  }
  return supabaseClient;
}

export default { initSupabase, getSupabaseClient };

