// DeepSeek AI Provider
// Used for cost-effective challenge generation and similarity checks

interface DeepSeekChallengeOutput {
  title: string;
  scenario: string;
  instructions: string;
  success_criteria: string;
  canonical_goal: string;
}

interface GenerateChallengesParams {
  track: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  count: number;
}

export async function generateChallenges(
  params: GenerateChallengesParams
): Promise<DeepSeekChallengeOutput[]> {
  const { track, difficulty, count } = params;

  const systemPrompt = `You are a senior learning designer for CortexAmp.
You create daily AI challenges that teach thinking, not answers.
Challenges must be realistic, practical, and appropriate for the specified difficulty.
Do NOT provide solutions.
Do NOT include example answers.`;

  const userPrompt = `Generate ${count} DIVERSE and UNIQUE AI learning challenges.

Track: ${track}
Difficulty: ${difficulty}

For each challenge include:
- Title
- Scenario
- Instructions
- Success criteria
- Canonical goal (a SHORT, SPECIFIC phrase describing the unique core objective - must be different for each challenge)

Rules:
- No answers
- No step-by-step solutions
- Solvable in 5–15 minutes
- Focus on applied thinking
- Avoid vague or generic prompts
- CRITICAL: Each canonical_goal MUST be unique and specific (e.g., "design email categorization system", "create sales pitch analyzer", "build customer sentiment tracker")
- Vary the specific use cases and scenarios significantly

Return a JSON array with this exact structure:
[
  {
    "title": "string",
    "scenario": "string",
    "instructions": "string",
    "success_criteria": "string",
    "canonical_goal": "string (must be unique and specific)"
  }
]`;

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.9,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content in DeepSeek response');
    }

    // Parse JSON response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from DeepSeek response');
    }

    const challenges = JSON.parse(jsonMatch[0]);

    // Validate structure
    if (!Array.isArray(challenges)) {
      throw new Error('DeepSeek response is not an array');
    }

    // Validate each challenge has required fields
    challenges.forEach((challenge: any, index: number) => {
      const required = ['title', 'scenario', 'instructions', 'success_criteria', 'canonical_goal'];
      required.forEach(field => {
        if (!challenge[field] || typeof challenge[field] !== 'string') {
          throw new Error(`Challenge ${index} missing or invalid field: ${field}`);
        }
      });
    });

    return challenges as DeepSeekChallengeOutput[];
  } catch (error) {
    console.error('DeepSeek generation error:', error);
    throw error;
  }
}

export async function checkSemanticSimilarity(
  newCanonicalGoal: string,
  existingGoals: string[]
): Promise<'duplicate' | 'very_similar' | 'sufficiently_different'> {
  const systemPrompt = `You are a duplicate detection system for learning challenges.
Compare the new challenge goal to existing goals.
Respond with ONLY one word: duplicate, very_similar, or sufficiently_different.`;

  const userPrompt = `New challenge goal:
"${newCanonicalGoal}"

Existing challenge goals:
${existingGoals.map((goal, i) => `${i + 1}. "${goal}"`).join('\n')}

Is the new goal meaningfully different from all existing goals?
Respond ONLY with: duplicate, very_similar, or sufficiently_different`;

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.1,
        max_tokens: 10,
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content?.trim().toLowerCase();

    if (content === 'duplicate') return 'duplicate';
    if (content === 'very_similar' || content === 'very similar') return 'very_similar';
    if (content === 'sufficiently_different' || content === 'sufficiently different') return 'sufficiently_different';

    // Default to very_similar if unclear
    console.warn('Unclear similarity response:', content);
    return 'very_similar';
  } catch (error) {
    console.error('DeepSeek similarity check error:', error);
    // On error, be conservative
    return 'very_similar';
  }
}
