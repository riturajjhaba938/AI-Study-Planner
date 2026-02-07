import React, { useState } from 'react';
import { Calendar, Brain, TrendingUp, AlertCircle, Clock, CheckCircle2, PlayCircle } from 'lucide-react';
import StudyTimer from './StudyTimer';

const Dashboard = ({ initialData }) => {
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
        <div className="min-h-screen font-sans text-slate-900 relative animate-in">
            {showTimer && activeTopic && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in">
                    <div className="w-full max-w-lg">
                        <StudyTimer
                            topic={activeTopic}
                            durationHours={activeTopic.duration}
                            onFinish={handleFinishSession}
                            onClose={() => setShowTimer(false)}
                        />
                    </div>
                </div>
            )}

            {/* Header Section */}
            <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold flex items-center gap-3">
                        <span className="text-gradient">EduFlow AI</span>
                        <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full border border-indigo-200">Beta</span>
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">Welcome back, <span className="font-semibold text-slate-700">{userData.name}</span>. Let's master your engineering load.</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="glass-card flex-1 md:flex-none p-5 rounded-2xl flex items-center gap-4">
                        <div className="text-right">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Focus</span>
                            <p className="text-2xl font-extrabold text-emerald-600 leading-none">{calculateDailyProgress()} <span className="text-sm font-medium text-emerald-400">hrs</span></p>
                        </div>
                        <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
                            <Clock className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="glass-card flex-1 md:flex-none p-5 rounded-2xl flex items-center gap-4">
                        <div className="text-right">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Date</span>
                            <p className="text-lg font-bold text-indigo-700">{new Date(userData.targetDate).toLocaleDateString()}</p>
                        </div>
                        <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
                            <Calendar className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Input & Stats Column */}
                <section className="lg:col-span-1 space-y-6">
                    <div className="glass-card p-6 rounded-3xl">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800">
                            <Brain className="text-indigo-500" /> Subject Cognitive Load
                        </h2>
                        <div className="space-y-4">
                            <p className="text-sm text-slate-500 mb-4">Based on your 1-5 confidence rating.</p>
                            {userData.subjects.map((sub, idx) => (
                                <div key={idx} className="group flex items-center justify-between p-4 bg-white/50 hover:bg-white rounded-2xl border border-slate-100 hover:border-indigo-100 transition-all shadow-sm hover:shadow-md">
                                    <span className="font-semibold text-slate-700">{sub.name}</span>
                                    <div className="flex items-center gap-2">
                                        {/* Dynamic Badge Color */}
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${sub.confidence <= 2 ? 'bg-red-100 text-red-700' :
                                            sub.confidence === 3 ? 'bg-amber-100 text-amber-700' :
                                                'bg-emerald-100 text-emerald-700'
                                            }`}>
                                            {sub.confidence <= 2 ? 'High Load' : sub.confidence === 3 ? 'Medium' : 'Low Load'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-200/50">
                            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Clock size={16} /> Weekly Availability</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-indigo-50/80 p-4 rounded-2xl text-center border border-indigo-100">
                                    <span className="block text-3xl font-extrabold text-indigo-700">{userData.availability?.weekdays || 3}h</span>
                                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Weekdays</span>
                                </div>
                                <div className="bg-purple-50/80 p-4 rounded-2xl text-center border border-purple-100">
                                    <span className="block text-3xl font-extrabold text-purple-700">{userData.availability?.weekends || 6}h</span>
                                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Weekends</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Main Schedule Column */}
                <section className="lg:col-span-2">
                    <div className="glass-card p-8 rounded-3xl min-h-[600px] flex flex-col relative overflow-hidden">
                        {/* Background Decor */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                        <div className="flex justify-between items-center mb-8 relative z-10">
                            <h2 className="text-2xl font-bold flex items-center gap-3 text-slate-800">
                                <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
                                    <TrendingUp size={24} />
                                </div>
                                Your Adaptive Sprint
                            </h2>
                            {!schedule && !loading && (
                                <button
                                    onClick={generatePlan}
                                    className="btn-primary flex items-center gap-2"
                                >
                                    <Brain size={18} />
                                    Generate AI Plan
                                </button>
                            )}
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 relative z-10">
                            {loading ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 animate-pulse py-20">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 animate-pulse"></div>
                                        <Brain size={80} className="mb-6 text-indigo-500 relative z-10 animate-bounce" />
                                    </div>
                                    <p className="text-xl font-bold text-slate-700">Analyzing cognitive load...</p>
                                    <p className="text-sm text-slate-500 mt-2">Optimizing for weak areas & exam dates</p>
                                </div>
                            ) : !schedule ? (
                                <div className="h-full flex flex-col items-center justify-center py-20 text-slate-400 bg-white/40 rounded-3xl border-2 border-dashed border-slate-200/60">
                                    <div className="p-6 bg-slate-50 rounded-full mb-4">
                                        <AlertCircle size={48} className="text-slate-300" />
                                    </div>
                                    <p className="text-lg font-semibold text-slate-600">No active sprint found.</p>
                                    <p className="text-sm">Click generate to start your personalized plan.</p>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {/* Timeline */}
                                    {schedule.map((day, dIdx) => (
                                        <div key={dIdx} className="relative pl-8 pb-8 border-l-2 border-indigo-100 last:border-0 last:pb-0">
                                            {/* Date Badge */}
                                            <div className="absolute -left-[11px] top-0 w-6 h-6 rounded-full bg-indigo-600 border-4 border-white shadow-md z-10"></div>

                                            <div className="mb-4 flex items-center gap-4">
                                                <h3 className="font-extrabold text-xl text-slate-800">{getDayLabel(day.date, day.day)}</h3>
                                                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-white/60 px-3 py-1 rounded-full border border-slate-200">
                                                    <Calendar size={12} />
                                                    {day.date}
                                                </div>
                                                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded uppercase tracking-wider">{day.hoursScheduled}h Load</span>
                                            </div>

                                            {/* Task Cards */}
                                            <div className="grid gap-4">
                                                {day.items.map((item, iIdx) => {
                                                    const isDone = isTopicCompleted(item.topicId);
                                                    return (
                                                        <div key={iIdx} className={`group p-5 rounded-2xl border transition-all duration-300 hover:shadow-lg ${item.focusLevel === 'High Focus'
                                                            ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/60 hover:border-amber-300'
                                                            : isDone ? 'bg-slate-50 border-slate-200 opacity-75' : 'bg-white border-slate-100 hover:border-indigo-200'
                                                            }`}>
                                                            <div className="flex justify-between items-start mb-3">
                                                                <div>
                                                                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold text-slate-500 bg-slate-100 uppercase tracking-wider mb-2">{item.subject}</span>
                                                                    <h4 className={`font-bold text-lg leading-tight ${isDone ? 'text-slate-500 line-through decoration-2 decoration-slate-300' : 'text-slate-800'}`}>{item.topicName}</h4>
                                                                </div>
                                                                <div className="flex flex-col items-end gap-2">
                                                                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                                                                        <Clock size={12} className="text-indigo-500" /> {item.duration}h
                                                                    </span>
                                                                    {isDone ? (
                                                                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">
                                                                            <CheckCircle2 size={10} /> DONE
                                                                        </span>
                                                                    ) : item.focusLevel === 'High Focus' && (
                                                                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                                                                            <AlertCircle size={10} /> FOCUS
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center justify-between mt-4 md:mt-2">
                                                                <p className="text-sm text-slate-500 flex items-start gap-2 italic">
                                                                    <span className="bg-indigo-100/50 p-1 rounded-full mt-0.5"><Clock size={10} className="text-indigo-600" /></span>
                                                                    {item.justification}
                                                                </p>

                                                                {!isDone && (
                                                                    <button
                                                                        onClick={() => handleStartSession(item)}
                                                                        className="opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300 flex items-center gap-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl shadow-lg shadow-indigo-200"
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
