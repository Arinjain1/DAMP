import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ShieldAlert, KeyRound } from 'lucide-react';
import api, { setAuthHeader } from '../utils/api';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      
      const { token, role, full_name } = response.data;

      // Verify that the user has admin role
      if (role !== 'admin') {
        setError('Access Denied: Only administrators can access the control center.');
        setLoading(false);
        return;
      }

      // Store in localStorage
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminUser', JSON.stringify({ email, full_name, role }));

      // Set headers for all future requests
      setAuthHeader(token);

      // Trigger success callback
      onLoginSuccess(token, { email, full_name, role });
    } catch (err) {
      console.error('Login error:', err);
      const message = err.response?.data?.message || 'Connection failed. Please check your backend server.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-950 overflow-hidden font-sans">
      {/* Background ambient glow shapes */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] animate-pulse delay-700"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-500/5 rounded-full blur-[150px]"></div>

      {/* Main glass card container */}
      <div className="relative z-10 w-full max-w-md p-8 sm:p-10 mx-4 bg-white/5 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/10 dark:border-slate-800/40 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        
        {/* Header/Logo */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-14 h-14 bg-gradient-to-br from-[#BFB7FD] to-[#7c6ce0] rounded-2xl flex items-center justify-center shadow-lg shadow-[#7c6ce0]/30 transform -rotate-3 mb-4">
            <span className="text-white font-black text-2xl">B</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Brokmate</h1>
          <span className="text-xs text-[#BFB7FD] font-black uppercase tracking-widest mt-1">Control Center Login</span>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start space-x-3 text-rose-200 text-sm font-semibold animate-fade-in">
            <ShieldAlert size={20} className="text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@brokmate.com"
                className="w-full pl-11 pr-4 py-3.5 bg-slate-900/60 border border-slate-850 hover:border-[#BFB7FD]/50 focus:border-[#7c6ce0] rounded-2xl text-sm font-medium text-white focus:outline-none focus:ring-4 focus:ring-[#7c6ce0]/10 transition-all shadow-inner placeholder-slate-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-12 py-3.5 bg-slate-900/60 border border-slate-850 hover:border-[#BFB7FD]/50 focus:border-[#7c6ce0] rounded-2xl text-sm font-medium text-white focus:outline-none focus:ring-4 focus:ring-[#7c6ce0]/10 transition-all shadow-inner placeholder-slate-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-[#BFB7FD] to-[#7c6ce0] hover:from-[#a59cee] hover:to-[#6a5cd4] text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-[#7c6ce0]/20 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <KeyRound size={16} strokeWidth={2.5} />
                  <span>Authenticate</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer info */}
        <div className="mt-8 text-center text-xs font-semibold text-slate-500">
          This system is restricted to authorized personnel only. All access attempts are logged and monitored.
        </div>
      </div>
    </div>
  );
};

export default Login;
