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

  console.log("Seeding Eventallify database with 15 users, 15 rich events & activity...");

  const usersCol = db.collection(COLLECTIONS.USER);
  const accountsCol = db.collection("account");
  const eventsCol = db.collection(COLLECTIONS.EVENTS);
  const announcementsCol = db.collection(COLLECTIONS.ANNOUNCEMENTS);
  const registrationsCol = db.collection(COLLECTIONS.REGISTRATIONS);
  const certificatesCol = db.collection(COLLECTIONS.CERTIFICATES);
  const feedbackCol = db.collection(COLLECTIONS.FEEDBACK);
  const notificationsCol = db.collection(COLLECTIONS.NOTIFICATIONS);
  const bookmarksCol = db.collection(COLLECTIONS.BOOKMARKS);

  // Clear existing dynamic collections
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

  // 1. Seed 15 Diverse Users
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

  // 2. Seed 15 Rich Campus Events
  const sampleEvents = [
    {
      title: "DevSprint 2026: 36-Hour National Hackathon",
      shortDescription: "Build innovative AI and web applications in a 36-hour sprint with ₹1,00,000 in prizes.",
      description:
        "DevSprint 2026 is VIT Chennai's premier 36-hour hackathon bringing together over 500 developers, designers, and innovators. Tackle real-world problem statements across Generative AI, Web3, FinTech, and Smart Healthcare. Top mentors from Google, Microsoft, and leading startups will provide round-the-clock guidance.",
      category: "Hackathon",
      image: ARTWORK_GALLERY.Hackathon[0],
      venue: "Anna Auditorium & Central Computing Lab",
      startDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // in 4 days
      endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      registrationDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      capacity: 150,
      registeredCount: 142,
      checkedInCount: 0,
      status: "approved",
      organizer: {
        name: "CodeChef VIT Chapter",
        department: "SCOPE",
        contactEmail: "codechef@vitchennai.ac.in",
      },
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
      createdBy: primaryAdmin.id,
      createdAt: now,
      updatedAt: now,
    },
    {
      title: "Full-Stack AI Agents & LLM Masterclass",
      shortDescription: "Hands-on masterclass building production-grade autonomous AI agents with Next.js and Gemini.",
      description:
        "Step into the future of software engineering. Learn how to build, deploy, and scale autonomous AI agents that can reason, browse tools, and write code. Hands-on coding session covering LangChain, Google Gemini API, Function Calling, and vector database embeddings.",
      category: "Workshop",
      image: ARTWORK_GALLERY.Workshop[0],
      venue: "Smart Classroom 402, Technology Tower",
      startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // in 2 days
      endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
      registrationDeadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      capacity: 80,
      registeredCount: 80, // Full capacity demonstration
      checkedInCount: 0,
      status: "approved",
      organizer: {
        name: "Google Developer Student Club (GDSC)",
        department: "SCOPE",
        contactEmail: "gdsc@vitchennai.ac.in",
      },
      schedule: [
        { time: "02:00 PM", activity: "Introduction to AI Agents & Tool Calling Architecture", speaker: "GDSC AI Lead" },
        { time: "03:00 PM", activity: "Live Lab: Integrating Gemini Live & Function Calling", speaker: "Hands-on Session" },
        { time: "04:30 PM", activity: "Deployment to Vercel & Production Best Practices", speaker: "Cloud Lead" },
      ],
      rules: ["Laptops with Node.js v18+ and VS Code installed are mandatory."],
      prizes: [{ position: "Top Agent Project", reward: "₹5,000 Amazon Vouchers + GDSC Swag", description: "Fast-track interview with partner AI startup" }],
      speakers: [{ name: "Karthik Subramanian", role: "Staff AI Engineer", organization: "Atlassian", bio: "Specializes in enterprise generative AI toolchains." }],
      createdBy: primaryAdmin.id,
      createdAt: now,
      updatedAt: now,
    },
    {
      title: "Vibrance 2026: Battle of the Bands & Pro-Night",
      shortDescription: "The grandest musical night of South India featuring premier college bands and celebrity artist.",
      description:
        "Experience the electrifying pulse of VIT Chennai's cultural festival Vibrance 2026. Top western and fusion bands from across India clash in an intense musical face-off followed by a high-energy celebrity live concert.",
      category: "Cultural",
      image: ARTWORK_GALLERY.Cultural[0],
      venue: "Open Air Amphitheatre (OAT)",
      startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
      registrationDeadline: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
      capacity: 1200,
      registeredCount: 890,
      checkedInCount: 0,
      status: "approved",
      organizer: {
        name: "Music & Arts Club (MAC)",
        department: "Student Affairs",
        contactEmail: "vibrance@vitchennai.ac.in",
      },
      schedule: [
        { time: "05:00 PM", activity: "Gates Open & ID Verification", speaker: "Security" },
        { time: "06:00 PM", activity: "Battle of the Bands - Finals", speaker: "8 Competing Bands" },
        { time: "08:30 PM", activity: "Celebrity Headliner Concert", speaker: "Live Performance" },
      ],
      rules: ["Physical or Digital QR Pass is mandatory for entry."],
      prizes: [{ position: "Best Band Trophy", reward: "₹40,000 Cash", description: "Studio Recording Deal" }],
      speakers: [],
      createdBy: primaryAdmin.id,
      createdAt: now,
      updatedAt: now,
    },
    {
      title: "DesignX: UI/UX & Spatial Product Design Bootcamp",
      shortDescription: "Craft stunning interactive web & mobile interfaces with Figma, Spline 3D, and Micro-interactions.",
      description:
        "A masterclass for product designers, frontend engineers, and creative thinkers. Learn the psychology of human-computer interaction, design tokens, responsive typography, and how to create interactive 3D web experiences using Spline and Framer Motion.",
      category: "Workshop",
      image: ARTWORK_GALLERY.Workshop[1],
      venue: "V-SIGN Design Studio, AB-2",
      startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000),
      registrationDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      capacity: 60,
      registeredCount: 52,
      checkedInCount: 0,
      status: "approved",
      organizer: {
        name: "Designers Club (V-SIGN)",
        department: "School of Design",
        contactEmail: "designx@vitchennai.ac.in",
      },
      schedule: [
        { time: "10:00 AM", activity: "Modern Dark-Mode & Glassmorphic UI Principles", speaker: "Lead Designer" },
        { time: "01:30 PM", activity: "Interactive 3D Assets in Spline", speaker: "Design Mentor" },
      ],
      rules: ["Figma desktop app installed on laptop is required."],
      prizes: [{ position: "Best UI Prototype", reward: "₹7,500 Cash + Figma Pro Subscription", description: "Featured on Campus Portfolio" }],
      speakers: [{ name: "Meera Krishnan", role: "Design Director", organization: "CRED", bio: "Pioneered luxury dark-mode aesthetics in fintech." }],
      createdBy: primaryAdmin.id,
      createdAt: now,
      updatedAt: now,
    },
    {
      title: "CyberShield: Live Ethical Hacking & Capture The Flag",
      shortDescription: "24-hour jeopardy-style cybersecurity competition testing cryptography, web exploits, and forensics.",
      description:
        "Put your offensive and defensive cybersecurity skills to the ultimate test. Solve real-world vulnerability scenarios, reverse engineer binaries, break RSA ciphers, and defend your virtual infrastructure against live red-team adversary simulations.",
      category: "Technical",
      image: ARTWORK_GALLERY.Technical[1],
      venue: "Cyber Security Lab 5, Technology Tower",
      startDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      capacity: 100,
      registeredCount: 74,
      checkedInCount: 0,
      status: "approved",
      organizer: {
        name: "Null Chapter & OWASP Student Club",
        department: "SCOPE",
        contactEmail: "owasp@vitchennai.ac.in",
      },
      schedule: [
        { time: "10:00 AM", activity: "Opening Briefing & Rules of Engagement", speaker: "Lead Security Auditor" },
        { time: "11:00 AM", activity: "CTF Portal Unlocked - Jeopardy Rounds", speaker: "All Teams" },
      ],
      rules: ["Attacking score servers or unassigned network ranges is strictly prohibited."],
      prizes: [{ position: "1st Place (Flag Master)", reward: "₹25,000 Cash + OSCP Exam Vouchers", description: "CyberShield Trophy" }],
      speakers: [{ name: "Rohit Deshmukh", role: "Principal Security Researcher", organization: "CrowdStrike", bio: "CVE discoverer and bug bounty hunter." }],
      createdBy: primaryAdmin.id,
      createdAt: now,
      updatedAt: now,
    },
    {
      title: "Inter-Department Football Championship 2026",
      shortDescription: "Annual football tournament featuring 16 department teams competing for the Dean's Cup.",
      description:
        "Cheer for your school! The annual 7-a-side football tournament returns with high intensity matches under floodlights. Trophies for Best Striker, Best Goalkeeper, and Team Champions.",
      category: "Sports",
      image: ARTWORK_GALLERY.Sports[0],
      venue: "University Main Sports Ground",
      startDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
      capacity: 300,
      registeredCount: 180,
      checkedInCount: 0,
      status: "approved",
      organizer: {
        name: "Sports Council",
        department: "Department of Physical Education",
      },
      schedule: [{ time: "04:30 PM", activity: "Opening Match: SCOPE vs SMEC", speaker: "Referee Panel" }],
      rules: ["FIFA standard 7-a-side rules apply. Shinguards mandatory."],
      prizes: [{ position: "Champions", reward: "Dean's Rolling Cup + ₹20,000 Cash", description: "Gold Medals" }],
      speakers: [],
      createdBy: primaryAdmin.id,
      createdAt: now,
      updatedAt: now,
    },
    {
      title: "Robotics Arena: Autonomous Maze & Combat Bot Clash",
      shortDescription: "Fast-paced robotics combat and precision line-follower maze challenges.",
      description:
        "Witness heavy steel combat bots and autonomous maze solvers go head-to-head in custom-built arenas. Featuring weight categories of 15kg, 30kg, and wireless RC obstacle trackers.",
      category: "Technical",
      image: ARTWORK_GALLERY.Technical[0],
      venue: "Indoor Sports Complex & Arena",
      startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      registrationDeadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      capacity: 200,
      registeredCount: 110,
      checkedInCount: 0,
      status: "approved",
      organizer: {
        name: "RoboVITics Club",
        department: "SMEC / SENSE",
        contactEmail: "robovitics@vitchennai.ac.in",
      },
      schedule: [{ time: "10:00 AM", activity: "Safety Inspection & Weapon Calibration", speaker: "Technical Jury" }],
      rules: ["Bots must adhere to pneumatic pressure and voltage safety limits."],
      prizes: [{ position: "Combat Champion", reward: "₹25,000 Cash + RoboVITics Trophy", description: "Component Sponsorship" }],
      speakers: [],
      createdBy: primaryAdmin.id,
      createdAt: now,
      updatedAt: now,
    },
    {
      title: "Startup Runway: Pitch to Angel Investors & VCs",
      shortDescription: "Present your early-stage startup MVP to prominent angel syndicates and seed incubators.",
      description:
        "Are you building the next disruptive SaaS, AI copilot, or hardware solution? Pitch live in front of a panel of active angel investors, venture capitalists, and university accelerator directors for instant feedback and term sheet discussions.",
      category: "Seminar",
      image: ARTWORK_GALLERY.Seminar[1],
      venue: "Innovation & Incubation Center, AB-1",
      startDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
      capacity: 120,
      registeredCount: 85,
      checkedInCount: 0,
      status: "approved",
      organizer: {
        name: "Entrepreneurship Cell (E-Cell)",
        department: "VIT Business School",
        contactEmail: "ecell@vitchennai.ac.in",
      },
      schedule: [{ time: "02:00 PM", activity: "Keynote: How to Raise Your First Pre-Seed Round", speaker: "Founding Partner" }],
      rules: ["Slide deck must not exceed 10 slides in PDF format."],
      prizes: [{ position: "Most Investable Startup", reward: "₹1,00,000 Seed Grant + Free Incubation", description: "Direct Fast-track to Y Combinator review" }],
      speakers: [{ name: "Rajesh Kannan", role: "Managing Director", organization: "Blume Ventures", bio: "Invested in over 40 Indian deep-tech unicorns." }],
      createdBy: primaryAdmin.id,
      createdAt: now,
      updatedAt: now,
    },
    {
      title: "VIT Esports Championship: Valorant & BGMI LAN",
      shortDescription: "Campus LAN gaming tournament with 5v5 tactical shooter and battle royale championship stages.",
      description:
        "High-refresh-rate monitors, low ping fiber LAN, and intense clutch rounds. 32 teams battle for glory with live auditorium projector shoutcasting and spectator arena.",
      category: "Sports",
      image: ARTWORK_GALLERY.Sports[1],
      venue: "Central Computing Center Gaming Arena",
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      capacity: 250,
      registeredCount: 210,
      checkedInCount: 0,
      status: "approved",
      organizer: {
        name: "Gaming & Esports Society",
        department: "Student Affairs",
        contactEmail: "esports@vitchennai.ac.in",
      },
      schedule: [{ time: "11:00 AM", activity: "Quarter-Finals BO3 (Valorant)", speaker: "Shoutcasters" }],
      rules: ["Tournament accounts must be in good standing. Third-party macros strictly forbidden."],
      prizes: [{ position: "Valorant Champions", reward: "₹20,000 Cash + Mechanical Keyboards", description: "Custom Jerseys" }],
      speakers: [],
      createdBy: primaryAdmin.id,
      createdAt: now,
      updatedAt: now,
    },
    {
      title: "Nritya: Classical & Western Dance Extravaganza",
      shortDescription: "High-octane solo and crew dance battles across Hip-Hop, Contemporary, and Bharatanatyam.",
      description:
        "Feel the rhythm! The biggest inter-collegiate dance championship returns with choreography, synchronization rounds, and freestyle dance-offs with celebrity judges.",
      category: "Cultural",
      image: ARTWORK_GALLERY.Cultural[1],
      venue: "MG Auditorium",
      startDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000),
      capacity: 800,
      registeredCount: 620,
      checkedInCount: 0,
      status: "approved",
      organizer: {
        name: "Dance Club (D-Tribe)",
        department: "Student Welfare",
        contactEmail: "dtribe@vitchennai.ac.in",
      },
      schedule: [{ time: "04:00 PM", activity: "Solo Classical Prelims", speaker: "Jury" }],
      rules: ["Audio tracks must be submitted in MP3 format 2 hours before performance."],
      prizes: [{ position: "Mega Crew Champions", reward: "₹35,000 Cash + Rotating Trophy", description: "Championship Banner" }],
      speakers: [],
      createdBy: primaryAdmin.id,
      createdAt: now,
      updatedAt: now,
    },
    {
      title: "National Cloud & DevOps Symposium 2026",
      shortDescription: "A comprehensive look into Kubernetes, Serverless architectures, and Terraform.",
      description:
        "Completed flagship technical seminar on modern distributed systems, site reliability engineering, and CI/CD automation. Attended by 150+ students with hands-on labs and certifications.",
      category: "Seminar",
      image: ARTWORK_GALLERY.Seminar[0],
      venue: "MG Auditorium",
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago (Past Event)
      endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
      capacity: 150,
      registeredCount: 148,
      checkedInCount: 135,
      status: "approved",
      organizer: {
        name: "AWS Cloud Club",
        department: "SCOPE",
        contactEmail: "awsclub@vitchennai.ac.in",
      },
      schedule: [{ time: "10:00 AM", activity: "Keynote: Architecting Resilient Cloud Systems", speaker: "AWS Hero" }],
      rules: [],
      prizes: [],
      speakers: [{ name: "Siddharth Verma", role: "Principal Cloud Architect", organization: "Amazon Web Services" }],
      createdBy: primaryAdmin.id,
      createdAt: now,
      updatedAt: now,
    },
    {
      title: "Research Horizons: Quantum Computing & Generative Biology",
      shortDescription: "Distinguished faculty colloquium exploring quantum annealing, qubit entanglement, and protein folding AI.",
      description:
        "Join leading scientists and professors from IISc, IIT Madras, and VIT for an intellectual deep-dive into quantum simulation algorithms and AI-powered drug discovery.",
      category: "Academic",
      image: ARTWORK_GALLERY.Academic[0],
      venue: "Academic Block 3, Conference Hall A",
      startDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
      capacity: 100,
      registeredCount: 48,
      checkedInCount: 0,
      status: "approved",
      organizer: {
        name: "Center for Advanced Research & SCOPE",
        department: "SCOPE",
        contactEmail: "research@vitchennai.ac.in",
      },
      schedule: [{ time: "10:30 AM", activity: "Quantum Algorithms: Beyond Classical Limits", speaker: "Prof. S. Ranganathan" }],
      rules: [],
      prizes: [],
      speakers: [{ name: "Prof. S. Ranganathan", role: "Senior Quantum Physicist", organization: "Indian Institute of Science" }],
      createdBy: primaryAdmin.id,
      createdAt: now,
      updatedAt: now,
    },
    {
      title: "Global Tech Career Expo & Internship Fair 2026",
      shortDescription: "Connect directly with 50+ hiring tech companies, startup founders, and recruitment teams.",
      description:
        "The annual university career expo featuring premier software engineering, data science, consulting, and finance recruiters. Bring printed resumes for on-the-spot interviews and networking sessions.",
      category: "Academic",
      image: ARTWORK_GALLERY.Academic[1] || ARTWORK_GALLERY.Academic[0],
      venue: "Convention Center & Exhibition Hall",
      startDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 19 * 24 * 60 * 60 * 1000),
      capacity: 1500,
      registeredCount: 1120,
      checkedInCount: 0,
      status: "approved",
      organizer: {
        name: "Career Development Centre (CDC)",
        department: "University Placement Cell",
        contactEmail: "cdc@vitchennai.ac.in",
      },
      schedule: [{ time: "09:00 AM", activity: "Registration & Company Booths Open", speaker: "CDC Volunteers" }],
      rules: ["Formal attire and university student identity card required."],
      prizes: [],
      speakers: [],
      createdBy: primaryAdmin.id,
      createdAt: now,
      updatedAt: now,
    },
    {
      title: "Monochrome: Photography & Fine Arts Showcase",
      shortDescription: "Annual visual arts exhibition displaying curated student canvas paintings and photojournalism.",
      description:
        "Immerse yourself in student creativity. Over 200 curated photographs, digital concept art pieces, and canvas paintings on display with live art workshops and student prints for sale.",
      category: "Cultural",
      image: ARTWORK_GALLERY.Cultural[0],
      venue: "Student Activity Center (SAC) Gallery",
      startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      capacity: 400,
      registeredCount: 230,
      checkedInCount: 0,
      status: "approved",
      organizer: {
        name: "Fine Arts & Photography Club (FAPC)",
        department: "Student Affairs",
        contactEmail: "fapc@vitchennai.ac.in",
      },
      schedule: [{ time: "11:00 AM", activity: "Gallery Inauguration & Curators Walkthrough", speaker: "Dean" }],
      rules: ["Flash photography strictly prohibited inside the main canvas gallery."],
      prizes: [{ position: "Best Visual Story", reward: "₹10,000 Cash + Camera Accessories", description: "Framed feature in University Annual" }],
      speakers: [],
      createdBy: primaryAdmin.id,
      createdAt: now,
      updatedAt: now,
    },
    {
      title: "Next.js 16 & Edge Runtime Deep Dive",
      shortDescription: "Technical deep dive into React Server Components, Server Actions, and sub-millisecond edge latency.",
      description:
        "Learn advanced patterns in Next.js 16 App Router, streaming SSR, partial prerendering (PPR), and deploying globally distributed apps on modern edge infrastructures.",
      category: "Workshop",
      image: ARTWORK_GALLERY.Workshop[0],
      venue: "Computer Lab 204, Academic Block 2",
      startDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
      capacity: 70,
      registeredCount: 65,
      checkedInCount: 0,
      status: "approved",
      organizer: {
        name: "ACM Student Chapter",
        department: "SCOPE",
        contactEmail: "acm@vitchennai.ac.in",
      },
      schedule: [{ time: "02:00 PM", activity: "Architecture of Modern React 19 & Next.js 16", speaker: "ACM Tech Lead" }],
      rules: ["Familiarity with JavaScript/TypeScript recommended."],
      prizes: [],
      speakers: [],
      createdBy: primaryAdmin.id,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const insertedEvents = await eventsCol.insertMany(sampleEvents as any);
  console.log(`Inserted ${sampleEvents.length} rich campus events across all categories.`);

  const eventDocs = await eventsCol.find({}).toArray();

  // 3. Seed Realistic Registrations for the 15 Users
  const registrationsToInsert: any[] = [];
  const bookmarksToInsert: any[] = [];
  const feedbackToInsert: any[] = [];
  const certificatesToInsert: any[] = [];

  // Register Abhishek (primary student) for multiple key events
  const abhishekEvents = [eventDocs[0], eventDocs[1], eventDocs[3], eventDocs[10]]; // Hackathon, AI Workshop, DesignX, Past Cloud Symposium

  for (const ev of abhishekEvents) {
    const isPast = ev.startDate < now;
    const regId = "REG-" + Math.random().toString(36).substring(2, 7).toUpperCase();
    const qrData = JSON.stringify({
      passId: regId,
      eventId: ev._id.toString(),
      userId: primaryStudent.id,
      userEmail: primaryStudent.email,
      eventTitle: ev.title,
      date: ev.startDate,
      venue: ev.venue,
    });

    registrationsToInsert.push({
      _id: new ObjectId(),
      registrationId: regId,
      eventId: ev._id.toString(),
      event: ev,
      userId: primaryStudent.id,
      userName: primaryStudent.name,
      userEmail: primaryStudent.email,
      eventTitle: ev.title,
      eventCategory: ev.category,
      eventVenue: ev.venue,
      eventDate: ev.startDate,
      status: isPast ? "attended" : "confirmed",
      qrCodeData: qrData,
      qrCode: qrData,
      checkedIn: isPast,
      checkedInAt: isPast ? new Date(ev.startDate.getTime() + 15 * 60 * 1000) : null,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: now,
    });
  }

  // Issue Verified Certificate for Abhishek's attended event
  const certId = "CERT-VIT-2026-001";
  certificatesToInsert.push({
    _id: new ObjectId(),
    certificateId: certId,
    eventId: eventDocs[10]._id.toString(),
    userId: primaryStudent.id,
    userName: primaryStudent.name,
    userEmail: primaryStudent.email,
    eventTitle: eventDocs[10].title,
    eventCategory: eventDocs[10].category,
    issueDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    issuerName: "AWS Cloud Club & SCOPE",
    issuerTitle: "Faculty Coordinator & Club President",
    grade: "Distinction",
    skills: ["Cloud Architecture", "Docker", "Kubernetes", "CI/CD Automation", "Infrastructure as Code"],
    verificationUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify/${certId}`,
    qrCodeData: `https://eventallify.edu/verify/${certId}`,
    isValid: true,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
  });

  // Distribute other users across events
  for (let i = 1; i < createdUsers.length; i++) {
    const user = createdUsers[i];
    // Assign 2 to 4 events to each user
    const selectedEvents = [
      eventDocs[i % eventDocs.length],
      eventDocs[(i + 3) % eventDocs.length],
      eventDocs[(i + 7) % eventDocs.length],
    ];

    for (const ev of selectedEvents) {
      const isPast = ev.startDate < now;
      const regId = "REG-" + Math.random().toString(36).substring(2, 7).toUpperCase();
      const qrData = JSON.stringify({
        passId: regId,
        eventId: ev._id.toString(),
        userId: user.id,
        userEmail: user.email,
        eventTitle: ev.title,
      });

      registrationsToInsert.push({
        _id: new ObjectId(),
        registrationId: regId,
        eventId: ev._id.toString(),
        event: ev,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        eventTitle: ev.title,
        eventCategory: ev.category,
        eventVenue: ev.venue,
        eventDate: ev.startDate,
        status: isPast ? "attended" : "confirmed",
        qrCodeData: qrData,
        qrCode: qrData,
        checkedIn: isPast,
        checkedInAt: isPast ? new Date(ev.startDate.getTime() + 10 * 60 * 1000) : null,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: now,
      });

      // Also add random bookmarks
      if (Math.random() > 0.4) {
        bookmarksToInsert.push({
          _id: new ObjectId(),
          userId: user.id,
          eventId: ev._id.toString(),
          createdAt: now,
        });
      }
    }

    // If registered for past event, add certificate & review
    if (selectedEvents.some((e) => e.title.includes("Cloud"))) {
      const userCertId = `CERT-VIT-2026-${String(i + 1).padStart(3, "0")}`;
      certificatesToInsert.push({
        _id: new ObjectId(),
        certificateId: userCertId,
        eventId: eventDocs[10]._id.toString(),
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        eventTitle: eventDocs[10].title,
        eventCategory: eventDocs[10].category,
        issueDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        issuerName: "AWS Cloud Club & SCOPE",
        issuerTitle: "Faculty Coordinator",
        grade: "Excellence",
        skills: ["Cloud Architecture", "DevOps", "Kubernetes"],
        verificationUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify/${userCertId}`,
        qrCodeData: `https://eventallify.edu/verify/${userCertId}`,
        isValid: true,
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      });

      feedbackToInsert.push({
        _id: new ObjectId(),
        eventId: eventDocs[10]._id.toString(),
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        rating: Math.random() > 0.3 ? 5 : 4,
        comment: [
          "Incredible hands-on Kubernetes lab! The industry speaker explained cluster architecture with amazing clarity.",
          "One of the best technical symposiums hosted on campus this semester. The certification process was super smooth.",
          "Great organization and high-quality mentors. Learned so much about CI/CD pipelines and Terraform.",
          "Awesome session! Loved the live cloud deployment demos and Q&A.",
        ][i % 4],
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      });
    }
  }

  if (registrationsToInsert.length > 0) {
    await registrationsCol.insertMany(registrationsToInsert);
    console.log(`Inserted ${registrationsToInsert.length} realistic event registrations.`);
  }

  if (certificatesToInsert.length > 0) {
    await certificatesCol.insertMany(certificatesToInsert);
    console.log(`Inserted ${certificatesToInsert.length} verifiable certificates.`);
  }

  if (feedbackToInsert.length > 0) {
    await feedbackCol.insertMany(feedbackToInsert);
    console.log(`Inserted ${feedbackToInsert.length} authentic event reviews & ratings.`);
  }

  if (bookmarksToInsert.length > 0) {
    await bookmarksCol.insertMany(bookmarksToInsert);
    console.log(`Inserted ${bookmarksToInsert.length} saved event bookmarks.`);
  }

  // 4. Seed Campus Announcements
  const sampleAnnouncements = [
    {
      title: "DevSprint 2026 Problem Statements Released!",
      content:
        "All registered hackathon teams can now access the problem statement repository on GitHub. Mentors will be available on Discord starting Friday 8:00 AM. Check your registered email for team channel links.",
      priority: "urgent",
      authorName: "Prof. Raghavan S. (Dean SCOPE)",
      authorId: primaryAdmin.id,
      category: "Hackathon",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: now,
    },
    {
      title: "Vibrance 2026 Pro-Night Entry & Security Guidelines",
      content:
        "Gates for the Open Air Amphitheatre will open strictly at 5:00 PM. Digital QR passes must be presented at the barcode scanners for gate clearance. External college students must carry physical college identity cards.",
      priority: "important",
      authorName: "Student Affairs & Security Council",
      authorId: primaryAdmin.id,
      category: "Cultural",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: now,
    },
    {
      title: "Campus Wi-Fi Upgrade in Central Computing Lab",
      content:
        "High-speed 10Gbps dedicated fiber connection has been deployed across Central Computing Labs 1-4 ahead of the upcoming National Coding competitions.",
      priority: "normal",
      authorName: "Campus IT Services",
      authorId: primaryAdmin.id,
      category: "Technical",
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      updatedAt: now,
    },
    {
      title: "Career Expo 2026: Resume Verification Desk Open",
      content:
        "Students attending the Global Career Expo can get their resumes reviewed and stamped at the Career Development Centre (CDC) between 10:00 AM and 4:00 PM this week.",
      priority: "important",
      authorName: "Career Development Centre (CDC)",
      authorId: primaryAdmin.id,
      category: "Academic",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: now,
    },
  ];

  await announcementsCol.insertMany(sampleAnnouncements as any);
  console.log(`Inserted ${sampleAnnouncements.length} campus announcements.`);

  // 5. Seed Notifications for Primary Student
  const sampleNotifications = [
    {
      userId: primaryStudent.id,
      title: "Registration Confirmed!",
      message: "You are registered for DevSprint 2026. Your digital QR pass is ready.",
      type: "registration",
      link: `/events/${eventDocs[0]._id.toString()}`,
      read: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      userId: primaryStudent.id,
      title: "Certificate Issued!",
      message: "Your Certificate of Completion for Cloud & DevOps Symposium is now available.",
      type: "certificate",
      link: `/profile`,
      read: true,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  ];

  await notificationsCol.insertMany(sampleNotifications as any);
  console.log(`Inserted sample student notifications.`);

  console.log("\n=======================================================");
  console.log(" Database Successfully Seeded with 15 Users & 15 Events! ");
  console.log("=======================================================");
  console.log("Test Login Credentials (all accounts use password: password123):");
  console.log("1. Student: student@college.edu");
  console.log("2. Admin:   admin@college.edu");
  console.log("3. Other Students: priya.patel@college.edu, rohan.v@college.edu, ananya.iyer@college.edu, etc.");
  console.log("=======================================================\n");

  await client.close();
}

seed().catch((err) => {
  console.error("Seeding failed with error:", err);
  process.exit(1);
});
