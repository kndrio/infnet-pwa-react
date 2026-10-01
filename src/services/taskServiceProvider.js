/**
 * Ponto único de decisão: qual implementação de taskService usar.
 *
 * VITE_DATA_BACKEND=firestore (padrão em produção) -> Firestore de verdade.
 * VITE_DATA_BACKEND=mock -> dublê em memória (usado neste sandbox e nos
 *   testes automatizados, ver taskService.mock.js).
 *
 * Todo o resto do app importa APENAS deste arquivo, nunca diretamente de
 * taskService.firestore.js ou taskService.mock.js - assim trocar o backend
 * é uma linha de .env, não uma busca-e-substitui no código.
 */

import * as firestoreImpl from "./taskService.firestore.js";
import * as mockImpl from "./taskService.mock.js";

const backend = import.meta.env.VITE_DATA_BACKEND === "mock" ? mockImpl : firestoreImpl;

export const subscribeTasks = backend.subscribeTasks;
export const addTask = backend.addTask;
export const setTaskCompleted = backend.setTaskCompleted;
export const deleteTask = backend.deleteTask;
export const updateTaskTitle = backend.updateTaskTitle;
export const isCompletedToday = backend.isCompletedToday;
