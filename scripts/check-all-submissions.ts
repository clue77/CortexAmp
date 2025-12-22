import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { format } from 'date-fns';

config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAllSubmissions() {
  console.log('🔍 Checking all submissions...\n');

  const { data: submissions, error } = await supabase
    .from('challenge_submissions')
    .select('id, user_id, challenge_id, created_at, challenges(title, day_date, difficulty)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`Found ${submissions?.length || 0} total submissions:\n`);

  if (submissions && submissions.length > 0) {
    for (const sub of submissions) {
      const challenge = (sub as any).challenges;
      console.log(`Submission ID: ${sub.id}`);
      console.log(`  Challenge: ${challenge?.title || 'Unknown'}`);
      console.log(`  Date: ${challenge?.day_date || 'Unknown'}`);
      console.log(`  Difficulty: ${challenge?.difficulty || 'Unknown'}`);
      console.log(`  Created: ${sub.created_at}`);
      
      // Check if it has feedback
      const { data: feedback } = await supabase
        .from('ai_feedback')
        .select('id, score')
        .eq('submission_id', sub.id)
        .maybeSingle();
      
      console.log(`  Feedback: ${feedback ? `Yes (score: ${feedback.score})` : 'No'}\n`);
    }

    console.log('\n💡 To delete all submissions, run:');
    console.log('DELETE FROM challenge_submissions WHERE id IN (');
    submissions.forEach((sub, i) => {
      console.log(`  '${sub.id}'${i < submissions.length - 1 ? ',' : ''}`);
    });
    console.log(');');
  }
}

checkAllSubmissions()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
