// Meal Plans JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Removed authentication check for public access
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const selectedGoal = urlParams.get('goal');
    
    // Initialize the page
    if (selectedGoal && isValidGoal(selectedGoal)) {
        displayMealPlan(selectedGoal);
    } else {
        displayGoalSelection();
    }
});

// Authentication check
function checkAuthentication() {
    const userData = localStorage.getItem('herculesUser');
    if (!userData) {
        window.location.href = 'login.html';
        return;
    }
    
    try {
        const user = JSON.parse(userData);
        const loginTime = new Date(user.loginTime);
        const now = new Date();
        const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
        
        // Check if session is expired (24 hours)
        if (hoursDiff >= 24) {
            localStorage.removeItem('herculesUser');
            window.location.href = 'login.html';
            return;
        }
        
        // Check if user is a client
        if (user.userType !== 'client') {
            window.location.href = 'dashboard-' + user.userType + '.html';
            return;
        }
        
        // Update user name in header
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = user.firstName || 'Client';
        }
        
    } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('herculesUser');
        window.location.href = 'login.html';
    }
}

// Meal plan data
const mealPlans = {
    'weight-loss': {
        title: 'Weight-Loss Meal Plan',
        targets: '1,400–1,600 kcal • 40% carbs / 30% protein / 30% fat',
        meals: [
            {
                meal: 'Breakfast',
                food: 'Greek yogurt (150 g) with ½ cup mixed berries and 1 tbsp chia seeds',
                calories: 280,
                macros: '22 / 30 / 7'
            },
            {
                meal: 'Snack',
                food: '1 small apple + 10 almonds',
                calories: 150,
                macros: '3 / 20 / 7'
            },
            {
                meal: 'Lunch',
                food: 'Grilled chicken breast (120 g) over mixed greens, cherry tomatoes, cucumber, 1 tbsp olive oil',
                calories: 350,
                macros: '35 / 16 / 18'
            },
            {
                meal: 'Snack',
                food: 'Veggie sticks (carrot, bell pepper) + 2 tbsp hummus',
                calories: 120,
                macros: '3 / 15 / 5'
            },
            {
                meal: 'Dinner',
                food: 'Baked salmon (100 g) + ½ cup quinoa + steamed broccoli',
                calories: 400,
                macros: '28 / 40 / 12'
            }
        ],
        totals: {
            calories: 1300,
            macros: '91 / 121 / 49'
        },
        tips: [
            'Swap proteins: turkey, lean beef, tofu, shrimp',
            'Swap carbs: sweet potato, brown rice, whole-grain pasta, lentils',
            'Swap veggies: spinach, kale, zucchini, cauliflower',
            'Keep snacks simple: fruit + nuts, low-fat cheese, boiled egg'
        ]
    },
    'weight-gain': {
        title: 'Healthy Weight-Gain Meal Plan',
        targets: '2,700–3,000 kcal • 50% carbs / 25% protein / 25% fat',
        meals: [
            {
                meal: 'Breakfast',
                food: '2 eggs + 2 egg-white omelet with spinach, mushrooms, feta + 2 slices whole-grain toast with avocado spread',
                calories: 550,
                macros: '28 / 50 / 25'
            },
            {
                meal: 'Snack',
                food: 'Smoothie: 1 banana, 1 cup whole milk, 2 tbsp peanut butter, whey protein',
                calories: 500,
                macros: '30 / 55 / 18'
            },
            {
                meal: 'Lunch',
                food: 'Turkey sandwich: 120 g sliced turkey, whole-grain roll, cheese, avocado, lettuce + side of trail mix',
                calories: 700,
                macros: '40 / 70 / 28'
            },
            {
                meal: 'Snack',
                food: 'Cottage cheese (200 g) + pineapple chunks',
                calories: 250,
                macros: '20 / 30 / 5'
            },
            {
                meal: 'Dinner',
                food: 'Beef stir-fry: 150 g lean beef, 1 cup rice, mixed veggies, 1 tbsp sesame oil',
                calories: 600,
                macros: '35 / 65 / 20'
            }
        ],
        totals: {
            calories: 2600,
            macros: '153 / 270 / 96'
        },
        tips: [
            'Add a 3rd snack if you need more calories: granola bar, nuts & dried fruit, or protein shake',
            'Rotate proteins: chicken thighs, pork loin, tempeh',
            'Rotate carbs: oats, whole-wheat tortillas, couscous',
            'Include healthy fats: olive oil, nuts, seeds, full-fat dairy'
        ]
    },
    'muscle-build': {
        title: 'Muscle-Build Meal Plan',
        targets: '2,500–2,800 kcal • 40% carbs / 30% protein / 30% fat',
        meals: [
            {
                meal: 'Breakfast',
                food: 'Overnight oats (½ cup oats) with 1 scoop whey, 1 tbsp almond butter, ½ cup berries',
                calories: 450,
                macros: '32 / 50 / 12'
            },
            {
                meal: 'Snack',
                food: '1 boiled egg + 1 cup edamame',
                calories: 200,
                macros: '18 / 14 / 8'
            },
            {
                meal: 'Lunch',
                food: 'Grilled chicken wrap: 120 g chicken, whole-grain tortilla, spinach, salsa, 1 tbsp yogurt dip',
                calories: 550,
                macros: '40 / 45 / 18'
            },
            {
                meal: 'Pre-Workout Snack',
                food: 'Rice cakes (2) + 2 tbsp peanut butter',
                calories: 300,
                macros: '10 / 40 / 14'
            },
            {
                meal: 'Post-Workout',
                food: 'Protein shake (1 scoop whey + water)',
                calories: 120,
                macros: '24 / 3 / 1'
            },
            {
                meal: 'Dinner',
                food: 'Lean steak (150 g) + 1 cup sweet potato + asparagus',
                calories: 550,
                macros: '45 / 50 / 18'
            }
        ],
        totals: {
            calories: 2170,
            macros: '169 / 202 / 71'
        },
        tips: [
            'Aim for protein variety: fish, lean pork, eggs, legumes',
            'Carb sources: oats, rice, potatoes, fruits',
            'Add healthy fats at each meal: nuts, avocado, olive oil',
            'Time carbs around workouts for energy and recovery'
        ]
    }
};

// Validate goal parameter
function isValidGoal(goal) {
    return ['weight-loss', 'weight-gain', 'muscle-build'].includes(goal);
}

// Display goal selection page
function displayGoalSelection() {
    const content = document.getElementById('mealPlanContent');
    
    content.innerHTML = `
        <section class="goal-selection">
            <div class="section-header">
                <h2>Choose Your Goal</h2>
                <p>Select the meal plan that matches your fitness objectives</p>
            </div>
            
            <div class="goal-cards">
                <div class="goal-card" onclick="selectGoal('weight-loss')">
                    <div class="goal-icon">📉</div>
                    <h3>Weight Loss</h3>
                    <p>Calorie-controlled meals to help you lose weight safely and sustainably</p>
                    <div class="goal-details">
                        <span class="calorie-range">1,400-1,600 kcal</span>
                        <span class="macro-ratio">40% carbs / 30% protein / 30% fat</span>
                    </div>
                </div>
                
                <div class="goal-card" onclick="selectGoal('weight-gain')">
                    <div class="goal-icon">📈</div>
                    <h3>Weight Gain</h3>
                    <p>Higher calorie meals to help you gain healthy weight and build mass</p>
                    <div class="goal-details">
                        <span class="calorie-range">2,700-3,000 kcal</span>
                        <span class="macro-ratio">50% carbs / 25% protein / 25% fat</span>
                    </div>
                </div>
                
                <div class="goal-card" onclick="selectGoal('muscle-build')">
                    <div class="goal-icon">💪</div>
                    <h3>Muscle Build</h3>
                    <p>Protein-rich meals optimized for muscle growth and recovery</p>
                    <div class="goal-details">
                        <span class="calorie-range">2,500-2,800 kcal</span>
                        <span class="macro-ratio">40% carbs / 30% protein / 30% fat</span>
                    </div>
                </div>
            </div>
        </section>
    `;
}

// Select goal and navigate to meal plan
function selectGoal(goal) {
    if (isValidGoal(goal)) {
        window.location.href = 'meal-plans.html?goal=' + goal;
    }
}

// Display meal plan
function displayMealPlan(goal) {
    if (!mealPlans[goal]) {
        displayGoalSelection();
        return;
    }
    
    const plan = mealPlans[goal];
    const content = document.getElementById('mealPlanContent');
    
    content.innerHTML = `
        <section class="meal-plan-display">
            <div class="section-header">
                <div class="header-left">
                    <h2>${plan.title}</h2>
                    <p>${plan.targets}</p>
                </div>
                <button class="btn btn-secondary" onclick="window.location.href='meal-plans.html'">
                    ← Back to Goals
                </button>
            </div>
            
            <div class="meal-plan-content">
                <div class="meal-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Meal</th>
                                <th>Food</th>
                                <th>Est. cals</th>
                                <th>P / C / F (g)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${plan.meals.map(meal => `
                                <tr>
                                    <td class="meal-name">${meal.meal}</td>
                                    <td class="meal-food">${meal.food}</td>
                                    <td class="meal-calories">${meal.calories}</td>
                                    <td class="meal-macros">${meal.macros}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot>
                            <tr class="totals-row">
                                <td><strong>Totals</strong></td>
                                <td></td>
                                <td><strong>${plan.totals.calories}</strong></td>
                                <td><strong>${plan.totals.macros}</strong></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                
                <div class="meal-tips">
                    <h3>How to build a week:</h3>
                    <ul>
                        ${plan.tips.map(tip => `<li>${tip}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="meal-actions">
                    <button class="btn btn-primary" onclick="saveMealPlan('${goal}')">
                        Save This Plan
                    </button>
                    <button class="btn btn-secondary" onclick="printMealPlan()">
                        Print Plan
                    </button>
                </div>
            </div>
        </section>
    `;
}

// Save meal plan
function saveMealPlan(goal) {
    const userData = localStorage.getItem('herculesUser');
    if (userData) {
        const user = JSON.parse(userData);
        const savedPlans = JSON.parse(localStorage.getItem('savedMealPlans') || '{}');
        
        if (!savedPlans[user.email]) {
            savedPlans[user.email] = [];
        }
        
        // Check if plan is already saved
        const existingPlan = savedPlans[user.email].find(plan => plan.goal === goal);
        if (existingPlan) {
            alert('This meal plan is already saved!');
            return;
        }
        
        // Save the plan
        savedPlans[user.email].push({
            goal: goal,
            title: mealPlans[goal].title,
            savedAt: new Date().toISOString()
        });
        
        localStorage.setItem('savedMealPlans', JSON.stringify(savedPlans));
        alert('Meal plan saved successfully! You can view it in your dashboard.');
    } else {
        alert('Please log in to save meal plans.');
    }
}

// Print meal plan
function printMealPlan() {
    window.print();
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('herculesUser');
        window.location.href = 'login.html';
    }
}

// Add loading animation to goal cards
function addLoadingToGoalCards() {
    const goalCards = document.querySelectorAll('.goal-card');
    goalCards.forEach(card => {
        card.addEventListener('click', function() {
            this.classList.add('loading');
        });
    });
}

// Initialize loading animations when goal selection is displayed
document.addEventListener('DOMContentLoaded', function() {
    // Add loading animation after a short delay to ensure DOM is ready
    setTimeout(() => {
        addLoadingToGoalCards();
    }, 100);
}); 