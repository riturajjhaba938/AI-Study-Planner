import React, { useState } from 'react';
import { Brain, Plus, Send, Trash2 } from 'lucide-react';

const InputForm = ({ onGenerate }) => {
    const [formData, setFormData] = useState({
        name: '',
        targetDate: '',
        subjects: [{ name: '', credits: 3, confidenceLevel: 3, weakAreas: [] }]
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Basic validation
            if (!formData.name || !formData.targetDate || formData.subjects.some(s => !s.name)) {
                alert("Please fill in all required fields.");
                return;
            }

            console.log("Submitting:", formData);
            const response = await fetch('http://localhost:5000/api/generate-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const result = await response.json();

            if (result.success && result.data) {
                onGenerate(result.data.sprint, formData); // Pass back sprint AND user data context
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
            subjects: [...formData.subjects, { name: '', credits: 3, confidenceLevel: 3, weakAreas: [] }]
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

    return (
        <div className="max-w-3xl mx-auto pt-12 p-6 font-sans">
            <h1 className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-2">
                <Brain className="text-indigo-600" /> AI Study Setup
            </h1>
            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl shadow-xl border border-slate-200">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Your Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Rituraj Jha"
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Target Exam Date</label>
                        <input
                            type="date"
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            value={formData.targetDate}
                            onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                            required
                        />
                    </div>
                </div>

                <div className="border-t border-slate-100 pt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-slate-800">Subjects</h3>
                        <button type="button" onClick={addSubject} className="text-sm text-indigo-600 font-medium hover:text-indigo-800 flex items-center gap-1">
                            <Plus size={16} /> Add Subject
                        </button>
                    </div>

                    <div className="space-y-4">
                        {formData.subjects.map((subject, index) => (
                            <div key={index} className="flex flex-col md:flex-row gap-4 items-start p-4 bg-slate-50 rounded-xl border border-slate-100 relative group">
                                <div className="flex-1 w-full">
                                    <input
                                        type="text"
                                        placeholder="Subject Name"
                                        className="w-full p-2 border border-slate-300 rounded-md text-sm focus:border-indigo-500 outline-none"
                                        value={subject.name}
                                        onChange={(e) => updateSubject(index, 'name', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="flex gap-4 w-full md:w-auto">
                                    <div className="flex-1">
                                        <label className="block text-xs text-slate-500 mb-1">Credits</label>
                                        <input
                                            type="number" min="1" max="10"
                                            className="w-20 p-2 border border-slate-300 rounded-md text-sm"
                                            value={subject.credits}
                                            onChange={(e) => updateSubject(index, 'credits', parseInt(e.target.value))}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs text-slate-500 mb-1">Confidence (1-5)</label>
                                        <input
                                            type="number" min="1" max="5"
                                            className="w-20 p-2 border border-slate-300 rounded-md text-sm"
                                            value={subject.confidenceLevel}
                                            onChange={(e) => updateSubject(index, 'confidenceLevel', parseInt(e.target.value))}
                                        />
                                    </div>
                                </div>
                                {formData.subjects.length > 1 && (
                                    <button type="button" onClick={() => removeSubject(index)} className="text-slate-400 hover:text-red-500 md:self-center">
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                    <Send size={20} /> Generate Intelligent Plan
                </button>
            </form>
        </div>
    );
};

export default InputForm;
