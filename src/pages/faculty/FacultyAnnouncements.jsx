import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { announcementService } from '../../services/announcementService';
import { eventService } from '../../services/eventService';
import { coordinatorService } from '../../services/coordinatorService';
import Modal from '../../components/common/Modal';
import { Bell, Plus, Calendar, Sparkles, Send } from 'lucide-react';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export default function FacultyAnnouncements() {
  const { profile, isVerifiedFaculty } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('normal');
  const [targetAudience, setTargetAudience] = useState('all');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [annList, evtList, assignList] = await Promise.all([
        announcementService.getAnnouncements('all'),
        eventService.getAllEvents(),
        coordinatorService.getAllAssignments()
      ]);

      const myEventIds = (assignList || [])
        .filter(a => a.user_id === profile?.id && a.role === 'faculty_coordinator' && a.status === 'active')
        .map(a => a.event_id);

      const myEvents = (evtList || []).filter(e => myEventIds.includes(e.id));
      setEvents(myEvents);
      if (myEvents.length > 0 && !selectedEventId) {
        setSelectedEventId(myEvents[0].id);
      }

      setAnnouncements(annList || []);
    } catch (err) {
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [profile]);

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!isVerifiedFaculty) {
      alert('Your faculty account is pending verification. Only verified faculty can broadcast announcements.');
      return;
    }

    setSubmitting(true);
    try {
      await announcementService.createAnnouncement({
        title,
        content,
        priority,
        target_audience: targetAudience,
        event_id: selectedEventId || null,
        author_id: profile.id,
        author_name: profile.full_name
      });
      setShowModal(false);
      setTitle('');
      setContent('');
      loadData();
    } catch (err) {
      alert('Error creating announcement: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-light-blue-200 shadow-soft">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-light-blue-100 text-primary-blue text-[11px] font-extrabold uppercase tracking-wider mb-2">
            <Bell className="w-3.5 h-3.5" />
            <span>COMMUNICATION BROADCASTS</span>
          </div>
          <h2 className="text-2xl font-black text-navy-blue">Event Announcements</h2>
          <p className="text-xs text-slate-500 mt-1">
            Broadcast technical guidelines, soundcheck timings, and venue updates to student coordinators and participants.
          </p>
        </div>

        <button
          onClick={() => {
            if (!isVerifiedFaculty) {
              alert('Faculty account verification pending.');
              return;
            }
            setShowModal(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-primary-blue hover:bg-primary-blue-hover text-white text-xs font-bold shadow-soft transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Announcement</span>
        </button>
      </div>

      {/* Announcements List */}
      {loading ? (
        <LoadingSkeleton lines={6} />
      ) : announcements.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-light-blue-200">
          <p className="text-slate-500 font-medium">No announcements posted yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className="bg-white p-6 rounded-3xl border border-light-blue-200 shadow-soft space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    ann.priority === 'urgent'
                      ? 'bg-rose-100 text-rose-800'
                      : ann.priority === 'high'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                  }`}>
                    {ann.priority} Priority
                  </span>
                  <span className="text-[11px] text-slate-400 font-semibold uppercase">
                    Audience: {ann.target_audience}
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(ann.created_at).toLocaleString()}
                </span>
              </div>

              <h4 className="text-base font-bold text-navy-blue">{ann.title}</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {ann.content}
              </p>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Posted by {ann.author_name || 'Festival Committee'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Broadcast Announcement"
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleCreateAnnouncement} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-navy-blue mb-1">Headline / Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Amphitheatre Audio Soundcheck Guidelines"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-navy-blue mb-1">Priority Level</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-xs"
                >
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent Alert</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-navy-blue mb-1">Target Audience</label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-xs"
                >
                  <option value="all">Everyone (Public & Coordinators)</option>
                  <option value="coordinators">Coordinators Only</option>
                  <option value="participants">Registered Participants Only</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-navy-blue mb-1">Message Content *</label>
              <textarea
                rows={4}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write full details, timings, instructions..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-primary-blue hover:bg-primary-blue-hover text-white font-bold shadow-soft flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Publish</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
}
