import React from 'react';
import { TrendingUp, TrendingDown, Minus, Award } from 'lucide-react';
import './ConfidenceTrends.css';

const ConfidenceTrends = ({ user }) => {
    if (!user?.confidenceHistory || user.confidenceHistory.length === 0) {
        return (
            <div className="confidence-trends-empty">
                <Award size={48} className="empty-icon" />
                <h3>No Confidence Data Yet</h3>
                <p>Start logging your study sessions to track confidence improvements!</p>
            </div>
        );
    }

    // Group by subject
    const subjectTrends = {};
    user.confidenceHistory.forEach(entry => {
        if (!subjectTrends[entry.subjectName]) {
            subjectTrends[entry.subjectName] = [];
        }
        subjectTrends[entry.subjectName].push(entry);
    });

    // Get latest confidence for each subject
    const currentConfidence = {};
    Object.keys(subjectTrends).forEach(subject => {
        const latest = subjectTrends[subject][subjectTrends[subject].length - 1];
        currentConfidence[subject] = latest.newConfidence;
    });

    // Calculate overall improvement
    const totalImprovement = user.confidenceHistory.reduce((sum, entry) => {
        return sum + (entry.newConfidence - entry.oldConfidence);
    }, 0);

    const getTrendIcon = (change) => {
        if (change > 0) return <TrendingUp className="trend-up" size={20} />;
        if (change < 0) return <TrendingDown className="trend-down" size={20} />;
        return <Minus className="trend-neutral" size={20} />;
    };

    const getConfidenceColor = (level) => {
        const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];
        return colors[level - 1] || '#6b7280';
    };

    return (
        <div className="confidence-trends">
            <div className="trends-header">
                <h2>📈 Confidence Tracking</h2>
                <div className="overall-improvement">
                    <span className="improvement-label">Total Improvement:</span>
                    <span className={`improvement-value ${totalImprovement > 0 ? 'positive' : 'neutral'}`}>
                        {totalImprovement > 0 ? '+' : ''}{totalImprovement} levels
                    </span>
                </div>
            </div>

            <div className="subjects-grid">
                {Object.keys(subjectTrends).map(subject => {
                    const changes = subjectTrends[subject];
                    const latest = changes[changes.length - 1];
                    const totalChange = latest.newConfidence - changes[0].oldConfidence;

                    return (
                        <div key={subject} className="subject-card">
                            <div className="subject-header">
                                <h3>{subject}</h3>
                                {getTrendIcon(totalChange)}
                            </div>

                            <div className="confidence-display">
                                <div className="confidence-bar">
                                    <div
                                        className="confidence-fill"
                                        style={{
                                            width: `${(currentConfidence[subject] / 5) * 100}%`,
                                            backgroundColor: getConfidenceColor(currentConfidence[subject])
                                        }}
                                    />
                                </div>
                                <span className="confidence-level">
                                    Level {currentConfidence[subject]}/5
                                </span>
                            </div>

                            <div className="change-history">
                                <h4>Recent Changes</h4>
                                {changes.slice(-3).reverse().map((change, idx) => (
                                    <div key={idx} className="change-entry">
                                        <span className="change-date">
                                            {new Date(change.recordedAt).toLocaleDateString()}
                                        </span>
                                        <span className="change-arrow">
                                            {change.oldConfidence} → {change.newConfidence}
                                        </span>
                                        <span className={`change-value ${change.newConfidence > change.oldConfidence ? 'positive' : 'negative'}`}>
                                            {change.newConfidence > change.oldConfidence ? '+' : ''}
                                            {change.newConfidence - change.oldConfidence}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ConfidenceTrends;
