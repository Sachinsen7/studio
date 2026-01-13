'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/firebase';
import { useUser } from '@/firebase/auth/use-user';
import { Workflow, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function LoginPage() {
  const auth = useAuth();
  const { signInWithGoogle, user, loading } = useUser(auth);
  const router = useRouter();

  React.useEffect(() => {
    if (user) {
      router.replace('/');
    }
  }, [user, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
       <div className="absolute top-8 left-8 flex items-center gap-2 text-lg font-semibold">
          <Workflow className="h-6 w-6 text-primary" />
          <span>CompanyFlow</span>
        </div>
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to access your dashboard and manage your projects.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Button
              onClick={signInWithGoogle}
              disabled={loading}
              variant="outline"
              className="w-full text-base py-6"
            >
              <LogIn className="mr-2 h-5 w-5" />
              Sign in with Google
            </Button>
            <p className="px-8 text-center text-sm text-muted-foreground">
                By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
