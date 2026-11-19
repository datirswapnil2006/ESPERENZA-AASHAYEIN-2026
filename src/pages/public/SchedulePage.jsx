import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventService } from '../../services/eventService';
import { Calendar, Clock, MapPin, Cpu, Music, ChevronRight } from 'lucide-react';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export default function SchedulePage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFestival, setActiveFestival] = useState('all');

  useEffect(() => {
    async function loadEvents() {
      try {
        const all = await eventService.getAllEvents();
        // Sort by event_date ascending
        const sorted = all.filter(e => e.status !== 'archived').sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
        setEvents(sorted);
      } catch (err) {
        console.error('Error fetching schedule:', err);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  const filtered = activeFestival === 'all' 
    ? events 
    : events.filter(e => e.festival_slug === activeFestival);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 animate-fade-in">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-primary-blue bg-light-blue-100 px-3 py-1 rounded-full">
          Master Itinerary 2026–2027
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-navy-blue">
          Festival Timeline & Schedule
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Chronological schedule of technical championships and cultural showcases across campus.
        </p>

        {/* Filter */}
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setActiveFestival('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeFestival === 'all' ? 'bg-primary-blue text-white shadow-soft' : 'bg-white border text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Festivals
          </button>
          <button
            onClick={() => setActiveFestival('esperanza')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeFestival === 'esperanza' ? 'bg-primary-blue text-white shadow-soft' : 'bg-white border text-slate-600 hover:bg-slate-50'
            }`}
          >
            Esperenza Only
          </button>
          <button
            onClick={() => setActiveFestival('aashayein')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeFestival === 'aashayein' ? 'bg-primary-blue text-white shadow-soft' : 'bg-white border text-slate-600 hover:bg-slate-50'
            }`}
          >
            Aashayein Only
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton lines={6} />
      ) : (
        <div className="space-y-4">
          {filtered.map((item, idx) => {
            const isTech = item.festival_slug === 'esperanza';
            const dateObj = new Date(item.event_date);

            return (
              <div
                key={item.id}
                className="bg-white p-6 rounded-3xl border border-light-blue-200 shadow-soft hover:shadow-soft-lg transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3.5 rounded-2xl flex flex-col items-center justify-center min-w-[70px] text-center ${
                    isTech ? 'bg-light-blue-100 text-primary-blue' : 'bg-amber-50 text-amber-800'
                  }`}>
                    <span className="text-xs font-extrabold uppercase">
                      {dateObj.toLocaleDateString(undefined, { month: 'short' })}
                    </span>
                    <span className="text-2xl font-black">
                      {dateObj.getDate()}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        isTech ? 'bg-primary-blue text-white' : 'bg-navy-blue text-white'
                      }`}>
                        {isTech ? 'Esperenza' : 'Aashayein'}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        {item.category}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-navy-blue">{item.name}</h3>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-primary-blue" />
                        {item.venue}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-primary-blue" />
                        {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <Link
                    to={`/register/${item.festival_slug}/${item.slug}`}
                    className="px-4 py-2 rounded-xl bg-primary-blue hover:bg-primary-blue-hover text-white text-xs font-bold shadow-soft transition-all"
                  >
                    Register
                  </Link>
                  <Link
                    to={`/events/${item.festival_slug}/${item.slug}`}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
                  >
                    Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
