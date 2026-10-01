import { Navigate } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext.jsx";

/** Bloqueia acesso a rotas que exigem login (Home, Dashboard). */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "60vh" }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Carregando...</span>
        </Spinner>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
