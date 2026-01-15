'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, Database, Mail, CheckCircle, XCircle } from 'lucide-react';

export default function SetupLoginEmailsPage() {
    const [loading, setLoading] = React.useState(false);
    const [step1Done, setStep1Done] = React.useState(false);
    const [step2Done, setStep2Done] = React.useState(false);
    const [results, setResults] = React.useState<any>(null);
    const { toast } = useToast();

    const addColumn = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/add-login-email-column', { method: 'POST' });
            const data = await res.json();
            
            if (data.success) {
                setStep1Done(true);
                toast({ title: 'Success', description: data.message });
            } else {
                throw new Error(data.error || 'Failed to add column');
            }
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const setLoginEmails = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/set-login-emails', { method: 'POST' });
            const data = await res.json();
            
            if (data.success) {
                setStep2Done(true);
                setResults(data.updates);
                toast({ title: 'Success', description: data.message });
            } else {
                throw new Error(data.error || 'Failed to set login emails');
            }
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <PageHeader 
                title="Setup Login Emails" 
                description="One-time setup to add loginEmail field to existing employees."
            />

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="h-5 w-5" />
                            Step 1: Add Database Column
                        </CardTitle>
                        <CardDescription>
                            Adds the loginEmail column to the employees table if it doesn't exist.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={addColumn} disabled={loading || step1Done}>
                            {loading ? (
                                <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                            ) : step1Done ? (
                                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                            ) : (
                                <Database className="h-4 w-4 mr-2" />
                            )}
                            {step1Done ? 'Column Added' : 'Add Column'}
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="h-5 w-5" />
                            Step 2: Set Login Emails
                        </CardTitle>
                        <CardDescription>
                            Generates loginEmail (name@adrs.com) for all employees who don't have one.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button onClick={setLoginEmails} disabled={loading || step2Done}>
                            {loading ? (
                                <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                            ) : step2Done ? (
                                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                            ) : (
                                <Mail className="h-4 w-4 mr-2" />
                            )}
                            {step2Done ? 'Emails Set' : 'Set Login Emails'}
                        </Button>

                        {results && (
                            <div className="mt-4 space-y-2">
                                <h4 className="font-medium">Results:</h4>
                                {results.map((r: any) => (
                                    <div key={r.id} className="flex items-center gap-2 text-sm p-2 bg-muted rounded">
                                        {r.status === 'updated' ? (
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <XCircle className="h-4 w-4 text-red-500" />
                                        )}
                                        <span>{r.name}</span>
                                        <code className="text-xs bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded">
                                            {r.loginEmail}
                                        </code>
                                        {r.error && <span className="text-red-500 text-xs">{r.error}</span>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>What This Does</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground space-y-2">
                        <p>1. Adds a new <code>loginEmail</code> column to the database</p>
                        <p>2. For each employee, generates a login email like <code>sapekshvishwakarma@adrs.com</code></p>
                        <p>3. Employees can then login with their @adrs.com email but see their personal email in profile</p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
