import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BarChart3, Plus, List, Home, TrendingUp } from 'lucide-react';

export function AdminNav() {
  return (
    <nav className="border-b bg-secondary/50 mb-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 py-4">
          <Link href="/app">
            <Button variant="ghost" size="sm" className="gap-2">
              <Home className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link href="/admin/analytics">
            <Button variant="ghost" size="sm" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </Button>
          </Link>
          <Link href="/admin/analytics/advanced">
            <Button variant="ghost" size="sm" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Advanced
            </Button>
          </Link>
          <Link href="/admin/challenges/generate">
            <Button variant="ghost" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Generate
            </Button>
          </Link>
          <Link href="/admin/challenges/list">
            <Button variant="ghost" size="sm" className="gap-2">
              <List className="h-4 w-4" />
              Challenges
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
