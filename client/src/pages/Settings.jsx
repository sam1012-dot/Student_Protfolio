import { useEffect, useState } from "react";
import {
  updatePassword,
  signOut,
  deleteUser,
  onAuthStateChanged,
} from "firebase/auth";

import {
  LogOut,
  Lock,
  Trash2,
  Settings as SettingsIcon,
} from "lucide-react";

import { auth } from "../services/firebase";
import "../styles/settings.css";

function Settings() {
  const [user, setUser] = useState(null);

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        (currentUser) => {
          setUser(currentUser);
        }
      );

    return () => unsubscribe();
  }, []);

  const changePassword = async () => {
    if (!user) return;

    if (password.length < 6) {
      alert(
        "Password must contain at least 6 characters."
      );
      return;
    }

    try {
      setLoading(true);

      await updatePassword(
        user,
        password
      );

      setPassword("");

      alert(
        "Password updated successfully."
      );
    } catch (error) {
      console.error(error);

      alert(
        error.message ||
          "Unable to update password."
      );
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);

      window.location.href = "/login";
    } catch (error) {
      console.error(error);
    }
  };

  const deleteAccount = async () => {
    if (!user) return;

    const confirmed = window.confirm(
      "Are you sure you want to permanently delete your account?"
    );

    if (!confirmed) return;

    try {
      await deleteUser(user);

      alert(
        "Your account has been deleted."
      );

      window.location.href = "/register";
    } catch (error) {
      console.error(error);

      alert(
        "For security reasons, please login again before deleting your account."
      );
    }
  };

  return (
    <div className="settings-page">

      <div className="settings-header">

        <div className="settings-title-icon">
          <SettingsIcon size={25} />
        </div>

        <div>
          <h1>Settings</h1>

          <p>
            Manage your account and
            security preferences.
          </p>
        </div>

      </div>

      {/* Account */}

      <section className="settings-card">

        <h2>Account</h2>

        <div className="settings-user">

          <div className="settings-avatar">
            {user?.email
              ?.charAt(0)
              .toUpperCase() || "U"}
          </div>

          <div>
            <strong>
              {user?.displayName ||
                "Student"}
            </strong>

            <span>
              {user?.email}
            </span>
          </div>

        </div>

      </section>

      {/* Security */}

      <section className="settings-card">

        <div className="settings-section-heading">

          <div className="settings-icon">
            <Lock size={19} />
          </div>

          <div>
            <h2>Security</h2>

            <p>
              Change your account password.
            </p>
          </div>

        </div>

        <div className="settings-password">

          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          <button
            onClick={changePassword}
            disabled={loading}
          >
            {loading
              ? "Updating..."
              : "Update Password"}
          </button>

        </div>

      </section>

      {/* Session */}

      <section className="settings-card">

        <h2>Session</h2>

        <p className="settings-description">
          Sign out of your account on
          this device.
        </p>

        <button
          className="logout-btn"
          onClick={logout}
        >
          <LogOut size={17} />
          Logout
        </button>

      </section>

      {/* Danger */}

      <section className="settings-card danger-card">

        <div>

          <div className="danger-title">
            <Trash2 size={19} />

            <h2>
              Delete Account
            </h2>
          </div>

          <p>
            Permanently delete your
            account and associated data.
          </p>

        </div>

        <button
          className="delete-account-btn"
          onClick={deleteAccount}
        >
          Delete Account
        </button>

      </section>

    </div>
  );
}

export default Settings;