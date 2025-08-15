// Smart Calorie Tracker JavaScript

// Global variables
let totalCalories = 0;
let calorieGoal = 2000;
let mealLog = [];
let selectedFoods = {};

// Bengali food database
const bengaliFoods = {
  'rice': { name: 'Plain Rice (1 cup)', calories: 205 },
  'roti': { name: 'Roti/Chapati (1 piece)', calories: 120 },
  'paratha': { name: 'Paratha (1 piece)', calories: 180 },
  'hilsa': { name: 'Hilsa Fish (100g)', calories: 280 },
  'rohu': { name: 'Rohu Fish (100g)', calories: 220 },
  'mutton': { name: 'Mutton Curry (100g)', calories: 320 },
  'chicken': { name: 'Chicken Curry (100g)', calories: 250 }
};

// Initialize the tracker
document.addEventListener('DOMContentLoaded', function() {
  loadSavedData();
  updateDisplay();
  setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
  // Quick add form
  const quickAddForm = document.getElementById('quickAddForm');
  if (quickAddForm) {
    quickAddForm.addEventListener('submit', function(e) {
      e.preventDefault();
      addCustomFood();
    });
  }
}

// Show tab content
function showTab(tabName) {
  // Hide all tab contents
  const tabContents = document.querySelectorAll('.tab-content');
  tabContents.forEach(content => {
    content.classList.remove('active');
  });
  
  // Remove active class from all tab buttons
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Show selected tab content
  const selectedTab = document.getElementById(tabName);
  if (selectedTab) {
    selectedTab.classList.add('active');
  }
  
  // Add active class to clicked button
  const clickedButton = event.target;
  clickedButton.classList.add('active');
}

// Add custom food
function addCustomFood() {
  const foodName = document.getElementById('foodName').value.trim();
  const calories = parseInt(document.getElementById('calories').value);
  
  if (!foodName || isNaN(calories) || calories <= 0) {
    alert('Please enter valid food name and calories!');
    return;
  }
  
  // Add to meal log
  const mealItem = {
    id: Date.now(),
    name: foodName,
    calories: calories,
    type: 'custom',
    timestamp: new Date().toISOString()
  };
  
  mealLog.push(mealItem);
  totalCalories += calories;
  
  // Clear form
  document.getElementById('quickAddForm').reset();
  
  // Update display
  updateDisplay();
  updateMealLog();
  saveData();
  
  // Show success message
  showNotification(`Added ${foodName} (${calories} cal)`);
}

// Increase quantity for Bengali foods
function increaseQuantity(foodId) {
  const input = document.getElementById(foodId);
  input.value = parseInt(input.value || 0) + 1;
  updateCalories();
}

// Decrease quantity for Bengali foods
function decreaseQuantity(foodId) {
  const input = document.getElementById(foodId);
  const currentValue = parseInt(input.value || 0);
  if (currentValue > 0) {
    input.value = currentValue - 1;
    updateCalories();
  }
}

// Update calories from Bengali foods
function updateCalories() {
  totalCalories = 0;
  selectedFoods = {};
  
  // Calculate from Bengali foods
  Object.keys(bengaliFoods).forEach(foodId => {
    const input = document.getElementById(foodId);
    const quantity = parseInt(input.value || 0);
    
    if (quantity > 0) {
      const food = bengaliFoods[foodId];
      const foodCalories = food.calories * quantity;
      totalCalories += foodCalories;
      
      selectedFoods[foodId] = {
        name: food.name,
        quantity: quantity,
        calories: food.calories,
        totalCalories: foodCalories
      };
    }
  });
  
  // Add calories from meal log
  mealLog.forEach(item => {
    totalCalories += item.calories;
  });
  
  updateDisplay();
  saveData();
}

// Update display
function updateDisplay() {
  // Update summary values
  document.getElementById('totalCalories').textContent = totalCalories.toLocaleString();
  document.getElementById('calorieGoal').textContent = calorieGoal.toLocaleString();
  document.getElementById('remainingCalories').textContent = Math.max(0, calorieGoal - totalCalories).toLocaleString();
  document.getElementById('foodCount').textContent = mealLog.length + Object.keys(selectedFoods).length;
  
  // Update progress bar
  const progressPercent = Math.min(100, (totalCalories / calorieGoal) * 100);
  document.getElementById('progressFill').style.width = progressPercent + '%';
  document.getElementById('progressText').textContent = `${Math.round(progressPercent)}% of daily goal`;
  
  // Update progress bar color based on percentage
  const progressFill = document.getElementById('progressFill');
  if (progressPercent >= 100) {
    progressFill.style.background = 'linear-gradient(90deg, #dc3545, #c82333)';
  } else if (progressPercent >= 80) {
    progressFill.style.background = 'linear-gradient(90deg, #ffc107, #e0a800)';
  } else {
    progressFill.style.background = 'linear-gradient(90deg, #28a745, #20c997)';
  }
}

// Update meal log display
function updateMealLog() {
  const mealLogList = document.getElementById('mealLogList');
  if (!mealLogList) return;
  
  mealLogList.innerHTML = '';
  
  if (mealLog.length === 0 && Object.keys(selectedFoods).length === 0) {
    mealLogList.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No foods added today. Start tracking your calories!</p>';
    return;
  }
  
  // Add Bengali foods to meal log
  Object.keys(selectedFoods).forEach(foodId => {
    const food = selectedFoods[foodId];
    const mealItem = document.createElement('div');
    mealItem.className = 'meal-item';
    mealItem.innerHTML = `
      <div class="meal-info">
        <div class="meal-name">${food.name}</div>
        <div class="meal-details">Quantity: ${food.quantity} | Per serving: ${food.calories} cal</div>
      </div>
      <div class="meal-calories">${food.totalCalories} cal</div>
      <button class="delete-btn" onclick="removeBengaliFood('${foodId}')">×</button>
    `;
    mealLogList.appendChild(mealItem);
  });
  
  // Add custom foods to meal log
  mealLog.forEach(item => {
    const mealItem = document.createElement('div');
    mealItem.className = 'meal-item';
    mealItem.innerHTML = `
      <div class="meal-info">
        <div class="meal-name">${item.name}</div>
        <div class="meal-details">Custom food item</div>
      </div>
      <div class="meal-calories">${item.calories} cal</div>
      <button class="delete-btn" onclick="removeMealItem(${item.id})">×</button>
    `;
    mealLogList.appendChild(mealItem);
  });
}

// Remove Bengali food
function removeBengaliFood(foodId) {
  const input = document.getElementById(foodId);
  input.value = 0;
  updateCalories();
  updateMealLog();
}

// Remove meal item
function removeMealItem(itemId) {
  const itemIndex = mealLog.findIndex(item => item.id === itemId);
  if (itemIndex !== -1) {
    const removedItem = mealLog[itemIndex];
    totalCalories -= removedItem.calories;
    mealLog.splice(itemIndex, 1);
    updateDisplay();
    updateMealLog();
    saveData();
    showNotification(`Removed ${removedItem.name}`);
  }
}

// Clear all data
function clearAll() {
  if (confirm('Are you sure you want to clear all data for today?')) {
    // Clear Bengali food inputs
    Object.keys(bengaliFoods).forEach(foodId => {
      const input = document.getElementById(foodId);
      if (input) input.value = 0;
    });
    
    // Clear meal log
    mealLog = [];
    totalCalories = 0;
    selectedFoods = {};
    
    updateDisplay();
    updateMealLog();
    saveData();
    showNotification('All data cleared');
  }
}

// Save calories to dashboard
function saveCalories() {
  if (totalCalories === 0) {
    alert('Please add some foods before saving!');
    return;
  }
  
  // Get current user data
  const userData = localStorage.getItem('herculesUser');
  if (!userData) {
    alert('Please log in to save your calorie data!');
    return;
  }
  
  const user = JSON.parse(userData);
  
  // Create calorie entry
  const calorieEntry = {
    date: new Date().toISOString().split('T')[0],
    totalCalories: totalCalories,
    foods: { ...selectedFoods, customFoods: mealLog },
    timestamp: new Date().toISOString()
  };
  
  // Get existing calorie history
  let calorieHistory = JSON.parse(localStorage.getItem('calorieHistory') || '{}');
  if (!calorieHistory[user.email]) {
    calorieHistory[user.email] = [];
  }
  
  // Add new entry
  calorieHistory[user.email].push(calorieEntry);
  
  // Keep only last 30 days
  if (calorieHistory[user.email].length > 30) {
    calorieHistory[user.email] = calorieHistory[user.email].slice(-30);
  }
  
  // Save to localStorage
  localStorage.setItem('calorieHistory', JSON.stringify(calorieHistory));
  
  // Show success message
  showNotification(`✅ Calorie data saved successfully! Total: ${totalCalories.toLocaleString()} cal`);
  
  // Redirect to dashboard after a short delay
  setTimeout(() => {
    window.location.href = 'dashboard-client.html';
  }, 1500);
}

// Export data
function exportData() {
  const data = {
    date: new Date().toISOString().split('T')[0],
    totalCalories: totalCalories,
    calorieGoal: calorieGoal,
    foods: { ...selectedFoods, customFoods: mealLog },
    summary: {
      remainingCalories: Math.max(0, calorieGoal - totalCalories),
      foodCount: mealLog.length + Object.keys(selectedFoods).length,
      progressPercent: Math.min(100, (totalCalories / calorieGoal) * 100)
    }
  };
  
  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `calorie-data-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
  showNotification('Data exported successfully!');
}

// Save data to localStorage
function saveData() {
  const data = {
    totalCalories: totalCalories,
    calorieGoal: calorieGoal,
    mealLog: mealLog,
    selectedFoods: selectedFoods,
    timestamp: new Date().toISOString()
  };
  localStorage.setItem('calorieTracker', JSON.stringify(data));
}

// Load saved data
function loadSavedData() {
  const savedData = localStorage.getItem('calorieTracker');
  if (savedData) {
    try {
      const data = JSON.parse(savedData);
      const savedDate = new Date(data.timestamp);
      const currentDate = new Date();
      
      // Only load if it's from today
      if (savedDate.toDateString() === currentDate.toDateString()) {
        totalCalories = data.totalCalories || 0;
        calorieGoal = data.calorieGoal || 2000;
        mealLog = data.mealLog || [];
        selectedFoods = data.selectedFoods || {};
        
        // Restore Bengali food input values
        Object.keys(selectedFoods).forEach(foodId => {
          const input = document.getElementById(foodId);
          if (input && selectedFoods[foodId]) {
            input.value = selectedFoods[foodId].quantity;
          }
        });
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  }
}

// Show notification
function showNotification(message) {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #28a745;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;
  
  // Add to page
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Logout function
function logout() {
  localStorage.removeItem('herculesUser');
  window.location.href = 'index.html';
}

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
  // Ctrl/Cmd + S to save
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    event.preventDefault();
    saveCalories();
  }
  
  // Ctrl/Cmd + Z to clear
  if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
    event.preventDefault();
    clearAll();
  }
  
  // Ctrl/Cmd + E to export
  if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
    event.preventDefault();
    exportData();
  }
});

// Initialize display
updateDisplay();
updateMealLog();
