import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import InputForm from './components/InputForm';
import Login from './components/Login';
import Signup from './components/Signup';

function App() {
    const [user, setUser] = useState(null); // Authenticated user
    const [authView, setAuthView] = useState('login'); // 'login' or 'signup'

    const [isPlanGenerated, setIsPlanGenerated] = useState(false);
    const [planData, setPlanData] = useState(null);
    const [userData, setUserData] = useState(null);

    const handleLoginSuccess = (loggedInUser) => {
        setUser(loggedInUser);
        // If user already has a plan (we'd need to fetch it, but for now let's just let them generate new one or existing logic)
    };

    const handlePlanGenerated = (sprintData, userContext) => {
        setPlanData(sprintData);
        setUserData(userContext);
        setIsPlanGenerated(true);
    };

    // Auth Flow
    if (!user) {
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
        <div className="min-h-screen bg-slate-50">
            {!isPlanGenerated ? (
                <InputForm onGenerate={handlePlanGenerated} user={user} />
            ) : (
                <Dashboard initialData={{ schedule: planData, user: userData }} />
            )}
        </div>
    );
}

export default App;
