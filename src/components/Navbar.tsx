import React, { useEffect, useState, useRef } from "react";
import { Sparkles, Calendar, Wifi, WifiOff, ShieldCheck, User, LogOut, ChevronDown, Key } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase";

interface NavbarProps {
  user: { email: string; name: string } | null;
  onLogOut: () => void;
}

export default function Navbar({ user, onLogOut }: NavbarProps) {
  const [apiConnected, setApiConnected] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        setApiConnected(data.apiConfigured);
        setChecking(false);
      })
      .catch(() => {
        setApiConnected(false);
        setChecking(false);
      });
  }, []);

  // Listen to clicks outside of the profile dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Extract displaying metadata
  const displayName = user?.name || user?.email?.split("@")[0] || "Auth User";
  const displayEmail = user?.email || "authenticated-developer";

  const toggleDropdown = () => {
    setIsDropdownOpen(prev => !prev);
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 md:px-8 shadow-sm relative z-30 font-sans" id="app-navbar">
      {/* Title / Action section */}
      <div className="flex items-center space-x-2">
        <Sparkles className="h-4 w-4 text-[#2D9CDB] animate-pulse" />
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Professional Interview Suite
        </span>
      </div>

      {/* Date & User Info */}
      <div className="flex items-center space-x-6">
        {/* API connection status info */}
        <div className="hidden sm:flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-full py-1 px-3">
          {checking ? (
            <span className="text-[11px] text-slate-400 font-mono animate-pulse">probing API...</span>
          ) : apiConnected ? (
            <>
              <Wifi className="h-3.5 w-3.5 text-[#27AE60]" />
              <span className="text-[11px] font-mono font-medium text-[#27AE60] flex items-center gap-1">
                Gemini Live Connect
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#27AE60] animate-ping" />
              </span>
            </>
          ) : (
            <>
              <WifiOff className="h-3.5 w-3.5 text-[#F2994A]" />
              <span className="text-[11px] font-mono font-medium text-[#F2994A]">
                AI Sandbox (Simulation Mode)
              </span>
            </>
          )}
        </div>

        {/* Date block */}
        <div className="hidden lg:flex items-center space-x-2 text-xs text-slate-500">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span className="font-semibold text-slate-700">May 21, 2026</span>
        </div>

        {/* User profile section with custom responsive dropdown */}
        <div className="relative border-l border-slate-200 pl-6 flex items-center" ref={dropdownRef} id="nav-dropdown-area">
          <button 
            onClick={toggleDropdown}
            className="flex items-center bg-transparent gap-3 outline-none hover:bg-slate-50 pl-2 pr-3 py-1.5 rounded-xl border border-transparent hover:border-slate-100 transition-all cursor-pointer text-left focus:ring-1 focus:ring-slate-100"
            aria-haspopup="true"
            aria-expanded={isDropdownOpen}
          >
            <div className="flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-800 tracking-tight capitalize select-none max-w-[130px] truncate">
                {displayName}
              </span>
              <span className="text-[10px] text-slate-400 font-mono font-medium select-none max-w-[130px] truncate">
                {displayEmail}
              </span>
            </div>
            <div className="h-9 w-9 rounded-full bg-[#1A2B3C] border border-slate-200 flex items-center justify-center text-white relative shadow-xs">
              <User className="h-4 w-4 text-slate-200" />
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-[#27AE60] border-2 border-white flex items-center justify-center">
                <ShieldCheck className="h-2 w-2 text-white" />
              </div>
            </div>
            <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Core Interactive User dropdown panel overlay */}
          {isDropdownOpen && (
            <div 
              className="absolute right-0 top-13 w-64 bg-white border border-slate-200 rounded-xl shadow-lg py-2.5 z-40 animate-fade-in text-slate-800"
              id="active-user-dropdown"
            >
              {/* Profile Card Summary Header inside Dropdown */}
              <div className="px-4 py-2 border-b border-slate-100 pb-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Current Account</p>
                <p className="text-xs font-bold text-slate-800 mt-1 capitalize truncate">{displayName}</p>
                <p className="text-[10px] font-mono text-slate-500 truncate mt-0.5">{displayEmail}</p>
              </div>

              {/* Status and Action Menu items */}
              <div className="px-1 py-1">
                <div className="flex items-center justify-between px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 rounded-lg select-none">
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Compliance Rank</span>
                  </span>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold">
                    SECURED
                  </span>
                </div>
                
                <div className="flex items-center justify-between px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 rounded-lg select-none">
                  <span className="flex items-center gap-2">
                    <Key className="h-3.5 w-3.5 text-indigo-500 font-bold" />
                    <span>Active Session</span>
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">
                    Simulation SDK
                  </span>
                </div>
              </div>

              {/* Dynamic Action Trigger: Purge session state */}
              <div className="border-t border-slate-150 mt-1.5 pt-1.5 px-2">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onLogOut();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer text-left"
                  id="navbar-signout-btn"
                >
                  <LogOut className="h-4 w-4 text-red-500" />
                  <span>Secure Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
