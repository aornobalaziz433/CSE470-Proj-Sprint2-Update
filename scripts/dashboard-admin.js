// Admin Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!checkAuth()) {
        window.location.href = 'login.html';
        return;
    }

    // Load user data
    loadUserData();
    
    // Initialize dashboard
    initializeDashboard();
    
    // Setup event listeners
    setupEventListeners();
});

// Check if user is authenticated
function checkAuth() {
    const userData = localStorage.getItem('herculesUser');
    if (!userData) return false;
    
    const user = JSON.parse(userData);
    if (user.userType !== 'admin') {
        return false;
    }
    
    // Check if session is still valid (24 hours)
    const loginTime = new Date(user.loginTime);
    const now = new Date();
    const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
    
    if (hoursDiff > 24) {
        localStorage.removeItem('herculesUser');
        return false;
    }
    
    return true;
}

// Load user data and update UI
function loadUserData() {
    const userData = JSON.parse(localStorage.getItem('herculesUser'));
    
    // Update user name displays
    const userNameElements = document.querySelectorAll('#userNameHeader');
    const displayName = userData.firstName || 'Admin';
    
    userNameElements.forEach(element => {
        element.textContent = displayName;
    });
    
    // Store user data globally for other functions
    window.currentUser = userData;
}

// Initialize dashboard components
function initializeDashboard() {
    // Initialize analytics charts
    initializeAnalyticsCharts();
    
    // Load mock data for stats
    updateStats();
    
    // Setup navigation
    setupNavigation();
    
    // Initialize system monitoring
    initializeSystemMonitoring();
    
    // Initialize activity feed
    initializeActivityFeed();
}

// Setup event listeners
function setupEventListeners() {
    // Navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all items
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Add active class to clicked item
            this.closest('.nav-item').classList.add('active');
            
            // Handle navigation (in a real app, this would load different content)
            const section = this.getAttribute('href').substring(1);
            console.log('Navigating to:', section);
        });
    });
    
    // Chart controls
    const chartControls = document.querySelectorAll('.chart-controls .btn');
    chartControls.forEach(btn => {
        btn.addEventListener('click', function() {
            chartControls.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Update analytics based on selected period
            const period = this.textContent.toLowerCase();
            updateAnalytics(period);
        });
    });
    
    // Quick action buttons
    const actionButtons = document.querySelectorAll('.action-card .btn');
    actionButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.closest('.action-card').querySelector('h4').textContent;
            handleQuickAction(action);
        });
    });
    
    // Approval buttons
    const approvalButtons = document.querySelectorAll('.approval-actions .btn');
    approvalButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.textContent;
            const approvalCard = this.closest('.approval-card');
            const approvalType = approvalCard.querySelector('.approval-header h4').textContent;
            handleApproval(action, approvalType, approvalCard);
        });
    });
    
    // System cards
    const systemCards = document.querySelectorAll('.system-card');
    systemCards.forEach(card => {
        card.addEventListener('click', function() {
            const systemType = this.querySelector('h4').textContent;
            viewSystemDetails(systemType);
        });
    });
    
    // Activity items
    const activityItems = document.querySelectorAll('.activity-item');
    activityItems.forEach(item => {
        item.addEventListener('click', function() {
            const activityInfo = this.querySelector('h4').textContent;
            viewActivityDetails(activityInfo);
        });
    });
}

// Initialize analytics charts
function initializeAnalyticsCharts() {
    const charts = ['growthChart', 'revenueChart', 'retentionChart'];
    
    charts.forEach(chartId => {
        const canvas = document.getElementById(chartId);
        if (canvas) {
            drawSimpleChart(canvas, chartId);
        }
    });
}

// Draw simple charts for analytics
function drawSimpleChart(canvas, chartType) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw different chart types
    switch(chartType) {
        case 'growthChart':
            drawLineChart(ctx, [10, 12, 15, 13, 18, 16, 15], width, height);
            break;
        case 'revenueChart':
            drawBarChart(ctx, [35000, 38000, 42000, 40000, 45000, 43000, 45230], width, height);
            break;
        case 'retentionChart':
            drawPieChart(ctx, [89, 11], width, height);
            break;
    }
}

// Draw bar chart
function drawBarChart(ctx, data, width, height) {
    const barWidth = width / data.length * 0.6;
    const spacing = width / data.length * 0.4;
    const maxValue = Math.max(...data);
    
    ctx.fillStyle = '#f5e9da';
    
    data.forEach((value, index) => {
        const barHeight = (value / maxValue) * height * 0.8;
        const x = index * (barWidth + spacing) + spacing / 2;
        const y = height - barHeight - 10;
        
        ctx.fillRect(x, y, barWidth, barHeight);
    });
}

// Draw line chart
function drawLineChart(ctx, data, width, height) {
    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const range = maxValue - minValue;
    
    ctx.strokeStyle = '#f5e9da';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    data.forEach((value, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - ((value - minValue) / range) * height * 0.8 - 10;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
}

// Draw pie chart
function drawPieChart(ctx, data, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;
    
    const total = data.reduce((sum, value) => sum + value, 0);
    let currentAngle = 0;
    
    data.forEach((value, index) => {
        const sliceAngle = (value / total) * 2 * Math.PI;
        
        ctx.fillStyle = index === 0 ? '#f5e9da' : '#e1e5e9';
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        ctx.fill();
        
        currentAngle += sliceAngle;
    });
}

// Update analytics based on period
function updateAnalytics(period) {
    const charts = ['growthChart', 'revenueChart', 'retentionChart'];
    
    charts.forEach(chartId => {
        const canvas = document.getElementById(chartId);
        if (canvas) {
            // In a real app, this would fetch new data based on the period
            drawSimpleChart(canvas, chartId);
        }
    });
}

// Update stats with mock data
function updateStats() {
    // In a real app, this would fetch data from an API
    const stats = {
        totalUsers: 1247,
        activeProfessionals: 156,
        activeClients: 1091,
        monthlyRevenue: 45230
    };
    
    // Update stat values
    const statElements = document.querySelectorAll('.stat-value');
    statElements.forEach(element => {
        const statType = element.closest('.stat-card').querySelector('h3').textContent.toLowerCase();
        
        if (statType.includes('total users')) {
            element.textContent = stats.totalUsers.toLocaleString();
        } else if (statType.includes('active professionals')) {
            element.textContent = stats.activeProfessionals;
        } else if (statType.includes('active clients')) {
            element.textContent = stats.activeClients.toLocaleString();
        } else if (statType.includes('monthly revenue')) {
            element.textContent = '$' + stats.monthlyRevenue.toLocaleString();
        }
    });
}

// Initialize system monitoring
function initializeSystemMonitoring() {
    // Simulate real-time system status updates
    setInterval(() => {
        const systemCards = document.querySelectorAll('.system-card');
        systemCards.forEach(card => {
            const statusElement = card.querySelector('.system-status');
            const iconElement = card.querySelector('.system-icon');
            
            if (statusElement && Math.random() > 0.95) {
                // Randomly change system status
                const statuses = ['Healthy', 'Warning', 'Error'];
                const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
                
                // Update status
                statusElement.textContent = newStatus;
                
                // Update styling
                card.className = `system-card ${newStatus.toLowerCase()}`;
                
                // Update icon
                if (newStatus === 'Healthy') {
                    iconElement.textContent = '🟢';
                } else if (newStatus === 'Warning') {
                    iconElement.textContent = '🟡';
                } else {
                    iconElement.textContent = '🔴';
                }
            }
        });
    }, 30000); // Update every 30 seconds
}

// Initialize activity feed
function initializeActivityFeed() {
    // Simulate new activity entries
    setInterval(() => {
        if (Math.random() > 0.8) {
            addNewActivity();
        }
    }, 60000); // Add new activity every minute
}

// Add new activity to feed
function addNewActivity() {
    const activityTimeline = document.querySelector('.activity-timeline');
    if (!activityTimeline) return;
    
    const activities = [
        {
            time: 'Just now',
            title: 'New User Registration',
            description: 'A new client registered on the platform',
            status: 'info'
        },
        {
            time: 'Just now',
            title: 'System Update',
            description: 'Background maintenance completed',
            status: 'success'
        },
        {
            time: 'Just now',
            title: 'Content Moderation',
            description: 'Workout plan flagged for review',
            status: 'warning'
        }
    ];
    
    const randomActivity = activities[Math.floor(Math.random() * activities.length)];
    
    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';
    activityItem.innerHTML = `
        <div class="activity-time">${randomActivity.time}</div>
        <div class="activity-info">
            <h4>${randomActivity.title}</h4>
            <p>${randomActivity.description}</p>
        </div>
        <div class="activity-status ${randomActivity.status}">${randomActivity.status}</div>
    `;
    
    // Add to top of timeline
    activityTimeline.insertBefore(activityItem, activityTimeline.firstChild);
    
    // Remove old activities if too many
    const allActivities = activityTimeline.querySelectorAll('.activity-item');
    if (allActivities.length > 10) {
        allActivities[allActivities.length - 1].remove();
    }
    
    // Add animation
    activityItem.style.opacity = '0';
    activityItem.style.transform = 'translateY(-20px)';
    setTimeout(() => {
        activityItem.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        activityItem.style.opacity = '1';
        activityItem.style.transform = 'translateY(0)';
    }, 100);
}

// Setup navigation
function setupNavigation() {
    // Add mobile menu toggle if needed
    const header = document.querySelector('.dashboard-header');
    if (window.innerWidth <= 768) {
        const mobileToggle = document.createElement('button');
        mobileToggle.className = 'mobile-menu-toggle';
        mobileToggle.innerHTML = '☰';
        mobileToggle.addEventListener('click', toggleMobileMenu);
        header.insertBefore(mobileToggle, header.firstChild);
    }
}

// Toggle mobile menu
function toggleMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('open');
}

// Handle quick actions
function handleQuickAction(action) {
    switch(action) {
        case 'User Management':
            manageUsers();
            break;
        case 'System Analytics':
            viewSystemAnalytics();
            break;
        case 'System Settings':
            openSystemSettings();
            break;
        case 'Reports':
            generateReport();
            break;
        default:
            console.log('Action:', action);
    }
}

// Handle approval actions
function handleApproval(action, approvalType, approvalCard) {
    const approvalText = approvalCard.querySelector('p').textContent;
    
    if (action === 'Approve' || action === 'Restore') {
        alert(`Approved: ${approvalType} - ${approvalText}`);
        approvalCard.style.opacity = '0.5';
        approvalCard.style.pointerEvents = 'none';
    } else if (action === 'Reject' || action === 'Permanent Ban') {
        alert(`Rejected: ${approvalType} - ${approvalText}`);
        approvalCard.style.opacity = '0.5';
        approvalCard.style.pointerEvents = 'none';
    }
}

// Manage users
function manageUsers() {
    alert('Opening user management interface... In a real app, this would show a comprehensive user management system.');
}

// View system analytics
function viewSystemAnalytics() {
    alert('Opening system analytics... In a real app, this would show detailed system performance metrics.');
}

// Open system settings
function openSystemSettings() {
    alert('Opening system settings... In a real app, this would show system configuration options.');
}

// Generate report
function generateReport() {
    alert('Generating report... In a real app, this would create and download a comprehensive system report.');
}

// View system details
function viewSystemDetails(systemType) {
    alert(`Viewing details for ${systemType}... In a real app, this would show detailed system information and controls.`);
}

// View activity details
function viewActivityDetails(activityInfo) {
    alert(`Viewing details for: ${activityInfo}... In a real app, this would show detailed activity information and logs.`);
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('herculesUser');
        window.location.href = 'login.html';
    }
}

// Make logout function globally available
window.logout = logout;

// Handle window resize
window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.remove('open');
    }
});

// Add interactive features
document.addEventListener('click', function(e) {
    // Make stat cards clickable
    if (e.target.closest('.stat-card')) {
        const statCard = e.target.closest('.stat-card');
        const statType = statCard.querySelector('h3').textContent;
        console.log('Clicked on:', statType);
        // In a real app, this would show detailed analytics
    }
    
    // Make analytics cards clickable
    if (e.target.closest('.analytics-card')) {
        const analyticsCard = e.target.closest('.analytics-card');
        const analyticsTitle = analyticsCard.querySelector('h4').textContent;
        console.log('Analytics:', analyticsTitle);
        // In a real app, this would show detailed analytics
    }
});

// Add smooth animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all cards for animation
document.querySelectorAll('.stat-card, .system-card, .action-card, .analytics-card, .activity-item, .approval-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});

// Add hover effects for interactive elements
document.querySelectorAll('.system-card, .action-card, .activity-item, .approval-card').forEach(element => {
    element.style.cursor = 'pointer';
    element.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
    });
    
    element.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)';
    });
});

// Add real-time notifications
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#dcfce7' : type === 'warning' ? '#fef3c7' : type === 'error' ? '#fee2e2' : '#dbeafe'};
        color: ${type === 'success' ? '#166534' : type === 'warning' ? '#92400e' : type === 'error' ? '#991b1b' : '#1e40af'};
        padding: 1rem;
        border-radius: var(--radius);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Simulate occasional notifications
setInterval(() => {
    if (Math.random() > 0.9) {
        const notifications = [
            { message: 'New user registration detected', type: 'info' },
            { message: 'System backup completed successfully', type: 'success' },
            { message: 'High server load detected', type: 'warning' },
            { message: 'Database connection restored', type: 'success' }
        ];
        
        const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
        showNotification(randomNotification.message, randomNotification.type);
    }
}, 30000); // Check every 30 seconds 