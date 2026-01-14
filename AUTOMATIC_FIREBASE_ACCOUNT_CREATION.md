# Automatic Firebase Account Creation

## Overview
When you add a new employee through the "Add Employee" button, the system now automatically creates a Firebase authentication account for them.

## How It Works

1. **Add Employee**: Click "Add Employee" button and fill in the employee details
2. **Automatic Account Creation**: The system automatically:
   - Creates the employee record in the database
   - Creates a Firebase authentication account
   - Uses email format: `name@adrs.com` (or the email you provide)
   - Sets default password: `password123`

3. **Success Notification**: After creation, you'll see a toast notification showing:
   - Employee name
   - Firebase email
   - Default password

## Default Credentials
- **Email Format**: `{email}@adrs.com` (if email doesn't include @)
- **Default Password**: `password123`

## Important Notes
- No manual seeding required
- Firebase account is created instantly when employee is added
- If Firebase account already exists, employee is still created in database
- Credentials are shown in the success notification for 10 seconds

## Technical Details
- Backend: `/api/employees` POST endpoint
- Firebase Admin SDK handles account creation
- Automatic error handling if Firebase creation fails
- Employee creation continues even if Firebase fails

## Example
When you add an employee:
- Name: John Doe
- Email: john.doe

System creates:
- Database record with email: john.doe@adrs.com
- Firebase account: john.doe@adrs.com / password123
