import React, { useState } from 'react';
import { LogIn, Mail, Lock } from 'lucide-react';

const Login = ({ onLoginSuccess, onSwitchToSignup }) => {
    const [formData, setFormData] = useState({ email: '', password: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const contentType = res.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                const data = await res.json();
                if (res.ok) {
                    onLoginSuccess(data.user);
                } else {
                    alert(data.msg || data.error || 'Login failed');
                }
            } else {
                const errorText = await res.text();
                console.error('Non-JSON Response:', errorText);
                alert(`Server Error (${res.status}): The server returned an invalid response. See console for details.`);
            }
        } catch (err) {
            console.error('Login Network Error:', err);
            alert('Connection/Server Error. Please check Render logs.');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-2xl shadow-xl border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <LogIn className="text-indigo-600" /> Welcome Back
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                        <input
                            type="email"
                            className="w-full pl-10 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="rituraj@example.com"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                        <input
                            type="password"
                            className="w-full pl-10 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                    Log In
                </button>
            </form>
            <p className="mt-4 text-center text-sm text-slate-500">
                Don't have an account? <button onClick={onSwitchToSignup} className="text-indigo-600 font-bold hover:underline">Sign Up</button>
            </p>
        </div>
    );
};

export default Login;
