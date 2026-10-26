import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Code2,
  Database,
  Palette,
  Brain,
  Wrench,
} from "lucide-react";

import { auth, db } from "../services/firebase";
import "../styles/skills.css";

function Skills() {
  const [user, setUser] = useState(null);
  const [skills, setSkills] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    category: "Programming",
    level: 70,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        loadSkills(currentUser.uid);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadSkills = async (uid) => {
    try {
      setLoading(true);

      const skillsRef = collection(db, "users", uid, "skills");
      const snapshot = await getDocs(skillsRef);

      const skillList = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      setSkills(skillList);
    } catch (error) {
      console.error("Error loading skills:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const openAddForm = () => {
    setEditingId(null);

    setFormData({
      name: "",
      category: "Programming",
      level: 70,
    });

    setShowForm(true);
  };

  const openEditForm = (skill) => {
    setEditingId(skill.id);

    setFormData({
      name: skill.name || "",
      category: skill.category || "Programming",
      level: skill.level || 70,
    });

    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Please login first.");
      return;
    }

    if (!formData.name.trim()) {
      alert("Skill name is required.");
      return;
    }

    try {
      setSaving(true);

      const skillData = {
        name: formData.name.trim(),
        category: formData.category,
        level: Number(formData.level),
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(
          doc(db, "users", user.uid, "skills", editingId),
          skillData
        );
      } else {
        await addDoc(
          collection(db, "users", user.uid, "skills"),
          {
            ...skillData,
            uid: user.uid,
            createdAt: serverTimestamp(),
          }
        );
      }

      await loadSkills(user.uid);

      setShowForm(false);
      setEditingId(null);

      setFormData({
        name: "",
        category: "Programming",
        level: 70,
      });
    } catch (error) {
      console.error("Error saving skill:", error);
      alert("Failed to save skill.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!user) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this skill?"
    );

    if (!confirmed) return;

    try {
      await deleteDoc(
        doc(db, "users", user.uid, "skills", id)
      );

      setSkills((prev) =>
        prev.filter((skill) => skill.id !== id)
      );
    } catch (error) {
      console.error("Error deleting skill:", error);
      alert("Failed to delete skill.");
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Programming":
        return <Code2 size={22} />;

      case "Database":
        return <Database size={22} />;

      case "Design":
        return <Palette size={22} />;

      case "AI / ML":
        return <Brain size={22} />;

      default:
        return <Wrench size={22} />;
    }
  };

  if (loading) {
    return (
      <div className="skills-loading">
        Loading skills...
      </div>
    );
  }

  return (
    <div className="skills-page">

      {/* Header */}

      <div className="skills-header">

        <div>
          <h1>Skills</h1>

          <p>
            Track your technical and professional abilities.
          </p>
        </div>

        <button
          className="add-skill-btn"
          onClick={openAddForm}
        >
          <Plus size={19} />
          Add Skill
        </button>

      </div>

      {/* Empty State */}

      {skills.length === 0 && (
        <div className="skills-empty">

          <div className="skills-empty-icon">
            <Code2 size={42} />
          </div>

          <h2>No skills added yet</h2>

          <p>
            Add your programming languages, tools,
            frameworks and other skills.
          </p>

          <button
            className="add-skill-btn"
            onClick={openAddForm}
          >
            <Plus size={18} />
            Add Your First Skill
          </button>

        </div>
      )}

      {/* Skills */}

      {skills.length > 0 && (
        <div className="skills-grid">

          {skills.map((skill) => (

            <div className="skill-card" key={skill.id}>

              <div className="skill-card-top">

                <div className="skill-icon">
                  {getCategoryIcon(skill.category)}
                </div>

                <div className="skill-actions">

                  <button
                    onClick={() => openEditForm(skill)}
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    className="skill-delete"
                    onClick={() => handleDelete(skill.id)}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>

                </div>

              </div>

              <div className="skill-info">

                <h2>{skill.name}</h2>

                <span className="skill-category">
                  {skill.category}
                </span>

              </div>

              <div className="skill-progress-area">

                <div className="skill-progress-header">

                  <span>Proficiency</span>

                  <strong>{skill.level}%</strong>

                </div>

                <div className="skill-progress">

                  <div
                    className="skill-progress-fill"
                    style={{
                      width: `${skill.level}%`,
                    }}
                  />

                </div>

              </div>

            </div>

          ))}

        </div>
      )}

      {/* Modal */}

      {showForm && (
        <div className="skill-modal-overlay">

          <div className="skill-modal">

            <div className="skill-modal-header">

              <div>
                <h2>
                  {editingId ? "Edit Skill" : "Add Skill"}
                </h2>

                <p>
                  Add a skill and your proficiency level.
                </p>
              </div>

              <button
                className="close-skill-modal"
                onClick={() => setShowForm(false)}
              >
                <X size={21} />
              </button>

            </div>

            <form onSubmit={handleSubmit}>

              <div className="skill-field">

                <label>Skill Name *</label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Java"
                  required
                />

              </div>

              <div className="skill-field">

                <label>Category</label>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="Programming">
                    Programming
                  </option>

                  <option value="Web Development">
                    Web Development
                  </option>

                  <option value="Mobile Development">
                    Mobile Development
                  </option>

                  <option value="Database">
                    Database
                  </option>

                  <option value="AI / ML">
                    AI / ML
                  </option>

                  <option value="Design">
                    Design
                  </option>

                  <option value="Tools">
                    Tools
                  </option>

                  <option value="Soft Skills">
                    Soft Skills
                  </option>
                </select>

              </div>

              <div className="skill-field">

                <div className="level-label">

                  <label>Proficiency</label>

                  <strong>{formData.level}%</strong>

                </div>

                <input
                  type="range"
                  name="level"
                  min="0"
                  max="100"
                  value={formData.level}
                  onChange={handleChange}
                  className="skill-range"
                />

              </div>

              <div className="skill-preview">

                <div className="skill-preview-icon">
                  {getCategoryIcon(formData.category)}
                </div>

                <div>

                  <strong>
                    {formData.name || "Skill Preview"}
                  </strong>

                  <span>
                    {formData.category}
                  </span>

                </div>

              </div>

              <div className="skill-modal-actions">

                <button
                  type="button"
                  className="skill-cancel-btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="skill-save-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Skill"
                    : "Save Skill"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default Skills;