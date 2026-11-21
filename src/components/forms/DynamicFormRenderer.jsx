import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { participantService } from '../../services/participantService';
import { COLLEGE_DEPARTMENTS } from '../../utils/departments';
import { CheckCircle2, AlertCircle, Sparkles, Send, Users, User, Phone, Mail, GraduationCap, Building2, BookOpen } from 'lucide-react';

export default function DynamicFormRenderer({ event, form, onSuccess }) {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submittedData, setSubmittedData] = useState(null);

  const isYoungScientist = event?.slug === 'young-scientist' || event?.name?.toLowerCase().includes('young scientist');

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const isTeamWatch = watch('is_team', false);
  const selectedDeptWatch = watch('department', '');

  // Dynamic team member state for team sizes > 1
  const [teamSize, setTeamSize] = useState(1);
  const [additionalMembers, setAdditionalMembers] = useState({});

  const updateMember = (memberIdx, field, val) => {
    setAdditionalMembers(prev => ({
      ...prev,
      [memberIdx]: {
        ...(prev[memberIdx] || {}),
        [field]: val
      }
    }));
  };

  const fields = form?.fields || [];

  const onSubmit = async (data) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const isTeamEntry = isYoungScientist ? teamSize > 1 : Boolean(data.is_team);

      const finalDepartment = isYoungScientist
        ? (data.school_name || data.department || 'School')
        : (data.department === 'Other' && data.other_department ? data.other_department.trim() : data.department);

      // Assemble team members array if team entry
      const teamMembersArray = [];
      if (isTeamEntry) {
        const count = isYoungScientist ? teamSize : parseInt(data.selected_team_size || teamSize, 10);
        for (let i = 2; i <= count; i++) {
          const m = additionalMembers[i] || {};
          if (!m.name || !m.name.trim()) {
            throw new Error(`Please fill in the full name for Team Member ${i}.`);
          }
          const memberDept = isYoungScientist
            ? (m.school || null)
            : (m.department === 'Other' && m.other_department ? m.other_department.trim() : (m.department || finalDepartment));

          teamMembersArray.push({
            member_index: i,
            name: m.name.trim(),
            year: m.year || (isYoungScientist ? m.standard : data.year),
            standard: m.standard || m.year || null,
            email: m.email || '',
            mobile: m.mobile || '',
            department: memberDept,
            school: m.school || null
          });
        }
      }

      // Standard primary participant details
      const standardFields = {
        event_id: event.id,
        form_id: form?.id,
        full_name: data.full_name,
        erp_number: data.erp_number,
        email: data.email,
        mobile: data.mobile,
        department: finalDepartment,
        year: isYoungScientist ? data.standard : data.year,
        section: data.section || 'A',
        is_team: isTeamEntry,
        team_name: isTeamEntry ? (data.team_name || `${data.full_name}'s Team`) : null,
        team_members: teamMembersArray
      };

      const customAnswers = {};
      fields.forEach((f) => {
        if (data[`custom_${f.id}`] !== undefined) {
          customAnswers[f.id] = data[`custom_${f.id}`];
        }
      });

      const result = await participantService.submitRegistration({
        ...standardFields,
        answers: customAnswers,
      });

      setSubmittedData({
        ...result,
        team_members: teamMembersArray
      });
      if (onSuccess) onSuccess(result);
    } catch (err) {
      setSubmitError(err.message || 'An error occurred during submission. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedData) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8 text-center animate-fade-in space-y-5">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div>
          <h3 className="text-2xl font-extrabold text-navy-blue">Registration Confirmed!</h3>
          <p className="text-sm text-slate-600 max-w-md mx-auto mt-1">
            Your registration for <strong className="text-navy-blue">{event.name}</strong> has been successfully submitted and stored.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-emerald-200/80 max-w-md mx-auto text-left text-xs space-y-2.5 shadow-sm">
          <div className="flex justify-between border-b pb-2">
            <span className="text-slate-500">Lead Participant:</span>
            <span className="font-bold text-navy-blue">{submittedData.full_name}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-slate-500">{isYoungScientist ? 'Student ID / Roll:' : 'ERP Number:'}</span>
            <span className="font-bold text-navy-blue">{submittedData.erp_number}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-slate-500">{isYoungScientist ? 'Class / Standard:' : 'Academic Year:'}</span>
            <span className="font-bold text-navy-blue">{submittedData.year}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-slate-500">{isYoungScientist ? 'School Name:' : 'Department:'}</span>
            <span className="font-bold text-navy-blue">{submittedData.department}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-slate-500">WhatsApp Mobile:</span>
            <span className="font-bold text-navy-blue">{submittedData.mobile}</span>
          </div>
          {submittedData.is_team && (
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">Team Format:</span>
              <span className="font-bold text-primary-blue">{submittedData.team_name} ({submittedData.team_members?.length ? submittedData.team_members.length + 1 : 'Team'} Members)</span>
            </div>
          )}
          {submittedData.team_members && submittedData.team_members.length > 0 && (
            <div className="pt-1">
              <span className="text-slate-500 block font-bold mb-1">Additional Team Members:</span>
              <div className="space-y-1">
                {submittedData.team_members.map((tm, idx) => (
                  <div key={idx} className="bg-slate-50 p-2 rounded-lg text-[11px] flex justify-between">
                    <span><strong>M{idx + 2}:</strong> {tm.name}</span>
                    <span className="text-slate-500">{tm.year || tm.standard} • {tm.mobile}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-between pt-1">
            <span className="text-slate-500">Registration Status:</span>
            <span className="font-bold text-emerald-600">CONFIRMED (ACTIVE)</span>
          </div>
        </div>

        <button
          onClick={() => {
            setSubmittedData(null);
            setAdditionalMembers({});
            setTeamSize(1);
          }}
          className="px-6 py-2.5 bg-primary-blue text-white rounded-xl text-sm font-semibold hover:bg-primary-blue-hover transition-colors shadow-soft"
        >
          Register Another Entry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {submitError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-700 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Special Young Scientist Notice */}
      {isYoungScientist && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 font-black">
            🔬
          </div>
          <div>
            <h4 className="text-xs font-black text-amber-900 uppercase tracking-wide">
              Young Scientist Innovation Exhibition
            </h4>
            <p className="text-[11px] text-amber-800">
              Open strictly for school students from <strong>5th Standard to 10th Standard</strong>. Participation is permitted as <strong>Single (Solo), 2 Members (Duo), or 3 Members (Trio)</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Section 1: Lead Participant / Solo Student Information */}
      <div className="bg-white p-6 rounded-2xl border border-light-blue-200/80 shadow-soft space-y-4">
        <h4 className="text-sm font-bold text-navy-blue border-b pb-2 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <User className="w-4 h-4 text-primary-blue" />
            <span>{isYoungScientist ? (teamSize > 1 ? 'Lead Student (Team Leader) Details' : 'Student Participant Details') : (isTeamWatch ? 'Team Leader Details' : 'Student Core Details')}</span>
          </span>
          <span className="text-[11px] font-normal text-slate-400">All fields mandatory</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-navy-text mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              {...register('full_name', { required: 'Full name is required' })}
              placeholder="e.g. Rahul Sharma"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue"
            />
            {errors.full_name && <p className="text-rose-600 text-[11px] mt-1">{errors.full_name.message}</p>}
          </div>

          {/* ERP or Student ID */}
          <div>
            <label className="block text-xs font-semibold text-navy-text mb-1.5">
              {isYoungScientist ? 'Student ID / School Roll No *' : 'ERP Number / Roll No *'}
            </label>
            <input
              type="text"
              {...register('erp_number', { required: isYoungScientist ? 'Student ID/Roll No is required' : 'ERP number is required' })}
              placeholder={isYoungScientist ? 'e.g. SCH-5012' : 'e.g. 2024CS0055'}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue"
            />
            {errors.erp_number && <p className="text-rose-600 text-[11px] mt-1">{errors.erp_number.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-navy-text mb-1.5">
              {isYoungScientist ? 'Student or Parent Email *' : 'College Email *'}
            </label>
            <input
              type="email"
              {...register('email', { 
                required: 'Email is required',
                pattern: { value: /^\S+@\S+$/i, message: 'Valid email required' }
              })}
              placeholder={isYoungScientist ? 'parent_or_student@email.com' : 'student@college.edu'}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue"
            />
            {errors.email && <p className="text-rose-600 text-[11px] mt-1">{errors.email.message}</p>}
          </div>

          {/* Mobile Number (WhatsApp) */}
          <div>
            <label className="block text-xs font-semibold text-navy-text mb-1.5">
              Mobile Number (WhatsApp) *
            </label>
            <input
              type="tel"
              {...register('mobile', { required: 'WhatsApp mobile number is required' })}
              placeholder="+91 98765 43210"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue"
            />
            {errors.mobile && <p className="text-rose-600 text-[11px] mt-1">{errors.mobile.message}</p>}
          </div>

          {/* Year or Standard */}
          {isYoungScientist ? (
            <div>
              <label className="block text-xs font-semibold text-navy-text mb-1.5">
                Class / Standard (5th to 10th Standard Only) *
              </label>
              <select
                {...register('standard', { required: 'Class standard is required' })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white font-semibold text-navy-blue focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue"
              >
                <option value="">-- Choose Standard --</option>
                <option value="5th Standard">5th Standard (Class 5)</option>
                <option value="6th Standard">6th Standard (Class 6)</option>
                <option value="7th Standard">7th Standard (Class 7)</option>
                <option value="8th Standard">8th Standard (Class 8)</option>
                <option value="9th Standard">9th Standard (Class 9)</option>
                <option value="10th Standard">10th Standard (Class 10)</option>
              </select>
              {errors.standard && <p className="text-rose-600 text-[11px] mt-1">{errors.standard.message}</p>}
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-navy-text mb-1.5">
                Academic Year *
              </label>
              <select
                {...register('year', { required: 'Academic year is required' })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white font-semibold text-navy-blue focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue"
              >
                <option value="">-- Choose Year --</option>
                <option value="1st Year">1st Year (FE)</option>
                <option value="2nd Year">2nd Year (SE)</option>
                <option value="3rd Year">3rd Year (TE)</option>
                <option value="4th Year">4th Year (BE)</option>
              </select>
              {errors.year && <p className="text-rose-600 text-[11px] mt-1">{errors.year.message}</p>}
            </div>
          )}

          {/* Department or School Name */}
          {isYoungScientist ? (
            <div>
              <label className="block text-xs font-semibold text-navy-text mb-1.5">
                School Name & City / Board *
              </label>
              <input
                type="text"
                {...register('school_name', { required: 'School name is required' })}
                placeholder="e.g. St. Xavier's High School, CBSE"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue"
              />
              {errors.school_name && <p className="text-rose-600 text-[11px] mt-1">{errors.school_name.message}</p>}
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-navy-text mb-1.5">
                Department *
              </label>
              <select
                {...register('department', { required: 'Department is required' })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white font-semibold text-navy-blue focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue"
              >
                <option value="">Select Department</option>
                {COLLEGE_DEPARTMENTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
                <option value="Other">Other (Please specify)</option>
              </select>
              {errors.department && <p className="text-rose-600 text-[11px] mt-1">{errors.department.message}</p>}

              {selectedDeptWatch === 'Other' && (
                <div className="mt-2.5 animate-fade-in">
                  <label className="block text-xs font-bold text-navy-blue mb-1">
                    Specify Your Department *
                  </label>
                  <input
                    type="text"
                    {...register('other_department', { required: 'Please specify your department' })}
                    placeholder="Enter your department name"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-primary-blue/40 bg-light-blue-50/50 text-navy-blue font-semibold focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  />
                  {errors.other_department && <p className="text-rose-600 text-[11px] mt-1">{errors.other_department.message}</p>}
                </div>
              )}
            </div>
          )}

          {!isYoungScientist && (
            <div>
              <label className="block text-xs font-semibold text-navy-text mb-1.5">
                Section (Optional)
              </label>
              <input
                type="text"
                {...register('section')}
                placeholder="e.g. A / B"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue"
              />
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* TEAM CONFIGURATION SECTION                                                */}
        {/* ========================================================================= */}
        
        {/* YOUNG SCIENTIST TEAM SELECTOR (1, 2, or 3 Members) */}
        {isYoungScientist && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
            <div>
              <label className="block text-xs font-bold text-navy-blue mb-2 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-primary-blue" />
                <span>Participation Format (Single, Duo, or Trio) *</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { size: 1, label: 'Single / Solo', desc: '1 Student' },
                  { size: 2, label: 'Duo Team', desc: '2 Students' },
                  { size: 3, label: 'Trio Team', desc: '3 Students' },
                ].map(item => (
                  <button
                    key={item.size}
                    type="button"
                    onClick={() => setTeamSize(item.size)}
                    className={`py-2.5 px-3 rounded-xl border text-center transition-all ${
                      teamSize === item.size
                        ? 'border-primary-blue bg-light-blue-50 text-primary-blue font-black shadow-xs ring-2 ring-primary-blue/20'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs">{item.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {teamSize > 1 && (
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-navy-text mb-1.5">
                    Team / Project Exhibition Name *
                  </label>
                  <input
                    type="text"
                    {...register('team_name', { required: teamSize > 1 ? 'Project/Team name is required' : false })}
                    placeholder="e.g. Young Innovators / Eco Warriors"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue"
                  />
                  {errors.team_name && <p className="text-rose-600 text-[11px] mt-1">{errors.team_name.message}</p>}
                </div>

                {/* Additional Member Cards (Member 2 and Member 3) */}
                {[...Array(teamSize - 1)].map((_, i) => {
                  const mIndex = i + 2;
                  return (
                    <div key={mIndex} className="p-4 rounded-2xl bg-cream-50 border border-light-blue-200/80 space-y-3">
                      <div className="flex items-center justify-between border-b border-light-blue-200/50 pb-2">
                        <span className="text-xs font-black text-navy-blue">
                          Team Member {mIndex} Details
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary-blue text-white">
                          Participant #{mIndex}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                          <input
                            type="text"
                            required
                            value={additionalMembers[mIndex]?.name || ''}
                            onChange={(e) => updateMember(mIndex, 'name', e.target.value)}
                            placeholder="Student Name"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Class / Standard *</label>
                          <select
                            required
                            value={additionalMembers[mIndex]?.standard || ''}
                            onChange={(e) => updateMember(mIndex, 'standard', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold"
                          >
                            <option value="">-- Standard --</option>
                            <option value="5th Standard">5th Standard</option>
                            <option value="6th Standard">6th Standard</option>
                            <option value="7th Standard">7th Standard</option>
                            <option value="8th Standard">8th Standard</option>
                            <option value="9th Standard">9th Standard</option>
                            <option value="10th Standard">10th Standard</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">WhatsApp Mobile *</label>
                          <input
                            type="tel"
                            required
                            value={additionalMembers[mIndex]?.mobile || ''}
                            onChange={(e) => updateMember(mIndex, 'mobile', e.target.value)}
                            placeholder="+91 Mobile"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Email (Student / Parent)</label>
                          <input
                            type="email"
                            value={additionalMembers[mIndex]?.email || ''}
                            onChange={(e) => updateMember(mIndex, 'email', e.target.value)}
                            placeholder="email@example.com"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block font-semibold text-slate-700 mb-1">School Name</label>
                          <input
                            type="text"
                            value={additionalMembers[mIndex]?.school || ''}
                            onChange={(e) => updateMember(mIndex, 'school', e.target.value)}
                            placeholder="School Name (leave blank if same as Team Leader)"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* GENERAL EVENT TEAM TOGGLE (Configurable by Faculty / Student Coordinator) */}
        {!isYoungScientist && (form?.allow_teams || (event?.max_team_size && event.max_team_size > 1)) && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_team"
                {...register('is_team')}
                className="w-4 h-4 text-primary-blue rounded border-slate-300 focus:ring-primary-blue"
              />
              <label htmlFor="is_team" className="text-xs font-bold text-navy-blue flex items-center gap-1.5 cursor-pointer">
                <Users className="w-4 h-4 text-primary-blue" />
                Register as a Team ({form?.min_team_size || event?.min_team_size || 2} to {form?.max_team_size || event?.max_team_size || 4} members)
              </label>
            </div>

            {isTeamWatch && (
              <div className="space-y-4 pt-2 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-navy-text mb-1.5">
                      Team Name *
                    </label>
                    <input
                      type="text"
                      {...register('team_name', { required: isTeamWatch ? 'Team name is required for team registration' : false })}
                      placeholder="e.g. CyberKnights / EXTC Innovators"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue"
                    />
                    {errors.team_name && <p className="text-rose-600 text-[11px] mt-1">{errors.team_name.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy-text mb-1.5">
                      Total Team Members *
                    </label>
                    <select
                      {...register('selected_team_size')}
                      value={teamSize}
                      onChange={(e) => setTeamSize(parseInt(e.target.value, 10))}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white font-semibold text-navy-blue"
                    >
                      {Array.from(
                        { length: (form?.max_team_size || event?.max_team_size || 4) - (form?.min_team_size || event?.min_team_size || 2) + 1 },
                        (_, idx) => {
                          const size = (form?.min_team_size || event?.min_team_size || 2) + idx;
                          return (
                            <option key={size} value={size}>
                              {size} Members (Lead + {size - 1} Members)
                            </option>
                          );
                        }
                      )}
                    </select>
                  </div>
                </div>

                {/* Additional Member Input Cards */}
                <div className="space-y-3">
                  {[...Array(teamSize - 1)].map((_, i) => {
                    const mIndex = i + 2;
                    return (
                      <div key={mIndex} className="p-4 rounded-2xl bg-cream-50 border border-light-blue-200/80 space-y-3">
                        <div className="flex items-center justify-between border-b border-light-blue-200/50 pb-2">
                          <span className="text-xs font-black text-navy-blue">
                            Team Member {mIndex} Details
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary-blue text-white">
                            Participant #{mIndex}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                            <input
                              type="text"
                              required
                              value={additionalMembers[mIndex]?.name || ''}
                              onChange={(e) => updateMember(mIndex, 'name', e.target.value)}
                              placeholder="Full Name"
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">Academic Year *</label>
                            <select
                              required
                              value={additionalMembers[mIndex]?.year || ''}
                              onChange={(e) => updateMember(mIndex, 'year', e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold"
                            >
                              <option value="">-- Year --</option>
                              <option value="1st Year">1st Year</option>
                              <option value="2nd Year">2nd Year</option>
                              <option value="3rd Year">3rd Year</option>
                              <option value="4th Year">4th Year</option>
                            </select>
                          </div>
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">College Email *</label>
                            <input
                              type="email"
                              required
                              value={additionalMembers[mIndex]?.email || ''}
                              onChange={(e) => updateMember(mIndex, 'email', e.target.value)}
                              placeholder="email@college.edu"
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">Mobile (WhatsApp) *</label>
                            <input
                              type="tel"
                              required
                              value={additionalMembers[mIndex]?.mobile || ''}
                              onChange={(e) => updateMember(mIndex, 'mobile', e.target.value)}
                              placeholder="+91 Mobile"
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block font-semibold text-slate-700 mb-1">Department *</label>
                            <select
                              required
                              value={additionalMembers[mIndex]?.department || ''}
                              onChange={(e) => updateMember(mIndex, 'department', e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                            >
                              <option value="">-- Select Department --</option>
                              {COLLEGE_DEPARTMENTS.map(d => (
                                <option key={d} value={d}>{d}</option>
                              ))}
                              <option value="Other">Other (Please specify)</option>
                            </select>

                            {additionalMembers[mIndex]?.department === 'Other' && (
                              <div className="mt-2 animate-fade-in">
                                <input
                                  type="text"
                                  required
                                  value={additionalMembers[mIndex]?.other_department || ''}
                                  onChange={(e) => updateMember(mIndex, 'other_department', e.target.value)}
                                  placeholder="Specify member's department"
                                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-primary-blue/40 bg-light-blue-50/50 text-navy-blue font-semibold"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Section 2: Custom Dynamic Fields configured by Coordinators */}
      {fields.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-light-blue-200/80 shadow-soft space-y-4">
          <h4 className="text-sm font-bold text-navy-blue border-b pb-2 flex items-center justify-between">
            <span>Event Specific Questions</span>
            <span className="text-[11px] font-normal text-slate-400">Configured by Event Coordinators</span>
          </h4>

          <div className="space-y-4">
            {fields.map((field) => {
              const fieldKey = `custom_${field.id}`;
              const isReq = field.is_required;

              return (
                <div key={field.id} className="space-y-1.5">
                  <label className="block text-xs font-semibold text-navy-text">
                    {field.label} {isReq && <span className="text-rose-500">*</span>}
                  </label>

                  {/* Text / Email / Number */}
                  {['text', 'number', 'email', 'date'].includes(field.field_type) && (
                    <input
                      type={field.field_type}
                      placeholder={field.placeholder || ''}
                      {...register(fieldKey, { required: isReq ? `${field.label} is required` : false })}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue"
                    />
                  )}

                  {/* Textarea */}
                  {field.field_type === 'textarea' && (
                    <textarea
                      rows={3}
                      placeholder={field.placeholder || ''}
                      {...register(fieldKey, { required: isReq ? `${field.label} is required` : false })}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue"
                    />
                  )}

                  {/* Dropdown */}
                  {field.field_type === 'dropdown' && (
                    <select
                      {...register(fieldKey, { required: isReq ? `${field.label} is required` : false })}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue"
                    >
                      <option value="">Select option</option>
                      {field.options && field.options.map((opt, i) => (
                        <option key={i} value={opt}>{opt}</option>
                      ))}
                    </select>
                  )}

                  {/* Checkbox */}
                  {field.field_type === 'checkbox' && (
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id={fieldKey}
                        {...register(fieldKey, { required: isReq ? 'This acknowledgement is required' : false })}
                        className="w-4 h-4 text-primary-blue rounded border-slate-300 focus:ring-primary-blue"
                      />
                      <label htmlFor={fieldKey} className="text-xs text-slate-600">
                        {field.placeholder || 'I confirm and agree'}
                      </label>
                    </div>
                  )}

                  {errors[fieldKey] && (
                    <p className="text-rose-600 text-[11px]">{errors[fieldKey].message}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 px-6 rounded-2xl bg-primary-blue hover:bg-primary-blue-hover disabled:opacity-50 text-white font-extrabold text-sm shadow-soft-lg transition-all flex items-center justify-center gap-2"
        >
          {submitting ? (
            <span>Submitting Registration...</span>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Submit Registration ({isYoungScientist && teamSize > 1 ? `Team of ${teamSize}` : isTeamWatch ? `Team Entry` : 'Solo Entry'})</span>
            </>
          )}
        </button>
        <p className="text-[11px] text-center text-slate-400 mt-2">
          By submitting, you confirm the provided WhatsApp contact and student details are accurate.
        </p>
      </div>
    </form>
  );
}
