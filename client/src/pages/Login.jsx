import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Mail, ShieldCheck } from "lucide-react";
import { useState } from "react";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Backend authentication will be connected later.
    navigate("/dashboard");
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
            <h1>Welcome back</h1>
            <p>
              Sign in to continue building your student portfolio.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">

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

            <div className="form-group">

              <div className="label-row">
                <label>Password</label>

                <a href="#forgot">
                  Forgot password?
                </a>
              </div>

              <div className="input-wrapper">
                <Lock size={18} />

                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>

            <button type="submit" className="auth-submit">
              Sign In
            </button>

          </form>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <p className="auth-switch">
            Don't have an account?
            <Link to="/register"> Create one</Link>
          </p>

        </div>

        <p className="auth-footer">
          Your data is protected with secure authentication.
        </p>

      </div>
    </div>
  );
}

export default Login;