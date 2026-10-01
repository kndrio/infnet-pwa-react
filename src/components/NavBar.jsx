import { Navbar, Nav, Container } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import InstallPwaButton from "./InstallPwaButton.jsx";

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <Navbar bg="dark" variant="dark" expand="sm" className="mb-3">
      <Container>
        <Navbar.Brand>Minhas Tasks</Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/home">
              Home
            </Nav.Link>
            <Nav.Link as={NavLink} to="/dashboard">
              Dashboard
            </Nav.Link>
          </Nav>
          <div className="d-flex align-items-center gap-2">
            <InstallPwaButton />
            <span className="text-light small d-none d-sm-inline">{user.email}</span>
            <Nav.Link onClick={handleLogout} className="text-light">
              Sair
            </Nav.Link>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
