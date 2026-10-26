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
  ExternalLink,
  Pencil,
  Trash2,
  X,
  Code2,
  GitBranch,
} from "lucide-react";

import { auth, db } from "../services/firebase";
import "../styles/projects.css";

function Projects() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    technologies: "",
    github: "",
    liveDemo: "",
  });

  // Get logged-in user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        loadProjects(currentUser.uid);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Load projects
  const loadProjects = async (uid) => {
    try {
      setLoading(true);

      const projectsRef = collection(db, "users", uid, "projects");
      const snapshot = await getDocs(projectsRef);

      const projectList = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      setProjects(projectList);
    } catch (error) {
      console.error("Error loading projects:", error);
    } finally {
      setLoading(false);
    }
  };

  // Input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Open add form
  const openAddForm = () => {
    setEditingId(null);

    setFormData({
      title: "",
      description: "",
      technologies: "",
      github: "",
      liveDemo: "",
    });

    setShowForm(true);
  };

  // Open edit form
  const openEditForm = (project) => {
    setEditingId(project.id);

    setFormData({
      title: project.title || "",
      description: project.description || "",
      technologies: project.technologies || "",
      github: project.github || "",
      liveDemo: project.liveDemo || "",
    });

    setShowForm(true);
  };

  // Save project
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Please login first.");
      return;
    }

    if (!formData.title.trim()) {
      alert("Project title is required.");
      return;
    }

    try {
      setSaving(true);

      if (editingId) {
        const projectRef = doc(
          db,
          "users",
          user.uid,
          "projects",
          editingId
        );

        await updateDoc(projectRef, {
          ...formData,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(
          collection(db, "users", user.uid, "projects"),
          {
            ...formData,
            uid: user.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }
        );
      }

      await loadProjects(user.uid);

      setShowForm(false);
      setEditingId(null);

      setFormData({
        title: "",
        description: "",
        technologies: "",
        github: "",
        liveDemo: "",
      });
    } catch (error) {
      console.error("Error saving project:", error);
      alert("Failed to save project.");
    } finally {
      setSaving(false);
    }
  };

  // Delete project
  const handleDelete = async (id) => {
    if (!user) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmed) return;

    try {
      await deleteDoc(
        doc(db, "users", user.uid, "projects", id)
      );

      setProjects((prev) =>
        prev.filter((project) => project.id !== id)
      );
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Failed to delete project.");
    }
  };

  if (loading) {
    return (
      <div className="projects-loading">
        Loading projects...
      </div>
    );
  }

  return (
    <div className="projects-page">

      {/* Header */}

      <div className="projects-header">

        <div>
          <h1>Projects</h1>

          <p>
            Showcase your work, ideas and technical achievements.
          </p>
        </div>

        <button
          className="add-project-btn"
          onClick={openAddForm}
        >
          <Plus size={19} />
          Add Project
        </button>

      </div>

      {/* Empty State */}

      {projects.length === 0 && !showForm && (
        <div className="projects-empty">

          <div className="empty-icon">
            <Code2 size={42} />
          </div>

          <h2>No projects yet</h2>

          <p>
            Start building your portfolio by adding your first project.
          </p>

          <button
            className="add-project-btn"
            onClick={openAddForm}
          >
            <Plus size={18} />
            Add Your First Project
          </button>

        </div>
      )}

      {/* Project Cards */}

      {projects.length > 0 && (
        <div className="projects-grid">

          {projects.map((project) => (

            <div className="project-card" key={project.id}>

              <div className="project-card-top">

                <div className="project-icon">
                  <Code2 size={24} />
                </div>

                <div className="project-actions">

                  <button
                    onClick={() => openEditForm(project)}
                    title="Edit"
                  >
                    <Pencil size={17} />
                  </button>

                  <button
                    onClick={() => handleDelete(project.id)}
                    title="Delete"
                    className="delete-btn"
                  >
                    <Trash2 size={17} />
                  </button>

                </div>

              </div>

              <h2>{project.title}</h2>

              <p className="project-description">
                {project.description || "No description added."}
              </p>

              {/* Technologies */}

              {project.technologies && (
                <div className="technology-list">

                  {project.technologies
                    .split(",")
                    .map((tech, index) => (
                      <span key={index}>
                        {tech.trim()}
                      </span>
                    ))}

                </div>
              )}

              {/* Links */}

              <div className="project-links">

                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <GitBranch size={17} />
                    GitHub
                  </a>
                )}

                {project.liveDemo && (
                  <a
                    href={project.liveDemo}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink size={17} />
                    Live Demo
                  </a>
                )}

              </div>

            </div>

          ))}

        </div>
      )}

      {/* Add/Edit Modal */}

      {showForm && (
        <div className="project-modal-overlay">

          <div className="project-modal">

            <div className="modal-header">

              <div>
                <h2>
                  {editingId ? "Edit Project" : "Add Project"}
                </h2>

                <p>
                  Add details about your project.
                </p>
              </div>

              <button
                className="close-modal"
                onClick={() => setShowForm(false)}
              >
                <X size={21} />
              </button>

            </div>

            <form onSubmit={handleSubmit}>

              <div className="project-field">
                <label>Project Title *</label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Student Portfolio System"
                  required
                />
              </div>

              <div className="project-field">
                <label>Description</label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe what you built..."
                  rows="5"
                />
              </div>

              <div className="project-field">
                <label>Technologies</label>

                <input
                  type="text"
                  name="technologies"
                  value={formData.technologies}
                  onChange={handleChange}
                  placeholder="React, Firebase, JavaScript"
                />

                <small>
                  Separate technologies with commas.
                </small>
              </div>

              <div className="project-field">
                <label>GitHub URL</label>

                <input
                  type="url"
                  name="github"
                  value={formData.github}
                  onChange={handleChange}
                  placeholder="https://github.com/username/project"
                />
              </div>

              <div className="project-field">
                <label>Live Demo URL</label>

                <input
                  type="url"
                  name="liveDemo"
                  value={formData.liveDemo}
                  onChange={handleChange}
                  placeholder="https://your-project.com"
                />
              </div>

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-project-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Project"
                    : "Save Project"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default Projects;