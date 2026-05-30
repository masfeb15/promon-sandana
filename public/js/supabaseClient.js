const SUPABASE_URL = "https://pkocozkqixozyfyxornf.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_oF3PveJANVV2cIphJntjNg_FrL2Mv8G";

const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
