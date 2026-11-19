import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { eventService } from '../../services/eventService';
import AdminEventModal from './AdminEventModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { 
  Calendar, 
  MapPin, 
  Search, 
  Plus, 
  Edit3, 
  Archive, 
  Eye, 
  Sparkles, 
  Filter,
  CheckCircle2,
  Users
} from 'lucide-react';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';

export default function AdminFestivalEvents() {
  const { slug } = useParams(); // 'esperanza' or 'aashayein'
  const isTech = slug === 'esperanza';

  const [festival, setFestival] = useState(null);
  const [festivals, setFestivals] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [showModal, setShowModal] = useState(false);
  const [selectedEventToEdit, setSelectedEventToEdit] = useState(null);

  const [archiveTarget, setArchiveTarget] = useState(null);
  const [archiving, setArchiving] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [allFestivals, allEvents] = await Promise.all([
        eventService.getFestivals(),
        eventService.getAllEvents()
      ]);
      setFestivals(allFestivals || []);
      const current = allFestivals?.find(f => f.slug === slug);
      setFestival(current);

      const festivalEvents = allEvents?.filter(e => e.festival_slug === slug || e.festival_id === current?.id);
      setEvents(festivalEvents || []);
    } catch (err) {
      console.error('Error loading festival events:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();

    const unsub = eventService.subscribeToEvents(() => loadData());
    return () => unsub();
  }, [slug]);

  const handleArchiveConfirm = async () => {
    if (!archiveTarget) return;
    setArchiving(true);
    try {
      await eventService.archiveEvent(archiveTarget.id);
      setArchiveTarget(null);
      loadData();
    } catch (err) {
      alert('Error archiving event: ' + err.message);
    } finally {
      setArchiving(false);
    }
  };

  const filteredEvents = events.filter((e) => {
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          e.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-light-blue-200 shadow-soft">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase text-white ${
              isTech ? 'bg-primary-blue' : 'bg-navy-blue'
            }`}>
              {isTech ? 'Esperenza' : 'Aashayein'}
            </span>
            <span className="text-xs text-slate-400 font-semibold">2026–2027 Edition</span>
          </div>
          <h2 className="text-2xl font-black text-navy-blue">
            {festival?.name || (isTech ? 'Esperenza Technical' : 'Aashayein Cultural')} Events
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Create, update, archive and manage competitions for {festival?.name}.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedEventToEdit(null);
            setShowModal(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-primary-blue hover:bg-primary-blue-hover text-white text-xs font-bold shadow-soft transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New {festival?.name} Event</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-light-blue-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search event name or category..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-blue"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['all', 'upcoming', 'ongoing', 'completed', 'archived'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-primary-blue text-white shadow-soft'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Event Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-light-blue-200">
          <p className="text-sm font-semibold text-slate-500">No events found matching criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((evt) => (
            <div
              key={evt.id}
              className="bg-white rounded-3xl overflow-hidden border border-light-blue-200 shadow-soft hover:shadow-soft-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 bg-slate-100 overflow-hidden">
                  <img
                    src={evt.image_url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80'}
                    alt={evt.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-navy-blue backdrop-blur-sm shadow-sm">
                      {evt.category}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase shadow-sm ${
                      evt.status === 'archived' ? 'bg-slate-500 text-white' : 'bg-emerald-600 text-white'
                    }`}>
                      {evt.status}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <h4 className="text-base font-black text-navy-blue">{evt.name}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2">{evt.description}</p>

                  <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-primary-blue shrink-0" />
                      <span className="truncate">{evt.venue}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-primary-blue shrink-0" />
                      <span>{new Date(evt.event_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-0 flex items-center gap-2 border-t border-slate-100">
                <Link
                  to={`/events/${evt.festival_slug || slug}/${evt.slug}`}
                  target="_blank"
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
                  title="View Public Page"
                >
                  <Eye className="w-4 h-4" />
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedEventToEdit(evt);
                    setShowModal(true);
                  }}
                  className="flex-1 py-2 px-3 rounded-xl border border-light-blue-200 text-primary-blue hover:bg-light-blue-50 text-xs font-bold flex items-center justify-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                {evt.status !== 'archived' && (
                  <button
                    type="button"
                    onClick={() => setArchiveTarget(evt)}
                    className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold"
                    title="Archive Event (Preserves history)"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Event Modal */}
      {showModal && (
        <AdminEventModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          eventToEdit={selectedEventToEdit}
          festivals={festivals}
          onSave={() => loadData()}
        />
      )}

      {/* Archive Confirmation Dialog */}
      {archiveTarget && (
        <ConfirmDialog
          isOpen={Boolean(archiveTarget)}
          onClose={() => setArchiveTarget(null)}
          onConfirm={handleArchiveConfirm}
          title={`Archive "${archiveTarget.name}"?`}
          message="Archiving this competition removes it from coordinator registration dropdowns and closes public participant signups. All existing historical registration data, teams, and reports are safely preserved."
          confirmText="Archive Event"
          confirmVariant="warning"
          loading={archiving}
        />
      )}

    </div>
  );
}
