import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { eventService } from '../../services/eventService';
import { 
  Sparkles, 
  MapPin, 
  Calendar, 
  Users, 
  Search, 
  ArrowRight, 
  Cpu, 
  Music,
  CheckCircle2
} from 'lucide-react';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';

export default function FestivalPage({ defaultSlug }) {
  const params = useParams();
  const slug = defaultSlug || params.slug || 'esperanza';

  const [festival, setFestival] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    async function fetchFestivalData() {
      setLoading(true);
      try {
        const fest = await eventService.getFestivalBySlug(slug);
        const festEvents = await eventService.getEventsByFestival(fest?.id || slug);
        setFestival(fest);
        setEvents(festEvents.filter(e => e.status !== 'archived'));
      } catch (err) {
        console.error('Error fetching festival details:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchFestivalData();
  }, [slug]);

  const categories = ['All', ...new Set(events.map(e => e.category).filter(Boolean))];

  const filteredEvents = events.filter((e) => {
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          e.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || e.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const isTech = slug === 'esperanza';

  return (
    <div className="space-y-16 pb-20 animate-fade-in">
      
      {/* Header Banner */}
      <section className={`relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden text-white ${
        isTech ? 'bg-gradient-to-r from-navy-blue via-navy-blue-light to-primary-blue-dark' : 'bg-gradient-to-r from-navy-blue via-indigo-950 to-navy-blue-light'
      }`}>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-light-blue-200 text-xs font-bold border border-white/20">
              {isTech ? <Cpu className="w-4 h-4 text-light-blue-300" /> : <Music className="w-4 h-4 text-light-blue-300" />}
              <span>{isTech ? 'TECHNICAL EXTRAVAGANZA' : 'CULTURAL CELEBRATION'} 2026–2027</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
              {festival?.name || (isTech ? 'Esperenza' : 'Aashayein')}
            </h1>

            <p className="text-base sm:text-lg text-slate-200 font-medium leading-relaxed">
              {festival?.tagline || 'Celebrating Innovation, Creativity and Talent.'}
            </p>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {festival?.description}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content & Search Filters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Search & Category Filter Toolbar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-light-blue-200 shadow-soft flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${isTech ? 'Esperenza' : 'Aashayein'} events...`}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-primary-blue text-white shadow-soft'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Event Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-light-blue-200">
            <p className="text-slate-500 font-medium">No competitions match your search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-3xl overflow-hidden border border-light-blue-200 shadow-soft hover:shadow-soft-lg transition-all duration-300 flex flex-col group"
              >
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img
                    src={event.image_url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80'}
                    alt={event.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/90 text-navy-blue backdrop-blur-sm shadow-sm">
                      {event.category}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h4 className="text-lg font-black text-navy-blue group-hover:text-primary-blue transition-colors">
                      {event.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                      {event.description}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-primary-blue shrink-0" />
                      <span className="truncate">{event.venue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-primary-blue shrink-0" />
                      <span>{new Date(event.event_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    {event.max_team_size > 1 && (
                      <div className="flex items-center gap-2 text-emerald-600 font-semibold">
                        <Users className="w-3.5 h-3.5 shrink-0" />
                        <span>Team Size: {event.min_team_size} - {event.max_team_size} members</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <Link
                      to={`/events/${slug}/${event.slug}`}
                      className="flex-1 text-center py-2.5 px-3 rounded-xl border border-light-blue-200 text-navy-blue hover:bg-light-blue-50 text-xs font-bold transition-colors"
                    >
                      View Details
                    </Link>
                    <Link
                      to={`/register/${slug}/${event.slug}`}
                      className="flex-1 text-center py-2.5 px-3 rounded-xl bg-primary-blue hover:bg-primary-blue-hover text-white text-xs font-bold shadow-soft transition-all"
                    >
                      Register Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
