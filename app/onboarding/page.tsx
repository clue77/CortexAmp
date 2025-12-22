'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Brain, Zap, Target, Rocket } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState('');
  const [skillLevel, setSkillLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/login');
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name, skill_level')
          .eq('user_id', user.id)
          .single();

        // If user has a display name or non-default skill level, they've completed onboarding
        if (profile && (profile.display_name || profile.skill_level !== 'beginner')) {
          router.push('/app');
          return;
        }

        setChecking(false);
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setChecking(false);
      }
    };

    checkOnboardingStatus();
  }, [router]);

  const handleComplete = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName || null,
          skill_level: skillLevel,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      router.push('/app');
      router.refresh();
    } catch (error) {
      console.error('Onboarding error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground mb-8">Let&apos;s personalize your experience</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-secondary/20">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="h-10 w-10 text-primary" />
            <span className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              CortexAmp
            </span>
          </div>
          <CardTitle className="text-2xl">Welcome to CortexAmp! 🎉</CardTitle>
          <CardDescription>Let&apos;s get you set up in just 2 quick steps</CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="displayName">What should we call you? (Optional)</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Your name or nickname"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={50}
                />
                <p className="text-xs text-muted-foreground">
                  Don&apos;t worry, you can change this anytime
                </p>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setStep(2)} size="lg">
                  Next: Choose Your Level
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base">What&apos;s your AI experience level?</Label>
                <p className="text-sm text-muted-foreground">
                  This helps us show you the right challenges. Don&apos;t worry, you can change this later!
                </p>

                <div className="grid gap-3">
                  <button
                    onClick={() => setSkillLevel('beginner')}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      skillLevel === 'beginner'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Rocket className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <div className="font-semibold mb-1">Beginner</div>
                        <div className="text-sm text-muted-foreground">
                          New to AI or just getting started with prompts and tools
                        </div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setSkillLevel('intermediate')}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      skillLevel === 'intermediate'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <div className="font-semibold mb-1">Intermediate</div>
                        <div className="text-sm text-muted-foreground">
                          Comfortable with AI tools and ready for more complex scenarios
                        </div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setSkillLevel('advanced')}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      skillLevel === 'advanced'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Target className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <div className="font-semibold mb-1">Advanced</div>
                        <div className="text-sm text-muted-foreground">
                          Experienced with AI systems and looking for challenging problems
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button onClick={handleComplete} size="lg" disabled={loading}>
                  {loading ? 'Setting up...' : 'Start Learning'}
                </Button>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-center gap-2">
            <div className={`h-2 w-2 rounded-full ${step === 1 ? 'bg-primary' : 'bg-primary/30'}`} />
            <div className={`h-2 w-2 rounded-full ${step === 2 ? 'bg-primary' : 'bg-primary/30'}`} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
