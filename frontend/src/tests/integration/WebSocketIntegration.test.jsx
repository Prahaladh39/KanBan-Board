import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import KanbanBoard from "../../components/KanbanBoard.jsx";

// MOCK FIRST — this gets hoisted to the top internally by Vitest!
/*
const mockSocket = {
  emit: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
};

// vitest hoists vi.mock(), so define mockSocket above this!
vi.mock("../../utils/socket.js", () => ({
  default: mockSocket,
}));

describe("WebSocket Integration - KanbanBoard", () => {
  beforeEach(() => {
    mockSocket.emit.mockClear();
    mockSocket.on.mockClear();
    mockSocket.off.mockClear();
  });

  test("renders Kanban board", () => {
    render(<KanbanBoard />);
    expect(screen.getByText("Kanban Board")).toBeInTheDocument();
  });

  test("syncs tasks between two clients via WebSocket", async () => {
    const listeners = {};
    mockSocket.on.mockImplementation((event, cb) => {
      listeners[event] = cb;
    });

    render(
      <>
        <KanbanBoard />
        <KanbanBoard />
      </>
    );

    const titleInput = screen.getAllByPlaceholderText("New task title")[0];
    const prioritySelect = screen.getAllByDisplayValue("Low Priority")[0];
    const categorySelect = screen.getAllByDisplayValue("Feature")[0];
    const addButton = screen.getAllByText("Add Task")[0];

    fireEvent.change(titleInput, {
      target: { value: "Integration Test Task" },
    });
    fireEvent.change(prioritySelect, { target: { value: "High" } });
    fireEvent.change(categorySelect, { target: { value: "Bug" } });
    fireEvent.click(addButton);

    const newTask = {
      id: "task-999",
      title: "Integration Test Task",
      priority: "High",
      category: "Bug",
      status: "todo",
      description: "",
      attachments: [],
    };

    // simulate WebSocket event from server
    listeners["task:create"](newTask);

    await waitFor(() => {
      const taskCards = screen.getAllByText("Integration Test Task");
      expect(taskCards.length).toBeGreaterThanOrEqual(2);
    });
  });
});
*/
describe("Drag and Drop - KanbanBoard", () => {
  test("moves task from To Do to In Progress", async () => {
    render(<KanbanBoard />);

    // Step 1: Add a task
    const input = screen.getByPlaceholderText("New task title");
    fireEvent.change(input, { target: { value: "Drag Me Task" } });

    const addButton = screen.getByText("Add Task");
    fireEvent.click(addButton);

    // Debugging log
    console.log("✅ Task added, waiting to find it in DOM...");

    // Step 2: Find the task card
    const todoTask = await screen.findByText("Drag Me Task");
    expect(todoTask).toBeInTheDocument();

    // Step 3: Simulate drag and drop
    const dataTransfer = {
      getData: vi.fn(),
      setData: vi.fn(),
      dropEffect: "",
      effectAllowed: "",
    };
    fireEvent.dragStart(todoTask, { dataTransfer });
    fireEvent.dragOver(screen.getByText("In Progress"));
    fireEvent.drop(screen.getByText("In Progress"), { dataTransfer });
    fireEvent.dragEnd(todoTask);

    // Step 4: Wait and verify it's in the new column
    await waitFor(() => {
      const inProgressColumn = screen.getByText("In Progress").parentElement;
      expect(inProgressColumn).toHaveTextContent("Drag Me Task");
    });
  });
});
