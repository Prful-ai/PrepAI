import React from "react";
import { 
  LayoutDashboard, 
  Video, 
  FileQuestion, 
  FileText, 
  FileSpreadsheet, 
  Settings, 
  HelpCircle,
  Menu,
  X,
  GraduationCap
} from "lucide-react";

interface SidebarProps {
  currentTab: string;
  onChangeTab: (tab: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ currentTab, onChangeTab, isOpen, onToggle }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "mock-interview", label: "AI Mock Interview", icon: Video, badge: "Live AI" },
    { id: "question-bank", label: "AI Question Bank", icon: FileQuestion },
    { id: "resume-scanner", label: "Resume Scanner", icon: FileText },
    { id: "transcript-analyzer", label: "Transcript Analyzer", icon: FileSpreadsheet },
  ];

  return (
    <>
      {/* Mobile Navbar Toggle */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button 
          onClick={onToggle}
          className="p-2 rounded-lg bg-[#1A2B3C] text-white shadow-lg border border-slate-700 hover:bg-slate-800 transition-colors"
          aria-label="Toggle Menu"
          id="mobile-sidebar-toggle"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40"
          onClick={onToggle}
          id="sidebar-backdrop"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        id="app-sidebar"
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#1A2B3C] border-r border-slate-800 flex flex-col justify-between text-slate-300 transition-transform duration-300 transform 
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 md:static md:h-screen`}
      >
        <div>
          {/* Header & Brand */}
          <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
            <div className="bg-[#2D9CDB] p-2.5 rounded-lg flex items-center justify-center text-white shadow-md shadow-[#2D9CDB]/20">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-sans font-bold text-white text-base leading-tight tracking-wide">
                Interviewer.AI
              </h1>
              <p className="font-mono text-[10px] text-slate-400 tracking-wider uppercase">
                Talent Intelligence
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 focus:outline-none">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`sidebar-tab-${item.id}`}
                  onClick={() => {
                    onChangeTab(item.id);
                    if (window.innerWidth < 768) {
                      onToggle();
                    }
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium relative group
                    ${isActive 
                      ? "bg-slate-800 text-white border-l-4 border-[#2D9CDB]" 
                      : "hover:bg-slate-800/55 hover:text-white"}`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-4 w-4 transition-colors ${isActive ? "text-[#2D9CDB]" : "text-slate-400 group-hover:text-slate-200"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-[#27AE60] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse uppercase tracking-tight">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Action / Help Section Footer */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button 
            id="sidebar-help-btn"
            onClick={() => alert("Interviewer.AI helps candidates scan resumes, craft custom question banks, practice mock interviews, and evaluate transcript outputs using state-of-the-art AI intelligence.")}
            className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 text-xs transition-colors"
          >
            <HelpCircle className="h-4 w-4" />
            <span>Product Help & Tour</span>
          </button>
          
          <div className="flex items-center space-x-3 px-4 py-2.5 rounded-lg bg-slate-800/30 border border-slate-800/70">
            <div className="h-2 w-2 rounded-full bg-[#27AE60] animate-pulse" />
            <div className="text-[11px] text-slate-400">
              <span className="font-medium text-slate-300 block">Core VM Connected</span>
              Uptime: 100% active
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
