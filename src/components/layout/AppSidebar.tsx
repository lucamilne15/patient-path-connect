import { 
  Settings, 
  FileText, 
  Search, 
  History, 
  PlayCircle,
  Shield,
  Coins
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useClinic } from '@/context/ClinicContext';

const navItems = [
  { title: 'Clinic Settings', path: '/settings', icon: Settings },
  { title: 'Document Encounter', path: '/encounter', icon: FileText },
  { title: 'Patient Lookup', path: '/lookup', icon: Search },
  { title: 'History Feed', path: '/history', icon: History },
];

export function AppSidebar() {
  const location = useLocation();
  const { settings, isWalkthroughActive, startWalkthrough } = useClinic();

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col min-h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-sidebar-foreground">HistoryLink</h1>
            <p className="text-xs text-sidebar-foreground/60">Patient Exchange</p>
          </div>
        </div>
      </div>

      {/* Credit Display */}
      <div className="p-4 mx-4 mt-4 rounded-lg bg-sidebar-accent">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-sidebar-foreground/70">Continuity Credits</span>
          <Coins className="w-4 h-4 text-credit" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-credit">{settings.credits}</span>
          <span className="text-xs text-sidebar-foreground/50">credits</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-sidebar-border rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${settings.trustScore}%` }}
            />
          </div>
          <span className="text-xs text-sidebar-foreground/70">{settings.trustScore}%</span>
        </div>
        <p className="text-xs text-sidebar-foreground/50 mt-1">Trust Score</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                "hover:bg-sidebar-accent",
                isActive && "bg-sidebar-primary text-sidebar-primary-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.title}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Walkthrough Button */}
      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={startWalkthrough}
          className={cn(
            "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all",
            "bg-sidebar-accent hover:bg-sidebar-primary hover:text-sidebar-primary-foreground",
            isWalkthroughActive && "bg-sidebar-primary text-sidebar-primary-foreground"
          )}
        >
          <PlayCircle className="w-5 h-5" />
          <span className="font-medium">
            {isWalkthroughActive ? 'Walkthrough Active' : 'Start Walkthrough'}
          </span>
        </button>
      </div>

      {/* Clinic Name */}
      <div className="p-4 border-t border-sidebar-border">
        <p className="text-xs text-sidebar-foreground/50">Current Clinic</p>
        <p className="font-medium text-sm truncate">{settings.name}</p>
      </div>
    </aside>
  );
}
