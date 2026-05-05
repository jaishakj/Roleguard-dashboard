import React from 'react';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { AdminDashboard, EditorDashboard, ViewerDashboard } from './components/Dashboards';
import { LogOut, LayoutDashboard, User as UserIcon, Shield, Trash2, Github, Loader2 } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

function AppContent() {
  const { user, profile, loading, login, logout, deleteAccount } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center space-y-8"
        >
          <div className="space-y-2">
            <div className="inline-flex items-center justify-center p-3 bg-indigo-50 rounded-2xl mb-4">
              <Shield className="w-10 h-10 text-indigo-600" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
              RoleGuard
            </h1>
            <p className="text-lg text-gray-500">
              Secure, role-based dashboard for your essential records.
            </p>
          </div>

          <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 shadow-sm">
            <button
              onClick={login}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all duration-200 shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                />
              </svg>
              Sign in with Google
            </button>
            <p className="mt-4 text-xs text-gray-400">
              Only verified users can access the dashboard.
              <br />Admin role assigned to jaishak2003@gmail.com
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  const renderDashboard = () => {
    switch (profile?.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'editor':
        return <EditorDashboard />;
      case 'viewer':
      default:
        return <ViewerDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-indigo-600" />
                <span className="font-bold text-xl tracking-tight text-gray-900">RoleGuard</span>
              </div>
              <div className="hidden md:flex items-center gap-1 bg-gray-50 p-1 rounded-lg">
                <button className="px-3 py-1.5 text-sm font-medium bg-white text-gray-900 rounded-md shadow-sm border border-gray-100 flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || ''} referrerPolicy="no-referrer" />
                  ) : (
                    <UserIcon className="w-4 h-4 text-indigo-600" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-gray-900 leading-none">{user.displayName}</span>
                  <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider mt-0.5">{profile?.role}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={deleteAccount}
                  title="Delete Account"
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={profile?.role}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderDashboard()}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
        <div className="text-sm text-gray-500">
          © 2026 RoleGuard Security Systems. All rights reserved.
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="text-sm text-gray-500 hover:text-gray-900">Privacy Policy</a>
          <a href="#" className="text-sm text-gray-500 hover:text-gray-900">Terms of Service</a>
          <div className="h-4 w-px bg-gray-200"></div>
          <p className="text-xs font-mono text-gray-400">v1.2.0-stable</p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster position="bottom-right" />
    </AuthProvider>
  );
}
