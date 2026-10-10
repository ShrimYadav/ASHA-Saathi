import React, { useState } from 'react';
import { Phone, Lock, Eye, EyeOff } from 'lucide-react';
import { AshaLogo } from '../brand/AshaLogo';

interface MobileLoginProps {
  onLoginSuccess?: () => void;
  onSignUp?: () => void;
}

export const MobileLogin: React.FC<MobileLoginProps> = ({
  onLoginSuccess,
  onSignUp,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('9839124510');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onLoginSuccess) onLoginSuccess();
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-white text-slate-800 min-h-[580px]">
      {/* Brand Header */}
      <div className="pt-4 flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 shadow-xs">
          <svg
            viewBox="0 0 48 48"
            fill="none"
            className="w-8 h-8 text-emerald-700"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M24 40C24 40 9.5 30.5 9.5 18.5C9.5 13.2 13.5 9 18.5 9C21.6 9 23.4 10.8 24 11.5C24.6 10.8 26.4 9 29.5 9C34.5 9 38.5 13.2 38.5 18.5C38.5 30.5 24 40 24 40Z"
              stroke="currentColor"
              strokeWidth="3.2"
              fill="currentColor"
              fillOpacity="0.2"
            />
            <path
              d="M24 17V30"
              stroke="currentColor"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
            <path
              d="M24 21C21.5 18.5 17 19.5 17 23C17 26 21 28 24 29"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <path
              d="M24 23C26.5 20.5 31 21.5 31 25C31 28 27 29.5 24 30.5"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <circle cx="24" cy="14" r="2.2" fill="currentColor" />
          </svg>
        </div>

        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Welcome Back
        </h2>
        <p className="text-xs text-slate-500 mt-1">Sign in to continue</p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4 my-auto py-4">
        {/* Phone Input */}
        <div>
          <label className="sr-only">Phone Number</label>
          <div className="relative rounded-xl border border-slate-200 bg-slate-50/60 focus-within:bg-white focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-600/10 transition-all">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Phone className="w-4 h-4" />
            </div>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Phone Number"
              className="w-full pl-10 pr-4 py-3 text-xs font-medium text-slate-900 bg-transparent rounded-xl focus:outline-hidden"
              required
            />
          </div>
        </div>

        {/* Password Input */}
        <div>
          <label className="sr-only">Password</label>
          <div className="relative rounded-xl border border-slate-200 bg-slate-50/60 focus-within:bg-white focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-600/10 transition-all">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full pl-10 pr-10 py-3 text-xs font-medium text-slate-900 bg-transparent rounded-xl focus:outline-hidden"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          className="w-full py-3.5 px-4 rounded-xl bg-[#064e3b] text-white font-bold text-xs shadow-md hover:bg-[#043927] active:scale-[0.99] transition-all"
        >
          Login
        </button>

        {/* Forgot Password */}
        <div className="text-center pt-1">
          <button
            type="button"
            className="text-[11px] font-semibold text-emerald-700 hover:underline"
          >
            Forgot Password?
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center py-2">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[11px] text-slate-400 font-medium">
            or
          </span>
        </div>

        {/* Google Login */}
        <button
          type="button"
          onClick={onLoginSuccess}
          className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 transition-colors shadow-2xs"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
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
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Continue with Google
        </button>
      </form>

      {/* Bottom Sign up */}
      <div className="text-center pb-2 text-[11px] text-slate-500">
        Don&apos;t have an account?{' '}
        <button
          onClick={onSignUp}
          className="font-bold text-emerald-700 hover:underline"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};
