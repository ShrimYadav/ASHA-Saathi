import React, { useState, useEffect } from 'react';
import {
  Home,
  Mic,
  UserCheck,
  Users,
  ClipboardList,
  AlertTriangle,
  GitPullRequest,
  Building2,
  BarChart3,
  Mail,
  Settings,
  X,
  Menu,
  KeyRound,
} from 'lucide-react';
import { LogoSplashScreen } from './components/auth/LogoSplashScreen';
import { PrototypeSignIn } from './components/auth/PrototypeSignIn';
import { DesktopDashboard } from './components/desktop/DesktopDashboard';
import { AshaLogo } from './components/brand/AshaLogo';
import { CURRENT_USER } from './data/mockData';

export interface MobileNavigationProps {
  activeTab: string;
  onSelectTab: (tabName: string) => void;
  currentUser: any;
  onLogout: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  activeTab,
  onSelectTab,
  currentUser,
  onLogout,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // All 11 genuine ASHA-Saathi healthcare modules
  const navModules = [
    {
      name: 'Home',
      label: 'Home Dashboard',
      subtitle: 'Schedule & Daily Tally',
      icon: Home,
      badge: 'Overview',
      badgeColor: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30',
    },
    {
      name: 'Voice Visit',
      label: 'Voice Visit Capture',
      subtitle: 'AI Audio & Symptom Extraction',
      icon: Mic,
      badge: 'AI Visit',
      badgeColor: 'bg-rose-500/20 text-rose-200 border-rose-500/30',
    },
    {
      name: 'Patient Directory',
      label: 'Patient Directory',
      subtitle: 'ANC, Children & High Risk',
      icon: UserCheck,
      badge: 'Records',
      badgeColor: 'bg-blue-500/20 text-blue-200 border-blue-500/30',
    },
    {
      name: 'Households',
      label: 'Household Register',
      subtitle: 'Census & Family Members',
      icon: Users,
      badge: 'Census',
      badgeColor: 'bg-amber-500/20 text-amber-200 border-amber-500/30',
    },
    {
      name: 'Visit Records',
      label: 'Visit Records',
      subtitle: 'Logs & Follow-Up History',
      icon: ClipboardList,
      badge: 'Logs',
      badgeColor: 'bg-purple-500/20 text-purple-200 border-purple-500/30',
    },
    {
      name: 'Priority Cases',
      label: 'Priority Cases',
      subtitle: 'NTEP TB & Anemia Guidelines',
      icon: AlertTriangle,
      badge: 'Rules',
      badgeColor: 'bg-rose-500/20 text-rose-200 border-rose-500/30',
    },
    {
      name: 'Referrals',
      label: 'Referral Tracking',
      subtitle: 'Digital QR Passports & Status',
      icon: GitPullRequest,
      badge: 'QR Token',
      badgeColor: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30',
    },
    {
      name: 'Facility Desk',
      label: 'Facility Desk',
      subtitle: 'Hospital OPD & Consultation',
      icon: Building2,
      badge: 'OPD Check-in',
      badgeColor: 'bg-indigo-500/20 text-indigo-200 border-indigo-500/30',
    },
    {
      name: 'Analytics',
      label: 'Analytics & Reports',
      subtitle: 'MoHFW Indicators & Trends',
      icon: BarChart3,
      badge: 'MoHFW',
      badgeColor: 'bg-cyan-500/20 text-cyan-200 border-cyan-500/30',
    },
    {
      name: 'Messages',
      label: 'PHC Communications',
      subtitle: 'Doctor Feedback & Broadcasts',
      icon: Mail,
      badge: 'Notice',
      badgeColor: 'bg-amber-500/20 text-amber-200 border-amber-500/30',
    },
    {
      name: 'Settings',
      label: 'Settings & Offline Sync',
      subtitle: 'Dialects, Profile & Cache',
      icon: Settings,
      badge: 'Config',
      badgeColor: 'bg-slate-500/20 text-slate-200 border-slate-500/30',
    },
  ];

  const handleSelect = (tabName: string) => {
    onSelectTab(tabName);
    setIsOpen(false);
  };

  return (
    <div className="sm:hidden">
      {/* 1. Backdrop Overlay when Bottom Sheet Drawer is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 backdrop-blur-xs transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* 2. Slide-up Responsive Bottom Sheet Drawer (< 640px) */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 bg-[#064e3b] text-white rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out max-h-[88vh] flex flex-col ${
          isOpen ? 'translate-y-0' : 'translate-y-full pointer-events-none'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation Drawer"
      >
        {/* Grab Handle */}
        <div
          className="pt-3 pb-1 cursor-pointer flex justify-center"
          onClick={() => setIsOpen(false)}
        >
          <span className="w-12 h-1.5 bg-white/25 rounded-full" />
        </div>

        {/* Drawer Header */}
        <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AshaLogo variant="light" size="sm" />
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white leading-tight">
                ASHA-Saathi
              </h2>
              <p className="text-[10px] text-emerald-300/80 font-medium">
                Frontline Health Companion
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-200 transition-colors cursor-pointer"
            title="Close Drawer"
            aria-label="Close Drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Card inside Sheet */}
        <div className="px-5 py-2.5 bg-[#043327]/60 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <img
                src={
                  currentUser?.avatar ||
                  'https://images.unsplash.com/photo-1594824813511-41d3b3c3c137?auto=format&fit=crop&w=256&q=80'
                }
                alt={currentUser?.name || 'Worker'}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-emerald-400"
              />
              <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-400 rounded-full ring-1 ring-[#064e3b]" />
            </div>
            <div className="min-w-0 truncate">
              <p className="text-xs font-bold text-white truncate">
                {currentUser?.name || 'Sunita Devi'}
              </p>
              <p className="text-[10px] text-emerald-300/80 truncate">
                {currentUser?.role || 'ASHA Worker'} • Pipra Sub-Centre
              </p>
            </div>
          </div>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
            Active
          </span>
        </div>

        {/* Modules Grid (Scrollable) */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1">
          <div className="text-[11px] font-bold text-emerald-300/70 uppercase tracking-wider px-1">
            Healthcare Modules &amp; Tools
          </div>
          <div className="grid grid-cols-1 gap-1.5">
            {navModules.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.name;
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => handleSelect(item.name)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#0f5c43] text-white ring-1 ring-emerald-400/50 shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-emerald-100'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isActive
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : 'bg-white/10 text-emerald-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 truncate">
                      <p className="text-xs font-bold text-white leading-tight truncate">
                        {item.label}
                      </p>
                      <p className="text-[10px] text-emerald-200/60 truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Drawer Bottom Actions */}
        <div className="p-4 border-t border-white/10 bg-[#043327]/80 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onLogout();
            }}
            className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5 text-emerald-300" />
            <span>Switch Account</span>
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="py-2 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>

      {/* 3. Responsive Fixed Bottom Navigation Bar (< 640px) */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 bg-[#064e3b] text-white border-t border-emerald-900/60 shadow-2xl px-1 py-1.5 flex items-center justify-around select-none"
        aria-label="Mobile Quick Navigation"
      >
        <button
          type="button"
          onClick={() => handleSelect('Home')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-semibold transition-colors cursor-pointer ${
            activeTab === 'Home'
              ? 'text-emerald-300 font-bold'
              : 'text-emerald-100/70 hover:text-white'
          }`}
        >
          <Home className="w-4 h-4 mb-0.5" />
          <span>Home</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelect('Voice Visit')}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-semibold transition-colors cursor-pointer group"
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center -mt-3 shadow-lg transition-transform group-hover:scale-105 ${
              activeTab === 'Voice Visit'
                ? 'bg-rose-600 text-white ring-2 ring-rose-400'
                : 'bg-emerald-600 text-white ring-2 ring-emerald-400/50'
            }`}
          >
            <Mic className="w-4 h-4 text-white" />
          </div>
          <span
            className={`mt-0.5 ${
              activeTab === 'Voice Visit' ? 'text-emerald-300 font-bold' : 'text-emerald-100/70'
            }`}
          >
            Voice
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleSelect('Patient Directory')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-semibold transition-colors cursor-pointer ${
            activeTab === 'Patient Directory'
              ? 'text-emerald-300 font-bold'
              : 'text-emerald-100/70 hover:text-white'
          }`}
        >
          <UserCheck className="w-4 h-4 mb-0.5" />
          <span>Patients</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelect('Households')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-semibold transition-colors cursor-pointer ${
            activeTab === 'Households'
              ? 'text-emerald-300 font-bold'
              : 'text-emerald-100/70 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4 mb-0.5" />
          <span>Families</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelect('Referrals')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-semibold transition-colors cursor-pointer ${
            activeTab === 'Referrals'
              ? 'text-emerald-300 font-bold'
              : 'text-emerald-100/70 hover:text-white'
          }`}
        >
          <GitPullRequest className="w-4 h-4 mb-0.5" />
          <span>Referrals</span>
        </button>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-semibold transition-colors cursor-pointer ${
            isOpen ||
            [
              'Facility Desk',
              'Visit Records',
              'Priority Cases',
              'Analytics',
              'Messages',
              'Settings',
            ].includes(activeTab)
              ? 'text-emerald-300 font-bold'
              : 'text-emerald-100/70 hover:text-white'
          }`}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
        >
          <div className="relative">
            <Menu className="w-4 h-4 mb-0.5" />
            <span className="absolute -top-0.5 -right-1 w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
          <span>More</span>
        </button>
      </nav>
    </div>
  );
};

export default function App() {
  // Application startup stages: 'splash' (2-second logo flash) -> 'signin' (prototype auth) -> 'dashboard'
  const [appStage, setAppStage] = useState<'splash' | 'signin' | 'dashboard'>('splash');
  const [currentUser, setCurrentUser] = useState<any>(CURRENT_USER);
  const [activeTab, setActiveTab] = useState<string>('Home');

  const updateTabWithUrl = (tab: string) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const slugMap: Record<string, string> = {
        'Home': 'home',
        'Voice Visit': 'voice',
        'Patient Directory': 'directory',
        'Households': 'households',
        'Visit Records': 'visits',
        'Priority Cases': 'priority',
        'Referrals': 'referrals',
        'Facility Desk': 'facility-desk',
        'Analytics': 'analytics',
        'Reports': 'analytics',
        'Messages': 'messages',
        'Settings': 'settings',
      };
      if (slugMap[tab]) {
        url.searchParams.set('tab', slugMap[tab]);
        window.history.replaceState({}, '', url.toString());
      }
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') || window.location.hash.replace(/^#\/?/, '');
      const skipParam = params.get('skip') === 'true';
      const storedToken = localStorage.getItem('asha_saathi_token');
      const storedUser = localStorage.getItem('asha_saathi_user');

      if (storedUser) {
        try {
          setCurrentUser(JSON.parse(storedUser));
        } catch {
          // ignore
        }
      }

      if (tabParam) {
        const reverseMap: Record<string, string> = {
          home: 'Home',
          voice: 'Voice Visit',
          'voice-visit': 'Voice Visit',
          record: 'Voice Visit',
          directory: 'Patient Directory',
          patients: 'Patient Directory',
          'patient-directory': 'Patient Directory',
          beneficiaries: 'Patient Directory',
          households: 'Households',
          families: 'Households',
          visits: 'Visit Records',
          'visit-records': 'Visit Records',
          priority: 'Priority Cases',
          'priority-cases': 'Priority Cases',
          referrals: 'Referrals',
          'referral-tracking': 'Referrals',
          facility: 'Facility Desk',
          desk: 'Facility Desk',
          'facility-desk': 'Facility Desk',
          hospital: 'Facility Desk',
          analytics: 'Analytics',
          reports: 'Analytics',
          messages: 'Messages',
          settings: 'Settings',
        };
        const matched = reverseMap[tabParam.toLowerCase()];
        if (matched) {
          setActiveTab(matched);
        }
      }

      if (tabParam || skipParam || storedToken) {
        setAppStage('dashboard');
      }

      const handlePopState = () => {
        const p = new URLSearchParams(window.location.search);
        const t = p.get('tab') || window.location.hash.replace(/^#\/?/, '');
        if (t) {
          const rev: Record<string, string> = {
            home: 'Home',
            voice: 'Voice Visit',
            'voice-visit': 'Voice Visit',
            directory: 'Patient Directory',
            patients: 'Patient Directory',
            households: 'Households',
            visits: 'Visit Records',
            priority: 'Priority Cases',
            referrals: 'Referrals',
            facility: 'Facility Desk',
            desk: 'Facility Desk',
            'facility-desk': 'Facility Desk',
            analytics: 'Analytics',
            messages: 'Messages',
            settings: 'Settings',
          };
          if (rev[t.toLowerCase()]) {
            setActiveTab(rev[t.toLowerCase()]);
          }
        }
      };

      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, []);

  return (
    <div
      className={`min-h-screen flex flex-col font-['Plus_Jakarta_Sans',sans-serif] ${
        appStage === 'signin' ? 'bg-white' : appStage === 'splash' ? 'bg-[#020617]' : 'bg-[#f4f7f6]'
      }`}
    >
      {/* Stage 1: 2-Second Logo Flash Screen */}
      {appStage === 'splash' && (
        <LogoSplashScreen
          durationMs={2000}
          onFinish={() => setAppStage('signin')}
        />
      )}

      {/* Stage 2: Prototype Sign-In Screen with Name & Password + Skip Option */}
      {appStage === 'signin' && (
        <PrototypeSignIn
          onSignInSuccess={(user) => {
            setCurrentUser(user);
            setAppStage('dashboard');
          }}
          onSkipSignIn={() => {
            // Instant skip directly into prototype
            setCurrentUser(CURRENT_USER);
            setAppStage('dashboard');
          }}
        />
      )}

      {/* Stage 3: Full Desktop Health Platform */}
      {appStage === 'dashboard' && (
        <div className="relative min-h-screen w-full bg-[#f4f7f6]">
          {/* Quick Header Banner to Re-trigger Splash or Switch Auth if desired */}
          <div className="bg-slate-900 text-slate-300 text-[11px] px-3 sm:px-6 py-1.5 flex flex-wrap items-center justify-between gap-1.5 border-b border-slate-800">
            <div className="flex items-center gap-1.5 sm:gap-2 truncate max-w-full">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
              <span className="font-semibold text-white truncate">ASHA-Saathi Platform</span>
              <span className="text-slate-500 hidden sm:inline">•</span>
              <span className="text-slate-400 hidden sm:inline">
                Signed in as: <strong className="text-white">{currentUser?.name || 'Sunita Devi'}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
              <button
                onClick={() => setAppStage('splash')}
                className="hover:text-red-400 text-slate-400 underline transition-colors cursor-pointer text-[10px] sm:text-[11px]"
                title="Re-play the 2-second red logo flash"
              >
                Replay Splash
              </button>
              <button
                onClick={() => setAppStage('signin')}
                className="hover:text-white text-slate-300 bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded font-medium transition-colors cursor-pointer text-[10px] sm:text-[11px]"
              >
                Switch Account
              </button>
            </div>
          </div>

          <DesktopDashboard
            isCompact={false}
            currentUser={currentUser}
            onLogout={() => setAppStage('signin')}
            activeNav={activeTab}
            onNavigate={updateTabWithUrl}
            className="min-h-[calc(100vh-29px)] w-full rounded-none border-none shadow-none"
          />

          {/* Responsive MobileNavigation drawer / bottom sheet triggered on screens below 640px */}
          <MobileNavigation
            activeTab={activeTab}
            onSelectTab={updateTabWithUrl}
            currentUser={currentUser}
            onLogout={() => setAppStage('signin')}
          />
        </div>
      )}
    </div>
  );
}
