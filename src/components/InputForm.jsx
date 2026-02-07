import React, { useState, useEffect } from 'react';
import { Brain, Plus, Send, Trash2, Clock, BookOpen, User, Calendar as CalendarIcon } from 'lucide-react';

const InputForm = ({ onGenerate, user }) => {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        college: '',
        branch: '',
        gradYear: '',
        targetDate: '',
        availability: {
            weekdays: 3,
            weekends: 6,
            preferredTime: 'Night'
        },
        subjects: [{ name: '', credits: 3, confidenceLevel: 3, weakAreas: '', strongAreas: '' }]
    });

    // Load saved form data on mount
    useEffect(() => {
        const savedData = localStorage.getItem('studyPlannerFormData');
        if (savedData) {
            setFormData(JSON.parse(savedData));
        }
    }, []);

    // Save form data on change
    useEffect(() => {
        localStorage.setItem('studyPlannerFormData', JSON.stringify(formData));
    }, [formData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Basic validation
            if (!formData.name || !formData.targetDate || formData.subjects.some(s => !s.name)) {
                alert("Please fill in all required fields.");
                return;
            }

            // Transform comma-separated areas into arrays
            const payload = {
                ...formData,
                email: user?.email, // Attach email for backend mapping
                subjects: formData.subjects.map(sub => ({
                    ...sub,
                    weakAreas: sub.weakAreas ? sub.weakAreas.split(',').map(s => s.trim()).filter(Boolean) : [],
                    strongAreas: sub.strongAreas ? sub.strongAreas.split(',').map(s => s.trim()).filter(Boolean) : []
                }))
            };

            console.log("Submitting:", payload);
            const response = await fetch('http://localhost:5000/api/generate-plan', {
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

    const updateAvailability = (field, value) => {
        setFormData({
            ...formData,
            availability: { ...formData.availability, [field]: value }
        });
    };


    return (
        <div className="max-w-3xl mx-auto animate-in">
            <div className="text-center mb-6">
                <h1 className="text-3xl font-extrabold text-slate-800 mb-1 flex items-center justify-center gap-2">
                    <Brain className="text-indigo-600 w-8 h-8" />
                    <span className="text-gradient">AI Study Setup</span>
                </h1>
                <p className="text-slate-500 font-medium text-sm">Tell us about your goals, and we'll craft the perfect schedule.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

                {/* 1. Personal Details */}
                <div className="glass-card p-5 rounded-2xl">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
                        <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-600">
                            <User size={20} />
                        </div>
                        Student Profile
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Full Name</label>
                            <input
                                type="text" placeholder="e.g. Rituraj Jha"
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-sm"
                                value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Target Exam Date</label>
                            <input
                                type="date"
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-sm"
                                value={formData.targetDate} onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })} required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">College / University</label>
                            <input
                                type="text" placeholder="e.g. IIT Bombay"
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-sm"
                                value={formData.college} onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Branch</label>
                                <input
                                    type="text" placeholder="CSE"
                                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 text-sm"
                                    value={formData.branch} onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Grad Year</label>
                                <input
                                    type="number" placeholder="2026"
                                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 text-sm"
                                    value={formData.gradYear} onChange={(e) => setFormData({ ...formData, gradYear: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Availability */}
                <div className="glass-card p-5 rounded-2xl">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
                        <div className="p-1.5 bg-purple-100 rounded-lg text-purple-600">
                            <Clock size={20} />
                        </div>
                        Study Availability
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Weekday Hours</label>
                            <input
                                type="number" min="0" max="24"
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                value={formData.availability.weekdays}
                                onChange={(e) => updateAvailability('weekdays', parseInt(e.target.value))}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Weekend Hours</label>
                            <input
                                type="number" min="0" max="24"
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                value={formData.availability.weekends}
                                onChange={(e) => updateAvailability('weekends', parseInt(e.target.value))}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Preferred Time</label>
                            <select
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                value={formData.availability.preferredTime}
                                onChange={(e) => updateAvailability('preferredTime', e.target.value)}
                            >
                                <option value="Morning">Morning</option>
                                <option value="Afternoon">Afternoon</option>
                                <option value="Night">Night</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* 3. Subjects */}
                <div className="glass-card p-5 rounded-2xl">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                            <div className="p-1.5 bg-pink-100 rounded-lg text-pink-600">
                                <BookOpen size={20} />
                            </div>
                            Subjects
                        </h2>
                        <button type="button" onClick={addSubject} className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-100 flex items-center gap-1 transition-colors">
                            <Plus size={16} /> Add Subject
                        </button>
                    </div>

                    <div className="space-y-4">
                        {formData.subjects.map((subject, index) => (
                            <div key={index} className="p-4 bg-white/50 rounded-xl border border-slate-200 relative group hover:border-indigo-200 transition-all">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-3">
                                    <div className="md:col-span-6">
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Subject Name</label>
                                        <input
                                            type="text" placeholder="e.g. DBMS"
                                            className="w-full p-2 bg-white border border-slate-200 rounded-lg font-semibold text-slate-700 focus:border-indigo-500 outline-none text-sm"
                                            value={subject.name}
                                            onChange={(e) => updateSubject(index, 'name', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="md:col-span-3">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs font-bold text-slate-400 uppercase mb-1">Credits</span>
                                            <select
                                                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm"
                                                value={subject.credits}
                                                onChange={(e) => updateSubject(index, 'credits', parseInt(e.target.value))}
                                            >
                                                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="md:col-span-3">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs font-bold text-slate-400 uppercase mb-1">Conf: {subject.confidenceLevel}</span>
                                            <input
                                                type="range" min="1" max="5" step="1"
                                                className="w-full accent-indigo-600 mt-2 h-1.5"
                                                value={subject.confidenceLevel}
                                                onChange={(e) => updateSubject(index, 'confidenceLevel', parseInt(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-red-400 uppercase mb-1">Weak Areas</label>
                                        <input
                                            type="text" placeholder="Topic 1, Topic 2"
                                            className="w-full p-2 text-xs border border-red-100 bg-red-50/30 rounded-lg focus:border-red-300 outline-none placeholder:text-red-200/70"
                                            value={subject.weakAreas}
                                            onChange={(e) => updateSubject(index, 'weakAreas', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-emerald-400 uppercase mb-1">Strong Areas</label>
                                        <input
                                            type="text" placeholder="Topic A, Topic B"
                                            className="w-full p-2 text-xs border border-emerald-100 bg-emerald-50/30 rounded-lg focus:border-emerald-300 outline-none placeholder:text-emerald-200/70"
                                            value={subject.strongAreas}
                                            onChange={(e) => updateSubject(index, 'strongAreas', e.target.value)}
                                        />
                                    </div>
                                </div>

                                {formData.subjects.length > 1 && (
                                    <button type="button" onClick={() => removeSubject(index)} className="absolute -top-2 -right-2 bg-white text-slate-400 hover:text-red-500 p-1.5 rounded-full shadow-sm border border-slate-100 opacity-0 group-hover:opacity-100 transition-all">
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <button type="submit" className="w-full btn-primary py-3 text-lg flex justify-center items-center gap-2 shadow-lg hover:shadow-xl transition-all">
                    <Send size={20} /> Generate Plan
                </button>
            </form>
        </div>
    );
};

export default InputForm;
