import React from 'react';
import { Lightbulb, AlertTriangle, Target, TrendingUp, Calendar } from 'lucide-react';

const InsightsPanel = ({ schedule, userData }) => {
    if (!schedule || !schedule.weeklySchedule) return null;

    // Extract next 7 days priority topics
    const getNext7DaysFocus = () => {
        const priorityTopics = [];
        const topicsSeen = new Set();

        schedule.weeklySchedule.forEach(day => {
            day.sessions.forEach(session => {
                if (!topicsSeen.has(session.topic) && session.cognitiveLoad === 'High') {
                    priorityTopics.push({
                        topic: session.topic,
                        subject: session.subject || 'General',
                        day: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })
                    });
                    topicsSeen.add(session.topic);
                }
            });
        });

        return priorityTopics.slice(0, 4); // Top 4 high-priority topics
    };

    // Analyze prerequisite gaps (simplified logic)
    const getPrerequisiteWarnings = () => {
        const warnings = [];

        // Check if subjects have weak areas that might be prerequisites
        if (userData?.subjects) {
            userData.subjects.forEach(subject => {
                if (subject.weakAreas && subject.weakAreas.length > 0 && subject.confidenceLevel <= 2) {
                    warnings.push({
                        subject: subject.name,
                        warning: `Low confidence in ${subject.name}. Review fundamentals before advanced topics.`,
                        recommendation: subject.weakAreas[0]
                    });
                }
            });
        }

        return warnings.slice(0, 2); // Top 2 warnings
    };

    // Calculate days until target
    const getDaysUntilTarget = () => {
        if (!userData?.targetDate) return null;
        const today = new Date();
        const target = new Date(userData.targetDate);
        const diffTime = target - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    const priorityTopics = getNext7DaysFocus();
    const warnings = getPrerequisiteWarnings();
    const daysRemaining = getDaysUntilTarget();

    return (
        <div className="mb-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <div className="bg-indigo-100 p-2 rounded-lg">
                    <Lightbulb className="text-indigo-600" size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Actionable Insights</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                {/* Next 7 Days Focus */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-indigo-50">
                    <div className="flex items-center gap-2 mb-3">
                        <Target className="text-indigo-600" size={16} />
                        <h4 className="text-sm font-bold text-indigo-900 uppercase">Next 7 Days Focus</h4>
                    </div>
                    {priorityTopics.length > 0 ? (
                        <div className="space-y-2">
                            {priorityTopics.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-1.5 flex-shrink-0"></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-slate-700">{item.topic}</p>
                                        <p className="text-xs text-slate-500">{item.subject} • {item.day}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-slate-500">No high-priority topics scheduled</p>
                    )}
                </div>

                {/* Prerequisite Warnings */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-orange-50">
                    <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="text-orange-600" size={16} />
                        <h4 className="text-sm font-bold text-orange-900 uppercase">Priority Recommendations</h4>
                    </div>
                    {warnings.length > 0 ? (
                        <div className="space-y-2">
                            {warnings.map((warn, idx) => (
                                <div key={idx} className="bg-orange-50 rounded-lg p-2">
                                    <p className="text-xs font-semibold text-orange-800 mb-1">{warn.subject}</p>
                                    <p className="text-xs text-slate-600">
                                        ⚡ Focus on: <span className="font-medium">{warn.recommendation}</span>
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-green-600">
                            <TrendingUp size={16} />
                            <p className="text-xs font-medium">Great progress! No critical gaps detected.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Weekly Milestone */}
            {daysRemaining !== null && (
                <div className="mt-4 bg-white rounded-xl p-4 shadow-sm border border-purple-50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Calendar className="text-purple-600" size={16} />
                            <h4 className="text-sm font-bold text-purple-900 uppercase">Target Countdown</h4>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-purple-700">{daysRemaining}</p>
                            <p className="text-xs text-slate-500 font-medium">days remaining</p>
                        </div>
                    </div>
                    {daysRemaining < 7 && (
                        <div className="mt-2 bg-purple-50 rounded-lg p-2">
                            <p className="text-xs text-purple-800 font-medium">
                                ⚡ Final week! Focus on weak areas and revision.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default InsightsPanel;
