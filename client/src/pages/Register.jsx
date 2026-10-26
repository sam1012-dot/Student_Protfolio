import { Link, useNavigate } from "react-router-dom";
import {
  Lock,
  Mail,
  User,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import { useState } from "react";

import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

import { auth, db } from "../services/firebase";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      // 1. Create Firebase Authentication account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;

      // 2. Store user's name in Firebase Authentication
      await updateProfile(user, {
        displayName: formData.name,
      });

      // 3. Create user's Firestore document
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: formData.name,
        email: user.email,
        headline: "",
        bio: "",
        profileImage: "",
        location: "",
        github: "",
        linkedin: "",
        phone: "",
        skills: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log("User successfully created:", user.uid);

      // 4. Go to dashboard
      navigate("/dashboard");

    } catch (error) {
      console.error("Registration error:", error);

      if (error.code === "auth/email-already-in-use") {
        setError("This email is already registered.");
      } else if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (error.code === "auth/weak-password") {
        setError("Password is too weak. Use at least 6 characters.");
      } else if (error.code === "permission-denied") {
        setError("Firebase permission denied. Check Firestore security rules.");
      } else {
        setError(error.message || "Registration failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <Link to="/" className="auth-back">
        <ArrowLeft size={18} />
        Back to home
      </Link>

      <div className="auth-container">

        <div className="auth-brand">
          <div className="auth-brand-icon">
            <ShieldCheck size={25} />
          </div>
          <span>Portfolia</span>
        </div>

        <div className="auth-card">

          <div className="auth-heading">
            <h1>Create your account</h1>
            <p>
              Start building your professional student portfolio.
            </p>
          </div>

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">

            {/* NAME */}

            <div className="form-group">
              <label>Full name</label>

              <div className="input-wrapper">
                <User size={18} />

                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* EMAIL */}

            <div className="form-group">
              <label>Email address</label>

              <div className="input-wrapper">
                <Mail size={18} />

                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* PASSWORD */}

            <div className="form-group">
              <label>Password</label>

              <div className="input-wrapper">
                <Lock size={18} />

                <input
                  type="password"
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  minLength="6"
                  required
                />
              </div>
            </div>

            {/* CONFIRM PASSWORD */}

            <div className="form-group">
              <label>Confirm password</label>

              <div className="input-wrapper">
                <Lock size={18} />

                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  minLength="6"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>

          </form>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <p className="auth-switch">
            Already have an account?
            <Link to="/login"> Sign in</Link>
          </p>

        </div>

        <p className="auth-footer">
          Your data is protected with secure authentication.
        </p>

      </div>
    </div>
  );
}

export default Register;