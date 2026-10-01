/**
 * Camada de acesso a dados das Tasks - implementação REAL, contra o
 * Firestore (emulador local ou projeto de verdade, dependendo de
 * VITE_USE_EMULATORS em firebase.js).
 *
 * Modelo de dados (coleção "tasks"), evoluindo o modelo de Notes das aulas
 * anteriores para o modelo de Task do projeto final:
 *   {
 *     uid: string,          // dono da task (auth.uid) - usado nas regras
 *     title: string,        // o que precisa ser feito
 *     time: string,         // horário previsto, "HH:MM"
 *     completed: boolean,   // feita ou não
 *     completedAt: Timestamp | null,
 *     createdAt: Timestamp,
 *   }
 *
 * Toda função aqui exporta exatamente a mesma assinatura da versão
 * "dublê" (taskService.mock.js) em taskServiceProvider.js - é o que
 * permite trocar a implementação sem tocar em nenhum componente React.
 */

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase.js";

const tasksCollection = collection(db, "tasks");

/**
 * Assina as tasks do usuário em tempo real. Retorna a função de
 * "unsubscribe" (chamar no cleanup do useEffect).
 */
export function subscribeTasks(uid, onChange, onError) {
  const q = query(
    tasksCollection,
    where("uid", "==", uid),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const tasks = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      onChange(tasks);
    },
    (err) => {
      console.error("[taskService.firestore] erro ao assinar tasks:", err);
      if (onError) onError(err);
    }
  );
}

export async function addTask(uid, { title, time }) {
  await addDoc(tasksCollection, {
    uid,
    title,
    time: time || null,
    completed: false,
    completedAt: null,
    createdAt: serverTimestamp(),
  });
}

export async function setTaskCompleted(taskId, completed) {
  await updateDoc(doc(db, "tasks", taskId), {
    completed,
    completedAt: completed ? serverTimestamp() : null,
  });
}

export async function deleteTask(taskId) {
  await deleteDoc(doc(db, "tasks", taskId));
}

export async function updateTaskTitle(taskId, title) {
  await updateDoc(doc(db, "tasks", taskId), { title });
}

/** Helper puro (sem I/O) usado pelo Dashboard - tasks completadas hoje. */
export function isCompletedToday(task) {
  if (!task.completed || !task.completedAt) return false;
  const completedAt =
    task.completedAt instanceof Timestamp
      ? task.completedAt.toDate()
      : new Date(task.completedAt);
  const now = new Date();
  return (
    completedAt.getFullYear() === now.getFullYear() &&
    completedAt.getMonth() === now.getMonth() &&
    completedAt.getDate() === now.getDate()
  );
}
