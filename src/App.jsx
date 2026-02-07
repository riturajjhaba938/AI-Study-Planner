import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import InputForm from './components/InputForm';
import Login from './components/Login';
import Signup from './components/Signup';
import UserProfile from './components/UserProfile';
import { User as UserIcon, GraduationCap } from 'lucide-react';

function App() {
    const [currentUser, setCurrentUser] = useState(null); // Authenticated user
    const [authView, setAuthView] = useState('login'); // 'login' or 'signup'
    const [showProfile, setShowProfile] = useState(false);

    const [isPlanGenerated, setIsPlanGenerated] = useState(false);
    const [planData, setPlanData] = useState(null);
    const [userData, setUserData] = useState(null);

    // Initial Load
    React.useEffect(() => {
        const savedUser = localStorage.getItem('currentUser');
        const savedPlan = localStorage.getItem('generatedPlan');
        const savedUserData = localStorage.getItem('userData');

        if (savedUser) setCurrentUser(JSON.parse(savedUser));
        if (savedPlan && savedUserData) {
            setPlanData(JSON.parse(savedPlan));
            setUserData(JSON.parse(savedUserData));
            setIsPlanGenerated(true);
        }
    }, []);

    const handleLoginSuccess = (loggedInUser) => {
        setCurrentUser(loggedInUser);
        localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
        // If user already has a plan (we'd need to fetch it, but for now let's just let them generate new one or existing logic)
    };

    const handlePlanGenerated = (sprintData, userContext) => {
        setPlanData(sprintData);
        setUserData(userContext);
        setIsPlanGenerated(true);

        localStorage.setItem('generatedPlan', JSON.stringify(sprintData));
        localStorage.setItem('userData', JSON.stringify(userContext));
    };

    // Logout Helper (Optional but good to have)
    const handleLogout = () => {
        setCurrentUser(null);
        setIsPlanGenerated(false);
        setPlanData(null);
        setUserData(null);
        setShowProfile(false);
        localStorage.clear();
    };

    const handleUpdateUser = (updatedUser) => {
        // Merge with existing state to preserve other fields if needed, 
        // though the backend should return the full user object often.
        const newUserState = { ...currentUser, ...updatedUser };
        setCurrentUser(newUserState);
        localStorage.setItem('currentUser', JSON.stringify(newUserState)); // Updated to currentUser
    };

    const handleEditPlan = () => {
        setIsPlanGenerated(false);
    };

    // Auth Flow
    if (!currentUser) { // Updated to currentUser
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <h1 className="text-center text-3xl font-extrabold text-slate-900 mb-2">EduFlow AI</h1>
                    <p className="text-center text-sm text-slate-600">Smart Study Planning for Engineers</p>
                </div>
                {authView === 'login' ? (
                    <Login onLoginSuccess={handleLoginSuccess} onSwitchToSignup={() => setAuthView('signup')} />
                ) : (
                    <Signup onSwitchToLogin={() => setAuthView('login')} />
                )}
            </div>
        );
    }

    // Application Flow
    return (
        <div className="min-h-screen bg-slate-50 relative">
            {/* Header / Nav */}
            <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-40">
                <div className="flex items-center gap-2">
                    <div className="bg-indigo-600 p-2 rounded-lg">
                        <GraduationCap className="text-white w-6 h-6" />
                    </div>
                    <h1 className="text-xl font-bold text-slate-800 hidden sm:block">AI Study Planner</h1>
                </div>

                <div className="flex items-center gap-4">
                    {currentUser ? (
                        <button
                            onClick={() => setShowProfile(true)}
                            className="flex items-center gap-2 hover:bg-slate-50 px-3 py-1.5 rounded-full transition-colors border border-transparent hover:border-slate-200"
                        >
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold overflow-hidden">
                                {currentUser.profilePicture ? (
                                    <img src={currentUser.profilePicture} alt="Avg" className="w-full h-full object-cover" />
                                ) : (
                                    currentUser.name.charAt(0).toUpperCase()
                                )}
                            </div>
                            <span className="text-sm font-medium text-slate-700 hidden sm:block">{currentUser.name}</span>
                        </button>
                    ) : null}
                </div>
            </nav>

            {/* Profile Sidebar */}
            {showProfile && (
                <UserProfile
                    user={currentUser} // Updated to currentUser
                    onLogout={handleLogout}
                    onClose={() => setShowProfile(false)}
                    onUpdateUser={handleUpdateUser} // Added onUpdateUser
                />
            )}

            {!isPlanGenerated ? (
                <InputForm
                    onGenerate={handlePlanGenerated}
                    user={currentUser}
                    initialData={userData}
                />
            ) : (
                <Dashboard
                    initialData={{ schedule: planData, user: userData }}
                    onEditPlan={handleEditPlan}
                />
            )}
        </div>
    );
}

export default App;
