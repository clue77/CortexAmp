import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deleteSubmission() {
  const submissionId = 'a0673ad8-7c58-4957-ac16-1b049f46f4ff';
  
  console.log(`🗑️  Deleting submission ${submissionId}...\n`);

  const { error } = await supabase
    .from('challenge_submissions')
    .delete()
    .eq('id', submissionId);

  if (error) {
    console.error('❌ Error:', error);
  } else {
    console.log('✅ Submission deleted successfully!');
    console.log('\nYou can now submit the challenge and get feedback.');
  }
}

deleteSubmission()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
