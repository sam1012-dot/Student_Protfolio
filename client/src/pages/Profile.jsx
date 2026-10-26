import { useEffect, useState } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import {
  User,
  Mail,
  MapPin,
  Phone,
  Link,
  Code2,
  Save,
} from "lucide-react";

import { auth, db } from "../services/firebase";

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    headline: "",
    bio: "",
    location: "",
    phone: "",
    github: "",
    linkedin: "",
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      setUser(currentUser);

      try {
        const profileRef = doc(db, "users", currentUser.uid);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          const data = profileSnap.data();

          setFormData({
            name: data.name || currentUser.displayName || "",
            headline: data.headline || "",
            bio: data.bio || "",
            location: data.location || "",
            phone: data.phone || "",
            github: data.github || "",
            linkedin: data.linkedin || "",
          });
        } else {
          setFormData((prev) => ({
            ...prev,
            name: currentUser.displayName || "",
          }));
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Please login first.");
      return;
    }

    try {
      setSaving(true);

      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          email: user.email,
          ...formData,
          updatedAt: serverTimestamp(),
        },
        {
          merge: true,
        }
      );

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="profile-page">

      <div className="profile-header">
        <div>
          <h1>My Profile</h1>
          <p>
            Manage your personal information and professional identity.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="profile-form">

        <div className="profile-card">

          <div className="profile-avatar">
            <User size={42} />
          </div>

          <div>
            <h2>{formData.name || "Your Name"}</h2>
            <p>{formData.headline || "Add your professional headline"}</p>
          </div>

        </div>

        <div className="form-grid">

          <div className="profile-field">
            <label>Full Name</label>

            <div className="profile-input">
              <User size={18} />

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
              />
            </div>
          </div>

          <div className="profile-field">
            <label>Email</label>

            <div className="profile-input disabled">
              <Mail size={18} />

              <input
                type="email"
                value={user?.email || ""}
                disabled
              />
            </div>
          </div>

          <div className="profile-field">
            <label>Professional Headline</label>

            <input
              type="text"
              name="headline"
              value={formData.headline}
              onChange={handleChange}
              placeholder="e.g. Computer Science Student & Developer"
            />
          </div>

          <div className="profile-field">
            <label>Phone</label>

            <div className="profile-input">
              <Phone size={18} />

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
              />
            </div>
          </div>

          <div className="profile-field">
            <label>Location</label>

            <div className="profile-input">
              <MapPin size={18} />

              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="City, State, Country"
              />
            </div>
          </div>

          <div className="profile-field">
            <label>GitHub</label>

            <div className="profile-input">
              <Code2 size={18} />

              <input
                type="url"
                name="github"
                value={formData.github}
                onChange={handleChange}
                placeholder="https://github.com/username"
              />
            </div>
          </div>

          <div className="profile-field">
            <label>LinkedIn</label> 

            <div className="profile-input">
              <Link size={18} />

              <input
                type="url"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/username"
              />
            </div>
          </div>

        </div>

        <div className="profile-field bio-field">
          <label>About Me</label>

          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell visitors about yourself, your interests, goals and experience..."
            rows="6"
          />
        </div>

        <div className="profile-actions">

          <button
            type="submit"
            className="save-profile-btn"
            disabled={saving}
          >
            <Save size={18} />

            {saving ? "Saving..." : "Save Profile"}
          </button>

        </div>

      </form>

    </div>
  );
}

export default Profile;