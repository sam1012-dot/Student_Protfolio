import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import {
  Plus,
  Award,
  Trash2,
  X,
  ExternalLink,
  Upload,
  FileText,
} from "lucide-react";
import { auth, db } from "../services/firebase";
import "../styles/certificates.css";

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read the selected file."));
    reader.readAsDataURL(file);
  });
}

function Certificates() {
  const [user, setUser] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    issuer: "",
    issueDate: "",
    credentialId: "",
    credentialUrl: "",
  });
  const [certificateFile, setCertificateFile] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        loadCertificates(currentUser.uid);
      } else {
        setCertificates([]);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadCertificates = async (uid) => {
    try {
      setLoading(true);
      const certificatesRef = collection(db, "users", uid, "certificates");
      const snapshot = await getDocs(certificatesRef);
      setCertificates(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    } catch (error) {
      console.error("Error loading certificates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      alert("Only JPG, PNG, WEBP and PDF files are allowed.");
      e.target.value = "";
      return;
    }
    if (file.size > 200 * 1024) {
      alert("File size must be 200 KB or less.");
      e.target.value = "";
      return;
    }
    setCertificateFile(file);
  };

  const openAddForm = () => {
    setFormData({ title: "", issuer: "", issueDate: "", credentialId: "", credentialUrl: "" });
    setCertificateFile(null);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please login first.");
      return;
    }
    if (!formData.title.trim()) {
      alert("Certificate title is required.");
      return;
    }
    if (!formData.issuer.trim()) {
      alert("Issuer is required.");
      return;
    }

    try {
      setSaving(true);
      const fileData = certificateFile ? await fileToDataUrl(certificateFile) : "";
      await addDoc(collection(db, "users", user.uid, "certificates"), {
        uid: user.uid,
        title: formData.title.trim(),
        issuer: formData.issuer.trim(),
        issueDate: formData.issueDate,
        credentialId: formData.credentialId.trim(),
        credentialUrl: formData.credentialUrl.trim(),
        fileData,
        fileName: certificateFile ? certificateFile.name : "",
        fileType: certificateFile ? certificateFile.type : "",
        createdAt: serverTimestamp(),
      });

      await loadCertificates(user.uid);
      setShowForm(false);
      setFormData({ title: "", issuer: "", issueDate: "", credentialId: "", credentialUrl: "" });
      setCertificateFile(null);
    } catch (error) {
      console.error("Error saving certificate:", error);
      alert(error.message || "Failed to save certificate.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!user) return;
    if (!window.confirm("Are you sure you want to delete this certificate?")) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "certificates", id));
      setCertificates((prev) => prev.filter((certificate) => certificate.id !== id));
    } catch (error) {
      console.error("Error deleting certificate:", error);
      alert("Failed to delete certificate.");
    }
  };

  if (loading) {
    return <div className="certificates-loading">Loading certificates...</div>;
  }

  return (
    <div className="certificates-page">
      <div className="certificates-header">
        <div>
          <h1>Certificates</h1>
          <p>Showcase your certifications and completed courses.</p>
        </div>
        <button className="add-certificate-btn" onClick={openAddForm}>
          <Plus size={19} /> Add Certificate
        </button>
      </div>

      {certificates.length === 0 && (
        <div className="certificates-empty">
          <div className="certificate-empty-icon"><Award size={42} /></div>
          <h2>No certificates yet</h2>
          <p>Add your certifications, courses and achievements.</p>
          <button className="add-certificate-btn" onClick={openAddForm}>
            <Plus size={18} /> Add Your First Certificate
          </button>
        </div>
      )}

      {certificates.length > 0 && (
        <div className="certificates-grid">
          {certificates.map((certificate) => (
            <div className="certificate-card" key={certificate.id}>
              <div className="certificate-card-top">
                <div className="certificate-icon"><Award size={24} /></div>
                <button
                  className="certificate-delete"
                  onClick={() => handleDelete(certificate.id)}
                  title="Delete certificate"
                >
                  <Trash2 size={17} />
                </button>
              </div>
              <h2>{certificate.title}</h2>
              <p className="certificate-issuer">{certificate.issuer}</p>
              {certificate.issueDate && (
                <p className="certificate-date">
                  Issued: {new Date(certificate.issueDate).toLocaleDateString("en-IN", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </p>
              )}
              {certificate.credentialId && <p className="credential-id">ID: {certificate.credentialId}</p>}
              <div className="certificate-links">
                {certificate.fileData && (
                  <a
                    href={certificate.fileData}
                    target="_blank"
                    rel="noreferrer"
                    download={certificate.fileName || undefined}
                  >
                    <FileText size={16} /> View Certificate
                  </a>
                )}
                {certificate.credentialUrl && (
                  <a href={certificate.credentialUrl} target="_blank" rel="noreferrer">
                    <ExternalLink size={16} /> Verify
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="certificate-modal-overlay">
          <div className="certificate-modal">
            <div className="certificate-modal-header">
              <div>
                <h2>Add Certificate</h2>
                <p>Add your certification details.</p>
              </div>
              <button className="close-certificate-modal" onClick={() => setShowForm(false)}>
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="certificate-field">
                <label>Certificate Title *</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Java Programming" required />
              </div>
              <div className="certificate-field">
                <label>Issuing Organization *</label>
                <input type="text" name="issuer" value={formData.issuer} onChange={handleChange} placeholder="e.g. Udemy" required />
              </div>
              <div className="certificate-field">
                <label>Issue Date</label>
                <input type="date" name="issueDate" value={formData.issueDate} onChange={handleChange} />
              </div>
              <div className="certificate-field">
                <label>Credential ID</label>
                <input type="text" name="credentialId" value={formData.credentialId} onChange={handleChange} placeholder="e.g. UC-123456" />
              </div>
              <div className="certificate-field">
                <label>Verification URL</label>
                <input type="url" name="credentialUrl" value={formData.credentialUrl} onChange={handleChange} placeholder="https://..." />
              </div>
              <div className="certificate-field">
                <label>Certificate File</label>
                <label className="certificate-upload">
                  <Upload size={22} />
                  <span>{certificateFile ? certificateFile.name : "Choose certificate file"}</span>
                  <small>JPG, PNG, WEBP or PDF • Max 200 KB • Saved in Firestore</small>
                  <input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={handleFileChange} />
                </label>
              </div>
              <div className="certificate-modal-actions">
                <button type="button" className="certificate-cancel-btn" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="certificate-save-btn" disabled={saving}>
                  {saving ? "Saving..." : "Save Certificate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Certificates;
