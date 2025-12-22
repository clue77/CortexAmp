'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, AlertCircle, CheckCircle, AlertTriangle, Edit2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Track {
  id: string;
  title: string;
}

interface GeneratedChallenge {
  title: string;
  scenario: string;
  instructions: string;
  success_criteria: string;
  canonical_goal: string;
  challenge_fingerprint: string;
  similarity_status: 'duplicate' | 'very_similar' | 'sufficiently_different';
  track_id: string;
  difficulty: string;
  generated_by_ai: boolean;
  reviewed_by_human: boolean;
  is_published: boolean;
  day_date?: string | null;
}

export default function AdminChallengeGeneratorPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedTrack, setSelectedTrack] = useState('');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedChallenges, setGeneratedChallenges] = useState<GeneratedChallenge[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedChallenge, setEditedChallenge] = useState<GeneratedChallenge | null>(null);
  const [error, setError] = useState('');
  const [savingIndex, setSavingIndex] = useState<number | null>(null);
  const [publishingIndex, setPublishingIndex] = useState<number | null>(null);
  const [publishDate, setPublishDate] = useState('');
  const router = useRouter();

  useEffect(() => {
    checkAdminAccess();
    loadTracks();
  }, []);

  async function checkAdminAccess() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('user_id', user.id)
      .single();

    if (!profile?.is_admin) {
      router.push('/app');
    }
  }

  async function loadTracks() {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('tracks')
        .select('id, title')
        .eq('is_active', true)
        .order('sort_order');

      if (data) {
        setTracks(data);
        if (data.length > 0) {
          setSelectedTrack(data[0].id);
        }
      }
    } catch (err) {
      console.error('Error loading tracks:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate() {
    if (!selectedTrack) {
      setError('Please select a track');
      return;
    }

    setGenerating(true);
    setError('');
    setGeneratedChallenges([]);

    try {
      const response = await fetch('/api/admin/challenges/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          track_id: selectedTrack,
          difficulty,
          count,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate challenges');
      }

      const data = await response.json();
      setGeneratedChallenges(data.challenges);
    } catch (err: any) {
      setError(err.message || 'Failed to generate challenges');
    } finally {
      setGenerating(false);
    }
  }

  function startEditing(index: number) {
    setEditingIndex(index);
    setEditedChallenge({ ...generatedChallenges[index] });
  }

  function cancelEditing() {
    setEditingIndex(null);
    setEditedChallenge(null);
  }

  function saveEdits() {
    if (editingIndex !== null && editedChallenge) {
      const updated = [...generatedChallenges];
      updated[editingIndex] = editedChallenge;
      setGeneratedChallenges(updated);
      setEditingIndex(null);
      setEditedChallenge(null);
    }
  }

  function discardChallenge(index: number) {
    const updated = generatedChallenges.filter((_, i) => i !== index);
    setGeneratedChallenges(updated);
  }

  function promptPublish(index: number) {
    setPublishingIndex(index);
    // Default to tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setPublishDate(tomorrow.toISOString().split('T')[0]);
  }

  function cancelPublish() {
    setPublishingIndex(null);
    setPublishDate('');
  }

  async function saveChallenge(index: number, publish: boolean, date?: string) {
    setSavingIndex(index);
    try {
      const challenge = { ...generatedChallenges[index] };
      
      // If publishing, require a date
      if (publish) {
        if (!date) {
          throw new Error('Date is required for published challenges');
        }
        challenge.day_date = date;
      }
      
      const response = await fetch('/api/admin/challenges/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challenge, publish }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save challenge');
      }

      // Remove from list after successful save
      const updated = generatedChallenges.filter((_, i) => i !== index);
      setGeneratedChallenges(updated);
      setPublishingIndex(null);
      setPublishDate('');
    } catch (err: any) {
      alert(err.message || 'Failed to save challenge');
    } finally {
      setSavingIndex(null);
    }
  }

  function getSimilarityBadge(status: string) {
    switch (status) {
      case 'duplicate':
        return (
          <div className="flex items-center gap-1 text-xs text-destructive">
            <AlertCircle className="h-3 w-3" />
            Duplicate
          </div>
        );
      case 'very_similar':
        return (
          <div className="flex items-center gap-1 text-xs text-yellow-600">
            <AlertTriangle className="h-3 w-3" />
            Very Similar
          </div>
        );
      case 'sufficiently_different':
        return (
          <div className="flex items-center gap-1 text-xs text-green-600">
            <CheckCircle className="h-3 w-3" />
            Unique
          </div>
        );
      default:
        return null;
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Challenge Generator</h1>
        <p className="text-muted-foreground">Generate challenges using DeepSeek AI</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Generation Settings</CardTitle>
          <CardDescription>Configure challenge generation parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="track">Track</Label>
              <Select value={selectedTrack} onValueChange={setSelectedTrack}>
                <SelectTrigger id="track">
                  <SelectValue placeholder="Select track" />
                </SelectTrigger>
                <SelectContent>
                  {tracks.map(track => (
                    <SelectItem key={track.id} value={track.id}>
                      {track.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={difficulty} onValueChange={(v: any) => setDifficulty(v)}>
                <SelectTrigger id="difficulty">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="count">Number of Challenges</Label>
              <Input
                id="count"
                type="number"
                min={1}
                max={10}
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={generating || !selectedTrack}
            className="w-full mt-4"
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating with DeepSeek...
              </>
            ) : (
              'Generate Challenges'
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedChallenges.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Generated Challenges ({generatedChallenges.length})</h2>
          
          {generatedChallenges.map((challenge, index) => (
            <Card key={index} className="border-2">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {editingIndex === index ? (
                      <Input
                        value={editedChallenge?.title || ''}
                        onChange={(e) => setEditedChallenge({ ...editedChallenge!, title: e.target.value })}
                        className="font-semibold text-lg mb-2"
                      />
                    ) : (
                      <CardTitle>{challenge.title}</CardTitle>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      {getSimilarityBadge(challenge.similarity_status)}
                      <span className="text-xs text-muted-foreground">
                        {challenge.difficulty} • AI Generated
                      </span>
                    </div>
                  </div>
                  {editingIndex !== index && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEditing(index)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {editingIndex === index ? (
                  <>
                    <div>
                      <Label>Scenario</Label>
                      <Textarea
                        value={editedChallenge?.scenario || ''}
                        onChange={(e) => setEditedChallenge({ ...editedChallenge!, scenario: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Instructions</Label>
                      <Textarea
                        value={editedChallenge?.instructions || ''}
                        onChange={(e) => setEditedChallenge({ ...editedChallenge!, instructions: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Success Criteria</Label>
                      <Textarea
                        value={editedChallenge?.success_criteria || ''}
                        onChange={(e) => setEditedChallenge({ ...editedChallenge!, success_criteria: e.target.value })}
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label>Canonical Goal</Label>
                      <Input
                        value={editedChallenge?.canonical_goal || ''}
                        onChange={(e) => setEditedChallenge({ ...editedChallenge!, canonical_goal: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={saveEdits} size="sm">Save Edits</Button>
                      <Button onClick={cancelEditing} variant="outline" size="sm">Cancel</Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Scenario</h4>
                      <p className="text-sm text-muted-foreground">{challenge.scenario}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Instructions</h4>
                      <p className="text-sm text-muted-foreground">{challenge.instructions}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Success Criteria</h4>
                      <p className="text-sm text-muted-foreground">{challenge.success_criteria}</p>
                    </div>
                    <div className="pt-2 border-t">
                      <h4 className="font-semibold text-xs mb-1 text-primary">Canonical Goal</h4>
                      <p className="text-xs text-muted-foreground italic">{challenge.canonical_goal}</p>
                    </div>

                    {publishingIndex === index ? (
                      <div className="space-y-3 pt-2 border-t">
                        <div>
                          <Label htmlFor={`publish-date-${index}`}>Publish Date</Label>
                          <Input
                            id={`publish-date-${index}`}
                            type="date"
                            value={publishDate}
                            onChange={(e) => setPublishDate(e.target.value)}
                            className="mt-1"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Choose when this challenge should be available
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => saveChallenge(index, true, publishDate)}
                            disabled={savingIndex === index || !publishDate}
                            size="sm"
                          >
                            {savingIndex === index ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Confirm & Publish'
                            )}
                          </Button>
                          <Button
                            onClick={cancelPublish}
                            variant="outline"
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() => saveChallenge(index, false)}
                          disabled={savingIndex === index || challenge.similarity_status === 'duplicate'}
                          variant="outline"
                          size="sm"
                        >
                          {savingIndex === index ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Save as Draft'
                          )}
                        </Button>
                        <Button
                          onClick={() => promptPublish(index)}
                          disabled={savingIndex === index || challenge.similarity_status === 'duplicate'}
                          size="sm"
                        >
                          Approve & Publish
                        </Button>
                        <Button
                          onClick={() => discardChallenge(index)}
                          disabled={savingIndex === index}
                          variant="destructive"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
