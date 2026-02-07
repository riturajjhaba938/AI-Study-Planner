import React, { useState } from 'react';
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
        <div className="max-w-4xl mx-auto pt-8 p-6 font-sans text-slate-800">
            <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Brain className="text-indigo-600" /> AI Study Setup
            </h1>
            <p className="text-slate-500 mb-8">Tell us about your goals, and we'll craft the perfect schedule.</p>

            <form onSubmit={handleSubmit} className="space-y-8">

                {/* 1. Personal Details */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-700">
                        <User size={20} className="text-indigo-500" /> Student Profile
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                            <input
                                type="text" placeholder="e.g. Rituraj Jha"
                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Target Exam Date</label>
                            <input
                                type="date"
                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={formData.targetDate} onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })} required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">College / University</label>
                            <input
                                type="text" placeholder="e.g. IIT Bombay"
                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={formData.college} onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Branch</label>
                                <input
                                    type="text" placeholder="CSE"
                                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500"
                                    value={formData.branch} onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Grad Year</label>
                                <input
                                    type="number" placeholder="2026"
                                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500"
                                    value={formData.gradYear} onChange={(e) => setFormData({ ...formData, gradYear: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Availability */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-700">
                        <Clock size={20} className="text-indigo-500" /> Study Availability
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Weekday Hours (Daily)</label>
                            <input
                                type="number" min="0" max="24"
                                className="w-full p-2 border border-slate-300 rounded-lg"
                                value={formData.availability.weekdays}
                                onChange={(e) => updateAvailability('weekdays', parseInt(e.target.value))}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Weekend Hours (Daily)</label>
                            <input
                                type="number" min="0" max="24"
                                className="w-full p-2 border border-slate-300 rounded-lg"
                                value={formData.availability.weekends}
                                onChange={(e) => updateAvailability('weekends', parseInt(e.target.value))}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Preferred Time</label>
                            <select
                                className="w-full p-2 border border-slate-300 rounded-lg bg-white"
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
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
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
                            <div key={index} className="p-4 bg-slate-50 rounded-xl border border-slate-100 relative">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-3">
                                    <div className="md:col-span-6">
                                        <input
                                            type="text" placeholder="Subject Name (e.g. DBMS)"
                                            className="w-full p-2 border border-slate-300 rounded-lg font-medium focus:border-indigo-500 outline-none"
                                            value={subject.name}
                                            onChange={(e) => updateSubject(index, 'name', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="md:col-span-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-slate-400">CREDITS</span>
                                            <input
                                                type="number" min="1" max="10"
                                                className="w-full p-2 border border-slate-300 rounded-lg text-center"
                                                value={subject.credits}
                                                onChange={(e) => updateSubject(index, 'credits', parseInt(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-slate-400">CONFIDENCE (1-5)</span>
                                            <input
                                                type="number" min="1" max="5"
                                                className="w-full p-2 border border-slate-300 rounded-lg text-center"
                                                value={subject.confidenceLevel}
                                                onChange={(e) => updateSubject(index, 'confidenceLevel', parseInt(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        type="text" placeholder="Weak Areas (comma separated, e.g. Normalization, SQL)"
                                        className="w-full p-2 text-sm border border-red-100 bg-red-50/50 rounded-lg focus:border-red-300 outline-none placeholder:text-red-200"
                                        value={subject.weakAreas}
                                        onChange={(e) => updateSubject(index, 'weakAreas', e.target.value)}
                                    />
                                    <input
                                        type="text" placeholder="Strong Areas (comma separated)"
                                        className="w-full p-2 text-sm border border-emerald-100 bg-emerald-50/50 rounded-lg focus:border-emerald-300 outline-none placeholder:text-emerald-200"
                                        value={subject.strongAreas}
                                        onChange={(e) => updateSubject(index, 'strongAreas', e.target.value)}
                                    />
                                </div>

                                {formData.subjects.length > 1 && (
                                    <button type="button" onClick={() => removeSubject(index)} className="absolute -top-2 -right-2 bg-white text-slate-400 hover:text-red-500 p-1 rounded-full shadow-sm border border-slate-100">
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg flex justify-center items-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 transform hover:-translate-y-0.5">
                    <Send size={20} /> Generate My Adaptive Plan
                </button>
            </form>
        </div>
    );
};

export default InputForm;
