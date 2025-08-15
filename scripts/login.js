// Login Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const userTypeBtns = document.querySelectorAll('.user-type-btn');
    const loginForm = document.getElementById('loginForm');
    const passwordToggle = document.getElementById('passwordToggle');
    const passwordInput = document.getElementById('password');
    const emailInput = document.getElementById('email');

    let currentUserType = 'client';

    // User type selector functionality
    userTypeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            userTypeBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            currentUserType = this.dataset.type;
            console.log('User type selected:', currentUserType);
            
            // Update form placeholder based on user type
            updateFormForUserType(currentUserType);
        });
    });

    // Password visibility toggle
    passwordToggle.addEventListener('click', function() {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        this.textContent = type === 'password' ? '👁️' : '🙈';
    });

    // Form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get selected user type from active button
        const selectedBtn = document.querySelector('.user-type-btn.active');
        const userType = selectedBtn ? selectedBtn.dataset.type : 'client';
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Get all registered users from localStorage
        let allUsers = JSON.parse(localStorage.getItem('herculesAllUsers') || '[]');
        // Find user with matching email, password, and userType
        let user = allUsers.find(u => u.email === email && u.password === password && u.userType === userType);
        if (!user) {
            // For demo: create user on the fly if not found
            const emailPrefix = email.split('@')[0];
            user = {
                firstName: emailPrefix,
                lastName: '',
                email: email,
                phone: '',
                userType: userType,
                password: password,
                registrationTime: new Date().toISOString(),
                isNewUser: false
            };
            allUsers.push(user);
            localStorage.setItem('herculesAllUsers', JSON.stringify(allUsers));
        }
        // Save session info
        const userData = { ...user, loginTime: new Date().toISOString() };
        localStorage.setItem('herculesUser', JSON.stringify(userData));
        redirectToDashboard(userType);
    });

    // Update form based on user type
    function updateFormForUserType(userType) {
        const header = document.querySelector('.login-header h1');
        const subheader = document.querySelector('.login-header p');
        
        switch(userType) {
            case 'client':
                header.textContent = 'Welcome Back';
                subheader.textContent = 'Sign in to your Hercules Pro account';
                break;
            case 'professional':
                header.textContent = 'Professional Login';
                subheader.textContent = 'Access your training dashboard';
                break;
            case 'admin':
                header.textContent = 'Admin Access';
                subheader.textContent = 'System administration panel';
                break;
        }
    }

    // Email validation
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Show error message
    function showError(message) {
        // Remove existing error
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Create error element
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            background: #fee;
            color: #c33;
            padding: 0.8rem;
            border-radius: var(--radius);
            margin-bottom: 1rem;
            border: 1px solid #fcc;
            font-size: 0.9rem;
        `;
        errorDiv.textContent = message;

        // Insert error before form
        loginForm.insertBefore(errorDiv, loginForm.firstChild);

        // Remove error after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }

    // Redirect to appropriate dashboard
    function redirectToDashboard(userType) {
        console.log('Redirecting to dashboard for user type:', userType);
        switch(userType) {
            case 'client':
                console.log('Redirecting to client dashboard');
                window.location.href = 'dashboard-client.html';
                break;
            case 'professional':
                console.log('Redirecting to professional dashboard');
                window.location.href = 'dashboard-professional.html';
                break;
            case 'admin':
                console.log('Redirecting to admin dashboard');
                window.location.href = 'dashboard-admin.html';
                break;
            default:
                console.log('Unknown user type, redirecting to client dashboard');
                window.location.href = 'dashboard-client.html';
        }
    }

    // Check if user is already logged in
    function checkExistingLogin() {
        const userData = localStorage.getItem('herculesUser');
        if (userData) {
            const user = JSON.parse(userData);
            const loginTime = new Date(user.loginTime);
            const now = new Date();
            const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
            
            // If logged in within last 24 hours, redirect to appropriate dashboard
            if (hoursDiff < 24) {
                redirectToDashboard(user.userType);
            } else {
                // Clear expired session
                localStorage.removeItem('herculesUser');
            }
        }
    }

    // Initialize
    checkExistingLogin();
}); 