import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { employees, type Employee } from '@/lib/data';
import { MoreHorizontal, PlusCircle, FileText, UserCog, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/page-header';

const roleColors: Record<Employee['role'], string> = {
  Developer: 'bg-blue-900/20 text-blue-400 border-blue-400/20',
  Designer: 'bg-purple-900/20 text-purple-400 border-purple-400/20',
  Manager: 'bg-red-900/20 text-red-400 border-red-400/20',
  QA: 'bg-green-900/20 text-green-400 border-green-400/20',
  Admin: 'bg-amber-900/20 text-amber-400 border-amber-400/20'
};

export default function EmployeesPage() {
  return (
    <>
      <PageHeader
        title="Employee Management"
        description="View, add, and manage your team members."
      >
        <Button>
          <PlusCircle />
          Add Employee
        </Button>
      </PageHeader>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Enrollment Date</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={employee.avatarUrl}
                          alt={employee.name}
                        />
                        <AvatarFallback>
                          {employee.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid">
                        <span className="font-semibold">{employee.name}</span>
                        <span className="text-sm text-muted-foreground">{employee.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`font-medium ${roleColors[employee.role]}`}
                    >
                      {employee.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{employee.project}</TableCell>
                  <TableCell>
                    {new Date(employee.enrollmentDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-5 w-5" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <UserCog className="mr-2"/>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="mr-2"/>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-500 focus:text-red-500 focus:bg-red-500/10">
                          <Trash2 className="mr-2"/>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
