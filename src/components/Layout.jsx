import { Timer, Code, BookOpen, FolderOpen, BarChart3, Zap, Wifi, WifiOff, Database } from 'lucide-react';
import { useState, useEffect } from 'react';
import { mongoClient } from '../lib/mongodbClient';

// ─── Navigation Items 
// Keeping it outside means React won't re-create it on every render — better performance.
const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'tracker', label: 'Time Tracker', icon: Timer },
    { id: 'logs', label: 'Daily Logs', icon: BookOpen },
    { id: 'snippets', label: 'Snippets', icon: Code },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
];

// ─── Layout Component 
export function Layout({ children, activeTab, onTabChange }) {
    return (
        <div className=' min-h-screen bg-slate-950'>

            {/* HEADER */}
            <header className='glass sticky top-0 z-50 border-b border-slate-800/50'>
                <div className=' max-w-6xl mx-auto px-4 py-4'>
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                            <div className='w-10 h-10 rounded-xl bg-linear-to-br from-primary-500 to-accent-500 flex items-center justify-center '>
                                <Zap className='w-6 h-6 text-white' />
                            </div>
                            <div>
                                <h1 className='text-xl font-bold gradient-text'>Yantra</h1>
                                <p className='text-xs text-slate-500'>Developer Productivity Dashboard</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* NAVBAR */}
            <nav className="glass sticky top-16 z-40 border-b border-slate-800/30 overflow-x-auto">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex gap-1">

                        {NAV_ITEMS.map(item => {

                            const Icon = item.icon;
                            // Boolean: true if this item's id matches the currently active tab
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}

                                    onClick={() => onTabChange(item.id)}

                                    className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-all whitespace-nowrap ${isActive
                                        ? 'text-primary-400 border-b-2 border-primary-400'
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {item.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-4 py-6">
                {children}
            </main>

            <footer className="border-t border-slate-800/30 mt-12">
                <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-slate-600">
                    Yantra - Developer Productivity Dashboard
                    MERN STACK
                </div>
            </footer>

        </div>
    );
}