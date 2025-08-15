<?php
session_start();

// Check if user is logged in
if (!isset($_SESSION['herculesUser'])) {
    header('Location: login.html');
    exit();
}

$userData = $_SESSION['herculesUser'];
$userType = $userData['userType'];

// Redirect if not a client
if ($userType !== 'client') {
    header('Location: dashboard-' . $userType . '.html');
    exit();
}

// Handle goal selection
$selectedGoal = isset($_GET['goal']) ? $_GET['goal'] : '';
$validGoals = ['weight-loss', 'weight-gain', 'muscle-build'];

if (!in_array($selectedGoal, $validGoals)) {
    $selectedGoal = '';
}

// Meal plan data
$mealPlans = [
    'weight-loss' => [
        'title' => 'Weight-Loss Meal Plan',
        'targets' => '1,400–1,600 kcal • 40% carbs / 30% protein / 30% fat',
        'meals' => [
            [
                'meal' => 'Breakfast',
                'food' => 'Greek yogurt (150 g) with ½ cup mixed berries and 1 tbsp chia seeds',
                'calories' => 280,
                'macros' => '22 / 30 / 7'
            ],
            [
                'meal' => 'Snack',
                'food' => '1 small apple + 10 almonds',
                'calories' => 150,
                'macros' => '3 / 20 / 7'
            ],
            [
                'meal' => 'Lunch',
                'food' => 'Grilled chicken breast (120 g) over mixed greens, cherry tomatoes, cucumber, 1 tbsp olive oil',
                'calories' => 350,
                'macros' => '35 / 16 / 18'
            ],
            [
                'meal' => 'Snack',
                'food' => 'Veggie sticks (carrot, bell pepper) + 2 tbsp hummus',
                'calories' => 120,
                'macros' => '3 / 15 / 5'
            ],
            [
                'meal' => 'Dinner',
                'food' => 'Baked salmon (100 g) + ½ cup quinoa + steamed broccoli',
                'calories' => 400,
                'macros' => '28 / 40 / 12'
            ]
        ],
        'totals' => [
            'calories' => 1300,
            'macros' => '91 / 121 / 49'
        ],
        'tips' => [
            'Swap proteins: turkey, lean beef, tofu, shrimp',
            'Swap carbs: sweet potato, brown rice, whole-grain pasta, lentils',
            'Swap veggies: spinach, kale, zucchini, cauliflower',
            'Keep snacks simple: fruit + nuts, low-fat cheese, boiled egg'
        ]
    ],
    'weight-gain' => [
        'title' => 'Healthy Weight-Gain Meal Plan',
        'targets' => '2,700–3,000 kcal • 50% carbs / 25% protein / 25% fat',
        'meals' => [
            [
                'meal' => 'Breakfast',
                'food' => '2 eggs + 2 egg-white omelet with spinach, mushrooms, feta + 2 slices whole-grain toast with avocado spread',
                'calories' => 550,
                'macros' => '28 / 50 / 25'
            ],
            [
                'meal' => 'Snack',
                'food' => 'Smoothie: 1 banana, 1 cup whole milk, 2 tbsp peanut butter, whey protein',
                'calories' => 500,
                'macros' => '30 / 55 / 18'
            ],
            [
                'meal' => 'Lunch',
                'food' => 'Turkey sandwich: 120 g sliced turkey, whole-grain roll, cheese, avocado, lettuce + side of trail mix',
                'calories' => 700,
                'macros' => '40 / 70 / 28'
            ],
            [
                'meal' => 'Snack',
                'food' => 'Cottage cheese (200 g) + pineapple chunks',
                'calories' => 250,
                'macros' => '20 / 30 / 5'
            ],
            [
                'meal' => 'Dinner',
                'food' => 'Beef stir-fry: 150 g lean beef, 1 cup rice, mixed veggies, 1 tbsp sesame oil',
                'calories' => 600,
                'macros' => '35 / 65 / 20'
            ]
        ],
        'totals' => [
            'calories' => 2600,
            'macros' => '153 / 270 / 96'
        ],
        'tips' => [
            'Add a 3rd snack if you need more calories: granola bar, nuts & dried fruit, or protein shake',
            'Rotate proteins: chicken thighs, pork loin, tempeh',
            'Rotate carbs: oats, whole-wheat tortillas, couscous',
            'Include healthy fats: olive oil, nuts, seeds, full-fat dairy'
        ]
    ],
    'muscle-build' => [
        'title' => 'Muscle-Build Meal Plan',
        'targets' => '2,500–2,800 kcal • 40% carbs / 30% protein / 30% fat',
        'meals' => [
            [
                'meal' => 'Breakfast',
                'food' => 'Overnight oats (½ cup oats) with 1 scoop whey, 1 tbsp almond butter, ½ cup berries',
                'calories' => 450,
                'macros' => '32 / 50 / 12'
            ],
            [
                'meal' => 'Snack',
                'food' => '1 boiled egg + 1 cup edamame',
                'calories' => 200,
                'macros' => '18 / 14 / 8'
            ],
            [
                'meal' => 'Lunch',
                'food' => 'Grilled chicken wrap: 120 g chicken, whole-grain tortilla, spinach, salsa, 1 tbsp yogurt dip',
                'calories' => 550,
                'macros' => '40 / 45 / 18'
            ],
            [
                'meal' => 'Pre-Workout Snack',
                'food' => 'Rice cakes (2) + 2 tbsp peanut butter',
                'calories' => 300,
                'macros' => '10 / 40 / 14'
            ],
            [
                'meal' => 'Post-Workout',
                'food' => 'Protein shake (1 scoop whey + water)',
                'calories' => 120,
                'macros' => '24 / 3 / 1'
            ],
            [
                'meal' => 'Dinner',
                'food' => 'Lean steak (150 g) + 1 cup sweet potato + asparagus',
                'calories' => 550,
                'macros' => '45 / 50 / 18'
            ]
        ],
        'totals' => [
            'calories' => 2170,
            'macros' => '169 / 202 / 71'
        ],
        'tips' => [
            'Aim for protein variety: fish, lean pork, eggs, legumes',
            'Carb sources: oats, rice, potatoes, fruits',
            'Add healthy fats at each meal: nuts, avocado, olive oil',
            'Time carbs around workouts for energy and recovery'
        ]
    ]
];
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meal Plans - Hercules Pro</title>
    <link rel="stylesheet" href="styles/main.css">
    <link rel="stylesheet" href="styles/dashboard.css">
    <link rel="stylesheet" href="styles/meal-plans.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Poppins:wght@700;900&display=swap" rel="stylesheet">
</head>
<body>
    <div class="dashboard-container">
        <!-- Sidebar -->
        <aside class="sidebar">
            <div class="sidebar-header">
                <a href="index.html" class="logo" aria-label="Hercules Pro Home">
                    <img src="assets/hercules-pro-logo.jpg.png" alt="Hercules Pro Logo" class="logo-img">
                    <span class="logo-text">Hercules Pro</span>
                </a>
            </div>
            
            <nav class="sidebar-nav">
                <ul>
                    <li class="nav-item">
                        <a href="dashboard-client.html" class="nav-link">
                            <span class="nav-icon">📊</span>
                            <span>Dashboard</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#workouts" class="nav-link">
                            <span class="nav-icon">💪</span>
                            <span>Workouts</span>
                        </a>
                    </li>
                    <li class="nav-item active">
                        <a href="meal-plans.php" class="nav-link">
                            <span class="nav-icon">🥗</span>
                            <span>Nutrition</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#progress" class="nav-link">
                            <span class="nav-icon">📈</span>
                            <span>Progress</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#ai-coach" class="nav-link">
                            <span class="nav-icon">🤖</span>
                            <span>AI Coach</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#profile" class="nav-link">
                            <span class="nav-icon">👤</span>
                            <span>Profile</span>
                        </a>
                    </li>
                </ul>
            </nav>
            
            <div class="sidebar-footer">
                <button class="btn btn-secondary logout-btn" onclick="logout()">
                    <span class="nav-icon">🚪</span>
                    <span>Logout</span>
                </button>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
            <!-- Header -->
            <header class="dashboard-header">
                <div class="header-left">
                    <h1>Smart Meal Plans 🥗</h1>
                    <p>Nutrition tailored to your lifestyle and goals for optimal results</p>
                </div>
                <div class="header-right">
                    <div class="user-info">
                        <span class="user-avatar">👤</span>
                        <div class="user-details">
                            <span class="user-name"><?php echo htmlspecialchars($userData['firstName'] ?? 'Client'); ?></span>
                            <span class="user-role">Client</span>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Meal Plan Content -->
            <div class="dashboard-content">
                <?php if (empty($selectedGoal)): ?>
                <!-- Goal Selection -->
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
                <?php else: ?>
                <!-- Meal Plan Display -->
                <section class="meal-plan-display">
                    <div class="section-header">
                        <div class="header-left">
                            <h2><?php echo htmlspecialchars($mealPlans[$selectedGoal]['title']); ?></h2>
                            <p><?php echo htmlspecialchars($mealPlans[$selectedGoal]['targets']); ?></p>
                        </div>
                        <button class="btn btn-secondary" onclick="window.location.href='meal-plans.php'">
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
                                    <?php foreach ($mealPlans[$selectedGoal]['meals'] as $meal): ?>
                                    <tr>
                                        <td class="meal-name"><?php echo htmlspecialchars($meal['meal']); ?></td>
                                        <td class="meal-food"><?php echo htmlspecialchars($meal['food']); ?></td>
                                        <td class="meal-calories"><?php echo $meal['calories']; ?></td>
                                        <td class="meal-macros"><?php echo $meal['macros']; ?></td>
                                    </tr>
                                    <?php endforeach; ?>
                                </tbody>
                                <tfoot>
                                    <tr class="totals-row">
                                        <td><strong>Totals</strong></td>
                                        <td></td>
                                        <td><strong><?php echo $mealPlans[$selectedGoal]['totals']['calories']; ?></strong></td>
                                        <td><strong><?php echo $mealPlans[$selectedGoal]['totals']['macros']; ?></strong></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        
                        <div class="meal-tips">
                            <h3>How to build a week:</h3>
                            <ul>
                                <?php foreach ($mealPlans[$selectedGoal]['tips'] as $tip): ?>
                                <li><?php echo htmlspecialchars($tip); ?></li>
                                <?php endforeach; ?>
                            </ul>
                        </div>
                        
                        <div class="meal-actions">
                            <button class="btn btn-primary" onclick="saveMealPlan('<?php echo $selectedGoal; ?>')">
                                Save This Plan
                            </button>
                            <button class="btn btn-secondary" onclick="printMealPlan()">
                                Print Plan
                            </button>
                        </div>
                    </div>
                </section>
                <?php endif; ?>
            </div>
        </main>
    </div>

    <script>
        function selectGoal(goal) {
            window.location.href = 'meal-plans.php?goal=' + goal;
        }
        
        function saveMealPlan(goal) {
            // In a real app, this would save to database
            alert('Meal plan saved! This will be available in your dashboard.');
        }
        
        function printMealPlan() {
            window.print();
        }
        
        function logout() {
            if (confirm('Are you sure you want to logout?')) {
                window.location.href = 'logout.php';
            }
        }
    </script>
</body>
</html> 