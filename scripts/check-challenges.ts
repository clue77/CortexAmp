import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { format } from 'date-fns';

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkChallenges() {
  console.log('🔍 Checking challenges in database...\n');

  const today = format(new Date(), 'yyyy-MM-dd');
  console.log(`📅 Today's date: ${today}\n`);

  // Check total challenges
  const { data: allChallenges, error: allError } = await supabase
    .from('challenges')
    .select('id, day_date, difficulty, title, is_published')
    .order('day_date', { ascending: true });

  if (allError) {
    console.error('❌ Error fetching challenges:', allError);
    return;
  }

  console.log(`📊 Total challenges in database: ${allChallenges?.length || 0}\n`);

  if (allChallenges && allChallenges.length > 0) {
    // Show date range
    const dates = allChallenges.map(c => c.day_date).filter(Boolean);
    const uniqueDates = [...new Set(dates)].sort();
    console.log(`📆 Date range: ${uniqueDates[0]} to ${uniqueDates[uniqueDates.length - 1]}`);
    console.log(`📆 Total days covered: ${uniqueDates.length}\n`);

    // Check today's challenges
    const todayChallenges = allChallenges.filter(c => c.day_date === today);
    console.log(`🎯 Challenges for today (${today}): ${todayChallenges.length}`);
    
    if (todayChallenges.length > 0) {
      console.log('\nToday\'s challenges:');
      todayChallenges.forEach(c => {
        console.log(`  - ${c.difficulty}: ${c.title} (published: ${c.is_published})`);
      });
    } else {
      console.log('\n⚠️  No challenges found for today!');
      console.log('\nFirst 5 challenges:');
      allChallenges.slice(0, 5).forEach(c => {
        console.log(`  - ${c.day_date} | ${c.difficulty}: ${c.title}`);
      });
    }

    // Check by difficulty
    console.log('\n📈 Breakdown by difficulty:');
    const byDifficulty = {
      beginner: allChallenges.filter(c => c.difficulty === 'beginner').length,
      intermediate: allChallenges.filter(c => c.difficulty === 'intermediate').length,
      advanced: allChallenges.filter(c => c.difficulty === 'advanced').length,
    };
    console.log(`  - Beginner: ${byDifficulty.beginner}`);
    console.log(`  - Intermediate: ${byDifficulty.intermediate}`);
    console.log(`  - Advanced: ${byDifficulty.advanced}`);

    // Check published status
    const published = allChallenges.filter(c => c.is_published).length;
    console.log(`\n✅ Published: ${published} / ${allChallenges.length}`);
  }

  // Check tracks
  const { data: tracks } = await supabase
    .from('tracks')
    .select('id, slug, title');

  console.log(`\n🛤️  Tracks in database: ${tracks?.length || 0}`);
  if (tracks) {
    tracks.forEach(t => console.log(`  - ${t.slug}: ${t.title}`));
  }
}

checkChallenges()
  .then(() => {
    console.log('\n✨ Check complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
