'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { SKILL_LEVEL_FRAMING, APPROACH_GUIDANCE, STUCK_HINT, SkillLevel } from '@/lib/guidance';

export default function TodayChallengePage() {
  const [challenge, setChallenge] = useState<any>(null);
  const [submission, setSubmission] = useState<any>(null);
  const [feedback, setFeedback] = useState<any>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [skillLevel, setSkillLevel] = useState<string>('beginner');
  const [guidanceOpen, setGuidanceOpen] = useState(false);
  const [showStuckHint, setShowStuckHint] = useState(false);
  const [hasShownStuckHint, setHasShownStuckHint] = useState(false);
  const [hasUsedScaffold, setHasUsedScaffold] = useState(false);
  const [inactivityTimer, setInactivityTimer] = useState<NodeJS.Timeout | null>(null);
  const [copiedSearch, setCopiedSearch] = useState(false);
  const [strengthsOpen, setStrengthsOpen] = useState(true);
  const [improvementsOpen, setImprovementsOpen] = useState(true);
  const [revisionOpen, setRevisionOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadTodayChallenge();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadTodayChallenge() {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const today = format(new Date(), 'yyyy-MM-dd');

      const { data: profile } = await supabase.from('profiles').select('skill_level').eq('user_id', user.id).single();

      const userSkillLevel = profile?.skill_level || 'beginner';
      setSkillLevel(userSkillLevel);

      const { data: challengeData, error: challengeError } = await supabase
        .from('challenges')
        .select('*, track:tracks(title)')
        .eq('is_published', true)
        .eq('day_date', today)
        .eq('difficulty', userSkillLevel)
        .limit(1)
        .maybeSingle();

      if (challengeError || !challengeData) {
        console.error('Challenge query error:', challengeError);
        setError(`No challenge available for today (${today}) at your skill level (${userSkillLevel}). Please check back later or contact support.`);
        setLoading(false);
        return;
      }

      setChallenge(challengeData);

      const { data: submissionData } = await supabase
        .from('challenge_submissions')
        .select('*')
        .eq('user_id', user.id)
        .eq('challenge_id', challengeData.id)
        .maybeSingle();

      if (submissionData) {
        setSubmission(submissionData);

        const { data: feedbackData } = await supabase
          .from('ai_feedback')
          .select('*')
          .eq('submission_id', submissionData.id)
          .maybeSingle();

        setFeedback(feedbackData);
      }

      setLoading(false);
    } catch (err: any) {
      console.error('Error loading challenge:', err);
      setError('Failed to load challenge');
      setLoading(false);
    }
  }

  const handleTextareaFocus = () => {
    if (!hasShownStuckHint && !submissionText.trim()) {
      const timer = setTimeout(() => {
        setShowStuckHint(true);
        setHasShownStuckHint(true);
      }, 10000);
      setInactivityTimer(timer);
    }
  };

  const insertScaffold = () => {
    if (hasUsedScaffold) return;
    
    const scaffold = `Goal of this task:\n\nKey constraints or requirements:\n\nWhat I want the AI to do:\n\nWhat success looks like:\n`;
    
    if (submissionText.trim()) {
      setSubmissionText(submissionText + '\n\n' + scaffold);
    } else {
      setSubmissionText(scaffold);
    }
    
    setHasUsedScaffold(true);
    setShowStuckHint(false);
  };

  const handleSearchChallenge = async () => {
    if (!challenge) return;
    
    const searchQuery = `How to approach an AI prompt design task involving ${challenge.track?.title || 'AI challenges'} with focus on ${challenge.difficulty} level`;
    
    try {
      await navigator.clipboard.writeText(searchQuery);
      setCopiedSearch(true);
      setTimeout(() => setCopiedSearch(false), 2000);
    } catch (err) {
      // Fallback: open Google search
      window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSubmissionText(e.target.value);
    
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
      setInactivityTimer(null);
    }
    
    if (e.target.value.trim()) {
      setShowStuckHint(false);
    }
  };

  const handleTextareaBlur = () => {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
      setInactivityTimer(null);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!submissionText.trim() || !challenge) return;

    setSubmitting(true);
    setError('');
    setShowStuckHint(false);

    try {
      const response = await fetch('/api/ai/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId: challenge.id,
          submissionText: submissionText.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit');
      }

      setSubmission(data.submission);
      setFeedback(data.feedback);
      router.refresh();
    } catch (err: any) {
      console.error('Submission error:', err);
      setError(err.message || 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !challenge) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-2xl">
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              No Challenge Available
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/app')}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {feedback ? (
        <>
          <div className="mb-6">
            <p className="text-primary font-semibold mb-2">✓ Challenge Complete!</p>
            <p className="text-muted-foreground">Here&apos;s your AI-generated feedback</p>
          </div>

          <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-sm text-foreground font-medium">
              Nice work for showing up. Here&apos;s how to level this up.
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{challenge.title}</CardTitle>
                  <CardDescription>{(challenge.track as any)?.title}</CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">{feedback.score}/10</div>
                  <p className="text-sm text-muted-foreground">Great work today. Come back tomorrow for a new challenge.</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-lg">
                <button
                  type="button"
                  onClick={() => setStrengthsOpen(!strengthsOpen)}
                  className="flex items-center justify-between w-full p-4 text-left hover:bg-secondary/50 transition-colors"
                >
                  <h3 className="font-semibold text-lg flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    What You Did Well
                  </h3>
                  {strengthsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {strengthsOpen && (
                  <div className="px-4 pb-4">
                    <ul className="space-y-2">
                      {(Array.isArray(feedback.strengths) ? feedback.strengths : [feedback.strengths]).map((strength: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">•</span>
                          <span className="text-muted-foreground">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="border rounded-lg">
                <button
                  type="button"
                  onClick={() => setImprovementsOpen(!improvementsOpen)}
                  className="flex items-center justify-between w-full p-4 text-left hover:bg-secondary/50 transition-colors"
                >
                  <h3 className="font-semibold text-lg">How to Level This Up</h3>
                  {improvementsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {improvementsOpen && (
                  <div className="px-4 pb-4">
                    <ul className="space-y-2">
                      {(Array.isArray(feedback.improvements) ? feedback.improvements : [feedback.improvements]).map((improvement: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span className="text-muted-foreground">{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="border rounded-lg">
                <button
                  type="button"
                  onClick={() => setRevisionOpen(!revisionOpen)}
                  className="flex items-center justify-between w-full p-4 text-left hover:bg-secondary/50 transition-colors"
                >
                  <h3 className="font-semibold text-lg">Suggested Revision</h3>
                  {revisionOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {revisionOpen && (
                  <div className="px-4 pb-4">
                    <div className="bg-secondary/50 border border-primary/20 rounded-lg p-4">
                      <p className="text-sm text-foreground">{feedback.suggested_revision}</p>
                    </div>
                  </div>
                )}
              </div>

              {feedback.next_challenge_tip && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <h3 className="font-semibold text-sm mb-2 text-primary">💡 Next Challenge Tip</h3>
                  <p className="text-sm text-muted-foreground">{feedback.next_challenge_tip}</p>
                </div>
              )}

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground italic">
                  ⚠️ AI-generated feedback. Review before relying.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Submission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{submission.submission_text}</p>
            </CardContent>
          </Card>

          <div className="mt-6 flex gap-4">
            <Button onClick={() => router.push('/app')}>Back to Dashboard</Button>
            <Button variant="outline" onClick={() => router.push('/app/history')}>
              View History
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Today&apos;s Challenge</h1>
            <p className="text-muted-foreground">{(challenge.track as any)?.title}</p>
            <p className="text-sm text-muted-foreground mt-2 italic">
              {SKILL_LEVEL_FRAMING[skillLevel as SkillLevel]}
            </p>
          </div>

          <Card className="mb-4 border-primary/20">
            <CardHeader className="pb-3">
              <button
                type="button"
                onClick={() => setGuidanceOpen(!guidanceOpen)}
                className="flex items-center justify-between w-full text-left hover:opacity-80 transition-opacity"
              >
                <span className="text-sm font-medium">How to approach this challenge</span>
                {guidanceOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </CardHeader>
            {guidanceOpen && (
              <CardContent className="pt-0">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {APPROACH_GUIDANCE[skillLevel as SkillLevel].map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            )}
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{challenge.title}</CardTitle>
              <CardDescription className="capitalize">Difficulty: {challenge.difficulty}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Scenario</h3>
                <p className="text-muted-foreground">{challenge.scenario}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Instructions</h3>
                <p className="text-muted-foreground">{challenge.instructions}</p>
              </div>

              {challenge.success_criteria && (
                <div>
                  <h3 className="font-semibold mb-2">Success Criteria</h3>
                  <p className="text-muted-foreground">{challenge.success_criteria}</p>
                </div>
              )}

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-2">
                  <span className="font-medium">Research is allowed.</span> Focus on understanding, not copying.
                </p>
                <button
                  type="button"
                  onClick={handleSearchChallenge}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  {copiedSearch ? (
                    <>
                      ✓ Search query copied to clipboard
                    </>
                  ) : (
                    <>
                      🔍 Search this challenge
                    </>
                  )}
                </button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Submission</CardTitle>
              <CardDescription>Take your time and do your best work</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="submission">Your Answer</Label>
                    <span className="text-xs text-muted-foreground">
                      {submissionText.length} characters
                    </span>
                  </div>
                  <Textarea
                    id="submission"
                    placeholder="Type your response here..."
                    value={submissionText}
                    onChange={handleTextareaChange}
                    onFocus={handleTextareaFocus}
                    onBlur={handleTextareaBlur}
                    rows={10}
                    required
                    disabled={submitting}
                  />
                  {showStuckHint && (
                    <div className="text-xs text-muted-foreground bg-secondary/50 p-2 rounded border border-primary/10">
                      <span className="font-medium">Feeling stuck?</span> Try writing just one sentence about the goal.
                    </div>
                  )}
                  {!hasUsedScaffold && (
                    <button
                      type="button"
                      onClick={insertScaffold}
                      className="text-xs text-primary hover:underline"
                    >
                      I&apos;m stuck — help me get started
                    </button>
                  )}
                </div>

                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>
                )}

                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground text-center">
                    Submit your best attempt — you&apos;ll get instant AI feedback
                  </p>
                  <Button type="submit" disabled={submitting || !submissionText.trim()} className="w-full" size="lg">
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating AI Feedback...
                      </>
                    ) : (
                      'Submit & Get AI Feedback'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
