import React, { useRef } from 'react';
import { User, LogOut, Flame, X, Camera, Footprints, Brain, Calendar, Moon, Sun, Zap, Trophy } from 'lucide-react';

const UserProfile = ({ user, onLogout, onClose, onUpdateUser }) => {
    if (!user) return null;
    const fileInputRef = useRef(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Convert to Base64
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result;
            try {
                const res = await fetch('http://localhost:5000/api/user/update', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: user.id,
                        profilePicture: base64String
                    })
                });

                if (res.ok) {
                    const data = await res.json();
                    onUpdateUser(data.user); // Update parent state
                }
            } catch (err) {
                console.error("Failed to upload image", err);
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
            <div className="w-80 bg-white h-full shadow-2xl p-6 animate-in slide-in-from-right duration-300 overflow-y-auto">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <User className="text-indigo-600" /> Profile
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                <div className="flex flex-col items-center mb-8 relative group">
                    <div className="w-24 h-24 rounded-full overflow-hidden mb-3 border-4 border-indigo-50 relative">
                        {user.profilePicture ? (
                            <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-3xl font-bold text-indigo-600">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                        )}

                        {/* Overlay Upload Button */}
                        <div
                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            onClick={() => fileInputRef.current.click()}
                        >
                            <Camera className="text-white" size={24} />
                        </div>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />

                    <h3 className="text-lg font-bold text-slate-800">{user.name}</h3>
                    <p className="text-sm text-slate-500">{user.email}</p>
                </div>

                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 mb-8 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-orange-600 uppercase mb-1">Current Streak</p>
                        <p className="text-2xl font-bold text-orange-700">{user.streak || 0} Days</p>
                    </div>
                    <Flame size={32} className="text-orange-500" />
                </div>

                {/* Badges Section */}
                <div className="mb-8">
                    <h3 className="text-sm font-bold text-slate-700 uppercase mb-3">Achieved Badges</h3>
                    {user.badges && user.badges.length > 0 ? (
                        <div className="grid grid-cols-3 gap-3">
                            {user.badges.map((badge, idx) => {
                                // Dynamic Icon Mapping
                                let BadgeIcon = Flame;
                                if (badge.id === 'first_step') BadgeIcon = Footprints;
                                if (badge.id === 'focus_master') BadgeIcon = Brain;
                                if (badge.id === 'streak_master') BadgeIcon = Flame;
                                if (badge.id === 'weekend_warrior') BadgeIcon = Calendar;
                                if (badge.id === 'night_owl') BadgeIcon = Moon;
                                if (badge.id === 'early_bird') BadgeIcon = Sun;
                                if (badge.id === 'marathoner') BadgeIcon = Zap;
                                if (badge.id === 'target_smasher') BadgeIcon = Trophy;

                                return (
                                    <div key={idx} className="group relative flex flex-col items-center p-3 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors cursor-help">
                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-indigo-600 mb-2 shadow-sm">
                                            <BadgeIcon size={20} />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-700 leading-tight text-center">{badge.name}</span>

                                        {/* Tooltip */}
                                        <div className="absolute bottom-full mb-2 hidden group-hover:block w-32 p-2 bg-slate-800 text-white text-xs rounded-lg z-50 shadow-lg text-center">
                                            {badge.description}
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-6 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                            <p className="text-sm text-slate-500 font-medium">No badges yet.</p>
                            <p className="text-xs text-slate-400">Start studying to earn rewards!</p>
                        </div>
                    )}
                </div>

                <div className="space-y-3">
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 p-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors font-medium"
                    >
                        <LogOut size={18} /> Sign Out
                    </button>
                </div>

                <div className="mt-auto pt-8 text-center">
                    <p className="text-xs text-slate-400">EduFlow AI v1.0</p>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
