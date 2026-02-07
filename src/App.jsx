import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import InputForm from './components/InputForm';

function App() {
    const [isPlanGenerated, setIsPlanGenerated] = useState(false);
    const [planData, setPlanData] = useState(null); // The Sprint JSON
    const [userData, setUserData] = useState(null); // The User Input Context

    const handlePlanGenerated = (sprintData, userContext) => {
        setPlanData(sprintData);
        setUserData(userContext);
        setIsPlanGenerated(true);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {!isPlanGenerated ? (
                <InputForm onGenerate={handlePlanGenerated} />
            ) : (
                <Dashboard initialData={{ schedule: planData, user: userData }} />
            )}
        </div>
    );
}

export default App;
