import React, { useState } from 'react';
import { Calendar, Brain, TrendingUp, AlertCircle, Clock, CheckCircle2, PlayCircle, Edit2, Save, X, Plus, Trash2 } from 'lucide-react';
import StudyTimer from './StudyTimer';

const Dashboard = ({ initialData, onGenerate, user }) => {
    // Main state to hold user and study plan data
    const [userData, setUserData] = useState(initialData?.user || {
        name: user?.name || "Student",
        targetDate: new Date().toISOString().split('T')[0],
        subjects: [],
        studyLog: []
    });

    const [isEditing, setIsEditing] = useState(false);
    const [newSubject, setNewSubject] = useState({ name: '', confidence: 3, credit: 3 });

    // If schedule passed in props, use it.
    const [schedule, setSchedule] = useState(initialData?.schedule || null);
    const [loading, setLoading] = useState(false);

    // Timer State
    const [activeTopic, setActiveTopic] = useState(null); // { topic, duration }
    const [showTimer, setShowTimer] = useState(false);

    // Calculate Progress
    const calculateDailyProgress = () => {
        if (!userData.studyLog) return 0;
        const todayStr = new Date().toISOString().split('T')[0];
        const todayLogs = userData.studyLog.filter(log => {
            const logDate = new Date(log.date).toISOString().split('T')[0];
            return logDate === todayStr;
        });
        const totalMinutes = todayLogs.reduce((acc, log) => acc + log.durationMinutes, 0);
        return (totalMinutes / 60).toFixed(1);
    };

    const isTopicCompleted = (topicId) => {
        if (!userData.studyLog) return false;
        return userData.studyLog.some(log => log.topicId === topicId);
    };

    const handleStartSession = (item) => {
        setActiveTopic(item);
        setShowTimer(true);
    };

    const handleFinishSession = async (sessionData) => {
        try {
            const res = await fetch('http://localhost:5000/api/log-study', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userData.id, ...sessionData })
            });

            if (res.ok) {
                const data = await res.json();
                const updatedUser = { ...userData, studyLog: data.studyLog, badges: data.badges };
                setUserData(updatedUser);
                localStorage.setItem('userData', JSON.stringify(updatedUser)); // Persist locally

                if (data.newBadges && data.newBadges.length > 0) {
                    alert(`🎉 New Badge Unlocked: ${data.newBadges[0].name}!\n${data.newBadges[0].description}`);
                }
            }
        } catch (err) {
            console.error("Failed to log session:", err);
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
            const payload = {
                ...userData,
                email: user?.email
            };

            const response = await fetch('http://localhost:5000/api/generate-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();

            if (result.data && result.data.sprint) {
                setSchedule(result.data.sprint);
                setIsEditing(false); // Exit edit mode
                if (onGenerate) {
                    onGenerate(result.data.sprint, payload); // Sync with App parent
                }
            } else {
                console.error("Invalid API response format", result);
                alert("Failed to regenerate plan. Check console.");
            }

        } catch (error) {
            console.error("Link to server failed:", error);
            alert("Connection error.");
        } finally {
            setLoading(false);
        }
    };

    // Edit Mode Handlers
    const handleAddSubject = () => {
        if (!newSubject.name) return;
        const subject = {
            name: newSubject.name,
            credits: newSubject.credit,
            confidenceLevel: newSubject.confidence,
            confidence: newSubject.confidence,
            weakAreas: [],
            strongAreas: []
        };
        setUserData({ ...userData, subjects: [...userData.subjects, subject] });
        setNewSubject({ name: '', confidence: 3, credit: 3 });
    };

    const handleRemoveSubject = (index) => {
        const newSubjects = [...userData.subjects];
        newSubjects.splice(index, 1);
        setUserData({ ...userData, subjects: newSubjects });
    };

    const handleDateChange = (e) => {
        setUserData({ ...userData, targetDate: e.target.value });
    };

    const getDayLabel = (dateStr, fallbackDay) => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const toLocalYMD = (date) => date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
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
            <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold flex items-center gap-2">
                        <span className="text-gradient">EduFlow AI</span>
                        <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">Beta</span>
                    </h1>
                    <p className="text-slate-500 mt-1 text-sm">Welcome back, <span className="font-semibold text-slate-700">{userData.name}</span>.</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    {/* Edit Toggle */}
                    <button
                        onClick={() => isEditing ? generatePlan() : setIsEditing(true)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all shadow-sm ${isEditing
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                            }`}
                    >
                        {isEditing ? <><Save size={16} /> Save & Recalculate</> : <><Edit2 size={16} /> Edit Plan</>}
                    </button>

                    <div className="glass-card hidden md:flex p-3 rounded-xl items-center gap-3">
                        <div className="text-right leading-tight">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Today</span>
                            <p className="text-lg font-extrabold text-emerald-600">{calculateDailyProgress()}h</p>
                        </div>
                        <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                            <Clock size={18} />
                        </div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Input & Stats Column */}
                <section className="lg:col-span-1 space-y-4">
                    <div className={`glass-card p-5 rounded-2xl ${isEditing ? 'ring-2 ring-indigo-400 ring-offset-2' : ''}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                                <Brain className="text-indigo-500 w-5 h-5" />
                                {isEditing ? "Modify Subjects" : "Cognitive Load"}
                            </h2>
                            {isEditing && (
                                <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-1 rounded font-bold uppercase">Editing Mode</span>
                            )}
                        </div>

                        {/* Target Date Edit */}
                        {isEditing && (
                            <div className="mb-4 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                                <label className="block text-xs font-bold text-indigo-600 uppercase mb-1">Target Exam Date</label>
                                <input
                                    type="date"
                                    value={userData.targetDate ? new Date(userData.targetDate).toISOString().split('T')[0] : ''}
                                    onChange={handleDateChange}
                                    className="w-full text-sm p-1 bg-white border border-indigo-200 rounded outline-none text-indigo-900 font-bold"
                                />
                            </div>
                        )}

                        <div className="space-y-3">
                            <p className="text-xs text-slate-500">
                                {isEditing ? "Add or remove subjects to adjust your plan." : "Based on your confidence rating."}
                            </p>

                            {userData.subjects.map((sub, idx) => (
                                <div key={idx} className="group flex items-center justify-between p-3 bg-white/50 hover:bg-white rounded-xl border border-slate-100 hover:border-indigo-100 transition-all shadow-sm">
                                    <span className="font-semibold text-sm text-slate-700 truncate max-w-[120px]" title={sub.name}>{sub.name}</span>

                                    {isEditing ? (
                                        <button onClick={() => handleRemoveSubject(idx)} className="text-slate-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    ) : (
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${(sub.confidenceLevel || sub.confidence) <= 2 ? 'bg-red-100 text-red-700' :
                                                (sub.confidenceLevel || sub.confidence) === 3 ? 'bg-amber-100 text-amber-700' :
                                                    'bg-emerald-100 text-emerald-700'
                                            }`}>
                                            {(sub.confidenceLevel || sub.confidence) <= 2 ? 'High' : (sub.confidenceLevel || sub.confidence) === 3 ? 'Mid' : 'Low'}
                                        </span>
                                    )}
                                </div>
                            ))}

                            {/* Add Subject Form */}
                            {isEditing && (
                                <div className="mt-4 pt-4 border-t border-indigo-100">
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            placeholder="New Subject"
                                            className="flex-1 text-sm p-2 rounded-lg border border-slate-200 outline-none focus:border-indigo-500"
                                            value={newSubject.name}
                                            onChange={e => setNewSubject({ ...newSubject, name: e.target.value })}
                                        />
                                        <input
                                            type="number" max="5" min="1"
                                            placeholder="Conf"
                                            className="w-16 text-sm p-2 rounded-lg border border-slate-200 outline-none focus:border-indigo-500"
                                            value={newSubject.confidence}
                                            onChange={e => setNewSubject({ ...newSubject, confidence: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <button
                                        onClick={handleAddSubject}
                                        className="w-full py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg dashed border border-indigo-200 flex items-center justify-center gap-1"
                                    >
                                        <Plus size={14} /> Add Subject
                                    </button>
                                </div>
                            )}
                        </div>

                        {!isEditing && (
                            <div className="mt-6 pt-4 border-t border-slate-200/50">
                                <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2 text-sm"><Clock size={14} /> Weekly Hours</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-indigo-50/80 p-3 rounded-xl text-center border border-indigo-100">
                                        <span className="block text-xl font-extrabold text-indigo-700">{userData.availability?.weekdays || 3}h</span>
                                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">W-Days</span>
                                    </div>
                                    <div className="bg-purple-50/80 p-3 rounded-xl text-center border border-purple-100">
                                        <span className="block text-xl font-extrabold text-purple-700">{userData.availability?.weekends || 6}h</span>
                                        <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">W-Ends</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Main Schedule Column */}
                <section className="lg:col-span-2">
                    <div className="glass-card p-6 rounded-3xl min-h-[500px] flex flex-col relative overflow-hidden">
                        {/* Background Decor */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                        <div className="flex justify-between items-center mb-6 relative z-10">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                                <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-600">
                                    <TrendingUp size={20} />
                                </div>
                                Your Sprint
                            </h2>
                            {!schedule && !loading && (
                                <button onClick={generatePlan} className="btn-primary flex items-center gap-2 text-sm px-4 py-2">
                                    <Brain size={16} /> Generate AI Plan
                                </button>
                            )}
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 relative z-10">
                            {loading ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 animate-pulse py-10">
                                    <Brain size={60} className="mb-4 text-indigo-500 animate-bounce" />
                                    <p className="text-lg font-bold text-slate-700">Recalculating Plan...</p>
                                </div>
                            ) : !schedule ? (
                                <div className="h-full flex flex-col items-center justify-center py-10 text-slate-400 bg-white/40 rounded-3xl border-2 border-dashed border-slate-200/60">
                                    <AlertCircle size={40} className="text-slate-300 mb-2" />
                                    <p className="text-base font-semibold text-slate-600">No active sprint.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Timeline */}
                                    {schedule.map((day, dIdx) => (
                                        <div key={dIdx} className="relative pl-6 pb-6 border-l-2 border-indigo-100 last:border-0 last:pb-0">
                                            {/* Date Badge */}
                                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-600 border-2 border-white shadow-md z-10"></div>

                                            <div className="mb-3 flex items-center gap-3">
                                                <h3 className="font-extrabold text-lg text-slate-800">{getDayLabel(day.date, day.day)}</h3>
                                                <div className="flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-white/60 px-2 py-0.5 rounded-full border border-slate-200">
                                                    <Calendar size={10} /> {day.date}
                                                </div>
                                                <span className="text-[9px] font-bold bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded uppercase tracking-wider">{day.hoursScheduled}h Load</span>
                                            </div>

                                            {/* Task Cards */}
                                            <div className="grid gap-3">
                                                {day.items.map((item, iIdx) => {
                                                    const isDone = isTopicCompleted(item.topicId);
                                                    return (
                                                        <div key={iIdx} className={`group p-4 rounded-xl border transition-all duration-300 hover:shadow-md ${item.focusLevel === 'High Focus'
                                                            ? 'bg-amber-50/80 border-amber-200/60'
                                                            : isDone ? 'bg-slate-50 border-slate-200 opacity-75' : 'bg-white border-slate-100 hover:border-indigo-200'
                                                            }`}>
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div>
                                                                    <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold text-slate-500 bg-slate-100 uppercase tracking-wider mb-1">{item.subject}</span>
                                                                    <h4 className={`font-bold text-base leading-tight ${isDone ? 'text-slate-500 line-through decoration-2 decoration-slate-300' : 'text-slate-800'}`}>{item.topicName}</h4>
                                                                </div>
                                                                <div className="flex flex-col items-end gap-1">
                                                                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-sm">
                                                                        <Clock size={10} className="text-indigo-500" /> {item.duration}h
                                                                    </span>
                                                                    {isDone && (
                                                                        <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                                                                            <CheckCircle2 size={9} /> DONE
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center justify-between mt-2">
                                                                <p className="text-xs text-slate-500 flex items-start gap-1 italic max-w-[70%]">
                                                                    <span className="bg-indigo-100/50 p-0.5 rounded-full mt-0.5"><Clock size={8} className="text-indigo-600" /></span>
                                                                    <span className="truncate">{item.justification}</span>
                                                                </p>

                                                                {!isDone && (
                                                                    <button
                                                                        onClick={() => handleStartSession(item)}
                                                                        className="opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 flex items-center gap-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg shadow-md"
                                                                    >
                                                                        <PlayCircle size={14} /> Start
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
