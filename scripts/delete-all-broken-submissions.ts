import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deleteAllBrokenSubmissions() {
  console.log('🔍 Finding submissions without feedback...\n');

  // Find all submissions
  const { data: allSubmissions, error: subError } = await supabase
    .from('challenge_submissions')
    .select('id, user_id, challenge_id, created_at');

  if (subError) {
    console.error('❌ Error fetching submissions:', subError);
    return;
  }

  console.log(`Found ${allSubmissions?.length || 0} total submissions\n`);

  // Check each submission for feedback
  const submissionsWithoutFeedback = [];
  
  for (const sub of allSubmissions || []) {
    const { data: feedback } = await supabase
      .from('ai_feedback')
      .select('id')
      .eq('submission_id', sub.id)
      .maybeSingle();

    if (!feedback) {
      submissionsWithoutFeedback.push(sub);
    }
  }

  console.log(`Found ${submissionsWithoutFeedback.length} submissions without feedback:\n`);

  if (submissionsWithoutFeedback.length > 0) {
    for (const sub of submissionsWithoutFeedback) {
      console.log(`  - Submission ID: ${sub.id}`);
      console.log(`    Created: ${sub.created_at}\n`);
    }

    console.log('🗑️  Deleting broken submissions...\n');

    for (const sub of submissionsWithoutFeedback) {
      const { error: deleteError } = await supabase
        .from('challenge_submissions')
        .delete()
        .eq('id', sub.id);

      if (deleteError) {
        console.error(`❌ Failed to delete ${sub.id}:`, deleteError);
      } else {
        console.log(`✅ Deleted submission ${sub.id}`);
      }
    }

    console.log('\n✨ All broken submissions deleted!');
    console.log('You can now resubmit challenges and get feedback.');
  } else {
    console.log('✅ No broken submissions found!');
  }
}

deleteAllBrokenSubmissions()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
