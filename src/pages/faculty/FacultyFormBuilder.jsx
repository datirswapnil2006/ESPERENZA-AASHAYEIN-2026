import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { eventService } from '../../services/eventService';
import { coordinatorService } from '../../services/coordinatorService';
import { formService } from '../../services/formService';
import FormFieldBuilder from '../../components/forms/FormFieldBuilder';
import { 
  FileEdit, 
  Send, 
  CheckCircle2, 
  Clock, 
  Copy, 
  ExternalLink, 
  Layers, 
  Sparkles, 
  AlertCircle 
} from 'lucide-react';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export default function FacultyFormBuilder() {
  const { profile, isVerifiedFaculty } = useAuth();
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form settings state
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [deadline, setDeadline] = useState('');
  const [allowTeams, setAllowTeams] = useState(false);
  const [minTeam, setMinTeam] = useState(1);
  const [maxTeam, setMaxTeam] = useState(4);
  const [savingSettings, setSavingSettings] = useState(false);
  const [copied, setCopied] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [allEvents, allAssigns] = await Promise.all([
        eventService.getAllEvents(),
        coordinatorService.getAllAssignments()
      ]);

      const myEventIds = (allAssigns || [])
        .filter(a => a.user_id === profile?.id && a.role === 'faculty_coordinator' && a.status === 'active')
        .map(a => a.event_id);

      const myEvents = (allEvents || []).filter(e => myEventIds.includes(e.id));
      setEvents(myEvents);

      const activeEvtId = selectedEventId || (myEvents[0]?.id);
      if (activeEvtId) {
        setSelectedEventId(activeEvtId);
        await loadForm(activeEvtId);
      }
    } catch (err) {
      console.error('Error loading form builder:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadForm(evtId) {
    const fetched = await formService.getFormWithFields(evtId);
    if (fetched) {
      setForm(fetched);
      setFormTitle(fetched.title || '');
      setFormDesc(fetched.description || '');
      setDeadline(fetched.deadline ? fetched.deadline.slice(0, 16) : '');
      setAllowTeams(Boolean(fetched.allow_teams));
      setMinTeam(fetched.min_team_size ?? 0);
      setMaxTeam(fetched.max_team_size ?? 0);
    } else {
      // Create empty draft form skeleton
      const currentEvt = events.find(e => e.id === evtId);
      const newDraft = {
        event_id: evtId,
        title: `${currentEvt?.name || 'Event'} Registration Form`,
        description: `Official registration form for ${currentEvt?.name || 'festival event'}.`,
        status: 'draft',
        allow_teams: false,
        created_by: profile?.id,
        fields: []
      };
      setForm(newDraft);
      setFormTitle(newDraft.title);
      setFormDesc(newDraft.description);
    }
  }

  useEffect(() => {
    loadData();
  }, [profile]);

  const handleEventSwitch = async (newEvtId) => {
    setSelectedEventId(newEvtId);
    await loadForm(newEvtId);
  };

  const handleSaveSettings = async (targetStatus) => {
    if (!isVerifiedFaculty) {
      alert('Your faculty account is pending verification. Only verified faculty can publish registration forms.');
      return;
    }
    setSavingSettings(true);
    try {
      const payload = {
        id: form?.id?.startsWith('form-') ? undefined : form?.id,
        event_id: selectedEventId,
        title: formTitle,
        description: formDesc,
        deadline: deadline ? new Date(deadline).toISOString() : null,
        allow_teams: allowTeams,
        min_team_size: isNaN(parseInt(minTeam, 10)) ? 0 : parseInt(minTeam, 10),
        max_team_size: isNaN(parseInt(maxTeam, 10)) ? 0 : parseInt(maxTeam, 10),
        status: targetStatus || form?.status || 'draft',
        created_by: profile?.id
      };

      const saved = await formService.saveForm(payload);
      setForm(prev => ({ ...prev, ...saved }));
      alert(`Registration form ${targetStatus ? targetStatus.toUpperCase() : 'SAVED'} successfully!`);
    } catch (err) {
      alert('Error saving form: ' + err.message);
    } finally {
      setSavingSettings(false);
    }
  };

  const currentEvent = events.find(e => e.id === selectedEventId);
  const publicRegUrl = currentEvent ? `${window.location.origin}/register/${currentEvent.festival_slug}/${currentEvent.slug}` : '';

  const copyPublicUrl = () => {
    navigator.clipboard.writeText(publicRegUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <LoadingSkeleton lines={6} />;

  if (events.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-16 text-center border border-light-blue-200">
        <p className="text-slate-500 font-medium">You have no assigned events to configure forms for.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Header & Status Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-light-blue-200 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-light-blue-100 text-primary-blue text-[11px] font-extrabold uppercase tracking-wider mb-2">
            <FileEdit className="w-3.5 h-3.5" />
            <span>DYNAMIC FORM BUILDER MODULE</span>
          </div>
          <h2 className="text-2xl font-black text-navy-blue">Registration Form Builder</h2>
          <p className="text-xs text-slate-500 mt-1">
            Build custom questions, toggle solo or team entries, configure deadlines, and generate shareable public links.
          </p>
        </div>

        {events.length > 1 && (
          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-xs font-bold text-slate-500">Active Event:</span>
            <select
              value={selectedEventId}
              onChange={(e) => handleEventSwitch(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white text-navy-blue"
            >
              {events.map(e => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Shareable Public URL Bar */}
      {currentEvent && (
        <div className="bg-gradient-to-r from-navy-blue via-navy-blue-light to-primary-blue-dark text-white p-5 rounded-2xl shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                form?.status === 'published' ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-navy-blue'
              }`}>
                {form?.status ? form.status.toUpperCase() : 'DRAFT'}
              </span>
              <span className="text-xs font-bold text-light-blue-200">Public Registration Link</span>
            </div>
            <p className="text-xs font-mono text-slate-200 truncate max-w-lg">
              {publicRegUrl}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={copyPublicUrl}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors border border-white/20"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
            <a
              href={`/register/${currentEvent.festival_slug}/${currentEvent.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-white text-navy-blue hover:bg-light-blue-50 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Test Public Form</span>
            </a>
          </div>
        </div>
      )}

      {/* Form Settings Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-light-blue-200 shadow-soft space-y-6">
        <h3 className="text-base font-extrabold text-navy-blue border-b pb-3">
          1. Form Metadata & Entry Parameters
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-navy-blue mb-1.5">Form Title *</label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. Aashayein 2026 Dance Registration"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-blue text-xs font-semibold"
            />
          </div>

          <div>
            <label className="block font-bold text-navy-blue mb-1.5">Registration Deadline</label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-blue text-xs font-semibold"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-navy-blue mb-1.5">Form Instructions / Description</label>
            <textarea
              rows={2}
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              placeholder="Provide instructions for students regarding submission requirements..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <div className="sm:col-span-2 pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="team_toggle"
                checked={allowTeams}
                onChange={(e) => setAllowTeams(e.target.checked)}
                className="w-4 h-4 text-primary-blue rounded border-slate-300"
              />
              <label htmlFor="team_toggle" className="font-bold text-navy-blue text-xs cursor-pointer">
                Allow Team Submissions (Multiple members under one team name)
              </label>
            </div>

            {allowTeams && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-500">Min:</span>
                  <input
                    type="number"
                    min="0"
                    value={minTeam}
                    onChange={(e) => setMinTeam(e.target.value)}
                    className="w-16 px-2 py-1.5 rounded-lg border border-slate-200 text-center font-bold"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-500">Max:</span>
                  <input
                    type="number"
                    min="0"
                    value={maxTeam}
                    onChange={(e) => setMaxTeam(e.target.value)}
                    className="w-16 px-2 py-1.5 rounded-lg border border-slate-200 text-center font-bold"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons for Form State */}
        <div className="pt-4 border-t flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            disabled={savingSettings}
            onClick={() => handleSaveSettings('draft')}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold"
          >
            Save as Draft
          </button>
          <button
            type="button"
            disabled={savingSettings}
            onClick={() => handleSaveSettings('closed')}
            className="px-4 py-2.5 rounded-xl border border-amber-200 text-amber-700 hover:bg-amber-50 text-xs font-bold"
          >
            Close Registration
          </button>
          <button
            type="button"
            disabled={savingSettings}
            onClick={() => handleSaveSettings('published')}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-soft flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Publish Registration Form</span>
          </button>
        </div>
      </div>

      {/* Dynamic Form Field Builder Component */}
      {form && (
        <FormFieldBuilder
          form={form}
          onFieldsUpdated={(newFields) => {
            setForm(prev => ({ ...prev, fields: newFields }));
          }}
        />
      )}

    </div>
  );
}
