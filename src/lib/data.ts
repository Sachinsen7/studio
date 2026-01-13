export type Employee = {
  id: string;
  name: string;
  avatarUrl: string;
  email: string;
  role: 'Developer' | 'Designer' | 'Manager' | 'QA';
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

export const employees: Employee[] = [
  { id: 'emp-1', name: 'Alice Johnson', avatarUrl: 'https://picsum.photos/seed/1/100/100', email: 'alice@company.com', role: 'Developer', project: 'Phoenix', enrollmentDate: '2022-01-15' },
  { id: 'emp-2', name: 'Bob Williams', avatarUrl: 'https://picsum.photos/seed/2/100/100', email: 'bob@company.com', role: 'Designer', project: 'Odyssey', enrollmentDate: '2021-11-20' },
  { id: 'emp-3', name: 'Charlie Brown', avatarUrl: 'https://picsum.photos/seed/3/100/100', email: 'charlie@company.com', role: 'Manager', project: 'Vanguard', enrollmentDate: '2020-03-10' },
  { id: 'emp-4', name: 'Diana Miller', avatarUrl: 'https://picsum.photos/seed/4/100/100', email: 'diana@company.com', role: 'QA', project: 'Phoenix', enrollmentDate: '2023-02-28' },
  { id: 'emp-5', name: 'Ethan Davis', avatarUrl: 'https://picsum.photos/seed/5/100/100', email: 'ethan@company.com', role: 'Developer', project: 'Odyssey', enrollmentDate: '2022-08-01' },
  { id: 'emp-6', name: 'Fiona Garcia', avatarUrl: 'https://picsum.photos/seed/6/100/100', email: 'fiona@company.com', role: 'Developer', project: 'Vanguard', enrollmentDate: '2023-05-18' },
  { id: 'emp-7', name: 'George Rodriguez', avatarUrl: 'https://picsum.photos/seed/7/100/100', email: 'george@company.com', role: 'Designer', project: 'Phoenix', enrollmentDate: '2021-09-05' },
  { id: 'emp-8', name: 'Hannah Martinez', avatarUrl: 'https://picsum.photos/seed/8/100/100', email: 'hannah@company.com', role: 'QA', project: 'Odyssey', enrollmentDate: '2022-12-12' },
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
