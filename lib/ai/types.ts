export interface AIFeedbackResponse {
  score: number;
  strengths: string[];
  improvements: string[];
  suggested_revision: string;
  next_challenge_tip: string;
}

export interface AIProvider {
  generateFeedback(
    challenge: string,
    userSubmission: string,
    context?: Record<string, any>
  ): Promise<AIFeedbackResponse>;
}
