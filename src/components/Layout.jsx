import { Timer, Code, BookOpen, FolderOpen, BarChart3, Zap, Wifi, WifiOff, Database } from 'lucide-react';
import { useState, useEffect } from 'react';
// Our API client — file that talks to the backend.
import { mongoClient } from '../lib/mongodbClient';

// ─── Navigation Items 
// This is a static array defined OUTSIDE the component because it never changes.
// Keeping it outside means React won't re-create it on every render — better performance.
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'tracker',   label: 'Time Tracker', icon: Timer },
  { id: 'logs',      label: 'Daily Logs', icon: BookOpen },
  { id: 'snippets',  label: 'Snippets', icon: Code },
  { id: 'projects',  label: 'Projects', icon: FolderOpen },
];

// ─── Layout Component 
// The actual page content is passed in as `children`.
// children   → whatever page is currently active
export function Layout({ children, activeTab, onTabChange }) {
    return(
        <div className='min-h-screen bg-slate-950'>
            
        </div>

    )
}