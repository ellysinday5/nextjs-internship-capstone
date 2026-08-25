const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "../public/screenshots");
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

// 1. Projects Dashboard SVG
const projectsSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 750" width="1200" height="750">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#070f1c" />
      <stop offset="100%" stop-color="#0e1e35" />
    </linearGradient>
    <linearGradient id="cardGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#142843" />
      <stop offset="100%" stop-color="#0f2038" />
    </linearGradient>
    <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0052cc" />
      <stop offset="100%" stop-color="#00b4d8" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="100%" height="100%" fill="url(#bgGrad)" />

  <!-- Top App Navigation Bar -->
  <rect x="0" y="0" width="1200" height="60" fill="#0d1b2e" />
  <line x1="0" y1="60" x2="1200" y2="60" stroke="#1c3352" stroke-width="1" />
  <circle cx="36" cy="30" r="14" fill="#0052cc" />
  <text x="36" y="35" fill="#ffffff" font-family="sans-serif" font-size="12" font-weight="900" text-anchor="middle">SF</text>
  <text x="64" y="35" fill="#ffffff" font-family="sans-serif" font-size="16" font-weight="bold">SyntraFlow</text>

  <!-- Nav Links -->
  <rect x="220" y="16" width="76" height="28" rx="6" fill="#142843" />
  <text x="258" y="35" fill="#38bdf8" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">Projects</text>
  <text x="340" y="35" fill="#94a3b8" font-family="sans-serif" font-size="13" font-weight="600">Team</text>
  <text x="410" y="35" fill="#94a3b8" font-family="sans-serif" font-size="13" font-weight="600">Calendar</text>
  <text x="500" y="35" fill="#94a3b8" font-family="sans-serif" font-size="13" font-weight="600">Analytics</text>

  <!-- User Avatar on Right -->
  <circle cx="1150" cy="30" r="16" fill="#0052cc" />
  <text x="1150" y="35" fill="#ffffff" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">ES</text>

  <!-- Page Header -->
  <text x="50" y="110" fill="#ffffff" font-family="sans-serif" font-size="24" font-weight="900">Projects</text>
  <text x="50" y="132" fill="#64748b" font-family="sans-serif" font-size="13" font-weight="500">Overview of all active workspace projects and team velocity</text>

  <!-- Action button -->
  <rect x="1020" y="92" width="130" height="38" rx="8" fill="#0052cc" />
  <text x="1085" y="116" fill="#ffffff" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">+ New Project</text>

  <!-- Search & Filter Bar -->
  <rect x="50" y="155" width="280" height="36" rx="8" fill="#142843" stroke="#1c3352" />
  <text x="70" y="178" fill="#64748b" font-family="sans-serif" font-size="12">Search projects...</text>
  <rect x="345" y="155" width="90" height="36" rx="8" fill="#142843" stroke="#1c3352" />
  <text x="390" y="178" fill="#94a3b8" font-family="sans-serif" font-size="12" text-anchor="middle">All Views ▾</text>

  <!-- 3 Project Cards Grid -->
  <!-- Card 1 -->
  <g transform="translate(50, 215)">
    <rect width="350" height="230" rx="16" fill="url(#cardGrad1)" stroke="#1e3a5f" stroke-width="1.5" />
    <rect x="24" y="24" width="70" height="22" rx="6" fill="#0284c7" fill-opacity="0.2" />
    <text x="59" y="39" fill="#38bdf8" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">Frontend</text>
    <text x="24" y="80" fill="#ffffff" font-family="sans-serif" font-size="18" font-weight="bold">Core Design System</text>
    <text x="24" y="104" fill="#64748b" font-family="sans-serif" font-size="12">Component tokens, dark mode, and UI primitives.</text>
    <!-- Progress bar -->
    <rect x="24" y="145" width="302" height="6" rx="3" fill="#1e293b" />
    <rect x="24" y="145" width="230" height="6" rx="3" fill="url(#progressGrad)" />
    <text x="24" y="172" fill="#94a3b8" font-family="sans-serif" font-size="11" font-weight="bold">76% Complete</text>
    <text x="326" y="172" fill="#64748b" font-family="sans-serif" font-size="11" text-anchor="end">19/25 tasks</text>
    <!-- Avatars -->
    <circle cx="36" cy="200" r="11" fill="#0052cc" />
    <text x="36" y="204" fill="#ffffff" font-family="sans-serif" font-size="9" text-anchor="middle">ES</text>
    <circle cx="54" cy="200" r="11" fill="#7c3aed" />
    <text x="54" y="204" fill="#ffffff" font-family="sans-serif" font-size="9" text-anchor="middle">JR</text>
  </g>

  <!-- Card 2 -->
  <g transform="translate(425, 215)">
    <rect width="350" height="230" rx="16" fill="url(#cardGrad1)" stroke="#1e3a5f" stroke-width="1.5" />
    <rect x="24" y="24" width="70" height="22" rx="6" fill="#059669" fill-opacity="0.2" />
    <text x="59" y="39" fill="#34d399" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">Backend</text>
    <text x="24" y="80" fill="#ffffff" font-family="sans-serif" font-size="18" font-weight="bold">REST API & Auth Migration</text>
    <text x="24" y="104" fill="#64748b" font-family="sans-serif" font-size="12">Clerk webhook sync and Neon Postgres schema.</text>
    <!-- Progress bar -->
    <rect x="24" y="145" width="302" height="6" rx="3" fill="#1e293b" />
    <rect x="24" y="145" width="302" height="6" rx="3" fill="#10b981" />
    <text x="24" y="172" fill="#34d399" font-family="sans-serif" font-size="11" font-weight="bold">100% Complete</text>
    <text x="326" y="172" fill="#64748b" font-family="sans-serif" font-size="11" text-anchor="end">14/14 tasks</text>
    <!-- Avatars -->
    <circle cx="36" cy="200" r="11" fill="#059669" />
    <text x="36" y="204" fill="#ffffff" font-family="sans-serif" font-size="9" text-anchor="middle">MT</text>
  </g>

  <!-- Card 3 -->
  <g transform="translate(800, 215)">
    <rect width="350" height="230" rx="16" fill="url(#cardGrad1)" stroke="#1e3a5f" stroke-width="1.5" />
    <rect x="24" y="24" width="70" height="22" rx="6" fill="#d97706" fill-opacity="0.2" />
    <text x="59" y="39" fill="#fbbf24" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">Mobile</text>
    <text x="24" y="80" fill="#ffffff" font-family="sans-serif" font-size="18" font-weight="bold">SyntraFlow Mobile App</text>
    <text x="24" y="104" fill="#64748b" font-family="sans-serif" font-size="12">Responsive PWA offline caching & push alerts.</text>
    <!-- Progress bar -->
    <rect x="24" y="145" width="302" height="6" rx="3" fill="#1e293b" />
    <rect x="24" y="145" width="125" height="6" rx="3" fill="url(#progressGrad)" />
    <text x="24" y="172" fill="#94a3b8" font-family="sans-serif" font-size="11" font-weight="bold">42% Complete</text>
    <text x="326" y="172" fill="#64748b" font-family="sans-serif" font-size="11" text-anchor="end">8/19 tasks</text>
    <!-- Avatars -->
    <circle cx="36" cy="200" r="11" fill="#0052cc" />
    <text x="36" y="204" fill="#ffffff" font-family="sans-serif" font-size="9" text-anchor="middle">ES</text>
    <circle cx="54" cy="200" r="11" fill="#059669" />
    <text x="54" y="204" fill="#ffffff" font-family="sans-serif" font-size="9" text-anchor="middle">MT</text>
  </g>
</svg>
`;

// 2. Team Management SVG
const teamSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 750" width="1200" height="750">
  <defs>
    <linearGradient id="teamBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#070f1c" />
      <stop offset="100%" stop-color="#0e1e35" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#teamBg)" />

  <!-- Top App Navigation Bar -->
  <rect x="0" y="0" width="1200" height="60" fill="#0d1b2e" />
  <line x1="0" y1="60" x2="1200" y2="60" stroke="#1c3352" stroke-width="1" />
  <circle cx="36" cy="30" r="14" fill="#0052cc" />
  <text x="36" y="35" fill="#ffffff" font-family="sans-serif" font-size="12" font-weight="900" text-anchor="middle">SF</text>
  <text x="64" y="35" fill="#ffffff" font-family="sans-serif" font-size="16" font-weight="bold">SyntraFlow</text>

  <!-- Nav Links -->
  <text x="258" y="35" fill="#94a3b8" font-family="sans-serif" font-size="13" font-weight="600" text-anchor="middle">Projects</text>
  <rect x="305" y="16" width="60" height="28" rx="6" fill="#142843" />
  <text x="335" y="35" fill="#38bdf8" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">Team</text>
  <text x="410" y="35" fill="#94a3b8" font-family="sans-serif" font-size="13" font-weight="600">Calendar</text>
  <text x="500" y="35" fill="#94a3b8" font-family="sans-serif" font-size="13" font-weight="600">Analytics</text>

  <!-- Page Header -->
  <text x="50" y="110" fill="#ffffff" font-family="sans-serif" font-size="24" font-weight="900">Workspace Members</text>
  <text x="50" y="132" fill="#64748b" font-family="sans-serif" font-size="13" font-weight="500">Manage permissions, invite collaborators, and view active roles</text>

  <!-- Invite Button -->
  <rect x="1020" y="92" width="130" height="38" rx="8" fill="#0052cc" />
  <text x="1085" y="116" fill="#ffffff" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">+ Invite Member</text>

  <!-- Table Container -->
  <rect x="50" y="170" width="1100" height="500" rx="16" fill="#142843" stroke="#1e3a5f" stroke-width="1.5" />

  <!-- Table Header -->
  <rect x="50" y="170" width="1100" height="50" rx="16" fill="#0f2038" />
  <text x="80" y="201" fill="#64748b" font-family="sans-serif" font-size="12" font-weight="bold">MEMBER</text>
  <text x="400" y="201" fill="#64748b" font-family="sans-serif" font-size="12" font-weight="bold">ROLE</text>
  <text x="650" y="201" fill="#64748b" font-family="sans-serif" font-size="12" font-weight="bold">STATUS</text>
  <text x="900" y="201" fill="#64748b" font-family="sans-serif" font-size="12" font-weight="bold">JOINED DATE</text>

  <!-- Row 1 -->
  <line x1="50" y1="280" x2="1150" y2="280" stroke="#1e3a5f" stroke-width="1" />
  <circle cx="100" cy="250" r="16" fill="#0052cc" />
  <text x="100" y="255" fill="#ffffff" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">ES</text>
  <text x="130" y="248" fill="#ffffff" font-family="sans-serif" font-size="14" font-weight="bold">Elly Sinday</text>
  <text x="130" y="264" fill="#64748b" font-family="sans-serif" font-size="11">elly.sinday@stratpoint.com</text>
  <rect x="400" y="238" width="60" height="24" rx="6" fill="#0052cc" fill-opacity="0.2" />
  <text x="430" y="254" fill="#38bdf8" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">Owner</text>
  <rect x="650" y="238" width="60" height="24" rx="6" fill="#059669" fill-opacity="0.2" />
  <text x="680" y="254" fill="#34d399" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">Active</text>
  <text x="900" y="254" fill="#94a3b8" font-family="sans-serif" font-size="12">Aug 1, 2026</text>

  <!-- Row 2 -->
  <line x1="50" y1="340" x2="1150" y2="340" stroke="#1e3a5f" stroke-width="1" />
  <circle cx="100" cy="310" r="16" fill="#7c3aed" />
  <text x="100" y="315" fill="#ffffff" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">JR</text>
  <text x="130" y="308" fill="#ffffff" font-family="sans-serif" font-size="14" font-weight="bold">James Reyes</text>
  <text x="130" y="324" fill="#64748b" font-family="sans-serif" font-size="11">james.reyes@team.io</text>
  <rect x="400" y="298" width="60" height="24" rx="6" fill="#7c3aed" fill-opacity="0.2" />
  <text x="430" y="314" fill="#c084fc" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">Admin</text>
  <rect x="650" y="298" width="60" height="24" rx="6" fill="#059669" fill-opacity="0.2" />
  <text x="680" y="314" fill="#34d399" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">Active</text>
  <text x="900" y="314" fill="#94a3b8" font-family="sans-serif" font-size="12">Aug 10, 2026</text>

  <!-- Row 3 -->
  <line x1="50" y1="400" x2="1150" y2="400" stroke="#1e3a5f" stroke-width="1" />
  <circle cx="100" cy="370" r="16" fill="#059669" />
  <text x="100" y="375" fill="#ffffff" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">MT</text>
  <text x="130" y="368" fill="#ffffff" font-family="sans-serif" font-size="14" font-weight="bold">Maria Tan</text>
  <text x="130" y="384" fill="#64748b" font-family="sans-serif" font-size="11">maria.tan@design.co</text>
  <rect x="400" y="358" width="65" height="24" rx="6" fill="#0284c7" fill-opacity="0.2" />
  <text x="432" y="374" fill="#38bdf8" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">Member</text>
  <rect x="650" y="358" width="60" height="24" rx="6" fill="#059669" fill-opacity="0.2" />
  <text x="680" y="374" fill="#34d399" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">Active</text>
  <text x="900" y="374" fill="#94a3b8" font-family="sans-serif" font-size="12">Aug 15, 2026</text>
</svg>
`;

// 3. Create Project Modal SVG
const createProjectSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 750" width="1200" height="750">
  <defs>
    <linearGradient id="modalBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#070f1c" />
      <stop offset="100%" stop-color="#0e1e35" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#modalBg)" />

  <!-- Backdrop blur simulation -->
  <rect width="100%" height="100%" fill="#000000" fill-opacity="0.5" />

  <!-- Centered Modal Card -->
  <g transform="translate(300, 80)">
    <rect width="600" height="580" rx="20" fill="#10223a" stroke="#1e3a5f" stroke-width="2" />

    <!-- Modal Header -->
    <text x="35" y="45" fill="#ffffff" font-family="sans-serif" font-size="20" font-weight="bold">Create New Project</text>
    <text x="35" y="68" fill="#64748b" font-family="sans-serif" font-size="12">Set up project name, category, enabled views, and initial tech stack.</text>

    <!-- Field 1: Project Name -->
    <text x="35" y="115" fill="#94a3b8" font-family="sans-serif" font-size="12" font-weight="bold">PROJECT NAME *</text>
    <rect x="35" y="125" width="530" height="42" rx="10" fill="#0d1b2e" stroke="#0052cc" stroke-width="1.5" />
    <text x="50" y="151" fill="#ffffff" font-family="sans-serif" font-size="13">Q3 Product Redesign</text>

    <!-- Field 2: Description -->
    <text x="35" y="195" fill="#94a3b8" font-family="sans-serif" font-size="12" font-weight="bold">DESCRIPTION</text>
    <rect x="35" y="205" width="530" height="60" rx="10" fill="#0d1b2e" stroke="#1c3352" />
    <text x="50" y="230" fill="#64748b" font-family="sans-serif" font-size="12">Revamp core layout, add dark mode tokens, and unify design system.</text>

    <!-- Field 3: Project Views (Required min 1) -->
    <text x="35" y="295" fill="#94a3b8" font-family="sans-serif" font-size="12" font-weight="bold">ENABLED VIEWS (SELECT AT LEAST ONE) *</text>
    <!-- View 1: Board -->
    <rect x="35" y="310" width="120" height="36" rx="8" fill="#0052cc" />
    <text x="95" y="333" fill="#ffffff" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">✓ Board</text>
    <!-- View 2: List -->
    <rect x="165" y="310" width="115" height="36" rx="8" fill="#0052cc" />
    <text x="222" y="333" fill="#ffffff" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">✓ List</text>
    <!-- View 3: Table -->
    <rect x="290" y="310" width="115" height="36" rx="8" fill="#0052cc" />
    <text x="347" y="333" fill="#ffffff" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">✓ Table</text>
    <!-- View 4: Calendar -->
    <rect x="415" y="310" width="120" height="36" rx="8" fill="#0052cc" />
    <text x="475" y="333" fill="#ffffff" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">✓ Calendar</text>

    <!-- Field 4: Tech Stack Tags -->
    <text x="35" y="380" fill="#94a3b8" font-family="sans-serif" font-size="12" font-weight="bold">TECH STACK</text>
    <rect x="35" y="395" width="80" height="28" rx="6" fill="#142843" stroke="#1c3352" />
    <text x="75" y="413" fill="#38bdf8" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">Next.js</text>
    <rect x="125" y="395" width="85" height="28" rx="6" fill="#142843" stroke="#1c3352" />
    <text x="167" y="413" fill="#38bdf8" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">TypeScript</text>
    <rect x="220" y="395" width="75" height="28" rx="6" fill="#142843" stroke="#1c3352" />
    <text x="257" y="413" fill="#38bdf8" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">Drizzle</text>

    <!-- Modal Footer Actions -->
    <line x1="0" y1="510" x2="600" y2="510" stroke="#1c3352" />
    <rect x="340" y="525" width="90" height="38" rx="8" fill="#1e293b" />
    <text x="385" y="548" fill="#94a3b8" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">Cancel</text>
    <rect x="445" y="525" width="120" height="38" rx="8" fill="#0052cc" />
    <text x="505" y="548" fill="#ffffff" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">Create Project</text>
  </g>
</svg>
`;

// 4. Calendar View SVG
const calendarSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 750" width="1200" height="750">
  <defs>
    <linearGradient id="calBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#070f1c" />
      <stop offset="100%" stop-color="#0e1e35" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#calBg)" />

  <!-- Top App Navigation Bar -->
  <rect x="0" y="0" width="1200" height="60" fill="#0d1b2e" />
  <line x1="0" y1="60" x2="1200" y2="60" stroke="#1c3352" stroke-width="1" />
  <circle cx="36" cy="30" r="14" fill="#0052cc" />
  <text x="36" y="35" fill="#ffffff" font-family="sans-serif" font-size="12" font-weight="900" text-anchor="middle">SF</text>
  <text x="64" y="35" fill="#ffffff" font-family="sans-serif" font-size="16" font-weight="bold">SyntraFlow</text>

  <!-- Nav Links -->
  <text x="258" y="35" fill="#94a3b8" font-family="sans-serif" font-size="13" font-weight="600" text-anchor="middle">Projects</text>
  <text x="340" y="35" fill="#94a3b8" font-family="sans-serif" font-size="13" font-weight="600">Team</text>
  <rect x="385" y="16" width="75" height="28" rx="6" fill="#142843" />
  <text x="422" y="35" fill="#38bdf8" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">Calendar</text>
  <text x="500" y="35" fill="#94a3b8" font-family="sans-serif" font-size="13" font-weight="600">Analytics</text>

  <!-- Page Header -->
  <text x="50" y="110" fill="#ffffff" font-family="sans-serif" font-size="24" font-weight="900">August 2026</text>
  <text x="50" y="132" fill="#64748b" font-family="sans-serif" font-size="13" font-weight="500">Upcoming deadlines, milestone sprints, and scheduled deliverables</text>

  <!-- View Mode Pills -->
  <rect x="980" y="92" width="170" height="38" rx="8" fill="#142843" stroke="#1c3352" />
  <rect x="984" y="96" width="50" height="30" rx="6" fill="#0052cc" />
  <text x="1009" y="115" fill="#ffffff" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">Month</text>
  <text x="1062" y="115" fill="#64748b" font-family="sans-serif" font-size="12" text-anchor="middle">Week</text>
  <text x="1118" y="115" fill="#64748b" font-family="sans-serif" font-size="12" text-anchor="middle">Day</text>

  <!-- Calendar Grid Container -->
  <rect x="50" y="160" width="1100" height="520" rx="16" fill="#142843" stroke="#1e3a5f" stroke-width="1.5" />

  <!-- Days Header -->
  <rect x="50" y="160" width="1100" height="40" rx="16" fill="#0f2038" />
  <text x="128" y="185" fill="#64748b" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">MON</text>
  <text x="285" y="185" fill="#64748b" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">TUE</text>
  <text x="442" y="185" fill="#64748b" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">WED</text>
  <text x="599" y="185" fill="#64748b" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">THU</text>
  <text x="756" y="185" fill="#64748b" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">FRI</text>
  <text x="913" y="185" fill="#64748b" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">SAT</text>
  <text x="1070" y="185" fill="#64748b" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">SUN</text>

  <!-- Grid Rows -->
  <line x1="50" y1="280" x2="1150" y2="280" stroke="#1e3a5f" />
  <line x1="50" y1="400" x2="1150" y2="400" stroke="#1e3a5f" />
  <line x1="50" y1="520" x2="1150" y2="520" stroke="#1e3a5f" />

  <!-- Grid Columns -->
  <line x1="207" y1="200" x2="207" y2="680" stroke="#1e3a5f" />
  <line x1="364" y1="200" x2="364" y2="680" stroke="#1e3a5f" />
  <line x1="521" y1="200" x2="521" y2="680" stroke="#1e3a5f" />
  <line x1="678" y1="200" x2="678" y2="680" stroke="#1e3a5f" />
  <line x1="835" y1="200" x2="835" y2="680" stroke="#1e3a5f" />
  <line x1="992" y1="200" x2="992" y2="680" stroke="#1e3a5f" />

  <!-- Sample Event Badges -->
  <!-- Event 1 -->
  <rect x="60" y="240" width="135" height="24" rx="5" fill="#0052cc" />
  <text x="70" y="256" fill="#ffffff" font-family="sans-serif" font-size="10" font-weight="bold">Sprint Planning #4</text>

  <!-- Event 2 -->
  <rect x="375" y="235" width="135" height="24" rx="5" fill="#059669" />
  <text x="385" y="251" fill="#ffffff" font-family="sans-serif" font-size="10" font-weight="bold">Design Review · 10 AM</text>

  <!-- Event 3 -->
  <rect x="690" y="235" width="135" height="24" rx="5" fill="#7c3aed" />
  <text x="700" y="251" fill="#ffffff" font-family="sans-serif" font-size="10" font-weight="bold">Release v2.4.0</text>

  <!-- Event 4 (Today: 12th) -->
  <rect x="217" y="325" width="135" height="24" rx="5" fill="#0284c7" />
  <text x="227" y="341" fill="#ffffff" font-family="sans-serif" font-size="10" font-weight="bold">Milestone Demo</text>
  <rect x="217" y="355" width="135" height="24" rx="5" fill="#d97706" />
  <text x="227" y="371" fill="#ffffff" font-family="sans-serif" font-size="10" font-weight="bold">Database Backup</text>
</svg>
`;

fs.writeFileSync(path.join(dir, "projects-page.svg"), projectsSvg.trim());
fs.writeFileSync(path.join(dir, "team-page.svg"), teamSvg.trim());
fs.writeFileSync(path.join(dir, "create-project.svg"), createProjectSvg.trim());
fs.writeFileSync(path.join(dir, "calendar-view.svg"), calendarSvg.trim());

console.log("Rich SVG mockups generated successfully!");
