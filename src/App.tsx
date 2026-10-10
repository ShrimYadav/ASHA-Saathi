import React from 'react';
import { DesktopDashboard } from './components/desktop/DesktopDashboard';

export default function App() {
  return (
    <div className="min-h-screen bg-[#f4f7f6] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Complete Project Window (Edge-to-Edge Desktop Application) */}
      <DesktopDashboard
        isCompact={false}
        className="min-h-screen w-full rounded-none border-none shadow-none"
      />
    </div>
  );
}
