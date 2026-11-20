import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventService } from '../../services/eventService';
import { 
  Sparkles, 
  ArrowRight, 
  Cpu, 
  Music, 
  Calendar, 
  MapPin, 
  Users, 
  Award, 
  CheckCircle2, 
  Flame, 
  Layers,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Search
} from 'lucide-react';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';

export default function HomePage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, esperanza, aashayein

  useEffect(() => {
    async function loadData() {
      try {
        const allEvents = await eventService.getAllEvents();
        setEvents(allEvents.filter(e => e.status !== 'archived'));
      } catch (err) {
        console.error('Error fetching homepage events:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    // Subscribe to realtime updates for events
    const unsub = eventService.subscribeToEvents(() => {
      loadData();
    });
    return () => unsub();
  }, []);

  const technicalEvents = events.filter(e => 
    e.festival_slug?.toLowerCase().startsWith('esper') || 
    e.festival_id === '11111111-1111-1111-1111-111111111111'
  );
  const culturalEvents = events.filter(e => 
    e.festival_slug?.toLowerCase().startsWith('aash') || 
    e.festival_id === '22222222-2222-2222-2222-222222222222'
  );

  const filteredEvents = activeTab === 'all' 
    ? events 
    : activeTab === 'esperanza' 
      ? technicalEvents 
      : culturalEvents;

  return (
    <div className="space-y-24 pb-20 animate-fade-in">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 bg-gradient-to-b from-cream via-light-blue-50/50 to-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-light-blue-100 text-primary-blue text-xs font-bold tracking-wide border border-light-blue-200">
                <Sparkles className="w-4 h-4 text-primary-blue animate-pulse" />
                <span>ANNUAL INTER-COLLEGIATE FESTIVAL 2026–2027</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black text-navy-blue tracking-tight leading-[1.1]">
                ESPERENZA <span className="text-primary-blue font-light">&</span> AASHAYEIN
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 font-medium max-w-2xl leading-relaxed">
                "Celebrating Innovation, Creativity and Talent." The premier college fest uniting cutting-edge engineering, robotics, high-energy dance, theatre, and musical masterminds.
              </p>

              {/* Call-to-actions */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/esperanza"
                  className="px-6 py-3.5 rounded-2xl bg-primary-blue hover:bg-primary-blue-hover text-white font-bold text-sm shadow-soft hover:shadow-soft-lg transition-all flex items-center gap-2"
                >
                  <Cpu className="w-4 h-4" />
                  <span>Explore Esperenza</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>

                <Link
                  to="/aashayein"
                  className="px-6 py-3.5 rounded-2xl bg-navy-blue hover:bg-navy-blue-light text-white font-bold text-sm shadow-soft hover:shadow-soft-lg transition-all flex items-center gap-2"
                >
                  <Music className="w-4 h-4 text-light-blue-200" />
                  <span>Explore Aashayein</span>
                  <ArrowRight className="w-4 h-4 ml-1 text-light-blue-200" />
                </Link>

                <Link
                  to="/coordinator-signup"
                  className="px-6 py-3.5 rounded-2xl border-2 border-primary-blue/30 text-navy-blue hover:bg-light-blue-50 font-bold text-sm transition-all"
                >
                  Coordinator Portal
                </Link>
              </div>

              {/* Quick Trust Highlights */}
              <div className="pt-6 border-t border-light-blue-200/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-semibold text-slate-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Live Supabase Cloud Database</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Role-Based Coordinator Console</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Dynamic Form Builder</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Cards */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="group overflow-hidden rounded-3xl shadow-soft-lg border-2 border-white transform hover:-translate-y-1 transition-all">
                  <div className="relative h-56">
                    <img
                      src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80"
                      alt="Robotics & Innovation"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-blue/80 via-transparent to-transparent flex items-end p-4">
                      <span className="text-white font-bold text-sm">Robo Race & AI Bots</span>
                    </div>
                  </div>
                </div>

                <div className="group overflow-hidden rounded-3xl shadow-soft-lg border-2 border-white transform hover:-translate-y-1 transition-all">
                  <div className="relative h-44">
                    <img
                      src="https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=600&q=80"
                      alt="Dance Performance"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-blue/80 via-transparent to-transparent flex items-end p-4">
                      <span className="text-white font-bold text-sm">Cultural Dance Arena</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-8">
                <div className="group overflow-hidden rounded-3xl shadow-soft-lg border-2 border-white transform hover:-translate-y-1 transition-all">
                  <div className="relative h-44">
                    <img
                      src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80"
                      alt="Young Scientist Exhibition"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-blue/80 via-transparent to-transparent flex items-end p-4">
                      <span className="text-white font-bold text-sm">Scientific Research</span>
                    </div>
                  </div>
                </div>

                <div className="group overflow-hidden rounded-3xl shadow-soft-lg border-2 border-white transform hover:-translate-y-1 transition-all">
                  <div className="relative h-56">
                    <img
                      src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80"
                      alt="Live Singing & Concert"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-blue/80 via-transparent to-transparent flex items-end p-4">
                      <span className="text-white font-bold text-sm">Symphony Musical Stage</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. FESTIVAL OVERVIEW: ESPERENZA & AASHAYEIN */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-primary-blue">
            Two Grand Pillars of Excellence
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-navy-blue">
            Technical Rigor Meets Artistic Expression
          </h3>
          <p className="text-sm sm:text-base text-slate-600">
            Discover our synchronized festival tracks designed to empower future engineers, scientists, artists, dramatists, and orators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card: Esperenza */}
          <div className="bg-white rounded-3xl p-8 border border-light-blue-200 shadow-soft hover:shadow-soft-lg transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-light-blue-100 text-primary-blue flex items-center justify-center font-bold">
                <Cpu className="w-7 h-7" />
              </div>
              <div className="inline-block px-3 py-1 rounded-full bg-light-blue-50 text-primary-blue text-xs font-bold border border-light-blue-200">
                TECHNICAL FESTIVAL 2026–2027
              </div>
              <h4 className="text-2xl font-black text-navy-blue">Esperenza</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Esperenza is the crucible of scientific curiosity. Featuring high-intensity competitions like the Robo Race, Young Scientist Exhibition, Hackathons, and Circuit Debugging, this is where cutting-edge engineering ideas transform into reality.
              </p>
              
              <ul className="space-y-2 text-xs font-semibold text-slate-700 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Robo Race Obstacle Arena Championship</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Young Scientist R&D Working Prototype Exhibition</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Industry Jury Evaluation & Cash Grants</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <Link
                to="/esperanza"
                className="inline-flex items-center gap-2 font-bold text-sm text-primary-blue group-hover:text-primary-blue-hover"
              >
                <span>View All Esperenza Technical Events</span>
                <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Card: Aashayein */}
          <div className="bg-white rounded-3xl p-8 border border-light-blue-200 shadow-soft hover:shadow-soft-lg transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-navy-blue/10 text-navy-blue flex items-center justify-center font-bold">
                <Music className="w-7 h-7" />
              </div>
              <div className="inline-block px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                CULTURAL EXTRAVAGANZA 2026–2027
              </div>
              <h4 className="text-2xl font-black text-navy-blue">Aashayein</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Aashayein is the vibrant soul of student creativity. Celebrating performing arts through high-energy Solo & Group Dance, Symphony Singing, Anchoring / RJ talent searches, and theatrical Nukkad Natak drama.
              </p>

              <ul className="space-y-2 text-xs font-semibold text-slate-700 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Inter-Collegiate Dance Championship (Solo & Crew)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Official Anchoring & Campus RJ Talent Hunt</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Street Play (Nukkad Natak) & Proscenium Drama</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <Link
                to="/aashayein"
                className="inline-flex items-center gap-2 font-bold text-sm text-navy-blue group-hover:text-primary-blue"
              >
                <span>View All Aashayein Cultural Events</span>
                <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 3. DYNAMIC FEATURED EVENTS SECTION (Fetched dynamically from Supabase) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary-blue">
              Dynamic Festival Program
            </span>
            <h3 className="text-3xl font-extrabold text-navy-blue mt-1">
              Active Events & Competitions
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Live updates directly synchronized with Supabase database. Coordinators can add new events without modifying code.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-light-blue-200 self-start md:self-auto shadow-sm">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'all'
                  ? 'bg-primary-blue text-white shadow-soft'
                  : 'text-slate-600 hover:text-navy-blue'
              }`}
            >
              All Events ({events.length})
            </button>
            <button
              onClick={() => setActiveTab('esperanza')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'esperanza'
                  ? 'bg-primary-blue text-white shadow-soft'
                  : 'text-slate-600 hover:text-navy-blue'
              }`}
            >
              Esperenza ({technicalEvents.length})
            </button>
            <button
              onClick={() => setActiveTab('aashayein')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'aashayein'
                  ? 'bg-primary-blue text-white shadow-soft'
                  : 'text-slate-600 hover:text-navy-blue'
              }`}
            >
              Aashayein ({culturalEvents.length})
            </button>
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
          <div className="bg-white rounded-3xl p-12 text-center border border-light-blue-200">
            <p className="text-slate-500 font-medium">No events found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const isTech = event.festival_slug === 'esperanza';
              return (
                <div
                  key={event.id}
                  className="bg-white rounded-3xl overflow-hidden border border-light-blue-200 shadow-soft hover:shadow-soft-lg transition-all duration-300 flex flex-col group"
                >
                  {/* Event Thumbnail */}
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    <img
                      src={event.image_url || (isTech ? 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80' : 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80')}
                      alt={event.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide text-white shadow-sm ${
                        isTech ? 'bg-primary-blue' : 'bg-navy-blue'
                      }`}>
                        {isTech ? 'Esperenza' : 'Aashayein'}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/90 text-navy-blue backdrop-blur-sm shadow-sm">
                        {event.category}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h4 className="text-lg font-black text-navy-blue group-hover:text-primary-blue transition-colors leading-snug">
                        {event.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
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
                    </div>

                    {/* Actions */}
                    <div className="pt-2 flex items-center gap-2">
                      <Link
                        to={`/events/${event.festival_slug || 'festival'}/${event.slug}`}
                        className="flex-1 text-center py-2.5 px-3 rounded-xl border border-light-blue-200 text-navy-blue hover:bg-light-blue-50 text-xs font-bold transition-colors"
                      >
                        Details
                      </Link>
                      <Link
                        to={`/register/${event.festival_slug || 'festival'}/${event.slug}`}
                        className="flex-1 text-center py-2.5 px-3 rounded-xl bg-primary-blue hover:bg-primary-blue-hover text-white text-xs font-bold shadow-soft transition-all"
                      >
                        Register
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. COORDINATOR INVITATION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-navy-blue via-navy-blue-light to-primary-blue-dark text-white rounded-3xl p-8 sm:p-12 shadow-soft-lg flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl text-center lg:text-left">
            <span className="text-xs font-bold text-light-blue-200 uppercase tracking-widest">
              Join The Leadership Council
            </span>
            <h3 className="text-2xl sm:text-3xl font-black">
              Faculty & Student Coordinator Registration
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Faculty members and student leaders can register to manage events, configure participant registration forms, organize volunteer cohorts, and review real-time submissions.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Link
              to="/coordinator-signup"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white text-navy-blue font-bold text-sm shadow-soft hover:bg-light-blue-50 transition-all text-center"
            >
              Coordinator Sign Up
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-white/30 text-white font-bold text-sm hover:bg-white/10 transition-all text-center"
            >
              Sign In to Dashboard
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
