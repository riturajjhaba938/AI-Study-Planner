const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const StudyPlanner = require('./studyPlanner');
const User = require('./models/User');

const app = express();
app.use(cors());
app.use(express.json());

// --- Database Connection ---
mongoose.connect('mongodb://localhost:27017/ai-study-planner', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// --- Auth Routes ---

// Signup
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user (with dummy targetDate to satisfy schema initially)
        user = new User({
            name,
            email,
            password: hashedPassword,
            targetDate: new Date() // Will be updated during plan generation
        });

        await user.save();

        res.status(201).json({ msg: 'User registered successfully', userId: user._id, name: user.name });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // --- Streak Logic ---
        const today = new Date();
        const lastLogin = new Date(user.lastLogin);
        const oneDay = 24 * 60 * 60 * 1000;

        // Strip time for accurate day comparison
        today.setHours(0, 0, 0, 0);
        lastLogin.setHours(0, 0, 0, 0);

        const diffDays = Math.round(Math.abs((today - lastLogin) / oneDay));

        if (diffDays === 1) {
            // Consecutive day login
            user.streak += 1;
        } else if (diffDays > 1) {
            // Missed a day (or more)
            user.streak = 1;
        }
        // If diffDays === 0, same day login, do nothing

        user.lastLogin = new Date();
        await user.save();

        // Return user info
        res.json({
            msg: 'Login Successful',
            user: {
                id: user._id,
                email: user.email,
                streak: user.streak,
                profilePicture: user.profilePicture,
                studyLog: user.studyLog, // Send logs to frontend
                badges: user.badges || [], // Send badges
                hasPlan: !!user.generatedPlan
            }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Helper: Check for new badges
const checkBadges = (user) => {
    const newBadges = [];
    const existingBadgeIds = new Set(user.badges.map(b => b.id));

    // Badge 1: First Step
    if (!existingBadgeIds.has('first_step') && user.studyLog.length >= 1) {
        newBadges.push({
            id: 'first_step',
            name: 'First Step',
            icon: 'Footprints',
            description: 'Completed your first study session.'
        });
    }

    // Badge 2: Focus Master (100 mins)
    if (!existingBadgeIds.has('focus_master') && user.totalMinutesStudied >= 100) {
        newBadges.push({
            id: 'focus_master',
            name: 'Focus Master',
            icon: 'Brain',
            description: 'Studied for over 100 minutes total.'
        });
    }

    // Badge 3: Streak Master (3 days)
    if (!existingBadgeIds.has('streak_master') && user.streak >= 3) {
        newBadges.push({
            id: 'streak_master',
            name: 'Streak Master',
            icon: 'Flame',
            description: 'Maintained a 3-day study streak.'
        });
    }

    // Add to user
    if (newBadges.length > 0) {
        user.badges.push(...newBadges);
    }

    return newBadges;
};

// Log Study Session Route
app.post('/api/log-study', async (req, res) => {
    try {
        const { userId, topicId, topicName, durationMinutes, notes, pauseCount, segments } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        user.studyLog.push({
            topicId,
            topicName,
            durationMinutes,
            notes,
            pauseCount: pauseCount || 0,
            segments: segments || [],
            date: new Date()
        });

        // Update Total Minutes
        user.totalMinutesStudied = (user.totalMinutesStudied || 0) + durationMinutes;

        // Check Badges
        const newBadges = checkBadges(user);

        await user.save();
        res.json({
            msg: 'Session logged',
            studyLog: user.studyLog,
            streak: user.streak,
            badges: user.badges,
            newBadges: newBadges
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// --- Study Plan Routes ---

app.post('/api/generate-plan', async (req, res) => {
    try {
        console.log("Received Request:", req.body);
        const { email } = req.body; // Expect email to link to user

        // 1. Adapt Input Data
        const plannerConfig = StudyPlanner.fromUserSchema({
            subjects: req.body.subjects,
            availability: req.body.availability || { weekdays: 3, weekends: 6, preferredTime: 'Night' },
            startDate: new Date(),
            name: req.body.name,
            targetDate: req.body.targetDate
        });

        // 2. Run Logic Engine
        const planner = new StudyPlanner(plannerConfig);
        planner.calculateWeights();
        planner.sortTopicsByPrerequisites();
        const schedule = planner.generateSchedule();

        const insights = [
            `Your confidence in ${planner.allTopics.filter(t => t.confidence <= 2)[0]?.name || 'weak areas'} is low. We've allocated extra High-Focus hours here.`,
            "Prerequisite gap identified: Foundations are scheduled before complex topics.",
            "Buffer time clearly marked for Sunday to prevent burnout."
        ];

        // 3. Save to Database (if user exists)
        if (email) {
            await User.findOneAndUpdate(
                { email },
                {
                    $set: {
                        generatedPlan: { sprint: schedule, insights },
                        subjects: req.body.subjects,
                        availability: req.body.availability,
                        targetDate: req.body.targetDate,
                        targetDates: req.body.targetDates || [],
                        college: req.body.college,
                        branch: req.body.branch,
                        graduationYear: req.body.gradYear
                    }
                }
            );
        }

        // 4. Return JSON
        res.status(200).json({
            success: true,
            message: "Plan generated via Logic Engine",
            data: {
                sprint: schedule,
                insights: insights
            }
        });

    } catch (error) {
        console.error("Logic Engine Error:", error);
        res.status(500).json({ error: "Failed to generate plan", details: error.message });
    }
});

// Update User Route
app.put('/api/user/update', async (req, res) => {
    try {
        const { userId, name, profilePicture } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        if (name) user.name = name;
        if (profilePicture) user.profilePicture = profilePicture;

        await user.save();
        res.json({
            msg: 'Profile updated', user: {
                id: user._id,
                name: user.name,
                email: user.email,
                streak: user.streak,
                profilePicture: user.profilePicture,
                badges: user.badges
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
