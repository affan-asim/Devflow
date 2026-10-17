// "use client";

// import {
//   ArrowUpRight,
//   BriefcaseBusiness,
//   Check,
//   ChevronDown,
//   Clock3,
//   MapPin,
//   Moon,
//   Search,
//   Sun,
// } from "lucide-react";
// import { useEffect, useState } from "react";

// const jobs = [
//   {
//     company: "Northstar",
//     role: "Senior Backend Engineer",
//     location: "Remote · Worldwide",
//     type: "Full-time",
//     salary: "$120k — $165k",
//     skills: ["Node.js", "PostgreSQL", "Redis"],
//     color: "teal",
//   },
//   {
//     company: "Linear Labs",
//     role: "Product Engineer",
//     location: "Remote · Europe",
//     type: "Full-time",
//     salary: "$95k — $140k",
//     skills: ["React", "Next.js", "TypeScript"],
//     color: "violet",
//   },
//   {
//     company: "Orbit Systems",
//     role: "Frontend Engineer",
//     location: "Hybrid · Berlin",
//     type: "Full-time",
//     salary: "€70k — €95k",
//     skills: ["React", "Design Systems", "CSS"],
//     color: "orange",
//   },
// ];

// const companies = [
//   {
//     name: "Northstar",
//     description:
//       "Infrastructure for the next generation of software.",
//     roles: 12,
//     category: "Technology",
//     mark: "N",
//   },
//   {
//     name: "Linear Labs",
//     description:
//       "Building tools that make software teams better.",
//     roles: 8,
//     category: "Software",
//     mark: "L",
//   },
//   {
//     name: "Orbit Systems",
//     description:
//       "Technology for a more connected world.",
//     roles: 16,
//     category: "Technology",
//     mark: "O",
//   },
// ];

// function CompanyMark({ letter, className = "" }) {
//   return (
//     <div className={`df-company-mark ${className}`}>
//       {letter}
//     </div>
//   );
// }

// function JobRow({ job, index }) {
//   return (
//     <div className="df-job-row group">
//       <div className="df-job-number">
//         0{index + 1}
//       </div>

//       <div className="df-job-main">
//         <div className="df-job-company">
//           <span className={`df-company-dot ${job.color}`} />
//           {job.company}
//         </div>

//         <h3>{job.role}</h3>

//         <div className="df-job-meta">
//           <span>
//             <MapPin size={14} />
//             {job.location}
//           </span>

//           <span>
//             <BriefcaseBusiness size={14} />
//             {job.type}
//           </span>
//         </div>
//       </div>

//       <div className="df-job-skills">
//         {job.skills.map((skill) => (
//           <span key={skill}>{skill}</span>
//         ))}
//       </div>

//       <div className="df-job-right">
//         <strong>{job.salary}</strong>

//         <span className="df-job-arrow">
//           <ArrowUpRight size={18} />
//         </span>
//       </div>
//     </div>
//   );
// }

// function HeroProduct() {
//   return (
//     <div className="df-hero-art">
//       <div className="df-art-glow" />

//       <div className="df-product-window">
//         <div className="df-product-bar">
//           <div className="df-product-brand">
//             <span className="df-mini-logo">
//               <i />
//               <i />
//             </span>

//             <strong>DevFlow</strong>
//           </div>

//           <div className="df-window-actions">
//             <span />
//             <span />
//             <span />
//           </div>
//         </div>

//         <div className="df-product-layout">
//           <aside className="df-product-sidebar">
//             <div className="df-side-section">
//               <span className="df-side-label">DISCOVER</span>

//               <span className="active">
//                 <Search size={13} />
//                 Opportunities
//               </span>

//               <span>
//                 <BriefcaseBusiness size={13} />
//                 Saved jobs
//               </span>
//             </div>

//             <div className="df-side-section">
//               <span className="df-side-label">PROFILE</span>

//               <span>My profile</span>
//               <span>Applications</span>
//             </div>

//             <div className="df-side-bottom">
//               <div className="df-mini-avatar">AK</div>
//               <span>Alex Khan</span>
//             </div>
//           </aside>

//           <div className="df-product-main">
//             <div className="df-product-main-top">
//               <div>
//                 <span>Discover</span>
//                 <h3>Opportunities for you</h3>
//               </div>

//               <button>
//                 Filters
//                 <ChevronDown size={13} />
//               </button>
//             </div>

//             <div className="df-product-search">
//               <Search size={15} />
//               <span>Search jobs, skills or companies</span>
//               <kbd>⌘ K</kbd>
//             </div>

//             <div className="df-product-jobs">
//               <div className="df-product-job featured">
//                 <div className="df-product-job-logo">N</div>

//                 <div className="df-product-job-info">
//                   <strong>Senior Backend Engineer</strong>
//                   <span>Northstar · Remote</span>

//                   <div>
//                     <small>Node.js</small>
//                     <small>PostgreSQL</small>
//                     <small>Redis</small>
//                   </div>
//                 </div>

//                 <b>$120k+</b>
//               </div>

//               <div className="df-product-job">
//                 <div className="df-product-job-logo violet">
//                   L
//                 </div>

//                 <div className="df-product-job-info">
//                   <strong>Product Engineer</strong>
//                   <span>Linear Labs · Remote</span>

//                   <div>
//                     <small>React</small>
//                     <small>Next.js</small>
//                   </div>
//                 </div>

//                 <b>$95k+</b>
//               </div>

//               <div className="df-product-job">
//                 <div className="df-product-job-logo orange">
//                   O
//                 </div>

//                 <div className="df-product-job-info">
//                   <strong>Frontend Engineer</strong>
//                   <span>Orbit Systems · Berlin</span>

//                   <div>
//                     <small>React</small>
//                     <small>CSS</small>
//                   </div>
//                 </div>

//                 <b>€70k+</b>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="df-floating-match">
//         <div className="df-match-top">
//           <span>Profile match</span>
//           <strong>94%</strong>
//         </div>

//         <div className="df-match-bar">
//           <i />
//         </div>

//         <p>
//           Your experience aligns strongly with this role.
//         </p>
//       </div>

//       <div className="df-floating-live">
//         <span />
//         <strong>1,248</strong>
//         <small>active opportunities</small>
//       </div>
//     </div>
//   );
// }

// function ProfilePreview() {
//   return (
//     <div className="df-profile-preview">
//       <div className="df-profile-topline">
//         <span>Developer profile</span>

//         <span className="df-live">
//           <i />
//           Visible to recruiters
//         </span>
//       </div>

//       <div className="df-profile-identity">
//         <div className="df-avatar">AK</div>

//         <div>
//           <h3>Alex Khan</h3>
//           <p>Full-stack developer · Lahore, PK</p>
//         </div>

//         <button>
//           View profile
//           <ArrowUpRight size={16} />
//         </button>
//       </div>

//       <div className="df-profile-bio">
//         Building reliable web products with a focus on backend
//         systems, developer experience and thoughtful interfaces.
//       </div>

//       <div className="df-profile-grid">
//         <div>
//           <span>Experience</span>
//           <strong>4 years</strong>
//         </div>

//         <div>
//           <span>Availability</span>
//           <strong>Open to work</strong>
//         </div>

//         <div>
//           <span>Location</span>
//           <strong>Remote</strong>
//         </div>
//       </div>

//       <div className="df-profile-skills">
//         <span>React</span>
//         <span>Node.js</span>
//         <span>PostgreSQL</span>
//         <span>Redis</span>
//         <span>Next.js</span>
//       </div>
//     </div>
//   );
// }

// function ApplicationPreview() {
//   const stages = [
//     ["Applied", "May 12"],
//     ["Review", "May 14"],
//     ["Interview", "May 18"],
//     ["Decision", "—"],
//   ];

//   return (
//     <div className="df-application-preview">
//       <div className="df-application-header">
//         <div>
//           <span>Application</span>
//           <h3>Senior Backend Engineer</h3>
//         </div>

//         <span className="df-status">Interview</span>
//       </div>

//       <div className="df-application-company">
//         <CompanyMark letter="N" />

//         <div>
//           <strong>Northstar</strong>
//           <span>Infrastructure · Remote</span>
//         </div>
//       </div>

//       <div className="df-progress">
//         <div className="df-progress-line" />

//         {stages.map(([label, date], index) => (
//           <div
//             className={`df-progress-step ${
//               index < 3 ? "completed" : ""
//             }`}
//             key={label}
//           >
//             <div className="df-progress-dot">
//               {index < 3 && <Check size={10} />}
//             </div>

//             <strong>{label}</strong>
//             <span>{date}</span>
//           </div>
//         ))}
//       </div>

//       <div className="df-application-note">
//         <Clock3 size={15} />
//         Last updated 2 hours ago
//       </div>
//     </div>
//   );
// }

// function RecruiterPreview() {
//   const candidates = [
//     ["MA", "Muhammad Ali", "Backend Engineer · 5 years", 94],
//     ["SR", "Sarah Rahman", "Software Engineer · 4 years", 91],
//     ["DK", "Daniel Kim", "Platform Engineer · 6 years", 89],
//   ];

//   return (
//     <div className="df-recruiter-preview">
//       <div className="df-recruiter-heading">
//         <div>
//           <span>Candidate discovery</span>
//           <h3>Backend Engineer</h3>
//         </div>

//         <span className="df-match">94% match</span>
//       </div>

//       {candidates.map(([initials, name, role, score], index) => (
//         <div className="df-candidate" key={name}>
//           <div
//             className={`df-candidate-avatar candidate-${index}`}
//           >
//             {initials}
//           </div>

//           <div className="df-candidate-info">
//             <strong>{name}</strong>
//             <span>{role}</span>
//           </div>

//           <span className="df-candidate-score">{score}</span>
//         </div>
//       ))}

//       <button className="df-discover-button">
//         Discover candidates
//         <ArrowUpRight size={17} />
//       </button>
//     </div>
//   );
// }

// export default function Home() {
//   const [dark, setDark] = useState(false);

//   useEffect(() => {
//     const saved = localStorage.getItem("devflow-theme");

//     if (saved === "dark") {
//       setDark(true);
//       document.documentElement.classList.add("dark");
//     }
//   }, []);

//   function toggleTheme() {
//     const next = !dark;

//     setDark(next);

//     document.documentElement.classList.toggle(
//       "dark",
//       next
//     );

//     localStorage.setItem(
//       "devflow-theme",
//       next ? "dark" : "light"
//     );
//   }

//   return (
//     <main className="df-page">

//       {/* NAV */}
//       <header className="df-nav-wrap">
//         <nav className="df-nav">
//           <a href="#" className="df-logo">
//             <span className="df-logo-symbol">
//               <span />
//               <span />
//             </span>
//             DevFlow
//           </a>

//           <div className="df-nav-links">
//             <a href="#jobs">Find jobs</a>
//             <a href="#companies">Companies</a>
//             <a href="#developers">For developers</a>
//             <a href="#recruiters">For recruiters</a>
//           </div>

//           <div className="df-nav-actions">
//             <button
//               className="df-theme-toggle"
//               onClick={toggleTheme}
//               aria-label="Toggle theme"
//             >
//               {dark ? (
//                 <Sun size={16} />
//               ) : (
//                 <Moon size={16} />
//               )}
//             </button>

//             <button className="df-nav-login">
//               Sign in
//             </button>

//             <button className="df-nav-primary">
//               Join DevFlow
//               <ArrowUpRight size={16} />
//             </button>
//           </div>
//         </nav>
//       </header>

//       {/* HERO */}
//       <section className="df-hero">
//         <div className="df-container">

//           <div className="df-hero-layout">

//             <div className="df-hero-copy">
//               <div className="df-eyebrow">
//                 <span />
//                 THE DEVELOPER NETWORK
//               </div>

//               <h1>
//                 Find work
//                 <br />
//                 <em>worth building.</em>
//               </h1>

//               <p>
//                 DevFlow connects developers with companies
//                 building the products, platforms and technology
//                 shaping what comes next.
//               </p>

//               <div className="df-search">
//                 <div className="df-search-field">
//                   <Search size={19} />

//                   <input
//                     placeholder="Search jobs, skills or companies"
//                     aria-label="Search jobs"
//                   />
//                 </div>

//                 <div className="df-search-location">
//                   <MapPin size={17} />
//                   Anywhere
//                   <ChevronDown size={14} />
//                 </div>

//                 <button>
//                   Search
//                   <ArrowUpRight size={16} />
//                 </button>
//               </div>

//               <div className="df-hero-links">
//                 <span>Popular:</span>
//                 <a href="#">React</a>
//                 <a href="#">Node.js</a>
//                 <a href="#">Next.js</a>
//                 <a href="#">Remote</a>
//               </div>
//             </div>

//             <HeroProduct />

//           </div>

//           <div className="df-hero-bottom">
//             <span>DISCOVER</span>
//             <span>BUILD</span>
//             <span>APPLY</span>
//             <span>GROW</span>
//           </div>
//         </div>
//       </section>

//       {/* INTRO */}
//       <section className="df-intro">
//         <div className="df-container">

//           <div className="df-section-label">
//             <span>01</span>
//             THE DEVFLOW APPROACH
//           </div>

//           <div className="df-intro-content">
//             <h2>
//               A better way to move
//               <br />
//               through your career.
//             </h2>

//             <p>
//               Finding a job shouldn't mean sending your profile
//               into a black hole. DevFlow brings discovery,
//               identity, applications and opportunity into one
//               connected experience.
//             </p>
//           </div>

//           <div className="df-flow-line">

//             {[
//               ["01", "Discover", "Find opportunities that actually fit."],
//               ["02", "Build", "Show the work behind your experience."],
//               ["03", "Apply", "Keep every opportunity in view."],
//               ["04", "Grow", "Turn the next opportunity into momentum."],
//             ].map(([number, title, text], index) => (
//               <div
//                 className="df-flow-block"
//                 key={title}
//               >
//                 <div className="df-flow-item">
//                   <span>{number}</span>
//                   <strong>{title}</strong>
//                   <p>{text}</p>
//                 </div>

//                 {index < 3 && (
//                   <div className="df-flow-connector" />
//                 )}
//               </div>
//             ))}

//           </div>
//         </div>
//       </section>

//       {/* JOBS */}
//       <section className="df-section df-jobs-section" id="jobs">
//         <div className="df-container">

//           <div className="df-section-head">
//             <div>
//               <div className="df-section-label">
//                 <span>02</span>
//                 DISCOVER
//               </div>

//               <h2>
//                 Opportunities worth
//                 <br />
//                 your attention.
//               </h2>
//             </div>

//             <div>
//               <p>
//                 Curated roles from teams looking for people
//                 who care about what they build.
//               </p>

//               <a href="#" className="df-text-link">
//                 Explore all jobs
//                 <ArrowUpRight size={17} />
//               </a>
//             </div>
//           </div>

//           <div className="df-jobs-list">
//             {jobs.map((job, index) => (
//               <JobRow
//                 key={job.role}
//                 job={job}
//                 index={index}
//               />
//             ))}
//           </div>

//         </div>
//       </section>

//       {/* BUILD */}
//       <section
//         className="df-feature df-feature-profile"
//         id="developers"
//       >
//         <div className="df-container df-feature-grid">

//           <div className="df-feature-copy">
//             <div className="df-section-label">
//               <span>03</span>
//               BUILD
//             </div>

//             <h2>
//               Your resume tells people
//               <em> where you've been.</em>
//             </h2>

//             <p>
//               Your DevFlow profile shows where you're going.
//               Bring together your experience, skills, projects
//               and the work you're proud of in one place.
//             </p>

//             <a href="#" className="df-outline-link">
//               Build your profile
//               <ArrowUpRight size={17} />
//             </a>
//           </div>

//           <ProfilePreview />

//         </div>
//       </section>

//       {/* APPLY */}
//       <section className="df-feature df-feature-application">
//         <div className="df-container df-feature-grid reverse">

//           <ApplicationPreview />

//           <div className="df-feature-copy">
//             <div className="df-section-label">
//               <span>04</span>
//               APPLY
//             </div>

//             <h2>
//               Never wonder
//               <em> what's happening next.</em>
//             </h2>

//             <p>
//               Every application has a story. DevFlow keeps it
//               visible — from the moment you apply through review,
//               interviews and the final decision.
//             </p>

//             <a href="#" className="df-outline-link">
//               See how applications work
//               <ArrowUpRight size={17} />
//             </a>
//           </div>

//         </div>
//       </section>

//       {/* PHILOSOPHY */}
//       <section className="df-philosophy">
//         <div className="df-container">

//           <div className="df-section-label light">
//             <span>05</span>
//             WHY DEVFLOW
//           </div>

//           <div className="df-philosophy-title">
//             <h2>
//               Hiring is more than
//               <br />
//               matching <em>keywords.</em>
//             </h2>

//             <p>
//               Developers are more than a list of technologies.
//               Companies are more than a job description.
//               Better hiring starts when both sides get the
//               context they deserve.
//             </p>
//           </div>

//           <div className="df-principles">

//             {[
//               [
//                 "01",
//                 "More than keywords.",
//                 "See the person behind the stack — experience, work, interests and the problems they know how to solve.",
//               ],
//               [
//                 "02",
//                 "Context matters.",
//                 "Skills become meaningful when you understand how someone actually used them.",
//               ],
//               [
//                 "03",
//                 "Visibility matters.",
//                 "Candidates shouldn't disappear after clicking Apply. Every stage stays clear.",
//               ],
//               [
//                 "04",
//                 "Better discovery.",
//                 "Recruiters discover relevant talent instead of sorting through endless irrelevant applications.",
//               ],
//             ].map(([number, title, text]) => (
//               <div key={number}>
//                 <span>{number}</span>
//                 <h3>{title}</h3>
//                 <p>{text}</p>
//               </div>
//             ))}

//           </div>
//         </div>
//       </section>

//       {/* RECRUITERS */}
//       <section
//         className="df-feature df-recruiter-section"
//         id="recruiters"
//       >
//         <div className="df-container df-feature-grid">

//           <div className="df-feature-copy">
//             <div className="df-section-label">
//               <span>06</span>
//               FOR RECRUITERS
//             </div>

//             <h2>
//               Find people who can
//               <em> move the work forward.</em>
//             </h2>

//             <p>
//               Give recruiters a clearer picture of the people
//               behind the applications. Discover candidates
//               through experience, skills and real professional
//               context.
//             </p>

//             <a href="#" className="df-outline-link">
//               Explore recruiting
//               <ArrowUpRight size={17} />
//             </a>
//           </div>

//           <RecruiterPreview />

//         </div>
//       </section>

//       {/* COMPANIES */}
//       <section className="df-section df-companies" id="companies">
//         <div className="df-container">

//           <div className="df-section-head">
//             <div>
//               <div className="df-section-label">
//                 <span>07</span>
//                 THE TEAMS
//               </div>

//               <h2>
//                 Meet the companies
//                 <br />
//                 building what's next.
//               </h2>
//             </div>

//             <div>
//               <p>
//                 Explore teams by the work they do, the products
//                 they build and the people they are looking for.
//               </p>

//               <a href="#" className="df-text-link">
//                 Explore companies
//                 <ArrowUpRight size={17} />
//               </a>
//             </div>
//           </div>

//           <div className="df-company-grid">
//             {companies.map((company) => (
//               <article
//                 key={company.name}
//                 className="df-company-card"
//               >
//                 <div className="df-company-card-top">
//                   <CompanyMark letter={company.mark} />

//                   <span>
//                     {company.roles} open roles
//                     <ArrowUpRight size={15} />
//                   </span>
//                 </div>

//                 <div className="df-company-card-body">
//                   <span>{company.category}</span>
//                   <h3>{company.name}</h3>
//                   <p>{company.description}</p>
//                 </div>

//                 <div className="df-company-card-bottom">
//                   <span>View company</span>
//                   <ArrowUpRight size={18} />
//                 </div>
//               </article>
//             ))}
//           </div>

//         </div>
//       </section>

//       {/* NETWORK */}
//       <section className="df-signals">
//         <div className="df-container">

//           <div className="df-signals-heading">
//             <div className="df-section-label light">
//               <span>08</span>
//               THE NETWORK
//             </div>

//             <h2>
//               A growing network of
//               <br />
//               people building <em>great things.</em>
//             </h2>
//           </div>

//           <div className="df-signal-grid">
//             <div>
//               <strong>1,248</strong>
//               <span>Active opportunities</span>
//             </div>

//             <div>
//               <strong>684</strong>
//               <span>Hiring companies</span>
//             </div>

//             <div>
//               <strong>2,431</strong>
//               <span>Developer profiles</span>
//             </div>

//             <div>
//               <strong>4,812</strong>
//               <span>Applications moving forward</span>
//             </div>
//           </div>

//         </div>
//       </section>

//       {/* FINAL */}
//       <section className="df-final">
//         <div className="df-container">

//           <div className="df-final-label">
//             DEVFLOW
//           </div>

//           <h2>
//             Build your career
//             <br />
//             around work <em>worth doing.</em>
//           </h2>

//           <div className="df-final-bottom">
//             <p>
//               The next opportunity is somewhere ahead.
//               Let's make finding it feel less like searching
//               and more like moving forward.
//             </p>

//             <button>
//               Start exploring
//               <ArrowUpRight size={18} />
//             </button>
//           </div>

//         </div>
//       </section>

//       {/* FOOTER */}
//       <footer className="df-footer">
//         <div className="df-container">

//           <div className="df-footer-top">
//             <a href="#" className="df-logo">
//               <span className="df-logo-symbol">
//                 <span />
//                 <span />
//               </span>
//               DevFlow
//             </a>

//             <p>
//               The developer network for people
//               building what comes next.
//             </p>
//           </div>

//           <div className="df-footer-links">

//             <div>
//               <span>Explore</span>
//               <a href="#">Jobs</a>
//               <a href="#">Companies</a>
//               <a href="#">Developers</a>
//             </div>

//             <div>
//               <span>For teams</span>
//               <a href="#">Post a job</a>
//               <a href="#">Find talent</a>
//               <a href="#">Recruiting</a>
//             </div>

//             <div>
//               <span>DevFlow</span>
//               <a href="#">About</a>
//               <a href="#">How it works</a>
//               <a href="#">Contact</a>
//             </div>

//           </div>

//           <div className="df-footer-bottom">
//             <span>© 2026 DevFlow</span>

//             <div>
//               <a href="#">Privacy</a>
//               <a href="#">Terms</a>
//               <a href="#">GitHub</a>
//             </div>
//           </div>

//         </div>
//       </footer>

//     </main>
//   );
// }


import Hero from "@/components/landing/Hero";
import NetworkGraph from "@/components/landing/Network";
import JobFeed from "@/components/landing/JobFeed";
import DeveloperIdentity from "@/components/landing/DeveloperIdentity";
import ApplicationJourney from "@/components/landing/ApplicationJourney";
import DevFlowIndex from "@/components/landing/DevFlowIndex";
import RecruiterSection from "@/components/landing/RecruiterSection";
import Manifesto from "@/components/landing/Manifesto";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";
import HowItWorks from "@/components/landing/HowItWorks";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[var(--df-paper)]">

      <Hero />

      <HowItWorks />

      <NetworkGraph />

      <JobFeed />

      <DeveloperIdentity />

      <ApplicationJourney />
      

      <DevFlowIndex />

      <RecruiterSection />

      <Manifesto />

      <FinalCTA />

      <Footer />
    </main>
  );
}
