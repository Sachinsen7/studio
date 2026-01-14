# Attendance System Setup Guide

## Overview
The attendance system has been updated to use dynamic data from the database via API endpoints instead of static mock data.

## What's New

### API Endpoints Created

1. **`/api/attendance`** - Main attendance CRUD operations
   - `GET` - Fetch attendance records (supports filtering by date, month, year, employeeId)
   - `POST` - Create new attendance record
   - `PUT` - Update existing attendance record

2. **`/api/attendance/stats`** - Get attendance statistics
   - `GET` - Returns daily stats (present, late, absent, onLeave, halfDay counts)
   - Query params: `date` (optional, defaults to today)

3. **`/api/attendance/calendar`** - Calendar view data
   - `GET` - Returns attendance grouped by date and leave days for calendar
   - Query params: `month` and `year` (required)

### Updated Attendance Page

The attendance page (`src/app/(app)/attendance/page.tsx`) now:
- Fetches real-time data from APIs
- Shows loading states
- Displays actual attendance records from the database
- Has an improved calendar UI with:
  - Better styling and spacing
  - Visual indicators for leave days (yellow dots)
  - Legend showing what each color means
  - Month navigation support

## Setup Instructions

### 1. Seed Attendance Data

Run the attendance seed script to populate sample data:

```bash
npx tsx prisma/seed-attendance.ts
```

This will:
- Create attendance records for the last 30 days (excluding weekends)
- Generate realistic attendance patterns (75% present, 10% late, 5% half-day, 5% on leave, 5% absent)
- Create sample leave requests

### 2. Start the Development Server

```bash
npm run dev
```

### 3. View the Attendance Page

Navigate to: `http://localhost:3000/attendance`

## Features

### Stats Cards
- **Present Today** - Green card showing employees present
- **Late Arrivals** - Orange card showing late employees
- **Absent** - Red card showing absent employees
- **On Leave** - Yellow card showing employees on approved leave

### Attendance Table
- Shows today's attendance records
- Displays employee avatar, name, role
- Color-coded status badges
- Check-in and check-out times

### Calendar View
- Monthly overview with navigation
- Yellow dots indicate leave days
- Visual legend for easy understanding
- Responsive design

## API Usage Examples

### Fetch Today's Attendance
```javascript
const response = await fetch('/api/attendance?date=2026-01-14');
const data = await response.json();
```

### Fetch Attendance Stats
```javascript
const response = await fetch('/api/attendance/stats?date=2026-01-14');
const stats = await response.json();
// Returns: { present: 5, late: 1, absent: 0, onLeave: 2, halfDay: 0, total: 8 }
```

### Fetch Calendar Data
```javascript
const response = await fetch('/api/attendance/calendar?month=1&year=2026');
const data = await response.json();
// Returns: { attendanceByDate: {...}, leaveDays: [...], summary: [...] }
```

### Create Attendance Record
```javascript
const response = await fetch('/api/attendance', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    employeeId: 'emp-123',
    date: '2026-01-14',
    status: 'Present',
    checkIn: '09:00 AM',
    checkOut: '06:00 PM'
  })
});
```

## Database Schema

The attendance system uses these Prisma models:

- **Attendance** - Stores daily attendance records
- **LeaveRequest** - Stores leave applications
- **Employee** - Employee information

## Next Steps

You can extend the system by:
1. Adding an admin interface to mark attendance
2. Creating employee self-check-in functionality
3. Adding attendance reports and analytics
4. Implementing attendance notifications
5. Adding bulk attendance marking
6. Creating attendance export functionality

## Troubleshooting

### No Data Showing
- Make sure you've run the seed script
- Check that your database connection is working
- Verify the API endpoints are accessible

### Calendar Not Showing Leave Days
- Ensure leave requests have `status: 'Approved'`
- Check that leave dates fall within the current month
- Verify the calendar API is returning data

### Stats Not Updating
- The stats are calculated from today's attendance records
- Make sure attendance records exist for today's date
- Check browser console for API errors
