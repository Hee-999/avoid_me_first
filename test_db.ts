import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDb() {
  const analysisId = 'eacc3532-0d48-4a86-9bab-76ddb9523487';
  
  console.log(`Checking DB for analysis_id: ${analysisId}`);
  
  const { data, error } = await supabase
    .from('analyses')
    .select('*')
    .eq('id', analysisId)
    .single();
    
  if (error) {
    console.error("DB Select Error:", error);
    return;
  }
  
  console.log("--- DB ROW ---");
  console.log("ID:", data.id);
  console.log("Created At:", data.created_at);
  console.log("Status:", data.status);
  console.log("Anxiety Score:", data.anxiety_score);
  console.log("Avoidance Score:", data.avoidance_score);
  console.log("Primary Type:", data.primary_type);
  console.log("Premium Unlocked:", data.premium_unlocked);
  console.log("Premium Report present?", !!data.premium_report);
}

checkDb();
