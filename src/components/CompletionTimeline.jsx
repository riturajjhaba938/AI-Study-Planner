import React from 'react';
import { TrendingUp, Calendar, Target } from 'lucide-react';

const CompletionTimeline = ({ schedule, userData }) => {
    if (!schedule || !userData) return null;

    // Calculate estimated completion dates based on schedule coverage
    const calculateCompletion = () => {
        const completionData = [];

        if (!userData.subjects || userData.subjects.length === 0) return [];

        userData.subjects.forEach(subject => {
            // Count sessions for this subject
            let totalSessionsForSubject = 0;
            let totalHoursAllocated = 0;

            if (schedule.weeklySchedule) {
                schedule.weeklySchedule.forEach(day => {
                    day.sessions.forEach(session => {
                        if (session.subject === subject.name) {
                            totalSessionsForSubject++;
                            totalHoursAllocated += session.duration || 0;
                        }
                    });
                });
            }

            // Estimate: low confidence subjects need 3-4 weeks, high confidence need 1-2 weeks
            const weeksNeeded = subject.confidenceLevel <= 2 ? 4 :
                subject.confidenceLevel <= 3 ? 3 : 2;

            const estimatedDate = new Date();
            estimatedDate.setDate(estimatedDate.getDate() + (weeksNeeded * 7));

            // Projected confidence improvement: +1 or +2 points
            const confidenceGain = subject.confidenceLevel <= 2 ? 2 : 1;
            const projectedConfidence = Math.min(5, subject.confidenceLevel + confidenceGain);

            completionData.push({
                subject: subject.name,
                currentConfidence: subject.confidenceLevel,
                projectedConfidence,
                estimatedDate: estimatedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                hoursAllocated: totalHoursAllocated.toFixed(1),
                status: subject.confidenceLevel <= 2 ? 'Critical Focus' :
                    subject.confidenceLevel <= 3 ? 'In Progress' : 'Maintenance'
            });
        });

        return completionData.sort((a, b) => a.currentConfidence - b.currentConfidence);
    };

    const completions = calculateCompletion();

    if (completions.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-4">
                <div className="bg-emerald-100 p-2 rounded-lg">
                    <TrendingUp className="text-emerald-600" size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Completion Forecast</h3>
            </div>

            <div className="space-y-3">
                {completions.map((item, idx) => (
                    <div key={idx} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        {/* Subject name and status */}
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="text-sm font-bold text-slate-800">{item.subject}</h4>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${item.status === 'Critical Focus' ? 'bg-red-100 text-red-700' :
                                        item.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-green-100 text-green-700'
                                    }`}>
                                    {item.status}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-500">
                                <Calendar size={14} />
                                <span className="text-xs font-medium">{item.estimatedDate}</span>
                            </div>
                        </div>

                        {/* Confidence progress bar */}
                        <div className="mb-2">
                            <div className="flex justify-between text-xs text-slate-600 mb-1">
                                <span>Confidence</span>
                                <span className="font-medium">
                                    {item.currentConfidence}/5 → {item.projectedConfidence}/5
                                </span>
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-indigo-400 to-emerald-400 rounded-full transition-all"
                                    style={{ width: `${(item.projectedConfidence / 5) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Hours allocated */}
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Target size={12} />
                            <span>{item.hoursAllocated}h this week</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Overall summary */}
            <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Projected avg. confidence gain:</span>
                    <span className="font-bold text-emerald-600">+{(completions.reduce((sum, c) => sum + (c.projectedConfidence - c.currentConfidence), 0) / completions.length).toFixed(1)} points</span>
                </div>
            </div>
        </div>
    );
};

export default CompletionTimeline;
