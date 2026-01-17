'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoaderCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/firebase';
import { useUser } from '@/firebase/auth/use-user';

export default function DebugProfilePage() {
  const [employees, setEmployees] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  
  const auth = useAuth();
  const { user } = useUser(auth);

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/employees');
      if (!res.ok) throw new Error('Failed to fetch employees');
      const data = await res.json();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchEmployees();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Debug Profile</h1>
          <p className="text-muted-foreground">Debug employee profile matching</p>
        </div>
        <Button onClick={fetchEmployees} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current User Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Email:</strong> {user?.email || 'Not logged in'}</p>
            <p><strong>Display Name:</strong> {user?.displayName || 'Not set'}</p>
            <p><strong>UID:</strong> {user?.uid || 'Not available'}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Employees in Database ({employees.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-red-500">Error: {error}</p>
          ) : employees.length === 0 ? (
            <p className="text-muted-foreground">No employees found</p>
          ) : (
            <div className="space-y-4">
              {employees.map((emp, index) => (
                <div key={emp.id || index} className="p-4 border rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p><strong>Name:</strong> {emp.name}</p>
                      <p><strong>Email:</strong> {emp.email}</p>
                      <p><strong>Login Email:</strong> {emp.loginEmail || 'Not set'}</p>
                    </div>
                    <div>
                      <p><strong>Role:</strong> {emp.role}</p>
                      <p><strong>Project:</strong> {emp.project || 'Unassigned'}</p>
                      <p><strong>Projects:</strong> {emp.projects || 'None'}</p>
                    </div>
                  </div>
                  {user?.email && (
                    <div className="mt-2 p-2 bg-muted rounded">
                      <p className="text-sm">
                        <strong>Match Status:</strong>{' '}
                        {emp.loginEmail === user.email ? (
                          <span className="text-green-600">✓ Exact match (loginEmail)</span>
                        ) : emp.email === user.email ? (
                          <span className="text-blue-600">✓ Exact match (email)</span>
                        ) : emp.loginEmail?.startsWith(user.email.split('@')[0]) ? (
                          <span className="text-yellow-600">~ Partial match (prefix)</span>
                        ) : emp.loginEmail?.includes(user.email.split('@')[0]) ? (
                          <span className="text-orange-600">~ Contains match</span>
                        ) : (
                          <span className="text-red-600">✗ No match</span>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}