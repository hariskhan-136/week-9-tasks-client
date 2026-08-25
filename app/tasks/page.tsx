"use client";

import { useCallback, useEffect, useState } from "react";
import { CreateTaskForm } from "@/components/CreateTaskForm";

import { api, ApiError } from "@/lib/api";
import type { Task, TaskStatus } from "@/lib/types";

const statuses: Array<{ value: "" | TaskStatus; label: string }> = [
  { value: "", label: "All Statuses" },
  { value: "todo", label: "Todo" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [status, setStatus] = useState<"" | TaskStatus>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const query = status ? `?status=${encodeURIComponent(status)}` : "";

      const data = await api<Task[]>(`/tasks${query}`);

      setTasks(data);
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError("Failed to load tasks.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  async function handleDelete(id: number) {
    setDeletingId(id);

    try {
      await api<void>(`/tasks/${id}`, {
        method: "DELETE",
      });

      setTasks((currentTasks) => currentTasks.filter((task) => task.id !== id));
    } catch (error) {
      setError(
        error instanceof ApiError
          ? `Failed to delete task: ${error.message}`
          : "Failed to delete task.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-3xl font-bold">Tasks</h1>

        <CreateTaskForm
          onCreated={(task) => {
            setTasks((currentTasks) => [task, ...currentTasks]);
          }}
        />

        <div className="mb-6">
          <label
            htmlFor="status-filter"
            className="mb-2 block text-sm font-medium"
          >
            Filter by status
          </label>

          <select
            id="status-filter"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as "" | TaskStatus)
            }
            className="rounded-md border px-3 py-2"
          >
            {statuses.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        {isLoading && (
          <div className="rounded-md border p-6">
            <p>Loading tasks...</p>
          </div>
        )}

        {!isLoading && error && (
          <div
            role="alert"
            className="rounded-md border border-red-300 p-6 text-red-600"
          >
            <p>{error}</p>
            <button
              type="button"
              onClick={() => void loadTasks()}
              className="mt-3 rounded-md border px-3 py-2"
            >
              Try Again
            </button>
          </div>
        )}

        {!isLoading && !error && tasks.length === 0 && (
          <div className="rounded-md border p-6">
            <p>No tasks found.</p>
          </div>
        )}

        {!isLoading && !error && tasks.length > 0 && (
          <div className="space-y-4">
            {tasks.map((task) => (
              <article key={task.id} className="rounded-lg border p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">{task.title}</h2>

                    {task.description && (
                      <p className="mt-2 text-sm">{task.description}</p>
                    )}

                    <div className="mt-3 flex gap-3 text-sm">
                      <span>Status: {task.status}</span>
                      <span>Priority: {task.priority}</span>
                      <span>Project: {task.projectId}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleDelete(task.id)}
                    disabled={deletingId === task.id}
                    className="rounded-md border px-3 py-2 text-sm disabled:opacity-50"
                  >
                    {deletingId === task.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
