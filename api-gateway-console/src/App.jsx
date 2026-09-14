import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider, useToast } from "./context/ToastContext";

// Icons
import {
  LayoutDashboard,
  Network,
  Gauge,
  ShieldAlert,
  KeyRound,
  UserCheck,
  Activity,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Bell,
  Menu,
} from "lucide-react";

// Pages Import
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RoutesList from "./pages/RoutesList";
import RouteDetail from "./pages/RouteDetail";
import BlockedClients from "./pages/BlockedClients";
import Sessions from "./pages/Sessions";
import Prometheus from "./pages/Prometheus";
import Grafana from "./pages/Grafana";
import Profile from "./pages/Profile";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

// Protected Route Guard
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading, hasRole } = useAuth();
  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        Loading Auth...
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && !hasRole(requiredRole))
    return <Navigate to="/unauthorized" replace />;
  return children;
};

const MainLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const getBreadcrumb = () => {
    const path = location.pathname.split("/").filter(Boolean);
    if (path.length === 0) return "Overview Dashboard";
    return path.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" / ");
  };

  const menuGroups = [
    {
      title: "API GATEWAY",
      items: [
        { label: "Overview", icon: LayoutDashboard, path: "/dashboard" },
        { label: "Routes", icon: Network, path: "/routes" },
        {
          label: "Blocked Clients",
          icon: ShieldAlert,
          path: "/blocked-clients",
        },
      ],
    },
    {
      title: "AUTHENTICATION",
      items: [{ label: "Sessions", icon: KeyRound, path: "/sessions" }],
    },
    {
      title: "MONITORING",
      items: [
        { label: "Prometheus", icon: Activity, path: "/monitoring/prometheus" },
        { label: "Grafana", icon: BarChart3, path: "/monitoring/grafana" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="h-14 bg-white border-b border-slate-200 fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden text-slate-600 hover:text-slate-900"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 text-white font-bold px-2 py-1 rounded text-xs tracking-wider">
              GATEWAY
            </div>
            <span className="font-semibold text-slate-800 text-sm hidden sm:inline">
              Console
            </span>
          </div>
          <span className="text-slate-300">|</span>
          <span className="text-xs text-slate-500 font-medium tracking-tight">
            {getBreadcrumb()}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Health Status Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-700">
              Gateway: Healthy
            </span>
          </div>

          <button className="text-slate-500 hover:text-slate-700 relative p-1">
            <Bell className="w-4 h-4" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-blue-600 rounded-full" />
          </button>

          {/* Admin User Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 border border-slate-200 p-1 pl-2 rounded-md hover:bg-slate-50"
            >
              <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold">
                {user?.username?.charAt(0).toUpperCase() || "A"}
              </div>
              <span className="text-xs font-medium text-slate-700 hidden md:inline">
                {user?.username}
              </span>
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-slate-200 py-1 z-50 text-xs">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="font-semibold text-slate-800">
                    {user?.username}
                  </p>
                  <p className="text-slate-400 text-[11px] truncate">
                    {user?.email}
                  </p>
                  <span className="inline-block mt-1 px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-mono">
                    {user?.roles?.[0] || "GATEWAY_ADMIN"}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate("/profile");
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                >
                  <User className="w-3.5 h-3.5" /> Profile Settings
                </button>
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate("/sessions");
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                >
                  <KeyRound className="w-3.5 h-3.5" /> Active Sessions
                </button>
                <div className="border-t border-slate-100 my-1" />
                <button
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex pt-14 flex-1">
        {/* Left Sidebar Desktop */}
        <aside
          className={`bg-slate-900 text-slate-300 border-r border-slate-800 transition-all duration-200 hidden lg:flex flex-col fixed left-0 top-14 bottom-0 z-20 ${collapsed ? "w-16" : "w-64"}`}
        >
          <div className="flex-1 py-4 space-y-6 overflow-y-auto px-3">
            {menuGroups.map((group, idx) => (
              <div key={idx}>
                {!collapsed && (
                  <p className="text-[10px] font-bold text-slate-500 px-3 mb-2 tracking-wider">
                    {group.title}
                  </p>
                )}
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        title={collapsed ? item.label : ""}
                        className={`flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                          active
                            ? "bg-blue-600 text-white font-semibold"
                            : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        {!collapsed && <span>{item.label}</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          {/* Collapse Toggle Footer */}
          <div className="p-3 border-t border-slate-800 flex justify-end">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400"
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>
        </aside>

        {/* Dynamic Main Body Content */}
        <main
          className={`flex-1 p-6 transition-all duration-200 ${collapsed ? "lg:ml-16" : "lg:ml-64"}`}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            <Route
              path="/"
              element={
                <ProtectedRoute requiredRole="GATEWAY_ADMIN">
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requiredRole="GATEWAY_ADMIN">
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/routes"
              element={
                <ProtectedRoute requiredRole="GATEWAY_ADMIN">
                  <MainLayout>
                    <RoutesList />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/routes/:routeId"
              element={
                <ProtectedRoute requiredRole="GATEWAY_ADMIN">
                  <MainLayout>
                    <RouteDetail />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/blocked-clients"
              element={
                <ProtectedRoute requiredRole="GATEWAY_ADMIN">
                  <MainLayout>
                    <BlockedClients />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/sessions"
              element={
                <ProtectedRoute requiredRole="GATEWAY_ADMIN">
                  <MainLayout>
                    <Sessions />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/monitoring/prometheus"
              element={
                <ProtectedRoute requiredRole="GATEWAY_ADMIN">
                  <MainLayout>
                    <Prometheus />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/monitoring/grafana"
              element={
                <ProtectedRoute requiredRole="GATEWAY_ADMIN">
                  <MainLayout>
                    <Grafana />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute requiredRole="GATEWAY_ADMIN">
                  <MainLayout>
                    <Profile />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}
