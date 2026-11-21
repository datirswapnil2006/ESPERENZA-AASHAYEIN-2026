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

export const initialEvents = [
  {
    id: '33333333-3333-3333-3333-333333333333',
    festival_id: '11111111-1111-1111-1111-111111111111',
    festival_slug: 'esperanza',
    name: 'Young Scientist',
    slug: 'young-scientist',
    category: 'Science & Innovation',
    description: 'Premier scientific model & project exhibition for school students. Open exclusively for 5th to 10th Standard. Teams of 1, 2, or 3 participants.',
    venue: 'Science Exhibition Complex / Lab Hall',
    event_date: '2026-12-11T10:00:00Z',
    registration_deadline: '2026-12-05T23:59:59Z',
    status: 'upcoming',
    min_team_size: 1,
    max_team_size: 3,
    rules: '1. Eligibility: Exclusively open for school students currently studying from 5th Standard to 10th Standard.\n2. Team Participation: Students may participate as Solo (1 member), Duo (2 members), or Trio (3 members).\n3. Models: Working scientific models, prototypes, or experimental research posters are permitted.\n4. Judging Criteria: Scientific thought, innovation, understanding of concepts, and presentation clarity.'
  }
];

// Super Administrator single official account
export const initialProfiles = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@festival.edu',
    full_name: 'Dr. Nikko Khalsa',
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
