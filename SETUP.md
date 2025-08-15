# Hercules Pro - Complete Setup Guide

## Prerequisites

### 1. Install Required Software
- **Node.js** (v16 or higher): https://nodejs.org/
- **MySQL** (v8.0 or higher): https://dev.mysql.com/downloads/
- **Git** (optional): https://git-scm.com/

### 2. Database Setup
1. **Install MySQL Server**
   - Download and install MySQL Server
   - Set up root password during installation
   - Create a new database user (recommended)

2. **Create Database User**
   ```sql
   CREATE USER 'hercules_user'@'localhost' IDENTIFIED BY 'your_secure_password';
   GRANT ALL PRIVILEGES ON hercules_pro.* TO 'hercules_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Configuration
1. Copy the environment example file:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` file with your configuration:
   ```env
   # Database Configuration
   MYSQL_HOST=localhost
   MYSQL_USER=hercules_user
   MYSQL_PASSWORD=your_secure_password
   MYSQL_DATABASE=hercules_pro

   # Email Configuration (Gmail recommended)
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password

   # JWT Secret (generate a secure random string)
   JWT_SECRET=your_super_secret_jwt_key_here

   # Server Configuration
   PORT=4000
   NODE_ENV=development
   ```

### 3. Email Setup (Gmail)
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in `EMAIL_PASS`

### 4. Initialize Database
```bash
npm run init-db
```

### 5. Start Backend Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

## Frontend Setup

### 1. Serve Frontend Files
Since you're using static HTML/CSS/JS, you can serve the frontend using:

```bash
# Using Python (if installed)
python -m http.server 8000

# Using Node.js (install http-server globally)
npm install -g http-server
http-server -p 8000

# Using PHP (if installed)
php -S localhost:8000
```

### 2. Access the Application
- Frontend: http://localhost:8000
- Backend API: http://localhost:4000

## API Integration

### 1. Update Frontend JavaScript
Update your frontend JavaScript files to use the new API endpoints:

```javascript
// Example API call
const API_BASE = 'http://localhost:4000/api';

async function login(email, password) {
  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    if (data.success) {
      localStorage.setItem('herculesToken', data.token);
      localStorage.setItem('herculesUser', JSON.stringify(data.user));
      return data;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}
```

### 2. Authentication Headers
For authenticated requests, include the JWT token:

```javascript
function getAuthHeaders() {
  const token = localStorage.getItem('herculesToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}
```

## Testing the Setup

### 1. Health Check
```bash
curl http://localhost:4000/api/health
```

### 2. Test Registration
```bash
curl -X POST http://localhost:4000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "first_name": "John",
    "last_name": "Doe",
    "user_type": "client"
  }'
```

### 3. Test Login
```bash
curl -X POST http://localhost:4000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Production Deployment

### 1. Environment Variables
- Set `NODE_ENV=production`
- Use strong, unique passwords
- Use HTTPS in production
- Set up proper CORS origins

### 2. Database
- Use a managed MySQL service (AWS RDS, Google Cloud SQL, etc.)
- Set up automated backups
- Configure connection pooling

### 3. Server
- Use a process manager (PM2)
- Set up reverse proxy (Nginx)
- Configure SSL certificates
- Set up monitoring and logging

### 4. Frontend
- Deploy to a CDN or static hosting service
- Update API endpoints to production URLs
- Enable compression and caching

## Troubleshooting

### Common Issues

1. **MySQL Connection Error**
   - Verify MySQL is running
   - Check credentials in `.env`
   - Ensure database exists

2. **Email Not Sending**
   - Verify Gmail app password
   - Check if 2FA is enabled
   - Test with a different email service

3. **CORS Errors**
   - Check CORS configuration in server
   - Verify frontend URL is in allowed origins

4. **JWT Token Issues**
   - Ensure JWT_SECRET is set
   - Check token expiration
   - Verify Authorization header format

### Logs
- Backend logs: Check console output
- Database logs: Check MySQL error log
- Frontend errors: Check browser console

## Security Considerations

1. **Passwords**
   - Use strong, unique passwords
   - Never commit `.env` files
   - Rotate secrets regularly

2. **Database**
   - Use least privilege principle
   - Enable SSL connections
   - Regular security updates

3. **API Security**
   - Rate limiting enabled
   - Input validation
   - SQL injection prevention
   - XSS protection

4. **Frontend Security**
   - HTTPS only in production
   - Secure cookie settings
   - Content Security Policy

## Next Steps

1. **Complete Frontend Integration**
   - Update all JavaScript files to use new API
   - Implement proper error handling
   - Add loading states

2. **Add Features**
   - Progress tracking
   - Workout logging
   - Meal plan management
   - User profiles

3. **Enhancements**
   - Real-time notifications
   - File uploads
   - Mobile app
   - AI recommendations

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review error logs
3. Test with minimal configuration
4. Verify all prerequisites are met
