# Mentor-Intern System Setup Guide

## Database Schema Update Required

The mentor-intern system with task rating functionality requires additional database columns. Follow these steps to update your database:

### Option 1: Using Prisma (Recommended)
```bash
# Generate Prisma client
npx prisma generate

# Push schema changes to database
npx prisma db push --accept-data-loss
```

### Option 2: Manual SQL Update
If Prisma commands are not working, run the SQL script directly on your PostgreSQL database:

```sql
-- Run the contents of database-update.sql file
```

### Option 3: Check Database Status
Run the database check script to see if your schema is up to date:

```bash
node database-check.js
```

## Features Added

### 1. Employee Dashboard - My Interns Page
- **URL**: `/employee-dashboard/my-interns`
- **Features**:
  - View all assigned interns
  - Assign tasks with priorities and due dates
  - Rate completed tasks (1-5 stars)
  - Provide feedback on task performance
  - Conduct performance evaluations
  - Track intern progress and statistics

### 2. Enhanced Intern Dashboard - Tasks Page
- **URL**: `/intern-dashboard/tasks`
- **Features**:
  - View performance statistics
  - See task ratings and feedback from mentors
  - Track completion rates and average ratings
  - Organized task view by status

### 3. API Endpoints Added
- `PATCH /api/tasks/[id]/rate` - Rate completed tasks
- `PATCH /api/tasks/[id]` - Update task status
- Enhanced intern creation with better error handling

## Database Schema Changes

The following fields were added to the `tasks` table:
- `rating` (INTEGER) - Task rating from mentor (1-5 scale)
- `feedback` (TEXT) - Feedback from mentor on task completion
- `ratedBy` (TEXT) - ID of the mentor who rated the task
- `ratedAt` (TIMESTAMP) - When the task was rated

## Usage Instructions

### For Mentors (Employees):
1. Navigate to "My Interns" in the employee dashboard
2. Select an intern to view their details
3. Use the "Assign Task" button to create new tasks
4. Rate completed tasks using the star rating system
5. Provide detailed feedback to help intern development

### For Interns:
1. View assigned tasks in the "My Tasks" section
2. Update task status as you work on them
3. See performance ratings and feedback from mentors
4. Track your progress and improvement over time

## Troubleshooting

### Database Connection Issues
- Ensure your PostgreSQL database is running
- Check your `.env` file for correct database credentials
- Verify network connectivity to your database

### Schema Sync Issues
- Run `npx prisma db pull` to sync with current database
- Run `npx prisma generate` to regenerate the client
- Use `npx prisma db push --force-reset` as a last resort (will lose data)

### Login Issues
- The system now handles existing users better when creating interns
- If you get unique constraint errors, the user account already exists
- Check the API response for credential information

## Next Steps

1. Update your database schema using one of the methods above
2. Test the mentor-intern functionality
3. Create some test interns and assign them to employees as mentors
4. Try the task assignment and rating workflow
5. Monitor the system for any additional issues

## Support

If you encounter any issues:
1. Check the browser console for JavaScript errors
2. Check the server logs for API errors
3. Verify database connectivity and schema
4. Ensure all required environment variables are set