import React, { useState } from 'react';
import { AshaRedLogo } from '../brand/AshaRedLogo';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Loader2,
  LogIn,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../../services/api';
import { CURRENT_USER } from '../../data/mockData';

interface PrototypeSignInProps {
  onSignInSuccess: (userData: any) => void;
  onSkipSignIn: () => void;
}

export const PrototypeSignIn: React.FC<PrototypeSignInProps> = ({
  onSignInSuccess,
  onSkipSignIn,
}) => {
  // Pre-filled prototype credentials for instant access
  const [name, setName] = useState('Sunita Devi');
  const [password, setPassword] = useState('asha123');
  const [role, setRole] = useState<'ASHA_WORKER' | 'HEALTH_FACILITY_OFFICER'>('ASHA_WORKER');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quick Account Preset selection
  const selectPreset = (
    presetName: string,
    presetPass: string,
    presetRole: 'ASHA_WORKER' | 'HEALTH_FACILITY_OFFICER'
  ) => {
    setName(presetName);
    setPassword(presetPass);
    setRole(presetRole);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const isDoctor =
      name.toLowerCase().includes('verma') ||
      name.toLowerCase().includes('dr') ||
      role === 'HEALTH_FACILITY_OFFICER';

    const normalizedRole = isDoctor ? 'HEALTH_FACILITY_OFFICER' : role;
    const email = isDoctor
      ? 'dr.verma@district-hospital.gov.in'
      : 'sunita.devi@asha.gov.in';

    try {
      // Try genuine API authentication
      const res = await api.login({
        email,
        password,
        role: normalizedRole,
      });

      if (res.success && res.user) {
        onSignInSuccess({
          ...CURRENT_USER,
          ...res.user,
          name: name.trim() || res.user.name,
          role: isDoctor ? 'Facility Officer' : 'ASHA Worker',
          avatar: isDoctor
            ? 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=256&q=80'
            : CURRENT_USER.avatar,
        });
        return;
      }
    } catch (err: any) {
      // For prototype convenience, if the user entered prototype password 'asha123' or 'doctor123', allow sign in
      if (password === 'asha123' || password === 'doctor123' || password === 'demo123') {
        onSignInSuccess({
          ...CURRENT_USER,
          name: name.trim() || (isDoctor ? 'Dr. A. K. Verma' : 'Sunita Devi'),
          role: isDoctor ? 'Facility Officer' : 'ASHA Worker',
          email,
          avatar: isDoctor
            ? 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=256&q=80'
            : CURRENT_USER.avatar,
        });
        return;
      }
      setErrorMessage(
        err.message || 'Invalid credentials. Please use prototype password (asha123 / doctor123) or click Skip.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-white text-slate-900 relative overflow-hidden select-none">
      {/* Light Clean Background with Subtle Emerald/Green Health Accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft emerald glow in top right */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-emerald-100/60 blur-3xl" />
        {/* Soft mint glow in bottom left */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-green-100/50 blur-3xl" />
        {/* Subtle dot matrix pattern */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, #0f766e 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-lg space-y-6">
        {/* Brand Header with Red Logo and Light Theme Typography */}
        <div className="flex flex-col items-center text-center">
          <AshaRedLogo
            size="lg"
            orientation="vertical"
            showSubtitle={true}
            glowing={false}
            theme="light"
            className="mb-1"
          />
        </div>

        {/* Clean White Card with Green Accent Styling */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/60 space-y-5">
          {/* Prototype Notice Banner in Green Application Theme */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-300/60 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xs">
              <span className="font-bold text-emerald-900 block uppercase tracking-wider text-[10px]">
                Interactive Prototype Mode
              </span>
              <p className="text-emerald-800/90 mt-0.5 leading-relaxed">
                Credentials are provided below for testing. You can also bypass this step anytime via <strong className="text-emerald-950">&ldquo;Skip Sign In&rdquo;</strong>.
              </p>
            </div>
          </div>

          {/* Quick Preset Accounts (Click to Auto-Fill) */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
              1-Click Demo Accounts (Given Credentials):
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => selectPreset('Sunita Devi', 'asha123', 'ASHA_WORKER')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  role === 'ASHA_WORKER'
                    ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Sunita Devi</span>
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${
                      role === 'ASHA_WORKER' ? 'text-emerald-600' : 'text-slate-300'
                    }`}
                  />
                </div>
                <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">ASHA Worker</p>
                <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>PW:</span>
                  <span className="text-emerald-800 font-bold bg-white border border-emerald-200 px-1.5 py-0.5 rounded shadow-2xs">
                    asha123
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => selectPreset('Dr. A. K. Verma', 'doctor123', 'HEALTH_FACILITY_OFFICER')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  role === 'HEALTH_FACILITY_OFFICER'
                    ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Dr. A. K. Verma</span>
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${
                      role === 'HEALTH_FACILITY_OFFICER' ? 'text-emerald-600' : 'text-slate-300'
                    }`}
                  />
                </div>
                <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">Facility Doctor</p>
                <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>PW:</span>
                  <span className="text-emerald-800 font-bold bg-white border border-emerald-200 px-1.5 py-0.5 rounded shadow-2xs">
                    doctor123
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span>Your Name:</span>
                <span className="text-[10px] text-slate-500 font-normal">
                  (Editable for prototype)
                </span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sunita Devi"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 font-medium transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-700">Password:</label>
                <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  Given: {role === 'ASHA_WORKER' ? 'asha123' : 'doctor123'}
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password..."
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 font-mono transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message if any */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <span className="text-red-500 font-bold">⚠</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Actions: Sign In Green Button & Skip Option */}
            <div className="space-y-2.5 pt-2">
              {/* Primary: Sign In Application Green Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 active:scale-[0.99] text-white shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In to ASHA-Saathi</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>

              {/* Secondary: Skip Sign In */}
              <button
                type="button"
                onClick={onSkipSignIn}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Skip Sign In (Prototype Demo)</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded font-mono font-medium">
                  Direct Access →
                </span>
              </button>
            </div>
          </form>

          {/* Privacy & Prototype Footer */}
          <div className="pt-2 text-center text-[11px] text-slate-500 border-t border-slate-100 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Frontline Health Registry Simulator • Zero PII exposed in offline mode</span>
          </div>
        </div>
      </div>
    </div>
  );
};
