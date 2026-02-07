import React, { useState } from 'react';
import { Calendar, Brain, TrendingUp, AlertCircle, Clock, CheckCircle2, PlayCircle } from 'lucide-react';
import StudyTimer from './StudyTimer';
import InsightsPanel from './InsightsPanel';
import CompletionTimeline from './CompletionTimeline';

const Dashboard = ({ initialData, onEditPlan }) => {
    // Main state to hold user and study plan data
    const [userData, setUserData] = useState(initialData?.user || {
        name: "Rituraj Jha",
        targetDate: "2026-03-15",
        subjects: [],
        studyLog: []
    });

    // If schedule passed in props, use it.
    const [schedule, setSchedule] = useState(initialData?.schedule || null);
    const [loading, setLoading] = useState(false);

    // Timer State
    const [activeTopic, setActiveTopic] = useState(null); // { topic, duration }
    const [showTimer, setShowTimer] = useState(false);

    // Calculate Progress
    const calculateDailyProgress = () => {
        if (!userData.studyLog) return 0;

        // Get generic daily goal (e.g., 3 hrs weekday / 6 weekend)
        // Ideally we sum up specific scheduled items' duration for TODAY
        const todayStr = new Date().toISOString().split('T')[0];

        const todayLogs = userData.studyLog.filter(log => {
            // Handle both ISO string and Date object
            const logDate = new Date(log.date).toISOString().split('T')[0];
            return logDate === todayStr;
        });

        const totalMinutes = todayLogs.reduce((acc, log) => acc + log.durationMinutes, 0);
        return (totalMinutes / 60).toFixed(1); // Hours
    };

    const isTopicCompleted = (topicId) => {
        if (!userData.studyLog) return false;
        // Simple check: is there a log for this topicId?
        // Could be refined to check Date AND Topic
        return userData.studyLog.some(log => log.topicId === topicId);
    };

    const handleStartSession = (item) => {
        setActiveTopic(item);
        setShowTimer(true);
    };

    const handleFinishSession = async (sessionData) => {
        try {
            // Save to Backend
            const res = await fetch('http://localhost:5000/api/log-study', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: userData.id, // Ensure ID is present
                    ...sessionData
                })
            });

            if (res.ok) {
                const data = await res.json();
                // Update local state
                const updatedUser = {
                    ...userData,
                    studyLog: data.studyLog,
                    badges: data.badges // Update badges
                };
                setUserData(updatedUser);
                localStorage.setItem('userData', JSON.stringify(updatedUser)); // Persist locally too

                // Show Badge Alert
                if (data.newBadges && data.newBadges.length > 0) {
                    alert(`🎉 New Badge Unlocked: ${data.newBadges[0].name}!\n${data.newBadges[0].description}`);
                }
            }
        } catch (err) {
            console.error("Failed to log session:", err);
            // Fallback: Optimistic update
            const newLog = { ...sessionData, date: new Date() };
            const updatedUser = { ...userData, studyLog: [...(userData.studyLog || []), newLog] };
            setUserData(updatedUser);
        } finally {
            setShowTimer(false);
            setActiveTopic(null);
        }
    };

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

    const getDayLabel = (dateStr, fallbackDay) => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const toLocalYMD = (date) => {
            return date.getFullYear() + '-' +
                String(date.getMonth() + 1).padStart(2, '0') + '-' +
                String(date.getDate()).padStart(2, '0');
        };

        if (dateStr === toLocalYMD(today)) return "Today";
        if (dateStr === toLocalYMD(tomorrow)) return "Tomorrow";
        return fallbackDay;
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-900 relative">
            {showTimer && activeTopic && (
                <StudyTimer
                    topic={activeTopic}
                    durationHours={activeTopic.duration}
                    onFinish={handleFinishSession}
                    onClose={() => setShowTimer(false)}
                />
            )}

            {/* Header Section */}
            <header className="mb-8 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                        EduFlow AI <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">Pro</span>
                    </h1>
                    <p className="text-slate-500 mt-1">Welcome back, {userData.name}. Let's master your engineering load.</p>
                </div>
                <div className="flex flex-wrap gap-4 items-center">
                    <button
                        onClick={onEditPlan}
                        className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-3 rounded-xl font-medium shadow-sm transition-all flex items-center gap-2"
                    >
                        Edit Plan
                    </button>

                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
                        <div className="text-right">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Focus</span>
                            <p className="text-lg font-bold text-emerald-600">{calculateDailyProgress()} hrs Done</p>
                        </div>
                        <Clock className="text-emerald-400 w-8 h-8" />
                    </div>

                    {/* Display Multiple Target Dates if available */}
                    {userData.targetDates && userData.targetDates.length > 0 ? (
                        userData.targetDates.map((t, i) => (
                            <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3">
                                <div className="text-right">
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.label || 'Target'}</span>
                                    <p className="text-sm font-bold text-indigo-600">{new Date(t.date).toLocaleDateString()}</p>
                                </div>
                                <Calendar className="text-indigo-400 w-6 h-6" />
                            </div>
                        ))
                    ) : (
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
                            <div className="text-right">
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Target Date</span>
                                <p className="text-lg font-bold text-indigo-600">{new Date(userData.targetDate).toLocaleDateString()}</p>
                            </div>
                            <Calendar className="text-indigo-400 w-8 h-8" />
                        </div>
                    )}
                </div>
            </header>

            {/* Actionable Insights Panel */}
            {schedule && <InsightsPanel schedule={schedule} userData={userData} />}

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

                    {/* Completion Timeline */}
                    {schedule && <CompletionTimeline schedule={schedule} userData={userData} />}
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
                                                <h3 className="font-bold text-lg text-slate-800">{getDayLabel(day.date, day.day)}</h3>
                                                <span className="text-sm text-slate-500">{day.date}</span>
                                                <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">{day.hoursScheduled}h scheduled</span>
                                            </div>

                                            {/* Task Cards */}
                                            <div className="grid gap-3">
                                                {day.items.map((item, iIdx) => {
                                                    const isDone = isTopicCompleted(item.topicId);
                                                    return (
                                                        <div key={iIdx} className={`p-4 rounded-xl border transition-all hover:shadow-md ${item.focusLevel === 'High Focus'
                                                            ? 'bg-amber-50 border-amber-200 hover:border-amber-300'
                                                            : isDone ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-100 hover:border-indigo-200'
                                                            }`}>
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div>
                                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">{item.subject}</span>
                                                                    <h4 className={`font-bold text-lg ${isDone ? 'text-emerald-700 line-through decoration-2' : 'text-slate-800'}`}>{item.topicName}</h4>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="flex items-center gap-1 text-sm font-medium text-slate-600 bg-white px-2 py-1 rounded border border-slate-200">
                                                                        <Clock size={14} /> {item.duration}h
                                                                    </span>
                                                                    {isDone ? (
                                                                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded">
                                                                            <CheckCircle2 size={12} /> Done
                                                                        </span>
                                                                    ) : item.focusLevel === 'High Focus' && (
                                                                        <span className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded">
                                                                            <AlertCircle size={12} /> High Focus
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-end justify-between">
                                                                <p className="text-sm text-slate-600 flex items-start gap-2">
                                                                    <CheckCircle2 size={16} className="text-indigo-400 mt-0.5 shrink-0" />
                                                                    {item.justification}
                                                                </p>
                                                                {!isDone && (
                                                                    <button
                                                                        onClick={() => handleStartSession(item)}
                                                                        className="flex items-center gap-1.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                                                                    >
                                                                        <PlayCircle size={16} /> Start
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
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
