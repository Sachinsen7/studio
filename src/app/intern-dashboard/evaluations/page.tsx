'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PageHeader } from '@/components/page-header';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import {
  LoaderCircle,
  Award,
  Star,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import { format } from 'date-fns';

type Evaluation = {
  id: string;
  rating: number;
  feedback?: string;
  mentorName: string;
  createdAt: string;
  skills?: string;
};

export default function InternEvaluationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [evaluations, setEvaluations] = React.useState<Evaluation[]>([]);
  const [internData, setInternData] = React.useState<any>(null);

  React.useEffect(() => {
    fetchData();
  }, [user?.email]);

  const fetchData = async () => {
    if (!user?.email) return;

    try {
      // Get intern data
      const internRes = await fetch(`/api/interns?email=${encodeURIComponent(user.email)}`);
      if (!internRes.ok) throw new Error('Failed to fetch intern data');
      
      const interns = await internRes.json();
      const currentIntern = Array.isArray(interns) ? interns.find((i: any) => i.email === user.email) : null;
      
      if (!currentIntern) {
        setLoading(false);
        return;
      }

      setInternData(currentIntern);

      // Fetch evaluations
      const evalRes = await fetch(`/api/interns/${currentIntern.id}/evaluations`);
      if (evalRes.ok) {
        const evalData = await evalRes.json();
        setEvaluations(Array.isArray(evalData) ? evalData : []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load evaluations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const averageRating = evaluations.length > 0
    ? evaluations.reduce((sum, e) => sum + e.rating, 0) / evaluations.length
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: evaluations.filter((e) => e.rating === rating).length,
    percentage: evaluations.length > 0
      ? (evaluations.filter((e) => e.rating === rating).length / evaluations.length) * 100
      : 0,
  }));

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="My Evaluations"
        description="Performance feedback from your mentor"
      />

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Out of 5.0</p>
            <div className="flex items-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= Math.round(averageRating)
                      ? 'fill-yellow-500 text-yellow-500'
                      : 'text-muted-foreground'
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Evaluations</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{evaluations.length}</div>
            <p className="text-xs text-muted-foreground">Feedback received</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {evaluations.length > 0 ? evaluations[0].rating : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {evaluations.length > 0
                ? format(new Date(evaluations[0].createdAt), 'MMM dd, yyyy')
                : 'No evaluations yet'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      {evaluations.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
            <CardDescription>Breakdown of your performance ratings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {ratingDistribution.map((item) => (
              <div key={item.rating} className="flex items-center gap-4">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-medium">{item.rating}</span>
                  <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                </div>
                <div className="flex-1">
                  <Progress value={item.percentage} className="h-2" />
                </div>
                <span className="text-sm text-muted-foreground w-12 text-right">
                  {item.count}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Evaluations List */}
      <div className="space-y-4">
        {evaluations.map((evaluation) => (
          <Card key={evaluation.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-base">{evaluation.mentorName}</CardTitle>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                      {evaluation.rating}/5
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(evaluation.createdAt), 'MMMM dd, yyyy')}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            {evaluation.feedback && (
              <CardContent>
                <p className="text-sm text-muted-foreground">{evaluation.feedback}</p>
              </CardContent>
            )}
          </Card>
        ))}

        {evaluations.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Evaluations Yet</h3>
              <p className="text-muted-foreground">
                Your mentor will provide performance evaluations as you progress through your internship.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
