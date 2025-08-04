
import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = "https://haxiwqgajhanpapvicbm.supabase.co";
export const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhheGl3cWdhamhhbnBhcHZpY2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyMDQ2MjQsImV4cCI6MjA1ODc4MDYyNH0.VLmhGBlkRWMcaJ5WwxPYdPIA_LOU49ECWd6Nrh_teiI";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
