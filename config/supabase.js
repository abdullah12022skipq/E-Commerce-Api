const { createClient } = require("@supabase/supabase-js");
const SUPABASE_URL = "https://tdatlbuljqbkvxwnyadh.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkYXRsYnVsanFia3Z4d255YWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTYwMTgwNTgsImV4cCI6MjAzMTU5NDA1OH0.8X6tncGTJ0ckHue9hYw-x7cDFPVck4mFtRJy70lUIIo";

// const supabase = createClient(
//   process.env.SUPABASE_URL,
//   process.env.SUPABASE_KEY
// );
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

module.exports = supabase;
