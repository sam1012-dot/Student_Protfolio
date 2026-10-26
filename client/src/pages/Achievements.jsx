import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "../services/firebase";
import {
  Trophy,
  Plus,
  Trash2,
  CalendarDays,
  Award,
} from "lucide-react";

import "../styles/achievements.css";

function Achievements() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  const [achievements, setAchievements] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    category: "Academic",
    issuer: "",
    date: "",
    description: "",
  });

  // Check the logged-in student
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load achievements from Firestore
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setAchievements([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const achievementsRef = collection(
      db,
      "users",
      user.uid,
      "achievements"
    );

    const unsubscribe = onSnapshot(
      achievementsRef,
      (snapshot) => {
        const records = snapshot.docs.map((achievementDoc) => ({
          id: achievementDoc.id,
          ...achievementDoc.data(),
        }));

        records.sort((a, b) => {
          const dateA = a.createdAt?.toMillis?.() || 0;
          const dateB = b.createdAt?.toMillis?.() || 0;
          return dateB - dateA;
        });

        setAchievements(records);
        setLoading(false);
      },
      (err) => {
        console.error("Error loading achievements:", err);
        setError("Unable to load achievements. Please check Firestore permissions.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, authLoading]);

  // Handle form inputs
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Save achievement in Firestore
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!user) {
      setError("Please log in before adding an achievement.");
      return;
    }

    if (!formData.title.trim()) {
      setError("Please enter an achievement title.");
      return;
    }

    try {
      const achievementsRef = collection(
        db,
        "users",
        user.uid,
        "achievements"
      );

      await addDoc(achievementsRef, {
        title: formData.title.trim(),
        category: formData.category,
        issuer: formData.issuer.trim(),
        date: formData.date,
        description: formData.description.trim(),
        createdAt: serverTimestamp(),
      });

      setFormData({
        title: "",
        category: "Academic",
        issuer: "",
        date: "",
        description: "",
      });

      setSuccess("Achievement saved successfully!");
    } catch (err) {
      console.error("Error saving achievement:", err);
      setError("Could not save achievement. Please try again.");
    }
  };

  // Delete achievement from Firestore
  const handleDelete = async (achievementId) => {
    if (!user) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this achievement?"
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await deleteDoc(
        doc(
          db,
          "users",
          user.uid,
          "achievements",
          achievementId
        )
      );

      setSuccess("Achievement deleted successfully!");
    } catch (err) {
      console.error("Error deleting achievement:", err);
      setError("Could not delete achievement. Please try again.");
    }
  };

  if (authLoading) {
    return (
      <div className="achievements-page">
        <p>Checking login...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="achievements-page">
        <h2>Please log in</h2>
        <p>You must be logged in to manage your achievements.</p>
      </div>
    );
  }

  return (
    <div className="achievements-page">
      <div className="achievements-header">
        <div>
          <h1>My Achievements</h1>
          <p>Record and manage your accomplishments.</p>
        </div>

        <div className="achievements-total">
          <Trophy size={20} />
          <span>{achievements.length} Achievements</span>
        </div>
      </div>

      {error && (
        <div className="achievement-message achievement-error">
          {error}
        </div>
      )}

      {success && (
        <div className="achievement-message achievement-success">
          {success}
        </div>
      )}

      <div className="achievements-layout">
        {/* Add achievement form */}
        <section className="achievement-form-card">
          <h2>
            <Plus size={20} />
            Add Achievement
          </h2>

          <form onSubmit={handleSubmit}>
            <label htmlFor="achievement-title">
              Achievement Title *
            </label>
            <input
              id="achievement-title"
              name="title"
              type="text"
              placeholder="e.g. First Prize in Hackathon"
              value={formData.title}
              onChange={handleChange}
              required
            />

            <label htmlFor="achievement-category">
              Category
            </label>
            <select
              id="achievement-category"
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              <option>Academic</option>
              <option>Competition</option>
              <option>Leadership</option>
              <option>Volunteering</option>
              <option>Sports</option>
              <option>Other</option>
            </select>

            <label htmlFor="achievement-issuer">
              Organization / Issuer
            </label>
            <input
              id="achievement-issuer"
              name="issuer"
              type="text"
              placeholder="e.g. College or organization"
              value={formData.issuer}
              onChange={handleChange}
            />

            <label htmlFor="achievement-date">
              Date
            </label>
            <input
              id="achievement-date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
            />

            <label htmlFor="achievement-description">
              Description
            </label>
            <textarea
              id="achievement-description"
              name="description"
              placeholder="Describe your achievement..."
              rows="4"
              value={formData.description}
              onChange={handleChange}
            />

            <button
              className="achievement-submit-button"
              type="submit"
            >
              <Plus size={18} />
              Save Achievement
            </button>
          </form>
        </section>

        {/* Saved achievements */}
        <section className="achievement-list-section">
          <div className="achievement-list-heading">
            <h2>Saved Achievements</h2>
            <span>{achievements.length} total</span>
          </div>

          {loading ? (
            <p className="achievement-empty">
              Loading achievements...
            </p>
          ) : achievements.length === 0 ? (
            <div className="achievement-empty">
              <Award size={35} />
              <h3>No achievements yet</h3>
              <p>Add your first achievement using the form.</p>
            </div>
          ) : (
            <div className="achievement-list">
              {achievements.map((achievement) => (
                <article
                  className="achievement-item"
                  key={achievement.id}
                >
                  <div className="achievement-item-icon">
                    <Trophy size={22} />
                  </div>

                  <div className="achievement-item-content">
                    <h3>{achievement.title}</h3>

                    <span className="achievement-category">
                      {achievement.category || "Other"}
                    </span>

                    {achievement.issuer && (
                      <p>
                        Organization: {achievement.issuer}
                      </p>
                    )}

                    {achievement.date && (
                      <p className="achievement-date">
                        <CalendarDays size={15} />
                        {achievement.date}
                      </p>
                    )}

                    {achievement.description && (
                      <p>{achievement.description}</p>
                    )}
                  </div>

                  <button
                    type="button"
                    className="achievement-delete-button"
                    onClick={() => handleDelete(achievement.id)}
                    aria-label={`Delete ${achievement.title}`}
                    title="Delete achievement"
                  >
                    <Trash2 size={18} />
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Achievements;