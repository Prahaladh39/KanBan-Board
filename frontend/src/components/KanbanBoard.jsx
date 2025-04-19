import React from "react";
import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import socket from "../utils/socket";

const KanbanBoard = () => {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskFile, setNewTaskFile] = useState(null);
  const [newTaskPriority, setNewTaskPriority] = useState("Medium");
  const [newTaskCategory, setNewTaskCategory] = useState("Feature");

  const getTaskCounts = (tasks) => {
    const counts = {
      todo: 0,
      "in-progress": 0,
      done: 0,
    };

    tasks.forEach((task) => {
      if (counts[task.status] !== undefined) {
        counts[task.status]++;
      }
    });

    return counts;
  };

  const counts = getTaskCounts(tasks);
  const totalTasks = counts.todo + counts["in-progress"] + counts.done;
  const completion =
    totalTasks > 0 ? ((counts.done / totalTasks) * 100).toFixed(1) : 0;

  const chartData = [
    { name: "To Do", value: counts.todo },
    { name: "In Progress", value: counts["in-progress"] },
    { name: "Done", value: counts.done },
  ];

  useEffect(() => {
    socket.emit("sync:tasks");
    socket.on("tasks:update", (updatedTasks) => {
      setTasks(updatedTasks);
    });

    socket.on("task:update", (updatedTask) => {
      setTasks((prev) =>
        prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
      );
    });

    socket.on("task:delete", (id) => {
      setTasks((prev) => prev.filter((task) => task.id !== id));
    });

    return () => {
      socket.off("tasks:update");
      socket.off("task:update");
      socket.off("task:delete");
    };
  }, []);

  useEffect(() => {
    console.log("Updated tasks state:", tasks);
  }, [tasks]);

  const handleCreateTask = () => {
    if (!newTaskTitle.trim()) {
      toast.error("Task title cannot be empty!", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    const reader = new FileReader();
    const id = Date.now().toString();

    const createTaskWithAttachment = (fileData = null) => {
      const newTask = {
        id,
        title: newTaskTitle,
        description: "",
        status: "todo",
        priority: newTaskPriority,
        category: newTaskCategory,
        attachments: fileData
          ? [{ name: newTaskFile.name, data: fileData }]
          : [],
      };
      socket.emit("task:create", newTask);
      console.log("Creating task:", newTask);
      setNewTaskTitle("");
      setNewTaskPriority("Low");
      setNewTaskCategory("Feature");
      setNewTaskFile(null);

      toast.success("Task created successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    };

    if (newTaskFile) {
      reader.onload = (e) => createTaskWithAttachment(e.target.result);
      reader.readAsDataURL(newTaskFile);
    } else {
      createTaskWithAttachment();
    }
  };

  const handleEditTask = (id, field, value) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, [field]: value } : task
      )
    );
  };

  const handleUpdateTask = (updatedTask) => {
    socket.emit("task:update", updatedTask);
    toast.success("Task updated successfully!", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const handleDeleteTask = (id) => {
    socket.emit("task:delete", id);
    toast.info("Task deleted successfully!", {
      position: "top-right",
      autoClose: 3000,
      icon: "🗑️",
    });
  };

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination || destination.droppableId === source.droppableId) return;

    const updatedTasks = tasks.map((task) =>
      task.id === draggableId
        ? { ...task, status: destination.droppableId }
        : task
    );

    setTasks(updatedTasks);
    socket.emit("task:move", {
      id: draggableId,
      newColumn: destination.droppableId,
    });

    // Show toast when task is moved

    console.log("Drag result:", result);
  };

  // Get color based on priority
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "#ff6b6b";
      case "Medium":
        return "#feca57";
      case "Low":
        return "#1dd1a1";
      default:
        return "#dfe6e9";
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Feature":
        return "✨";
      case "Bug":
        return "🐞";
      case "Improvement":
        return "🔄";
      default:
        return "📋";
    }
  };

  const renderColumn = (status, title) => {
    console.log("Rendering column for:", status);

    return (
      <div className="kanban-column">
        <h2>{title}</h2>
        <Droppable droppableId={status} isDropDisabled={false}>
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="droppable-area"
            >
              {tasks
                .filter((task) => task.status === status)
                .map((task, index) => (
                  <Draggable
                    key={task.id}
                    draggableId={task.id.toString()}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        className="task-card"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          ...provided.draggableProps.style,
                          borderLeft: `5px solid ${getPriorityColor(
                            task.priority
                          )}`,
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "10px",
                          }}
                        >
                          <input
                            type="text"
                            value={task.title}
                            onChange={(e) =>
                              handleEditTask(task.id, "title", e.target.value)
                            }
                            className="task-edit-input"
                            placeholder="edit title"
                            style={{
                              flex: 1,
                              padding: "8px",
                              fontSize: "16px",
                              fontWeight: "500",
                              border: "1px solid #e0e0e0",
                              borderRadius: "4px",
                            }}
                          />
                        </div>

                        {task.attachments && task.attachments.length > 0 && (
                          <div
                            className="file-input"
                            data-testid="task-card"
                            style={{
                              marginBottom: "10px",
                              backgroundColor: "#f0f0f0",
                              padding: "6px 10px",
                              borderRadius: "4px",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            📎{" "}
                            <a
                              href={task.attachments[0].data}
                              download={task.attachments[0].name}
                              target="_blank"
                              data-testid="attachment-link"
                              rel="noopener noreferrer"
                              style={{
                                marginLeft: "5px",
                                color: "#3498db",
                                textDecoration: "none",
                              }}
                            >
                              {task.attachments[0].name}
                            </a>
                          </div>
                        )}

                        <div className="task-meta" style={{ margin: "10px 0" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              marginBottom: "8px",
                              backgroundColor: "#f9f9f9",
                              padding: "6px 10px",
                              borderRadius: "4px",
                            }}
                          >
                            <span
                              style={{
                                display: "inline-block",
                                width: "20px",
                                marginRight: "8px",
                                color: getPriorityColor(task.priority),
                                fontWeight: "bold",
                              }}
                            >
                              ⚡
                            </span>
                            <strong style={{ marginRight: "8px" }}>
                              Priority:
                            </strong>
                            <select
                              value={task.priority}
                              onChange={(e) =>
                                handleEditTask(
                                  task.id,
                                  "priority",
                                  e.target.value
                                )
                              }
                              style={{
                                padding: "4px 8px",
                                borderRadius: "4px",
                                border: "1px solid #ddd",
                                backgroundColor: "#fff",
                                color: getPriorityColor(task.priority),
                                fontWeight: "500",
                                marginLeft: "auto",
                              }}
                            >
                              <option value="Low">Low</option>
                              <option value="Medium">Medium</option>
                              <option value="High">High</option>
                            </select>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              backgroundColor: "#f9f9f9",
                              padding: "6px 10px",
                              borderRadius: "4px",
                            }}
                          >
                            <span
                              style={{
                                display: "inline-block",
                                width: "20px",
                                marginRight: "8px",
                              }}
                            >
                              {getCategoryIcon(task.category)}
                            </span>
                            <strong style={{ marginRight: "8px" }}>
                              Category:
                            </strong>
                            <select
                              value={task.category}
                              onChange={(e) =>
                                handleEditTask(
                                  task.id,
                                  "category",
                                  e.target.value
                                )
                              }
                              style={{
                                padding: "4px 8px",
                                borderRadius: "4px",
                                border: "1px solid #ddd",
                                backgroundColor: "#fff",
                                marginLeft: "auto",
                              }}
                            >
                              <option value="Feature">Feature</option>
                              <option value="Bug">Bug</option>
                              <option value="Improvement">Improvement</option>
                            </select>
                          </div>
                        </div>

                        <div
                          className="task-buttons"
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginTop: "10px",
                          }}
                        >
                          <button
                            onClick={() => handleUpdateTask(task)}
                            className="btn-update"
                            style={{
                              backgroundColor: "#4CAF50",
                              color: "white",
                              border: "none",
                              padding: "6px 12px",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontWeight: "500",
                            }}
                          >
                            Update
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="btn-delete"
                            style={{
                              backgroundColor: "#f44336",
                              color: "white",
                              border: "none",
                              padding: "6px 12px",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontWeight: "500",
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    );
  };

  return (
    <>
      <ToastContainer />
      <div className="kanban-container">
        <h1>Kanban Board</h1>

        <div className="kanban-inputs">
          <input
            type="text"
            placeholder="New task title"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="task-input"
          />
          <select
            name="priority"
            value={newTaskPriority}
            onChange={(e) => setNewTaskPriority(e.target.value)}
            className="task-select"
          >
            <option value="Low">Low Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="High">High Priority</option>
          </select>

          <select
            name="category"
            value={newTaskCategory}
            onChange={(e) => setNewTaskCategory(e.target.value)}
            className="task-select"
          >
            <option value="Feature">Feature</option>
            <option value="Bug">Bug</option>
            <option value="Improvement">Improvement</option>
          </select>
          <input
            type="file"
            onChange={(e) => setNewTaskFile(e.target.files[0])}
            className="file-input"
          />

          <button onClick={handleCreateTask} className="task-button">
            Add Task
          </button>
        </div>
        <center>
          <p>
            Drag and place the card on the title (eg: In Progress) the card will
            be placed properly
          </p>
        </center>
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="kanban-board">
            {renderColumn("todo", "To Do")}
            {renderColumn("in-progress", "In Progress")}
            {renderColumn("done", "Done")}
          </div>
        </DragDropContext>
      </div>
      <div
        style={{
          width: "100%",
          maxWidth: "600px",
          margin: "auto",
          paddingTop: "20px",
        }}
      >
        <h3 style={{ textAlign: "center" }}>Task Progress</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
        <p style={{ textAlign: "center", marginTop: "10px", fontSize: "16px" }}>
          Completion: <strong>{completion}%</strong>
        </p>
      </div>
    </>
  );
};

export default KanbanBoard;
