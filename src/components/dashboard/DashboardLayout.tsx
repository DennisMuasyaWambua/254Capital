import React, { useState, ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { 
  LogOut, 
  Home, 
  FileSpreadsheet, 
  Users, 
  Settings, 
  Menu, 
  X,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  // Navigation items for the sidebar
  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: <Home size={20} /> },
    { name: 'Loan Applications', href: '/dashboard/applications', icon: <FileSpreadsheet size={20} /> },
    { name: 'Team', href: '/dashboard/team', icon: <Users size={20} /> },
    { name: 'Settings', href: '/dashboard/settings', icon: <Settings size={20} /> },
  ];

  // Function to toggle the sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Function to toggle the mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 transition-opacity lg:hidden" 
          onClick={toggleMobileMenu}
          aria-hidden="true"
        ></div>
      )}

      {/* Mobile sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 flex flex-col bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:hidden
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <img src="/254-capital-logo.jpg" alt="254 Capital" className="h-8" />
          </div>
          <button 
            onClick={toggleMobileMenu}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Close sidebar"
          >
            <X size={24} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <nav className="px-3 py-4 space-y-1">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-[#48A7A7]/10 text-[#48A7A7]' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-[#48A7A7]'}
                  `}
                >
                  <div className={`mr-3 ${isActive ? 'text-[#48A7A7]' : 'text-gray-500 group-hover:text-[#48A7A7]'}`}>
                    {item.icon}
                  </div>
                  {item.name}
                  {isActive && <ChevronRight className="ml-auto h-5 w-5 text-[#48A7A7]" />}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-[#48A7A7] flex items-center justify-center text-white font-semibold">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{user?.email?.split('@')[0] || 'User'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
            </div>
          </div>
          <Link 
            to="/"
            className="w-full bg-[#48A7A7] hover:bg-[#48A7A7]/90 text-white rounded-md px-4 py-2 text-sm flex items-center justify-center space-x-2 mb-3"
          >
            <ExternalLink size={16} />
            <span>Back to Website</span>
          </Link>
          <Button
            onClick={handleSignOut}
            disabled={loading}
            className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg px-4 py-2 text-sm transition-all duration-200 ease-in-out hover:shadow-sm flex items-center justify-center space-x-2"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className={`
        hidden lg:flex lg:flex-col lg:flex-shrink-0 bg-white shadow-lg transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'lg:w-72' : 'lg:w-20'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          {sidebarOpen ? (
            <>
              <div className="flex items-center">
                <img src="/254-capital-logo.jpg" alt="254 Capital" className="h-8" />
              </div>
              <button 
                onClick={toggleSidebar}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label="Collapse sidebar"
              >
                <ChevronRight size={20} />
              </button>
            </>
          ) : (
            <button 
              onClick={toggleSidebar}
              className="mx-auto text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label="Expand sidebar"
            >
              <Menu size={20} />
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          <nav className="px-3 py-4 space-y-1">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-[#48A7A7]/10 text-[#48A7A7]' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-[#48A7A7]'}
                  `}
                  title={sidebarOpen ? '' : item.name}
                >
                  <div className={`${isActive ? 'text-[#48A7A7]' : 'text-gray-500 group-hover:text-[#48A7A7]'} ${!sidebarOpen && 'mx-auto'}`}>
                    {item.icon}
                  </div>
                  {sidebarOpen && (
                    <>
                      <span className="ml-3">{item.name}</span>
                      {isActive && <ChevronRight className="ml-auto h-5 w-5 text-[#48A7A7]" />}
                    </>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
        {sidebarOpen ? (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-[#48A7A7] flex items-center justify-center text-white font-semibold">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{user?.email?.split('@')[0] || 'User'}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
              </div>
            </div>
            <Button
              onClick={handleSignOut}
              disabled={loading}
              className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg px-4 py-2 text-sm transition-all duration-200 ease-in-out hover:shadow-sm flex items-center justify-center space-x-2"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </Button>
          </div>
        ) : (
          <div className="p-4 border-t border-gray-200 flex justify-center">
            <button
              onClick={handleSignOut}
              disabled={loading}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
              title="Sign Out"
            >
              <LogOut size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Dashboard Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between h-16 px-4 md:px-6">
            <div className="flex items-center">
              <button 
                onClick={toggleMobileMenu}
                className="lg:hidden text-gray-500 hover:text-gray-700 focus:outline-none mr-3"
                aria-label="Open sidebar"
              >
                <Menu size={24} />
              </button>
              <h1 className="text-xl font-bold text-gray-900">
                {navigationItems.find(item => item.href === location.pathname)?.name || 'Dashboard'}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/" 
                className="bg-[#48A7A7] hover:bg-[#48A7A7]/90 text-white rounded-md px-4 py-2 text-sm flex items-center gap-2"
              >
                <ExternalLink size={16} />
                Back to Website
              </Link>

              <div className="hidden md:flex items-center">
                <div className="h-8 w-8 rounded-full bg-[#48A7A7] flex items-center justify-center text-white font-semibold">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">{user?.email?.split('@')[0] || 'User'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
