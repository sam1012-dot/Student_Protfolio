import { Link } from "react-router-dom";
import { GraduationCap, Menu, X } from "lucide-react";
import { useState } from "react";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="nav-container">

        <Link to="/" className="logo">
          <div className="logo-icon">
            <GraduationCap size={22} />
          </div>

          <span>Portfolia</span>
        </Link>

        <div className={`nav-links ${menuOpen ? "active" : ""}`}>
          <Link to="/" onClick={() => setMenuOpen(false)}>
            Home
          </Link>

          <a href="#features" onClick={() => setMenuOpen(false)}>
            Features
          </a>

          <a href="#about" onClick={() => setMenuOpen(false)}>
            About
          </a>

          <Link to="/login" onClick={() => setMenuOpen(false)}>
            Login
          </Link>

          <Link
            to="/register"
            className="nav-register"
            onClick={() => setMenuOpen(false)}
          >
            Get Started
          </Link>
        </div>

        <button
          className="mobile-menu"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={25} /> : <Menu size={25} />}
        </button>

      </div>
    </nav>
  );
}

export default Navbar;