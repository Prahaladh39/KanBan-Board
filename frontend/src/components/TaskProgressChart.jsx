import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const TaskProgressChart = ({ tasks }) => {
  const counts = {
    todo: 0,
    "in-progress": 0,
    done: 0,
  };

  tasks.forEach((task) => {
    counts[task.status]++;
  });

  const total = counts.todo + counts["in-progress"] + counts.done;
  const completion = total > 0 ? ((counts.done / total) * 100).toFixed(1) : 0;

  const data = [
    { name: "To Do", value: counts.todo },
    { name: "In Progress", value: counts["in-progress"] },
    { name: "Done", value: counts.done },
  ];

  return (
    <div style={{ width: "100%", height: 300 }}>
      <h3 style={{ textAlign: "center" }}>Task Progress</h3>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
      <p style={{ textAlign: "center", marginTop: 10 }}>
        Completion: <strong>{completion}%</strong>
      </p>
    </div>
  );
};

export default TaskProgressChart;
