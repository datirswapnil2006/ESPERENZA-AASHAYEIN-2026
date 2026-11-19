import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { participantService } from '../../services/participantService';
import { CheckCircle2, AlertCircle, Sparkles, Send, Users } from 'lucide-react';

export default function DynamicFormRenderer({ event, form, onSuccess }) {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submittedData, setSubmittedData] = useState(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const isTeamWatch = watch('is_team', false);

  const fields = form?.fields || [];

  const onSubmit = async (data) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      // Split standard fields from custom answers
      const standardFields = {
        event_id: event.id,
        form_id: form?.id,
        full_name: data.full_name,
        erp_number: data.erp_number,
        email: data.email,
        mobile: data.mobile,
        department: data.department,
        year: data.year,
        section: data.section,
        is_team: Boolean(data.is_team),
        team_name: data.team_name || null,
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

      setSubmittedData(result);
      if (onSuccess) onSuccess(result);
    } catch (err) {
      setSubmitError(err.message || 'An error occurred during submission. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedData) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8 text-center animate-fade-in">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h3 className="text-2xl font-extrabold text-navy-blue mb-2">Registration Confirmed!</h3>
        <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
          Your registration for <strong className="text-navy-blue">{event.name}</strong> at {event.festival_slug === 'esperanza' ? 'Esperenza' : 'Aashayein'} has been recorded.
        </p>

        <div className="bg-white rounded-2xl p-5 border border-emerald-200/80 max-w-sm mx-auto mb-6 text-left text-xs space-y-2">
          <div className="flex justify-between border-b pb-2">
            <span className="text-slate-500">Participant:</span>
            <span className="font-bold text-navy-blue">{submittedData.full_name}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-slate-500">ERP Number:</span>
            <span className="font-bold text-navy-blue">{submittedData.erp_number}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-slate-500">Registration ID:</span>
            <span className="font-mono text-primary-blue font-bold">{submittedData.id?.slice(0, 12)}...</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Status:</span>
            <span className="font-bold text-emerald-600">CONFIRMED</span>
          </div>
        </div>

        <button
          onClick={() => setSubmittedData(null)}
          className="px-6 py-2.5 bg-primary-blue text-white rounded-xl text-sm font-semibold hover:bg-primary-blue-hover transition-colors shadow-soft"
        >
          Register Another Student
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

      {/* Section 1: Standard Student Information */}
      <div className="bg-white p-6 rounded-2xl border border-light-blue-200/80 shadow-soft space-y-4">
        <h4 className="text-sm font-bold text-navy-blue border-b pb-2 flex items-center justify-between">
          <span>Student Core Details</span>
          <span className="text-[11px] font-normal text-slate-400">All fields required</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <div>
            <label className="block text-xs font-semibold text-navy-text mb-1.5">
              ERP Number *
            </label>
            <input
              type="text"
              {...register('erp_number', { required: 'ERP number is required' })}
              placeholder="e.g. 2024CS0055"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue"
            />
            {errors.erp_number && <p className="text-rose-600 text-[11px] mt-1">{errors.erp_number.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy-text mb-1.5">
              College Email *
            </label>
            <input
              type="email"
              {...register('email', { 
                required: 'Email is required',
                pattern: { value: /^\S+@\S+$/i, message: 'Valid email required' }
              })}
              placeholder="student@college.edu"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue"
            />
            {errors.email && <p className="text-rose-600 text-[11px] mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy-text mb-1.5">
              Mobile Number (WhatsApp) *
            </label>
            <input
              type="tel"
              {...register('mobile', { required: 'Mobile number is required' })}
              placeholder="+91 98765 43210"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue"
            />
            {errors.mobile && <p className="text-rose-600 text-[11px] mt-1">{errors.mobile.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy-text mb-1.5">
              Department *
            </label>
            <select
              {...register('department', { required: 'Department is required' })}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue"
            >
              <option value="">Select Department</option>
              <option value="Computer Science & Engineering">Computer Science & Engineering</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics & Communication">Electronics & Communication</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Civil Engineering">Civil Engineering</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
              <option value="Management Studies (MBA/BBA)">Management Studies (MBA/BBA)</option>
              <option value="Applied Sciences">Applied Sciences</option>
            </select>
            {errors.department && <p className="text-rose-600 text-[11px] mt-1">{errors.department.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-navy-text mb-1.5">
                Year *
              </label>
              <select
                {...register('year', { required: 'Year required' })}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue"
              >
                <option value="">Year</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
              {errors.year && <p className="text-rose-600 text-[11px] mt-1">{errors.year.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-text mb-1.5">
                Section *
              </label>
              <input
                type="text"
                {...register('section', { required: 'Sec required' })}
                placeholder="e.g. A"
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue"
              />
              {errors.section && <p className="text-rose-600 text-[11px] mt-1">{errors.section.message}</p>}
            </div>
          </div>
        </div>

        {/* Team Registration Toggle if allowed */}
        {form?.allow_teams && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_team"
                {...register('is_team')}
                className="w-4 h-4 text-primary-blue rounded border-slate-300 focus:ring-primary-blue"
              />
              <label htmlFor="is_team" className="text-xs font-bold text-navy-blue flex items-center gap-1.5 cursor-pointer">
                <Users className="w-4 h-4 text-primary-blue" />
                Register as a Team ({form.min_team_size || 1} to {form.max_team_size || 4} members)
              </label>
            </div>

            {isTeamWatch && (
              <div className="mt-3 animate-fade-in">
                <label className="block text-xs font-semibold text-navy-text mb-1.5">
                  Team Name *
                </label>
                <input
                  type="text"
                  {...register('team_name', { required: isTeamWatch ? 'Team name is required for team registration' : false })}
                  placeholder="e.g. CyberKnights / The Strikers"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue"
                />
                {errors.team_name && <p className="text-rose-600 text-[11px] mt-1">{errors.team_name.message}</p>}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Section 2: Custom Dynamic Fields configured by Faculty */}
      {fields.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-light-blue-200/80 shadow-soft space-y-4">
          <h4 className="text-sm font-bold text-navy-blue border-b pb-2 flex items-center justify-between">
            <span>Event Specific Questions</span>
            <span className="text-[11px] font-normal text-slate-400">Configured by Faculty Coordinator</span>
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
                      <option value="">{field.placeholder || 'Choose an option'}</option>
                      {(field.options || []).map((opt, i) => (
                        <option key={i} value={opt}>{opt}</option>
                      ))}
                    </select>
                  )}

                  {/* Radio buttons */}
                  {field.field_type === 'radio' && (
                    <div className="space-y-2 pt-1">
                      {(field.options || []).map((opt, i) => (
                        <label key={i} className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                          <input
                            type="radio"
                            value={opt}
                            {...register(fieldKey, { required: isReq ? 'Please select an option' : false })}
                            className="w-4 h-4 text-primary-blue border-slate-300 focus:ring-primary-blue"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Checkbox */}
                  {field.field_type === 'checkbox' && (
                    <div className="space-y-2 pt-1">
                      {(field.options || []).map((opt, i) => (
                        <label key={i} className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            value={opt}
                            {...register(`${fieldKey}_${i}`)}
                            className="w-4 h-4 text-primary-blue rounded border-slate-300 focus:ring-primary-blue"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {errors[fieldKey] && (
                    <p className="text-rose-600 text-[11px] mt-1">{errors[fieldKey].message}</p>
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
          className="w-full py-3.5 px-6 rounded-2xl bg-primary-blue hover:bg-primary-blue-hover text-white font-bold text-sm shadow-soft hover:shadow-soft-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {submitting ? (
            <span>Recording Registration...</span>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Submit Registration for {event.name}</span>
            </>
          )}
        </button>
        <p className="text-center text-xs text-slate-400 mt-2">
          By registering, you agree to attend on scheduled venue and observe festival conduct guidelines.
        </p>
      </div>
    </form>
  );
}
