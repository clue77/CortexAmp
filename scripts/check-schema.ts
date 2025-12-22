import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
  console.log('🔍 Checking ai_feedback table schema...\n');

  const { data, error } = await supabase
    .from('ai_feedback')
    .select('*')
    .limit(1);

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  if (data && data.length > 0) {
    console.log('Sample row structure:');
    console.log(JSON.stringify(data[0], null, 2));
    console.log('\nColumn names:', Object.keys(data[0]));
  } else {
    console.log('No data in ai_feedback table yet.');
    console.log('Trying to insert a test row to see schema...');
  }
}

checkSchema()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
