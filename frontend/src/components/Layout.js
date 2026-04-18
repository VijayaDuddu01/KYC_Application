import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, House, UploadSimple, ClipboardText, ClockCounterClockwise, SignOut, Warning } from '@phosphor-icons/react';

const Layout = ({ user, onLogout, children }) => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Dashboard', icon: House },
    { path: '/upload', label: 'Upload Document', icon: UploadSimple },
    { path: '/review-queue', label: 'Review Queue', icon: ClipboardText },
    { path: '/audit-logs', label: 'Audit Logs', icon: ClockCounterClockwise },
  ];

  return (
    <div className="min-h-screen bg-white flex">
      <aside className="w-64 bg-[#111827] text-white border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck size={32} weight="duotone" />
            <h1 className="text-xl font-bold" style={{ fontFamily: 'Chivo' }}>ID Verify</h1>
          </div>
          <p className="text-xs text-gray-400" style={{ fontFamily: 'IBM Plex Mono' }}>v1.0.0</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                data-testid={`nav-${item.path.slice(1) || 'dashboard'}`}
                className={`flex items-center gap-3 px-4 py-3 rounded-none border transition-colors ${
                  active
                    ? 'bg-white text-black border-white'
                    : 'bg-transparent text-white border-transparent hover:bg-gray-800 hover:text-white'
                }`}
                style={{ fontFamily: 'IBM Plex Sans' }}
              >
                <Icon size={20} weight={active ? 'fill' : 'regular'} />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="mb-4 p-3 bg-gray-800 border border-gray-700 rounded-none">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-white text-black rounded-none flex items-center justify-center font-bold text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white truncate" style={{ fontFamily: 'IBM Plex Sans' }}>
                  {user?.name}
                </div>
                <div className="text-xs text-gray-400 truncate" style={{ fontFamily: 'IBM Plex Mono' }}>
                  {user?.email}
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            data-testid="logout-button"
            className="w-full flex items-center gap-2 px-4 py-2 bg-transparent border border-gray-600 text-white hover:bg-red-600 hover:border-red-600 hover:text-white rounded-none text-sm font-medium"
            style={{ fontFamily: 'IBM Plex Sans' }}
          >
            <SignOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;
