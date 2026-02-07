import React, { useRef } from 'react';
import { User, LogOut, Flame, X, Camera, Footprints, Brain, Calendar, Moon, Sun, Zap, Trophy, Lock, GraduationCap, BookOpen, Clock, Target } from 'lucide-react';

const ALL_BADGES = [
    { id: 'first_step', name: 'First Step', icon: Footprints, description: 'Completed your first study session.' },
    { id: 'focus_master', name: 'Focus Master', icon: Brain, description: 'Studied for over 100 minutes total.' },
    { id: 'streak_master', name: 'Streak Master', icon: Flame, description: 'Maintained a 3-day study streak.' },
    { id: 'weekend_warrior', name: 'Weekend Warrior', icon: Calendar, description: 'Logged a study session on a weekend.' },
    { id: 'night_owl', name: 'Night Owl', icon: Moon, description: 'Studied late into the night (10 PM - 4 AM).' },
    { id: 'early_bird', name: 'Early Bird', icon: Sun, description: 'Started the day with a study session (4 AM - 9 AM).' },
    { id: 'marathoner', name: 'Marathoner', icon: Zap, description: 'Completed a single study session longer than 4 hours.' },
    { id: 'target_smasher', name: 'Target Smasher', icon: Trophy, description: 'Clocked over 50 hours of total study time!' }
];

const UserProfile = ({ user, onLogout, onClose, onUpdateUser }) => {
    if (!user) return null;
    const fileInputRef = useRef(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result;
            try {
                const res = await fetch('/api/user/update', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: user.id,
                        profilePicture: base64String
                    })
                });

                if (res.ok) {
                    const data = await res.json();
                    onUpdateUser(data.user);
                }
            } catch (err) {
                console.error("Failed to upload image", err);
            }
        };
        reader.readAsDataURL(file);
    };

    const formatDate = (date) => {
        if (!date) return 'Not set';
        return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
            <div className="w-96 bg-white h-full shadow-2xl p-6 animate-in slide-in-from-right duration-300 overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <User className="text-indigo-600" /> Profile
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                {/* Profile Picture & Basic Info */}
                <div className="flex flex-col items-center mb-6 relative group">
                    <div className="w-24 h-24 rounded-full overflow-hidden mb-3 border-4 border-indigo-50 relative">
                        {user.profilePicture ? (
                            <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-3xl font-bold text-indigo-600">
                                {user.name?.charAt(0).toUpperCase() || '?'}
                            </div>
                        )}
                        <div
                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            onClick={() => fileInputRef.current.click()}
                        >
                            <Camera className="text-white" size={24} />
                        </div>
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                    <h3 className="text-lg font-bold text-slate-800">{user.name}</h3>
                    <p className="text-sm text-slate-500">{user.email}</p>
                </div>

                {/* Academic Information */}
                {(user.college || user.branch || user.graduationYear) && (
                    <div className="mb-6 bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                        <div className="flex items-center gap-2 mb-3">
                            <GraduationCap className="text-indigo-600" size={18} />
                            <h4 className="text-sm font-bold text-indigo-900 uppercase">Academic Details</h4>
                        </div>
                        {user.college && (
                            <div className="mb-2">
                                <p className="text-xs text-slate-500 uppercase font-semibold">College</p>
                                <p className="text-sm text-slate-800 font-medium">{user.college}</p>
                            </div>
                        )}
                        {user.branch && (
                            <div className="mb-2">
                                <p className="text-xs text-slate-500 uppercase font-semibold">Branch</p>
                                <p className="text-sm text-slate-800 font-medium">{user.branch}</p>
                            </div>
                        )}
                        {user.graduationYear && (
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-semibold">Graduation Year</p>
                                <p className="text-sm text-slate-800 font-medium">{user.graduationYear}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Study Stats */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-orange-50 p-3 rounded-xl border border-orange-100">
                        <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-bold text-orange-600 uppercase">Streak</p>
                            <Flame size={18} className="text-orange-500" />
                        </div>
                        <p className="text-xl font-bold text-orange-700">{user.streak || 0} Days</p>
                    </div>
                    <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                        <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-bold text-emerald-600 uppercase">Total Time</p>
                            <Clock size={18} className="text-emerald-500" />
                        </div>
                        <p className="text-xl font-bold text-emerald-700">{Math.floor((user.totalMinutesStudied || 0) / 60)}h</p>
                    </div>
                </div>

                {/* Target Dates */}
                {user.targetDates && user.targetDates.length > 0 && (
                    <div className="mb-6 bg-violet-50 rounded-xl p-4 border border-violet-100">
                        <div className="flex items-center gap-2 mb-3">
                            <Target className="text-violet-600" size={18} />
                            <h4 className="text-sm font-bold text-violet-900 uppercase">Target Milestones</h4>
                        </div>
                        <div className="space-y-2">
                            {user.targetDates.map((target, idx) => (
                                <div key={idx} className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-slate-700">{target.label}</span>
                                    <span className="text-xs text-slate-500 font-semibold">{formatDate(target.date)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Study Preferences */}
                {user.availability && (
                    <div className="mb-6 bg-sky-50 rounded-xl p-4 border border-sky-100">
                        <div className="flex items-center gap-2 mb-3">
                            <Calendar className="text-sky-600" size={18} />
                            <h4 className="text-sm font-bold text-sky-900 uppercase">Study Preferences</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Weekdays</p>
                                <p className="text-sm text-slate-800 font-bold">{user.availability.weekdays}h/day</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Weekends</p>
                                <p className="text-sm text-slate-800 font-bold">{user.availability.weekends}h/day</p>
                            </div>
                        </div>
                        {user.availability.preferredTime && (
                            <div className="mt-2">
                                <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Preferred Time</p>
                                <p className="text-sm text-slate-800 font-medium">{user.availability.preferredTime}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Subjects */}
                {user.subjects && user.subjects.length > 0 && (
                    <div className="mb-6 bg-amber-50 rounded-xl p-4 border border-amber-100">
                        <div className="flex items-center gap-2 mb-3">
                            <BookOpen className="text-amber-600" size={18} />
                            <h4 className="text-sm font-bold text-amber-900 uppercase">Enrolled Subjects</h4>
                        </div>
                        <div className="space-y-2">
                            {user.subjects.slice(0, 5).map((subject, idx) => (
                                <div key={idx} className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-slate-700">{subject.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs bg-white px-2 py-0.5 rounded-full font-semibold text-slate-600">
                                            {subject.credits || 0} credits
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {user.subjects.length > 5 && (
                                <p className="text-xs text-slate-500 text-center mt-2">+{user.subjects.length - 5} more</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Badges Section */}
                <div className="mb-6">
                    <h3 className="text-sm font-bold text-slate-700 uppercase mb-3">Badges & Achievements</h3>
                    <div className="grid grid-cols-3 gap-3">
                        {ALL_BADGES.map((badge, idx) => {
                            const isUnlocked = user.badges && user.badges.some(b => b.id === badge.id);
                            const BadgeIcon = badge.icon;

                            return (
                                <div
                                    key={idx}
                                    className={`group relative flex flex-col items-center p-3 rounded-xl transition-all cursor-help border ${isUnlocked ? 'bg-indigo-50 border-indigo-100 hover:bg-indigo-100' : 'bg-slate-50 border-slate-100 opacity-60 grayscale'}`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 shadow-sm ${isUnlocked ? 'bg-white text-indigo-600' : 'bg-slate-200 text-slate-400'}`}>
                                        {isUnlocked ? <BadgeIcon size={20} /> : <Lock size={16} />}
                                    </div>
                                    <span className={`text-[10px] font-bold leading-tight text-center ${isUnlocked ? 'text-slate-700' : 'text-slate-400'}`}>
                                        {badge.name}
                                    </span>
                                    <div className="absolute bottom-full mb-2 hidden group-hover:block w-36 p-2 bg-slate-800 text-white text-xs rounded-lg z-50 shadow-lg text-center">
                                        <p className="font-bold mb-1 border-b border-slate-600 pb-1">{isUnlocked ? "🎉 Unlocked!" : "🔒 Locked"}</p>
                                        <p>{badge.description}</p>
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Sign Out Button */}
                <div className="space-y-3">
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 p-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors font-medium"
                    >
                        <LogOut size={18} /> Sign Out
                    </button>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-200 text-center">
                    <p className="text-xs text-slate-400">EduFlow AI v1.0</p>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
