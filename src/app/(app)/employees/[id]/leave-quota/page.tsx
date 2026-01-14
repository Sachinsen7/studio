'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/page-header';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, LoaderCircle } from 'lucide-react';

type Employee = {
    id: string;
    name: string;
    email: string;
    casualLeaveQuota: number;
    sickLeaveQuota: number;
    earnedLeaveQuota: number;
    maternityLeaveQuota: number;
    paternityLeaveQuota: number;
    workFromHomeQuota: number;
};

export default function EmployeeLeaveQuotaPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [employee, setEmployee] = React.useState<Employee | null>(null);
    const [quotas, setQuotas] = React.useState({
        casualLeaveQuota: 1,
        sickLeaveQuota: 2,
        earnedLeaveQuota: 0,
        maternityLeaveQuota: 0,
        paternityLeaveQuota: 0,
        workFromHomeQuota: 4,
    });

    React.useEffect(() => {
        const fetchEmployee = async () => {
            try {
                const res = await fetch(`/api/employees/${params.id}/leave-quota`);
                const data = await res.json();
                setEmployee(data.employee);
                setQuotas({
                    casualLeaveQuota: data.employee.casualLeaveQuota,
                    sickLeaveQuota: data.employee.sickLeaveQuota,
                    earnedLeaveQuota: data.employee.earnedLeaveQuota,
                    maternityLeaveQuota: data.employee.maternityLeaveQuota,
                    paternityLeaveQuota: data.employee.paternityLeaveQuota,
                    workFromHomeQuota: data.employee.workFromHomeQuota,
                });
            } catch (error) {
                console.error('Error fetching employee:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to load employee data',
                    variant: 'destructive',
                });
            } finally {
                setLoading(false);
            }
        };
        fetchEmployee();
    }, [params.id, toast]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/employees/${params.id}/leave-quota`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(quotas),
            });

            if (!res.ok) throw new Error('Failed to update');

            toast({
                title: 'Success',
                description: 'Leave quotas updated successfully',
            });
            router.push('/employees');
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update leave quotas',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <p className="text-muted-foreground">Employee not found</p>
            </div>
        );
    }

    return (
        <>
            <PageHeader
                title={`Manage Leave Quotas - ${employee.name}`}
                description={`Set annual leave quotas for ${employee.email}`}
            >
                <Button variant="outline" onClick={() => router.push('/employees')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Employees
                </Button>
            </PageHeader>

            <Card>
                <CardHeader>
                    <CardTitle>Leave Quotas</CardTitle>
                    <CardDescription>
                        Set the annual leave quotas for this employee. These quotas will be visible to the employee when applying for leave.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="casualLeaveQuota">Full Day Leave (days)</Label>
                            <Input
                                id="casualLeaveQuota"
                                type="number"
                                min="0"
                                value={quotas.casualLeaveQuota}
                                onChange={(e) => setQuotas({ ...quotas, casualLeaveQuota: parseInt(e.target.value) || 0 })}
                            />
                            <p className="text-xs text-muted-foreground">Full day leave quota (default: 1 day)</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="sickLeaveQuota">Half Day Leave (days)</Label>
                            <Input
                                id="sickLeaveQuota"
                                type="number"
                                min="0"
                                value={quotas.sickLeaveQuota}
                                onChange={(e) => setQuotas({ ...quotas, sickLeaveQuota: parseInt(e.target.value) || 0 })}
                            />
                            <p className="text-xs text-muted-foreground">Half day leave quota (default: 2 days)</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="workFromHomeQuota">Work From Home (days)</Label>
                            <Input
                                id="workFromHomeQuota"
                                type="number"
                                min="0"
                                value={quotas.workFromHomeQuota}
                                onChange={(e) => setQuotas({ ...quotas, workFromHomeQuota: parseInt(e.target.value) || 0 })}
                            />
                            <p className="text-xs text-muted-foreground">Work from home days (default: 4 days)</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="earnedLeaveQuota">Earned Leave (days)</Label>
                            <Input
                                id="earnedLeaveQuota"
                                type="number"
                                min="0"
                                value={quotas.earnedLeaveQuota}
                                onChange={(e) => setQuotas({ ...quotas, earnedLeaveQuota: parseInt(e.target.value) || 0 })}
                            />
                            <p className="text-xs text-muted-foreground">Earned/privilege leave days (default: 0)</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="maternityLeaveQuota">Maternity Leave (days)</Label>
                            <Input
                                id="maternityLeaveQuota"
                                type="number"
                                min="0"
                                value={quotas.maternityLeaveQuota}
                                onChange={(e) => setQuotas({ ...quotas, maternityLeaveQuota: parseInt(e.target.value) || 0 })}
                            />
                            <p className="text-xs text-muted-foreground">Total maternity leave days (set to 0 if not applicable)</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="paternityLeaveQuota">Paternity Leave (days)</Label>
                            <Input
                                id="paternityLeaveQuota"
                                type="number"
                                min="0"
                                value={quotas.paternityLeaveQuota}
                                onChange={(e) => setQuotas({ ...quotas, paternityLeaveQuota: parseInt(e.target.value) || 0 })}
                            />
                            <p className="text-xs text-muted-foreground">Total paternity leave days (set to 0 if not applicable)</p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                        <Button variant="outline" onClick={() => router.push('/employees')}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? (
                                <>
                                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Quotas
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
