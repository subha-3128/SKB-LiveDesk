import React, { useState } from 'react';
import { Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { apiService } from '../services/api';

interface LoginPageProps {
  onLoginSuccess: (user: any) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      await apiService.login(email, password);
      const user = await apiService.getMe();
      onLoginSuccess(user);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-ivory)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[var(--color-beige)] p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-plum)] text-white flex items-center justify-center mx-auto text-2xl font-black shadow-md">
            BB
          </div>
          <h1 className="text-2xl font-black text-[var(--color-plum)]">Bepari &amp; Brothers</h1>
          <p className="text-xs text-[var(--color-taupe)] font-medium">Live Stream Order Management System</p>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-charcoal)] mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-[var(--color-taupe)]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="bepari@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-beige)] text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[var(--color-plum)] focus:outline-none min-h-[44px]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-charcoal)] mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-[var(--color-taupe)]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-beige)] text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[var(--color-plum)] focus:outline-none min-h-[44px]"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-[var(--color-plum)] hover:bg-[var(--color-plum-hover)] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all min-h-[44px]"
          >
            <span>{isLoading ? 'Signing In...' : 'Sign In to System'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
