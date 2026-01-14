export type Employee = {
  id: string;
  name: string;
  avatarUrl: string;
  email: string;
  role: 'Developer' | 'Designer' | 'Manager' | 'QA' | 'Admin';
  project: string;
  enrollmentDate: string;
};

export type Project = {
  id: string;
  name: string;
  status: 'On Track' | 'At Risk' | 'Completed';
  progress: number;
};

export type Task = {
  id: string;
  title: string;
  status: 'To Do' | 'In Progress' | 'Done';
  assigneeId: string;
  projectId: string;
};

export type LeaveRequest = {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
};

/**
 * ============================================
 * LOGIN CREDENTIALS (All passwords: "password")
 * ============================================
 * 
 * ADMIN:
 * - admin@adrs.com / password (Role: Admin, Access: All)
 * 
 * DEVELOPERS:
 * - sachin@adrs.com / password (Project: Phoenix)
 * - sparsh@adrs.com / password (Project: Odyssey)
 * - danish@adrs.com / password (Project: Vanguard)
 * 
 * DESIGNERS:
 * - srajal@adrs.com / password (Project: Odyssey)
 * - sneha@adrs.com / password (Project: Phoenix)
 * 
 * MANAGER:
 * - sakshi@adrs.com / password (Project: Vanguard)
 * 
 * QA:
 * - sapeksh@adrs.com / password (Project: Phoenix)
 * - ishant@adrs.com / password (Project: Odyssey)
 * 
 * ============================================
 */
export const employees: Employee[] = [
  { id: 'adm-1', name: 'Admin User', avatarUrl: 'https://picsum.photos/seed/admin/100/100', email: 'admin@adrs.com', role: 'Admin', project: 'All', enrollmentDate: '2020-01-01' },
  { id: 'emp-1', name: 'Sachin', avatarUrl: 'https://picsum.photos/seed/sachin/100/100', email: 'sachin@adrs.com', role: 'Developer', project: 'Phoenix', enrollmentDate: '2022-01-15' },
  { id: 'emp-2', name: 'Srajal', avatarUrl: 'https://picsum.photos/seed/srajal/100/100', email: 'srajal@adrs.com', role: 'Designer', project: 'Odyssey', enrollmentDate: '2021-11-20' },
  { id: 'emp-3', name: 'Sakshi', avatarUrl: 'https://picsum.photos/seed/sakshi/100/100', email: 'sakshi@adrs.com', role: 'Manager', project: 'Vanguard', enrollmentDate: '2020-03-10' },
  { id: 'emp-4', name: 'Sapeksh', avatarUrl: 'https://picsum.photos/seed/sapeksh/100/100', email: 'sapeksh@adrs.com', role: 'QA', project: 'Phoenix', enrollmentDate: '2023-02-28' },
  { id: 'emp-5', name: 'Sparsh', avatarUrl: 'https://picsum.photos/seed/sparsh/100/100', email: 'sparsh@adrs.com', role: 'Developer', project: 'Odyssey', enrollmentDate: '2022-08-01' },
  { id: 'emp-6', name: 'Danish', avatarUrl: 'https://picsum.photos/seed/danish/100/100', email: 'danish@adrs.com', role: 'Developer', project: 'Vanguard', enrollmentDate: '2023-05-18' },
  { id: 'emp-7', name: 'Sneha', avatarUrl: 'https://picsum.photos/seed/sneha/100/100', email: 'sneha@adrs.com', role: 'Designer', project: 'Phoenix', enrollmentDate: '2021-09-05' },
  { id: 'emp-8', name: 'Ishant', avatarUrl: 'https://picsum.photos/seed/ishant/100/100', email: 'ishant@adrs.com', role: 'QA', project: 'Odyssey', enrollmentDate: '2022-12-12' },
];

export const projects: Project[] = [
  { id: 'proj-1', name: 'Phoenix', status: 'On Track', progress: 75 },
  { id: 'proj-2', name: 'Odyssey', status: 'At Risk', progress: 40 },
  { id: 'proj-3', name: 'Vanguard', status: 'On Track', progress: 60 },
  { id: 'proj-4', name: 'Mirage', status: 'Completed', progress: 100 },
];

export const tasks: Task[] = [
  { id: 'task-1', title: 'Design landing page mockups', status: 'Done', assigneeId: 'emp-2', projectId: 'proj-2' },
  { id: 'task-2', title: 'Develop authentication API', status: 'In Progress', assigneeId: 'emp-1', projectId: 'proj-1' },
  { id: 'task-3', title: 'Setup CI/CD pipeline', status: 'In Progress', assigneeId: 'emp-5', projectId: 'proj-1' },
  { id: 'task-4', title: 'Write E2E tests for login flow', status: 'To Do', assigneeId: 'emp-4', projectId: 'proj-1' },
  { id: 'task-5', title: 'Create brand style guide', status: 'Done', assigneeId: 'emp-7', projectId: 'proj-3' },
  { id: 'task-6', title: 'User research for new feature', status: 'To Do', assigneeId: 'emp-2', projectId: 'proj-2' },
  { id: 'task-7', title: 'Refactor database schema', status: 'In Progress', assigneeId: 'emp-6', projectId: 'proj-3' },
  { id: 'task-8', title: 'QA for v1.2 release', status: 'To Do', assigneeId: 'emp-8', projectId: 'proj-2' },
];

export const leaveRequests: LeaveRequest[] = [
  { id: 'leave-1', employeeId: 'emp-2', startDate: '2024-08-05', endDate: '2024-08-07', status: 'Approved' },
  { id: 'leave-2', employeeId: 'emp-5', startDate: '2024-08-12', endDate: '2024-08-12', status: 'Pending' },
  { id: 'leave-3', employeeId: 'emp-4', startDate: '2024-07-29', endDate: '2024-07-30', status: 'Rejected' },
];

export const attendance = [
  { date: new Date(2024, 7, 5), status: 'On Leave' },
  { date: new Date(2024, 7, 6), status: 'On Leave' },
  { date: new Date(2024, 7, 7), status: 'On Leave' },
  { date: new Date(2024, 7, 12), status: 'On Leave' },
];
