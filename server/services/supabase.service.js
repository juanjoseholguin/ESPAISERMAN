const { createClient } = require("@supabase/supabase-js");
// Create a single supabase client for interacting with your database
console.log("Supabase URL:", process.env.SUPABASE_URL);
console.log("Supabase API Key:", process.env.SUPABASE_API_KEY);
const supabase = createClient(
  "https://zdqqueneqkltmoknqvhe.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkcXF1ZW5lcWtsdG1va25xdmhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1OTExMTQsImV4cCI6MjA3NDE2NzExNH0.0FOu2bNM5piwgVvEaaTi9XrLY6VvfS6D97mQKilz50A"
);

module.exports = supabase;
