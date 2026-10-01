import { useState } from "react";
import { Container, Card, Form, Button, Alert, Tabs, Tab } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState("login"); // "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password);
      }
      navigate("/home");
    } catch (err) {
      setError(traduzErro(err.code) || err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Container
      className="d-flex flex-column align-items-center justify-content-center"
      style={{ minHeight: "80vh" }}
    >
      <Card style={{ width: "100%", maxWidth: 420 }} className="shadow-sm">
        <Card.Body>
          <Card.Title as="h1" className="h4 mb-3 text-center">
            Minhas Tasks
          </Card.Title>

          <Tabs
            activeKey={mode}
            onSelect={(k) => setMode(k)}
            className="mb-3 justify-content-center"
            justify
          >
            <Tab eventKey="login" title="Entrar" />
            <Tab eventKey="register" title="Criar conta" />
          </Tabs>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>E-mail</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Senha</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </Form.Group>

            <Button type="submit" className="w-100" disabled={submitting}>
              {submitting
                ? "Aguarde..."
                : mode === "login"
                ? "Entrar"
                : "Criar conta"}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

function traduzErro(code) {
  const mapa = {
    "auth/invalid-email": "E-mail inválido.",
    "auth/user-not-found": "Usuário não encontrado.",
    "auth/wrong-password": "Senha incorreta.",
    "auth/invalid-credential": "E-mail ou senha incorretos.",
    "auth/email-already-in-use": "Já existe uma conta com esse e-mail.",
    "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres.",
  };
  return mapa[code];
}
