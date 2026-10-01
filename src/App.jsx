import "bootstrap/dist/css/bootstrap.min.css";
import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import NavBar from "./components/NavBar.jsx";
import OfflineBanner from "./components/OfflineBanner.jsx";

import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx"

function App() {

  return (
  <AuthProvider>
    <BrowserRouter>
    <OfflineBanner />
    <NavBar />
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
    </BrowserRouter>
  </AuthProvider >
  );
}

export default App
