import React, { useState, useEffect } from 'react';
import { Brain, Plus, Send, Trash2, Clock, BookOpen, User, Calendar as CalendarIcon, X } from 'lucide-react';

const InputForm = ({ onGenerate, user, initialData }) => {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        college: '',
        branch: '',
        gradYear: '',
        targetDates: [{ label: 'Main Goal', date: '' }], // Changed from single targetDate
        availability: {
            weekdays: 3,
            weekends: 6,
            preferredTime: 'Night'
        },
        subjects: [{ name: '', credits: 3, confidenceLevel: 3, weakAreas: '', strongAreas: '' }]
    });

    // Load initial data (for Edit Mode) or saved form data
    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                targetDates: initialData.targetDates?.length > 0 ? initialData.targetDates : [{ label: 'Main Goal', date: initialData.targetDate || '' }],
                subjects: initialData.subjects || []
            });
        } else {
            const savedData = localStorage.getItem('studyPlannerFormData');
            if (savedData) {
                setFormData(JSON.parse(savedData));
            }
        }
    }, [initialData]);

    // Save form data only if NOT in edit mode (optional policy, but good for persistence)
    useEffect(() => {
        if (!initialData) {
            localStorage.setItem('studyPlannerFormData', JSON.stringify(formData));
        }
    }, [formData, initialData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Basic validation
            if (!formData.name || formData.targetDates.some(d => !d.date) || formData.subjects.some(s => !s.name)) {
                alert("Please fill in all required fields.");
                return;
            }

            // Transform comma-separated areas into arrays
            const payload = {
                ...formData,
                email: user?.email, // Attach email for backend mapping
                targetDate: formData.targetDates.sort((a, b) => new Date(a.date) - new Date(b.date))[0].date, // Set earliest as primary
                subjects: formData.subjects.map(sub => ({
                    ...sub,
                    weakAreas: typeof sub.weakAreas === 'string' ? sub.weakAreas.split(',').map(s => s.trim()).filter(Boolean) : sub.weakAreas,
                    strongAreas: typeof sub.strongAreas === 'string' ? sub.strongAreas.split(',').map(s => s.trim()).filter(Boolean) : sub.strongAreas
                }))
            };

            const response = await fetch('/api/generate-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();

            if (result.success && result.data) {
                // Pass back sprint AND the original form data (for context in Dashboard)
                onGenerate(result.data.sprint, payload);
            } else {
                console.error("API Error:", result);
                alert("Failed to generate plan. check console.");
            }

        } catch (err) {
            console.error("Submission failed:", err);
            alert("Connection failed. Is the backend running?");
        }
    };

    const addSubject = () => {
        setFormData({
            ...formData,
            subjects: [...formData.subjects, { name: '', credits: 3, confidenceLevel: 3, weakAreas: '', strongAreas: '' }]
        });
    };

    const removeSubject = (index) => {
        const newSubjects = [...formData.subjects];
        newSubjects.splice(index, 1);
        setFormData({ ...formData, subjects: newSubjects });
    };

    const updateSubject = (index, field, value) => {
        const newSubjects = [...formData.subjects];
        newSubjects[index][field] = value;
        setFormData({ ...formData, subjects: newSubjects });
    };

    const addTargetDate = () => {
        setFormData({
            ...formData,
            targetDates: [...formData.targetDates, { label: '', date: '' }]
        });
    };

    const removeTargetDate = (index) => {
        const newDates = [...formData.targetDates];
        newDates.splice(index, 1);
        setFormData({ ...formData, targetDates: newDates });
    };

    const updateTargetDate = (index, field, value) => {
        const newDates = [...formData.targetDates];
        newDates[index][field] = value;
        setFormData({ ...formData, targetDates: newDates });
    };

    const updateAvailability = (field, value) => {
        setFormData({
            ...formData,
            availability: { ...formData.availability, [field]: value }
        });
    };

    return (
        <div className="max-w-4xl mx-auto pt-4 p-6 font-sans text-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Brain className="text-indigo-600" /> {initialData ? 'Refine Your Study Plan' : 'AI Study Setup'}
            </h1>
            <p className="text-slate-500 mb-8">
                {initialData ? 'Update your goals or availability to regenerate your schedule.' : "Tell us about your goals, and we'll craft the perfect schedule."}
            </p>

            <form onSubmit={handleSubmit} className="space-y-8">

                {/* 1. Student Profile & Dates */}
                <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-slate-200/60">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-700">
                        <User size={20} className="text-indigo-500" /> Student Profile & Milestones
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                            <input
                                type="text" placeholder="e.g. Rituraj Jha"
                                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white/50"
                                value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">College</label>
                                <input
                                    type="text" placeholder="IIT Bombay"
                                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white/50"
                                    value={formData.college} onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Branch</label>
                                <input
                                    type="text" placeholder="CSE"
                                    className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:border-indigo-500 bg-white/50"
                                    value={formData.branch} onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4">
                        <div className="flex justify-between items-center mb-3">
                            <label className="text-sm font-bold text-slate-600">Target Milestones</label>
                            <button type="button" onClick={addTargetDate} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded hover:bg-indigo-100 font-medium">
                                + Add Date
                            </button>
                        </div>
                        <div className="space-y-3">
                            {formData.targetDates.map((item, idx) => (
                                <div key={idx} className="flex gap-3 items-center">
                                    <input
                                        type="text" placeholder="Label (e.g. Mid-Sem)"
                                        className="flex-1 p-2 border border-slate-300 rounded-lg text-sm bg-white/50"
                                        value={item.label} onChange={(e) => updateTargetDate(idx, 'label', e.target.value)}
                                    />
                                    <input
                                        type="date"
                                        className="w-40 p-2 border border-slate-300 rounded-lg text-sm bg-white/50"
                                        value={item.date} onChange={(e) => updateTargetDate(idx, 'date', e.target.value)}
                                        required
                                    />
                                    {formData.targetDates.length > 1 && (
                                        <button type="button" onClick={() => removeTargetDate(idx)} className="text-slate-400 hover:text-red-500">
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 2. Availability */}
                <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-slate-200/60">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-700">
                        <Clock size={20} className="text-indigo-500" /> Study Availability
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Weekday Hours (Daily)</label>
                            <input
                                type="number" min="0" max="24"
                                className="w-full p-2.5 border border-slate-300 rounded-lg bg-white/50"
                                value={formData.availability.weekdays}
                                onChange={(e) => updateAvailability('weekdays', parseInt(e.target.value))}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Weekend Hours (Daily)</label>
                            <input
                                type="number" min="0" max="24"
                                className="w-full p-2.5 border border-slate-300 rounded-lg bg-white/50"
                                value={formData.availability.weekends}
                                onChange={(e) => updateAvailability('weekends', parseInt(e.target.value))}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Preferred Time</label>
                            <select
                                className="w-full p-2.5 border border-slate-300 rounded-lg bg-white/50"
                                value={formData.availability.preferredTime}
                                onChange={(e) => updateAvailability('preferredTime', e.target.value)}
                            >
                                <option value="Morning">Morning (Fresh Mind)</option>
                                <option value="Afternoon">Afternoon</option>
                                <option value="Night">Night (Deep Focus)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* 3. Subjects */}
                <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-slate-200/60">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold flex items-center gap-2 text-slate-700">
                            <BookOpen size={20} className="text-indigo-500" /> Subjects
                        </h2>
                        <button type="button" onClick={addSubject} className="text-sm bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-medium hover:bg-indigo-100 flex items-center gap-1">
                            <Plus size={16} /> Add
                        </button>
                    </div>

                    <div className="space-y-6">
                        {formData.subjects.map((subject, index) => (
                            <div key={index} className="p-4 bg-slate-50/50 rounded-xl border border-slate-200/60 relative group hover:border-indigo-200 transition-colors">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-3">
                                    <div className="md:col-span-6">
                                        <input
                                            type="text" placeholder="Subject Name (e.g. DBMS)"
                                            className="w-full p-2 border border-slate-300 rounded-lg font-medium focus:border-indigo-500 outline-none bg-white"
                                            value={subject.name}
                                            onChange={(e) => updateSubject(index, 'name', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="md:col-span-3">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs font-bold text-slate-400">CREDITS (1-5)</span>
                                            <select
                                                className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                                                value={subject.credits}
                                                onChange={(e) => updateSubject(index, 'credits', parseInt(e.target.value))}
                                            >
                                                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="md:col-span-3">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs font-bold text-slate-400">CONFIDENCE: {subject.confidenceLevel}</span>
                                            <input
                                                type="range" min="1" max="5" step="1"
                                                className="w-full accent-indigo-600"
                                                value={subject.confidenceLevel}
                                                onChange={(e) => updateSubject(index, 'confidenceLevel', parseInt(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        type="text" placeholder="Weak Areas (comma separated)"
                                        className="w-full p-2 text-sm border border-red-100 bg-red-50/30 rounded-lg focus:border-red-300 outline-none placeholder:text-red-300/50"
                                        value={typeof subject.weakAreas === 'string' ? subject.weakAreas : subject.weakAreas.join(', ')}
                                        onChange={(e) => updateSubject(index, 'weakAreas', e.target.value)}
                                    />
                                    <input
                                        type="text" placeholder="Strong Areas (comma separated)"
                                        className="w-full p-2 text-sm border border-emerald-100 bg-emerald-50/30 rounded-lg focus:border-emerald-300 outline-none placeholder:text-emerald-300/50"
                                        value={typeof subject.strongAreas === 'string' ? subject.strongAreas : subject.strongAreas.join(', ')}
                                        onChange={(e) => updateSubject(index, 'strongAreas', e.target.value)}
                                    />
                                </div>

                                {formData.subjects.length > 1 && (
                                    <button type="button" onClick={() => removeSubject(index)} className="absolute -top-2 -right-2 bg-white text-slate-400 hover:text-red-500 p-1 rounded-full shadow-sm border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex gap-4">
                    {initialData && (
                        <button type="button" onClick={() => onGenerate(null, null)} className="flex-1 bg-slate-200 text-slate-700 py-4 rounded-xl font-bold text-lg hover:bg-slate-300 transition-all">
                            Cancel
                        </button>
                    )}
                    <button type="submit" className="flex-[2] bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg flex justify-center items-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 transform hover:-translate-y-0.5">
                        <Send size={20} /> {initialData ? 'Update Plan' : 'Generate My Adaptive Plan'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default InputForm;
