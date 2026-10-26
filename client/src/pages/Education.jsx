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
  GraduationCap,
  Briefcase,
} from "lucide-react";

import { auth, db } from "../services/firebase";
import "../styles/education.css";

function Education() {
  const [user, setUser] = useState(null);
  const [education, setEducation] = useState([]);
  const [experience, setExperience] = useState([]);

  const [activeTab, setActiveTab] = useState("education");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    institution: "",
    degree: "",
    field: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        loadData(currentUser.uid);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadData = async (uid) => {
    try {
      setLoading(true);

      const educationSnapshot = await getDocs(
        collection(db, "users", uid, "education")
      );

      const experienceSnapshot = await getDocs(
        collection(db, "users", uid, "experience")
      );

      setEducation(
        educationSnapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }))
      );

      setExperience(
        experienceSnapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }))
      );
    } catch (error) {
      console.error("Error loading education/experience:", error);
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

  const resetForm = () => {
    setFormData({
      institution: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
      description: "",
    });

    setEditingId(null);
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (item) => {
    setEditingId(item.id);

    setFormData({
      institution: item.institution || "",
      degree: item.degree || "",
      field: item.field || "",
      startDate: item.startDate || "",
      endDate: item.endDate || "",
      description: item.description || "",
    });

    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Please login first.");
      return;
    }

    if (!formData.institution.trim()) {
      alert("Institution/company name is required.");
      return;
    }

    if (!formData.degree.trim()) {
      alert(
        activeTab === "education"
          ? "Degree is required."
          : "Job role is required."
      );
      return;
    }

    try {
      setSaving(true);

      const data = {
        institution: formData.institution.trim(),
        degree: formData.degree.trim(),
        field: formData.field.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        description: formData.description.trim(),
        updatedAt: serverTimestamp(),
      };

      const collectionName =
        activeTab === "education"
          ? "education"
          : "experience";

      if (editingId) {
        await updateDoc(
          doc(
            db,
            "users",
            user.uid,
            collectionName,
            editingId
          ),
          data
        );
      } else {
        await addDoc(
          collection(
            db,
            "users",
            user.uid,
            collectionName
          ),
          {
            ...data,
            uid: user.uid,
            createdAt: serverTimestamp(),
          }
        );
      }

      await loadData(user.uid);

      setShowForm(false);
      resetForm();
    } catch (error) {
      console.error("Error saving:", error);
      alert("Failed to save information.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!user) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this item?"
    );

    if (!confirmed) return;

    try {
      const collectionName =
        activeTab === "education"
          ? "education"
          : "experience";

      await deleteDoc(
        doc(
          db,
          "users",
          user.uid,
          collectionName,
          id
        )
      );

      if (activeTab === "education") {
        setEducation((prev) =>
          prev.filter((item) => item.id !== id)
        );
      } else {
        setExperience((prev) =>
          prev.filter((item) => item.id !== id)
        );
      }
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Failed to delete.");
    }
  };

  const currentItems =
    activeTab === "education"
      ? education
      : experience;

  if (loading) {
    return (
      <div className="education-loading">
        Loading...
      </div>
    );
  }

  return (
    <div className="education-page">

      {/* Header */}

      <div className="education-header">

        <div>
          <h1>Education & Experience</h1>

          <p>
            Showcase your academic journey and professional experience.
          </p>
        </div>

        <button
          className="add-education-btn"
          onClick={openAddForm}
        >
          <Plus size={19} />
          Add {activeTab === "education"
            ? "Education"
            : "Experience"}
        </button>

      </div>

      {/* Tabs */}

      <div className="education-tabs">

        <button
          className={
            activeTab === "education"
              ? "active"
              : ""
          }
          onClick={() => {
            setActiveTab("education");
            resetForm();
          }}
        >
          <GraduationCap size={18} />
          Education
        </button>

        <button
          className={
            activeTab === "experience"
              ? "active"
              : ""
          }
          onClick={() => {
            setActiveTab("experience");
            resetForm();
          }}
        >
          <Briefcase size={18} />
          Experience
        </button>

      </div>

      {/* Empty */}

      {currentItems.length === 0 && (
        <div className="education-empty">

          <div className="education-empty-icon">
            {activeTab === "education" ? (
              <GraduationCap size={42} />
            ) : (
              <Briefcase size={42} />
            )}
          </div>

          <h2>
            No {activeTab === "education"
              ? "education"
              : "experience"} added yet
          </h2>

          <p>
            Add your{" "}
            {activeTab === "education"
              ? "college, degree and academic details."
              : "internships, jobs and professional experience."}
          </p>

          <button
            className="add-education-btn"
            onClick={openAddForm}
          >
            <Plus size={18} />
            Add Now
          </button>

        </div>
      )}

      {/* Timeline */}

      {currentItems.length > 0 && (
        <div className="education-timeline">

          {currentItems.map((item) => (

            <div
              className="timeline-item"
              key={item.id}
            >

              <div className="timeline-marker">
                {activeTab === "education" ? (
                  <GraduationCap size={20} />
                ) : (
                  <Briefcase size={20} />
                )}
              </div>

              <div className="timeline-card">

                <div className="timeline-card-header">

                  <div>
                    <h2>{item.degree}</h2>

                    <h3>{item.institution}</h3>
                  </div>

                  <div className="timeline-actions">

                    <button
                      onClick={() =>
                        openEditForm(item)
                      }
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      className="delete"
                      onClick={() =>
                        handleDelete(item.id)
                      }
                    >
                      <Trash2 size={16} />
                    </button>

                  </div>

                </div>

                {item.field && (
                  <span className="timeline-field">
                    {item.field}
                  </span>
                )}

                {(item.startDate ||
                  item.endDate) && (
                  <div className="timeline-date">

                    {item.startDate || "Start"}

                    {" — "}

                    {item.endDate || "Present"}

                  </div>
                )}

                {item.description && (
                  <p className="timeline-description">
                    {item.description}
                  </p>
                )}

              </div>

            </div>

          ))}

        </div>
      )}

      {/* Modal */}

      {showForm && (
        <div className="education-modal-overlay">

          <div className="education-modal">

            <div className="education-modal-header">

              <div>
                <h2>
                  {editingId
                    ? "Edit"
                    : "Add"}{" "}
                  {activeTab === "education"
                    ? "Education"
                    : "Experience"}
                </h2>

                <p>
                  Enter your details below.
                </p>
              </div>

              <button
                className="close-education-modal"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
              >
                <X size={21} />
              </button>

            </div>

            <form onSubmit={handleSubmit}>

              <div className="education-field">

                <label>
                  {activeTab === "education"
                    ? "Institution"
                    : "Company"}{" "}
                  *
                </label>

                <input
                  type="text"
                  name="institution"
                  value={formData.institution}
                  onChange={handleChange}
                  placeholder={
                    activeTab === "education"
                      ? "e.g. ASM NextGen Technical Campus"
                      : "e.g. Anmey IT & Services"
                  }
                  required
                />

              </div>

              <div className="education-field">

                <label>
                  {activeTab === "education"
                    ? "Degree"
                    : "Job Role"}{" "}
                  *
                </label>

                <input
                  type="text"
                  name="degree"
                  value={formData.degree}
                  onChange={handleChange}
                  placeholder={
                    activeTab === "education"
                      ? "e.g. BE Computer Engineering"
                      : "e.g. Android Developer Intern"
                  }
                  required
                />

              </div>

              <div className="education-field">

                <label>
                  {activeTab === "education"
                    ? "Field of Study"
                    : "Department / Field"}
                </label>

                <input
                  type="text"
                  name="field"
                  value={formData.field}
                  onChange={handleChange}
                  placeholder="e.g. Computer Science"
                />

              </div>

              <div className="education-date-grid">

                <div className="education-field">

                  <label>Start Date</label>

                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                  />

                </div>

                <div className="education-field">

                  <label>End Date</label>

                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                  />

                </div>

              </div>

              <div className="education-field">

                <label>Description</label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Describe your experience, responsibilities or achievements..."
                />

              </div>

              <div className="education-modal-actions">

                <button
                  type="button"
                  className="education-cancel-btn"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="education-save-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update"
                    : "Save"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default Education;