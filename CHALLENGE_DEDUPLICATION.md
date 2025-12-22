# Challenge Deduplication & Research Mode - Implementation Summary

## ✅ What Was Added

### **Part 1: Challenge Deduplication System**

#### **Layer 1: Deterministic Duplicate Check (IMPLEMENTED)**

**Database Schema:**
- Added `canonical_goal` (text, NOT NULL) - Normalized sentence describing core challenge objective
- Added `challenge_fingerprint` (text, UNIQUE, NOT NULL) - SHA256 hash of canonical_goal
- Added unique constraint to prevent exact duplicates
- Added indexes for fast lookups

**How It Works:**
1. Before inserting a challenge, generate a canonical goal
   - Example: "Design a clear AI prompt to summarize user feedback"
2. Hash it: `sha256(lowercase(canonical_goal))`
3. Store as `challenge_fingerprint`
4. Database rejects duplicates automatically via UNIQUE constraint

**Benefits:**
- ✅ Exact duplicates blocked at database level
- ✅ AI-generated near-identical challenges won't double-publish
- ✅ Fast, cheap, deterministic
- ✅ No AI calls needed for basic deduplication

**Utility Functions Created:**
- `generateCanonicalGoal(title, scenario)` - Extracts core objective
- `generateChallengeFingerprint(canonicalGoal)` - Creates SHA256 hash
- `isDuplicateChallenge(supabase, canonicalGoal)` - Checks for duplicates
- `prepareChallengeForCreation(challenge)` - Adds deduplication fields

#### **Layer 2: Semantic Similarity Check (PLACEHOLDER)**

**Status:** Placeholder function created, not yet implemented

**How It Will Work:**
1. Before saving a new challenge, run AI comparison
2. Prompt: "Compare this new challenge goal to existing challenges. Is it meaningfully different?"
3. AI responds: `duplicate` | `very_similar` | `sufficiently_different`
4. Action based on response:
   - `duplicate` → reject
   - `very_similar` → revise
   - `sufficiently_different` → allow

**Catches:**
- "Write a prompt to summarize reviews"
- vs "Create an AI instruction to condense customer feedback"
- (Same idea, different wording)

**Implementation Note:**
Function `checkSemanticSimilarity()` exists in `lib/challenge-utils.ts` but currently returns `sufficiently_different`. Ready for future AI integration.

#### **Layer 3: Editorial Gate (POLICY)**

**Rule:** AI never publishes challenges. Humans do.

**Process:**
1. AI generates challenge with deduplication fields
2. Layer 1 check (fingerprint) prevents exact duplicates
3. Layer 2 check (semantic) flags similar challenges
4. Human reviews title + scenario
5. Human sets `is_published = true`

**Why This Matters:**
- Protects CortexAmp's reputation
- Ensures quality control
- Prevents AI from publishing low-quality content
- Final human judgment on uniqueness

### **Part 2: Research Mode (IMPLEMENTED)**

#### **Core Principle**
**Looking things up is allowed. Copying answers is not rewarded.**

The scoring rubric already evaluates:
- Structure
- Clarity
- Reasoning
- Constraints

Two users can Google the same thing and get very different scores based on application.

#### **Research Permission Copy**

**Location:** Challenge card, below success criteria

**Copy:**
"**Research is allowed.** Focus on understanding, not copying."

**Impact:**
- Removes anxiety about looking things up
- Reframes research as learning, not cheating
- Builds trust with users

#### **🔍 "Search This Challenge" Helper**

**Location:** Below research permission copy

**Behavior:**
1. Generates sanitized search query based on challenge
2. Copies to clipboard
3. Shows confirmation: "✓ Search query copied to clipboard"
4. Fallback: Opens Google search if clipboard fails

**Example Query:**
```
How to approach an AI prompt design task involving Communication Skills with focus on beginner level
```

**NOT:**
```
Solve this CortexAmp challenge
```

**Why This Works:**
- Pushes users toward conceptual learning
- Prevents direct answer theft
- Encourages understanding over copying
- Aligns with real-world professional behavior

#### **Transparency (Recommended Future Addition)**

**Suggested Copy for FAQ or Footer:**
```
CortexAmp encourages research.
Progress comes from how you apply what you learn.
```

**Benefits:**
- Builds trust
- Removes anxiety
- Sets clear expectations
- Differentiates from traditional tests

## 📁 Files Created/Modified

### Created:
- `supabase/migrations/004_challenge_deduplication.sql` - Database migration
- `lib/challenge-utils.ts` - Deduplication utility functions
- `CHALLENGE_DEDUPLICATION.md` - This documentation

### Modified:
- `lib/types/database.ts` - Added canonical_goal and challenge_fingerprint to Challenge type
- `app/app/today/page.tsx` - Added research mode UI and search helper

## 🎯 Design Principles

### Deduplication:
✅ **Deterministic first** - Fast, cheap fingerprint check
✅ **Semantic second** - AI catches similar challenges (future)
✅ **Human final** - Editorial gate protects quality
✅ **Scalable** - Ready for AI-generated content

### Research Mode:
✅ **Enable learning** - Research is encouraged
✅ **Prevent gaming** - Scoring based on application, not recall
✅ **Build trust** - Transparent about expectations
✅ **Real-world aligned** - Professionals Google constantly

## 🚫 What We Didn't Do (By Design)

### Deduplication:
❌ **No manual duplicate checking** - Automated via fingerprint
❌ **No complex NLP** - Simple hash is sufficient for Layer 1
❌ **No blocking AI generation** - Deduplication enables it

### Research Mode:
❌ **No copy/paste blocking** - Creates adversarial UX
❌ **No text selection disabling** - Doesn't work and annoys users
❌ **No plagiarism detection** - Overkill and unreliable
❌ **No shaming** - Encourages learning instead

## 🧠 Why This Works

### Real-World Alignment:
- Professionals research constantly
- Skill is in application, not memorization
- Two people can research the same thing and apply it differently

### Anti-Gaming:
- Rubric evaluates thinking, not recall
- Structure and clarity can't be copied
- Reasoning and constraints require understanding

### Trust Building:
- Explicit permission removes anxiety
- Transparency builds confidence
- Focus on learning, not testing

## 📊 Database Schema

### New Fields:

```sql
canonical_goal text NOT NULL
  -- Normalized sentence describing core challenge objective
  -- Example: "design a clear ai prompt to summarize user feedback"

challenge_fingerprint text UNIQUE NOT NULL
  -- SHA256 hash of canonical_goal
  -- Prevents exact duplicates at database level
```

### Indexes:
```sql
CREATE INDEX idx_challenges_fingerprint ON challenges(challenge_fingerprint);
CREATE INDEX idx_challenges_canonical_goal ON challenges(canonical_goal);
```

### Constraints:
```sql
ALTER TABLE challenges ADD CONSTRAINT unique_challenge_fingerprint 
  UNIQUE (challenge_fingerprint);
```

## 🔄 Challenge Creation Flow (Future)

### With Deduplication:

1. **AI generates challenge** (or human creates)
2. **Generate canonical goal** from title + scenario
3. **Generate fingerprint** (SHA256 hash)
4. **Check Layer 1** - Database rejects if fingerprint exists
5. **Check Layer 2** (future) - AI semantic similarity
6. **Human review** - Final approval
7. **Publish** - Set `is_published = true`

### Example Code:

```typescript
import { prepareChallengeForCreation, isDuplicateChallenge } from '@/lib/challenge-utils';

// Prepare challenge with deduplication fields
const challenge = prepareChallengeForCreation({
  title: "Design a Customer Feedback Summarizer",
  scenario: "You need to create a prompt...",
  instructions: "Write a clear prompt that...",
  // ... other fields
});

// Check for duplicates
const isDupe = await isDuplicateChallenge(supabase, challenge.canonical_goal);

if (isDupe) {
  throw new Error('Duplicate challenge detected');
}

// Insert challenge (fingerprint uniqueness enforced by DB)
await supabase.from('challenges').insert(challenge);
```

## 🎨 UX Details

### Research Permission Copy:
- Font: text-xs text-muted-foreground
- Bold: "Research is allowed." in font-medium
- Position: Below success criteria, above search button

### Search Button:
- Icon: 🔍 emoji
- Color: text-primary
- Hover: underline
- States: 
  - Default: "🔍 Search this challenge"
  - Copied: "✓ Search query copied to clipboard"

### Search Query Format:
```
How to approach an AI prompt design task involving [TRACK] with focus on [DIFFICULTY] level
```

## 🚀 Migration Instructions

### Run Migration:

**Option A: Supabase Dashboard**
1. Go to SQL Editor
2. Copy `supabase/migrations/004_challenge_deduplication.sql`
3. Run migration
4. Verify no errors

**Option B: CLI**
```bash
supabase db push
```

### Verify Migration:

```sql
-- Check new columns exist
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'challenges' 
AND column_name IN ('canonical_goal', 'challenge_fingerprint');

-- Check unique constraint
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'challenges' 
AND constraint_name = 'unique_challenge_fingerprint';

-- Check indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'challenges' 
AND indexname LIKE '%fingerprint%';
```

## 💡 Future Enhancements

### Layer 2 Semantic Similarity:
- Implement AI comparison against existing challenges
- Use OpenAI to detect similar but differently-worded challenges
- Cache results to avoid repeated checks
- Threshold tuning for "very similar" vs "sufficiently different"

### Admin Tooling:
- Challenge creation UI with deduplication feedback
- Bulk import with automatic duplicate detection
- Similarity report for editorial review
- Challenge revision suggestions

### Analytics:
- Track duplicate rejection rate
- Monitor canonical goal distribution
- Identify challenge clusters
- Optimize deduplication thresholds

## ✅ Success Criteria

This implementation succeeds if:

1. **No exact duplicates** - Database constraint prevents them
2. **Scalable for AI generation** - Ready for bulk content creation
3. **Research is encouraged** - Users feel safe looking things up
4. **Quality maintained** - Scoring based on application, not recall
5. **Trust built** - Transparent expectations reduce anxiety

## 🎯 Core Philosophy

**CortexAmp now enables:**
- Research without shame
- Application over memorization
- Real-world skill development
- Quality control at scale

**This is how professionals learn.**

---

**Status:** ✅ Layer 1 implemented, Layer 2 placeholder ready, Layer 3 policy defined
**Breaking Changes:** None (additive only)
**Database Migration:** Required - run `004_challenge_deduplication.sql`
**Estimated Impact:** High - enables AI-generated content scaling while maintaining quality
