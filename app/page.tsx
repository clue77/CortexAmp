import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Brain, Zap, Target, TrendingUp, CheckCircle2, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <section className="container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              Daily AI Challenges
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Master AI in <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">15 minutes a day</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Daily AI challenges with instant feedback. Build practical skills through real-world scenarios.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/signup">
                <Button size="lg" className="text-lg px-8">
                  Try Your First Challenge Free
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-20 border-t">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>1. Get Your Challenge</CardTitle>
                  <CardDescription>
                    Receive a new AI challenge every day, tailored to your skill level
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>2. Submit Your Answer</CardTitle>
                  <CardDescription>
                    Apply what you know and submit your solution in minutes
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>3. Get AI Feedback</CardTitle>
                  <CardDescription>
                    Receive instant, personalized feedback and track your progress
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-20 border-t">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Example Challenges
            </h2>
            <p className="text-center text-muted-foreground mb-12">
              Real-world scenarios to build practical AI skills
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="text-xs font-semibold text-primary mb-2">PROMPT ENGINEERING</div>
                  <CardTitle className="text-lg">Write a Product Description</CardTitle>
                  <CardDescription>
                    Craft an AI prompt that generates compelling product copy for an e-commerce store
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="text-xs font-semibold text-primary mb-2">AUTOMATION</div>
                  <CardTitle className="text-lg">Automate Email Responses</CardTitle>
                  <CardDescription>
                    Design a workflow to categorize and draft replies to customer emails
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="text-xs font-semibold text-primary mb-2">BUSINESS</div>
                  <CardTitle className="text-lg">Market Research Analysis</CardTitle>
                  <CardDescription>
                    Use AI to analyze competitor strategies and identify market opportunities
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-20 border-t">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Learning Tracks
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  title: 'Prompt Engineering',
                  description: 'Master the art of communicating with AI to get exactly what you need',
                },
                {
                  title: 'Automation',
                  description: 'Build AI-powered workflows that save time and eliminate repetitive tasks',
                },
                {
                  title: 'Business Applications',
                  description: 'Apply AI to real business problems: marketing, sales, and operations',
                },
                {
                  title: 'Creative AI',
                  description: 'Explore AI for content creation, design, and creative problem-solving',
                },
              ].map((track) => (
                <Card key={track.title} className="hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      {track.title}
                    </CardTitle>
                    <CardDescription>{track.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-20 border-t">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Built for Creators, Founders, and Students
            </h2>
            <p className="text-center text-muted-foreground mb-12">
              Start building practical AI skills today
            </p>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-8 text-center">
              <Brain className="h-12 w-12 text-primary mx-auto mb-4" />
              <p className="text-lg mb-6">
                🎉 Early access — free while we build. Start your first challenge now.
              </p>
              <Link href="/signup">
                <Button size="lg">Start Your First Challenge</Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-20 border-t">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {[
                {
                  q: 'How much time does each challenge take?',
                  a: "Most challenges take 5-15 minutes to complete. They're designed to fit into your daily routine.",
                },
                {
                  q: 'Do I need coding experience?',
                  a: 'No! Our challenges focus on practical AI skills like prompt engineering and workflow design, not programming.',
                },
                {
                  q: 'How does the AI feedback work?',
                  a: 'After you submit your answer, our AI analyzes your response and provides personalized feedback on strengths, areas for improvement, and suggestions.',
                },
                {
                  q: 'Can I go at my own pace?',
                  a: 'Yes! While we release one challenge per day, you can access past challenges anytime from your history.',
                },
                {
                  q: 'What skill levels do you support?',
                  a: 'We offer challenges for beginners, intermediate, and advanced learners. Set your level in your profile.',
                },
              ].map((faq, i) => (
                <Card key={i}>
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.q}</CardTitle>
                    <CardDescription className="text-base">{faq.a}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
