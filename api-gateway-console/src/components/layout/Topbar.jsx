import React, { useState } from "react";
import { Breadcrumb } from "../common/Breadcrumb";
import { useAuth } from "../../context/AuthContext";
import { Bell, User, LogOut, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export const Topbar = () => {
  const { user, logoutUser } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-20 shrink-0">
      <Breadcrumb />

      <div className="flex items-center space-x-5">
        {/* Gateway Status Pill */}
        <div className="hidden sm:flex items-center space-x-2 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-xs font-medium text-emerald-700">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>
            Gateway Status: <strong>Healthy</strong>
          </span>
        </div>

        {/* Notification Icon */}
        <button className="relative text-slate-500 hover:text-slate-700 transition-colors p-1 rounded-full hover:bg-slate-100">
          <Bell size={18} />
          <span className="absolute top-0 right-0 h-2 w-2 bg-brand-500 rounded-full"></span>
        </button>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 focus:outline-none p-1 rounded-md hover:bg-slate-50"
          >
            <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs border border-slate-300">
              {user?.username?.substring(0, 2).toUpperCase() || "GA"}
            </div>
            <div className="text-left hidden md:block">
              <div className="text-xs font-semibold text-slate-800 leading-tight">
                {user?.username || "Administrator"}
              </div>
              <div className="text-[10px] text-slate-500">GATEWAY_ADMIN</div>
            </div>
          </button>

          {dropdownOpen && (
            <div
              onMouseLeave={() => setDropdownOpen(false)}
              className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-md shadow-lg py-1 z-50 text-xs text-slate-700 animate-in fade-in zoom-in-95 duration-100"
            >
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="font-semibold">{user?.username}</p>
                <p className="text-[10px] text-slate-400 truncate">
                  {user?.email}
                </p>
              </div>
              <Link
                to="/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center space-x-2 px-4 py-2 hover:bg-slate-50 transition-colors"
              >
                <User size={14} />
                <span>Admin Profile</span>
              </Link>
              <Link
                to="/sessions"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center space-x-2 px-4 py-2 hover:bg-slate-50 transition-colors"
              >
                <Shield size={14} />
                <span>Active Sessions</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left flex items-center space-x-2 px-4 py-2 text-rose-600 hover:bg-rose-50 transition-colors border-t border-slate-100"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
