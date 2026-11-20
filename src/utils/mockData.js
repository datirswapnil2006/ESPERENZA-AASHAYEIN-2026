// Initial clean production foundation data
export const initialFestivals = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Esperenza',
    edition: '2026–2027',
    slug: 'esperanza',
    type: 'technical',
    tagline: 'Igniting the Spark of Technological Ingenuity & Engineering Mastery',
    description: 'Esperenza 2026–2027 is the premier annual inter-collegiate technical festival bringing together brilliant minds, cutting-edge robotics, coding hackathons, innovation challenges, and scientific exhibitions.',
    banner_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    start_date: '2026-12-10',
    end_date: '2026-12-12',
    is_active: true,
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Aashayein',
    edition: '2026–2027',
    slug: 'aashayein',
    type: 'cultural',
    tagline: 'Celebrating the Symphony of Art, Rhythm, Expression and Heritage',
    description: 'Aashayein 2026–2027 is the vibrant annual cultural extravaganza celebrating artistic excellence, musical talent, dramatic expressions, high-energy dance performances, and creative storytelling.',
    banner_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    start_date: '2026-12-15',
    end_date: '2026-12-18',
    is_active: true,
  }
];

// All dummy events removed - clean slate for Super Admin
export const initialEvents = [];

// Super Administrator single official account
export const initialProfiles = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@festival.edu',
    full_name: 'Dr. Rajesh Sharma',
    role: 'super_admin',
    department: 'Central Festival Administration',
    mobile: '+91 98765 00001',
    is_verified: true,
    designation: 'Dean & Super Administrator',
    employee_id: 'ADMIN-001',
  }
];

// Clean empty collections (all dummy data removed)
export const initialAssignments = [];
export const initialForms = [];
export const initialFormFields = [];
export const initialParticipants = [];
export const initialAnnouncements = [];
export const initialAuditLogs = [];
