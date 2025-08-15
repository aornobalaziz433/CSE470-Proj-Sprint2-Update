// main.js
// Placeholder for future interactivity (e.g., nav toggles, sliders) 
document.addEventListener('DOMContentLoaded', function() {
  const accountArea = document.getElementById('account-area');
  if (!accountArea) return;
  const userData = localStorage.getItem('herculesUser');
  if (userData) {
    const user = JSON.parse(userData);
    let icon = '';
    let label = '';
    switch (user.userType) {
      case 'client':
        icon = '<span style="font-size:1.5rem;vertical-align:middle;">👤</span>';
        label = 'Client';
        break;
      case 'professional':
        icon = '<span style="font-size:1.5rem;vertical-align:middle;">🧑‍💼</span>';
        label = 'Professional';
        break;
      case 'admin':
        icon = '<span style="font-size:1.5rem;vertical-align:middle;">🛡️</span>';
        label = 'Admin';
        break;
      default:
        icon = '<span style="font-size:1.5rem;vertical-align:middle;">👤</span>';
        label = 'User';
    }
    accountArea.innerHTML = `<div class="account-info" style="display:flex;align-items:center;gap:0.5rem;padding:0.5rem 1.2rem;background:#f5e9da;border-radius:2rem;font-weight:700;">${icon}<span>${label}</span></div>`;
  } else {
    accountArea.innerHTML = `
      <div style="display:flex;gap:0.5rem;align-items:center;">
        <a href="login.html" class="btn btn-login">Login</a>
        <a href="register.html" class="btn btn-primary">Register</a>
      </div>
    `;
  }
  
  // Initialize workout tracker and community stats
  initializeWorkoutTracker();
  loadCommunityStats();
});

// Workout Goal Tracker Variables
let workoutGoals = {
  duration: 45,
  type: 'mixed',
  intensity: 'moderate'
};

let workoutProgress = {
  currentDuration: 0,
  caloriesBurned: 0,
  isActive: false,
  startTime: null
};

// Initialize Workout Tracker
function initializeWorkoutTracker() {
  // Load saved goals from localStorage
  const savedGoals = localStorage.getItem('workoutGoals');
  if (savedGoals) {
    workoutGoals = JSON.parse(savedGoals);
    updateGoalInputs();
  }
  
  // Load saved progress from localStorage
  const savedProgress = localStorage.getItem('workoutProgress');
  if (savedProgress) {
    workoutProgress = JSON.parse(savedProgress);
    updateProgressDisplay();
  }
  
  // Set up event listeners
  setupWorkoutEventListeners();
}

// Setup Workout Event Listeners
function setupWorkoutEventListeners() {
  const durationInput = document.getElementById('workoutDuration');
  const typeSelect = document.getElementById('workoutType');
  const intensitySelect = document.getElementById('intensityLevel');
  
  if (durationInput) {
    durationInput.addEventListener('change', function() {
      workoutGoals.duration = parseInt(this.value);
      saveWorkoutGoals();
      updateProgressDisplay();
    });
  }
  
  if (typeSelect) {
    typeSelect.addEventListener('change', function() {
      workoutGoals.type = this.value;
      saveWorkoutGoals();
    });
  }
  
  if (intensitySelect) {
    intensitySelect.addEventListener('change', function() {
      workoutGoals.intensity = this.value;
      saveWorkoutGoals();
    });
  }
}

// Set Workout Goals
function setWorkoutGoals() {
  const durationInput = document.getElementById('workoutDuration');
  const typeSelect = document.getElementById('workoutType');
  const intensitySelect = document.getElementById('intensityLevel');
  
  if (durationInput && typeSelect && intensitySelect) {
    workoutGoals.duration = parseInt(durationInput.value);
    workoutGoals.type = typeSelect.value;
    workoutGoals.intensity = intensitySelect.value;
    
    saveWorkoutGoals();
    updateProgressDisplay();
    
    // Show success message
    showNotification('Workout goals set successfully!', 'success');
  }
}

// Start Workout
function startWorkout() {
  if (workoutProgress.isActive) {
    showNotification('Workout already in progress!', 'info');
    return;
  }
  
  workoutProgress.isActive = true;
  workoutProgress.startTime = new Date();
  workoutProgress.currentDuration = 0;
  workoutProgress.caloriesBurned = 0;
  
  saveWorkoutProgress();
  updateProgressDisplay();
  
  // Start progress timer
  startProgressTimer();
  
  showNotification('Workout started! Keep going!', 'success');
}

// Complete Workout
function completeWorkout() {
  if (!workoutProgress.isActive) {
    showNotification('No workout in progress!', 'info');
    return;
  }
  
  // Calculate final progress
  const endTime = new Date();
  const duration = Math.floor((endTime - workoutProgress.startTime) / 1000 / 60); // minutes
  
  workoutProgress.currentDuration = Math.min(duration, workoutGoals.duration);
  workoutProgress.caloriesBurned = calculateCaloriesBurned(workoutProgress.currentDuration);
  workoutProgress.isActive = false;
  workoutProgress.startTime = null;
  
  saveWorkoutProgress();
  updateProgressDisplay();
  
  // Stop progress timer
  stopProgressTimer();
  
  // Show completion message
  const completionPercentage = Math.round((workoutProgress.currentDuration / workoutGoals.duration) * 100);
  showNotification(`Workout completed! Goal achieved: ${completionPercentage}%`, 'success');
  
  // Save workout history
  saveWorkoutHistory();
}

// Reset Progress
function resetProgress() {
  workoutProgress.currentDuration = 0;
  workoutProgress.caloriesBurned = 0;
  workoutProgress.isActive = false;
  workoutProgress.startTime = null;
  
  saveWorkoutProgress();
  updateProgressDisplay();
  
  stopProgressTimer();
  showNotification('Progress reset successfully!', 'info');
}

// Calculate Calories Burned
function calculateCaloriesBurned(durationMinutes) {
  const intensityMultipliers = {
    'low': 3,
    'moderate': 5,
    'high': 8
  };
  
  const typeMultipliers = {
    'cardio': 1.2,
    'strength': 1.0,
    'flexibility': 0.7,
    'mixed': 1.1
  };
  
  const baseCaloriesPerMinute = intensityMultipliers[workoutGoals.intensity] || 5;
  const typeMultiplier = typeMultipliers[workoutGoals.type] || 1.0;
  
  return Math.round(durationMinutes * baseCaloriesPerMinute * typeMultiplier);
}

// Progress Timer
let progressTimer = null;

function startProgressTimer() {
  if (progressTimer) return;
  
  progressTimer = setInterval(() => {
    if (workoutProgress.isActive && workoutProgress.startTime) {
      const currentTime = new Date();
      const elapsedMinutes = Math.floor((currentTime - workoutProgress.startTime) / 1000 / 60);
      
      workoutProgress.currentDuration = Math.min(elapsedMinutes, workoutGoals.duration);
      workoutProgress.caloriesBurned = calculateCaloriesBurned(workoutProgress.currentDuration);
      
      updateProgressDisplay();
      saveWorkoutProgress();
    }
  }, 10000); // Update every 10 seconds
}

function stopProgressTimer() {
  if (progressTimer) {
    clearInterval(progressTimer);
    progressTimer = null;
  }
}

// Update Goal Inputs
function updateGoalInputs() {
  const durationInput = document.getElementById('workoutDuration');
  const typeSelect = document.getElementById('workoutType');
  const intensitySelect = document.getElementById('intensityLevel');
  
  if (durationInput) durationInput.value = workoutGoals.duration;
  if (typeSelect) typeSelect.value = workoutGoals.type;
  if (intensitySelect) intensitySelect.value = workoutGoals.intensity;
}

// Update Progress Display
function updateProgressDisplay() {
  const currentDurationEl = document.getElementById('currentDuration');
  const targetDurationEl = document.getElementById('targetDuration');
  const caloriesBurnedEl = document.getElementById('caloriesBurned');
  const goalCompletionEl = document.getElementById('goalCompletion');
  
  const durationProgressEl = document.getElementById('durationProgress');
  const caloriesProgressEl = document.getElementById('caloriesProgress');
  const completionProgressEl = document.getElementById('completionProgress');
  
  if (currentDurationEl) currentDurationEl.textContent = workoutProgress.currentDuration;
  if (targetDurationEl) targetDurationEl.textContent = workoutGoals.duration;
  if (caloriesBurnedEl) caloriesBurnedEl.textContent = workoutProgress.caloriesBurned;
  
  const completionPercentage = Math.round((workoutProgress.currentDuration / workoutGoals.duration) * 100);
  if (goalCompletionEl) goalCompletionEl.textContent = completionPercentage;
  
  // Update progress bars
  if (durationProgressEl) {
    const durationPercentage = Math.min((workoutProgress.currentDuration / workoutGoals.duration) * 100, 100);
    durationProgressEl.style.width = durationPercentage + '%';
  }
  
  if (caloriesProgressEl) {
    const maxCalories = calculateCaloriesBurned(workoutGoals.duration);
    const caloriesPercentage = maxCalories > 0 ? Math.min((workoutProgress.caloriesBurned / maxCalories) * 100, 100) : 0;
    caloriesProgressEl.style.width = caloriesPercentage + '%';
  }
  
  if (completionProgressEl) {
    completionProgressEl.style.width = completionPercentage + '%';
  }
}

// Save Workout Goals
function saveWorkoutGoals() {
  localStorage.setItem('workoutGoals', JSON.stringify(workoutGoals));
}

// Save Workout Progress
function saveWorkoutProgress() {
  localStorage.setItem('workoutProgress', JSON.stringify(workoutProgress));
}

// Save Workout History
function saveWorkoutHistory() {
  const workoutHistory = JSON.parse(localStorage.getItem('workoutHistory') || '[]');
  const workoutRecord = {
    date: new Date().toISOString(),
    duration: workoutProgress.currentDuration,
    calories: workoutProgress.caloriesBurned,
    type: workoutGoals.type,
    intensity: workoutGoals.intensity,
    goalAchievement: Math.round((workoutProgress.currentDuration / workoutGoals.duration) * 100)
  };
  
  workoutHistory.unshift(workoutRecord);
  
  // Keep only last 30 workouts
  if (workoutHistory.length > 30) {
    workoutHistory.splice(30);
  }
  
  localStorage.setItem('workoutHistory', JSON.stringify(workoutHistory));
}

// Load Community Stats
function loadCommunityStats() {
  const totalPostsEl = document.getElementById('totalPosts');
  const totalLikesEl = document.getElementById('totalLikes');
  const totalViewsEl = document.getElementById('totalViews');
  
  if (!totalPostsEl || !totalLikesEl || !totalViewsEl) return;
  
  // Show 0 initially - no fake data
  totalPostsEl.textContent = '0';
  totalLikesEl.textContent = '0';
  totalViewsEl.textContent = '0';
}

// Show Notification
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-message">${message}</span>
      <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
    </div>
  `;
  
  // Add styles
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1000;
    max-width: 300px;
    animation: slideIn 0.3s ease;
  `;
  
  // Add animation styles
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  
  // Add to page
  document.body.appendChild(notification);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);
} 