-- Hercules Pro Database Schema
-- Run this file to set up your complete database structure

-- Users table (enhanced)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    user_type ENUM('client', 'professional', 'admin') DEFAULT 'client',
    is_active TINYINT DEFAULT 0,
    activation_code VARCHAR(10),
    profile_image VARCHAR(255),
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    height DECIMAL(5,2), -- in cm
    weight DECIMAL(5,2), -- in kg
    fitness_goal ENUM('weight_loss', 'weight_gain', 'muscle_building', 'maintenance'),
    activity_level ENUM('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Verification codes table
CREATE TABLE IF NOT EXISTS codes (
    email VARCHAR(255) PRIMARY KEY,
    code VARCHAR(10) NOT NULL,
    created_at BIGINT NOT NULL
);

-- Training programs table
CREATE TABLE IF NOT EXISTS training_programs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    goal_type ENUM('weight_loss', 'weight_gain', 'muscle_building') NOT NULL,
    difficulty_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
    duration_weeks INT DEFAULT 12,
    frequency_per_week INT DEFAULT 3,
    is_active TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workouts table
CREATE TABLE IF NOT EXISTS workouts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    program_id INT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    day_number INT, -- Which day in the program
    week_number INT, -- Which week in the program
    estimated_duration INT, -- in minutes
    FOREIGN KEY (program_id) REFERENCES training_programs(id) ON DELETE CASCADE
);

-- Exercises table
CREATE TABLE IF NOT EXISTS exercises (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category ENUM('strength', 'cardio', 'flexibility', 'balance') NOT NULL,
    muscle_groups JSON, -- Array of muscle groups
    equipment_needed JSON, -- Array of required equipment
    difficulty_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
    video_url VARCHAR(255),
    instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workout exercises (junction table)
CREATE TABLE IF NOT EXISTS workout_exercises (
    id INT AUTO_INCREMENT PRIMARY KEY,
    workout_id INT,
    exercise_id INT,
    sets INT DEFAULT 3,
    reps INT DEFAULT 10,
    duration_seconds INT, -- For timed exercises
    rest_seconds INT DEFAULT 60,
    order_index INT DEFAULT 0,
    FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
);

-- Meal plans table
CREATE TABLE IF NOT EXISTS meal_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    goal_type ENUM('weight_loss', 'weight_gain', 'muscle_building', 'maintenance') NOT NULL,
    daily_calories INT,
    protein_grams INT,
    carbs_grams INT,
    fat_grams INT,
    is_active TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Meals table
CREATE TABLE IF NOT EXISTS meals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    meal_plan_id INT,
    name VARCHAR(255) NOT NULL,
    meal_type ENUM('breakfast', 'lunch', 'dinner', 'snack') NOT NULL,
    day_number INT, -- Which day in the plan
    calories INT,
    protein_grams INT,
    carbs_grams INT,
    fat_grams INT,
    instructions TEXT,
    FOREIGN KEY (meal_plan_id) REFERENCES meal_plans(id) ON DELETE CASCADE
);

-- User progress tracking
CREATE TABLE IF NOT EXISTS user_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    date DATE NOT NULL,
    weight DECIMAL(5,2),
    body_fat_percentage DECIMAL(4,2),
    muscle_mass DECIMAL(5,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_date (user_id, date)
);

-- User program assignments
CREATE TABLE IF NOT EXISTS user_programs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    program_id INT,
    start_date DATE NOT NULL,
    end_date DATE,
    is_active TINYINT DEFAULT 1,
    current_week INT DEFAULT 1,
    current_day INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (program_id) REFERENCES training_programs(id) ON DELETE CASCADE
);

-- User meal plan assignments
CREATE TABLE IF NOT EXISTS user_meal_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    meal_plan_id INT,
    start_date DATE NOT NULL,
    end_date DATE,
    is_active TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (meal_plan_id) REFERENCES meal_plans(id) ON DELETE CASCADE
);

-- Workout logs
CREATE TABLE IF NOT EXISTS workout_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    workout_id INT,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    duration_minutes INT,
    notes TEXT,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE
);

-- Professional-client relationships
CREATE TABLE IF NOT EXISTS professional_clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    professional_id INT,
    client_id INT,
    start_date DATE NOT NULL,
    end_date DATE,
    is_active TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (professional_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_professional_client (professional_id, client_id)
);

-- Insert sample data for training programs
INSERT INTO training_programs (name, description, goal_type, difficulty_level, duration_weeks, frequency_per_week) VALUES
('HIIT Weight Loss Program', 'High-intensity interval training for maximum fat burn', 'weight_loss', 'intermediate', 8, 3),
('Circuit Training for Weight Loss', 'Full-body circuit workouts for weight loss', 'weight_loss', 'beginner', 6, 3),
('Full-Body Strength Program', 'Compound movements for building strength and muscle', 'weight_gain', 'intermediate', 12, 3),
('Push/Pull/Legs Split', 'Advanced bodybuilding split routine', 'muscle_building', 'advanced', 12, 6),
('Upper/Lower Split', 'Balanced muscle building program', 'muscle_building', 'intermediate', 12, 4),
('Hypertrophy Focus', 'Muscle growth optimized program', 'muscle_building', 'intermediate', 8, 4);

-- Insert sample exercises
INSERT INTO exercises (name, description, category, muscle_groups, equipment_needed, difficulty_level) VALUES
('Push-ups', 'Bodyweight chest exercise', 'strength', '["chest", "triceps", "shoulders"]', '["none"]', 'beginner'),
('Squats', 'Lower body compound movement', 'strength', '["quadriceps", "glutes", "hamstrings"]', '["none"]', 'beginner'),
('Deadlift', 'Full body compound movement', 'strength', '["back", "glutes", "hamstrings"]', '["barbell", "weights"]', 'intermediate'),
('Bench Press', 'Upper body compound movement', 'strength', '["chest", "triceps", "shoulders"]', '["barbell", "bench"]', 'intermediate'),
('Pull-ups', 'Upper body pulling movement', 'strength', '["back", "biceps"]', '["pull-up bar"]', 'intermediate'),
('Burpees', 'Full body conditioning exercise', 'cardio', '["full body"]', '["none"]', 'intermediate'),
('Mountain Climbers', 'Core and cardio exercise', 'cardio', '["core", "shoulders"]', '["none"]', 'beginner'),
('Plank', 'Core stability exercise', 'strength', '["core"]', '["none"]', 'beginner');

-- Insert sample meal plans
INSERT INTO meal_plans (name, description, goal_type, daily_calories, protein_grams, carbs_grams, fat_grams) VALUES
('Weight Loss Meal Plan', 'Calorie-controlled meals for weight loss', 'weight_loss', 1800, 150, 150, 60),
('Muscle Building Meal Plan', 'High protein meals for muscle growth', 'muscle_building', 2500, 200, 250, 80),
('Weight Gain Meal Plan', 'Calorie surplus meals for weight gain', 'weight_gain', 3000, 180, 350, 100);
