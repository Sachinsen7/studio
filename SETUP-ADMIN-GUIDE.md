# Setup Admin User Guide

## Quick Access

### Option 1: Direct URL
Open in browser: `http://localhost:9002/setup-admin.html`

### Option 2: From Index Page
1. Open: `http://localhost:9002/index.html`
2. Click "Setup Admin" card

## Setup Process

### Step 1: Fill in Admin Details
- **Full Name**: Your name (e.g., "John Doe")
- **Email**: Admin email (e.g., "admin@adrs.com")
- **Password**: Minimum 6 characters
- **Confirm Password**: Must match password

### Step 2: Create Account
- Click "Create Admin Account" button
- Wait for success message
- Automatically redirects to login page

### Step 3: Login
- Use the email and password you just created
- Access the admin dashboard

## Features

### Setup Admin Page (`/setup-admin.html`)
✅ Clean, modern UI with Tailwind CSS
✅ Form validation (password match, minimum length)
✅ Visual feedback (green/red borders)
✅ Success/error messages
✅ Auto-redirect to login after success
✅ Prevents duplicate admin creation

### API Endpoint (`/api/setup/admin`)
✅ Creates admin user in database
✅ Hashes password with bcrypt
✅ Validates required fields
✅ Checks for existing admin
✅ Prevents duplicate emails
✅ Returns user details on success

## Security Features

1. **Password Hashing**: Uses bcrypt with salt rounds
2. **Validation**: Server-side validation of all inputs
3. **Duplicate Prevention**: Only one admin can be created
4. **Email Uniqueness**: Prevents duplicate email addresses

## Troubleshooting

### "Admin user already exists"
- An admin account has already been created
- Use the existing admin credentials to login
- Or delete the admin user from database to recreate

### "Email already in use"
- This email is already registered
- Use a different email address
- Or login with existing credentials

### "Network error"
- Check if dev server is running (`npm run dev`)
- Verify API endpoint is accessible
- Check browser console for errors

## After Setup

Once admin is created:
1. **Login**: Go to `/login` with admin credentials
2. **Dashboard**: Access admin dashboard at `/dashboard`
3. **Manage System**: 
   - Add employees
   - Create projects
   - Send bulk messages
   - View reports

## Files Created

- `public/setup-admin.html` - Setup page UI
- `public/index.html` - Landing page with links
- `src/app/api/setup/admin/route.ts` - API endpoint

## API Request Example

```javascript
POST /api/setup/admin
Content-Type: application/json

{
  "name": "John Doe",
  "email": "admin@adrs.com",
  "password": "securepassword123"
}
```

## API Response Example

**Success (201):**
```json
{
  "message": "Admin user created successfully",
  "user": {
    "id": "clx1234567890",
    "name": "John Doe",
    "email": "admin@adrs.com",
    "role": "admin"
  }
}
```

**Error (400):**
```json
{
  "error": "Admin user already exists"
}
```

## Next Steps

After creating admin:
1. ✅ Login with admin credentials
2. ✅ Setup employees via dashboard
3. ✅ Create projects
4. ✅ Configure system settings
5. ✅ Send welcome messages to team

## Quick Links

- Setup Admin: `http://localhost:9002/setup-admin.html`
- Login: `http://localhost:9002/login`
- Dashboard: `http://localhost:9002/dashboard`
- API Health: `http://localhost:9002/api/health`