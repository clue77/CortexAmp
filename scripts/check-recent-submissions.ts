import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRecentSubmissions() {
  console.log('🔍 Checking recent submissions (last 10)...\n');

  const { data: submissions, error } = await supabase
    .from('challenge_submissions')
    .select('id, user_id, challenge_id, created_at, challenges(title, day_date)')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`Found ${submissions?.length || 0} submissions:\n`);

  if (submissions && submissions.length > 0) {
    for (const sub of submissions) {
      const challenge = (sub as any).challenges;
      console.log(`${sub.created_at}`);
      console.log(`  ID: ${sub.id}`);
      console.log(`  Challenge: ${challenge?.title || 'Unknown'}`);
      
      // Check feedback
      const { data: feedback } = await supabase
        .from('ai_feedback')
        .select('id, score')
        .eq('submission_id', sub.id)
        .maybeSingle();
      
      console.log(`  Feedback: ${feedback ? `✅ Yes (score: ${feedback.score})` : '❌ No'}\n`);
    }
  }
}

checkRecentSubmissions()
  .then(() => {
    console.log('✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
