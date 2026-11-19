import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Calendar, Mail, Phone, MapPin, ExternalLink, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-navy-blue text-white mt-auto border-t border-navy-blue-light/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Column 1: Festival Branding */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-blue flex items-center justify-center text-white shadow-soft">
                <Sparkles className="w-5 h-5 text-cream" />
              </div>
              <span className="font-extrabold text-lg text-white">
                ESPERENZA <span className="text-light-blue-200 font-light">&</span> AASHAYEIN
              </span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              "Celebrating Innovation, Creativity and Talent." The official unified platform for technical breakthroughs and cultural celebrations 2026–2027.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-light-blue-200">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Realtime Centralized Coordinator Network</span>
            </div>
          </div>

          {/* Column 2: Festivals & Events */}
          <div>
            <h4 className="font-semibold text-white tracking-wide text-sm mb-4 border-b border-white/10 pb-2">
              Festival Portals
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <Link to="/esperanza" className="hover:text-primary-blue-light transition-colors flex items-center justify-between">
                  <span>Esperenza (Technical)</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                </Link>
              </li>
              <li>
                <Link to="/aashayein" className="hover:text-primary-blue-light transition-colors flex items-center justify-between">
                  <span>Aashayein (Cultural)</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                </Link>
              </li>
              <li>
                <Link to="/register/esperanza/young-scientist" className="hover:text-primary-blue-light transition-colors">
                  Young Scientist Exhibition
                </Link>
              </li>
              <li>
                <Link to="/register/aashayein/dance" className="hover:text-primary-blue-light transition-colors">
                  Dance Championship
                </Link>
              </li>
              <li>
                <Link to="/schedule" className="hover:text-primary-blue-light transition-colors">
                  Full Festival Schedule
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Coordinators & Administration */}
          <div>
            <h4 className="font-semibold text-white tracking-wide text-sm mb-4 border-b border-white/10 pb-2">
              Coordinator Gateway
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <Link to="/login" className="hover:text-primary-blue-light transition-colors">
                  Super Admin Console
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-primary-blue-light transition-colors">
                  Faculty Coordinator Login
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-primary-blue-light transition-colors">
                  Student Coordinator Login
                </Link>
              </li>
              <li>
                <Link to="/coordinator-signup" className="hover:text-primary-blue-light transition-colors">
                  New Coordinator Registration
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Venue */}
          <div>
            <h4 className="font-semibold text-white tracking-wide text-sm mb-4 border-b border-white/10 pb-2">
              Campus Headquarters
            </h4>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-primary-blue-light shrink-0 mt-0.5" />
                <span>Central Auditorium & Innovation Center, University Campus</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-primary-blue-light shrink-0" />
                <span>festivals@esperanza-aashayein2026.edu</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-primary-blue-light shrink-0" />
                <span>+91 (0) 98765 43210 / Ext 402</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026–2027 ESPERENZA & AASHAYEIN College Festival Committee. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Designed for Excellence with React & Supabase
          </p>
        </div>
      </div>
    </footer>
  );
}
