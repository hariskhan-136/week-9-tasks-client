import { render, screen } from "@testing-library/react";
import TasksPage from "@/app/tasks/page";
import { mockFetchOnce } from "./helpers/mockFetch";

describe("TasksPage", () => {
  it("renders one row per task from a successful API response", async () => {
    mockFetchOnce(200, [
      {
        id: 1,
        title: "First Task",
        description: "First task description",
        status: "todo",
        priority: 1,
        projectId: 1,
      },
      {
        id: 2,
        title: "Second Task",
        description: "Second task description",
        status: "done",
        priority: 2,
        projectId: 1,
      },
    ]);

    render(<TasksPage />);

    expect(await screen.findByText("First Task")).toBeInTheDocument();
    expect(await screen.findByText("Second Task")).toBeInTheDocument();

    expect(screen.getAllByRole("article")).toHaveLength(2);
  });

  it("renders the empty state when the API returns an empty array", async () => {
    mockFetchOnce(200, []);

    render(<TasksPage />);

    expect(await screen.findByText("No tasks found.")).toBeInTheDocument();
    expect(screen.queryByText("Loading tasks...")).not.toBeInTheDocument();
  });
});
