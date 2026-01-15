'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/page-header';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { LoaderCircle, CheckCircle, Save } from 'lucide-react';

type Employee = {
    id: string;
    name: string;
    email: string;
    loginEmail: string | null;
    role: string;
    project: string;
};

export default function EmailSyncPage() {
    const [employees, setEmployees] = React.useState<Employee[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [updating, setUpdating] = React.useState<string | null>(null);
    const [editingId, setEditingId] = React.useState<string | null>(null);
    const [editData, setEditData] = React.useState({ loginEmail: '', email: '' });
    const { toast } = useToast();

    React.useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const res = await fetch('/api/employees');
            const data = await res.json();
            setEmployees(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching employees:', error);
            toast({ title: 'Error', description: 'Failed to load employees', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateEmails = async (employeeId: string) => {
        setUpdating(employeeId);
        try {
            const res = await fetch(`/api/employees/${employeeId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    loginEmail: editData.loginEmail || null,
                    email: editData.email 
                }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to update');
            }

            const updated = await res.json();
            setEmployees(prev => prev.map(e => e.id === updated.id ? updated : e));
            setEditingId(null);
            setEditData({ loginEmail: '', email: '' });
            toast({ title: 'Success', description: 'Employee emails updated successfully' });
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
            setUpdating(null);
        }
    };

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
                title="Email Sync" 
                description="Manage employee login and personal emails."
            />

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Email System Explained</CardTitle>
                    <CardDescription>
                        Each employee has two email addresses for different purposes.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-2 p-3 bg-blue-500/10 rounded-lg">
                            <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                            <div>
                                <strong className="text-blue-600">Login Email</strong> (e.g., <code>sapeksh@adrs.com</code>)
                                <p className="text-muted-foreground">Used for Firebase authentication. Auto-generated as name@adrs.com</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2 p-3 bg-green-500/10 rounded-lg">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                            <div>
                                <strong className="text-green-600">Personal Email</strong> (e.g., <code>sparsh@gmail.com</code>)
                                <p className="text-muted-foreground">Employee's actual email for contact and profile display</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>All Employees</CardTitle>
                    <CardDescription>Click "Edit" to update an employee's emails</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Login Email (Firebase)</TableHead>
                                <TableHead>Personal Email</TableHead>
                                <TableHead>Project</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {employees.map((employee) => (
                                <TableRow key={employee.id}>
                                    <TableCell className="font-medium">{employee.name}</TableCell>
                                    <TableCell>
                                        {editingId === employee.id ? (
                                            <Input
                                                type="email"
                                                value={editData.loginEmail}
                                                onChange={(e) => setEditData(prev => ({ ...prev, loginEmail: e.target.value }))}
                                                placeholder="name@adrs.com"
                                                className="max-w-xs"
                                            />
                                        ) : (
                                            <code className="text-sm bg-blue-500/10 text-blue-600 px-2 py-1 rounded">
                                                {employee.loginEmail || 'Not set'}
                                            </code>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {editingId === employee.id ? (
                                            <Input
                                                type="email"
                                                value={editData.email}
                                                onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                                                placeholder="personal@email.com"
                                                className="max-w-xs"
                                            />
                                        ) : (
                                            <code className="text-sm bg-muted px-2 py-1 rounded">{employee.email}</code>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{employee.project}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        {editingId === employee.id ? (
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleUpdateEmails(employee.id)}
                                                    disabled={updating === employee.id}
                                                >
                                                    {updating === employee.id ? (
                                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <Save className="h-4 w-4 mr-1" />
                                                            Save
                                                        </>
                                                    )}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setEditingId(null);
                                                        setEditData({ loginEmail: '', email: '' });
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setEditingId(employee.id);
                                                    setEditData({ 
                                                        loginEmail: employee.loginEmail || '', 
                                                        email: employee.email 
                                                    });
                                                }}
                                            >
                                                Edit
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </>
    );
}
