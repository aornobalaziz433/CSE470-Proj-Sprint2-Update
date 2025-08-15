// Bengali Calorie Calculator JavaScript

// Food database with calorie values
const foodDatabase = {
  // Rice & Breads
  'rice': { name: 'Plain Rice (1 cup)', calories: 205 },
  'roti': { name: 'Roti/Chapati (1 piece)', calories: 120 },
  'paratha': { name: 'Paratha (1 piece)', calories: 180 },
  'biryani': { name: 'Biryani Rice (1 cup)', calories: 350 },
  
  // Fish & Seafood
  'hilsa': { name: 'Hilsa Fish (100g)', calories: 280 },
  'rohu': { name: 'Rohu Fish (100g)', calories: 220 },
  'prawn': { name: 'Prawn Curry (100g)', calories: 180 },
  'crab': { name: 'Crab Curry (100g)', calories: 150 },
  
  // Meat Dishes
  'mutton': { name: 'Mutton Curry (100g)', calories: 320 },
  'chicken': { name: 'Chicken Curry (100g)', calories: 250 },
  'beef': { name: 'Beef Curry (100g)', calories: 280 },
  'kebab': { name: 'Kebab (1 piece)', calories: 150 },
  
  // Vegetables
  'aloo-posto': { name: 'Aloo Posto (100g)', calories: 180 },
  'begun-bhaja': { name: 'Begun Bhaja (100g)', calories: 120 },
  'lau-chingri': { name: 'Lau Chingri (100g)', calories: 140 },
  'chingri-malai': { name: 'Chingri Malai Curry (100g)', calories: 220 },
  
  // Sweets & Desserts
  'rasgulla': { name: 'Rasgulla (1 piece)', calories: 150 },
  'sandesh': { name: 'Sandesh (1 piece)', calories: 120 },
  'gulab-jamun': { name: 'Gulab Jamun (1 piece)', calories: 180 },
  'mishti-doi': { name: 'Mishti Doi (100g)', calories: 200 },
  
  // Snacks & Street Food
  'jhalmuri': { name: 'Jhalmuri (1 cup)', calories: 180 },
  'phuchka': { name: 'Phuchka (5 pieces)', calories: 120 },
  'singara': { name: 'Singara (1 piece)', calories: 150 },
  'samosa': { name: 'Samosa (1 piece)', calories: 200 }
};

// Global variables
let selectedFoods = {};
let totalCalories = 0;

// Initialize the calculator
document.addEventListener('DOMContentLoaded', function() {
  loadSavedData();
  updateCalories();
  updateSelectedFoodsDisplay();
});

// Increase quantity function
function increaseQuantity(foodId) {
  const input = document.getElementById(foodId);
  input.value = parseInt(input.value || 0) + 1;
  updateCalories();
}

// Decrease quantity function
function decreaseQuantity(foodId) {
  const input = document.getElementById(foodId);
  const currentValue = parseInt(input.value || 0);
  if (currentValue > 0) {
    input.value = currentValue - 1;
    updateCalories();
  }
}

// Update calories calculation
function updateCalories() {
  totalCalories = 0;
  selectedFoods = {};
  
  // Calculate total calories and build selected foods object
  Object.keys(foodDatabase).forEach(foodId => {
    const input = document.getElementById(foodId);
    const quantity = parseInt(input.value || 0);
    
    if (quantity > 0) {
      const food = foodDatabase[foodId];
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
  
  // Update display
  document.getElementById('totalCalories').textContent = totalCalories.toLocaleString();
  updateCalorieInfo();
  updateSelectedFoodsDisplay();
  saveData();
}

// Update calorie information
function updateCalorieInfo() {
  const calorieInfo = document.getElementById('calorieInfo');
  const foodCount = Object.keys(selectedFoods).length;
  
  if (totalCalories === 0) {
    calorieInfo.textContent = 'Start adding foods to see your total';
  } else if (totalCalories < 1200) {
    calorieInfo.textContent = `Low calorie intake (${foodCount} items selected) - Consider adding more nutritious foods`;
  } else if (totalCalories < 2000) {
    calorieInfo.textContent = `Moderate calorie intake (${foodCount} items selected) - Good balance for most adults`;
  } else if (totalCalories < 2500) {
    calorieInfo.textContent = `High calorie intake (${foodCount} items selected) - Suitable for active individuals`;
  } else {
    calorieInfo.textContent = `Very high calorie intake (${foodCount} items selected) - Consider portion control`;
  }
}

// Update selected foods display
function updateSelectedFoodsDisplay() {
  const selectedFoodsContainer = document.getElementById('selectedFoods');
  const selectedFoodsList = document.getElementById('selectedFoodsList');
  
  if (Object.keys(selectedFoods).length === 0) {
    selectedFoodsContainer.style.display = 'none';
    return;
  }
  
  selectedFoodsContainer.style.display = 'block';
  selectedFoodsList.innerHTML = '';
  
  Object.keys(selectedFoods).forEach(foodId => {
    const food = selectedFoods[foodId];
    const foodItem = document.createElement('div');
    foodItem.className = 'selected-item';
    foodItem.innerHTML = `
      <div>
        <div class="food-name">${food.name}</div>
        <div class="food-calories">${food.quantity} × ${food.calories} cal = ${food.totalCalories} cal</div>
      </div>
      <button class="remove-btn" onclick="removeFood('${foodId}')">Remove</button>
    `;
    selectedFoodsList.appendChild(foodItem);
  });
}

// Remove food function
function removeFood(foodId) {
  document.getElementById(foodId).value = 0;
  updateCalories();
}

// Clear all function
function clearAll() {
  Object.keys(foodDatabase).forEach(foodId => {
    document.getElementById(foodId).value = 0;
  });
  updateCalories();
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
    foods: selectedFoods,
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
  alert(`✅ Calorie data saved successfully!\n\nTotal Calories: ${totalCalories.toLocaleString()}\nFoods: ${Object.keys(selectedFoods).length} items\n\nYou can view your calorie history in the dashboard.`);
  
  // Redirect to dashboard
  window.location.href = 'dashboard-client.html';
}

// Save data to localStorage
function saveData() {
  const data = {
    selectedFoods: selectedFoods,
    totalCalories: totalCalories,
    timestamp: new Date().toISOString()
  };
  localStorage.setItem('bengaliCalorieCalculator', JSON.stringify(data));
}

// Load saved data
function loadSavedData() {
  const savedData = localStorage.getItem('bengaliCalorieCalculator');
  if (savedData) {
    try {
      const data = JSON.parse(savedData);
      const savedDate = new Date(data.timestamp);
      const currentDate = new Date();
      
      // Only load if it's from today
      if (savedDate.toDateString() === currentDate.toDateString()) {
        selectedFoods = data.selectedFoods || {};
        totalCalories = data.totalCalories || 0;
        
        // Restore input values
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

// Logout function
function logout() {
  localStorage.removeItem('herculesUser');
  window.location.href = 'index.html';
}

// Add keyboard shortcuts
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
});

// Add helpful tips
function showTips() {
  const tips = [
    "💡 Tip: Use Ctrl+S to quickly save your calorie data",
    "💡 Tip: Use Ctrl+Z to clear all selections",
    "💡 Tip: Click the +/- buttons or type directly in the input fields",
    "💡 Tip: Your data is automatically saved as you make changes",
    "💡 Tip: Check the selected foods section to review your choices"
  ];
  
  const randomTip = tips[Math.floor(Math.random() * tips.length)];
  console.log(randomTip);
}

// Show a tip on page load
setTimeout(showTips, 2000);
