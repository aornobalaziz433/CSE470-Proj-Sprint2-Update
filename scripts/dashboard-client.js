// Client Dashboard JavaScript
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
    if (user.userType !== 'client') {
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
    // Initialize progress chart
    initializeProgressChart();
    
    // Load mock data for stats
    updateStats();
    
    // Setup navigation
    setupNavigation();
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
            
            // Update chart based on selected period
            const period = this.textContent.toLowerCase();
            updateProgressChart(period);
        });
    });
    
    // Workout start button
    const startWorkoutBtn = document.querySelector('.workout-section .btn-primary');
    if (startWorkoutBtn) {
        startWorkoutBtn.addEventListener('click', function() {
            startWorkout();
        });
    }
    
    // Meal plan buttons
    const mealPlanBtns = document.querySelectorAll('.nutrition-section .btn');
    mealPlanBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            viewMealPlan();
        });
    });
}

// Initialize progress chart
function initializeProgressChart() {
    const canvas = document.getElementById('progressChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Create a simple line chart
    const data = [165, 164, 163, 162, 161, 160, 159];
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    // Draw chart
    drawLineChart(ctx, data, labels);
}

// Draw a simple line chart
function drawLineChart(ctx, data, labels) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const padding = 20;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Calculate scales
    const minValue = Math.min(...data);
    const maxValue = Math.max(...data);
    const range = maxValue - minValue;
    
    const xScale = (width - 2 * padding) / (labels.length - 1);
    const yScale = (height - 2 * padding) / range;
    
    // Draw grid lines
    ctx.strokeStyle = '#e1e5e9';
    ctx.lineWidth = 1;
    
    // Vertical grid lines
    for (let i = 0; i < labels.length; i++) {
        const x = padding + i * xScale;
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, height - padding);
        ctx.stroke();
    }
    
    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
        const y = padding + (height - 2 * padding) * i / 4;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    }
    
    // Draw line
    ctx.strokeStyle = '#f5e9da';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    for (let i = 0; i < data.length; i++) {
        const x = padding + i * xScale;
        const y = height - padding - (data[i] - minValue) * yScale;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
    
    // Draw points
    ctx.fillStyle = '#f5e9da';
    for (let i = 0; i < data.length; i++) {
        const x = padding + i * xScale;
        const y = height - padding - (data[i] - minValue) * yScale;
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
    }
    
    // Draw labels
    ctx.fillStyle = '#666';
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';
    
    for (let i = 0; i < labels.length; i++) {
        const x = padding + i * xScale;
        const y = height - padding + 15;
        ctx.fillText(labels[i], x, y);
    }
}

// Update progress chart based on period
function updateProgressChart(period) {
    const canvas = document.getElementById('progressChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    let data, labels;
    
    switch(period) {
        case 'weight':
            data = [165, 164, 163, 162, 161, 160, 159];
            labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            break;
        case 'workouts':
            data = [45, 60, 30, 75, 45, 90, 60];
            labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            break;
        case 'calories':
            data = [1200, 1400, 1100, 1600, 1300, 1800, 1500];
            labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            break;
        default:
            data = [165, 164, 163, 162, 161, 160, 159];
            labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    }
    
    drawLineChart(ctx, data, labels);
}

// Update stats with mock data and calorie data
function updateStats() {
    // Get calorie data from Bengali calculator
    const calorieData = getCalorieData();
    
    // In a real app, this would fetch data from an API
    const stats = {
        caloriesBurned: 1247,
        workoutTime: '45 min',
        goalsCompleted: '3/5',
        currentWeight: '165 lbs',
        caloriesConsumed: calorieData.todayCalories || 0,
        calorieGoal: 2000 // Default daily calorie goal
    };
    
    // Update stat values
    const statElements = document.querySelectorAll('.stat-value');
    statElements.forEach(element => {
        const statType = element.closest('.stat-card').querySelector('h3').textContent.toLowerCase();
        
        if (statType.includes('calories')) {
            // Show calories consumed if available, otherwise show calories burned
            if (calorieData.todayCalories > 0) {
                element.textContent = calorieData.todayCalories.toLocaleString();
                // Update the label to show it's calories consumed
                const label = element.closest('.stat-card').querySelector('h3');
                if (label) {
                    label.textContent = 'Calories Consumed';
                }
            } else {
                element.textContent = stats.caloriesBurned.toLocaleString();
            }
        } else if (statType.includes('workout time')) {
            element.textContent = stats.workoutTime;
        } else if (statType.includes('goals')) {
            element.textContent = stats.goalsCompleted;
        } else if (statType.includes('weight')) {
            element.textContent = stats.currentWeight;
        }
    });
    
    // Update calorie change indicator
    updateCalorieChange(calorieData);
}

// Get calorie data from localStorage
function getCalorieData() {
    const userData = localStorage.getItem('herculesUser');
    if (!userData) return { todayCalories: 0, yesterdayCalories: 0 };
    
    const user = JSON.parse(userData);
    const calorieHistory = JSON.parse(localStorage.getItem('calorieHistory') || '{}');
    const userHistory = calorieHistory[user.email] || [];
    
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const todayEntry = userHistory.find(entry => entry.date === today);
    const yesterdayEntry = userHistory.find(entry => entry.date === yesterday);
    
    return {
        todayCalories: todayEntry ? todayEntry.totalCalories : 0,
        yesterdayCalories: yesterdayEntry ? yesterdayEntry.totalCalories : 0
    };
}

// Update calorie change indicator
function updateCalorieChange(calorieData) {
    const calorieCard = document.querySelector('.stat-card');
    if (!calorieCard) return;
    
    const changeElement = calorieCard.querySelector('.stat-change');
    if (!changeElement) return;
    
    if (calorieData.todayCalories > 0) {
        if (calorieData.yesterdayCalories > 0) {
            const change = calorieData.todayCalories - calorieData.yesterdayCalories;
            const changePercent = Math.round((change / calorieData.yesterdayCalories) * 100);
            
            if (change > 0) {
                changeElement.textContent = `+${changePercent}% from yesterday`;
                changeElement.className = 'stat-change positive';
            } else if (change < 0) {
                changeElement.textContent = `${changePercent}% from yesterday`;
                changeElement.className = 'stat-change negative';
            } else {
                changeElement.textContent = 'Same as yesterday';
                changeElement.className = 'stat-change';
            }
        } else {
            changeElement.textContent = 'First day tracking';
            changeElement.className = 'stat-change';
        }
    }
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

// Start workout function
function startWorkout() {
    // Show loading state
    const btn = document.querySelector('.workout-section .btn-primary');
    const originalText = btn.textContent;
    btn.textContent = 'Starting...';
    btn.disabled = true;
    
    // Simulate workout start
    setTimeout(() => {
        alert('Workout started! In a real app, this would open the workout interface.');
        btn.textContent = originalText;
        btn.disabled = false;
    }, 1000);
}

// View meal plan function
function viewMealPlan() {
    alert('Opening meal plan... In a real app, this would show detailed nutrition information.');
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

// Add some interactive features
document.addEventListener('click', function(e) {
    // Make stat cards clickable
    if (e.target.closest('.stat-card')) {
        const statCard = e.target.closest('.stat-card');
        const statType = statCard.querySelector('h3').textContent;
        console.log('Clicked on:', statType);
        // In a real app, this would show detailed stats
    }
    
    // Make AI cards clickable
    if (e.target.closest('.ai-card')) {
        const aiCard = e.target.closest('.ai-card');
        const aiTitle = aiCard.querySelector('h4').textContent;
        console.log('AI recommendation:', aiTitle);
        // In a real app, this would show more details
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
document.querySelectorAll('.stat-card, .workout-card, .meal-card, .ai-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
}); 