// Initial dynamic seed data matching the database schema
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
    id: '33333333-3333-3333-3333-333333333301',
    festival_id: '11111111-1111-1111-1111-111111111111',
    festival_slug: 'esperanza',
    name: 'Young Scientist Exhibition',
    slug: 'young-scientist',
    category: 'Innovation & Research',
    description: 'Showcase working engineering prototypes, scientific inventions, AI hardware solutions, and renewable energy models before an elite panel of researchers and industry judges.',
    image_url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80',
    venue: 'R&D Innovation Lab & Exhibition Ground',
    event_date: '2026-12-10T10:00:00Z',
    registration_deadline: '2026-12-05T23:59:59Z',
    status: 'upcoming',
    is_featured: true,
    min_team_size: 1,
    max_team_size: 4,
    rules: '1. Each team can consist of 1-4 members.\n2. Prototypes must be functional or accompanied by simulated proofs.\n3. 10 minutes presentation followed by 5 minutes Q&A.\n4. Plagiarism leads to immediate disqualification.',
    contact_email: 'youngscientist@esperanza2026.edu',
    contact_phone: '+91 98765 43210'
  },
  {
    id: '33333333-3333-3333-3333-333333333302',
    festival_id: '11111111-1111-1111-1111-111111111111',
    festival_slug: 'esperanza',
    name: 'Robo Race Championship',
    slug: 'robo-race',
    category: 'Robotics & Automation',
    description: 'An intense obstacle arena challenge test of speed, torque, wireless navigation, and precision handling where custom wired and wireless bots battle the clock and treacherous terrains.',
    image_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
    venue: 'Robotics Arena - Central Quadrangle',
    event_date: '2026-12-11T11:00:00Z',
    registration_deadline: '2026-12-06T23:59:59Z',
    status: 'upcoming',
    is_featured: true,
    min_team_size: 1,
    max_team_size: 3,
    rules: '1. Robot dimensions must not exceed 30cm x 30cm x 30cm.\n2. Maximum bot weight allowed is 4kg.\n3. Power supply must not exceed 24V.\n4. Time penalties apply for crossing arena boundary markers.',
    contact_email: 'roborace@esperanza2026.edu',
    contact_phone: '+91 98765 43211'
  },
  {
    id: '44444444-4444-4444-4444-444444444401',
    festival_id: '22222222-2222-2222-2222-222222222222',
    festival_slug: 'aashayein',
    name: 'Dance Championship (Solo & Group)',
    slug: 'dance',
    category: 'Performing Arts',
    description: 'Unleash high-octane choreography across classical, folk, contemporary, hip-hop, and fusion dance categories on the grand festival stage.',
    image_url: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=800&q=80',
    venue: 'Main Open Air Amphitheatre',
    event_date: '2026-12-16T17:00:00Z',
    registration_deadline: '2026-12-12T23:59:59Z',
    status: 'upcoming',
    is_featured: true,
    min_team_size: 1,
    max_team_size: 12,
    rules: '1. Performance time limit: Solo (3-4 mins), Group (5-8 mins).\n2. Tracks must be submitted in MP3 format 48 hours prior.\n3. Costumes and props must adhere to college decency standards.\n4. Judging criteria: Choreography, rhythm, facial expressions, synchrony.',
    contact_email: 'dance@aashayein2026.edu',
    contact_phone: '+91 98765 43212'
  },
  {
    id: '44444444-4444-4444-4444-444444444402',
    festival_id: '22222222-2222-2222-2222-222222222222',
    festival_slug: 'aashayein',
    name: 'Anchoring & RJ Hunt',
    slug: 'anchoring',
    category: 'Literary & Media',
    description: 'Test your spontaneous wit, voice modulation, stage charisma, bilingual fluency, and audience engagement prowess to become the Official Voices of Aashayein 2026-2027.',
    image_url: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=800&q=80',
    venue: 'Seminar Hall 1',
    event_date: '2026-12-15T14:00:00Z',
    registration_deadline: '2026-12-11T23:59:59Z',
    status: 'upcoming',
    is_featured: true,
    min_team_size: 1,
    max_team_size: 2,
    rules: '1. Round 1: Prepared speech / event hosting intro (2 mins).\n2. Round 2: On-the-spot crisis management scenario hosting.\n3. Round 3: Rapid fire & interview simulation.',
    contact_email: 'anchoring@aashayein2026.edu',
    contact_phone: '+91 98765 43213'
  },
  {
    id: '44444444-4444-4444-4444-444444444403',
    festival_id: '22222222-2222-2222-2222-222222222222',
    festival_slug: 'aashayein',
    name: 'Symphony: Singing Competition',
    slug: 'singing',
    category: 'Music',
    description: 'From soul-stirring classical melodies to energetic western pop and indie Bollywood hits, capture hearts with your vocal tone, pitch precision, and musical expression.',
    image_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    venue: 'College Main Auditorium',
    event_date: '2026-12-17T16:00:00Z',
    registration_deadline: '2026-12-13T23:59:59Z',
    status: 'upcoming',
    is_featured: false,
    min_team_size: 1,
    max_team_size: 6,
    rules: '1. Categories: Western Solo, Eastern Solo, Group Band.\n2. Backing tracks (karaoke) or acoustic accompaniment allowed.\n3. Max time: Solo (3.5 mins), Bands (6 mins).\n4. Judged on Sur, Taal, voice modulation, and stage presence.',
    contact_email: 'singing@aashayein2026.edu',
    contact_phone: '+91 98765 43214'
  },
  {
    id: '44444444-4444-4444-4444-444444444404',
    festival_id: '22222222-2222-2222-2222-222222222222',
    festival_slug: 'aashayein',
    name: 'Natraj: Drama & Street Play',
    slug: 'drama',
    category: 'Theatrics',
    description: 'Powerful street plays (Nukkad Natak) addressing burning social issues and proscenium stage plays filled with poignant dialogues, dramatic arcs, and theatrical mastery.',
    image_url: 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&w=800&q=80',
    venue: 'Campus Amphitheatre & Central Lawns',
    event_date: '2026-12-18T15:00:00Z',
    registration_deadline: '2026-12-14T23:59:59Z',
    status: 'upcoming',
    is_featured: false,
    min_team_size: 4,
    max_team_size: 16,
    rules: '1. Street Play time: 10-15 minutes; Stage Play: 20-30 minutes.\n2. Street play instruments: Dholak, Dafli, Harmonium permitted.\n3. Content must not contain offensive religious or political slander.\n4. Judged on screenplay, dialogue delivery, energy, and social message impact.',
    contact_email: 'drama@aashayein2026.edu',
    contact_phone: '+91 98765 43215'
  }
];

export const initialProfiles = [
  {
    id: 'user-admin-001',
    email: 'admin@festival.edu',
    full_name: 'Dr. Rajesh Sharma',
    role: 'super_admin',
    department: 'Computer Science & Engineering',
    mobile: '+91 98765 00001',
    is_verified: true,
    designation: 'Dean of Student Affairs',
    employee_id: 'FAC-DSA-01',
  },
  {
    id: 'user-faculty-001',
    email: 'priya.nair@festival.edu',
    full_name: 'Dr. Priya Nair',
    role: 'faculty_coordinator',
    department: 'Humanities & Cultural Studies',
    mobile: '+91 98765 00002',
    is_verified: true,
    designation: 'Associate Professor',
    employee_id: 'FAC-HUM-08',
  },
  {
    id: 'user-faculty-002',
    email: 'arun.verma@festival.edu',
    full_name: 'Prof. Arun Verma',
    role: 'faculty_coordinator',
    department: 'Electronics & Communication',
    mobile: '+91 98765 00003',
    is_verified: true,
    designation: 'Assistant Professor',
    employee_id: 'FAC-ECE-14',
  },
  {
    id: 'user-faculty-003',
    email: 'neha.gupta@festival.edu',
    full_name: 'Dr. Neha Gupta',
    role: 'faculty_coordinator',
    department: 'Mechanical Engineering',
    mobile: '+91 98765 00004',
    is_verified: false, // Verification pending test user
    designation: 'Assistant Professor',
    employee_id: 'FAC-MECH-22',
  },
  {
    id: 'user-student-001',
    email: 'rohit.mehta@student.edu',
    full_name: 'Rohit Mehta',
    role: 'student_coordinator',
    department: 'Computer Science',
    mobile: '+91 98765 00005',
    is_verified: true,
    erp_number: '2023CS0142',
    year: '3rd Year',
    section: 'A',
  },
  {
    id: 'user-student-002',
    email: 'ananya.deshmukh@student.edu',
    full_name: 'Ananya Deshmukh',
    role: 'student_coordinator',
    department: 'Information Technology',
    mobile: '+91 98765 00006',
    is_verified: true,
    erp_number: '2023IT0089',
    year: '3rd Year',
    section: 'B',
  },
  {
    id: 'user-student-003',
    email: 'karan.sharma@student.edu',
    full_name: 'Karan Sharma',
    role: 'student_coordinator',
    department: 'Electronics & Comm.',
    mobile: '+91 98765 00007',
    is_verified: true,
    erp_number: '2024EC0031',
    year: '2nd Year',
    section: 'C',
  }
];

export const initialAssignments = [
  {
    id: 'assign-001',
    event_id: '44444444-4444-4444-4444-444444444401', // Dance
    user_id: 'user-faculty-001', // Dr. Priya Nair
    role: 'faculty_coordinator',
    status: 'active',
    assigned_by: 'user-admin-001',
    created_at: '2026-10-01T10:00:00Z',
  },
  {
    id: 'assign-002',
    event_id: '44444444-4444-4444-4444-444444444401', // Dance
    user_id: 'user-student-001', // Rohit Mehta
    role: 'student_coordinator',
    status: 'active',
    assigned_by: 'user-faculty-001',
    created_at: '2026-10-05T11:00:00Z',
  },
  {
    id: 'assign-003',
    event_id: '44444444-4444-4444-4444-444444444401', // Dance
    user_id: 'user-student-002', // Ananya Deshmukh
    role: 'co_coordinator',
    status: 'active',
    assigned_by: 'user-faculty-001',
    created_at: '2026-10-06T14:30:00Z',
  },
  {
    id: 'assign-004',
    event_id: '33333333-3333-3333-3333-333333333301', // Young Scientist
    user_id: 'user-faculty-002', // Prof. Arun Verma
    role: 'faculty_coordinator',
    status: 'active',
    assigned_by: 'user-admin-001',
    created_at: '2026-10-02T09:00:00Z',
  },
  {
    id: 'assign-005',
    event_id: '33333333-3333-3333-3333-333333333301', // Young Scientist
    user_id: 'user-student-003', // Karan Sharma
    role: 'student_coordinator',
    status: 'active',
    assigned_by: 'user-faculty-002',
    created_at: '2026-10-07T12:00:00Z',
  }
];

export const initialForms = [
  {
    id: '55555555-5555-5555-5555-555555555501',
    event_id: '44444444-4444-4444-4444-444444444401', // Dance
    title: 'Aashayein 2026 Dance Championship Registration Form',
    description: 'Official registration portal for solo and group dance performances at Aashayein 2026–2027.',
    status: 'published',
    deadline: '2026-12-12T23:59:59Z',
    allow_teams: true,
    min_team_size: 1,
    max_team_size: 12,
    created_by: 'user-faculty-001',
  },
  {
    id: '55555555-5555-5555-5555-555555555502',
    event_id: '33333333-3333-3333-3333-333333333301', // Young Scientist
    title: 'Esperenza 2026 Young Scientist Exhibition Application',
    description: 'Submit your research inventions, functional hardware models, and prototypes.',
    status: 'published',
    deadline: '2026-12-05T23:59:59Z',
    allow_teams: true,
    min_team_size: 1,
    max_team_size: 4,
    created_by: 'user-faculty-002',
  }
];

export const initialFormFields = [
  {
    id: '66666666-6666-6666-6666-666666666601',
    form_id: '55555555-5555-5555-5555-555555555501',
    field_name: 'dance_style',
    label: 'Dance Style / Genre',
    field_type: 'dropdown',
    placeholder: 'Select dance style',
    options: ['Classical / Semi-Classical', 'Contemporary / Lyrical', 'Hip-Hop / Street Dance', 'Bollywood / Fusion', 'Folk / Tribal'],
    is_required: true,
    field_order: 1,
  },
  {
    id: '66666666-6666-6666-6666-666666666602',
    form_id: '55555555-5555-5555-5555-555555555501',
    field_name: 'participation_type',
    label: 'Participation Format',
    field_type: 'radio',
    placeholder: '',
    options: ['Solo (1 participant)', 'Duet (2 participants)', 'Group (3 to 12 participants)'],
    is_required: true,
    field_order: 2,
  },
  {
    id: '66666666-6666-6666-6666-666666666603',
    form_id: '55555555-5555-5555-5555-555555555501',
    field_name: 'track_duration',
    label: 'Audio Track Duration (in Minutes)',
    field_type: 'text',
    placeholder: 'e.g. 3 mins 45 secs',
    options: [],
    is_required: false,
    field_order: 3,
  },
  {
    id: '66666666-6666-6666-6666-666666666604',
    form_id: '55555555-5555-5555-5555-555555555501',
    field_name: 'props_required',
    label: 'Props or Stage Lighting Requirements',
    field_type: 'textarea',
    placeholder: 'Mention any props you will bring or special technical cues',
    options: [],
    is_required: false,
    field_order: 4,
  },
  {
    id: '66666666-6666-6666-6666-666666666605',
    form_id: '55555555-5555-5555-5555-555555555502',
    field_name: 'project_title',
    label: 'Project Title / Prototype Name',
    field_type: 'text',
    placeholder: 'e.g. Smart IoT Microgrid Energy Manager',
    options: [],
    is_required: true,
    field_order: 1,
  },
  {
    id: '66666666-6666-6666-6666-666666666606',
    form_id: '55555555-5555-5555-5555-555555555502',
    field_name: 'domain_area',
    label: 'Innovation Domain',
    field_type: 'dropdown',
    placeholder: 'Select domain',
    options: ['Artificial Intelligence & Robotics', 'Green Energy & Sustainability', 'Healthcare & Biomedical', 'Embedded Systems & IoT', 'Civil & Structural Engineering'],
    is_required: true,
    field_order: 2,
  },
  {
    id: '66666666-6666-6666-6666-666666666607',
    form_id: '55555555-5555-5555-5555-555555555502',
    field_name: 'power_socket_needed',
    label: '220V AC Power Socket Required at Booth?',
    field_type: 'radio',
    placeholder: '',
    options: ['Yes (Single Socket)', 'Yes (Heavy Load > 1kW)', 'No (Battery Operated)'],
    is_required: true,
    field_order: 3,
  }
];

export const initialParticipants = [
  {
    id: 'part-001',
    event_id: '44444444-4444-4444-4444-444444444401', // Dance
    form_id: '55555555-5555-5555-5555-555555555501',
    full_name: 'Sneha Kulkarni',
    erp_number: '2023CS0199',
    email: 'sneha.k@student.edu',
    mobile: '+91 98111 22334',
    department: 'Computer Science',
    year: '2nd Year',
    section: 'B',
    is_team: true,
    team_name: 'Rhythm Rebels',
    status: 'registered',
    created_at: '2026-10-15T14:20:00Z',
    answers: {
      '66666666-6666-6666-6666-666666666601': 'Hip-Hop / Street Dance',
      '66666666-6666-6666-6666-666666666602': 'Group (3 to 12 participants)',
      '66666666-6666-6666-6666-666666666603': '4 mins 20 secs',
      '66666666-6666-6666-6666-666666666604': 'Requires 4 wireless headmics and smoke machine during the drop.'
    }
  },
  {
    id: 'part-002',
    event_id: '44444444-4444-4444-4444-444444444401', // Dance
    form_id: '55555555-5555-5555-5555-555555555501',
    full_name: 'Aditya Sen',
    erp_number: '2022ME0045',
    email: 'aditya.sen@student.edu',
    mobile: '+91 98222 33445',
    department: 'Mechanical Engineering',
    year: '3rd Year',
    section: 'A',
    is_team: false,
    team_name: null,
    status: 'confirmed',
    created_at: '2026-10-16T09:15:00Z',
    answers: {
      '66666666-6666-6666-6666-666666666601': 'Contemporary / Lyrical',
      '66666666-6666-6666-6666-666666666602': 'Solo (1 participant)',
      '66666666-6666-6666-6666-666666666603': '3 mins 30 secs',
      '66666666-6666-6666-6666-666666666604': 'Chair prop provided by self.'
    }
  },
  {
    id: 'part-003',
    event_id: '33333333-3333-3333-3333-333333333301', // Young Scientist
    form_id: '55555555-5555-5555-5555-555555555502',
    full_name: 'Vikramaditya Roy',
    erp_number: '2022EC0112',
    email: 'vikram.roy@student.edu',
    mobile: '+91 98333 44556',
    department: 'Electronics & Comm.',
    year: '4th Year',
    section: 'A',
    is_team: true,
    team_name: 'SolAqua Tech',
    status: 'registered',
    created_at: '2026-10-18T16:45:00Z',
    answers: {
      '66666666-6666-6666-6666-666666666605': 'Solar-Powered Desalination with Real-Time Turbidity IoT Sensing',
      '66666666-6666-6666-6666-666666666606': 'Green Energy & Sustainability',
      '66666666-6666-6666-6666-666666666607': 'Yes (Single Socket)'
    }
  }
];

export const initialAnnouncements = [
  {
    id: 'ann-001',
    festival_id: '11111111-1111-1111-1111-111111111111',
    event_id: null,
    title: 'Esperenza 2026 Rulebooks Released',
    content: 'Official technical specifications, arena dimensions and judging criteria for Robo Race and Young Scientist have been finalized.',
    priority: 'high',
    target_audience: 'all',
    author_name: 'Dr. Rajesh Sharma',
    is_active: true,
    created_at: '2026-10-12T10:00:00Z',
  },
  {
    id: 'ann-002',
    festival_id: '22222222-2222-2222-2222-222222222222',
    event_id: '44444444-4444-4444-4444-444444444401',
    title: 'Dance Competition Sound Track Submission',
    content: 'All shortlisted solo and group teams must upload high-bitrate MP3 tracks to the coordinator portal at least 48 hours prior to stage rehearsal.',
    priority: 'normal',
    target_audience: 'coordinators',
    author_name: 'Dr. Priya Nair',
    is_active: true,
    created_at: '2026-10-14T15:30:00Z',
  }
];

export const initialAuditLogs = [
  {
    id: 'audit-001',
    user_name: 'Dr. Rajesh Sharma (Super Admin)',
    action: 'CREATE_EVENT',
    table_name: 'events',
    record_id: 'Young Scientist Exhibition',
    details: 'Created flagship technical research exhibition for Esperenza 2026.',
    created_at: '2026-10-01T08:30:00Z'
  },
  {
    id: 'audit-002',
    user_name: 'Dr. Rajesh Sharma (Super Admin)',
    action: 'ASSIGN_FACULTY',
    table_name: 'event_assignments',
    record_id: 'Dr. Priya Nair -> Dance',
    details: 'Assigned Associate Professor Dr. Priya Nair as Lead Faculty Coordinator.',
    created_at: '2026-10-01T10:05:00Z'
  },
  {
    id: 'audit-003',
    user_name: 'Dr. Priya Nair (Faculty)',
    action: 'PUBLISH_FORM',
    table_name: 'registration_forms',
    record_id: 'Dance Championship Form',
    details: 'Configured custom dynamic fields and published public registration URL.',
    created_at: '2026-10-06T16:12:00Z'
  }
];
