
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import LiveMap from './components/LiveMap';
import { MOCK_ALERTS, MOCK_DEVICE, MOCK_LOCATIONS } from './constants';
import { AlertType, DeviceStatus, Alert, DeviceHealth, SavedLocation, AccessibilitySettings } from './types';
import { 
  Battery, 
  Signal, 
  MapPin, 
  Smartphone, 
  Bell, 
  ShieldAlert,
  ChevronRight,
  Plus,
  Moon,
  Sun,
  Type as TypeIcon,
  Activity,
  User as UserIcon,
  Camera,
  Heart,
  Radar,
  Save,
  Navigation,
  RefreshCw,
  Clock,
  ExternalLink,
  ChevronDown,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Settings
} from 'lucide-react';
import { getSafetyInsights } from './services/geminiService';

interface UserProfile {
  name: string;
  photo: string | null;
  careInstructions: string;
  age: string;
  bloodType: string;
}

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [device, setDevice] = useState<DeviceHealth>(MOCK_DEVICE);
  const [locations, setLocations] = useState<SavedLocation[]>(MOCK_LOCATIONS);
  const [userPos, setUserPos] = useState({ lat: 40.7128, lng: -74.0060 });
  const [isAuth, setIsAuth] = useState(false);
  const [safetyInsights, setSafetyInsights] = useState<string>('Analyzing behavior and location data for safety recommendations...');
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  
  const [editingGeofence, setEditingGeofence] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'John Doe',
    photo: null,
    careInstructions: 'Requires assistance in crowded areas. Prefers audio feedback for navigation. Has a guide dog named Buster.',
    age: '65',
    bloodType: 'O+'
  });

  const [accSettings, setAccSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    largeFont: false,
    screenReaderOptimized: true
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setUserPos(prev => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.001,
        lng: prev.lng + (Math.random() - 0.5) * 0.001
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    locations.forEach(loc => {
      if (loc.geofenceEnabled && loc.geofenceRadius) {
        const distance = getDistance(userPos.lat, userPos.lng, loc.lat, loc.lng);
        if (distance > loc.geofenceRadius) {
          const fiveMinAgo = Date.now() - 300000;
          const existingAlert = alerts.find(a => 
            a.type === AlertType.GEOFENCE && a.status === 'Pending' && a.location.includes(loc.name) &&
            new Date(a.timestamp).getTime() > fiveMinAgo
          );
          if (!existingAlert) {
            const newAlert: Alert = {
              id: Math.random().toString(36).substr(2, 9),
              type: AlertType.GEOFENCE,
              timestamp: new Date().toISOString(),
              location: `Exited safe zone: ${loc.name}`,
              lat: userPos.lat,
              lng: userPos.lng,
              status: 'Pending',
              severity: 'Critical'
            };
            setAlerts(prev => [newAlert, ...prev]);
          }
        }
      }
    });
  }, [userPos, locations, alerts]);

  const refreshInsights = async () => {
    setIsLoadingInsights(true);
    const insight = await getSafetyInsights(alerts, userPos);
    setSafetyInsights(insight || "AI is currently processing movement patterns.");
    setIsLoadingInsights(false);
  };

  useEffect(() => {
    if (isAuth) refreshInsights();
  }, [isAuth]);

  const resolveAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'Resolved' } : a));
  };

  const toggleHighContrast = () => setAccSettings(p => ({ ...p, highContrast: !p.highContrast }));
  const toggleLargeFont = () => setAccSettings(p => ({ ...p, largeFont: !p.largeFont }));

  const handleLogout = () => {
    setIsAuth(false);
    setActiveTab('dashboard');
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl p-10 space-y-8 border border-slate-100">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-blue-200 rotate-3">
              <ShieldAlert className="text-white w-10 h-10 -rotate-3" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">VisionGuard</h1>
              <p className="text-slate-500 font-medium">Empowering Caregivers, Securing Lives</p>
            </div>
          </div>
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 ml-1">Guardian Email</label>
              <input type="email" defaultValue="caregiver@visionguard.com" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 ml-1">Access Token</label>
              <input type="password" defaultValue="********" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" />
            </div>
            <button onClick={() => setIsAuth(true)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98]">
              Enter Dashboard
            </button>
          </div>
          <p className="text-center text-xs text-slate-400 font-medium">Secure biometric login available on mobile</p>
        </div>
      </div>
    );
  }

  const containerClasses = `flex min-h-screen transition-colors duration-300 ${accSettings.highContrast ? 'high-contrast' : 'bg-slate-50'} ${accSettings.largeFont ? 'large-font' : ''}`;

  return (
    <div className={`${containerClasses} flex-col md:flex-row`}>
      <div className="hidden md:block">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          accessibilityMode={accSettings.highContrast}
          onLogout={handleLogout}
        />
      </div>


      <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h2 className={`text-3xl font-black tracking-tight ${accSettings.highContrast ? 'text-white' : 'text-slate-900'}`}>
              {activeTab === 'dashboard' && 'Dashboard Overview'}
              {activeTab === 'tracking' && 'Real-time GPS Tracking'}
              {activeTab === 'alerts' && 'Alert Management'}
              {activeTab === 'locations' && 'Safe Zone Management'}
              {activeTab === 'settings' && 'System Configuration'}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              <p className={`text-sm font-medium ${accSettings.highContrast ? 'text-white/70' : 'text-slate-500'}`}>
                Monitoring active for <span className="font-bold text-blue-600">{userProfile.name}</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
             <button onClick={toggleHighContrast} className={`flex-1 md:flex-none p-3.5 rounded-2xl border transition-all ${accSettings.highContrast ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400 shadow-sm'}`}>
              {accSettings.highContrast ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </button>
            <button onClick={toggleLargeFont} className={`flex-1 md:flex-none p-3.5 rounded-2xl border transition-all ${accSettings.largeFont ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400 shadow-sm'}`}>
              <TypeIcon className="w-6 h-6" />
            </button>
            <div className={`flex items-center gap-4 px-5 py-2.5 rounded-2xl border ${accSettings.highContrast ? 'border-white text-white shadow-[0_0_20px_rgba(255,255,255,0.1)]' : 'bg-white border-slate-200 text-slate-700 shadow-sm'}`}>
              <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div className="hidden lg:block">
                <p className="text-xs font-black uppercase tracking-widest opacity-40">Guardian</p>
                <p className="text-sm font-bold leading-tight">Sarah Wilson</p>
              </div>
            </div>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard label="Battery Level" value={`${device.battery}%`} icon={Battery} status={device.battery < 20 ? 'critical' : 'good'} contrast={accSettings.highContrast} />
              <StatCard label="GPS Signal" value="Strong" icon={Signal} status="good" contrast={accSettings.highContrast} />
              <StatCard label="Connectivity" value={device.status} icon={Smartphone} status={device.status === 'Online' ? 'good' : 'bad'} contrast={accSettings.highContrast} />
              <StatCard label="Pending Alerts" value={alerts.filter(a => a.status === 'Pending').length.toString()} icon={ShieldAlert} status={alerts.filter(a => a.status === 'Pending').length > 0 ? 'bad' : 'good'} contrast={accSettings.highContrast} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className={`lg:col-span-8 rounded-[2.5rem] p-8 border shadow-xl ${accSettings.highContrast ? 'bg-black border-white' : 'bg-white border-slate-100 shadow-slate-200/50'}`}>
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-black flex items-center gap-3"><MapPin className="text-blue-600 w-6 h-6" /> Recent Path</h3>
                  <button onClick={() => setActiveTab('tracking')} className="text-sm text-blue-600 font-black flex items-center gap-1 group">Full Screen Tracking <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></button>
                </div>
                <div className="h-[300px] sm:h-[400px] lg:h-[450px] relative overflow-hidden rounded-3xl border border-slate-100">
                  <LiveMap location={userPos} accessibilityMode={accSettings.highContrast} geofences={locations} />
                </div>
              </div>

              <div className="lg:col-span-4 space-y-10">
                <div className={`rounded-[2.5rem] p-8 border shadow-xl relative overflow-hidden ${accSettings.highContrast ? 'bg-black border-white text-white' : 'bg-blue-600 text-white shadow-blue-200'}`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black flex items-center gap-3"><Activity className="w-6 h-6" /> AI Health Insight</h3>
                    <button 
                      onClick={refreshInsights} 
                      disabled={isLoadingInsights}
                      className={`p-2 rounded-xl transition-all ${accSettings.highContrast ? 'hover:bg-white/20' : 'hover:bg-white/10'} ${isLoadingInsights ? 'animate-spin' : ''}`}
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>
                  </div>
                  <div className={`p-5 rounded-2xl backdrop-blur-md ${accSettings.highContrast ? 'bg-white/20 border border-white/30' : 'bg-white/10 border border-white/20'}`}>
                    <p className="text-sm font-medium leading-relaxed italic">
                      "{isLoadingInsights ? 'Thinking...' : safetyInsights}"
                    </p>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] mt-6 opacity-60">Verified by Gemini AI Core</p>
                </div>

                <div className={`rounded-[2.5rem] p-8 border shadow-xl ${accSettings.highContrast ? 'bg-black border-white' : 'bg-white border-slate-100'}`}>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black">Active Alerts</h3>
                    <button onClick={() => setActiveTab('alerts')} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"><ChevronRight className="w-5 h-5" /></button>
                  </div>
                  <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                    {alerts.filter(a => a.status === 'Pending').length === 0 ? (
                      <div className="text-center py-10">
                        <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-3" />
                        <p className="text-sm font-bold opacity-40">All Clear</p>
                      </div>
                    ) : (
                      alerts.filter(a => a.status === 'Pending').map(alert => (
                        <div key={alert.id} className={`p-5 rounded-2xl border-2 transition-all ${alert.severity === 'Critical' ? 'border-red-500 bg-red-50/20' : 'border-orange-400 bg-orange-50/20'}`}>
                          <div className="flex justify-between items-start mb-3">
                            <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${alert.severity === 'Critical' ? 'bg-red-600 text-white' : 'bg-orange-600 text-white'}`}>{alert.type}</span>
                            <span className="text-[10px] font-bold opacity-40 flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(alert.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                          <p className="text-sm font-extrabold mb-4">{alert.location}</p>
                          <button onClick={() => resolveAlert(alert.id)} className="w-full py-2.5 bg-white border border-slate-200 text-slate-900 text-xs font-black rounded-xl hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm active:scale-95">Resolve</button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tracking' && (
          <div className="h-[75vh] grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 h-full relative group">
              <div className="absolute inset-0 shadow-2xl rounded-[3rem] overflow-hidden">
                <LiveMap location={userPos} accessibilityMode={accSettings.highContrast} geofences={locations} showTrail={true} />
              </div>
            </div>
            <div className="space-y-6">
              <div className={`p-8 rounded-[2rem] border shadow-xl ${accSettings.highContrast ? 'bg-black border-white' : 'bg-white border-slate-100'}`}>
                <h4 className="text-lg font-black mb-6 flex items-center gap-2"><Navigation className="text-blue-600 w-5 h-5" /> Live Coordinates</h4>
                <div className="space-y-6">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 font-mono">
                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Latitude</p>
                    <p className="text-lg font-black">{userPos.lat.toFixed(6)}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 font-mono">
                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Longitude</p>
                    <p className="text-lg font-black">{userPos.lng.toFixed(6)}</p>
                  </div>
                  <div className="pt-2 flex flex-col gap-3">
                    <button className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg shadow-slate-200 active:scale-95">
                      <ExternalLink className="w-4 h-4" /> Open in Maps
                    </button>
                    <button className="w-full py-4 bg-white border border-slate-200 text-slate-900 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm active:scale-95">
                      <RefreshCw className="w-4 h-4" /> Recenter View
                    </button>
                  </div>
                </div>
              </div>
              <div className={`p-8 rounded-[2rem] border shadow-xl ${accSettings.highContrast ? 'bg-black border-white' : 'bg-white border-slate-100'}`}>
                <h4 className="text-lg font-black mb-4">Device Health</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3">
                    <span className="text-sm font-bold opacity-60">Status</span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase">Active</span>
                  </div>
                  <div className="flex justify-between items-center p-3">
                    <span className="text-sm font-bold opacity-60">Latency</span>
                    <span className="text-sm font-black">42ms</span>
                  </div>
                  <div className="flex justify-between items-center p-3">
                    <span className="text-sm font-bold opacity-60">Uptime</span>
                    <span className="text-sm font-black">12d 4h</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className={`rounded-[2.5rem] p-10 border shadow-2xl ${accSettings.highContrast ? 'bg-black border-white' : 'bg-white border-slate-100'}`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
                <h3 className="text-2xl font-black tracking-tight">System Incident Logs</h3>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                   <div className="relative flex-1 sm:flex-none">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select className={`pl-10 pr-6 py-3.5 rounded-2xl border appearance-none font-bold text-sm min-w-[140px] ${accSettings.highContrast ? 'bg-black border-white text-white' : 'bg-slate-50 border-slate-200'}`}>
                      <option>All Types</option>
                      <option>SOS</option>
                      <option>Geofence</option>
                      <option>System</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                  <button className="px-6 py-3.5 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-xl active:scale-95 transition-all">Export CSV</button>
                </div>
              </div>
              
              <div className="overflow-x-auto rounded-3xl border border-slate-50 shadow-inner">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`border-b text-xs font-black uppercase tracking-[0.2em] ${accSettings.highContrast ? 'border-white' : 'bg-slate-50/50 text-slate-400'}`}>
                      <th className="px-8 py-6">Incident Type</th>
                      <th className="px-8 py-6">Coordinates / Location</th>
                      <th className="px-8 py-6">Timestamp</th>
                      <th className="px-8 py-6">Risk Level</th>
                      <th className="px-8 py-6">Current Status</th>
                      <th className="px-8 py-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${accSettings.highContrast ? 'divide-white' : 'divide-slate-50'}`}>
                    {alerts.map(alert => (
                      <tr key={alert.id} className={`group transition-all hover:bg-slate-50/50`}>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${alert.type === AlertType.SOS ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                              <AlertTriangle className="w-5 h-5" />
                            </div>
                            <span className="font-bold">{alert.type}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-sm font-bold text-slate-800 line-clamp-1">{alert.location}</p>
                          <p className="text-[10px] font-mono opacity-40 mt-1 uppercase">ID: {alert.id.toUpperCase()}</p>
                        </td>
                        <td className="px-8 py-6 font-medium text-slate-500 text-sm">
                          {new Date(alert.timestamp).toLocaleDateString()} at {new Date(alert.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${alert.severity === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                            {alert.severity}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${alert.status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-600'}`}>
                            {alert.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          {alert.status === 'Pending' ? (
                            <button onClick={() => resolveAlert(alert.id)} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-200 active:scale-95 transition-all">Resolve Incident</button>
                          ) : (
                            <div className="flex justify-end gap-2 text-slate-300">
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                              <span className="text-xs font-bold uppercase">Archived</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'locations' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {locations.map(loc => (
              <div key={loc.id} className={`group rounded-[2.5rem] p-8 border shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${accSettings.highContrast ? 'bg-black border-white' : 'bg-white border-slate-100'}`}>
                <div className="flex justify-between items-start mb-8">
                  <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-colors ${accSettings.highContrast ? 'bg-white text-black' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'}`}>
                    <MapPin className="w-8 h-8" />
                  </div>
                  <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${loc.geofenceEnabled ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    <Radar className="w-4 h-4" />
                    {loc.geofenceEnabled ? 'ACTIVE' : 'OFF'}
                  </div>
                </div>
                <h4 className="text-2xl font-black mb-2 tracking-tight">{loc.name}</h4>
                <p className="text-sm font-medium opacity-50 mb-8 line-clamp-2 leading-relaxed">{loc.address}</p>
                
                {editingGeofence === loc.id ? (
                  <div className="space-y-6 p-6 rounded-3xl bg-slate-50 mb-4 border-2 border-blue-500 animate-in zoom-in-95 duration-200">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Security Radius</label>
                        <span className="text-lg font-black text-blue-600">{loc.geofenceRadius}m</span>
                      </div>
                      <input type="range" min="50" max="2000" step="50" value={loc.geofenceRadius || 100} onChange={(e) => setLocations(prev => prev.map(l => l.id === loc.id ? { ...l, geofenceRadius: parseInt(e.target.value) } : l))} className="w-full h-3 bg-blue-100 rounded-full appearance-none cursor-pointer accent-blue-600" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                      <span className="text-sm font-extrabold">Active Alerting</span>
                      <button onClick={() => setLocations(prev => prev.map(l => l.id === loc.id ? { ...l, geofenceEnabled: !l.geofenceEnabled } : l))} className={`w-14 h-7 rounded-full transition-all duration-300 p-1 ${loc.geofenceEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}>
                        <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${loc.geofenceEnabled ? 'translate-x-7' : 'translate-x-0'}`} />
                      </button>
                    </div>
                    <button onClick={() => setEditingGeofence(null)} className="w-full py-4 bg-slate-900 text-white rounded-2xl text-sm font-black flex items-center justify-center gap-2 shadow-xl hover:bg-black active:scale-95 transition-all"><Save className="w-4 h-4" /> Finalize Zone</button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button onClick={() => setEditingGeofence(loc.id)} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-sm font-black shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all">Configure Security</button>
                    <button className="p-4 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all text-slate-400 hover:text-slate-900 shadow-sm"><Settings className="w-5 h-5" /></button>
                  </div>
                )}
              </div>
            ))}
            <button className={`rounded-[2.5rem] border-4 border-dashed flex flex-col items-center justify-center p-12 transition-all duration-300 ${accSettings.highContrast ? 'border-white text-white hover:bg-slate-900' : 'border-slate-200 text-slate-400 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600'}`}>
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Plus className="w-8 h-8" />
              </div>
              <span className="text-xl font-black">Register New Location</span>
              <p className="text-xs font-bold opacity-60 mt-2">Home, Work, or Medical Facility</p>
            </button>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-500 pb-20">
            <div className={`rounded-[3rem] p-10 border shadow-2xl ${accSettings.highContrast ? 'bg-black border-white text-white' : 'bg-white border-slate-100'}`}>
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-2xl font-black">Monitored User Profile</h3>
                  <p className="text-sm font-medium opacity-50">Identity and special care requirements.</p>
                </div>
                <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
                  <Heart className="w-6 h-6 fill-current" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                <div className="md:col-span-4 flex flex-col items-center gap-6">
                  <div className={`w-48 h-48 rounded-[3rem] flex items-center justify-center border-4 border-dashed relative group transition-all overflow-hidden ${accSettings.highContrast ? 'border-white' : 'border-slate-100 bg-slate-50 hover:border-blue-300'}`}>
                    <div className="text-center group-hover:scale-110 transition-transform duration-300">
                      <Camera className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Upload Identity</span>
                    </div>
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                  </div>
                  <p className="text-center text-[10px] font-bold opacity-40 leading-relaxed max-w-[150px]">Identifiable photo for emergency responders.</p>
                </div>

                <div className="md:col-span-8 space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Full Name</label>
                      <input type="text" value={userProfile.name} onChange={(e) => setUserProfile({...userProfile, name: e.target.value})} className={`w-full px-6 py-4 rounded-2xl border font-bold ${accSettings.highContrast ? 'bg-black border-white' : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100'} transition-all outline-none`} />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Age</label>
                        <input type="text" value={userProfile.age} onChange={(e) => setUserProfile({...userProfile, age: e.target.value})} className={`w-full px-6 py-4 rounded-2xl border font-bold ${accSettings.highContrast ? 'bg-black border-white' : 'bg-slate-50 border-slate-200'} transition-all outline-none`} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Blood</label>
                        <input type="text" value={userProfile.bloodType} onChange={(e) => setUserProfile({...userProfile, bloodType: e.target.value})} className={`w-full px-6 py-4 rounded-2xl border font-bold ${accSettings.highContrast ? 'bg-black border-white' : 'bg-slate-50 border-slate-200'} transition-all outline-none`} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Special Care Protocol</label>
                    <textarea value={userProfile.careInstructions} onChange={(e) => setUserProfile({...userProfile, careInstructions: e.target.value})} className={`w-full px-6 py-4 rounded-2xl border font-medium text-sm min-h-[140px] leading-relaxed ${accSettings.highContrast ? 'bg-black border-white' : 'bg-slate-50 border-slate-200'} transition-all outline-none`} />
                  </div>
                  <button className="px-10 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black shadow-2xl hover:bg-black active:scale-95 transition-all">Synchronize Profiles</button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className={`rounded-[3rem] p-10 border shadow-2xl ${accSettings.highContrast ? 'bg-black border-white text-white' : 'bg-white border-slate-100'}`}>
                <h3 className="text-2xl font-black mb-8">Accessibility</h3>
                <div className="space-y-10">
                  <SettingToggle label="Contrast" desc="High contrast UI for vision impairment." checked={accSettings.highContrast} onChange={toggleHighContrast} contrast={accSettings.highContrast} />
                  <SettingToggle label="Text Scale" desc="Boost font size for readability." checked={accSettings.largeFont} onChange={toggleLargeFont} contrast={accSettings.highContrast} />
                  <SettingToggle label="Haptics" desc="Browser vibration on alerts." checked={true} onChange={() => {}} contrast={accSettings.highContrast} />
                </div>
              </div>

              <div className={`rounded-[3rem] p-10 border shadow-2xl ${accSettings.highContrast ? 'bg-black border-white text-white' : 'bg-white border-slate-100'}`}>
                <h3 className="text-2xl font-black mb-8">Emergency Relay</h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Relay Contact</label>
                    <input type="text" defaultValue="+1 (555) 012-3456" className={`w-full px-6 py-4 rounded-2xl border font-bold ${accSettings.highContrast ? 'bg-black border-white' : 'bg-slate-50 border-slate-200'}`} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">SMS Template</label>
                    <textarea defaultValue="URGENT: VisionGuard device owner John Doe has triggered an SOS. Coordinates: [LINK]" className={`w-full px-6 py-4 rounded-2xl border font-medium text-xs min-h-[100px] leading-relaxed ${accSettings.highContrast ? 'bg-black border-white' : 'bg-slate-50 border-slate-200'}`} />
                  </div>
                  <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-100 active:scale-95 transition-all">Test Relay System</button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-slate-200 flex justify-around py-3 shadow-lg z-50">
          <button onClick={() => setActiveTab('dashboard')} className="text-xs font-bold">Dashboard</button>
          <button onClick={() => setActiveTab('tracking')} className="text-xs font-bold">Tracking</button>
          <button onClick={() => setActiveTab('alerts')} className="text-xs font-bold">Alerts</button>
          <button onClick={() => setActiveTab('settings')} className="text-xs font-bold">Settings</button>
        </div>

      </main>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, status, contrast }: any) => (
  <div className={`p-8 rounded-[2rem] border transition-all duration-300 hover:scale-[1.02] ${contrast ? 'bg-black border-white text-white shadow-[0_0_30px_rgba(255,255,255,0.1)]' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/50'}`}>
    <div className="flex justify-between items-start mb-6">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${contrast ? 'bg-white text-black' : (status === 'good' ? 'bg-green-50 text-green-600' : status === 'bad' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600')}`}>
        <Icon className="w-7 h-7" />
      </div>
      {status === 'good' && <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>}
      {status === 'bad' && <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>}
      {status === 'critical' && <div className="w-3 h-3 rounded-full bg-red-600 animate-ping"></div>}
    </div>
    <p className="text-xs font-black uppercase tracking-[0.2em] opacity-40 mb-1">{label}</p>
    <p className="text-3xl font-black tracking-tighter">{value}</p>
  </div>
);

const SettingToggle = ({ label, desc, checked, onChange, contrast }: any) => (
  <div className="flex justify-between items-center gap-8">
    <div className="flex-1">
      <p className="font-black tracking-tight">{label}</p>
      <p className="text-xs font-medium opacity-50 mt-1">{desc}</p>
    </div>
    <button onClick={onChange} className={`relative w-16 h-8 rounded-full transition-all duration-300 p-1 outline-none focus:ring-4 focus:ring-blue-500/20 ${checked ? (contrast ? 'bg-white' : 'bg-blue-600') : (contrast ? 'bg-slate-800' : 'bg-slate-200')}`}>
      <div className={`w-6 h-6 rounded-full shadow-lg transition-transform duration-300 ${checked ? 'translate-x-8' : 'translate-x-0'} ${contrast && checked ? 'bg-black' : 'bg-white'}`} />
    </button>
  </div>
);

export default App;
