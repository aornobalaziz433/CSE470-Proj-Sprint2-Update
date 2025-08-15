// Training Programs JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Removed authentication check for public access
    // Load user data (optional, only if available)
    if (localStorage.getItem('herculesUser')) {
        loadUserData();
    }
    // Setup event listeners
    setupEventListeners();
});

// Load user data and update UI
function loadUserData() {
    const userData = JSON.parse(localStorage.getItem('herculesUser'));
    
    // Update user name displays
    const userNameElements = document.querySelectorAll('#userNameHeader');
    const displayName = userData.firstName || userData.email.split('@')[0];
    
    userNameElements.forEach(element => {
        element.textContent = displayName;
    });
    
    // Store user data globally for other functions
    window.currentUser = userData;
}

// Setup event listeners
function setupEventListeners() {
    // Goal selection buttons
    const goalButtons = document.querySelectorAll('.goal-card .btn');
    goalButtons.forEach(button => {
        button.addEventListener('click', function() {
            const goalCard = this.closest('.goal-card');
            const goal = goalCard.getAttribute('data-goal');
            selectGoal(goal);
        });
    });
}

// Handle goal selection
function selectGoal(goal) {
    // Hide goal selection section
    document.getElementById('goalSelection').style.display = 'none';
    
    // Show training programs section
    document.getElementById('trainingPrograms').style.display = 'block';
    
    // Update program title
    const programTitle = document.getElementById('programTitle');
    const goalNames = {
        'weight-loss': 'Weight Loss Training Programs',
        'weight-gain': 'Weight Gain Training Programs',
        'muscle-build': 'Muscle Building Training Programs'
    };
    programTitle.textContent = goalNames[goal] || 'Training Programs';
    
    // Load programs for selected goal
    loadTrainingPrograms(goal);
}

// Load training programs based on goal
function loadTrainingPrograms(goal) {
    const programsContainer = document.getElementById('programsContainer');
    const programs = getTrainingPrograms(goal);
    
    programsContainer.innerHTML = '';
    
    programs.forEach(program => {
        const programCard = createProgramCard(program);
        programsContainer.appendChild(programCard);
    });
}

// Get training programs data based on goal
function getTrainingPrograms(goal) {
    const programs = {
        'weight-loss': [
            {
                title: 'HIIT Training',
                frequency: '2-3×/week',
                description: 'High-Intensity Interval Training for maximum fat burning',
                details: [
                    { name: '30s all-out (sprints, burpees)', details: '30s rest; 8–12 rounds' },
                    { name: 'Circuit Training', details: '3–4 rounds of 5 moves' },
                    { name: 'Rowing Machine Intervals', details: '500m hard + 1min easy paddle; repeat 6–8×' },
                    { name: 'Spin/Cycling Sprints', details: '20s all-out + 40s easy; 15–20 rounds' },
                    { name: 'Bodyweight Metcon (AMRAP 20)', details: '10 burpees, 15 air squats, 20 walking lunges, 25 sit-ups' }
                ]
            },
            {
                title: 'Circuit Training',
                frequency: '2-3×/week',
                description: 'Full-body circuit workouts for fat loss and conditioning',
                details: [
                    { name: 'Kettlebell Swings', details: '15 reps' },
                    { name: 'Push-ups', details: '12 reps' },
                    { name: 'Goblet Squats', details: '15 reps' },
                    { name: 'Mountain Climbers', details: '30 seconds' },
                    { name: 'Plank', details: '45 seconds' }
                ]
            }
        ],
        'weight-gain': [
            {
                title: 'Full-Body Strength',
                frequency: '3×/week',
                description: 'Compound movements for maximum muscle growth',
                details: [
                    { name: 'Squat', details: '4×6–8 reps' },
                    { name: 'Bench Press', details: '4×6–8 reps' },
                    { name: 'Row', details: '3×8–10 reps' },
                    { name: 'Overhead Press', details: '3×8–10 reps' },
                    { name: 'Deadlift', details: '2×5 reps' }
                ]
            },
            {
                title: 'Push/Pull/Legs Split',
                frequency: '6 days/week',
                description: 'Specialized training split for balanced muscle development',
                details: [
                    { name: 'Push Day', details: 'Bench, OHP, dips' },
                    { name: 'Pull Day', details: 'Pull-ups, rows, curls' },
                    { name: 'Leg Day', details: 'Squats, lunges, leg press' },
                    { name: 'Progressive Overload', details: '+2.5–5% load or +1–2 reps per week' },
                    { name: 'Accessory Work', details: '3–4 exercises/session, 3–4×10–15 reps' }
                ]
            }
        ],
        'muscle-build': [
            {
                title: 'Upper/Lower Split',
                frequency: '4 days/week',
                description: 'Balanced upper and lower body training for muscle development',
                details: [
                    { name: 'Upper A/B & Lower A/B', details: 'Compound + accessory exercises' },
                    { name: '5×5 + Hypertrophy Finisher', details: 'Main lift 5×5 + isolation 3×10–12 reps' },
                    { name: 'German Volume Training (GVT)', details: '10×10 at 60% 1RM, 60s rest' },
                    { name: 'Time-Under-Tension (TUT)', details: 'Slow eccentrics (3–4s) + explosive concentric' },
                    { name: 'Periodized Mesocycles', details: '4 weeks strength → 4 weeks hypertrophy → 4 weeks power' }
                ]
            },
            {
                title: 'Hypertrophy Focus',
                frequency: '3-4×/week',
                description: 'Muscle-building focused training with optimal rep ranges',
                details: [
                    { name: 'Main Compound Lifts', details: '3–4×6–10 reps' },
                    { name: 'Isolation Exercises', details: '3–4×10–15 reps' },
                    { name: 'Rest-Pause Sets', details: 'Final set: rest 10s + extra reps' },
                    { name: 'Drop Sets', details: 'Drop 20% weight + continue to failure' },
                    { name: 'Time-Under-Tension', details: '3–4s eccentric, explosive concentric' }
                ]
            }
        ]
    };
    
    return programs[goal] || [];
}

// Create program card element
function createProgramCard(program) {
    const card = document.createElement('div');
    card.className = 'program-card';
    
    card.innerHTML = `
        <div class="program-header">
            <h3 class="program-title">${program.title}</h3>
            <span class="program-frequency">${program.frequency}</span>
        </div>
        <p class="program-description">${program.description}</p>
        <div class="program-details">
            <h4>Workout Details:</h4>
            <ul>
                ${program.details.map(detail => `
                    <li>
                        <span class="exercise-name">${detail.name}</span>
                        <span class="exercise-details">${detail.details}</span>
                    </li>
                `).join('')}
            </ul>
        </div>
        <div class="program-actions">
            <button class="btn btn-secondary" onclick="viewProgramDetails('${program.title}')">View Details</button>
            <button class="btn btn-primary" onclick="startProgram('${program.title}')">Start Program</button>
        </div>
    `;
    
    return card;
}

// Back to goals function
function backToGoals() {
    document.getElementById('goalSelection').style.display = 'block';
    document.getElementById('trainingPrograms').style.display = 'none';
}

// View program details
function viewProgramDetails(programTitle) {
    alert(`Detailed view for ${programTitle} program will be implemented here.`);
    // In a real application, this would open a detailed modal or navigate to a detailed page
}

// Start program
function startProgram(programTitle) {
    // Save selected program to user's profile
    const userData = JSON.parse(localStorage.getItem('herculesUser'));
    userData.currentProgram = programTitle;
    userData.programStartDate = new Date().toISOString();
    localStorage.setItem('herculesUser', JSON.stringify(userData));
    
    alert(`You've started the ${programTitle} program! Redirecting to your dashboard...`);
    
    // Redirect to dashboard
    setTimeout(() => {
        window.location.href = 'dashboard-client.html';
    }, 1500);
}

// Logout function
function logout() {
    localStorage.removeItem('herculesUser');
    window.location.href = 'login.html';
} 