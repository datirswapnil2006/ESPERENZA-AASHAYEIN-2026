import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { eventService } from '../../services/eventService';
import { coordinatorService } from '../../services/coordinatorService';
import { 
  Sparkles, 
  GraduationCap, 
  UserCheck, 
  Users, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Lock, 
  Mail, 
  Phone, 
  User, 
  Building,
  ArrowRight
} from 'lucide-react';

export default function CoordinatorSignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [roleType, setRoleType] = useState('student_coordinator'); // student_coordinator or faculty_coordinator
  const [festivals, setFestivals] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedFestival, setSelectedFestival] = useState('');
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successInfo, setSuccessInfo] = useState(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const passwordWatch = watch('password', '');

  // Load festivals and events dynamically from Supabase
  useEffect(() => {
    async function loadFestivalData() {
      try {
        const [festList, evtList] = await Promise.all([
          eventService.getFestivals(),
          eventService.getAllEvents()
        ]);
        setFestivals(festList || []);
        setEvents((evtList || []).filter(e => e.status !== 'archived'));
        if (festList && festList.length > 0) {
          setSelectedFestival(festList[0].slug || festList[0].id);
        }
      } catch (err) {
        console.error('Error fetching dynamic festival data:', err);
      }
    }
    loadFestivalData();
  }, []);

  // Filter events dynamically when selected festival changes
  useEffect(() => {
    if (selectedFestival) {
      const match = events.filter(e => 
        e.festival_slug === selectedFestival || e.festival_id === selectedFestival
      );
      setFilteredEvents(match);
    } else {
      setFilteredEvents(events);
    }
  }, [selectedFestival, events]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    setErrorMsg(null);

    if (data.password !== data.confirm_password) {
      setErrorMsg('Passwords do not match.');
      setSubmitting(false);
      return;
    }

    try {
      const signupPayload = {
        email: data.email,
        password: data.password,
        role: roleType,
        full_name: data.full_name,
        department: data.department,
        mobile: data.mobile,
        // Student specific
        erp_number: roleType === 'student_coordinator' ? data.erp_number : null,
        year: roleType === 'student_coordinator' ? data.year : null,
        section: roleType === 'student_coordinator' ? data.section : null,
        // Faculty specific
        employee_id: roleType === 'faculty_coordinator' ? data.employee_id : null,
        designation: roleType === 'faculty_coordinator' ? data.designation : null,
      };

      const result = await signup(signupPayload);

      // Create coordinator assignment/application for the chosen event if selected
      if (data.event_id && result?.profile?.id) {
        try {
          await coordinatorService.assignCoordinator({
            eventId: data.event_id,
            userId: result.profile.id,
            role: roleType,
            assignedBy: 'self_registration'
          });
        } catch (assignErr) {
          console.warn('Assignment notice:', assignErr);
        }
      }

      setSuccessInfo({
        role: roleType,
        full_name: data.full_name,
        email: data.email,
        isVerified: roleType === 'student_coordinator',
      });
    } catch (err) {
      setErrorMsg(err.message || 'Failed to complete registration.');
    } finally {
      setSubmitting(false);
    }
  };

  if (successInfo) {
    const isFaculty = successInfo.role === 'faculty_coordinator';

    return (
      <div className="max-w-xl mx-auto px-4 py-16 animate-fade-in">
        <div className="bg-white rounded-3xl p-8 border border-light-blue-200 shadow-soft-lg text-center space-y-5">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
            isFaculty ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
          }`}>
            {isFaculty ? <Clock className="w-9 h-9" /> : <CheckCircle2 className="w-9 h-9" />}
          </div>

          <h2 className="text-2xl font-black text-navy-blue">
            {isFaculty ? 'Faculty Account Created (Verification Pending)' : 'Student Coordinator Account Activated!'}
          </h2>

          <p className="text-sm text-slate-600 leading-relaxed">
            {isFaculty ? (
              <>
                Welcome, <strong>{successInfo.full_name}</strong>. Your faculty profile has been created. 
                In compliance with security protocols, an institutional Super Admin must verify your faculty designation before event-management and form editing permissions are enabled.
              </>
            ) : (
              <>
                Welcome, <strong>{successInfo.full_name}</strong>. Your student coordinator profile is activated immediately. You can now access your coordinator dashboard.
              </>
            )}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to={isFaculty ? '/faculty' : '/student'}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary-blue hover:bg-primary-blue-hover text-white text-xs font-bold shadow-soft transition-all"
            >
              Proceed to Dashboard
            </Link>
            <Link
              to="/"
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-light-blue-100 text-primary-blue text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>FESTIVAL COORDINATOR NETWORK</span>
        </div>
        <h1 className="text-3xl font-black text-navy-blue">Coordinator Registration</h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          Register to represent your department, manage competitions, and synchronize registrations for Esperenza & Aashayein 2026–2027.
        </p>
      </div>

      {/* Role Selection Switch */}
      <div className="bg-white p-2 rounded-2xl border border-light-blue-200 shadow-sm grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setRoleType('student_coordinator')}
          className={`py-3 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
            roleType === 'student_coordinator'
              ? 'bg-primary-blue text-white shadow-soft'
              : 'text-slate-600 hover:text-navy-blue hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Student Coordinator</span>
        </button>

        <button
          type="button"
          onClick={() => setRoleType('faculty_coordinator')}
          className={`py-3 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
            roleType === 'faculty_coordinator'
              ? 'bg-navy-blue text-white shadow-soft'
              : 'text-slate-600 hover:text-navy-blue hover:bg-slate-50'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Faculty Coordinator</span>
        </button>
      </div>

      {/* Registration Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-light-blue-200 shadow-soft">
        
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Section: Festival & Event Assignment (Dynamically Loaded from Supabase) */}
          <div className="p-4 bg-light-blue-50/60 rounded-2xl border border-light-blue-200/80 space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-primary-blue">
              Festival & Event Preference (Dynamically Loaded from Database)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-navy-blue mb-1.5">
                  Select Festival *
                </label>
                <select
                  value={selectedFestival}
                  onChange={(e) => setSelectedFestival(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-blue"
                >
                  {festivals.map(f => (
                    <option key={f.id} value={f.slug}>
                      {f.name} ({f.type === 'technical' ? 'Technical' : 'Cultural'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-blue mb-1.5">
                  Select Event / Competition *
                </label>
                <select
                  {...register('event_id', { required: 'Please select an event' })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-blue"
                >
                  <option value="">Choose an active event</option>
                  {filteredEvents.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.category})
                    </option>
                  ))}
                </select>
                {errors.event_id && <p className="text-rose-600 text-[11px] mt-1">{errors.event_id.message}</p>}
              </div>
            </div>
          </div>

          {/* Section: Personal & Contact Information */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 border-b pb-2">
              Personal Information
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-navy-blue mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  {...register('full_name', { required: 'Full name is required' })}
                  placeholder={roleType === 'faculty_coordinator' ? 'Dr. / Prof. Full Name' : 'Full Name'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary-blue"
                />
                {errors.full_name && <p className="text-rose-600 text-[11px] mt-1">{errors.full_name.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-blue mb-1.5">
                  Department *
                </label>
                <select
                  {...register('department', { required: 'Department is required' })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-primary-blue"
                >
                  <option value="">Select Department</option>
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Management Studies">Management Studies</option>
                  <option value="Humanities & Applied Sciences">Humanities & Applied Sciences</option>
                </select>
                {errors.department && <p className="text-rose-600 text-[11px] mt-1">{errors.department.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-blue mb-1.5">
                  Official Email Address *
                </label>
                <input
                  type="email"
                  {...register('email', { required: 'Email is required' })}
                  placeholder="name@college.edu"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary-blue"
                />
                {errors.email && <p className="text-rose-600 text-[11px] mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-blue mb-1.5">
                  Mobile Number (WhatsApp) *
                </label>
                <input
                  type="tel"
                  {...register('mobile', { required: 'Mobile number is required' })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary-blue"
                />
                {errors.mobile && <p className="text-rose-600 text-[11px] mt-1">{errors.mobile.message}</p>}
              </div>
            </div>
          </div>

          {/* Section: Role Specific Fields */}
          {roleType === 'student_coordinator' ? (
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 border-b pb-2">
                Student Academic Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-navy-blue mb-1.5">
                    ERP Number *
                  </label>
                  <input
                    type="text"
                    {...register('erp_number', { required: 'ERP number is required' })}
                    placeholder="e.g. 2023CS0142"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  />
                  {errors.erp_number && <p className="text-rose-600 text-[11px] mt-1">{errors.erp_number.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-blue mb-1.5">
                    Academic Year *
                  </label>
                  <select
                    {...register('year', { required: 'Year required' })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  >
                    <option value="">Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                  {errors.year && <p className="text-rose-600 text-[11px] mt-1">{errors.year.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-blue mb-1.5">
                    Section *
                  </label>
                  <input
                    type="text"
                    {...register('section', { required: 'Section required' })}
                    placeholder="e.g. A"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  />
                  {errors.section && <p className="text-rose-600 text-[11px] mt-1">{errors.section.message}</p>}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 border-b pb-2">
                Faculty Credentials
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-navy-blue mb-1.5">
                    Employee ID *
                  </label>
                  <input
                    type="text"
                    {...register('employee_id', { required: 'Employee ID is required' })}
                    placeholder="e.g. FAC-CSE-042"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  />
                  {errors.employee_id && <p className="text-rose-600 text-[11px] mt-1">{errors.employee_id.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-blue mb-1.5">
                    Designation *
                  </label>
                  <input
                    type="text"
                    {...register('designation', { required: 'Designation is required' })}
                    placeholder="e.g. Associate Professor / Dean"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  />
                  {errors.designation && <p className="text-rose-600 text-[11px] mt-1">{errors.designation.message}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Section: Password */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 border-b pb-2">
              Security Credentials
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-navy-blue mb-1.5">
                  Account Password *
                </label>
                <input
                  type="password"
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary-blue"
                />
                {errors.password && <p className="text-rose-600 text-[11px] mt-1">{errors.password.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-blue mb-1.5">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  {...register('confirm_password', { required: 'Please confirm password' })}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary-blue"
                />
                {errors.confirm_password && <p className="text-rose-600 text-[11px] mt-1">{errors.confirm_password.message}</p>}
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-6 rounded-2xl bg-primary-blue hover:bg-primary-blue-hover text-white font-bold text-sm shadow-soft hover:shadow-soft-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? 'Registering Coordinator...' : `Complete ${roleType === 'faculty_coordinator' ? 'Faculty' : 'Student'} Registration`}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="text-center text-xs text-slate-500 pt-2">
            Already registered as a coordinator?{' '}
            <Link to="/login" className="text-primary-blue font-bold hover:underline">
              Sign In here
            </Link>
          </div>

        </form>
      </div>

    </div>
  );
}
