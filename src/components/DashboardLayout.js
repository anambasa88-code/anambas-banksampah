"use client";

import { useState } from "react";
import Sidebar from "./Sidebar"; 
import { Menu } from "lucide-react";

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* DESKTOP SIDEBAR - Always visible on md+ */}
      <div className="hidden md:block">
        <Sidebar isMobile={false} />
      </div>

      {/* MOBILE SIDEBAR (DRAWER) - Overlay on mobile */}
      {isSidebarOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          
          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 z-50 md:hidden">
            <Sidebar 
              isMobile={true} 
              isOpen={isSidebarOpen}
              onClose={() => setSidebarOpen(false)} 
            />
          </div>
        </>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* MOBILE HEADER - Hamburger Button (only on mobile) */}
        <div className="md:hidden sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Open Menu"
            >
              <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
            
            <h1 className="text-lg font-bold text-green-600 dark:text-green-400">
              Bank Sampah Anambas
            </h1>
            
            {/* Spacer untuk balance layout */}
            <div className="w-10" />
          </div>
        </div>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-x-auto">
          {children}
        </main>
        
      </div>
    </div>
  );
}