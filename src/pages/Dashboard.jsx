import { useEffect, useState } from "react";
import { Container, Card, Badge, ListGroup } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext.jsx";
import { subscribeTasks, isCompletedToday } from "../services/taskServiceProvider.js";

/**
 * Tela Dashboard = "tasks feitas do dia", pedida explicitamente no
 * briefing do projeto final. Reaproveita a MESMA assinatura em tempo real
 * (subscribeTasks) da Home - a única diferença é o filtro aplicado sobre
 * os dados que já chegam: aqui só o que foi concluído hoje.
 */
export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeTasks(user.uid, setTasks);
    return unsubscribe;
  }, [user]);

  const doneToday = tasks.filter(isCompletedToday);
  const pending = tasks.filter((t) => !t.completed);

  return (
    <Container className="py-4" style={{ maxWidth: 640 }}>
      <h1 className="h4 mb-3">Dashboard</h1>

      <Card className="mb-4">
        <Card.Body>
          <Card.Title className="d-flex align-items-center gap-2">
            Feitas hoje
            <Badge bg="success">{doneToday.length}</Badge>
          </Card.Title>
          {doneToday.length === 0 ? (
            <p className="text-muted mb-0">
              Nenhuma task concluída hoje ainda.
            </p>
          ) : (
            <ListGroup variant="flush">
              {doneToday.map((task) => (
                <ListGroup.Item key={task.id}>
                  ✅ {task.title}
                  {task.time && (
                    <small className="text-muted ms-2">({task.time})</small>
                  )}
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <Card.Title className="d-flex align-items-center gap-2">
            Pendentes
            <Badge bg="warning" text="dark">
              {pending.length}
            </Badge>
          </Card.Title>
          {pending.length === 0 ? (
            <p className="text-muted mb-0">Tudo em dia!</p>
          ) : (
            <ListGroup variant="flush">
              {pending.map((task) => (
                <ListGroup.Item key={task.id}>
                  {task.title}
                  {task.time && (
                    <small className="text-muted ms-2">({task.time})</small>
                  )}
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
