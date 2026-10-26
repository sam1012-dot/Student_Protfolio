import { Link } from "react-router-dom";
import {
  ArrowRight,
  Award,
  BookOpen,
  BriefcaseBusiness,
  Code2,
  ExternalLink,
  GraduationCap,
  Sparkles,
  Trophy,
} from "lucide-react";

import Navbar from "../components/Navbar";

function Home() {
  return (
    <div className="home-page">

      <Navbar />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">

          <div className="hero-content">

            <div className="hero-badge">
              <Sparkles size={16} />
              <span>Build. Showcase. Grow.</span>
            </div>

            <h1>
              Your journey.
              <br />
              <span>Your portfolio.</span>
              <br />
              Your future.
            </h1>

            <p>
              Create a professional digital portfolio that showcases your
              projects, skills, certificates, achievements and academic
              journey — all in one place.
            </p>

            <div className="hero-buttons">

              <Link to="/register" className="primary-button">
                Create Portfolio
                <ArrowRight size={19} />
              </Link>

              <a href="#features" className="secondary-button">
                Explore Features
              </a>

            </div>

            <div className="hero-trust">
              <div className="trust-avatars">
                <span>AR</span>
                <span>SK</span>
                <span>PK</span>
                <span>+</span>
              </div>

              <p>
                Designed for students building their future
              </p>
            </div>

          </div>

          {/* Dashboard Preview */}
          <div className="hero-preview">

            <div className="preview-window">

              <div className="preview-header">
                <div className="window-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>

                <div className="preview-title">
                  Student Dashboard
                </div>
              </div>

              <div className="preview-body">

                <div className="preview-profile">

                  <div className="preview-avatar">
                    AR
                  </div>

                  <div>
                    <h3>Student Portfolio</h3>
                    <p>Computer Science Student</p>
                  </div>

                </div>

                <div className="preview-stats">

                  <div className="preview-stat">
                    <Code2 size={18} />
                    <strong>12</strong>
                    <span>Projects</span>
                  </div>

                  <div className="preview-stat">
                    <Award size={18} />
                    <strong>08</strong>
                    <span>Certificates</span>
                  </div>

                  <div className="preview-stat">
                    <Trophy size={18} />
                    <strong>15</strong>
                    <span>Achievements</span>
                  </div>

                </div>

                <div className="preview-progress">

                  <div className="progress-heading">
                    <span>Portfolio Progress</span>
                    <strong>82%</strong>
                  </div>

                  <div className="progress-bar">
                    <div></div>
                  </div>

                </div>

                <div className="preview-cards">

                  <div>
                    <BriefcaseBusiness size={19} />
                    <span>Experience</span>
                  </div>

                  <div>
                    <BookOpen size={19} />
                    <span>Education</span>
                  </div>

                  <div>
                    <GraduationCap size={19} />
                    <span>Skills</span>
                  </div>

                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Features */}
      <section className="features-section" id="features">

        <div className="section-heading">

          <div className="section-badge">
            <Sparkles size={15} />
            Everything in one place
          </div>

          <h2>
            Build a portfolio that
            <span> tells your story.</span>
          </h2>

          <p>
            Organize every important part of your student journey and
            present it professionally.
          </p>

        </div>

        <div className="features-grid">

          <FeatureCard
            icon={<Code2 />}
            title="Projects"
            description="Showcase your projects with descriptions, technologies, images, GitHub links and live demos."
          />

          <FeatureCard
            icon={<Award />}
            title="Certificates"
            description="Keep your certifications organized and easily accessible from your portfolio."
          />

          <FeatureCard
            icon={<Trophy />}
            title="Achievements"
            description="Create a timeline of competitions, awards, events and academic achievements."
          />

          <FeatureCard
            icon={<GraduationCap />}
            title="Education"
            description="Present your academic background, courses, institutions and learning journey."
          />

          <FeatureCard
            icon={<BriefcaseBusiness />}
            title="Experience"
            description="Show internships, freelance work, volunteering and professional experience."
          />

          <FeatureCard
            icon={<ExternalLink />}
            title="Public Portfolio"
            description="Share your portfolio with recruiters, professors, companies and classmates."
          />

        </div>
      </section>

      {/* About */}
      <section className="about-section" id="about">

        <div className="about-container">

          <div className="about-content">

            <div className="section-badge">
              <Sparkles size={15} />
              Why Student Portfolio?
            </div>

            <h2>
              Don't just list your
              <span> achievements.</span>
              <br />
              Show your growth.
            </h2>

            <p>
              A student's journey is more than marks and certificates.
              Your projects, skills, experiences, failures, achievements
              and learning progress tell your complete story.
            </p>

            <p>
              This platform brings everything together into one professional
              digital identity that grows with you throughout your academic
              journey.
            </p>

            <Link to="/register" className="primary-button">
              Start Building
              <ArrowRight size={18} />
            </Link>

          </div>

          <div className="about-card">

            <div className="about-card-icon">
              <Sparkles size={25} />
            </div>

            <h3>Your digital identity</h3>

            <p>
              One profile. Multiple achievements. A complete story.
            </p>

            <div className="growth-line">

              <div className="growth-item">
                <span>01</span>
                <p>Learn</p>
              </div>

              <div className="growth-line-track"></div>

              <div className="growth-item">
                <span>02</span>
                <p>Build</p>
              </div>

              <div className="growth-line-track"></div>

              <div className="growth-item">
                <span>03</span>
                <p>Showcase</p>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* CTA */}
      <section className="cta-section">

        <div className="cta-container">

          <Sparkles size={28} />

          <h2>
            Ready to build your
            <span> digital portfolio?</span>
          </h2>

          <p>
            Start documenting your journey today.
          </p>

          <Link to="/register" className="primary-button">
            Create My Portfolio
            <ArrowRight size={18} />
          </Link>

        </div>

      </section>

      <footer className="footer">

        <div>
          <strong>Portfolia</strong>
          <p>Showcase your journey. Build your future.</p>
        </div>

        <p>
          © 2026 Student Portfolio Management System
        </p>

      </footer>

    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="feature-card">

      <div className="feature-icon">
        {icon}
      </div>

      <h3>{title}</h3>

      <p>{description}</p>

      <ArrowRight className="feature-arrow" size={18} />

    </div>
  );
}

export default Home;