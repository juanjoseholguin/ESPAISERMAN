const { createClient } = require("@supabase/supabase-js");

// Usar variables de entorno o valores por defecto
const SUPABASE_URL = process.env.SUPABASE_URL || "https://zdqqueneqkltmoknqvhe.supabase.co";
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkcXF1ZW5lcWtsdG1va25xdmhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1OTExMTQsImV4cCI6MjA3NDE2NzExNH0.0FOu2bNM5piwgVvEaaTi9XrLY6VvfS6D97mQKilz50A";

console.log("📦 Configuración de Supabase:");
console.log("   URL:", SUPABASE_URL);
console.log("   API Key:", SUPABASE_API_KEY ? `${SUPABASE_API_KEY.substring(0, 20)}...` : "No configurada");

// Create a single supabase client for interacting with your database
const supabase = createClient(SUPABASE_URL, SUPABASE_API_KEY);

module.exports = supabase;
