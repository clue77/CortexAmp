import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixMissingFeedback() {
  console.log('🔍 Checking for submissions without feedback...\n');

  // Find submissions without feedback
  const { data: submissions, error } = await supabase
    .from('challenge_submissions')
    .select('id, user_id, challenge_id, submission_text, created_at')
    .is('ai_feedback', null);

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`Found ${submissions?.length || 0} submissions without feedback\n`);

  if (submissions && submissions.length > 0) {
    console.log('Submissions missing feedback:');
    submissions.forEach((sub, i) => {
      console.log(`  ${i + 1}. Submission ID: ${sub.id}`);
      console.log(`     User ID: ${sub.user_id}`);
      console.log(`     Created: ${sub.created_at}`);
      console.log(`     Text length: ${sub.submission_text.length} characters\n`);
    });

    console.log('\n💡 To fix this, you can either:');
    console.log('   1. Delete the submission and let the user resubmit');
    console.log('   2. Manually generate feedback for the existing submission\n');
    
    console.log('To delete the submission, run:');
    submissions.forEach(sub => {
      console.log(`   DELETE FROM challenge_submissions WHERE id = '${sub.id}';`);
    });
  }
}

fixMissingFeedback()
  .then(() => {
    console.log('\n✨ Check complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
