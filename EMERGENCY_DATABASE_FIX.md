# 🚨 Emergency Database Fix Instructions

Your database schema is completely out of sync. Follow these steps to fix it:

## Option 1: Run SQL Script Directly (Recommended)

1. **Go to your Neon Database Console**:
   - Visit https://console.neon.tech/
   - Select your project
   - Go to the SQL Editor

2. **Run the Complete Reset Script**:
   - Copy the entire contents of `complete-database-reset.sql`
   - Paste it into the Neon SQL Editor
   - Execute the script

3. **Restart your development server**:
   ```bash
   # Stop the current server (Ctrl+C)
   npm run dev
   ```

## Option 2: Force Prisma Reset (Alternative)

If the SQL script doesn't work, try this:

```bash
# Stop your dev server first (Ctrl+C)

# Force reset the database
npx prisma migrate reset --force

# If that doesn't work, try:
npx prisma db push --force-reset --accept-data-loss

# Generate the client
npx prisma generate

# Start the server
npm run dev
```

## Login Credentials After Reset

After running the database reset, you can login with:

- **Admin**: `admin@adrs.com` / `Admin@123`
- **Employee**: `employee@adrs.com` / `Employee@123`

## What the Reset Does

1. ✅ Drops all existing tables and data
2. ✅ Recreates all tables with correct schema
3. ✅ Adds all necessary enums and constraints
4. ✅ Creates admin and sample employee accounts
5. ✅ Adds task rating fields (rating, feedback, ratedBy, ratedAt)
6. ✅ Sets up proper foreign key relationships

## After the Fix

Once the database is reset:

1. **Test login** with admin credentials
2. **Navigate to employee dashboard** and check "My Interns" section
3. **Create some test interns** and assign them to employees as mentors
4. **Test the task assignment and rating workflow**

## If You Still Have Issues

1. Check that your `.env` file has the correct database URL
2. Verify your Neon database is running and accessible
3. Make sure no other processes are using the database
4. Try restarting your development server completely

## Backup Note

⚠️ **Warning**: The reset script will delete all existing data. If you have important data, make sure to backup your database first using Neon's backup features.

## Next Steps

After the database is working:

1. The mentor-intern system will be fully functional
2. You can assign tasks and rate intern performance
3. Interns can see their ratings and feedback
4. All the new features we implemented will work properly