import OpenAI from 'openai';
import { AIProvider, AIFeedbackResponse } from './types';

export class OpenAIProvider implements AIProvider {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async generateFeedback(
    challenge: string,
    userSubmission: string,
    context?: Record<string, any>
  ): Promise<AIFeedbackResponse> {
    const { title, difficulty, track, scenario, instructions, successCriteria } = context || {};
    
    const criteria = successCriteria || 'Follow instructions, be clear, be actionable.';

    const systemPrompt = `You are CortexAmp Coach: concise, practical, motivating.
You grade user submissions to daily AI challenges using a rubric and return strict JSON only.
Do not add extra keys. No markdown. No prose outside JSON.

Rubric (10 points total):
- Clarity (0-3)
- Correctness (0-3)
- Practicality (0-2)
- Completeness (0-2)

If the submission is incomplete, coach the thinking process instead of evaluating correctness.
For incomplete submissions: acknowledge effort, identify missing thinking steps, demonstrate structure (not solution).

Return strengths and improvements as short bullet-like strings.
In improvements, include at least one process-focused suggestion (e.g., "Clarify the goal before writing" or "Define constraints earlier").
Keep suggested_revision short and directly improved.
Keep next_challenge_tip to 1 sentence.
Do not invent external facts. Evaluate using only the challenge and submission.
Avoid generic praise. Be encouraging but direct. No "Great job!" filler.`;

    const userPrompt = `Challenge: ${title || challenge}
Difficulty: ${difficulty || 'intermediate'}
Track: ${track || 'General'}
Scenario: ${scenario || 'N/A'}
Instructions: ${instructions || challenge}
Success Criteria: ${criteria}

User Submission:
${userSubmission}

Return JSON with exactly these fields:
{
  "score": <integer 1-10>,
  "strengths": [<max 2 short bullet-like strings>],
  "improvements": [<max 2 short bullet-like strings>],
  "suggested_revision": "<max 900 chars, concrete improved version>",
  "next_challenge_tip": "<exactly 1 sentence for next challenge>"
}`;

    const completion = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens: 280,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI provider');
    }

    const parsed = JSON.parse(content);
    
    // Validate and normalize the response
    return this.validateAndNormalize(parsed);
  }

  private validateAndNormalize(data: any): AIFeedbackResponse {
    // Validate score
    let score = typeof data.score === 'number' ? Math.round(data.score) : 7;
    score = Math.max(1, Math.min(10, score));

    // Validate and normalize strengths
    let strengths = Array.isArray(data.strengths) ? data.strengths : 
                    typeof data.strengths === 'string' ? [data.strengths] : 
                    ['Clear effort and relevant direction.'];
    strengths = strengths.filter((s: any) => typeof s === 'string' && s.trim().length > 0).slice(0, 2);
    if (strengths.length === 0) strengths = ['Clear effort and relevant direction.'];

    // Validate and normalize improvements
    let improvements = Array.isArray(data.improvements) ? data.improvements : 
                       typeof data.improvements === 'string' ? [data.improvements] : 
                       ['Add more structure and make the output more actionable.'];
    improvements = improvements.filter((s: any) => typeof s === 'string' && s.trim().length > 0).slice(0, 2);
    if (improvements.length === 0) improvements = ['Add more structure and make the output more actionable.'];

    // Validate suggested_revision
    let suggested_revision = typeof data.suggested_revision === 'string' ? 
                            data.suggested_revision.trim() : 
                            'Try rewriting your answer with clear steps and specific examples.';
    if (suggested_revision.length > 900) {
      suggested_revision = suggested_revision.substring(0, 897) + '...';
    }

    // Validate next_challenge_tip
    let next_challenge_tip = typeof data.next_challenge_tip === 'string' ? 
                            data.next_challenge_tip.trim() : 
                            'Focus on making your output easier to apply.';
    if (next_challenge_tip.length > 140) {
      next_challenge_tip = next_challenge_tip.substring(0, 137) + '...';
    }

    return {
      score,
      strengths,
      improvements,
      suggested_revision,
      next_challenge_tip,
    };
  }
}
