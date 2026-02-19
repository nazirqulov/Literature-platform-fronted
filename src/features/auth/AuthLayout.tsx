import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout: React.FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-950">
            {/* Uzbek Pattern Decorative Element */}
            <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-amber-600/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>

            <div className="w-full max-w-md relative z-10 animate-fade-in">
                <div className="glass-dark p-8 rounded-2xl">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
