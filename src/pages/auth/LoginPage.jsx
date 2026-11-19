import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { 
  Sparkles, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  Shield, 
  GraduationCap, 
  User, 
  Clock,
  KeyRound
} from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  const quickAccounts = [
    {
      role: 'Super Admin',
      email: 'admin@festival.edu',
      name: 'Dr. Rajesh Sharma',
      badgeColor: 'bg-indigo-100 text-indigo-700',
      icon: Shield,
    },
    {
      role: 'Verified Faculty',
      email: 'priya.nair@festival.edu',
      name: 'Dr. Priya Nair (Dance)',
      badgeColor: 'bg-emerald-100 text-emerald-700',
      icon: GraduationCap,
    },
    {
      role: 'Pending Faculty',
      email: 'neha.gupta@festival.edu',
      name: 'Dr. Neha Gupta (Unverified)',
      badgeColor: 'bg-amber-100 text-amber-700',
      icon: Clock,
    },
    {
      role: 'Student Coordinator',
      email: 'rohit.mehta@student.edu',
      name: 'Rohit Mehta (Dance)',
      badgeColor: 'bg-light-blue-100 text-primary-blue',
      icon: User,
    },
  ];

  const handleQuickFill = (email) => {
    setValue('email', email);
    setValue('password', 'password123');
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await login(data.email, data.password);
      const role = res?.profile?.role || res?.user?.role;

      // Navigate to destination or role dashboard
      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else if (role === 'super_admin') {
        navigate('/admin', { replace: true });
      } else if (role === 'faculty_coordinator') {
        navigate('/faculty', { replace: true });
      } else if (role === 'student_coordinator') {
        navigate('/student', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 animate-fade-in space-y-6">
      
      {/* Brand Icon & Heading */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-navy-blue via-primary-blue to-light-blue-300 flex items-center justify-center text-white shadow-soft mx-auto">
          <Sparkles className="w-6 h-6 text-cream" />
        </div>
        <h1 className="text-2xl font-black text-navy-blue">Coordinator Login</h1>
        <p className="text-xs text-slate-500">
          Enter credentials to access your festival administration dashboard.
        </p>
      </div>

      {/* Main Login Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-light-blue-200 shadow-soft">
        
        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-navy-blue mb-1.5">
              Official Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                {...register('email', { required: 'Email address is required' })}
                placeholder="name@college.edu"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue"
              />
            </div>
            {errors.email && <p className="text-rose-600 text-[11px] mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-navy-blue">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                {...register('password', { required: 'Password is required' })}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue"
              />
            </div>
            {errors.password && <p className="text-rose-600 text-[11px] mt-1">{errors.password.message}</p>}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-primary-blue hover:bg-primary-blue-hover text-white font-bold text-xs shadow-soft hover:shadow-soft-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to Portal'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="text-center text-xs text-slate-500 pt-5 border-t border-slate-100 mt-5">
          Need a new coordinator account?{' '}
          <Link to="/coordinator-signup" className="text-primary-blue font-bold hover:underline">
            Register here
          </Link>
        </div>
      </div>

      {/* Quick Test Demo Fill Helper Card */}
      <div className="bg-light-blue-50/70 border border-light-blue-200/80 rounded-2xl p-4 text-xs space-y-2.5">
        <div className="flex items-center gap-1.5 font-bold text-navy-blue">
          <KeyRound className="w-4 h-4 text-primary-blue" />
          <span>Quick Evaluation Logins (1-Click Fill):</span>
        </div>
        <p className="text-[11px] text-slate-500">
          Click any preset to fill email and test password:
        </p>
        <div className="grid grid-cols-2 gap-2 pt-1">
          {quickAccounts.map((acc) => (
            <button
              key={acc.email}
              type="button"
              onClick={() => handleQuickFill(acc.email)}
              className="p-2 bg-white rounded-xl border border-light-blue-200 text-left hover:border-primary-blue transition-colors group"
            >
              <div className="flex items-center justify-between">
                <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${acc.badgeColor}`}>
                  {acc.role.split(' ')[0]}
                </span>
              </div>
              <div className="font-bold text-navy-blue text-[11px] truncate mt-1 group-hover:text-primary-blue">
                {acc.name}
              </div>
              <div className="text-[10px] text-slate-400 truncate">{acc.email}</div>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
