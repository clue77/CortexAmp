import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { format } from 'date-fns';

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testQuery() {
  console.log('🧪 Testing challenge query...\n');

  const today = format(new Date(), 'yyyy-MM-dd');
  const skillLevel = 'beginner';

  console.log(`📅 Date: ${today}`);
  console.log(`🎯 Skill Level: ${skillLevel}\n`);

  // Test the exact query the app uses
  console.log('Query 1: Using .limit(1).maybeSingle()');
  const { data: challenge1, error: error1 } = await supabase
    .from('challenges')
    .select('*, track:tracks(title)')
    .eq('is_published', true)
    .eq('day_date', today)
    .eq('difficulty', skillLevel)
    .limit(1)
    .maybeSingle();

  if (error1) {
    console.error('❌ Error:', error1);
  } else if (challenge1) {
    console.log('✅ Challenge found:');
    console.log(`   Title: ${challenge1.title}`);
    console.log(`   Track: ${challenge1.track?.title}`);
    console.log(`   Difficulty: ${challenge1.difficulty}`);
    console.log(`   Date: ${challenge1.day_date}`);
  } else {
    console.log('⚠️  No challenge found');
  }

  // Test without .maybeSingle() to see all results
  console.log('\nQuery 2: Getting all matching challenges');
  const { data: allChallenges, error: error2 } = await supabase
    .from('challenges')
    .select('*, track:tracks(title)')
    .eq('is_published', true)
    .eq('day_date', today)
    .eq('difficulty', skillLevel);

  if (error2) {
    console.error('❌ Error:', error2);
  } else if (allChallenges && allChallenges.length > 0) {
    console.log(`✅ Found ${allChallenges.length} matching challenges:`);
    allChallenges.forEach((c, i) => {
      console.log(`   ${i + 1}. ${c.title} (${c.track?.title})`);
    });
  } else {
    console.log('⚠️  No challenges found');
  }

  // Check RLS policies
  console.log('\nQuery 3: Testing without filters to check RLS');
  const { data: anyChallenge, error: error3 } = await supabase
    .from('challenges')
    .select('id, title, is_published, day_date, difficulty')
    .limit(5);

  if (error3) {
    console.error('❌ Error (might be RLS):', error3);
  } else if (anyChallenge && anyChallenge.length > 0) {
    console.log(`✅ Can access challenges table (found ${anyChallenge.length})`);
    anyChallenge.forEach(c => {
      console.log(`   - ${c.title} (${c.difficulty}, ${c.day_date})`);
    });
  } else {
    console.log('⚠️  Cannot access any challenges (RLS issue?)');
  }
}

testQuery()
  .then(() => {
    console.log('\n✨ Test complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
