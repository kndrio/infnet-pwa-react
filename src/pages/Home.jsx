import { useEffect, useState } from "react";
import { Container, Form, Button, ListGroup, Row, Col, InputGroup } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext.jsx";
import {
  subscribeTasks,
  addTask,
  setTaskCompleted,
  deleteTask,
} from "../services/taskServiceProvider.js";
import NotificationButton from "../components/NotificationButton.jsx";

/**
 * Tela Home = "cadastro" do briefing do projeto final. Evolui o modelo de
 * Notes (Aulas 3-7: título + conteúdo) para o modelo de Task pedido
 * explicitamente no projeto final: título + horário de execução + status
 * de concluída - a mesma ideia de "cadastrar e listar", agora com o campo
 * que falta pra virar tarefa em vez de nota.
 */
export default function Home() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeTasks(user.uid, setTasks, (err) =>
      console.error("Erro ao carregar tasks:", err)
    );
    return unsubscribe;
  }, [user]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    await addTask(user.uid, { title: title.trim(), time });
    setTitle("");
    setTime("");
  }

  return (
    <Container className="py-4" style={{ maxWidth: 640 }}>
      <h1 className="h4 mb-3">Minhas tasks</h1>

      <div className="mb-3">
        <NotificationButton />
      </div>

      <Form onSubmit={handleSubmit} className="mb-4">
        <Row className="g-2">
          <Col xs={12} sm={7}>
            <Form.Control
              placeholder="O que precisa ser feito?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Col>
          <Col xs={7} sm={3}>
            <InputGroup>
              <InputGroup.Text>Às</InputGroup.Text>
              <Form.Control
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </InputGroup>
          </Col>
          <Col xs={5} sm={2}>
            <Button type="submit" className="w-100">
              Salvar
            </Button>
          </Col>
        </Row>
      </Form>

      {tasks.length === 0 && (
        <p className="text-muted">Nenhuma task cadastrada ainda.</p>
      )}

      <ListGroup>
        {tasks.map((task) => (
          <ListGroup.Item
            key={task.id}
            className="d-flex align-items-center justify-content-between"
          >
            <Form.Check
              type="checkbox"
              checked={task.completed}
              onChange={(e) => setTaskCompleted(task.id, e.target.checked)}
              label={
                <span
                  style={{
                    textDecoration: task.completed ? "line-through" : "none",
                  }}
                >
                  {task.title}
                  {task.time && (
                    <small className="text-muted ms-2">({task.time})</small>
                  )}
                </span>
              }
            />
            <Button
              size="sm"
              variant="outline-danger"
              onClick={() => deleteTask(task.id)}
            >
              Excluir
            </Button>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Container>
  );
}
