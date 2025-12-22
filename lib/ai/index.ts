import { OpenAIProvider } from './openai-provider';
import { AIProvider } from './types';

export function getAIProvider(): AIProvider {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  return new OpenAIProvider(apiKey);
}

export const AI_ENABLED = process.env.AI_ENABLED === 'true';

export * from './types';
