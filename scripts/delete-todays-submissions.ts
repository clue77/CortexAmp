import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { format } from 'date-fns';

config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deleteTodaysSubmissions() {
  const today = format(new Date(), 'yyyy-MM-dd');
  
  console.log(`🗑️  Deleting all submissions for today (${today})...\n`);

  // Get today's challenge
  const { data: challenge } = await supabase
    .from('challenges')
    .select('id, title, difficulty')
    .eq('day_date', today)
    .eq('difficulty', 'beginner')
    .limit(1)
    .maybeSingle();

  if (!challenge) {
    console.log('No challenge found for today');
    return;
  }

  console.log(`Challenge: ${challenge.title} (${challenge.difficulty})\n`);

  // Get all submissions for this challenge
  const { data: submissions } = await supabase
    .from('challenge_submissions')
    .select('id, user_id, created_at')
    .eq('challenge_id', challenge.id);

  console.log(`Found ${submissions?.length || 0} submissions\n`);

  if (submissions && submissions.length > 0) {
    for (const sub of submissions) {
      const { error } = await supabase
        .from('challenge_submissions')
        .delete()
        .eq('id', sub.id);

      if (error) {
        console.error(`❌ Failed to delete ${sub.id}:`, error);
      } else {
        console.log(`✅ Deleted submission ${sub.id}`);
      }
    }

    console.log('\n✨ All submissions deleted!');
    console.log('You can now submit the challenge fresh.');
  } else {
    console.log('✅ No submissions to delete');
  }
}

deleteTodaysSubmissions()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
