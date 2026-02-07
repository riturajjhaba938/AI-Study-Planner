import React, { useState } from 'react';
import { Calendar, Brain, TrendingUp, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

// Mock schedule data for visualization if backend not connected
const MOCK_SCHEDULE = [
    {
        "date": "2026-02-10",
        "day": "Saturday",
        "hoursAvailable": 6,
        "hoursScheduled": 6,
        "items": [
            {
                "topicId": "t1",
                "topicName": "Trees",
                "subject": "Data Structures",
                "duration": 5.5,
                "focusLevel": "High Focus",
                "justification": "High Focus required: Weak area (2/5)."
            },
            {
                "topicId": "t3",
                "topicName": "Dynamic Programming",
                "subject": "Data Structures",
                "duration": 0.5,
                "focusLevel": "High Focus",
                "justification": "Weak area (1/5)."
            }
        ]
    },
    {
        "date": "2026-02-11",
        "day": "Sunday",
        "hoursAvailable": 6,
        "hoursScheduled": 5,
        "items": [
            {
                "topicId": "t3",
                "topicName": "Dynamic Programming",
                "subject": "Data Structures",
                "duration": 5,
                "focusLevel": "High Focus",
                "justification": "Weak area (1/5). Morning Slot."
            }
        ]
    },
    {
        "date": "2026-02-12",
        "day": "Monday",
        "hoursAvailable": 3,
        "hoursScheduled": 3,
        "items": [
            {
                "topicId": "t2",
                "topicName": "Graphs",
                "subject": "Data Structures",
                "duration": 3,
                "focusLevel": "Normal",
                "justification": "Prerequisite met: Trees."
            }
        ]
    }
];

const Dashboard = () => {
    // Main state to hold user and study plan data
    const [userData, setUserData] = useState({
        name: "Rituraj Jha", // Personalized default
        targetDate: "2026-03-15",
        subjects: [
            { name: "Data Structures", confidence: 2, cognitiveLoad: "High" },
            { name: "Operating Systems", confidence: 4, cognitiveLoad: "Medium" },
            { name: "DBMS", confidence: 3, cognitiveLoad: "Medium" }
        ]
    });

    const [schedule, setSchedule] = useState(null);
    const [loading, setLoading] = useState(false);

    // Simulate API call
    const generatePlan = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/generate-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData) // Send the state to the backend
            });
            const result = await response.json();

            // Ensure result.data.sprint exists before setting
            if (result.data && result.data.sprint) {
                setSchedule(result.data.sprint);
            } else {
                console.error("Invalid API response format", result);
            }

        } catch (error) {
            console.error("Link to server failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-900">
            {/* Header Section */}
            <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                        EduFlow AI <span className="text-sm bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">Beta</span>
                    </h1>
                    <p className="text-slate-500 mt-1">Welcome back, {userData.name}. Let's master your engineering load.</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
                    <div className="text-right">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Target Date</span>
                        <p className="text-lg font-bold text-indigo-600">{userData.targetDate}</p>
                    </div>
                    <Calendar className="text-indigo-400 w-8 h-8" />
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Input & Stats Column */}
                <section className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800">
                            <Brain className="text-indigo-500" /> Subject Cognitive Load
                        </h2>
                        <div className="space-y-4">
                            <p className="text-sm text-slate-500">Based on your 1-5 confidence rating.</p>
                            {userData.subjects.map((sub, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <span className="font-medium text-slate-700">{sub.name}</span>
                                    <div className="flex items-center gap-2">
                                        {/* Dynamic Badge Color */}
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${sub.confidence <= 2 ? 'bg-red-100 text-red-700' :
                                            sub.confidence === 3 ? 'bg-amber-100 text-amber-700' :
                                                'bg-emerald-100 text-emerald-700'
                                            }`}>
                                            {sub.confidence <= 2 ? 'High Load' : sub.confidence === 3 ? 'Medium' : 'Low Load'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-100">
                            <h3 className="font-semibold text-slate-700 mb-2">Weekly Availability</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-indigo-50 p-3 rounded-lg text-center">
                                    <span className="block text-2xl font-bold text-indigo-700">3h</span>
                                    <span className="text-xs text-indigo-500 uppercase">Weekdays</span>
                                </div>
                                <div className="bg-purple-50 p-3 rounded-lg text-center">
                                    <span className="block text-2xl font-bold text-purple-700">6h</span>
                                    <span className="text-xs text-purple-500 uppercase">Weekends</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Main Schedule Column */}
                <section className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 min-h-[600px] flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                                <TrendingUp className="text-emerald-500" /> Your Adaptive Sprint
                            </h2>
                            {!schedule && !loading && (
                                <button
                                    onClick={generatePlan}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold transition-all shadow-md flex items-center gap-2"
                                >
                                    <Brain size={18} />
                                    Generate AI Plan
                                </button>
                            )}
                        </div>

                        {/* Content Area */}
                        <div className="flex-1">
                            {loading ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 animate-pulse">
                                    <Brain size={64} className="mb-4 text-indigo-300" />
                                    <p className="text-lg font-medium">Analyzing cognitive load...</p>
                                    <p className="text-sm">Optimizing for weak areas</p>
                                </div>
                            ) : !schedule ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                                    <AlertCircle size={48} className="mb-4 opacity-30" />
                                    <p className="text-lg">No active sprint found.</p>
                                    <p className="text-sm">Click generate to start your personalized plan.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Timeline */}
                                    {schedule.map((day, dIdx) => (
                                        <div key={dIdx} className="relative pl-8 pb-6 border-l-2 border-indigo-100 last:border-0 last:pb-0">
                                            {/* Date Badge */}
                                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-500 border-4 border-white shadow-sm"></div>
                                            <div className="mb-3 flex items-baseline gap-3">
                                                <h3 className="font-bold text-lg text-slate-800">{day.day}</h3>
                                                <span className="text-sm text-slate-500">{day.date}</span>
                                                <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">{day.hoursScheduled}h scheduled</span>
                                            </div>

                                            {/* Task Cards */}
                                            <div className="grid gap-3">
                                                {day.items.map((item, iIdx) => (
                                                    <div key={iIdx} className={`p-4 rounded-xl border transition-all hover:shadow-md ${item.focusLevel === 'High Focus'
                                                        ? 'bg-amber-50 border-amber-200 hover:border-amber-300'
                                                        : 'bg-white border-slate-100 hover:border-indigo-200'
                                                        }`}>
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">{item.subject}</span>
                                                                <h4 className="font-bold text-slate-800 text-lg">{item.topicName}</h4>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="flex items-center gap-1 text-sm font-medium text-slate-600 bg-white px-2 py-1 rounded border border-slate-200">
                                                                    <Clock size={14} /> {item.duration}h
                                                                </span>
                                                                {item.focusLevel === 'High Focus' && (
                                                                    <span className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded">
                                                                        <AlertCircle size={12} /> High Focus
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-slate-600 flex items-start gap-2">
                                                            <CheckCircle2 size={16} className="text-indigo-400 mt-0.5 shrink-0" />
                                                            {item.justification}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Dashboard;
