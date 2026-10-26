import { useEffect, useState } from "react";

import {
  Award,
  Bell,
  BookOpen,
  Code2,
  ExternalLink,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Plus,
  Settings,
  Sparkles,
  Trophy,
  User,
} from "lucide-react";

import { Link } from "react-router-dom";

import { onAuthStateChanged, signOut } from "firebase/auth";

import {
  collection,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";

import { auth, db } from "../services/firebase";


function getReadableValue(value, fallback = "") {
  if (Array.isArray(value)) {
    return value.filter(Boolean).join(", ") || fallback;
  }

  if (typeof value === "string") {
    return value.trim() || fallback;
  }

  if (value !== undefined && value !== null) {
    return String(value);
  }

  return fallback;
}


function getRecordTime(record, fallbackTime) {
  const value =
    record.updatedAt ||
    record.createdAt ||
    record.date ||
    fallbackTime;

  if (value && typeof value.toMillis === "function") {
    return value.toMillis();
  }

  if (value?.seconds) {
    return value.seconds * 1000;
  }

  const time = value ? new Date(value).getTime() : 0;

  return Number.isNaN(time) ? 0 : time;
}


function getInitials(name) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "ST"
  );
}


function Dashboard() {
  const [student, setStudent] = useState({
    name: "Student",
    course: "Student",
    initials: "ST",
  });

  const [stats, setStats] = useState({
    projects: 0,
    certificates: 0,
    achievements: 0,
    skills: 0,
  });

  const [profileCompletion, setProfileCompletion] = useState(0);

  const [skills, setSkills] = useState([]);

  const [recentProjects, setRecentProjects] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // LOAD ACTUAL STUDENT DATA FROM FIREBASE

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        if (isMounted) {
          setStudent({
            name: "Student",
            course: "Student",
            initials: "ST",
          });

          setStats({
            projects: 0,
            certificates: 0,
            achievements: 0,
            skills: 0,
          });

          setSkills([]);
          setRecentProjects([]);
          setProfileCompletion(0);
          setLoading(false);
        }

        return;
      }

      try {
        if (isMounted) {
          setLoading(true);
          setError("");
        }

        const uid = user.uid;

        // STUDENT PROFILE DOCUMENT

        const profileRef = doc(
          db,
          "users",
          uid,
          "profile",
          "data"
        );

        // GET STUDENT COLLECTIONS

        const [
          profileSnapshot,
          projectsSnapshot,
          certificatesSnapshot,
          achievementsSnapshot,
          skillsSnapshot,
          educationSnapshot,
          experienceSnapshot,
        ] = await Promise.all([
          getDoc(profileRef),

          getDocs(
            collection(db, "users", uid, "projects")
          ),

          getDocs(
            collection(db, "users", uid, "certificates")
          ),

          getDocs(
            collection(db, "users", uid, "achievements")
          ),

          getDocs(
            collection(db, "users", uid, "skills")
          ),

          getDocs(
            collection(db, "users", uid, "education")
          ),

          getDocs(
            collection(db, "users", uid, "experience")
          ),
        ]);

        if (!isMounted) return;


        // STUDENT PROFILE DETAILS

        const profileData = profileSnapshot.exists()
          ? profileSnapshot.data()
          : {};

        const fullName = getReadableValue(
          profileData.fullName ||
            profileData.name ||
            [
              profileData.firstName,
              profileData.lastName,
            ]
              .filter(Boolean)
              .join(" ") ||
            user.displayName ||
            user.email?.split("@")[0],
          "Student"
        );

        const course = getReadableValue(
          profileData.course ||
            profileData.department ||
            profileData.branch ||
            profileData.program,
          "Student"
        );

        setStudent({
          name: fullName,
          course: course,
          initials: getInitials(fullName),
        });


        // ACTUAL PORTFOLIO COUNTS

        setStats({
          projects: projectsSnapshot.size,
          certificates: certificatesSnapshot.size,
          achievements: achievementsSnapshot.size,
          skills: skillsSnapshot.size,
        });


        // ACTUAL STUDENT SKILLS

        const skillRecords = skillsSnapshot.docs
          .map((item) => {
            const data = item.data();

            return getReadableValue(
              data.name || data.skillName || data.title,
              item.id
            );
          })
          .filter(Boolean);

        setSkills(skillRecords);


        // ACTUAL STUDENT PROJECTS

        const projectRecords = projectsSnapshot.docs
          .map((item) => {
            const data = item.data();

            return {
              id: item.id,

              title: getReadableValue(
                data.title ||
                  data.projectName ||
                  data.name,
                "Untitled Project"
              ),

              description: getReadableValue(
                data.description ||
                  data.technologies ||
                  data.techStack ||
                  data.technology,
                "No description added"
              ),

              status: getReadableValue(
                data.status,
                "Added"
              ),

              sortDate: getRecordTime(
                data,
                item.createTime
              ),
            };
          })
          .sort((a, b) => b.sortDate - a.sortDate)
          .slice(0, 3);

        setRecentProjects(projectRecords);


        // PROFILE COMPLETION

        const profileFields = [
          profileData.fullName ||
            profileData.name ||
            profileData.firstName ||
            user.displayName,

          profileData.email || user.email,

          profileData.phone ||
            profileData.phoneNumber,

          profileData.bio ||
            profileData.about ||
            profileData.summary,

          profileData.location ||
            profileData.city ||
            profileData.address,

          profileData.profileImage ||
            profileData.photoURL ||
            user.photoURL,
        ];

        const portfolioSections = [
          projectsSnapshot.size > 0,
          skillsSnapshot.size > 0,
          certificatesSnapshot.size > 0,
          achievementsSnapshot.size > 0,
          educationSnapshot.size > 0,
          experienceSnapshot.size > 0,
        ];

        const completedFields = [
          ...profileFields.map(Boolean),
          ...portfolioSections,
        ].filter(Boolean).length;

        const totalFields =
          profileFields.length + portfolioSections.length;

        const percentage = Math.round(
          (completedFields / totalFields) * 100
        );

        setProfileCompletion(percentage);

      } catch (err) {
        console.error("Dashboard data error:", err);

        if (isMounted) {
          setError(
            "Unable to load dashboard data. Please check your Firebase connection."
          );
        }

      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);


  // LOGOUT

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout error:", err);
      setError("Unable to logout. Please try again.");
    }
  };


  return (
    <div className="dashboard-page">

      {/* SIDEBAR */}

      <aside className="dashboard-sidebar">

        <div className="dashboard-logo">

          <div className="dashboard-logo-icon">
            <GraduationCap size={21} />
          </div>

          <span>Portfolia</span>

        </div>


        <nav className="dashboard-nav">

          <div className="dashboard-nav-title">
            Workspace
          </div>

          <Link
            to="/dashboard"
            className="dashboard-nav-item active"
          >
            <LayoutDashboard size={18} />
            Dashboard
          </Link>

          <Link
            to="/profile"
            className="dashboard-nav-item"
          >
            <User size={18} />
            My Profile
          </Link>

          <Link
            to="/projects"
            className="dashboard-nav-item"
          >
            <Code2 size={18} />
            Projects
          </Link>

          <Link
            to="/skills"
            className="dashboard-nav-item"
          >
            <Sparkles size={18} />
            Skills
          </Link>

          <Link
            to="/certificates"
            className="dashboard-nav-item"
          >
            <Award size={18} />
            Certificates
          </Link>

          <Link
            to="/achievements"
            className="dashboard-nav-item"
          >
            <Trophy size={18} />
            Achievements
          </Link>

          <Link
            to="/education"
            className="dashboard-nav-item"
          >
            <BookOpen size={18} />
            Education
          </Link>


          <div
            className="dashboard-nav-title"
            style={{ marginTop: "28px" }}
          >
            Portfolio
          </div>

          <Link
            to="/resume"
            className="dashboard-nav-item"
          >
            <FileText size={18} />
            Resume
          </Link>

          <Link
            to="/settings"
            className="dashboard-nav-item"
          >
            <Settings size={18} />
            Settings
          </Link>

        </nav>


        <div className="dashboard-sidebar-bottom">

          <button
            className="dashboard-nav-item"
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
            }}
            onClick={handleLogout}
          >
            <LogOut size={18} />
            Logout
          </button>

        </div>

      </aside>


      {/* MAIN CONTENT */}

      <main className="dashboard-main">

        {/* TOPBAR */}

        <header className="dashboard-topbar">

          <div className="dashboard-topbar-left">

            <h2>Dashboard</h2>

            <p>
              Manage and grow your student portfolio
            </p>

          </div>


          <div className="dashboard-topbar-right">

            <button className="dashboard-notification">
              <Bell size={18} />

              <span className="dashboard-notification-dot"></span>
            </button>


            <div className="dashboard-user">

              <div className="dashboard-user-avatar">
                {student.initials}
              </div>

              <div className="dashboard-user-info">

                <strong>{student.name}</strong>

                <span>{student.course}</span>

              </div>

            </div>

          </div>

        </header>


        {/* CONTENT */}

        <div className="dashboard-content">

          {error && (
            <div className="dashboard-error">
              {error}
            </div>
          )}


          {/* WELCOME */}

          <section className="dashboard-welcome">

            <div className="dashboard-welcome-content">

              <div className="dashboard-welcome-label">

                <Sparkles size={15} />

                Your portfolio journey

              </div>


              <h1>
                Welcome back, {student.name}! 👋
              </h1>


              <p>
                Keep building your digital identity. Add your latest
                projects, skills and achievements to make your portfolio
                stronger.
              </p>


              <Link
                to="/profile"
                className="dashboard-profile-button"
              >
                Complete Profile

                <ExternalLink size={15} />
              </Link>

            </div>

          </section>


          {/* STATISTICS */}

          <div className="dashboard-section-title">

            <h3>Portfolio Overview</h3>

            <span>
              {loading
                ? "Loading..."
                : "Your actual portfolio data"}
            </span>

          </div>


          {/* CLICKABLE STATISTICS CARDS */}

          <section className="dashboard-stats">

            <StatCard
              icon={<Code2 size={19} />}
              value={
                loading
                  ? "..."
                  : String(stats.projects).padStart(2, "0")
              }
              title="Projects"
              change="Total"
              to="/projects"
            />

            <StatCard
              icon={<Award size={19} />}
              value={
                loading
                  ? "..."
                  : String(stats.certificates).padStart(2, "0")
              }
              title="Certificates"
              change="Total"
              to="/certificates"
            />

            <StatCard
              icon={<Trophy size={19} />}
              value={
                loading
                  ? "..."
                  : String(stats.achievements).padStart(2, "0")
              }
              title="Achievements"
              change="Total"
              to="/achievements"
            />

            <StatCard
              icon={<Sparkles size={19} />}
              value={
                loading
                  ? "..."
                  : String(stats.skills).padStart(2, "0")
              }
              title="Skills"
              change="Total"
              to="/skills"
            />

          </section>


          {/* MAIN GRID */}

          <section className="dashboard-grid">

            {/* PROFILE PROGRESS */}

            <div className="dashboard-card">

              <div className="dashboard-card-header">

                <h3>Profile Completion</h3>

                <Link to="/profile">
                  Complete Profile
                </Link>

              </div>


              <div className="profile-progress">

                <div className="profile-progress-header">

                  <span>
                    Portfolio strength
                  </span>

                  <strong>
                    {loading
                      ? "..."
                      : `${profileCompletion}%`}
                  </strong>

                </div>


                <div className="profile-progress-bar">

                  <div
                    className="profile-progress-fill"
                    style={{
                      width: `${profileCompletion}%`,
                    }}
                  ></div>

                </div>


                <p className="profile-progress-text">
                  {loading
                    ? "Calculating your portfolio completion..."
                    : profileCompletion === 100
                    ? "Great! Your portfolio sections are filled in."
                    : "Add missing profile details and portfolio information to improve your completion."}
                </p>

              </div>

            </div>


            {/* SKILLS */}

            <div className="dashboard-card">

              <div className="dashboard-card-header">

                <h3>Top Skills</h3>

                <Link to="/skills">
                  Manage
                </Link>

              </div>


              <div className="skill-list">

                {loading ? (
                  <span>Loading skills...</span>
                ) : skills.length > 0 ? (
                  skills.slice(0, 8).map((skill, index) => (
                    <span
                      className="skill-tag"
                      key={`${skill}-${index}`}
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span>No skills added yet.</span>
                )}

              </div>

            </div>

          </section>


          {/* RECENT PROJECTS */}

          <section className="dashboard-grid">

            <div className="dashboard-card">

              <div className="dashboard-card-header">

                <h3>Recent Projects</h3>

                <Link to="/projects">
                  View all
                </Link>

              </div>


              <div className="project-list">

                {loading ? (
                  <p>Loading projects...</p>
                ) : recentProjects.length > 0 ? (
                  recentProjects.map((project) => (
                    <ProjectItem
                      key={project.id}
                      icon={<Code2 size={18} />}
                      title={project.title}
                      description={project.description}
                      status={project.status}
                    />
                  ))
                ) : (
                  <p>No projects added yet.</p>
                )}

              </div>

            </div>


            {/* QUICK ACTIONS */}

            <div className="dashboard-card">

              <div className="dashboard-card-header">

                <h3>Quick Actions</h3>

              </div>


              <div className="quick-actions">

                <QuickAction
                  icon={<Plus size={18} />}
                  title="Add Project"
                  to="/projects"
                />

                <QuickAction
                  icon={<Award size={18} />}
                  title="Add Certificate"
                  to="/certificates"
                />

                <QuickAction
                  icon={<Trophy size={18} />}
                  title="Add Achievement"
                  to="/achievements"
                />

              </div>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}


/* STAT CARD - CLICKABLE */

function StatCard({
  icon,
  value,
  title,
  change,
  to,
}) {
  return (
    <Link
      to={to}
      className="dashboard-stat-card"
      aria-label={`Open ${title} page`}
      style={{
        textDecoration: "none",
        color: "inherit",
        cursor: "pointer",
        display: "block",
      }}
    >

      <div className="dashboard-stat-top">

        <div className="dashboard-stat-icon">
          {icon}
        </div>

        <span className="dashboard-stat-change">
          {change}
        </span>

      </div>

      <h4>{value}</h4>

      <p>{title}</p>

    </Link>
  );
}


/* PROJECT ITEM */

function ProjectItem({
  icon,
  title,
  description,
  status,
}) {
  return (
    <div className="project-item">

      <div className="project-icon">
        {icon}
      </div>

      <div className="project-info">

        <h4>{title}</h4>

        <p>{description}</p>

      </div>

      <span className="project-status">
        {status}
      </span>

    </div>
  );
}


/* QUICK ACTION */

function QuickAction({
  icon,
  title,
  to,
}) {
  return (
    <Link
      to={to}
      className="quick-action"
    >

      {icon}

      <span>{title}</span>

    </Link>
  );
}


export default Dashboard;