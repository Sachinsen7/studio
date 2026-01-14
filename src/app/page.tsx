'use client';

import Link from 'next/link';
import { useAuth } from '@/firebase';
import { useUser } from '@/firebase/auth/use-user';
import { Button } from '@/components/ui/button';
import {
  Workflow,
  Users,
  ListTodo,
  CalendarCheck,
  BotMessageSquare,
  ArrowRight,
  LogIn
} from 'lucide-react';
import Logo from '../components/logo';

export default function HomePage() {
  const auth = useAuth();
  const { user, loading, role } = useUser(auth);

  const dashboardLink = role === 'admin' ? '/dashboard' : '/employee-dashboard';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Logo className="h-6 w-auto" />
          </div>
          <nav className="flex items-center gap-4">
            {loading ? null : user ? (
              <Button asChild>
                <Link href={dashboardLink}>
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Link>
              </Button>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
          Streamline Your <span className="text-primary">ADRS Operations</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          ADRS helps you manage employees, track tasks, monitor attendance,
          and leverage AI to summarize meetings — all in one place.
        </p>
        <div className="flex gap-4 justify-center">
          {user ? (
            <Button size="lg" asChild>
              <Link href={dashboardLink}>
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <>
              <Button size="lg" asChild>
                <Link href="/login">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Everything You Need</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-lg border bg-card">
            <Users className="h-10 w-10 text-primary mb-4" />
            <h3 className="font-semibold text-lg mb-2">Employee Management</h3>
            <p className="text-muted-foreground text-sm">
              Manage employee profiles, roles, and project assignments with ease.
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-card">
            <ListTodo className="h-10 w-10 text-primary mb-4" />
            <h3 className="font-semibold text-lg mb-2">Task Tracking</h3>
            <p className="text-muted-foreground text-sm">
              Assign tasks, track progress, and keep projects on schedule.
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-card">
            <CalendarCheck className="h-10 w-10 text-primary mb-4" />
            <h3 className="font-semibold text-lg mb-2">Attendance</h3>
            <p className="text-muted-foreground text-sm">
              Record attendance, manage leave requests, and generate reports.
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-card">
            <BotMessageSquare className="h-10 w-10 text-primary mb-4" />
            <h3 className="font-semibold text-lg mb-2">AI Summarizer</h3>
            <p className="text-muted-foreground text-sm">
              Upload meeting audio and get AI-powered summaries instantly.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          © 2026 ADRS. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
