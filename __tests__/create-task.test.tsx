import { fireEvent, render, screen } from "@testing-library/react";
import TasksPage from "@/app/tasks/page";
import { mockFetchOnce } from "./helpers/mockFetch";

describe("CreateTaskForm", () => {
  it("adds the new task to the list after a successful 201 response", async () => {
    // First request: GET /tasks
    mockFetchOnce(200, []);

    render(<TasksPage />);

    expect(await screen.findByText("No tasks found.")).toBeInTheDocument();

    // Second request: POST /tasks
    mockFetchOnce(201, {
      id: 10,
      title: "New Task",
      description: "Created in test",
      status: "todo",
      priority: 1,
      projectId: 1,
    });

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "New Task" },
    });

    fireEvent.change(screen.getByLabelText("Project ID"), {
      target: { value: "1" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Create Task" }));

    expect(await screen.findByText("New Task")).toBeInTheDocument();
    expect(screen.getByText("Created in test")).toBeInTheDocument();
  });

  it("renders the API validation message beside the offending field and keeps the typed values", async () => {
    // First request: GET /tasks
    mockFetchOnce(200, []);

    render(<TasksPage />);

    expect(await screen.findByText("No tasks found.")).toBeInTheDocument();

    // Second request: POST /tasks → 400
    mockFetchOnce(400, {
      statusCode: 400,
      message: ["title must be at least 3 characters"],
      error: "BadRequest",
      timestamp: "2026-08-24T00:00:00.000Z",
      path: "/tasks",
    });

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Hi" },
    });

    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "Keep this description" },
    });

    fireEvent.change(screen.getByLabelText("Project ID"), {
      target: { value: "1" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Create Task" }));

    expect(
      await screen.findByText("title must be at least 3 characters"),
    ).toBeInTheDocument();

    expect(screen.getByLabelText("Title")).toHaveValue("Hi");
    expect(screen.getByLabelText("Description")).toHaveValue(
      "Keep this description",
    );
    expect(screen.getByLabelText("Project ID")).toHaveValue(1);
  });
});
