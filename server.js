const express = require('express');
const cors = require('cors');
const StudyPlanner = require('./studyPlanner'); // Assuming in same dir
// const User = require('./models/User'); // Mongoose model if needed later

const app = express();
app.use(cors());
app.use(express.json());

// API Route
app.post('/api/generate-plan', (req, res) => {
    try {
        console.log("Received Request:", req.body);

        // 1. Adapt Input Data
        // If the frontend sends data matching Mongoose schema, use adapter.
        // Or if it matches raw input, pass directly. 
        // We'll assume frontend sends the "User Schema" structure.
        const plannerConfig = StudyPlanner.fromUserSchema({
            subjects: req.body.subjects,
            availability: req.body.availability || { weekdays: 3, weekends: 6, preferredTime: 'Night' }, // Default
            startDate: new Date(),
            // Mock other fields if missing
            name: "User",
            targetDate: "2026-03-15"
        });

        // 2. Run Logic Engine
        const planner = new StudyPlanner(plannerConfig);
        planner.calculateWeights();
        planner.sortTopicsByPrerequisites();
        const schedule = planner.generateSchedule();
        const insights = planner.generateInsights();

        // 3. Return JSON
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

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Logic Engine Server running on port ${PORT}`);
});
