// Registration Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const userTypeBtns = document.querySelectorAll('.user-type-btn');
    const registerForm = document.getElementById('registerForm');
    const passwordToggle = document.getElementById('passwordToggle');
    const confirmPasswordToggle = document.getElementById('confirmPasswordToggle');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const professionalFields = document.querySelector('.professional-fields');
    const sendCodeBtn = document.getElementById('sendCodeBtn');
    const verifyCodeBtn = document.getElementById('verifyCodeBtn');
    const codeGroup = document.getElementById('codeGroup');
    const codeStatus = document.getElementById('codeStatus');
    const emailInput = document.getElementById('email');
    const verificationCodeInput = document.getElementById('verificationCode');
    let emailVerified = false;
    let lastEmail = '';

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
            
            // Show/hide professional fields
            toggleProfessionalFields(currentUserType);
            
            // Update form based on user type
            updateFormForUserType(currentUserType);
        });
    });

    // Password visibility toggles
    passwordToggle.addEventListener('click', function() {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        this.textContent = type === 'password' ? '👁️' : '🙈';
    });

    confirmPasswordToggle.addEventListener('click', function() {
        const type = confirmPasswordInput.type === 'password' ? 'text' : 'password';
        confirmPasswordInput.type = type;
        this.textContent = type === 'password' ? '👁️' : '🙈';
    });

    sendCodeBtn.addEventListener('click', async function() {
        const email = emailInput.value.trim();
        if (!validateEmail(email)) {
            showError('Please enter a valid email address');
            return;
        }
        sendCodeBtn.disabled = true;
        sendCodeBtn.textContent = 'Sending...';
        codeStatus.textContent = '';
        try {
            const res = await fetch('http://localhost:4000/send-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            if (res.ok) {
                codeGroup.style.display = '';
                codeStatus.textContent = 'Code sent! Check your email.';
                codeStatus.style.color = '#363';
                lastEmail = email;
            } else {
                codeStatus.textContent = 'Failed to send code. Try again.';
                codeStatus.style.color = '#c33';
            }
        } catch (err) {
            codeStatus.textContent = 'Network error. Try again.';
            codeStatus.style.color = '#c33';
        }
        sendCodeBtn.disabled = false;
        sendCodeBtn.textContent = 'Send Code';
    });

    verifyCodeBtn.addEventListener('click', async function() {
        const email = emailInput.value.trim();
        const code = verificationCodeInput.value.trim();
        if (!code) {
            codeStatus.textContent = 'Enter the code you received.';
            codeStatus.style.color = '#c33';
            return;
        }
        verifyCodeBtn.disabled = true;
        verifyCodeBtn.textContent = 'Verifying...';
        try {
            const res = await fetch('http://localhost:4000/verify-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code })
            });
            if (res.ok) {
                codeStatus.textContent = 'Email verified! You can now register.';
                codeStatus.style.color = '#363';
                emailVerified = true;
                emailInput.readOnly = true;
                sendCodeBtn.style.display = 'none';
                verificationCodeInput.readOnly = true;
                verifyCodeBtn.style.display = 'none';
            } else {
                codeStatus.textContent = 'Invalid code. Try again.';
                codeStatus.style.color = '#c33';
            }
        } catch (err) {
            codeStatus.textContent = 'Network error. Try again.';
            codeStatus.style.color = '#c33';
        }
        verifyCodeBtn.disabled = false;
        verifyCodeBtn.textContent = 'Verify Code';
    });

    // Form submission
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(registerForm);
        const firstName = formData.get('firstName').trim();
        const lastName = formData.get('lastName').trim();
        const email = formData.get('email').trim();
        const phone = formData.get('phone').trim();
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');
        const terms = formData.get('terms');

        // DEMO: Skip email verification
        // if (!emailVerified) {
        //     showError('Please verify your email before registering.');
        //     return;
        // }
        if (!validateForm(firstName, lastName, email, password, confirmPassword, terms)) {
            return;
        }

        // Show loading state
        const submitBtn = registerForm.querySelector('.login-btn');
        submitBtn.classList.add('loading');
        submitBtn.textContent = 'Creating Account...';

        // Simulate registration process
        setTimeout(() => {
            // Store user info in localStorage (in real app, this would go to a database)
            const userData = {
                firstName: firstName,
                lastName: lastName,
                email: email,
                phone: phone,
                userType: currentUserType,
                password: password,
                registrationTime: new Date().toISOString(),
                isNewUser: true
            };

            // Add professional-specific data if applicable
            if (currentUserType === 'professional') {
                userData.certification = formData.get('certification');
                userData.experience = formData.get('experience');
            }
            // Save to herculesAllUsers array
            let allUsers = JSON.parse(localStorage.getItem('herculesAllUsers') || '[]');
            // Prevent duplicate emails
            if (allUsers.some(u => u.email === email)) {
                showError('An account with this email already exists.');
                submitBtn.classList.remove('loading');
                submitBtn.textContent = 'Create Account';
                return;
            }
            allUsers.push(userData);
            localStorage.setItem('herculesAllUsers', JSON.stringify(allUsers));
            localStorage.setItem('herculesUser', JSON.stringify(userData));
            // Show success message and redirect
            const dashboardNames = {
                'client': 'Client Dashboard',
                'professional': 'Professional Dashboard', 
                'admin': 'Admin Dashboard'
            };
            showSuccess(`Account created successfully! Redirecting to ${dashboardNames[currentUserType]}...`);
            setTimeout(() => {
                redirectToDashboard(currentUserType);
            }, 2000);
        }, 1000); // Faster for demo
    });

    // Toggle professional fields visibility
    function toggleProfessionalFields(userType) {
        if (userType === 'professional') {
            professionalFields.style.display = 'block';
            professionalFields.style.animation = 'slideDown 0.3s ease-out';
        } else {
            professionalFields.style.display = 'none';
        }
    }

    // Update form based on user type
    function updateFormForUserType(userType) {
        const header = document.querySelector('.login-header h1');
        const subheader = document.querySelector('.login-header p');
        
        switch(userType) {
            case 'client':
                header.textContent = 'Create Account';
                subheader.textContent = 'Join Hercules Pro and start your fitness journey';
                break;
            case 'professional':
                header.textContent = 'Professional Registration';
                subheader.textContent = 'Join our network of fitness professionals';
                break;
            case 'admin':
                header.textContent = 'Admin Registration';
                subheader.textContent = 'Create system administrator account';
                break;
        }
    }

    // Form validation
    function validateForm(firstName, lastName, email, password, confirmPassword, terms) {
        // Check required fields
        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            showError('Please fill in all required fields');
            return false;
        }

        // Validate email
        if (!validateEmail(email)) {
            showError('Please enter a valid email address');
            return false;
        }

        // Validate password
        if (password.length < 8) {
            showError('Password must be at least 8 characters long');
            return false;
        }

        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
            showError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
            return false;
        }

        // Check password confirmation
        if (password !== confirmPassword) {
            showError('Passwords do not match');
            return false;
        }

        // Check terms agreement
        if (!terms) {
            showError('Please agree to the Terms of Service and Privacy Policy');
            return false;
        }

        // Professional-specific validation
        if (currentUserType === 'professional') {
            const certification = document.getElementById('certification').value.trim();
            const experience = document.getElementById('experience').value;
            
            if (!certification) {
                showError('Please enter your certification details');
                return false;
            }
            
            if (!experience) {
                showError('Please select your years of experience');
                return false;
            }
        }

        return true;
    }

    // Email validation
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Show error message
    function showError(message) {
        // Remove existing messages
        const existingError = document.querySelector('.error-message');
        const existingSuccess = document.querySelector('.success-message');
        if (existingError) existingError.remove();
        if (existingSuccess) existingSuccess.remove();

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
        registerForm.insertBefore(errorDiv, registerForm.firstChild);

        // Remove error after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }

    // Show success message
    function showSuccess(message) {
        // Remove existing messages
        const existingError = document.querySelector('.error-message');
        const existingSuccess = document.querySelector('.success-message');
        if (existingError) existingError.remove();
        if (existingSuccess) existingSuccess.remove();

        // Create success element
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.style.cssText = `
            background: #efe;
            color: #363;
            padding: 0.8rem;
            border-radius: var(--radius);
            margin-bottom: 1rem;
            border: 1px solid #cfc;
            font-size: 0.9rem;
        `;
        successDiv.textContent = message;

        // Insert success before form
        registerForm.insertBefore(successDiv, registerForm.firstChild);
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

    // Add CSS animation for professional fields
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
}); 