import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import {
  FileText,
  Download,
  User,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
} from "lucide-react";

import { auth, db } from "../services/firebase";
import "../styles/resume.css";

function Resume() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({});
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [education, setEducation] = useState([]);
  const [experience, setExperience] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        setUser(currentUser);

        if (currentUser) {
          await loadResumeData(currentUser.uid);
        }

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const loadResumeData = async (uid) => {
    try {
      const profileSnap = await getDoc(
        doc(db, "users", uid, "profile", "data")
      );

      if (profileSnap.exists()) {
        setProfile(profileSnap.data());
      }

      const loadCollection = async (name) => {
        const snapshot = await getDocs(
          collection(db, "users", uid, name)
        );

        return snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));
      };

      setProjects(await loadCollection("projects"));
      setSkills(await loadCollection("skills"));
      setEducation(await loadCollection("education"));
      setExperience(await loadCollection("experience"));

    } catch (error) {
      console.error("Resume loading error:", error);
    }
  };

  const printResume = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="resume-loading">
        Loading resume...
      </div>
    );
  }

  return (
    <div className="resume-page">

      {/* Header */}

      <div className="resume-page-header">

        <div>
          <h1>Resume</h1>
          <p>
            Generate a professional resume
            from your portfolio.
          </p>
        </div>

        <button
          className="resume-download-btn"
          onClick={printResume}
        >
          <Download size={18} />
          Download / Print
        </button>

      </div>

      {/* Resume */}

      <div className="resume-paper">

        {/* Personal Information */}

        <header className="resume-profile">

          <div className="resume-avatar">
            {profile.name
              ? profile.name.charAt(0).toUpperCase()
              : <User size={32} />}
          </div>

          <div className="resume-profile-info">

            <h2>
              {profile.name ||
                user?.displayName ||
                "Your Name"}
            </h2>

            <p className="resume-role">
              {profile.title ||
                "Computer Science Student"}
            </p>

            <div className="resume-contact">

              {profile.email && (
                <span>
                  <Mail size={14} />
                  {profile.email}
                </span>
              )}

              {profile.phone && (
                <span>
                  <Phone size={14} />
                  {profile.phone}
                </span>
              )}

              {profile.location && (
                <span>
                  <MapPin size={14} />
                  {profile.location}
                </span>
              )}

            </div>

            <div className="resume-links">

              {profile.github && (
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="resume-social-icon">
                        GH
                    </span>
                        GitHub
                    <ExternalLink size={11} />
                </a>
              )}

              {profile.linkedin && (
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noreferrer"
                >
                    <span className="resume-social-icon">
                        in
                    </span>
                        LinkedIn
                    <ExternalLink size={11} />
                </a>
              )}

            </div>

          </div>

        </header>

        {/* About */}

        {profile.bio && (
          <section className="resume-section">

            <h3>PROFILE</h3>

            <p className="resume-text">
              {profile.bio}
            </p>

          </section>
        )}

        {/* Skills */}

        {skills.length > 0 && (
          <section className="resume-section">

            <h3>SKILLS</h3>

            <div className="resume-skills">

              {skills.map((skill) => (
                <span key={skill.id}>
                  {skill.name}
                </span>
              ))}

            </div>

          </section>
        )}

        {/* Experience */}

        {experience.length > 0 && (
          <section className="resume-section">

            <h3>EXPERIENCE</h3>

            {experience.map((item) => (
              <div
                className="resume-item"
                key={item.id}
              >

                <div className="resume-item-heading">

                  <div>
                    <h4>
                      {item.position ||
                        item.title ||
                        "Position"}
                    </h4>

                    <p>
                      {item.company ||
                        "Company"}
                    </p>
                  </div>

                  <span>
                    {item.duration ||
                      item.startDate ||
                      ""}
                  </span>

                </div>

                {item.description && (
                  <p>
                    {item.description}
                  </p>
                )}

              </div>
            ))}

          </section>
        )}

        {/* Projects */}

        {projects.length > 0 && (
          <section className="resume-section">

            <h3>PROJECTS</h3>

            {projects.map((project) => (
              <div
                className="resume-item"
                key={project.id}
              >

                <div className="resume-item-heading">

                  <div>
                    <h4>
                      {project.title ||
                        project.name ||
                        "Project"}
                    </h4>
                  </div>

                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noreferrer"
                    >
                      GitHub
                    </a>
                  )}

                </div>

                {project.description && (
                  <p>
                    {project.description}
                  </p>
                )}

                {project.technologies && (
                  <small>
                    {Array.isArray(
                      project.technologies
                    )
                      ? project.technologies.join(
                          " • "
                        )
                      : project.technologies}
                  </small>
                )}

              </div>
            ))}

          </section>
        )}

        {/* Education */}

        {education.length > 0 && (
          <section className="resume-section">

            <h3>EDUCATION</h3>

            {education.map((item) => (
              <div
                className="resume-item"
                key={item.id}
              >

                <div className="resume-item-heading">

                  <div>
                    <h4>
                      {item.degree ||
                        item.course ||
                        "Degree"}
                    </h4>

                    <p>
                      {item.institution ||
                        item.school ||
                        ""}
                    </p>
                  </div>

                  <span>
                    {item.year ||
                      item.duration ||
                      ""}
                  </span>

                </div>

                {item.description && (
                  <p>
                    {item.description}
                  </p>
                )}

              </div>
            ))}

          </section>
        )}

      </div>

    </div>
  );
}

export default Resume;