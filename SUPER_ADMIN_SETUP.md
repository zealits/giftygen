# Super Admin System Setup

This document explains how to set up and use the Super Admin system for GiftyGen.

## Overview

The Super Admin system allows authorized administrators to:

- Login through a secure `/superlogin` route
- View all registration requests from users
- Approve, reject, or keep pending registration requests
- Add notes to requests
- View statistics about registration requests

## Setup Instructions

### 1. Create Super Admin User

Run the following command to create a super admin user:

```bash
npm run create-superadmin
```

This will create a super admin with the following credentials:

- **Email**: superadmin@giftygen.com
- **Password**: SuperAdmin123!
- **Role**: SuperAdmin

**Note**: Change these credentials after first login for security purposes.

### 2. Access Super Admin Panel

1. Navigate to `/superlogin` in your application
2. Login with the super admin credentials
3. You'll be redirected to `/superadmin/dashboard`

## Features

### Dashboard Overview

- **Statistics Cards**: Shows total, pending, approved, and rejected requests
- **Registration Requests Table**: Lists all registration requests with details
- **Status Management**: Update request status (pending/approved/rejected)
- **Notes**: Add comments or notes to each request

### Registration Request Details

Each registration request includes:

- User's name and email
- Restaurant name and contact information
- Restaurant address details
- Registration date
- Current status
- Admin notes

### Status Management

- **Pending**: New requests awaiting review
- **Approved**: Requests that have been approved
- **Rejected**: Requests that have been rejected

## API Endpoints

### Public Endpoints

- `POST /api/superadmin/login` - Super admin login

### Protected Endpoints (Require Super Admin Authentication)

- `GET /api/superadmin/profile` - Get super admin profile
- `GET /api/superadmin/logout` - Logout super admin
- `GET /api/superadmin/registration-requests` - Get all registration requests
- `GET /api/superadmin/registration-requests/:id` - Get specific request
- `PUT /api/superadmin/registration-requests/:id/status` - Update request status
- `GET /api/superadmin/stats` - Get registration statistics

## Security Features

- JWT-based authentication
- Role-based access control (SuperAdmin role required)
- Secure password hashing using bcrypt
- Token expiration handling
- Protected routes middleware

## Database Models

### SuperAdmin Schema

- Basic user information (name, email, password)
- Role and active status
- Last login tracking
- Password reset functionality

### RegistrationRequest Schema

- User registration details
- Request status tracking
- Admin review information
- Timestamps and audit trail

## Frontend Components

### SuperAdminLogin

- Secure login form for super admins
- Error handling and validation
- Responsive design

### SuperAdminDashboard

- Overview of all registration requests
- Statistics display
- Status update functionality
- Modal for detailed request review

## Usage Workflow

1. **User Registration**: When users register, their information is automatically saved to the RegistrationRequest model
2. **Super Admin Review**: Super admins can view and review all pending requests
3. **Status Update**: Admins can approve, reject, or keep requests pending
4. **Notes**: Add comments or reasons for status changes
5. **Tracking**: All changes are logged with timestamps and admin information

## Customization

### Adding New Fields

To add new fields to registration requests:

1. Update `models/registrationRequestSchema.js`
2. Update the frontend forms and display components
3. Update the super admin dashboard to show new fields

### Adding New Status Types

To add new status types:

1. Update the enum in `models/registrationRequestSchema.js`
2. Update the frontend status selection
3. Update status color logic in the dashboard

## Troubleshooting

### Common Issues

1. **Authentication Failed**: Check if JWT_SECRET is properly set in environment variables
2. **Database Connection**: Ensure MongoDB is running and connection string is correct
3. **Role Authorization**: Verify the user has SuperAdmin role in the database

### Reset Super Admin Password

If you need to reset the super admin password:

1. Access the database directly
2. Update the password field in the SuperAdmin collection
3. Or delete the existing super admin and run the creation script again

## Security Best Practices

1. **Change Default Credentials**: Always change the default super admin password
2. **Regular Password Updates**: Implement password rotation policies
3. **Access Logging**: Monitor super admin access and actions
4. **Session Management**: Implement proper session timeout and logout
5. **IP Restrictions**: Consider implementing IP-based access restrictions

## Support

For technical support or questions about the Super Admin system, please refer to the main project documentation or contact the development team.
