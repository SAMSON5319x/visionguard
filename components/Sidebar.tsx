
import React from 'react';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  Bell, 
  Settings, 
  MapPin, 
  ShieldAlert,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  accessibilityMode: boolean;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, accessibilityMode, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'tracking', icon: MapIcon, label: 'Live Tracking' },
    { id: 'alerts', icon: Bell, label: 'Alert History' },
    { id: 'locations', icon: MapPin, label: 'Saved Locations' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className={`w-64 h-screen flex flex-col border-r shadow-sm transition-colors duration-200 ${accessibilityMode ? 'bg-black border-white' : 'bg-white border-slate-200'}`}>
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <ShieldAlert className="text-white" />
          </div>
          <h1 className={`text-xl font-bold tracking-tight ${accessibilityMode ? 'text-white' : 'text-slate-900'}`}>
            VisionGuard
          </h1>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${isActive 
                  ? (accessibilityMode ? 'bg-white text-black' : 'bg-blue-50 text-blue-600') 
                  : (accessibilityMode ? 'text-white hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-50')
                }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <item.icon className={`w-5 h-5 ${isActive ? '' : 'opacity-70'}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button 
          onClick={onLogout}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200
          ${accessibilityMode ? 'text-white hover:bg-red-900' : 'text-slate-600 hover:bg-red-50 hover:text-red-600'}`}>
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
