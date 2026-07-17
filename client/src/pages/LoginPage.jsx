import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '../stores/authStore';
import { motion } from 'framer-motion';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const { login, googleLogin, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await login(form.email, form.password);
    if (ok) navigate('/chat');
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (credentialResponse.credential) {
      const ok = await googleLogin(credentialResponse.credential);
      if (ok) navigate('/chat');
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden" style={{ backgroundColor: '#0a0f1e' }}>
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-brand-500/[0.06] rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-pink-500/[0.04] rounded-full blur-[100px] animate-float-slow" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-cyan-500/[0.04] rounded-full blur-[80px] animate-float-delayed" />
      </div>

      {/* Left: Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/40 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-dot-pattern bg-dot opacity-30" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-md text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient mx-auto mb-8 flex items-center justify-center shadow-glow-lg">
            <span className="text-4xl">🧠</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">Welcome back</h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Continue where you left off. Your AI is ready to pick up the conversation.
          </p>

          {/* Feature pills */}
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {['🎯 Goals', '⚡ AI Chat', '📊 Analytics', '🧬 Memory'].map(item => (
              <div key={item} className="bg-white/[0.04] backdrop-blur-sm border border-white/[0.06] rounded-full px-4 py-2 text-sm text-slate-300 font-medium">
                {item}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-10">
            <div className="w-14 h-14 rounded-xl bg-gradient mx-auto mb-4 flex items-center justify-center shadow-glow-md lg:hidden">
              <span className="text-2xl">🧠</span>
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Sign In</h2>
            <p className="text-slate-400 mt-2 text-sm">Pick up where you left off</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm font-medium"
            >
              {error}
            </motion.div>
          )}

          <div className="mb-6 flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => console.log('Google Login Failed')}
              theme="filled_black"
              shape="pill"
              text="signin_with"
              size="large"
            />
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.06]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 text-slate-500 font-medium" style={{ backgroundColor: '#0a0f1e' }}>Or sign in with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">Email</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-400 transition-colors duration-300" size={18}/>
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500/40 hover:border-white/[0.12] transition-all duration-300 py-3 pl-11 pr-4 shadow-inner-glow"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-400 transition-colors duration-300" size={18}/>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="Your password"
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500/40 hover:border-white/[0.12] transition-all duration-300 py-3 pl-11 pr-12 shadow-inner-glow"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient flex items-center justify-center gap-2 hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 shadow-glow-md hover:shadow-glow-lg active:scale-[0.98] mt-3 border border-white/10"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
              {isLoading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-8">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
              Create one free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
