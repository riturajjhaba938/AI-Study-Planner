import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, CheckCircle, Clock, History, AlertCircle } from 'lucide-react';

const StudyTimer = ({ topic, durationHours, onFinish, onClose }) => {
    const initialSeconds = Math.round(durationHours * 3600);
    const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
    const [isActive, setIsActive] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    // Advanced Tracking
    const [pauseCount, setPauseCount] = useState(0);
    const [segments, setSegments] = useState([]);
    const [currentSegmentStart, setCurrentSegmentStart] = useState(null);
    const [showPauseInput, setShowPauseInput] = useState(false);
    const [segmentNote, setSegmentNote] = useState('');
    const [finalNote, setFinalNote] = useState('');

    const timerRef = useRef(null);

    useEffect(() => {
        if (isActive && secondsLeft > 0) {
            timerRef.current = setInterval(() => {
                setSecondsLeft(s => s - 1);
            }, 1000);
        } else if (secondsLeft === 0) {
            handleComplete();
        }
        return () => clearInterval(timerRef.current);
    }, [isActive, secondsLeft]);

    const startTimer = () => {
        setIsActive(true);
        setCurrentSegmentStart(new Date()); // Mark start of this focus block
    };

    const pauseTimer = () => {
        clearInterval(timerRef.current);
        setIsActive(false);
        setPauseCount(c => c + 1);
        setShowPauseInput(true); // Ask for achievement
    };

    const saveSegment = () => {
        if (!currentSegmentStart) return;

        const now = new Date();
        const durationMs = now - currentSegmentStart;
        const durationMin = Math.max(1, Math.round(durationMs / 60000)); // Min 1 minute for log

        setSegments(prev => [...prev, {
            timestamp: now,
            durationMinutes: durationMin,
            achievement: segmentNote || "Focused Study Session"
        }]);

        setSegmentNote('');
        setShowPauseInput(false);
        setCurrentSegmentStart(null);
    };

    const handleComplete = () => {
        setIsActive(false);
        // If we were running, save the last segment automatically or prompt
        if (currentSegmentStart) {
            // Implicit save or ask? Let's ask via standard flow but force it
            setShowPauseInput(true);
        } else {
            setIsFinished(true);
        }
    };

    const handleFinalSubmit = () => {
        // Calculate total tracked time from segments (more accurate than schedule)
        // OR use the timer difference. Let's use schedule - secondsLeft for simplicity
        const totalDurationMin = Math.round((initialSeconds - secondsLeft) / 60);

        onFinish({
            topicId: topic.topicId,
            topicName: topic.topicName,
            durationMinutes: totalDurationMin,
            notes: finalNote,
            pauseCount: pauseCount,
            segments: segments
        });
    };

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // Render Pause Input Modal
    if (showPauseInput) {
        return (
            <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
                <div className="bg-white rounded-xl p-6 max-w-sm w-full animate-in zoom-in-95 duration-200">
                    <div className="text-center mb-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <CheckCircle className="text-indigo-600" size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">Review Segment</h3>
                        <p className="text-sm text-slate-500">You paused! What did you achieve in this block?</p>
                    </div>
                    <textarea
                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm mb-4"
                        rows="3"
                        placeholder="e.g. Read 5 pages, Solved 1 problem..."
                        value={segmentNote}
                        onChange={e => setSegmentNote(e.target.value)}
                        autoFocus
                    />
                    <button
                        onClick={() => {
                            saveSegment();
                            if (secondsLeft === 0) setIsFinished(true); // If time ran out, go to finish
                        }}
                        className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700"
                    >
                        Save & Continue
                    </button>
                    <p className="text-xs text-center text-slate-400 mt-2">Timer is paused</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-indigo-600 p-6 text-white text-center shrink-0">
                    <h3 className="text-lg font-medium opacity-90 mb-1">Studying</h3>
                    <h2 className="text-2xl font-bold truncate">{topic.topicName}</h2>
                </div>

                <div className="p-8 text-center overflow-y-auto flex-1">
                    {!isFinished ? (
                        <>
                            <div className="relative inline-block mb-8">
                                <div className="text-6xl font-mono font-bold text-slate-800 tracking-wider">
                                    {formatTime(secondsLeft)}
                                </div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Remaining</div>
                            </div>

                            <div className="flex items-center justify-center gap-6 mb-8">
                                {!isActive ? (
                                    <button
                                        onClick={startTimer}
                                        className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg hover:bg-indigo-700 hover:scale-110 transition-all"
                                    >
                                        <Play size={32} fill="currentColor" className="ml-1" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={pauseTimer}
                                        className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shadow-lg hover:bg-amber-200 hover:scale-105 transition-all"
                                    >
                                        <Pause size={32} fill="currentColor" />
                                    </button>
                                )}

                                <button
                                    onClick={handleComplete}
                                    className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-red-100 hover:text-red-500 transition-all"
                                    title="End Session Early"
                                >
                                    <Square size={20} fill="currentColor" />
                                </button>
                            </div>

                            {/* Segment History List */}
                            {segments.length > 0 && (
                                <div className="mt-8 text-left">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <History size={14} /> Session History
                                    </h4>
                                    <div className="space-y-2">
                                        {segments.map((seg, idx) => (
                                            <div key={idx} className="text-sm p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-start justify-between gap-3">
                                                <span className="text-slate-700 font-medium line-clamp-2">{seg.achievement}</span>
                                                <span className="text-xs font-mono text-slate-500 whitespace-nowrap bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                                    {seg.durationMinutes}m
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-2 text-xs text-right text-slate-400">
                                        Paused {pauseCount} times
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="animate-in slide-in-from-bottom duration-300">
                            <div className="mb-6">
                                <label className="block text-left text-sm font-bold text-slate-700 mb-2">
                                    Final Session Summary
                                </label>
                                <textarea
                                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                    rows="3"
                                    placeholder="Overall summary or final thoughts..."
                                    value={finalNote}
                                    onChange={(e) => setFinalNote(e.target.value)}
                                ></textarea>
                            </div>

                            <div className="bg-indigo-50 rounded-xl p-4 mb-6 text-left">
                                <h4 className="font-bold text-indigo-900 mb-2">Session Stats</h4>
                                <ul className="text-sm space-y-1 text-indigo-700">
                                    <li>• Total Pauses: <span className="font-bold">{pauseCount}</span></li>
                                    <li>• Segments Completed: <span className="font-bold">{segments.length}</span></li>
                                    <li>• Time Elapsed: <span className="font-bold">{Math.round((initialSeconds - secondsLeft) / 60)} min</span></li>
                                </ul>
                            </div>

                            <button
                                onClick={handleFinalSubmit}
                                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                            >
                                <CheckCircle size={20} /> Save Progress
                            </button>
                        </div>
                    )}
                </div>

                {!isFinished && (
                    <div className="bg-slate-50 p-4 text-center border-t border-slate-100 shrink-0">
                        <button onClick={onClose} className="text-sm text-slate-500 hover:text-slate-800 underline">
                            Cancel Session
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudyTimer;
