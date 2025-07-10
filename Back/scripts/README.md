# AI Dock Admin Setup Guide

This guide explains how to set up your first admin user and initialize the AI Dock database.

## Prerequisites

1. **Database Running**: Ensure PostgreSQL is running and accessible
2. **Environment Variables**: Configure your `.env` file with database connection details
3. **Dependencies**: Install Python dependencies with `pip install -r requirements.txt`

## Quick Setup

### Option 1: Automated Setup (Recommended)

```bash
# Navigate to the backend directory
cd Back

# Run the admin setup script
python scripts/create_admin_user.py
```

This script will:
- ✅ Test database connection
- ✅ Create all database tables
- ✅ Set up default roles (admin, manager, user)
- ✅ Create default department
- ✅ Create admin user with secure credentials
- ✅ Verify setup completion

### Option 2: Railway/Automatic Setup

For Railway deployments, the database setup happens automatically when the app starts. No manual setup is needed.

### Option 3: Manual Database Setup

If you need to manually set up the database:

```bash
# Navigate to the backend directory
cd Back

# Run the database setup script
python scripts/setup_database.py
```

### Option 4: Test Dependencies First

If you want to verify everything will work before running the setup:

```bash
# Test that all dependencies can be imported
python scripts/test_admin_setup.py

# If successful, run the main setup
python scripts/create_admin_user.py
```

## Default Admin Credentials

After running the setup script, you can login with:

- **Email**: `admin@aidock.dev`
- **Username**: `admin`
- **Password**: `admin123`

> **⚠️ SECURITY WARNING**: Change this password immediately after first login!

## What Gets Created

### 1. Database Tables
- All SQLAlchemy models converted to PostgreSQL tables
- Proper relationships and constraints
- Indexes for performance

### 2. Default Roles
- **Administrator**: Full system access with all permissions
- **Department Manager**: Can manage users and quotas within their department
- **Standard User**: Basic AI chat access with personal usage tracking

### 3. Default Department
- **Administration** department (code: ADMIN)
- $10,000 monthly budget
- Default location for admin users

### 4. Admin User
- System administrator account
- Full permissions
- Active and verified status

## Next Steps

1. **Start the Backend Server**:
   ```bash
   cd Back
   uvicorn app.main:app --reload
   ```

2. **Test the API**:
   - Visit: https://idyllic-moxie-aedb62.netlify.app/0/docs
   - Use the `/auth/login` endpoint with the admin credentials

3. **Access Admin Panel**:
   - Login through the frontend application
   - Navigate to the admin settings
   - Configure additional users and departments

4. **Security Setup**:
   - Change the default admin password
   - Create department-specific admin accounts
   - Configure LLM provider API keys
   - Set up department quotas

## Railway Deployment

For Railway deployments, the database setup is **automatic**:

1. **No manual setup required** - The app automatically sets up the database when it starts
2. **Database seeding happens at runtime** - Not during build time
3. **Admin user is created automatically** - Default credentials: `admin@aidock.dev` / `admin123`

The app will:
- ✅ Connect to the Railway PostgreSQL database
- ✅ Create all necessary tables
- ✅ Seed initial data (roles, departments, admin user)
- ✅ Start serving the API

### Railway Environment Variables

Make sure these are set in Railway:
- `DATABASE_URL` - Automatically provided by Railway PostgreSQL
- `SECRET_KEY` - Your JWT signing key
- `ENVIRONMENT` - Set to "production"
- `DEBUG` - Set to "false"

## Troubleshooting

### Railway Deployment Issues

If Railway deployment fails:
1. Check that `DATABASE_URL` is set correctly
2. Ensure all environment variables are configured
3. Check the Railway logs for specific error messages
4. The app will retry database connections automatically

### Database Connection Issues

```bash
# Check PostgreSQL status
pg_ctl status

# Verify database URL format in .env
DATABASE_URL=postgresql://username:password@localhost/aidock
```

### Import Errors

```bash
# Test dependencies
python scripts/test_admin_setup.py

# Check that you're in the correct directory
cd Back  # Must be in the Back directory
```

### Permission Errors

```bash
# Ensure script has execute permissions
chmod +x scripts/create_admin_user.py
```

### Role/Permission Issues

The script automatically creates roles with these permissions:

**Admin Role**:
- `can_manage_users`
- `can_manage_departments`
- `can_manage_roles`
- `can_view_all_usage`
- `can_manage_quotas`
- `can_configure_llms`
- `can_access_admin_panel`
- `can_use_llms`

**Manager Role**:
- `can_manage_department_users`
- `can_view_department_usage`
- `can_use_llms`
- `can_access_admin_panel`

**User Role**:
- `can_use_llms`
- `can_view_own_usage`
- `can_access_ai_history`

## Advanced Configuration

### Custom Admin Credentials

To use custom credentials, modify the script before running:

```python
# In create_admin_user.py, find this section:
admin_user = User(
    email="your-email@company.com",  # Change this
    username="your-username",        # Change this
    password_hash=get_password_hash("your-secure-password"),  # Change this
    # ... rest of configuration
)
```

### Custom Department

To create a custom default department:

```python
# In create_admin_user.py, modify:
department = Department(
    name="Your Department",
    code="DEPT",
    description="Your department description",
    monthly_budget=5000.00,  # Your budget
    # ... rest of configuration
)
```

## Files Overview

- `scripts/create_admin_user.py` - Main setup script
- `scripts/test_admin_setup.py` - Dependency test script
- `app/models/user.py` - User database model
- `app/models/role.py` - Role and permissions model
- `app/models/department.py` - Department model
- `app/core/database.py` - Database connection setup
- `app/core/security.py` - Password hashing and authentication

## Support

If you encounter issues:

1. Check the console output for specific error messages
2. Verify your database connection settings
3. Ensure all Python dependencies are installed
4. Make sure you're running the script from the `Back` directory

For additional help, check the project documentation or contact your system administrator.
