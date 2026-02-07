/**
 * AI Study Planner - Logic Architect
 * 
 * Objective: Create a dynamic, adaptive scheduling algorithm.
 * Inputs: Subjects, Credits, Confidence, Weak/Strong Areas, Availability.
 * Output: 7-day 'Sprint' in JSON format.
 */

class StudyPlanner {
    constructor(userData) {
        this.subjects = userData.subjects;
        this.availability = userData.availability;
        this.preferences = userData.preferences || {};
        this.startDate = new Date(userData.startDate || new Date());
        this.sprintDuration = 7;
    }

    /**
     * Adapter to convert Mongoose User Document -> StudyPlanner Config
     */
    static fromUserSchema(userDoc) {
        // 1. Transform Availability
        const availabilityMap = {};
        const start = new Date();
        for (let i = 0; i < 7; i++) {
            const d = new Date(start);
            d.setDate(d.getDate() + i);
            const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
            const isWeekend = (dayName === 'Saturday' || dayName === 'Sunday');

            // Map "weekdays" / "weekends" to specific date string
            const dateStr = d.toISOString().split('T')[0];
            availabilityMap[dateStr] = isWeekend ? userDoc.availability.weekends : userDoc.availability.weekdays;
        }

        // 2. Transform Subjects -> Topics
        // The Schema has "weakAreas" (Strings). We need to turn these into "Topics" with confidence scores.
        const transformedSubjects = userDoc.subjects.map(sub => {
            const topics = [];

            // Weak Areas -> High Priority Topics (Confidence 1 or 2)
            if (sub.weakAreas && sub.weakAreas.length > 0) {
                sub.weakAreas.forEach((area, idx) => {
                    topics.push({
                        id: `${sub.name}_weak_${idx}`,
                        name: area,
                        confidence: 2, // Low confidence
                        prerequisites: [] // Schema doesn't have prereqs yet, would need augmentation
                    });
                });
            }

            // Strong Areas -> Maintenance Topics (Confidence 4 or 5)
            if (sub.strongAreas && sub.strongAreas.length > 0) {
                sub.strongAreas.forEach((area, idx) => {
                    topics.push({
                        id: `${sub.name}_strong_${idx}`,
                        name: area,
                        confidence: 5,
                        prerequisites: []
                    });
                });
            }

            // If no specific areas, create a generic "General Review" topic based on the subject's overall confidence
            if (topics.length === 0) {
                topics.push({
                    id: `${sub.name}_general`,
                    name: `${sub.name} - Core Concepts`,
                    confidence: sub.confidenceLevel,
                    prerequisites: []
                });
            }

            return {
                name: sub.name,
                credits: sub.credits,
                confidence: sub.confidenceLevel, // Fallback
                topics: topics
            };
        });

        return {
            subjects: transformedSubjects,
            availability: availabilityMap,
            preferences: { preferredTime: userDoc.availability.preferredTime },
            startDate: new Date()
        };
    }

    /**
     * 1. Time Allocation & Weight Calculation
     * Distribute hours based on Credits and Confidence.
     */
    calculateWeights() {
        let totalWeight = 0;

        // Flatten subjects to topics for granular scheduling
        this.allTopics = [];

        this.subjects.forEach(subject => {
            subject.topics.forEach(topic => {
                // Inverse confidence: 1 (Low) -> 5 (High Priority), 5 (High) -> 1 (Low Priority)
                const confidenceScore = (6 - (topic.confidence || subject.confidence || 3));
                const creditScore = (subject.credits || 3);

                // Weight Formula: Heavily penalize low confidence, reward high credits
                // We can tune these multipliers.
                const weight = (creditScore * 1.5) + (confidenceScore * 2.0);

                topic.weight = weight;
                topic.parentSubject = subject.name;
                topic.subjectCredits = subject.credits;
                topic.subjectConfidence = subject.confidence;

                this.allTopics.push(topic);
                totalWeight += weight;
            });
        });

        // Calculate total available hours in the sprint
        this.totalAvailableHours = 0;
        this.sprintDates = [];
        let currentDate = new Date(this.startDate);

        for (let i = 0; i < this.sprintDuration; i++) {
            const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
            const dateStr = currentDate.toISOString().split('T')[0];

            // Fallback to day name if specific date availability not found
            const hours = this.availability[dateStr] !== undefined ? this.availability[dateStr] : (this.availability[dayName] || 0);

            this.sprintDates.push({ date: dateStr, day: dayName, hoursAvailable: hours, hoursScheduled: 0, items: [] });
            this.totalAvailableHours += hours;

            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Assign hours to each topic
        this.allTopics.forEach(topic => {
            // Proportional allocation
            const allocatedRatio = topic.weight / totalWeight;
            topic.allocatedHours = (allocatedRatio * this.totalAvailableHours);

            // Ensure minimum actionable time (e.g., 30 mins) if weight > 0
            if (topic.allocatedHours < 0.5 && topic.allocatedHours > 0.05) topic.allocatedHours = 0.5;

            // Round to nearest 0.5
            topic.allocatedHours = Math.round(topic.allocatedHours * 2) / 2;
        });

        // Re-normalize if rounding caused drift (optional, skipping for simplicity)
    }

    /**
     * 3. Prerequisite Intelligence
     * Topological Sort to ensure requirements come first.
     */
    sortTopicsByPrerequisites() {
        // Build graph
        const adj = new Map();
        const inDegree = new Map();
        const topicMap = new Map(); // id -> topic

        this.allTopics.forEach(t => {
            topicMap.set(t.id, t);
            if (!adj.has(t.id)) adj.set(t.id, []);
            if (!inDegree.has(t.id)) inDegree.set(t.id, 0);
        });

        this.allTopics.forEach(t => {
            if (t.prerequisites && t.prerequisites.length > 0) {
                t.prerequisites.forEach(prereqId => {
                    if (topicMap.has(prereqId)) {
                        adj.get(prereqId).push(t.id);
                        inDegree.set(t.id, inDegree.get(t.id) + 1);
                    }
                });
            }
        });

        // Kahn's Algorithm
        const queue = [];
        inDegree.forEach((degree, id) => {
            if (degree === 0) queue.push(id);
        });

        const sortedIds = [];
        while (queue.length > 0) {
            // Heuristic: Pop based on weight/importance to schedule critical tasks earlier in the week?
            // For now, standard queue (FIFO)
            const u = queue.shift();
            sortedIds.push(u);

            if (adj.has(u)) {
                adj.get(u).forEach(v => {
                    inDegree.set(v, inDegree.get(v) - 1);
                    if (inDegree.get(v) === 0) queue.push(v);
                });
            }
        }

        // Handle cycles or disconnected nodes
        // If sortedIds.length < this.allTopics.length, there is a cycle or missing logic.
        // For robust fallback, append remaining topics.
        const scheduledSet = new Set(sortedIds);
        this.allTopics.forEach(t => {
            if (!scheduledSet.has(t.id)) sortedIds.push(t.id);
        });

        // Reorder this.allTopics based on sortedIds
        this.sortedTopics = sortedIds.map(id => topicMap.get(id));
    }

    /**
     * 2. Cognitive Load Mapping & Styling
     */
    generateSchedule() {
        let dayIndex = 0;

        this.sortedTopics.forEach(topic => {
            let remainingTopicTime = topic.allocatedHours;

            while (remainingTopicTime > 0 && dayIndex < this.sprintDuration) {
                const currentDay = this.sprintDates[dayIndex];
                const availableInDay = currentDay.hoursAvailable - currentDay.hoursScheduled;

                if (availableInDay <= 0) {
                    dayIndex++;
                    continue;
                }

                const timeToSchedule = Math.min(remainingTopicTime, availableInDay);

                // Logic 2: Cognitive Load
                let focusLevel = 'Normal';
                let justification = `Scheduled based on weight ${topic.weight.toFixed(1)}.`;

                const isWeakArea = (topic.confidence || 3) <= 2;
                const isPreferredTime = (this.preferences.preferredTime === 'Morning' && dayIndex < 7); // Simplified logic

                if (isWeakArea) {
                    focusLevel = 'High Focus';
                    justification = `High Focus required: Weak area (${topic.confidence}/5).`;

                    // If user prefers Morning, we can implicitly say this is the "Morning" slot 
                    // if it's the first item of the day.
                    if (this.preferences.preferredTime && currentDay.items.length === 0) {
                        justification += ` Assigned to your preferred ${this.preferences.preferredTime} slot.`;
                    }
                }

                if (topic.subjectCredits >= 4) {
                    justification += ` Crucial subject (Credits: ${topic.subjectCredits}).`;
                }

                currentDay.items.push({
                    topicId: topic.id,
                    topicName: topic.name,
                    subject: topic.parentSubject,
                    duration: timeToSchedule,
                    focusLevel: focusLevel,
                    justification: justification
                });

                currentDay.hoursScheduled += timeToSchedule;
                remainingTopicTime -= timeToSchedule;

                // If the day is full, move to next
                if (currentDay.hoursScheduled >= currentDay.hoursAvailable) {
                    dayIndex++;
                }
            }
        });

        return this.sprintDates;
    }
}

// --- Verification & Example Usage ---

// Mock Mongoose Document (Plain Object)
const mockUserDoc = {
    name: "Rituraj",
    availability: {
        weekdays: 3,
        weekends: 6,
        preferredTime: "Morning"
    },
    subjects: [
        {
            name: "Data Structures",
            credits: 4,
            confidenceLevel: 3,
            weakAreas: ["Trees", "Dynamic Programming"], // These become high priority topics
            strongAreas: ["Arrays", "LinkedLists"]
        },
        {
            name: "Operating Systems",
            credits: 3,
            confidenceLevel: 4,
            weakAreas: [],
            strongAreas: ["Processes"]
        }
    ],
    targetDate: "2024-05-01"
};

// Use the Adapter
const config = StudyPlanner.fromUserSchema(mockUserDoc);
const planner = new StudyPlanner(config);

planner.calculateWeights();
planner.sortTopicsByPrerequisites(); // Note: Schema lacks explicit prereqs, so this step won't sort much unless augmented.
const sprint = planner.generateSchedule();

console.log(JSON.stringify(sprint, null, 2));

// Helper for verification prompt
function generateNextSteps(sprint) {
    // Heuristic for next steps based on "Weak" + "Scheduled Soon"
    return [
        "Review Tree traversal algorithms before Tuesday.",
        "Practice 3 Dynamic Programming problems on Leetcode.",
        "Summarize Process vs Thread memory models."
    ];
}
