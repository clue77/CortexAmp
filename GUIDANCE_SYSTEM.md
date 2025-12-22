# Challenge Guidance System - Implementation Summary

## ✅ What Was Added

### 1. **Skill-Level Framing (Always Visible)**

**Location:** Top of challenge page, below track name

**Copy (exact):**
- **Beginner:** "This challenge focuses on clarity and basic structure. Don't overthink it."
- **Intermediate:** "This challenge assumes you understand the basics and focuses on intent and precision."
- **Advanced:** "This challenge is open-ended and evaluates judgment, tradeoffs, and effectiveness."

**Behavior:**
- Subtle muted text, italic styling
- Changes automatically based on user's profile skill level
- Never blocks progress
- Always visible

### 2. **"How to Approach This" (Collapsible Guidance)**

**Location:** Between skill framing and challenge card

**Behavior:**
- Collapsed by default
- Opens/closes on click
- Never auto-opens
- Clean chevron icon indicator

**Content by Skill Level:**

**Beginner:**
- Identify what the challenge is asking you to do.
- Focus on being clear rather than clever.
- Write your answer as if explaining to a friend.

**Intermediate:**
- Identify the goal before writing.
- Decide what the AI should do vs what you should define.
- Focus on structure and clarity, not perfection.

**Advanced:**
- Think about tradeoffs and constraints.
- Optimize for effectiveness, not elegance.
- Treat this like a real-world scenario, not an exercise.

### 3. **"Stuck?" Gentle Hint (Timed)**

**Location:** Below submission textarea

**Trigger Conditions:**
- User focuses the textarea
- No typing for 10 seconds
- Only shown once per session

**Copy:**
"**Feeling stuck?** Try outlining your answer in one or two sentences before writing it fully."

**Behavior:**
- Disappears when user starts typing
- Never blocks submission
- Subtle background with border
- Non-intrusive

### 4. **AI Feedback Process Guidance**

**Location:** In AI-generated improvements section

**Implementation:**
- Updated system prompt to include process-focused suggestions
- At least one improvement should be about thinking process
- Examples: "Clarify the goal before writing" or "Define constraints earlier"
- No extra AI calls - just wording adjustment

## 📁 Files Created/Modified

### Created:
- `lib/guidance.ts` - Centralized guidance content by skill level

### Modified:
- `app/app/today/page.tsx` - Added all guidance UI components and logic
- `lib/ai/openai-provider.ts` - Updated system prompt for process guidance

## 🎯 Design Principles Followed

✅ **Educate on thinking, not answers**
- All guidance focuses on approach, not solutions
- Process-oriented, not prescriptive

✅ **Preserve challenge difficulty**
- Guidance is optional and collapsed by default
- Never gives away answers
- Maintains challenge integrity

✅ **Reduce confusion without hand-holding**
- Framing sets expectations
- Guidance is available but not forced
- Stuck hint only appears when needed

✅ **Keep UI clean and optional**
- Collapsible sections
- Timed hints (not always visible)
- Subtle styling
- Never blocks progress

✅ **Non-intrusive coaching**
- Feels like a coach, not a teacher
- Encouraging but honest
- No tutorials or step-by-step instructions

## 🧪 Testing Checklist

### Test Skill Level Framing:
- [ ] View challenge as Beginner - see beginner framing
- [ ] Change to Intermediate in profile - see intermediate framing
- [ ] Change to Advanced in profile - see advanced framing

### Test Collapsible Guidance:
- [ ] Guidance starts collapsed
- [ ] Click to open - see 3 bullets
- [ ] Click to close - collapses smoothly
- [ ] Content matches skill level

### Test Stuck Hint:
- [ ] Focus textarea (empty)
- [ ] Wait 10 seconds without typing
- [ ] Hint appears below textarea
- [ ] Start typing - hint disappears
- [ ] Blur and refocus - hint doesn't reappear (once per session)

### Test AI Process Guidance:
- [ ] Submit a challenge
- [ ] Check improvements section
- [ ] At least one improvement should be process-focused
- [ ] Example: "Clarify the goal before writing"

## 💡 Future Enhancements (Not Implemented Yet)

### AI-Generated Guidance (Optional, Future)
Instead of hardcoded guidance, generate challenge-specific guidance:

**How it would work:**
1. One AI call per challenge (not per user)
2. Generated once, cached in database
3. Very short (3 bullets max)
4. Track-specific and challenge-specific

**Example prompt:**
```
Generate short guidance on how to approach this AI challenge.
Do NOT give an answer.
Focus on thinking process only.
Max 3 bullet points.

Challenge: [title]
Track: [track]
Difficulty: [level]
```

**Benefits:**
- More relevant guidance per challenge
- No per-user cost
- Higher perceived intelligence
- Better track-specific advice

**Implementation:**
- Add `guidance_text` column to challenges table
- Generate during challenge creation
- Fallback to hardcoded if null
- Swap source in `lib/guidance.ts`

## 📊 Expected Impact

### Positive Outcomes:
- **Reduced early churn** - Users understand what's expected
- **Better submissions** - Process guidance improves thinking
- **Less frustration** - Stuck hint helps when needed
- **Maintained difficulty** - Guidance doesn't give answers

### Metrics to Track:
- Challenge completion rate (should increase)
- Time to first submission (may decrease slightly)
- Guidance open rate (track how often users click)
- User feedback on helpfulness

## 🎨 UI/UX Details

### Skill Level Framing:
- Font: text-sm
- Color: text-muted-foreground
- Style: italic
- Position: Below track name, above guidance card

### Guidance Card:
- Border: border-primary/20 (subtle highlight)
- Margin: mb-4 (spacing from challenge card)
- Header: Clickable button with chevron
- Content: Bullet list with primary color bullets

### Stuck Hint:
- Background: bg-secondary/50
- Border: border-primary/10
- Padding: p-2
- Font: text-xs
- Bold: "Feeling stuck?" in font-medium

## 🔒 What We Didn't Do (By Design)

❌ **No example answers** - Would undermine challenge
❌ **No step-by-step instructions** - Would make it too easy
❌ **No auto-expand guidance** - Would be intrusive
❌ **No tutorials** - Not a course platform
❌ **No tracking user interactions** - Privacy-first, v1 simplicity

## 🚀 Deployment Notes

### No Database Changes Required
- All guidance is hardcoded or derived from existing profile data
- No new tables or columns needed (for v1)
- No migration required

### No Breaking Changes
- Purely additive feature
- Existing challenges work as before
- No API changes

### Performance Impact
- Minimal - all content is static
- No additional API calls
- Timer is client-side only

---

**Status:** ✅ Ready to test
**Breaking Changes:** None
**Database Migration:** Not required
**Estimated Impact:** High positive impact on user experience and retention
