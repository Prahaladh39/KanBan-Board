import React from "react";
import KanbanBoard from "./components/KanbanBoard";
import "./App.css";
// adjust path if needed
function App() {
  return (
    <div className="App">
      <h1>Real-time Kanban Board</h1>
      <KanbanBoard />
    </div>
  );
}
export default App;
