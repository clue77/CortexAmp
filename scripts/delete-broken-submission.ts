import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deleteBrokenSubmission() {
  const submissionId = 'fde9eb00-5616-4d69-bb79-75032649a08e';
  
  console.log(`🗑️  Deleting submission ${submissionId}...\n`);

  // Delete the submission (feedback will cascade delete if it exists)
  const { error } = await supabase
    .from('challenge_submissions')
    .delete()
    .eq('id', submissionId);

  if (error) {
    console.error('❌ Error:', error);
  } else {
    console.log('✅ Submission deleted successfully!');
    console.log('\nYou can now resubmit the challenge and get feedback.');
  }
}

deleteBrokenSubmission()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
