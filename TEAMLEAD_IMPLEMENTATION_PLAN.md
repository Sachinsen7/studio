# Team Lead & Employee Management Implementation Plan

## Overview
This document outlines the implementation of Team Lead role, employee deactivation, and enhanced task assignment features.

## ✅ Completed Features

### 1. Employee Deactivate/Activate
- **Schema**: Added `isActive Boolean @default(true)` to Employee model
- **UI**: Added toggle button in employee dropdown menu (Activate/Deactivate)
- **Visual Indicator**: Inactive employees show red "Inactive" badge
- **API**: Updated PUT `/api/employees/[id]` to handle isActive field
- **Icons**: UserCheck (activate) and UserX (deactivate)

### 2. TeamLead Role Added
- **Schema**: Added `TeamLead` to Role enum
- **UI**: Added TeamLead to role selection dropdowns
- **Styling**: Cyan color scheme for TeamLead badges
- **Permissions**: TeamLead has access to assign projects and tasks

## 🚧 Features To Implement

### 3. Team Lead Dashboard
**Location**: `/team-lead-dashboard`

**Features**:
- Same as employee dashboard PLUS:
  - View all team members in their project
  - Assign tasks to team members
  - View team performance metrics
  - Approve/reject team member leave requests
  - View team attendance summary

**Components Needed**:
```
src/app/team-lead-dashboard/
├── page.tsx (main dashboard)
├── my-team/page.tsx (team members list)
├── assign-tasks/page.tsx (task assignment)
├── team-attendance/page.tsx (team attendance view)
└── team-leaves/page.tsx (team leave requests)
```

### 4. Project-Based Task Assignment
**Current Flow**: Select employee → assign task
**New Flow**: Select project → select team member from that project → assign task

**Changes Needed**:

#### A. Update Task Creation Form (`/tasks` page)
```typescript
// Step 1: Select Project
<Select value={newTask.projectId} onValueChange={handleProjectChange}>
  <SelectItem value={project.id}>{project.name}</SelectItem>
</Select>

// Step 2: Select Team Member (filtered by project)
<Select value={newTask.assigneeId} disabled={!newTask.projectId}>
  {projectTeamMembers.map(member => (
    <SelectItem value={member.id}>{member.name}</SelectItem>
  ))}
</Select>
```

#### B. API Changes
- `/api/projects/[name]/team` - Already exists, returns team members
- Use this to populate assignee dropdown based on selected project

### 5. Team Lead Can Assign Projects
**Location**: `/team-lead-dashboard/my-team`

**Features**:
- View all team members in their project
- Assign/reassign team members to different projects
- Only projects where TeamLead is assigned

**API Endpoint**: Use existing `/api/employees/[id]/assign-project`

**Permissions**:
- TeamLead can only assign projects they're part of
- Admin can assign any project

### 6. Team Lead Can Assign Tasks
**Location**: `/team-lead-dashboard/assign-tasks`

**Features**:
- Create tasks for team members
- Only for projects where TeamLead is assigned
- Select from team members in the same project

**Flow**:
1. TeamLead selects their project
2. System shows team members in that project
3. TeamLead creates task and assigns to team member
4. Task appears in employee's task list

## Database Schema Changes

### Employee Model (Updated)
```prisma
model Employee {
  id                  String   @id @default(cuid())
  name                String
  email               String   @unique
  loginEmail          String?  @unique
  adrsId              String?  @unique
  role                Role     @default(Developer)
  project             String   @default("Unassigned")
  isActive            Boolean  @default(true)  // NEW
  // ... other fields
}

enum Role {
  Developer
  Designer
  Manager
  QA
  Admin
  TeamLead  // NEW
}
```

## Implementation Steps

### Step 1: Run Database Migrations
```bash
# Add isActive column
curl -X POST http://localhost:9002/api/admin/add-isactive-column

# Regenerate Prisma client
npx prisma generate
```

### Step 2: Create Team Lead Dashboard
1. Copy `/employee-dashboard` structure
2. Create `/team-lead-dashboard` folder
3. Add team management features
4. Add task assignment features

### Step 3: Update Task Creation Flow
1. Modify `/tasks` page
2. Add project selection first
3. Filter team members by selected project
4. Update task creation API call

### Step 4: Add Permissions Middleware
Create `/middleware/permissions.ts`:
```typescript
export function canAssignProject(userRole: string, targetProject: string) {
  if (userRole === 'Admin') return true;
  if (userRole === 'TeamLead') {
    // Check if TeamLead is in the project
    return checkTeamLeadInProject(targetProject);
  }
  return false;
}
```

### Step 5: Update Navigation
Add conditional navigation based on role:
```typescript
{user.role === 'TeamLead' && (
  <Link href="/team-lead-dashboard">Team Lead Dashboard</Link>
)}
{user.role === 'Admin' && (
  <Link href="/dashboard">Admin Dashboard</Link>
)}
{['Developer', 'Designer', 'QA'].includes(user.role) && (
  <Link href="/employee-dashboard">My Dashboard</Link>
)}
```

## API Endpoints Needed

### Existing (Already Working)
- `GET /api/employees` - Get all employees
- `GET /api/employees/me` - Get current employee
- `PUT /api/employees/[id]` - Update employee (now includes isActive)
- `POST /api/employees/[id]/assign-project` - Assign project
- `GET /api/projects/[name]/team` - Get project team members
- `POST /api/tasks` - Create task

### New Endpoints Needed
- `GET /api/team-lead/my-team` - Get team members for current TeamLead
- `GET /api/team-lead/projects` - Get projects where TeamLead is assigned
- `POST /api/team-lead/assign-task` - Create task (with TeamLead permissions)

## UI Components

### Team Lead Dashboard Cards
1. **My Team** - Count of team members
2. **Pending Tasks** - Tasks assigned by TeamLead
3. **Team Attendance** - Today's attendance summary
4. **Leave Requests** - Pending leave requests from team

### Task Assignment Form (Updated)
```tsx
<Select label="Project" onChange={handleProjectChange}>
  {projects.map(p => <SelectItem value={p.id}>{p.name}</SelectItem>)}
</Select>

<Select label="Assign To" disabled={!selectedProject}>
  {teamMembers.map(m => (
    <SelectItem value={m.id}>
      {m.name} - {m.role}
    </SelectItem>
  ))}
</Select>
```

## Testing Checklist

### Employee Deactivation
- [ ] Deactivate employee shows "Inactive" badge
- [ ] Activate employee removes badge
- [ ] Inactive employees can't login (optional)
- [ ] API updates isActive field correctly

### TeamLead Role
- [ ] TeamLead appears in role dropdown
- [ ] TeamLead badge shows cyan color
- [ ] TeamLead can access team dashboard

### Task Assignment
- [ ] Select project first
- [ ] Team members filtered by project
- [ ] Task created with correct project and assignee
- [ ] Task appears in employee dashboard

### Permissions
- [ ] TeamLead can only assign tasks to their team
- [ ] TeamLead can only assign projects they're in
- [ ] Admin can assign any task/project

## Next Steps

1. **Start dev server**: `npm run dev`
2. **Run migrations**: Visit `/api/admin/add-isactive-column`
3. **Test employee deactivation**: Go to `/employees`, deactivate an employee
4. **Create TeamLead user**: Add employee with TeamLead role
5. **Build Team Lead Dashboard**: Create the dashboard pages
6. **Update Task Creation**: Modify task form to select project first
7. **Add Permissions**: Implement role-based access control

## Notes

- All inactive employees should be filtered out from task assignment
- TeamLead dashboard should show only their project's data
- Admin has full access to all features
- Consider adding email notifications when TeamLead assigns tasks
