// Challenge guidance content by skill level
// This is hardcoded for v1, can be swapped to AI-generated later

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export const SKILL_LEVEL_FRAMING: Record<SkillLevel, string> = {
  beginner: 'This challenge focuses on clarity and basic structure. Don\'t overthink it.',
  intermediate: 'This challenge assumes you understand the basics and focuses on intent and precision.',
  advanced: 'This challenge is open-ended and evaluates judgment, tradeoffs, and effectiveness.',
};

export const APPROACH_GUIDANCE: Record<SkillLevel, string[]> = {
  beginner: [
    'Identify what the challenge is asking you to do.',
    'Focus on being clear rather than clever.',
    'Write your answer as if explaining to a friend.',
  ],
  intermediate: [
    'Identify the goal before writing.',
    'Decide what the AI should do vs what you should define.',
    'Focus on structure and clarity, not perfection.',
  ],
  advanced: [
    'Think about tradeoffs and constraints.',
    'Optimize for effectiveness, not elegance.',
    'Treat this like a real-world scenario, not an exercise.',
  ],
};

export const STUCK_HINT = 'Try outlining your answer in one or two sentences before writing it fully.';
