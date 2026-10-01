/**
 * Camada de acesso a dados das Tasks - DUBLÊ (fake) em memória.
 *
 * Existe por um motivo concreto e documentado: este app foi desenvolvido
 * num sandbox cuja política de rede bloqueia o download do binário do
 * Firestore Emulator (um .jar servido por storage.googleapis.com) e
 * também bloqueia o acesso à internet pública em geral - então não tem
 * como subir um Firestore de verdade (nem emulado, nem na nuvem) AQUI
 * dentro para testar o fluxo de CRUD ao vivo.
 *
 * A saída foi isolar o acesso a dados atrás de uma interface pequena
 * (subscribeTasks/addTask/setTaskCompleted/deleteTask/updateTaskTitle) e
 * implementar essa MESMA interface duas vezes: uma vez de verdade contra
 * o Firestore (taskService.firestore.js) e uma vez em memória, só para
 * rodar os testes automatizados e a demonstração aqui. Nenhum componente
 * React sabe qual das duas está em uso - taskServiceProvider.js decide
 * isso por variável de ambiente (VITE_DATA_BACKEND).
 *
 * Quando você rodar este projeto na sua própria máquina com
 * `firebase emulators:start` (lá o download do .jar funciona normalmente)
 * ou com um projeto Firebase real, é só trocar VITE_DATA_BACKEND=firestore
 * no .env - o React inteiro (Home, Dashboard) continua igual.
 */

let tasks = [];
let nextId = 1;
const listeners = new Map(); // uid -> Set<callback>

function notify(uid) {
  const subs = listeners.get(uid);
  if (!subs) return;
  const userTasks = tasks
    .filter((t) => t.uid === uid)
    .sort((a, b) => b.createdAt - a.createdAt);
  subs.forEach((cb) => cb(userTasks.map((t) => ({ ...t }))));
}

export function subscribeTasks(uid, onChange /*, onError */) {
  if (!listeners.has(uid)) listeners.set(uid, new Set());
  listeners.get(uid).add(onChange);
  notify(uid);

  return () => {
    listeners.get(uid)?.delete(onChange);
  };
}

export async function addTask(uid, { title, time }) {
  tasks.push({
    id: String(nextId++),
    uid,
    title,
    time: time || null,
    completed: false,
    completedAt: null,
    createdAt: new Date(),
  });
  notify(uid);
}

export async function setTaskCompleted(taskId, completed) {
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return;
  task.completed = completed;
  task.completedAt = completed ? new Date() : null;
  notify(task.uid);
}

export async function deleteTask(taskId) {
  const task = tasks.find((t) => t.id === taskId);
  tasks = tasks.filter((t) => t.id !== taskId);
  if (task) notify(task.uid);
}

export async function updateTaskTitle(taskId, title) {
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return;
  task.title = title;
  notify(task.uid);
}

export function isCompletedToday(task) {
  if (!task.completed || !task.completedAt) return false;
  const completedAt =
    task.completedAt instanceof Date ? task.completedAt : new Date(task.completedAt);
  const now = new Date();
  return (
    completedAt.getFullYear() === now.getFullYear() &&
    completedAt.getMonth() === now.getMonth() &&
    completedAt.getDate() === now.getDate()
  );
}

/** Só para testes: reseta o estado do dublê entre cenários. */
export function __resetMockTasks() {
  tasks = [];
  nextId = 1;
  listeners.clear();
}
