// Challenge deduplication utilities
// Used for AI-generated challenge creation

import crypto from 'crypto';

/**
 * Generate a canonical goal from a challenge description
 * This should be a short, normalized sentence describing the core objective
 * 
 * Example:
 * Input: "You need to create a prompt that will help summarize customer feedback efficiently"
 * Output: "design a clear ai prompt to summarize user feedback"
 */
export function generateCanonicalGoal(title: string, scenario: string): string {
  // Combine title and scenario, extract key intent
  const combined = `${title} ${scenario}`.toLowerCase();
  
  // Remove common filler words
  const fillers = ['the', 'a', 'an', 'you', 'need', 'to', 'will', 'should', 'must', 'can'];
  const words = combined.split(/\s+/).filter(word => 
    word.length > 2 && !fillers.includes(word)
  );
  
  // Take first meaningful phrase (simplified for v1)
  // In production, this could use AI to extract the core goal
  const canonical = words.slice(0, 10).join(' ');
  
  return canonical.trim();
}

/**
 * Generate a deterministic fingerprint for a challenge
 * Uses SHA256 hash of the canonical goal
 */
export function generateChallengeFingerprint(canonicalGoal: string): string {
  const normalized = canonicalGoal.toLowerCase().trim();
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

/**
 * Check if a challenge is a duplicate based on fingerprint
 * This is the Layer 1 check - fast and deterministic
 */
export async function isDuplicateChallenge(
  supabase: any,
  canonicalGoal: string
): Promise<boolean> {
  const fingerprint = generateChallengeFingerprint(canonicalGoal);
  
  const { data } = await supabase
    .from('challenges')
    .select('id')
    .eq('challenge_fingerprint', fingerprint)
    .single();
  
  return !!data;
}

/**
 * AI-based semantic similarity check (Layer 2)
 * Uses DeepSeek to compare against existing challenges
 * 
 * Returns: 'duplicate' | 'very_similar' | 'sufficiently_different'
 */
export async function checkSemanticSimilarity(
  newCanonicalGoal: string,
  existingGoals: string[]
): Promise<'duplicate' | 'very_similar' | 'sufficiently_different'> {
  // Import DeepSeek provider dynamically to avoid circular deps
  const { checkSemanticSimilarity: deepseekCheck } = await import('./ai/deepseek-provider');
  return deepseekCheck(newCanonicalGoal, existingGoals);
}

/**
 * Prepare a challenge for creation with deduplication fields
 */
export function prepareChallengeForCreation(challenge: {
  title: string;
  scenario: string;
  instructions: string;
  [key: string]: any;
}) {
  const canonicalGoal = generateCanonicalGoal(challenge.title, challenge.scenario);
  const challengeFingerprint = generateChallengeFingerprint(canonicalGoal);
  
  return {
    ...challenge,
    canonical_goal: canonicalGoal,
    challenge_fingerprint: challengeFingerprint,
  };
}
