# Hercules Pro - AI-Optimized Fitness Platform

## Overview
Hercules Pro is an AI-powered fitness platform that provides personalized training programs, meal plans, and progress tracking for users with different fitness goals.

## Features

### Training Programs
- **Goal-Based Selection**: Users can choose from three primary fitness goals:
  - Weight Loss
  - Weight Gain  
  - Muscle Building

- **Personalized Programs**: Each goal provides specific training programs with:
  - Detailed workout routines
  - Exercise specifications (sets, reps, duration)
  - Training frequency recommendations
  - Progressive overload guidelines

### User Types
- **Client**: Can access training programs, meal plans, and progress tracking
- **Professional**: Can manage clients and view analytics
- **Admin**: Full system administration capabilities

## Training Programs Details

### Weight Loss Programs
1. **HIIT Training** (2-3×/week)
   - 30s all-out intervals with 30s rest
   - Circuit training with 3-4 rounds
   - Rowing machine intervals
   - Spin/cycling sprints
   - Bodyweight Metcon workouts

2. **Circuit Training** (2-3×/week)
   - Kettlebell swings, push-ups, goblet squats
   - Mountain climbers and planks
   - High-intensity, full-body movements

### Weight Gain Programs
1. **Full-Body Strength** (3×/week)
   - Compound movements: Squat, Bench, Row, OHP, Deadlift
   - Progressive overload focus
   - Strength building emphasis

2. **Push/Pull/Legs Split** (6 days/week)
   - Specialized training days
   - Progressive overload tracking
   - Accessory work integration

### Muscle Building Programs
1. **Upper/Lower Split** (4 days/week)
   - Balanced upper and lower body training
   - German Volume Training (GVT)
   - Time-Under-Tension (TUT) techniques
   - Periodized mesocycles

2. **Hypertrophy Focus** (3-4×/week)
   - Optimal rep ranges for muscle growth
   - Rest-pause and drop sets
   - Isolation exercises

## How to Use

### For Clients
1. **Login** to your client account
2. **Navigate** to "Training Programs" from the sidebar
3. **Select** your primary fitness goal
4. **Choose** a specific training program
5. **Start** the program to track your progress

### Access Control
- Training programs are only available to **CLIENT** accounts
- Professional and Admin accounts cannot access this feature
- Authentication is required to view training programs

## Technical Implementation

### Files Created/Modified
- `training-programs.html` - Main training programs page
- `styles/training-programs.css` - Styling for training programs
- `scripts/training-programs.js` - JavaScript functionality
- `index.html` - Updated "Start Plan" button link
- `dashboard-client.html` - Updated navigation link

### Key Features
- **Authentication Check**: Ensures only client accounts can access
- **Goal Selection**: Interactive goal selection interface
- **Dynamic Content**: Programs load based on selected goal
- **Responsive Design**: Works on desktop and mobile devices
- **Session Management**: 24-hour session validation

## Getting Started

1. **Start the server**:
   ```bash
   python -m http.server 8000
   ```

2. **Open your browser** and navigate to `http://localhost:8000`

3. **Register/Login** as a client account

4. **Click** on "Training Programs" or "Start Plan" to access the feature

## Future Enhancements
- Detailed program progression tracking
- Exercise video demonstrations
- Integration with wearable devices
- AI-powered program adjustments based on progress
- Social features and community challenges 