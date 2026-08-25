"use client";

import { FormEvent, useState } from "react";

import { api, ApiError } from "@/lib/api";
import type { Task, TaskStatus } from "@/lib/types";

type CreateTaskFormProps = {
  onCreated: (task: Task) => void;
};

type FieldErrors = {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  projectId?: string;
  assigneeId?: string;
  tagIds?: string;
  form?: string;
};

export function CreateTaskForm({ onCreated }: CreateTaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [priority, setPriority] = useState("1");
  const [projectId, setProjectId] = useState("");
  const [assigneeId, setAssigneeId] = useState("");

  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrors({});

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const trimmedProjectId = projectId.trim();
    const trimmedAssigneeId = assigneeId.trim();

    if (!trimmedTitle) {
      setErrors({ title: "Title is required." });
      return;
    }

    if (!trimmedProjectId) {
      setErrors({ projectId: "Project ID is required." });
      return;
    }

    setIsSubmitting(true);

    try {
      const body: {
        title: string;
        description?: string;
        status: TaskStatus;
        priority: number;
        projectId: number;
        assigneeId?: number;
      } = {
        title: trimmedTitle,
        status,
        priority: Number(priority),
        projectId: Number(trimmedProjectId),
      };

      if (trimmedDescription) {
        body.description = trimmedDescription;
      }

      if (trimmedAssigneeId) {
        body.assigneeId = Number(trimmedAssigneeId);
      }

      const task = await api<Task>("/tasks", {
        method: "POST",
        body: JSON.stringify(body),
      });

      onCreated(task);

      setTitle("");
      setDescription("");
      setStatus("todo");
      setPriority("1");
      setProjectId("");
      setAssigneeId("");
    } catch (error) {
      if (error instanceof ApiError) {
        const nextErrors: FieldErrors = {};

        for (const message of error.messages) {
          const field = getFieldFromValidationMessage(message);

          if (field) {
            nextErrors[field] = message;
          } else {
            nextErrors.form = nextErrors.form
              ? `${nextErrors.form} ${message}`
              : message;
          }
        }

        setErrors(nextErrors);
      } else {
        setErrors({
          form: "Failed to create task.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mb-8 rounded-lg border p-6">
      <h2 className="mb-5 text-xl font-semibold">Create Task</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="mb-1 block text-sm font-medium">
            Title
          </label>

          <input
            id="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-md border px-3 py-2"
          />

          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="description"
            className="mb-1 block text-sm font-medium"
          >
            Description
          </label>

          <textarea
            id="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="w-full rounded-md border px-3 py-2"
            rows={3}
          />

          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        <div>
          <label htmlFor="status" className="mb-1 block text-sm font-medium">
            Status
          </label>

          <select
            id="status"
            value={status}
            onChange={(event) => setStatus(event.target.value as TaskStatus)}
            className="w-full rounded-md border px-3 py-2"
          >
            <option value="todo">Todo</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>

          {errors.status && (
            <p className="mt-1 text-sm text-red-600">{errors.status}</p>
          )}
        </div>

        <div>
          <label htmlFor="priority" className="mb-1 block text-sm font-medium">
            Priority (1–5)
          </label>

          <input
            id="priority"
            type="number"
            min="1"
            max="5"
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
            className="w-full rounded-md border px-3 py-2"
          />

          {errors.priority && (
            <p className="mt-1 text-sm text-red-600">{errors.priority}</p>
          )}
        </div>

        <div>
          <label htmlFor="projectId" className="mb-1 block text-sm font-medium">
            Project ID
          </label>

          <input
            id="projectId"
            type="number"
            min="1"
            value={projectId}
            onChange={(event) => setProjectId(event.target.value)}
            className="w-full rounded-md border px-3 py-2"
          />

          {errors.projectId && (
            <p className="mt-1 text-sm text-red-600">{errors.projectId}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="assigneeId"
            className="mb-1 block text-sm font-medium"
          >
            Assignee ID (optional)
          </label>

          <input
            id="assigneeId"
            type="number"
            min="1"
            value={assigneeId}
            onChange={(event) => setAssigneeId(event.target.value)}
            className="w-full rounded-md border px-3 py-2"
          />

          {errors.assigneeId && (
            <p className="mt-1 text-sm text-red-600">{errors.assigneeId}</p>
          )}
        </div>

        {errors.form && (
          <div
            role="alert"
            className="rounded-md border border-red-300 p-3 text-sm text-red-600"
          >
            {errors.form}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md border px-4 py-2 font-medium disabled:opacity-50"
        >
          {isSubmitting ? "Creating..." : "Create Task"}
        </button>
      </form>
    </section>
  );
}

function getFieldFromValidationMessage(
  message: string,
): keyof FieldErrors | null {
  const lower = message.toLowerCase();

  if (lower.includes("title")) return "title";
  if (lower.includes("description")) return "description";
  if (lower.includes("status")) return "status";
  if (lower.includes("priority")) return "priority";
  if (lower.includes("projectid")) return "projectId";
  if (lower.includes("assigneeid")) return "assigneeId";
  if (lower.includes("tagids")) return "tagIds";

  return null;
}
