import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDb() {
  const { data, error } = await supabase
    .from('analyses')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
    
  if (error) {
    console.error("DB Select Error:", error);
    return;
  }
  
  console.log("=== LATEST DB ROW ===");
  console.log("ID:", data.id);
  console.log("Created At:", data.created_at);
  console.log("Status:", data.status);
  console.log("Premium Unlocked:", data.premium_unlocked);
  console.log("Premium Report present?", !!data.premium_report);
}

checkDb();
