import "dotenv/config";
import { MongoClient, ObjectId } from "mongodb";
import { ARTWORK_GALLERY } from "../lib/event-images";
import { COLLECTIONS } from "./schema";

const uri =
  process.env.MONGODB_URI ||
  process.env.DATABASE_URL ||
  "mongodb://localhost:27017/eventallify";

// Hashed 'password123' for Better Auth credential provider
const HASHED_PASSWORD_123 =
  "09c90d0bc202472ef047faaeac580392:df94d5471789d3522dc8d8a11659b3771346624502bb8790779ef0505c6af3d53f6145c4933e9ed9204fa30050fd7877bdbe6ec2723472518419a78a5db46029";

async function seed() {
  console.log("Connecting to MongoDB Atlas at:", uri.replace(/:[^:@]+@/, ":****@"));
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();

  console.log("Seeding Eventallify database with 16 users, 18 rich events & full campus activity...");

  const usersCol = db.collection(COLLECTIONS.USER);
  const accountsCol = db.collection("account");
  const eventsCol = db.collection(COLLECTIONS.EVENTS);
  const announcementsCol = db.collection(COLLECTIONS.ANNOUNCEMENTS);
  const registrationsCol = db.collection(COLLECTIONS.REGISTRATIONS);
  const certificatesCol = db.collection(COLLECTIONS.CERTIFICATES);
  const feedbackCol = db.collection(COLLECTIONS.FEEDBACK);
  const notificationsCol = db.collection(COLLECTIONS.NOTIFICATIONS);
  const bookmarksCol = db.collection(COLLECTIONS.BOOKMARKS);

  // Clear existing collections for a clean, consistent seed
  await Promise.all([
    eventsCol.deleteMany({}),
    announcementsCol.deleteMany({}),
    registrationsCol.deleteMany({}),
    certificatesCol.deleteMany({}),
    feedbackCol.deleteMany({}),
    notificationsCol.deleteMany({}),
    bookmarksCol.deleteMany({}),
    usersCol.deleteMany({}),
    accountsCol.deleteMany({}),
  ]);

  const now = new Date();

  // 1. Seed 16 Diverse Campus Users (Student, Organizer, Admin)
  const userDefs = [
    {
      name: "Abhishek Sharma",
      email: "student@college.edu",
      role: "student",
      department: "School of Computer Science and Engineering (SCOPE)",
      collegeYear: "3rd Year (Junior)",
      bio: "Passionate Full-Stack Developer & Open Source Contributor. Hackathon enthusiast.",
      interests: ["Artificial Intelligence", "Web Development", "Competitive Coding", "UI/UX Design"],
    },
    {
      name: "Prof. Raghavan S.",
      email: "admin@college.edu",
      role: "admin",
      department: "School of Computer Science and Engineering (SCOPE)",
      collegeYear: "Faculty Coordinator",
      bio: "Faculty Advisor for Technical Clubs & Campus Hackathons",
      interests: ["Artificial Intelligence", "Web Development", "Cybersecurity", "Robotics & IoT"],
    },
    {
      name: "Dr. Shalini Mukherji",
      email: "organizer@college.edu",
      role: "organizer",
      department: "Directorate of Student Welfare (DSW)",
      collegeYear: "Events Director",
      bio: "Lead Coordinator for Inter-Collegiate Cultural and Technical Fests.",
      interests: ["Cultural Arts", "Hackathon", "Seminar", "Leadership"],
    },
    {
      name: "Priya Patel",
      email: "priya.patel@college.edu",
      role: "student",
      department: "School of Electronics Engineering (SENSE)",
      collegeYear: "2nd Year (Sophomore)",
      bio: "Robotics hardware developer, embedded systems & drone enthusiast.",
      interests: ["Robotics & IoT", "Embedded Systems", "Hardware Design"],
    },
    {
      name: "Rohan Verma",
      email: "rohan.v@college.edu",
      role: "student",
      department: "School of Computer Science and Engineering (SCOPE)",
      collegeYear: "4th Year (Senior)",
      bio: "Cloud & DevOps architect, AWS Certified Solutions Architect.",
      interests: ["Cloud & DevOps", "Kubernetes", "Distributed Systems"],
    },
    {
      name: "Ananya Iyer",
      email: "ananya.iyer@college.edu",
      role: "student",
      department: "School of Design & Creative Arts (V-SIGN)",
      collegeYear: "3rd Year (Junior)",
      bio: "Product designer, design systems lead & 3D animator in Spline/Figma.",
      interests: ["UI/UX Design", "3D Modeling", "Design Systems", "Web Design"],
    },
    {
      name: "Kabir Mehta",
      email: "kabir.m@college.edu",
      role: "student",
      department: "School of Computer Science and Engineering (SCOPE)",
      collegeYear: "3rd Year (Junior)",
      bio: "Competitive programmer (Knight on LeetCode), National Hackathon finalist.",
      interests: ["Competitive Coding", "Algorithms", "Artificial Intelligence"],
    },
    {
      name: "Sneha Reddy",
      email: "sneha.reddy@college.edu",
      role: "student",
      department: "Cyber Security & Digital Forensics (SCOPE)",
      collegeYear: "2nd Year (Sophomore)",
      bio: "Ethical hacker, CTF player & bug bounty researcher.",
      interests: ["Cybersecurity", "Network Defense", "Cryptography"],
    },
    {
      name: "Rahul Nair",
      email: "rahul.nair@college.edu",
      role: "student",
      department: "Department of Physical Education & Sports",
      collegeYear: "4th Year (Senior)",
      bio: "University Football Team Captain & Sports Council Secretary.",
      interests: ["Football", "Athletics", "Fitness & Sports Management"],
    },
    {
      name: "Divya Deshmukh",
      email: "divya.d@college.edu",
      role: "student",
      department: "School of Humanities & Social Sciences",
      collegeYear: "3rd Year (Junior)",
      bio: "President of D-Tribe Dance Club. Classical Bharatanatyam & Contemporary dancer.",
      interests: ["Dance & Choreography", "Cultural Arts", "Music"],
    },
    {
      name: "Vikramaditya Rao",
      email: "vikram.rao@college.edu",
      role: "student",
      department: "School of Information Technology (SITE)",
      collegeYear: "4th Year (Senior)",
      bio: "Esports Club President, Valorant Radiant tier competitive player & caster.",
      interests: ["Esports & Gaming", "Game Development", "Live Streaming"],
    },
    {
      name: "Tanvi Sen",
      email: "tanvi.sen@college.edu",
      role: "student",
      department: "School of Bio Sciences & Technology (SBST)",
      collegeYear: "2nd Year (Sophomore)",
      bio: "Computational biology researcher working on generative AI in drug design.",
      interests: ["Bioinformatics", "Genomics", "AI in Healthcare"],
    },
    {
      name: "Siddharth Malhotra",
      email: "siddharth.m@college.edu",
      role: "student",
      department: "VIT Business School (VITBS)",
      collegeYear: "3rd Year (Junior)",
      bio: "E-Cell Lead, Student Entrepreneur building campus peer tutoring platform.",
      interests: ["Startups & Venture Capital", "Fintech", "Product Management"],
    },
    {
      name: "Meera Krishnan",
      email: "meera.k@college.edu",
      role: "student",
      department: "School of Architecture & Media Studies",
      collegeYear: "4th Year (Senior)",
      bio: "Lead Photographer for University Magazine & Visual Director.",
      interests: ["Photography", "Cinematography", "Visual Arts"],
    },
    {
      name: "Aryan Gupta",
      email: "aryan.gupta@college.edu",
      role: "student",
      department: "School of Mechanical Engineering (SMEC)",
      collegeYear: "2nd Year (Sophomore)",
      bio: "Robotics builder, Formula Student racing team chassis fabricator.",
      interests: ["Automotive Engineering", "Combat Robotics", "CAD Design"],
    },
    {
      name: "Neha Kapoor",
      email: "neha.kapoor@college.edu",
      role: "student",
      department: "School of Electrical Engineering (SELECT)",
      collegeYear: "3rd Year (Junior)",
      bio: "Renewable energy advocate & Campus Events Organization Committee lead.",
      interests: ["Clean Energy", "Smart Grids", "Event Management"],
    },
  ];

  const createdUsers: any[] = [];

  for (const u of userDefs) {
    const userDocId = new ObjectId();
    const userStringId = userDocId.toString();

    const userRecord = {
      _id: userDocId,
      id: userStringId,
      name: u.name,
      email: u.email,
      emailVerified: true,
      role: u.role,
      department: u.department,
      collegeYear: u.collegeYear,
      bio: u.bio,
      interests: u.interests,
      notificationPreferences: {
        email: true,
        reminders: true,
        announcements: true,
      },
      createdAt: now,
      updatedAt: now,
    };

    await usersCol.insertOne(userRecord as any);

    // Create credential account so user can sign in with 'password123'
    await accountsCol.insertOne({
      _id: new ObjectId(),
      userId: userDocId,
      accountId: userStringId,
      providerId: "credential",
      password: HASHED_PASSWORD_123,
      createdAt: now,
      updatedAt: now,
    });

    createdUsers.push(userRecord);
  }

  console.log(`Inserted ${createdUsers.length} user profiles with valid credentials (password: password123).`);

  const primaryStudent = createdUsers[0];
  const primaryAdmin = createdUsers[1];
  const primaryOrganizer = createdUsers[2];

  // 2. Seed 18 Rich Campus Events (Upcoming, Completed, Pending Approval, Drafts)
  const sampleEvents = [
    {
      id: "devsprint-2026-hackathon",
      title: "DevSprint 2026: 36-Hour National Hackathon",
      shortDescription: "Build innovative AI and web applications in a 36-hour sprint with ₹1,00,000 in prizes.",
      description:
        "DevSprint 2026 is VIT Chennai's premier 36-hour hackathon bringing together over 500 developers, designers, and innovators. Tackle real-world problem statements across Generative AI, Web3, FinTech, and Smart Healthcare. Top mentors from Google, Microsoft, and leading startups will provide round-the-clock guidance.",
      category: "Hackathon",
      imageUrl: ARTWORK_GALLERY.Hackathon[0],
      venue: "Anna Auditorium & Central Computing Lab",
      locationDetails: "Ground Floor, Academic Block 1 (Auditorium Wing)",
      date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // in 4 days
      startDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      registrationDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      maxParticipants: 150,
      organizerName: "CodeChef VIT Chapter",
      organizerContact: "codechef@vitchennai.ac.in",
      status: "published",
      allowWaitlist: true,
      tags: ["AI", "Web3", "Hackathon", "Open Source"],
      schedule: [
        { time: "09:00 AM", activity: "Check-in & Kit Distribution", speaker: "Volunteers" },
        { time: "10:30 AM", activity: "Opening Ceremony & Problem Statement Reveal", speaker: "Dean SCOPE" },
        { time: "11:30 AM", activity: "Hacking Commences", speaker: "All Teams" },
        { time: "08:00 PM", activity: "Mentorship Round 1", speaker: "Industry Mentors" },
        { time: "03:00 PM (Day 2)", activity: "Final Project Pitching & Demos", speaker: "Jury Panel" },
        { time: "06:00 PM (Day 2)", activity: "Award Ceremony & Cash Prizes", speaker: "Chief Guest" },
      ],
      rules: [
        "Teams must consist of 2 to 4 registered university students.",
        "All code must be written during the hackathon period.",
        "Plagiarism or misconduct will lead to immediate team disqualification.",
      ],
      prizes: [
        { position: "1st Place", reward: "₹50,000 Cash + Internship Offers", description: "Trophy, Swag Box & Cloud Credits" },
        { position: "2nd Place", reward: "₹30,000 Cash + Mentorship", description: "Swag Box & Cloud Credits" },
        { position: "3rd Place", reward: "₹20,000 Cash", description: "Certificates of Excellence" },
      ],
      speakers: [
        { name: "Dr. Ananya Roy", role: "Principal AI Scientist", organization: "DeepMind", bio: "Leading research in foundational multi-modal models." },
      ],
      faqs: [
        { question: "Can beginners participate?", answer: "Yes! There will be dedicated mentors to guide participants of all skill levels." },
        { question: "Is food provided during the 36 hours?", answer: "Yes, complimentary meals, snacks, and caffeine beverages will be provided." },
      ],
      createdBy: primaryAdmin.id,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "ai-agents-llm-masterclass",
      title: "Full-Stack AI Agents & LLM Masterclass",
      shortDescription: "Hands-on masterclass building production-grade autonomous AI agents with Next.js and Gemini.",
      description:
        "Step into the future of software engineering. Learn how to build, deploy, and scale autonomous AI agents that can reason, browse tools, and write code. Hands-on coding session covering LangChain, Google Gemini API, Groq inference, Function Calling, and vector database embeddings.",
      category: "Workshop",
      imageUrl: ARTWORK_GALLERY.Workshop[0],
      venue: "Smart Classroom 402, Technology Tower",
      locationDetails: "4th Floor, Tech Tower (Room TT-402)",
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // in 2 days
      startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
      registrationDeadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      maxParticipants: 80,
      organizerName: "Google Developer Student Club (GDSC)",
      organizerContact: "gdsc@vitchennai.ac.in",
      status: "published",
      allowWaitlist: true,
      tags: ["AI", "Gemini", "LLM", "Next.js"],
      schedule: [
        { time: "02:00 PM", activity: "Introduction to AI Agents & Tool Calling Architecture", speaker: "GDSC AI Lead" },
        { time: "03:00 PM", activity: "Live Lab: Integrating Gemini Live & Function Calling", speaker: "Hands-on Session" },
        { time: "04:30 PM", activity: "Deployment to Vercel & Production Best Practices", speaker: "Cloud Lead" },
      ],
      rules: ["Laptops with Node.js v18+ and VS Code installed are mandatory."],
      prizes: [{ position: "Top Agent Project", reward: "₹5,000 Amazon Vouchers + GDSC Swag", description: "Fast-track interview with partner AI startup" }],
      speakers: [{ name: "Karthik Subramanian", role: "Staff AI Engineer", organization: "Atlassian", bio: "Specializes in enterprise generative AI toolchains." }],
      faqs: [{ question: "Do I need an active API key?", answer: "Free workshop API credits will be provided for the session." }],
      createdBy: primaryAdmin.id,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "vibrance-2026-pro-night",
      title: "Vibrance 2026: Battle of the Bands & Pro-Night",
      shortDescription: "The grandest musical night of South India featuring premier college bands and celebrity artist.",
      description:
        "Experience the electrifying pulse of VIT Chennai's cultural festival Vibrance 2026. Top western and fusion bands from across India clash in an intense musical face-off followed by a high-energy celebrity live concert.",
      category: "Cultural",
      imageUrl: ARTWORK_GALLERY.Cultural[0],
      venue: "Open Air Amphitheatre (OAT)",
      locationDetails: "Central Campus Lakeside Amphitheatre",
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
      registrationDeadline: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
      maxParticipants: 1200,
      organizerName: "Music & Arts Club (MAC)",
      organizerContact: "vibrance@vitchennai.ac.in",
      status: "published",
      allowWaitlist: false,
      tags: ["Music", "Concert", "Cultural", "Live Performance"],
      schedule: [
        { time: "05:00 PM", activity: "Gates Open & ID Verification", speaker: "Security" },
        { time: "06:00 PM", activity: "Battle of the Bands - Finals", speaker: "8 Competing Bands" },
        { time: "08:30 PM", activity: "Celebrity Headliner Concert", speaker: "Live Performance" },
      ],
      rules: ["Physical or Digital QR Pass is mandatory for entry."],
      prizes: [{ position: "Best Band Trophy", reward: "₹40,000 Cash", description: "Studio Recording Deal" }],
      speakers: [],
      faqs: [{ question: "Are non-students allowed?", answer: "Only students with valid college ID and digital passes will be admitted." }],
      createdBy: primaryOrganizer.id,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "designx-ui-ux-bootcamp",
      title: "DesignX: UI/UX & Spatial Product Design Bootcamp",
      shortDescription: "Craft stunning interactive web & mobile interfaces with Figma, Spline 3D, and Micro-interactions.",
      description:
        "A masterclass for product designers, frontend engineers, and creative thinkers. Learn the psychology of human-computer interaction, design tokens, responsive typography, and how to create interactive 3D web experiences using Spline and Framer Motion.",
      category: "Workshop",
      imageUrl: ARTWORK_GALLERY.Workshop[1],
      venue: "V-SIGN Design Studio, AB-2",
      locationDetails: "Room 305, Academic Block 2",
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000),
      registrationDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      maxParticipants: 60,
      organizerName: "Designers Club (V-SIGN)",
      organizerContact: "designx@vitchennai.ac.in",
      status: "published",
      allowWaitlist: true,
      tags: ["UI/UX", "Figma", "Design", "Spline"],
      schedule: [
        { time: "10:00 AM", activity: "Modern Dark-Mode & Glassmorphic UI Principles", speaker: "Lead Designer" },
        { time: "01:30 PM", activity: "Interactive 3D Assets in Spline", speaker: "Design Mentor" },
      ],
      rules: ["Figma desktop app installed on laptop is required."],
      prizes: [{ position: "Best UI Prototype", reward: "₹7,500 Cash + Figma Pro Subscription", description: "Featured on Campus Portfolio" }],
      speakers: [{ name: "Meera Krishnan", role: "Design Director", organization: "CRED", bio: "Pioneered luxury dark-mode aesthetics in fintech." }],
      faqs: [],
      createdBy: primaryAdmin.id,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "cybershield-ethical-hacking-ctf",
      title: "CyberShield: Live Ethical Hacking & Capture The Flag",
      shortDescription: "24-hour jeopardy-style cybersecurity competition testing cryptography, web exploits, and forensics.",
      description:
        "Put your offensive and defensive cybersecurity skills to the ultimate test. Solve real-world vulnerability scenarios, reverse engineer binaries, break RSA ciphers, and defend your virtual infrastructure against live red-team adversary simulations.",
      category: "Technical",
      imageUrl: ARTWORK_GALLERY.Technical[1],
      venue: "Cyber Security Lab 5, Technology Tower",
      locationDetails: "Tech Tower, 5th Floor Lab 501",
      date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      startDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      maxParticipants: 100,
      organizerName: "Null Chapter & OWASP Student Club",
      organizerContact: "owasp@vitchennai.ac.in",
      status: "published",
      allowWaitlist: true,
      tags: ["Cybersecurity", "CTF", "Ethical Hacking"],
      schedule: [
        { time: "10:00 AM", activity: "Opening Briefing & Rules of Engagement", speaker: "Lead Security Auditor" },
        { time: "11:00 AM", activity: "CTF Portal Unlocked - Jeopardy Rounds", speaker: "All Teams" },
      ],
      rules: ["Attacking score servers or unassigned network ranges is strictly prohibited."],
      prizes: [{ position: "1st Place (Flag Master)", reward: "₹25,000 Cash + OSCP Exam Vouchers", description: "CyberShield Trophy" }],
      speakers: [{ name: "Rohit Deshmukh", role: "Principal Security Researcher", organization: "CrowdStrike", bio: "CVE discoverer and bug bounty hunter." }],
      faqs: [],
      createdBy: primaryAdmin.id,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "inter-department-football-2026",
      title: "Inter-Department Football Championship 2026",
      shortDescription: "Annual football tournament featuring 16 department teams competing for the Dean's Cup.",
      description:
        "Cheer for your school! The annual 7-a-side football tournament returns with high intensity matches under floodlights. Trophies for Best Striker, Best Goalkeeper, and Team Champions.",
      category: "Sports",
      imageUrl: ARTWORK_GALLERY.Sports[0],
      venue: "University Main Sports Ground",
      locationDetails: "Outdoor Floodlit Football Field",
      date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      startDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
      registrationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      maxParticipants: 300,
      organizerName: "Sports Council",
      organizerContact: "sports@vitchennai.ac.in",
      status: "published",
      allowWaitlist: false,
      tags: ["Football", "Sports", "Tournament"],
      schedule: [{ time: "04:30 PM", activity: "Opening Match: SCOPE vs SMEC", speaker: "Referee Panel" }],
      rules: ["FIFA standard 7-a-side rules apply. Shinguards mandatory."],
      prizes: [{ position: "Champions", reward: "Dean's Rolling Cup + ₹20,000 Cash", description: "Gold Medals" }],
      speakers: [],
      faqs: [],
      createdBy: primaryAdmin.id,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "robotics-arena-combat-bots",
      title: "Robotics Arena: Autonomous Maze & Combat Bot Clash",
      shortDescription: "Fast-paced robotics combat and precision line-follower maze challenges.",
      description:
        "Witness heavy steel combat bots and autonomous maze solvers go head-to-head in custom-built arenas. Featuring weight categories of 15kg, 30kg, and wireless RC obstacle trackers.",
      category: "Technical",
      imageUrl: ARTWORK_GALLERY.Technical[0],
      venue: "Indoor Sports Complex & Arena",
      locationDetails: "Court 1, Indoor Complex",
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      registrationDeadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      maxParticipants: 200,
      organizerName: "RoboVITics Club",
      organizerContact: "robovitics@vitchennai.ac.in",
      status: "published",
      allowWaitlist: true,
      tags: ["Robotics", "Hardware", "Combat"],
      schedule: [{ time: "10:00 AM", activity: "Safety Inspection & Weapon Calibration", speaker: "Technical Jury" }],
      rules: ["Bots must adhere to pneumatic pressure and voltage safety limits."],
      prizes: [{ position: "Combat Champion", reward: "₹25,000 Cash + RoboVITics Trophy", description: "Component Sponsorship" }],
      speakers: [],
      faqs: [],
      createdBy: primaryAdmin.id,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "startup-runway-pitch-investors",
      title: "Startup Runway: Pitch to Angel Investors & VCs",
      shortDescription: "Present your early-stage startup MVP to prominent angel syndicates and seed incubators.",
      description:
        "Are you building the next disruptive SaaS, AI copilot, or hardware solution? Pitch live in front of a panel of active angel investors, venture capitalists, and university accelerator directors for instant feedback and term sheet discussions.",
      category: "Seminar",
      imageUrl: ARTWORK_GALLERY.Seminar[1],
      venue: "Innovation & Incubation Center, AB-1",
      locationDetails: "V-NEST Incubator Hall, 2nd Floor",
      date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
      startDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
      registrationDeadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      maxParticipants: 120,
      organizerName: "Entrepreneurship Cell (E-Cell)",
      organizerContact: "ecell@vitchennai.ac.in",
      status: "published",
      allowWaitlist: true,
      tags: ["Startups", "Venture Capital", "Incubation"],
      schedule: [{ time: "02:00 PM", activity: "Keynote: How to Raise Your First Pre-Seed Round", speaker: "Founding Partner" }],
      rules: ["Slide deck must not exceed 10 slides in PDF format."],
      prizes: [{ position: "Most Investable Startup", reward: "₹1,00,000 Seed Grant + Free Incubation", description: "Direct Fast-track to Y Combinator review" }],
      speakers: [{ name: "Rajesh Kannan", role: "Managing Director", organization: "Blume Ventures", bio: "Invested in over 40 Indian deep-tech unicorns." }],
      faqs: [],
      createdBy: primaryAdmin.id,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "vit-esports-championship-2026",
      title: "VIT Esports Championship: Valorant & BGMI LAN",
      shortDescription: "Campus LAN gaming tournament with 5v5 tactical shooter and battle royale championship stages.",
      description:
        "High-refresh-rate monitors, low ping fiber LAN, and intense clutch rounds. 32 teams battle for glory with live auditorium projector shoutcasting and spectator arena.",
      category: "Sports",
      imageUrl: ARTWORK_GALLERY.Sports[1],
      venue: "Central Computing Center Gaming Arena",
      locationDetails: "Lab 3, Central Computing Center",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      registrationDeadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      maxParticipants: 250,
      organizerName: "Gaming & Esports Society",
      organizerContact: "esports@vitchennai.ac.in",
      status: "published",
      allowWaitlist: true,
      tags: ["Esports", "Gaming", "Valorant"],
      schedule: [{ time: "11:00 AM", activity: "Quarter-Finals BO3 (Valorant)", speaker: "Shoutcasters" }],
      rules: ["Tournament accounts must be in good standing. Third-party macros strictly forbidden."],
      prizes: [{ position: "Valorant Champions", reward: "₹20,000 Cash + Mechanical Keyboards", description: "Custom Jerseys" }],
      speakers: [],
      faqs: [],
      createdBy: primaryOrganizer.id,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "nritya-classical-western-dance",
      title: "Nritya: Classical & Western Dance Extravaganza",
      shortDescription: "High-octane solo and crew dance battles across Hip-Hop, Contemporary, and Bharatanatyam.",
      description:
        "Feel the rhythm! The biggest inter-collegiate dance championship returns with choreography, synchronization rounds, and freestyle dance-offs with celebrity judges.",
      category: "Cultural",
      imageUrl: ARTWORK_GALLERY.Cultural[1],
      venue: "MG Auditorium",
      locationDetails: "Main Stage, MG Auditorium",
      date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      startDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000),
      registrationDeadline: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
      maxParticipants: 800,
      organizerName: "Dance Club (D-Tribe)",
      organizerContact: "dtribe@vitchennai.ac.in",
      status: "published",
      allowWaitlist: false,
      tags: ["Dance", "Cultural", "Music"],
      schedule: [{ time: "04:00 PM", activity: "Solo Classical Prelims", speaker: "Jury" }],
      rules: ["Audio tracks must be submitted in MP3 format 2 hours before performance."],
      prizes: [{ position: "Mega Crew Champions", reward: "₹35,000 Cash + Rotating Trophy", description: "Championship Banner" }],
      speakers: [],
      faqs: [],
      createdBy: primaryOrganizer.id,
      createdAt: now,
      updatedAt: now,
    },

    // PAST COMPLETED EVENTS (With rich feedback & certificates)
    {
      id: "cloud-devops-symposium-2026",
      title: "National Cloud & DevOps Symposium 2026",
      shortDescription: "A comprehensive look into Kubernetes, Serverless architectures, and Terraform.",
      description:
        "Completed flagship technical seminar on modern distributed systems, site reliability engineering, and CI/CD automation. Attended by 150+ students with hands-on labs and certifications.",
      category: "Seminar",
      imageUrl: ARTWORK_GALLERY.Seminar[0],
      venue: "MG Auditorium",
      locationDetails: "Hall B, MG Auditorium",
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago (Past Event)
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
      registrationDeadline: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      maxParticipants: 150,
      organizerName: "AWS Cloud Club",
      organizerContact: "awsclub@vitchennai.ac.in",
      status: "completed",
      allowWaitlist: false,
      tags: ["Cloud", "DevOps", "Kubernetes", "AWS"],
      schedule: [{ time: "10:00 AM", activity: "Keynote: Architecting Resilient Cloud Systems", speaker: "AWS Hero" }],
      rules: [],
      prizes: [],
      speakers: [{ name: "Siddharth Verma", role: "Principal Cloud Architect", organization: "Amazon Web Services" }],
      faqs: [],
      createdBy: primaryAdmin.id,
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    },
    {
      id: "quantum-computing-research-colloquium",
      title: "Research Horizons: Quantum Computing & Generative Biology",
      shortDescription: "Distinguished faculty colloquium exploring quantum annealing, qubit entanglement, and protein folding AI.",
      description:
        "Completed colloquium joining leading scientists and professors from IISc, IIT Madras, and VIT for an intellectual deep-dive into quantum simulation algorithms and AI-powered drug discovery.",
      category: "Academic",
      imageUrl: ARTWORK_GALLERY.Academic[0],
      venue: "Academic Block 3, Conference Hall A",
      locationDetails: "Conference Hall A, AB-3",
      date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago (Past Event)
      startDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
      registrationDeadline: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000),
      maxParticipants: 100,
      organizerName: "Center for Advanced Research & SCOPE",
      organizerContact: "research@vitchennai.ac.in",
      status: "completed",
      allowWaitlist: false,
      tags: ["Research", "Quantum", "Bioinformatics"],
      schedule: [{ time: "10:30 AM", activity: "Quantum Algorithms: Beyond Classical Limits", speaker: "Prof. S. Ranganathan" }],
      rules: [],
      prizes: [],
      speakers: [{ name: "Prof. S. Ranganathan", role: "Senior Quantum Physicist", organization: "Indian Institute of Science" }],
      faqs: [],
      createdBy: primaryAdmin.id,
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
    },
    {
      id: "monochrome-photography-exhibition",
      title: "Monochrome: Photography & Fine Arts Showcase",
      shortDescription: "Annual visual arts exhibition displaying curated student canvas paintings and photojournalism.",
      description:
        "Completed visual arts exhibition displaying over 200 curated photographs, digital concept art pieces, and canvas paintings with live art workshops and student prints on display.",
      category: "Cultural",
      imageUrl: ARTWORK_GALLERY.Cultural[0],
      venue: "Student Activity Center (SAC) Gallery",
      locationDetails: "SAC Main Floor Exhibition Gallery",
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago (Past Event)
      startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      registrationDeadline: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      maxParticipants: 400,
      organizerName: "Fine Arts & Photography Club (FAPC)",
      organizerContact: "fapc@vitchennai.ac.in",
      status: "completed",
      allowWaitlist: false,
      tags: ["Photography", "Art", "Exhibition"],
      schedule: [{ time: "11:00 AM", activity: "Gallery Inauguration & Curators Walkthrough", speaker: "Dean" }],
      rules: ["Flash photography strictly prohibited inside the main canvas gallery."],
      prizes: [{ position: "Best Visual Story", reward: "₹10,000 Cash + Camera Accessories", description: "Framed feature in University Annual" }],
      speakers: [],
      faqs: [],
      createdBy: primaryOrganizer.id,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },

    // PENDING APPROVAL EVENTS (For Admin Approval Workflow)
    {
      id: "fintech-blockchain-summit-2026",
      title: "Fintech & Algorithmic Trading Summit 2026",
      shortDescription: "Explore quantitative modeling, high-frequency trading APIs, and DeFi protocol security.",
      description:
        "Student proposal submitted for administrative review. Featuring guest quant analysts from Mumbai and Bangalore trading desks discussing latency optimization and portfolio risk modeling.",
      category: "Seminar",
      imageUrl: ARTWORK_GALLERY.Seminar[0],
      venue: "Smart Classroom 301, AB-2",
      locationDetails: "Room 301, Academic Block 2",
      date: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
      startDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
      registrationDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      maxParticipants: 90,
      organizerName: "Finance & Fintech Club",
      organizerContact: "fintech@vitchennai.ac.in",
      status: "pending_approval",
      allowWaitlist: true,
      tags: ["Fintech", "Trading", "Algorithms"],
      schedule: [{ time: "02:00 PM", activity: "Quantitative Strategies Overview", speaker: "Quant Lead" }],
      rules: [],
      prizes: [],
      speakers: [],
      faqs: [],
      createdBy: createdUsers[11].id, // Siddharth Malhotra (Student)
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "drone-racing-aerial-navigation",
      title: "Drone Racing & Autonomous FPV Aerial Challenge",
      shortDescription: "High-speed indoor drone obstacle navigation and autonomous computer vision racing.",
      description:
        "Submission for campus drone league. Custom carbon fiber racing drones navigate neon-lit gates in the sports dome with live first-person-view goggles feeds.",
      category: "Technical",
      imageUrl: ARTWORK_GALLERY.Technical[0],
      venue: "Sports Dome Arena",
      locationDetails: "Main Indoor Dome",
      date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      startDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      registrationDeadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
      maxParticipants: 120,
      organizerName: "AeroVITics Flight Club",
      organizerContact: "aerovitics@vitchennai.ac.in",
      status: "pending_approval",
      allowWaitlist: true,
      tags: ["Drones", "FPV", "Robotics"],
      schedule: [{ time: "09:00 AM", activity: "FPV Calibration and Time Trials", speaker: "Flight Marshals" }],
      rules: ["All drones must pass failsafe motor kill-switch inspection."],
      prizes: [{ position: "Fastest Lap Trophy", reward: "₹15,000 Cash", description: "FPV Flight Kit" }],
      speakers: [],
      faqs: [],
      createdBy: createdUsers[3].id, // Priya Patel (Student)
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "global-career-expo-2026",
      title: "Global Tech Career Expo & Internship Fair 2026",
      shortDescription: "Connect directly with 50+ hiring tech companies, startup founders, and recruitment teams.",
      description:
        "The annual university career expo featuring premier software engineering, data science, consulting, and finance recruiters. Bring printed resumes for on-the-spot interviews and networking sessions.",
      category: "Academic",
      imageUrl: ARTWORK_GALLERY.Academic[0],
      venue: "Convention Center & Exhibition Hall",
      locationDetails: "Grand Convention Center, Ground Floor",
      date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
      startDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 19 * 24 * 60 * 60 * 1000),
      registrationDeadline: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000),
      maxParticipants: 1500,
      organizerName: "Career Development Centre (CDC)",
      organizerContact: "cdc@vitchennai.ac.in",
      status: "published",
      allowWaitlist: false,
      tags: ["Careers", "Placements", "Internships"],
      schedule: [{ time: "09:00 AM", activity: "Registration & Company Booths Open", speaker: "CDC Volunteers" }],
      rules: ["Formal attire and university student identity card required."],
      prizes: [],
      speakers: [],
      faqs: [],
      createdBy: primaryAdmin.id,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "nextjs-edge-runtime-masterclass",
      title: "Next.js 16 & Edge Runtime Deep Dive",
      shortDescription: "Technical deep dive into React Server Components, Server Actions, and sub-millisecond edge latency.",
      description:
        "Learn advanced patterns in Next.js 16 App Router, streaming SSR, partial prerendering (PPR), and deploying globally distributed apps on modern edge infrastructures.",
      category: "Workshop",
      imageUrl: ARTWORK_GALLERY.Workshop[0],
      venue: "Computer Lab 204, Academic Block 2",
      locationDetails: "Room 204, Academic Block 2",
      date: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
      startDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
      registrationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      maxParticipants: 70,
      organizerName: "ACM Student Chapter",
      organizerContact: "acm@vitchennai.ac.in",
      status: "published",
      allowWaitlist: true,
      tags: ["Next.js", "React", "TypeScript"],
      schedule: [{ time: "02:00 PM", activity: "Architecture of Modern React 19 & Next.js 16", speaker: "ACM Tech Lead" }],
      rules: ["Familiarity with JavaScript/TypeScript recommended."],
      prizes: [],
      speakers: [],
      faqs: [],
      createdBy: primaryAdmin.id,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "green-energy-smart-grids-workshop",
      title: "Smart Grids & Clean Energy Workshop (Draft)",
      shortDescription: "Hands-on EV powertrain testing and smart grid telemetry demonstration.",
      description:
        "Draft organizer blueprint for upcoming clean energy symposium. Covers solar MPPT controllers and battery storage management.",
      category: "Technical",
      imageUrl: ARTWORK_GALLERY.Technical[0],
      venue: "SELECT Power Systems Lab",
      locationDetails: "SELECT Lab 102",
      date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      startDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
      registrationDeadline: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000),
      maxParticipants: 50,
      organizerName: "IEEE Power & Energy Society",
      organizerContact: "ieee.pes@vitchennai.ac.in",
      status: "draft",
      allowWaitlist: true,
      tags: ["Clean Energy", "Smart Grids"],
      schedule: [],
      rules: [],
      prizes: [],
      speakers: [],
      faqs: [],
      createdBy: primaryOrganizer.id,
      createdAt: now,
      updatedAt: now,
    },
  ];

  // Insert all events
  for (const ev of sampleEvents) {
    await eventsCol.insertOne({
      _id: new ObjectId(),
      ...ev,
    } as any);
  }
  console.log(`Inserted ${sampleEvents.length} events across all campus categories and statuses.`);

  // 3. Seed Realistic Registrations for the 16 Users
  const registrationsToInsert: any[] = [];
  const bookmarksToInsert: any[] = [];
  const feedbackToInsert: any[] = [];
  const certificatesToInsert: any[] = [];

  // Key events for Abhishek (primary student)
  const studentRegisteredEventIds = [
    "devsprint-2026-hackathon",
    "ai-agents-llm-masterclass",
    "designx-ui-ux-bootcamp",
    "cybershield-ethical-hacking-ctf",
    "cloud-devops-symposium-2026", // Past completed
    "quantum-computing-research-colloquium", // Past completed
  ];

  for (const evId of studentRegisteredEventIds) {
    const ev = sampleEvents.find((e) => e.id === evId)!;
    const isPast = ev.date < now;
    const regId = "REG-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    const qrData = JSON.stringify({
      passId: regId,
      eventId: ev.id,
      userId: primaryStudent.id,
      userName: primaryStudent.name,
      userEmail: primaryStudent.email,
      eventTitle: ev.title,
      eventDate: ev.date.toISOString(),
      eventVenue: ev.venue,
    });

    registrationsToInsert.push({
      _id: new ObjectId(),
      id: regId,
      userId: primaryStudent.id,
      eventId: ev.id,
      studentName: primaryStudent.name,
      studentEmail: primaryStudent.email,
      department: primaryStudent.department,
      collegeYear: primaryStudent.collegeYear,
      status: "confirmed",
      qrCode: qrData,
      verificationToken: "tok_" + Math.random().toString(36).substring(2, 12),
      checkedIn: isPast,
      checkedInAt: isPast ? new Date(ev.date.getTime() + 15 * 60 * 1000) : null,
      registeredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    });
  }

  // Add 1 waitlisted registration for primary student
  const waitlistEvent = sampleEvents.find((e) => e.id === "nritya-classical-western-dance")!;
  const waitlistRegId = "REG-" + Math.random().toString(36).substring(2, 8).toUpperCase();
  registrationsToInsert.push({
    _id: new ObjectId(),
    id: waitlistRegId,
    userId: primaryStudent.id,
    eventId: waitlistEvent.id,
    studentName: primaryStudent.name,
    studentEmail: primaryStudent.email,
    department: primaryStudent.department,
    collegeYear: primaryStudent.collegeYear,
    status: "waitlisted",
    waitlistPosition: 3,
    qrCode: null,
    verificationToken: "tok_" + Math.random().toString(36).substring(2, 12),
    checkedIn: false,
    checkedInAt: null,
    registeredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  });

  // Bookmarks for primary student
  bookmarksToInsert.push(
    {
      _id: new ObjectId(),
      id: "BM-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      userId: primaryStudent.id,
      eventId: "vibrance-2026-pro-night",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      _id: new ObjectId(),
      id: "BM-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      userId: primaryStudent.id,
      eventId: "startup-runway-pitch-investors",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      _id: new ObjectId(),
      id: "BM-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      userId: primaryStudent.id,
      eventId: "nextjs-edge-runtime-masterclass",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    }
  );

  // Verifiable Certificates for Abhishek
  certificatesToInsert.push(
    {
      _id: new ObjectId(),
      id: "CERT-VIT-2026-001",
      userId: primaryStudent.id,
      eventId: "cloud-devops-symposium-2026",
      studentName: primaryStudent.name,
      studentEmail: primaryStudent.email,
      eventTitle: "National Cloud & DevOps Symposium 2026",
      eventDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      organizerName: "AWS Cloud Club & SCOPE",
      verificationCode: "CERT-VIT-2026-001",
      issuedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    },
    {
      _id: new ObjectId(),
      id: "CERT-VIT-2026-002",
      userId: primaryStudent.id,
      eventId: "quantum-computing-research-colloquium",
      studentName: primaryStudent.name,
      studentEmail: primaryStudent.email,
      eventTitle: "Research Horizons: Quantum Computing & Generative Biology",
      eventDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      organizerName: "Center for Advanced Research & SCOPE",
      verificationCode: "CERT-VIT-2026-002",
      issuedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
    }
  );

  // Feedback for Abhishek
  feedbackToInsert.push(
    {
      _id: new ObjectId(),
      id: "FB-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      userId: primaryStudent.id,
      eventId: "cloud-devops-symposium-2026",
      userName: primaryStudent.name,
      rating: 5,
      comment: "Incredible hands-on Kubernetes lab! The industry speaker explained cluster architecture with amazing clarity.",
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    },
    {
      _id: new ObjectId(),
      id: "FB-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      userId: primaryStudent.id,
      eventId: "quantum-computing-research-colloquium",
      userName: primaryStudent.name,
      rating: 5,
      comment: "Super intellectual session! The presentation on quantum annealing and protein folding was mind-blowing.",
      createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
    }
  );

  // Distribute other 15 users across events
  for (let i = 1; i < createdUsers.length; i++) {
    const user = createdUsers[i];
    // Assign 3 to 5 events to each user
    const userEvents = [
      sampleEvents[i % sampleEvents.length],
      sampleEvents[(i + 3) % sampleEvents.length],
      sampleEvents[(i + 7) % sampleEvents.length],
      sampleEvents[(i + 11) % sampleEvents.length],
    ];

    for (const ev of userEvents) {
      const isPast = ev.date < now;
      const regId = "REG-" + Math.random().toString(36).substring(2, 8).toUpperCase();
      const qrData = JSON.stringify({
        passId: regId,
        eventId: ev.id,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        eventTitle: ev.title,
        eventDate: ev.date.toISOString(),
      });

      registrationsToInsert.push({
        _id: new ObjectId(),
        id: regId,
        userId: user.id,
        eventId: ev.id,
        studentName: user.name,
        studentEmail: user.email,
        department: user.department,
        collegeYear: user.collegeYear,
        status: "confirmed",
        qrCode: qrData,
        verificationToken: "tok_" + Math.random().toString(36).substring(2, 12),
        checkedIn: isPast,
        checkedInAt: isPast ? new Date(ev.date.getTime() + 10 * 60 * 1000) : null,
        registeredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      });

      // Also add random bookmarks
      if (Math.random() > 0.4) {
        bookmarksToInsert.push({
          _id: new ObjectId(),
          id: "BM-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
          userId: user.id,
          eventId: ev.id,
          createdAt: now,
        });
      }
    }

    // Add certificate & feedback for past events
    const attendedPast = userEvents.filter((e) => e.date < now);
    for (const pastEv of attendedPast) {
      const certId = `CERT-VIT-2026-${String(certificatesToInsert.length + 1).padStart(3, "0")}`;
      certificatesToInsert.push({
        _id: new ObjectId(),
        id: certId,
        userId: user.id,
        eventId: pastEv.id,
        studentName: user.name,
        studentEmail: user.email,
        eventTitle: pastEv.title,
        eventDate: pastEv.date,
        organizerName: pastEv.organizerName || "VIT Chennai",
        verificationCode: certId,
        issuedAt: new Date(pastEv.date.getTime() + 24 * 60 * 60 * 1000),
      });

      feedbackToInsert.push({
        _id: new ObjectId(),
        id: "FB-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        userId: user.id,
        eventId: pastEv.id,
        userName: user.name,
        rating: Math.random() > 0.25 ? 5 : 4,
        comment: [
          "Amazing organization and great hands-on takeaways! Learned so much.",
          "One of the best campus events this semester. The mentors were super helpful.",
          "Really well executed. The digital check-in and certificate flow was seamless.",
          "Fantastic session! Looking forward to the next edition.",
        ][i % 4],
        createdAt: new Date(pastEv.date.getTime() + 36 * 60 * 60 * 1000),
      });
    }
  }

  await registrationsCol.insertMany(registrationsToInsert);
  console.log(`Inserted ${registrationsToInsert.length} realistic event registrations.`);

  await certificatesCol.insertMany(certificatesToInsert);
  console.log(`Inserted ${certificatesToInsert.length} verifiable digital certificates.`);

  await feedbackCol.insertMany(feedbackToInsert);
  console.log(`Inserted ${feedbackToInsert.length} authentic event reviews & ratings.`);

  await bookmarksCol.insertMany(bookmarksToInsert);
  console.log(`Inserted ${bookmarksToInsert.length} saved event bookmarks.`);

  // 4. Seed Campus Announcements
  const sampleAnnouncements = [
    {
      id: "ANN-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      title: "DevSprint 2026 Problem Statements Released!",
      content:
        "All registered hackathon teams can now access the problem statement repository on GitHub. Mentors will be available on Discord starting Friday 8:00 AM. Check your registered email for team channel links.",
      eventId: "devsprint-2026-hackathon",
      priority: "high",
      createdBy: primaryAdmin.id,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      id: "ANN-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      title: "Vibrance 2026 Pro-Night Entry & Security Guidelines",
      content:
        "Gates for the Open Air Amphitheatre will open strictly at 5:00 PM. Digital QR passes must be presented at the barcode scanners for gate clearance. External college students must carry physical college identity cards.",
      eventId: "vibrance-2026-pro-night",
      priority: "high",
      createdBy: primaryAdmin.id,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: "ANN-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      title: "Campus Wi-Fi Upgrade in Central Computing Lab",
      content:
        "High-speed 10Gbps dedicated fiber connection has been deployed across Central Computing Labs 1-4 ahead of the upcoming National Coding competitions.",
      eventId: null,
      priority: "normal",
      createdBy: primaryAdmin.id,
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
    {
      id: "ANN-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      title: "Career Expo 2026: Resume Verification Desk Open",
      content:
        "Students attending the Global Career Expo can get their resumes reviewed and stamped at the Career Development Centre (CDC) between 10:00 AM and 4:00 PM this week.",
      eventId: "global-career-expo-2026",
      priority: "normal",
      createdBy: primaryAdmin.id,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      id: "ANN-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      title: "DesignX Workshop: Spline 3D Asset Pack Download",
      content:
        "Registered attendees of the DesignX Bootcamp should pre-download the starter assets and 3D modeling files from the resources portal.",
      eventId: "designx-ui-ux-bootcamp",
      priority: "normal",
      createdBy: primaryAdmin.id,
      createdAt: new Date(Date.now() - 1 * 12 * 60 * 60 * 1000),
    },
  ];

  await announcementsCol.insertMany(sampleAnnouncements as any);
  console.log(`Inserted ${sampleAnnouncements.length} campus announcements.`);

  // 5. Seed Notifications for Primary Student & Admin
  const sampleNotifications = [
    {
      id: "NOTIF-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      userId: primaryStudent.id,
      title: "Registration Confirmed!",
      message: "You are registered for DevSprint 2026. Your digital QR pass is ready in your account.",
      type: "registration",
      link: `/events/devsprint-2026-hackathon`,
      read: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: "NOTIF-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      userId: primaryStudent.id,
      title: "Certificate Issued!",
      message: "Your Certificate of Completion for National Cloud & DevOps Symposium 2026 is now available.",
      type: "certificate",
      link: `/profile`,
      read: true,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: "NOTIF-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      userId: primaryStudent.id,
      title: "Event Starting in 2 Days",
      message: "Reminder: Full-Stack AI Agents & LLM Masterclass takes place in Smart Classroom 402.",
      type: "reminder",
      link: `/events/ai-agents-llm-masterclass`,
      read: false,
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
    },
    {
      id: "NOTIF-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      userId: primaryAdmin.id,
      title: "New Event Pending Approval",
      message: '"Fintech & Algorithmic Trading Summit 2026" has been submitted for review by Siddharth Malhotra.',
      type: "approval",
      link: `/admin/approvals`,
      read: false,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    },
    {
      id: "NOTIF-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      userId: primaryAdmin.id,
      title: "New Event Pending Approval",
      message: '"Drone Racing & Autonomous FPV Aerial Challenge" has been submitted for review by Priya Patel.',
      type: "approval",
      link: `/admin/approvals`,
      read: false,
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    },
  ];

  await notificationsCol.insertMany(sampleNotifications as any);
  console.log(`Inserted ${sampleNotifications.length} notifications.`);

  console.log("\n=======================================================");
  console.log(" Database Successfully Seeded with 16 Users & 18 Events! ");
  console.log("=======================================================");
  console.log("Test Login Credentials (all accounts use password: password123):");
  console.log("1. Student:   student@college.edu");
  console.log("2. Admin:     admin@college.edu");
  console.log("3. Organizer: organizer@college.edu");
  console.log("4. Other Students: priya.patel@college.edu, rohan.v@college.edu, ananya.iyer@college.edu, etc.");
  console.log("=======================================================\n");

  await client.close();
}

seed().catch((err) => {
  console.error("Seeding failed with error:", err);
  process.exit(1);
});
