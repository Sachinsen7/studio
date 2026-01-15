'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/page-header';
import { useAuth } from '@/firebase';
import { useUser } from '@/firebase/auth/use-user';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function DebugPage() {
    const auth = useAuth();
    const { user } = useUser(auth);
    const [employeeData, setEmployeeData] = React.useState<any>(null);
    const [allEmployees, setAllEmployees] = React.useState<any[]>([]);

    React.useEffect(() => {
        const fetchData = async () => {
            if (!user?.email) return;

            // Fetch all employees
            const empRes = await fetch('/api/employees');
            if (empRes.ok) {
                const employees = await empRes.json();
                setAllEmployees(employees);
                
                // Find current employee by loginEmail or email
                const current = employees.find((e: any) => 
                    e.loginEmail === user.email || e.email === user.email
                );
                setEmployeeData(current);
            }
        };
        fetchData();
    }, [user?.email]);

    const emailMatch = employeeData?.loginEmail === user?.email || employeeData?.email === user?.email;

    return (
        <>
            <PageHeader title="Debug Information" description="Check your login and database information" />

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Firebase Login Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-sm text-muted-foreground">Logged in as:</p>
                            <code className="text-lg bg-muted px-3 py-2 rounded block mt-1">
                                {user?.email || 'Not logged in'}
                            </code>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Firebase UID:</p>
                            <code className="text-sm bg-muted px-3 py-2 rounded block mt-1">
                                {user?.uid || 'N/A'}
                            </code>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Database Employee Record</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {employeeData ? (
                            <>
                                <div className="flex items-center gap-2">
                                    {emailMatch ? (
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                    ) : (
                                        <XCircle className="h-5 w-5 text-red-500" />
                                    )}
                                    <Badge variant={emailMatch ? 'default' : 'destructive'}>
                                        {emailMatch ? 'Email Match ✓' : 'Email Mismatch ✗'}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Name:</p>
                                    <p className="font-medium">{employeeData.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Login Email (Firebase):</p>
                                    <code className="text-sm bg-blue-500/10 text-blue-600 px-3 py-2 rounded block mt-1">
                                        {employeeData.loginEmail || 'Not set'}
                                    </code>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Personal Email:</p>
                                    <code className="text-sm bg-muted px-3 py-2 rounded block mt-1">
                                        {employeeData.email}
                                    </code>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Role:</p>
                                    <Badge variant="outline">{employeeData.role}</Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Assigned Project:</p>
                                    <Badge variant="secondary">{employeeData.project}</Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Employee ID:</p>
                                    <code className="text-xs bg-muted px-2 py-1 rounded block mt-1">
                                        {employeeData.id}
                                    </code>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-2 text-red-500">
                                <AlertCircle className="h-5 w-5" />
                                <p>No employee record found for this email</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {!emailMatch && !employeeData && (
                    <Card className="border-red-500">
                        <CardHeader>
                            <CardTitle className="text-red-500">⚠️ No Employee Record Found</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm">
                                Your Firebase login email (<code className="bg-muted px-2 py-1 rounded">{user?.email}</code>) 
                                does not match any employee record in the database.
                            </p>
                            <p className="text-sm font-semibold">To fix this:</p>
                            <ol className="text-sm space-y-2 list-decimal list-inside">
                                <li>Ask an admin to set your login email to: <code className="bg-muted px-2 py-1 rounded">{user?.email}</code></li>
                                <li>Admin can use the "Email Sync" page to update your login email</li>
                            </ol>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>All Employees in Database</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {allEmployees.map((emp) => (
                                <div key={emp.id} className="flex items-center justify-between p-3 border rounded">
                                    <div className="space-y-1">
                                        <p className="font-medium">{emp.name}</p>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-muted-foreground">Login:</span>
                                                <code className="text-xs bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded">
                                                    {emp.loginEmail || 'Not set'}
                                                </code>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-muted-foreground">Personal:</span>
                                                <code className="text-xs bg-muted px-2 py-0.5 rounded">{emp.email}</code>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Badge variant="outline">{emp.role}</Badge>
                                        <Badge variant="secondary">{emp.project}</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
