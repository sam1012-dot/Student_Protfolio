import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import Projects from "../pages/Projects";
import Skills from "../pages/Skills";
import Certificates from "../pages/Certificates";
import Education from "../pages/Education";
import Achievements from "../pages/Achievements";
import Resume from "../pages/Resume";
import Settings from "../pages/Settings";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/profile" element={<Profile />} />

        <Route path="/projects" element={<Projects />} />

        <Route path="/skills" element={<Skills />} />

        <Route path="/certificates" element={<Certificates />} />

        <Route path="/education" element={<Education />} />

        <Route path="/achievements" element={<Achievements />} /> 

        <Route path="/resume" element={<Resume />} />
      
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;