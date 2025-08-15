// Professional Dashboard JavaScript
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
    if (user.userType !== 'professional') {
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
    const userNameElements = document.querySelectorAll('#userName, #userNameHeader');
    const displayName = userData.firstName || userData.email.split('@')[0];
    
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
    
    // Initialize client status updates
    initializeClientStatus();
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
    
    // Client cards
    const clientCards = document.querySelectorAll('.client-card');
    clientCards.forEach(card => {
        card.addEventListener('click', function() {
            const clientName = this.querySelector('h4').textContent;
            viewClientDetails(clientName);
        });
    });
    
    // Schedule items
    const scheduleItems = document.querySelectorAll('.schedule-item');
    scheduleItems.forEach(item => {
        item.addEventListener('click', function() {
            const sessionInfo = this.querySelector('h4').textContent;
            viewSessionDetails(sessionInfo);
        });
    });
}

// Initialize analytics charts
function initializeAnalyticsCharts() {
    const charts = ['retentionChart', 'progressChart', 'completionChart'];
    
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
        case 'retentionChart':
            drawBarChart(ctx, [85, 88, 92, 89, 94, 91, 93], width, height);
            break;
        case 'progressChart':
            drawLineChart(ctx, [5, 7, 6, 8, 9, 7, 8.5], width, height);
            break;
        case 'completionChart':
            drawPieChart(ctx, [87, 13], width, height);
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
    const charts = ['retentionChart', 'progressChart', 'completionChart'];
    
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
        activeClients: 24,
        workoutsCreated: 156,
        clientRating: '4.8/5',
        monthlyRevenue: 3240
    };
    
    // Update stat values
    const statElements = document.querySelectorAll('.stat-value');
    statElements.forEach(element => {
        const statType = element.closest('.stat-card').querySelector('h3').textContent.toLowerCase();
        
        if (statType.includes('active clients')) {
            element.textContent = stats.activeClients;
        } else if (statType.includes('workouts created')) {
            element.textContent = stats.workoutsCreated;
        } else if (statType.includes('client rating')) {
            element.textContent = stats.clientRating;
        } else if (statType.includes('monthly revenue')) {
            element.textContent = '$' + stats.monthlyRevenue.toLocaleString();
        }
    });
}

// Initialize client status updates
function initializeClientStatus() {
    // Simulate real-time client status updates
    setInterval(() => {
        const clientCards = document.querySelectorAll('.client-card');
        clientCards.forEach(card => {
            const statusElement = card.querySelector('.client-status');
            if (statusElement && Math.random() > 0.8) {
                // Randomly toggle status
                if (statusElement.classList.contains('online')) {
                    statusElement.classList.remove('online');
                    statusElement.classList.add('offline');
                    statusElement.textContent = 'Offline';
                } else {
                    statusElement.classList.remove('offline');
                    statusElement.classList.add('online');
                    statusElement.textContent = 'Online';
                }
            }
        });
    }, 10000); // Update every 10 seconds
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
        case 'Add New Client':
            addNewClient();
            break;
        case 'Create Workout':
            createWorkout();
            break;
        case 'Nutrition Plan':
            createNutritionPlan();
            break;
        case 'Schedule Session':
            scheduleSession();
            break;
        default:
            console.log('Action:', action);
    }
}

// Add new client
function addNewClient() {
    alert('Opening client registration form... In a real app, this would open a form to add a new client.');
}

// Create workout
function createWorkout() {
    alert('Opening workout creator... In a real app, this would open the workout creation interface.');
}

// Create nutrition plan
function createNutritionPlan() {
    alert('Opening nutrition plan creator... In a real app, this would open the nutrition planning interface.');
}

// Schedule session
function scheduleSession() {
    alert('Opening scheduling interface... In a real app, this would open the calendar/scheduling system.');
}

// View client details
function viewClientDetails(clientName) {
    alert(`Viewing details for ${clientName}... In a real app, this would show the client's profile, progress, and workout history.`);
}

// View session details
function viewSessionDetails(sessionInfo) {
    alert(`Viewing session: ${sessionInfo}... In a real app, this would show detailed session information and allow for notes.`);
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
document.querySelectorAll('.stat-card, .client-card, .action-card, .analytics-card, .schedule-item').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});

// Add hover effects for interactive elements
document.querySelectorAll('.client-card, .action-card, .schedule-item').forEach(element => {
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