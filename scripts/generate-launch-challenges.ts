import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { generateChallenges } from '../lib/ai/deepseek-provider';
import { generateChallengeFingerprint } from '../lib/challenge-utils';
import { format, addDays } from 'date-fns';

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Challenge generation config
const DAYS_TO_GENERATE = 28; // 4 weeks of challenges
const SKILL_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;

const TRACKS = [
  {
    slug: 'prompt-engineering',
    title: 'Prompt Engineering',
    themes: ['product descriptions', 'customer support', 'content creation', 'technical writing']
  },
  {
    slug: 'automation',
    title: 'Automation',
    themes: ['email workflows', 'content repurposing', 'data processing', 'task automation']
  },
  {
    slug: 'business',
    title: 'Business Applications',
    themes: ['market research', 'competitive analysis', 'customer insights', 'strategy']
  },
  {
    slug: 'making-money',
    title: 'Making Money with AI',
    themes: ['freelancing with AI', 'AI-powered products', 'consulting services', 'passive income']
  }
];

async function ensureTracksExist() {
  console.log('📋 Checking tracks...');
  
  for (const track of TRACKS) {
    const { data: existing } = await supabase
      .from('tracks')
      .select('id')
      .eq('slug', track.slug)
      .single();

    if (!existing) {
      const { error } = await supabase
        .from('tracks')
        .insert({
          slug: track.slug,
          title: track.title,
          description: `Master ${track.title.toLowerCase()} skills`,
          sort_order: TRACKS.indexOf(track) + 1,
          is_active: true
        });

      if (error) {
        console.error(`❌ Failed to create track ${track.slug}:`, error);
      } else {
        console.log(`✅ Created track: ${track.title}`);
      }
    }
  }
}

async function generateAndSaveChallenges() {
  console.log(`\n🚀 Generating ${DAYS_TO_GENERATE} days of challenges...\n`);

  const startDate = new Date();
  let totalGenerated = 0;
  let totalSkipped = 0;

  for (let day = 0; day < DAYS_TO_GENERATE; day++) {
    const currentDate = addDays(startDate, day);
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    
    console.log(`\n📅 Day ${day + 1}: ${dateStr}`);

    for (const skillLevel of SKILL_LEVELS) {
      // Rotate through tracks
      const track = TRACKS[day % TRACKS.length];
      const theme = track.themes[Math.floor(Math.random() * track.themes.length)];

      console.log(`  🎯 Generating ${skillLevel} challenge for ${track.title}...`);

      try {
        // Get track ID
        const { data: trackData } = await supabase
          .from('tracks')
          .select('id')
          .eq('slug', track.slug)
          .single();

        if (!trackData) {
          console.log(`  ⚠️  Track ${track.slug} not found, skipping...`);
          continue;
        }

        // Check if challenge already exists for this date/skill/track
        const { data: existing } = await supabase
          .from('challenges')
          .select('id')
          .eq('day_date', dateStr)
          .eq('difficulty', skillLevel)
          .eq('track_id', trackData.id)
          .single();

        if (existing) {
          console.log(`  ⏭️  Challenge already exists, skipping...`);
          totalSkipped++;
          continue;
        }

        // Generate challenge
        const challenges = await generateChallenges({
          track: `${track.title} - ${theme}`,
          difficulty: skillLevel,
          count: 1
        });

        if (!challenges || challenges.length === 0) {
          console.log(`  ❌ Failed to generate challenge`);
          continue;
        }

        const challenge = challenges[0];

        // Generate fingerprint
        const fingerprint = generateChallengeFingerprint(
          challenge.canonical_goal || `${challenge.title} ${challenge.scenario}`
        );

        // Insert challenge
        const { error } = await supabase
          .from('challenges')
          .insert({
            track_id: trackData.id,
            difficulty: skillLevel,
            title: challenge.title,
            scenario: challenge.scenario,
            instructions: challenge.instructions,
            success_criteria: challenge.success_criteria,
            canonical_goal: challenge.canonical_goal,
            challenge_fingerprint: fingerprint,
            generated_by_ai: true,
            reviewed_by_human: false,
            day_date: dateStr,
            is_published: true
          });

        if (error) {
          console.log(`  ❌ Failed to save: ${error.message}`);
        } else {
          console.log(`  ✅ Saved: ${challenge.title}`);
          totalGenerated++;
        }

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error: any) {
        console.log(`  ❌ Error: ${error.message}`);
      }
    }
  }

  console.log(`\n✨ Complete!`);
  console.log(`   Generated: ${totalGenerated} challenges`);
  console.log(`   Skipped: ${totalSkipped} existing challenges`);
  console.log(`   Total: ${totalGenerated + totalSkipped} challenges in database\n`);
}

async function main() {
  console.log('🎯 CortexAmp Challenge Generator\n');
  
  await ensureTracksExist();
  await generateAndSaveChallenges();
  
  process.exit(0);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
