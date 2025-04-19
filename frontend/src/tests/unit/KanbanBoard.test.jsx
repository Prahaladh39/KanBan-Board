//import { render, screen } from "@testing-library/react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
//import KanbanBoard from "../../src/components/KanbanBoard.jsx";
import KanbanBoard from "../../components/KanbanBoard.jsx";
import socket from "../../utils/socket";
//import socket from "../utils/socket.js";
//import { socket } from "../../utils/socket";

//import socket from "../../utils/socket";
vi.mock("../../utils/socket", () => {
  return {
    default: {
      emit: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
    },
  };
});

test("renders Kanban board title", () => {
  render(<KanbanBoard />);
  expect(screen.getByText("Kanban Board")).toBeInTheDocument();
});

describe("Kanban Board", () => {
  beforeEach(() => {
    socket.emit.mockClear();
    socket.on.mockClear();
    socket.off.mockClear();
  });

  test("renders input and create task button", () => {
    render(<KanbanBoard />);
    expect(screen.getByPlaceholderText("New task title")).toBeInTheDocument();
    expect(screen.getByText("Add Task")).toBeInTheDocument();
  });

  test("adds task when filled and Add Task clicked", async () => {
    render(<KanbanBoard />);
    const input = screen.getByPlaceholderText("New task title");
    const button = screen.getByText("Add Task");

    fireEvent.change(input, { target: { value: "Test Task" } });
    fireEvent.click(button);

    await waitFor(() => {
      const emittedTask = socket.emit.mock.calls.find(
        (call) => call[0] === "task:create"
      )?.[1];
      expect(emittedTask).toEqual(
        expect.objectContaining({
          title: "Test Task",
          status: "todo",
          category: "Feature",
          priority: "Medium", // your default selected value
          attachments: expect.any(Array),
          id: expect.any(String),
          description: "",
        })
      );
    });
  });

  test("edits task title and emits update", async () => {
    const mockTask = {
      id: "1",
      title: "Initial Task",
      description: "",
      status: "todo",
      priority: "High",
      category: "Bug",
      attachments: [],
    };

    socket.on.mockImplementation((event, callback) => {
      if (event === "tasks:update") {
        callback([mockTask]);
      }
    });

    render(<KanbanBoard />);

    await waitFor(() => {
      const input = screen.getByDisplayValue("Initial Task");
      fireEvent.change(input, { target: { value: "Edited Task" } });
      expect(input.value).toBe("Edited Task");
    });
  });

  test("deletes a task and emits delete event", async () => {
    const task = {
      id: "2",
      title: "Delete Me",
      description: "",
      status: "todo",
      priority: "Medium",
      category: "Feature",
      attachments: [],
    };

    socket.on.mockImplementation((event, callback) => {
      if (event === "tasks:update") {
        callback([task]);
      }
    });

    render(<KanbanBoard />);
    await waitFor(() => screen.getByDisplayValue("Delete Me"));

    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(socket.emit).toHaveBeenCalledWith("task:delete", task.id);
    });
  });
});
