const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    credits: { type: Number, required: true },
    confidenceLevel: { type: Number, min: 1, max: 5, required: true },
    strongAreas: [String],
    weakAreas: [String],
    cognitiveLoad: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' }
});

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    college: String,
    branch: String,
    graduationYear: Number,
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    profilePicture: { type: String }, // Base64 string
    streak: { type: Number, default: 0 },
    lastLogin: { type: Date, default: Date.now },
    studyLog: [{
        date: { type: Date, default: Date.now },
        topicId: String,
        topicName: String,
        durationMinutes: Number,
        notes: String,
        pauseCount: { type: Number, default: 0 },
        segments: [{
            timestamp: { type: Date, default: Date.now },
            durationMinutes: Number,
            achievement: String
        }]
    }],

    totalMinutesStudied: { type: Number, default: 0 },
    badges: [{
        id: String,
        name: String,
        icon: String, // e.g. 'award', 'zap', 'target'
        description: String,
        earnedAt: { type: Date, default: Date.now }
    }],

    availability: {
        weekdays: { type: Number, default: 3 },
        weekends: { type: Number, default: 6 },
        preferredTime: { type: String, default: 'Night' }
    },

    targetDate: { type: Date, required: true },
    subjects: [SubjectSchema],

    // This stores the AI-generated plan so we don't re-run the API constantly
    generatedPlan: { type: Object },
    lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
